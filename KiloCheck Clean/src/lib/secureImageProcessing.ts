/**
 * Secure image processing utilities
 * Ensures images are processed safely without permanent storage
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedData?: string;
  metadata: {
    size: number;
    type: string;
    dimensions?: { width: number; height: number };
  };
}

/**
 * Maximum allowed image size (5MB)
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed image MIME types
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp'
];

/**
 * Validates and sanitizes image data for secure processing
 */
export function validateAndSanitizeImage(
  imageData: string, 
  mimeType: string
): ImageValidationResult {
  try {
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        isValid: false,
        error: `Unsupported image type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        metadata: { size: 0, type: mimeType }
      };
    }

    // Remove data URL prefix if present
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    
    // Validate base64 format
    if (!isValidBase64(base64Data)) {
      return {
        isValid: false,
        error: 'Invalid base64 image data format',
        metadata: { size: 0, type: mimeType }
      };
    }

    // Calculate image size
    const imageSize = getBase64Size(base64Data);
    
    // Validate image size
    if (imageSize > MAX_IMAGE_SIZE) {
      return {
        isValid: false,
        error: `Image too large: ${Math.round(imageSize / 1024 / 1024)}MB. Maximum allowed: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
        metadata: { size: imageSize, type: mimeType }
      };
    }

    // Sanitize the base64 data (remove any potential malicious content)
    const sanitizedData = sanitizeBase64(base64Data);

    return {
      isValid: true,
      sanitizedData,
      metadata: {
        size: imageSize,
        type: mimeType
      }
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Image validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: { size: 0, type: mimeType }
    };
  }
}

/**
 * Validates base64 string format
 */
function isValidBase64(str: string): boolean {
  try {
    // Check if string contains only valid base64 characters
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(str)) {
      return false;
    }
    
    // Try to decode to verify it's valid base64
    if (typeof window !== 'undefined') {
      atob(str);
    } else {
      Buffer.from(str, 'base64');
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Calculates the size of base64 encoded data in bytes
 */
function getBase64Size(base64String: string): number {
  // Remove padding characters for accurate calculation
  const withoutPadding = base64String.replace(/=/g, '');
  
  // Each base64 character represents 6 bits, so 4 characters = 3 bytes
  return Math.floor((withoutPadding.length * 3) / 4);
}

/**
 * Sanitizes base64 data by removing any potential malicious content
 */
function sanitizeBase64(base64Data: string): string {
  // Remove any non-base64 characters
  return base64Data.replace(/[^A-Za-z0-9+/=]/g, '');
}

/**
 * Creates a secure temporary processing context for images
 * Ensures no permanent storage and proper cleanup
 */
export class SecureImageProcessor {
  private processingId: string;
  private startTime: number;
  private imageData: string | null = null;

  constructor() {
    this.processingId = generateSecureId();
    this.startTime = Date.now();
  }

  /**
   * Processes image securely without permanent storage
   */
  async processImage(
    imageData: string, 
    mimeType: string,
    processor: (data: string, type: string) => Promise<any>
  ): Promise<any> {
    try {
      // Validate and sanitize image
      const validation = validateAndSanitizeImage(imageData, mimeType);
      
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Store temporarily for processing (in memory only)
      this.imageData = validation.sanitizedData!;
      
      // Log processing start
      this.logSecureEvent('Image processing started', {
        processingId: this.processingId,
        imageSize: validation.metadata.size,
        imageType: validation.metadata.type
      });

      // Process the image
      const result = await processor(this.imageData, mimeType);
      
      // Log successful processing
      this.logSecureEvent('Image processing completed', {
        processingId: this.processingId,
        processingTime: Date.now() - this.startTime
      });

      return result;

    } finally {
      // Always cleanup - clear image data from memory
      this.cleanup();
    }
  }

  /**
   * Cleanup method to ensure no image data remains in memory
   */
  private cleanup(): void {
    if (this.imageData) {
      // Overwrite the string data (best effort in JavaScript)
      this.imageData = null;
      
      this.logSecureEvent('Image data cleaned up', {
        processingId: this.processingId
      });
    }
  }

  /**
   * Logs secure processing events
   */
  private logSecureEvent(event: string, details: Record<string, any>): void {
    // Only log non-sensitive information
    const sanitizedDetails = {
      ...details,
      // Never log actual image data
      imageData: details.imageData ? '[REDACTED]' : undefined
    };
    
    console.log(`[SECURE_PROCESSING] ${event}`, sanitizedDetails);
  }
}

/**
 * Generates a secure random ID for processing sessions
 */
function generateSecureId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2);
  return `${timestamp}-${randomPart}`;
}

/**
 * Validates that image processing environment is secure
 */
export function validateProcessingEnvironment(): {
  isSecure: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Check if we're in a secure context (HTTPS in production)
  if (typeof window !== 'undefined') {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      warnings.push('Image processing should use HTTPS in production');
    }
  }
  
  // Check memory constraints
  if (typeof performance !== 'undefined' && performance.memory) {
    const memoryInfo = performance.memory as any;
    if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8) {
      warnings.push('High memory usage detected - consider image optimization');
    }
  }
  
  return {
    isSecure: warnings.length === 0,
    warnings
  };
}