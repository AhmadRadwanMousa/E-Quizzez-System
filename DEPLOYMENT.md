# 🚀 Deployment Guide

This guide will help you deploy your E-Quizzez application to various hosting platforms.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ Git repository set up
- ✅ All changes committed and pushed
- ✅ Environment variables configured
- ✅ Database ready (or will be created on first run)

## 🌐 Deployment Options

### 1. **Heroku** (Recommended for beginners)

#### Setup
```bash
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Add buildpacks (important!)
heroku buildpacks:add --index 1 heroku/nodejs
heroku buildpacks:add --index 2 heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secure_jwt_secret_here
heroku config:set PORT=5000
```

#### Deploy
```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy
git push heroku main

# Open your app
heroku open
```

#### Important Notes for Heroku
- **Database**: Heroku doesn't support SQLite. Consider using PostgreSQL:
  ```bash
  heroku addons:create heroku-postgresql:mini
  ```
- **Build Process**: The `heroku-postbuild` script in package.json handles client build
- **Port**: Heroku sets PORT automatically, don't override it

---

### 2. **Vercel** (Great for frontend + API)

#### Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

#### Deploy
```bash
# Deploy from project root
vercel

# Follow the prompts:
# - Set project name
# - Choose scope
# - Set root directory: ./
# - Override settings: No
# - Deploy: Yes
```

#### Configuration
Create `vercel.json` in your project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

---

### 3. **Railway** (Simple and fast)

#### Setup
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login
```

#### Deploy
```bash
# Initialize Railway project
railway init

# Deploy
railway up

# Open your app
railway open
```

---

### 4. **DigitalOcean App Platform**

#### Setup
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. Configure build settings

#### Configuration
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Environment Variables**: Set in the DigitalOcean dashboard

---

### 5. **Self-Hosted (VPS)**

#### Prerequisites
- Ubuntu/CentOS server
- Node.js installed
- Nginx (optional, for reverse proxy)
- PM2 for process management

#### Setup
```bash
# Clone repository
git clone https://github.com/yourusername/e-quizzez.git
cd e-quizzez

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "e-quizzez"

# Save PM2 configuration
pm2 startup
pm2 save
```

#### Nginx Configuration (Optional)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔧 Environment Variables

Set these environment variables on your hosting platform:

```env
# Required
NODE_ENV=production
JWT_SECRET=your_very_secure_jwt_secret_here

# Optional
PORT=5000
DATABASE_URL=your_database_connection_string
```

## 📊 Database Considerations

### **SQLite (Default)**
- ✅ Good for development and small deployments
- ❌ Not suitable for production with multiple users
- ❌ Not supported on Heroku

### **PostgreSQL (Recommended for production)**
```bash
# Install PostgreSQL driver
npm install pg

# Update database connection in server.js
```

### **MySQL**
```bash
# Install MySQL driver
npm install mysql2

# Update database connection in server.js
```

## 🚨 Common Deployment Issues

### **1. Build Failures**
```bash
# Ensure all dependencies are installed
npm install
cd client && npm install && cd ..

# Clear npm cache
npm cache clean --force

# Rebuild
cd client && npm run build && cd ..
```

### **2. Port Issues**
- Heroku/Vercel set PORT automatically
- Don't hardcode PORT in your code
- Use: `process.env.PORT || 5000`

### **3. Database Connection**
- Ensure database is accessible from hosting platform
- Check firewall settings
- Verify connection strings

### **4. Environment Variables**
- Double-check all required variables are set
- Ensure JWT_SECRET is secure and unique
- Test locally with production environment

## 📈 Monitoring & Maintenance

### **PM2 (Self-hosted)**
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs e-quizzez

# Restart application
pm2 restart e-quizzez
```

### **Heroku**
```bash
# View logs
heroku logs --tail

# Monitor dyno usage
heroku ps
```

### **Vercel**
- Use Vercel dashboard for monitoring
- Check function logs in dashboard
- Monitor performance metrics

## 🔒 Security Checklist

Before going live, ensure:
- ✅ JWT_SECRET is strong and unique
- ✅ Environment variables are properly set
- ✅ Database credentials are secure
- ✅ HTTPS is enabled (automatic on most platforms)
- ✅ Rate limiting is configured
- ✅ Input validation is in place
- ✅ Admin credentials are changed from defaults

## 📞 Support

If you encounter deployment issues:
1. Check the platform's documentation
2. Review error logs
3. Verify environment configuration
4. Test locally with production settings
5. Create an issue on GitHub

---

**Happy Deploying! 🚀**
