# Namecheap VPS Deployment Checklist

Last updated: 2026-02-16

## Pre-Deployment

- [ ] All environment variables configured in `.env.local` and `.env.production`
- [ ] Database initialized with `database/init.sql`
- [ ] SSL certificate obtained (Let's Encrypt recommended)
- [ ] Domain name DNS updated to point to VPS IP
- [ ] Both backend and frontend tested locally
- [ ] Git repository cleaned (no sensitive credentials committed)

## Backend Deployment Steps

### 1. SSH into VPS
```bash
ssh user@your-vps-ip
```

### 2. Install Node.js and npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm --version
```

### 3. Install PostgreSQL (if not already installed)
```bash
sudo apt-get install -y postgresql postgresql-contrib
# Note: Namecheap may provide PostgreSQL on port 5433
```

### 4. Clone/Upload Repository
```bash
cd /var/www
git clone https://your-repo-url cv-builder
cd cv-builder/backend
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Create Production Environment File
```bash
nano .env.production
```

Configure with your Namecheap VPS settings:
- DB_PORT: 5433 (check with Namecheap)
- DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
- JWT_SECRET: Generate new strong secret
- Email credentials
- Domain URLs (https://your-domain.com)

### 7. Install PM2 for Process Management
```bash
sudo npm install -g pm2
pm2 start src/index.js --name cv-builder-api --env production
pm2 save
pm2 startup
```

### 8. Verify Backend is Running
```bash
pm2 status
pm2 logs cv-builder-api

# Test API endpoint
curl http://localhost:5000/api/health
```

## Frontend Deployment Steps

### 1. Install Dependencies
```bash
cd /var/www/cv-builder/frontend
npm install
```

### 2. Create Production Environment File
```bash
nano .env.production
```

Configure:
```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_NODE_ENV=production
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### 3. Build Frontend
```bash
npm run build
```

### 4. Start Frontend with PM2
```bash
pm2 start npm --name cv-builder-web -- start
pm2 save
```

### 5. Verify Frontend is Running
```bash
pm2 logs cv-builder-web

# Should be running on port 3000
curl http://localhost:3000
```

## Nginx Reverse Proxy Setup

### 1. Install Nginx
```bash
sudo apt-get install -y nginx
```

### 2. Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/your-domain.com
```

### 3. Configure Proxy
```nginx
upstream backend {
    server 127.0.0.1:5000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your-certificate.crt;
    ssl_certificate_key /path/to/your-key.key;

    # API proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## SSL Certificate Setup (Let's Encrypt)

### 1. Install Certbot
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### 2. Generate Certificate
```bash
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

### 3. Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Database Setup

### 1. Create Database
```bash
psql -h localhost -p 5433 -U postgres
CREATE DATABASE cv_builder;
CREATE USER cv_builder_user WITH PASSWORD 'strong_password';
ALTER ROLE cv_builder_user SET client_encoding TO 'utf8';
GRANT ALL PRIVILEGES ON DATABASE cv_builder TO cv_builder_user;
\q
```

### 2. Initialize Schema
```bash
psql -h localhost -p 5433 -U cv_builder_user -d cv_builder < /var/www/cv-builder/database/init.sql
```

### 3. Verify Tables
```bash
psql -h localhost -p 5433 -U cv_builder_user -d cv_builder
\dt  # List tables
\q
```

## Post-Deployment Testing

### 1. Test API
```bash
curl https://your-domain.com/api/health
```

### 2. Test Frontend
```bash
curl https://your-domain.com
```

### 3. Test User Registration
- Navigate to https://your-domain.com
- Try registering a new account
- Check if activation email is received

### 4. Monitor Logs
```bash
pm2 logs cv-builder-api
pm2 logs cv-builder-web
```

## Maintenance Commands

### View Process Status
```bash
pm2 status
pm2 show cv-builder-api
pm2 show cv-builder-web
```

### View Logs
```bash
pm2 logs cv-builder-api --lines 100
pm2 logs cv-builder-web --lines 100
```

### Restart Services
```bash
pm2 restart cv-builder-api
pm2 restart cv-builder-web
pm2 restart all
```

### Stop Services
```bash
pm2 stop cv-builder-api
pm2 stop cv-builder-web
pm2 stop all
```

### Update Code
```bash
cd /var/www/cv-builder
git pull origin main
npm install
npm run build
pm2 restart all
```

## Troubleshooting

### Backend not connecting to database
```bash
# Test connection
psql -h localhost -p 5433 -U cv_builder_user -d cv_builder

# Check .env.production values match
cat /var/www/cv-builder/backend/.env.production | grep DB_
```

### Frontend showing API connection errors
```bash
# Verify backend is running
curl http://localhost:5000/api/health

# Check frontend environment
cat /var/www/cv-builder/frontend/.env.production | grep API_URL

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### 502 Bad Gateway from Nginx
```bash
# Check if upstream services are running
pm2 status

# Verify nginx config
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Port already in use
```bash
# Find process using port
lsof -i :5000
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable firewall and allow only necessary ports (80, 443, 22)
- [ ] Set file permissions: `chmod 600 /var/www/cv-builder/backend/.env.production`
- [ ] Disable password SSH login, use key-based authentication
- [ ] Enable automatic security updates
- [ ] Set up monitoring/alerting
- [ ] Regular database backups
- [ ] Review and rotate API keys monthly

## Support & Documentation

- [Namecheap VPS Documentation](https://www.namecheap.com/vps/)
- [Node.js Deployment](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL on Linux](https://www.postgresql.org/docs/current/installation-platform-linux.html)
- [Nginx Configuration](https://nginx.org/en/docs/)
