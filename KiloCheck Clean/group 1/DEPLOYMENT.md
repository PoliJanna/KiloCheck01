# KiloCheck - Deployment Guide

## Vercel Deployment Configuration

This guide covers deploying KiloCheck to Vercel with proper security and environment variable configuration.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Gemini API Key**: Obtain from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Git Repository**: Code should be in a Git repository (GitHub, GitLab, or Bitbucket)

### Step 1: Environment Variables Configuration

#### Required Environment Variables

Set these in your Vercel project dashboard under **Settings > Environment Variables**:

| Variable Name | Value | Environment | Description |
|---------------|-------|-------------|-------------|
| `GEMINI_API_KEY` | `your_actual_api_key` | Production, Preview | Google Gemini API key for image analysis |
| `NEXT_PUBLIC_APP_NAME` | `KiloCheck` | All | Application name (exposed to client) |
| `NEXT_PUBLIC_APP_VERSION` | `0.1.0` | All | Application version (exposed to client) |
| `NODE_ENV` | `production` | Production | Node environment |

#### Setting Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with the following settings:
   - **Name**: Variable name (e.g., `GEMINI_API_KEY`)
   - **Value**: Your actual value
   - **Environments**: Select appropriate environments (Production, Preview, Development)

#### Security Best Practices

- ✅ **DO**: Use Vercel's encrypted environment variables
- ✅ **DO**: Set different API keys for production and preview environments
- ✅ **DO**: Regularly rotate API keys
- ❌ **DON'T**: Commit API keys to version control
- ❌ **DON'T**: Use development keys in production
- ❌ **DON'T**: Share API keys in team communications

### Step 2: Deployment Configuration

#### Automatic Deployment

The project is configured for automatic deployment:

- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build` (includes security validation)
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Node Version**: 18.x (recommended)

#### Manual Deployment Steps

1. **Connect Repository**:
   ```bash
   # If using Vercel CLI
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **Or via Vercel Dashboard**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Configure environment variables
   - Deploy

### Step 3: Domain Configuration (Optional)

#### Custom Domain Setup

1. **Add Domain in Vercel**:
   - Go to **Settings** → **Domains**
   - Add your custom domain
   - Follow DNS configuration instructions

2. **SSL Certificate**:
   - Vercel automatically provisions SSL certificates
   - HTTPS is enforced by default

#### Domain Examples

- **Default**: `your-project.vercel.app`
- **Custom**: `kilocheck.yourdomain.com`
- **Subdomain**: `app.yourdomain.com`

### Step 4: Production Optimizations

#### Build Optimizations

The project includes several production optimizations:

- **Bundle Splitting**: Automatic code splitting for better caching
- **Image Optimization**: WebP/AVIF format support
- **Security Headers**: CSP, HSTS, and other security headers
- **Compression**: Gzip/Brotli compression enabled
- **Tree Shaking**: Unused code elimination

#### Performance Monitoring

Monitor your deployment:

- **Vercel Analytics**: Built-in performance monitoring
- **Function Logs**: Check API endpoint performance
- **Build Logs**: Monitor build times and issues

### Step 5: Security Validation

#### Pre-deployment Checks

The build process includes automatic security validation:

```bash
# Run locally before deployment
npm run validate:security
npm run build
```

#### Security Features

- **API Key Protection**: Keys never exposed to client-side code
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- **Input Validation**: Image format and size validation
- **Rate Limiting**: Built-in Vercel function limits
- **HTTPS Only**: All traffic encrypted

### Step 6: Monitoring and Maintenance

#### Health Checks

Monitor these metrics:

- **API Response Times**: Should be < 5 seconds
- **Error Rates**: Monitor 4xx/5xx responses
- **Function Duration**: Check for timeouts
- **Build Success Rate**: Monitor deployment failures

#### Maintenance Tasks

- **Weekly**: Review error logs and performance metrics
- **Monthly**: Rotate API keys and update dependencies
- **Quarterly**: Review and update security configurations

### Troubleshooting

#### Common Issues

1. **Build Failures**:
   ```bash
   # Check security validation
   npm run validate:security
   
   # Check TypeScript errors
   npm run lint
   ```

2. **API Errors**:
   - Verify `GEMINI_API_KEY` is set correctly
   - Check API key permissions and quotas
   - Review function logs in Vercel dashboard

3. **Environment Variables**:
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify environment selection (Production/Preview)

#### Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Google AI Studio**: [ai.google.dev](https://ai.google.dev)

### Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured in Vercel
- [ ] API keys tested and working
- [ ] Security validation passes locally
- [ ] Build completes successfully
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active
- [ ] Performance monitoring enabled
- [ ] Error tracking configured

---

## Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View function logs
vercel logs
```

For additional support, refer to the [Vercel documentation](https://vercel.com/docs) or contact the development team.