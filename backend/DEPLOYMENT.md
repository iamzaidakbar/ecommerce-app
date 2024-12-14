# Deployment Guide

## 1. Prepare for Production

### 1.1 Build the Project
```bash
# Install dependencies
npm install

# Build TypeScript files
npm run build
```

### 1.2 Update Environment Variables
```env
NODE_ENV=production
PORT=4000
API_VERSION=v1
MONGODB_URI=your_production_mongodb_uri
CORS_ORIGIN=https://your-frontend-domain.com
```

## 2. Deployment Options

### Option 1: Deploy to Railway

1. Create Railway account: [railway.app](https://railway.app)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Option 2: Deploy to Render

1. Create [Render](https://render.com) account
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables

### Option 3: Deploy to DigitalOcean

1. Create Droplet
```bash
# SSH into your droplet
ssh root@your_server_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clone repository
git clone https://github.com/iamzaidakbar/ecommerce-backend.git
cd ecommerce-backend

# Install dependencies and build
npm install
npm run build

# Start with PM2
pm2 start dist/server.js --name ecommerce-api
```

2. Setup Nginx
```bash
# Install Nginx
sudo apt install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/ecommerce-api
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ecommerce-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

### Option 4: Deploy with Docker

1. Create Dockerfile:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
```

2. Create docker-compose.yml:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=your_mongodb_uri
      # Add other env variables
    restart: always
```

3. Deploy:
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

## 3. Production Checklist

### 3.1 Security
- [ ] Enable CORS with specific origins
- [ ] Set secure HTTP headers
- [ ] Enable rate limiting
- [ ] Setup proper error logging
- [ ] Configure SSL/TLS
- [ ] Secure environment variables

### 3.2 Performance
- [ ] Enable compression
- [ ] Setup caching headers
- [ ] Configure PM2 clustering
- [ ] Setup database indexes
- [ ] Enable request logging

### 3.3 Monitoring
```bash
# Install monitoring tools
npm install -g pm2

# Start with monitoring
pm2 start dist/server.js --name ecommerce-api -i max

# Monitor logs
pm2 logs

# Monitor metrics
pm2 monit
```

### 3.4 Backup
```bash
# Setup MongoDB backup
mongodump --uri="your_mongodb_uri" --out=/backup/$(date +%Y%m%d)

# Setup automated backups with cron
0 0 * * * mongodump --uri="your_mongodb_uri" --out=/backup/$(date +%Y%m%d)
```

## 4. CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Production
        run: |
          # Add your deployment commands here
```

## 5. Troubleshooting

### Common Issues:
1. Connection timeouts
   ```bash
   # Check logs
   pm2 logs ecommerce-api
   ```

2. Memory issues
   ```bash
   # Monitor memory
   pm2 monit
   ```

3. Database connection issues
   ```bash
   # Check MongoDB connection
   mongo your_mongodb_uri --eval "db.adminCommand('ping')"
   ```

### Useful Commands:
```bash
# View running processes
pm2 list

# Restart application
pm2 restart ecommerce-api

# View detailed metrics
pm2 show ecommerce-api

# Monitor CPU/Memory
htop
``` 