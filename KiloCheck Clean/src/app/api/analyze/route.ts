import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ExtractedData, ExtractionResult, ErrorCode } from '@/types'
import { createAppError, getErrorInfo } from '@/lib/errorHandling'
import { 
  validateEnvironmentSecurity, 
  sanitizeErrorMessage, 
  createSecureHeaders,
  logSecurityEvent 
} from '@/lib/security'
import { 
  SecureImageProcessor, 
  validateProcessingEnvironment 
} from '@/lib/secureImageProcessing'

// Initialize security configuration
let securityConfig: ReturnType<typeof validateEnvironmentSecurity> | null = null;
let genAI: GoogleGenerativeAI | null = null;

// Initialize Gemini AI with secure configuration
function initializeGeminiAI() {
  if (!securityConfig) {
    securityConfig = validateEnvironmentSecurity();
    genAI = new GoogleGenerativeAI(securityConfig.geminiApiKey);
    logSecurityEvent('Gemini AI initialized', { 
      production: securityConfig.isProduction,
      keyValidated: securityConfig.apiKeyValidated 
    });
  }
  return genAI!;
}

interface AnalyzeRequest {
  image: string // Base64 encoded image
  imageType: string // MIME type
}

interface AnalyzeResponse {
  success: boolean
  data?: ExtractedData
  error?: {
    code: string
    message: string
    suggestions?: string[]
  }
  processingTime: number
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  const startTime = Date.now()
  
  try {
    // Initialize secure Gemini AI configuration
    const geminiAI = initializeGeminiAI();
    
    // Validate processing environment security
    const envValidation = validateProcessingEnvironment();
    if (!envValidation.isSecure) {
      logSecurityEvent('Processing environment warnings', {
        warnings: envValidation.warnings
      });
    }
    
    // Log security event for API access
    logSecurityEvent('API analyze request received', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent')?.substring(0, 50),
      secure: envValidation.isSecure
    });

    // Parse request body
    const body: AnalyzeRequest = await request.json()
    
    if (!body.image || !body.imageType) {
      const error = createAppError(ErrorCode.INVALID_IMAGE_FORMAT, 'Missing image data or type')
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          suggestions: error.suggestions
        },
        processingTime: Date.now() - startTime
      }, { status: 400 })
    }

    // Process image securely using SecureImageProcessor
    const processor = new SecureImageProcessor();
    
    const extractedData = await processor.processImage(
      body.image,
      body.imageType,
      async (sanitizedImageData: string, mimeType: string) => {
        // Validate image type within secure context
        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!supportedTypes.includes(mimeType)) {
          throw createAppError(ErrorCode.INVALID_IMAGE_FORMAT, 'Unsupported image format')
        }

        // Get Gemini model
        const model = geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        // Create the prompt for structured data extraction
        const prompt = `
Analyze this product label image and extract the following information in JSON format:

{
  "price": {
    "value": number (price amount),
    "currency": string (currency code like "EUR", "USD"),
    "confidence": number (0-1, confidence in extraction)
  },
  "weight": {
    "value": number (weight/volume amount),
    "unit": string (one of: "g", "kg", "ml", "l"),
    "confidence": number (0-1, confidence in extraction)
  },
  "product": {
    "name": string (product name),
    "brand": string (brand name),
    "confidence": number (0-1, confidence in extraction)
  }
}

Rules:
- Extract the sale price (not price per unit if shown separately)
- Extract net weight or volume (not gross weight)
- Use exact values from the label
- Set confidence based on clarity of the text
- If any field cannot be determined, set confidence to 0 and use empty string for strings or 0 for numbers
- Return ONLY the JSON object, no additional text
`

        // Prepare image data for Gemini (using sanitized data)
        const imageData = {
          inlineData: {
            data: sanitizedImageData,
            mimeType: mimeType
          }
        }

        // Call Gemini API with secure authentication
        const result = await model.generateContent([prompt, imageData])
        const response = await result.response
        const text = response.text()

        // Parse the JSON response
        let parsedData: ExtractedData
        try {
          parsedData = JSON.parse(text.trim())
        } catch (parseError) {
          throw createAppError(ErrorCode.API_ERROR, 'Failed to parse AI response')
        }

        // Validate extracted data structure
        if (!parsedData.price || !parsedData.weight || !parsedData.product) {
          throw createAppError(ErrorCode.API_ERROR, 'Invalid response structure from AI')
        }

        return parsedData;
      }
    );

    // Check if essential data was extracted with sufficient confidence
    const minConfidence = 0.3
    const errors: string[] = []
    
    if (extractedData.price.confidence < minConfidence || extractedData.price.value <= 0) {
      errors.push('price information')
    }
    
    if (extractedData.weight.confidence < minConfidence || extractedData.weight.value <= 0) {
      errors.push('weight/volume information')
    }
    
    if (extractedData.product.confidence < minConfidence || !extractedData.product.name) {
      errors.push('product name')
    }

    if (errors.length > 0) {
      const errorCode = errors.includes('price information') ? ErrorCode.NO_PRICE_DETECTED :
                       errors.includes('weight/volume information') ? ErrorCode.NO_WEIGHT_DETECTED :
                       ErrorCode.NO_PRODUCT_DETECTED

      const error = createAppError(errorCode, `Could not clearly detect ${errors.join(', ')}`)
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          suggestions: error.suggestions
        },
        processingTime: Date.now() - startTime
      }, { status: 422 })
    }

    // Return successful result with secure headers
    const response = NextResponse.json({
      success: true,
      data: extractedData,
      processingTime: Date.now() - startTime
    });

    // Add security headers
    const secureHeaders = createSecureHeaders();
    Object.entries(secureHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    logSecurityEvent('API analyze completed successfully', {
      processingTime: Date.now() - startTime,
      dataExtracted: true
    });

    return response;

  } catch (error) {
    // Sanitize error message to prevent credential exposure
    const sanitizedMessage = error instanceof Error ? sanitizeErrorMessage(error) : 'Unknown error';
    
    logSecurityEvent('API analyze error', {
      error: sanitizedMessage,
      processingTime: Date.now() - startTime
    });
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        const appError = createAppError(ErrorCode.API_ERROR, 'API authentication failed')
        return NextResponse.json({
          success: false,
          error: {
            code: appError.code,
            message: appError.message,
            suggestions: appError.suggestions
          },
          processingTime: Date.now() - startTime
        }, { status: 401 })
      }
      
      if (error.message.includes('quota') || error.message.includes('rate')) {
        const appError = createAppError(ErrorCode.API_RATE_LIMIT, 'API rate limit exceeded')
        return NextResponse.json({
          success: false,
          error: {
            code: appError.code,
            message: appError.message,
            suggestions: appError.suggestions
          },
          processingTime: Date.now() - startTime
        }, { status: 429 })
      }
    }

    // Generic error response
    const appError = createAppError(ErrorCode.NETWORK_ERROR, 'Network or server error')
    return NextResponse.json({
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        suggestions: appError.suggestions
      },
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}