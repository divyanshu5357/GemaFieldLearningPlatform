# Production Setup Guide

This guide helps you prepare the LearnHub Learning Platform for production deployment.

## Environment Variables Configuration

All sensitive configuration is stored in environment variables. Never commit `.env` files to version control.

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env.production
   ```

2. **Update the environment variables:**

   ```bash
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Gemini AI Configuration
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Getting API Keys

#### Supabase Keys
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy `Project URL` and `Anon key`

#### Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it to `VITE_GEMINI_API_KEY`

## Security Best Practices

✅ **DO:**
- Use environment variables for all sensitive data
- Store `.env` files locally only (add to `.gitignore`)
- Rotate API keys periodically
- Use different keys for development and production
- Monitor API usage and rate limits

❌ **DON'T:**
- Commit `.env` files to git
- Hardcode API keys in source files
- Share API keys in chat or emails
- Use the same keys across environments
- Log sensitive information

## Project Structure

```
src/
├── lib/
│   ├── ai-api.ts          # Gemini AI integration
│   ├── supabase.ts        # Supabase client
│   └── ...
├── app/
│   ├── pages/             # Route pages
│   ├── components/        # React components
│   └── ...
```

## Building for Production

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output: dist/ folder ready for deployment
```

## Deployment Platforms

### Vercel (Recommended for Vite)
```bash
# 1. Push to GitHub
# 2. Connect repository to Vercel
# 3. Add environment variables in Vercel dashboard
# 4. Deploy automatically on push
```

### Netlify
```bash
# Build command: npm run build
# Publish directory: dist
# Add environment variables in Netlify dashboard
```

### Docker (Self-hosted)
```bash
# Build Docker image
docker build -t learnhub:latest .

# Run container
docker run -e VITE_SUPABASE_URL=... -e VITE_GEMINI_API_KEY=... learnhub:latest
```

## Environment-Specific Configuration

### Development
```bash
# Use .env for local development
npm run dev
```

### Production
```bash
# Use production environment variables
npm run build
npm run preview
```

## Monitoring & Logging

- Monitor API rate limits and costs
- Set up error tracking (e.g., Sentry)
- Log user activities securely
- Regularly review security logs

## API Rate Limits

### Gemini API
- Free tier: 60 requests/minute
- Paid tier: Higher limits based on plan
- Monitor usage in Google Cloud Console

### Supabase
- Free tier: Generous limits
- Production: Upgrade plan as needed
- Monitor in Supabase dashboard

## Performance Optimization

- Use Vite's built-in code splitting
- Enable gzip compression
- Cache static assets
- Optimize images
- Use CDN for static files

## Support & Documentation

- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev/)

## Troubleshooting

### "Gemini API key not configured"
- Check `.env` file exists
- Verify `VITE_GEMINI_API_KEY` is set
- Rebuild after changing environment variables

### Supabase Connection Issues
- Verify URL and keys are correct
- Check network connectivity
- Ensure Supabase project is active

### Build Errors
- Clear `node_modules`: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist && npm run build`
- Check Node.js version: `node --version` (v16+ required)

---

**Last Updated:** April 19, 2026
**Status:** Production Ready ✅
