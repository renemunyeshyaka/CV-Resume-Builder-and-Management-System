# Environment Configuration Guide

Last updated: 2026-02-16

## Overview
This application uses environment variables to manage configuration across development, staging, and production environments. The configuration is split between backend (Node.js/Express) and frontend (Next.js).

## File Structure

```
backend/
├── .env.local          # Local development (not committed)
├── .env.production     # Production configuration (NOT committed - configure on server)
├── .env.example        # Template for new developers
└── .env               # Legacy file (kept for compatibility)

frontend/
├── .env.local         # Local development (not committed)
├── .env.production    # Production configuration (NOT committed - configure on server)
└── .env.example       # Template for new developers
```

## Setup Instructions

### 1. Local Development Setup

#### Backend
```bash
cd backend
cp .env.example .env.local
# Edit .env.local with your local database credentials
# Default: localhost:5432, database: kcoduyxv_cv_builder_bd
```

#### Frontend
```bash
cd frontend
cp .env.example .env.local
# Default values are already set for localhost:3000 development
```

#### Start Development Servers
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### 2. Production Setup (Namecheap VPS)

#### Backend Configuration

1. **SSH into your Namecheap VPS**
```bash
ssh user@your-vps-ip
```

2. **Create production environment file**
```bash
cd /path/to/cv-builder/backend
nano .env.production
```

3. **Configure for Namecheap**
```env
# Key differences from development:
NODE_ENV=production
PORT=5000
BACKEND_URL=https://your-domain.com/api
FRONTEND_URL=https://your-domain.com

# Database (Namecheap VPS)
DB_HOST=localhost
DB_PORT=5433          # Note: Namecheap uses 5433 for PostgreSQL
DB_NAME=your_prod_db
DB_USER=your_prod_user
DB_PASSWORD=secure_password

# SSL/HTTPS
TRUST_PROXY=true      # Important if behind nginx/Apache reverse proxy

# Email
SMTP_HOST=your.mail.server
EMAIL_USER=noreply@your-domain.com
EMAIL_PASS=your-email-password

# Security - Generate a strong random string
JWT_SECRET=generate_strong_random_secret_here

# Logging
LOG_LEVEL=info
```

4. **Start backend in production**
```bash
# Using PM2 for process management (recommended)
npm install -g pm2
pm2 start backend/src/index.js --name cv-builder-api
pm2 save
pm2 startup
```

#### Frontend Configuration

1. **Navigate to frontend directory**
```bash
cd /path/to/cv-builder/frontend
```

2. **Create production environment file**
```bash
nano .env.production
```

3. **Configure for Namecheap**
```env
NEXT_PUBLIC_NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_MTN_MOMO_ENVIRONMENT=production
```

4. **Build for production**
```bash
npm install
npm run build
npm start
# Or use PM2:
pm2 start npm --name cv-builder-web -- start
```

### 3. Database Setup on Namecheap VPS

```bash
# Connect to PostgreSQL with custom port
psql -h localhost -p 5433 -U your_db_user -d your_db_name

# Run the initialization script
\i /path/to/database/init.sql

# Verify tables were created
\dt
```

## Environment Variables Reference

### Backend Variables

| Variable | Dev Default | Purpose |
|----------|------------|---------|
| `NODE_ENV` | development | Application environment |
| `PORT` | 5000 | Backend server port |
| `BACKEND_URL` | http://localhost:5000 | Backend public URL |
| `FRONTEND_URL` | http://localhost:3000 | Frontend public URL |
| `DB_HOST` | localhost | Database hostname |
| `DB_PORT` | 5432 | Database port (5433 for Namecheap) |
| `DB_NAME` | kcoduyxv_cv_builder_bd | Database name |
| `DB_USER` | - | Database username |
| `DB_PASSWORD` | - | Database password |
| `JWT_SECRET` | - | Secret for JWT token signing |
| `JWT_EXPIRY` | 1d | Token expiration time |
| `SMTP_HOST` | smtp.gmail.com | Email server |
| `SMTP_PORT` | 587 | Email server port |
| `EMAIL_USER` | - | Email account |
| `EMAIL_PASS` | - | Email password/app-token |
| `LOG_LEVEL` | debug | Logging verbosity (debug/info/warn/error) |

