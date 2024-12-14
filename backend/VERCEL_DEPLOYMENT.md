# Deploy Node.js Backend to Vercel

## 1. Prepare Your Project

1. Create `vercel.json` in your project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

2. Update your `package.json`:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "vercel-build": "npm run build"
  }
}
```

3. Update `server.ts` to handle Vercel's serverless environment:
```typescript
import app from './app';
import env from './config/env';

const PORT = process.env.PORT || 3000;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// For Vercel
export default app;
```

## 2. Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
# First time deployment
vercel

# Subsequent deployments
vercel --prod
```

## 3. Environment Variables

1. Add environment variables in Vercel dashboard:
   - Go to your project
   - Settings → Environment Variables
   - Add all variables from your `.env`:
```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 4. Connect Frontend

1. Update your frontend API configuration:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-url.vercel.app/api/v1';
```

2. Add CORS in your backend (`app.ts`):
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## 5. Troubleshooting

### Common Issues:

1. **Deployment Failed**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify environment variables are set

2. **CORS Issues**
   ```typescript
   // Update CORS configuration
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://your-frontend-domain.vercel.app'
     ],
     credentials: true
   }));
   ```

3. **Connection Timeouts**
   - Check MongoDB connection string
   - Ensure MongoDB IP whitelist includes Vercel's IPs

4. **Function Size Limit**
   - Vercel has a 50MB limit for functions
   - Optimize dependencies
   - Remove unnecessary files

### Useful Commands:
```bash
# View deployment logs
vercel logs

# Pull environment variables locally
vercel env pull

# List deployments
vercel ls

# Inspect deployment
vercel inspect
```

## 6. Production Optimizations

1. **Enable Caching**
```typescript
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

2. **Compression**
```typescript
import compression from 'compression';
app.use(compression());
```

3. **Security Headers**
```typescript
import helmet from 'helmet';
app.use(helmet());
```

## 7. Monitoring

1. Add Sentry for error tracking:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

## 8. CI/CD with GitHub

Create `.github/workflows/vercel-deploy.yml`:
```yaml
name: Vercel Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Deploy to Vercel
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
``` 