### Frontend Variables

| Variable | Dev Default | Purpose |
|----------|------------|---------|
| `NEXT_PUBLIC_NODE_ENV` | development | Application environment |
| `NEXT_PUBLIC_API_URL` | http://localhost:5000 | Backend API URL |
| `NEXT_PUBLIC_FRONTEND_URL` | http://localhost:3000 | Frontend URL |
| `NEXT_PUBLIC_APP_NAME` | CV/Resume Builder | App display name |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | false | Enable analytics |
| `NEXT_PUBLIC_ENABLE_DEBUG` | true | Enable debug mode |

## Important Security Notes

1. **Never commit .env files** - They contain sensitive credentials
   ```bash
   # .gitignore should include:
   .env
   .env.local
   .env.production
   .env.*.local
   ```

2. **Rotate credentials** after exposing them in Git history
   - Change database passwords
   - Generate new JWT_SECRET
   - Update API keys

3. **Use strong passwords** for production
   - Database password: min 16 characters, mixed case + numbers + symbols
   - JWT_SECRET: use `openssl rand -base64 32`

4. **Protect .env.production** on your VPS
   ```bash
   chmod 600 /path/to/.env.production
   ```

## URL Configuration Guide

### Development
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:3000`
- **API calls from Frontend**: `http://localhost:5000/api/*`

### Production (Namecheap)
Example domain: `yourdomain.com`

#### Option 1: Same Domain (Recommended)
```
Backend:  https://yourdomain.com/api    (API proxy via nginx)
Frontend: https://yourdomain.com         (Next.js on port 3000, proxied)

NEXT_PUBLIC_API_URL=https://yourdomain.com/api
BACKEND_URL=https://yourdomain.com/api
```

#### Option 2: Separate Subdomains
```
Backend:  https://api.yourdomain.com     (Port 5000 or 443 with reverse proxy)
Frontend: https://yourdomain.com         (Port 3000 or 443 with reverse proxy)

NEXT_PUBLIC_API_URL=https://api.yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

#### Option 3: Different Ports (Development Only)
```
Backend:  http://yourdomain.com:5000
Frontend: http://yourdomain.com:3000

NEXT_PUBLIC_API_URL=http://yourdomain.com:5000
```

## Nginx Reverse Proxy Configuration Example

```nginx
# For same-domain setup
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SSL configuration...
}
```

## Troubleshooting

### "Cannot find module" / "Module not found"
- Run `npm install` in both backend and frontend directories

### API requests returning 404
- Check `NEXT_PUBLIC_API_URL` matches your backend URL
- Verify backend is running and listening on correct port
- Check CORS configuration in backend if requests blocked

### Database connection errors
- Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
- For Namecheap: Ensure using port 5433 (not 5432)
- Test connection: `psql -h localhost -p 5433 -U user -d dbname`

### Environment variables not being picked up
- Frontend: Variables must start with `NEXT_PUBLIC_`
- Restart dev server after changing .env files
- Clear Next.js cache: `rm -rf .next`

### Production variables not working
- Check file permissions: `chmod 644 .env.production`
- Verify process is reading from correct environment file
- Use `pm2 show cv-builder-api` to verify environment

## Next Steps

1. **Update configurations** for your Namecheap VPS
   - Domain name
   - Database credentials
   - JWT secret
   - Email credentials

2. **Test connectivity**
   ```bash
   # Test backend from frontend
   curl https://your-domain.com/api/health
   ```

3. **Enable HTTPS** with Let's Encrypt SSL certificate

4. **Monitor logs**
   ```bash
   pm2 logs cv-builder-api
   pm2 logs cv-builder-web
   ```
