# 🚀 VPS Deployment Guide - fleet.bluehawana.com

## Live Demo URL
**https://fleet.bluehawana.com**

Show this to HR/recruiters - a live, working fleet management system!

---

## 🎯 Deployment Strategy

### Architecture
```
Internet
    ↓
Nginx (Reverse Proxy + SSL)
    ↓
    ├─→ Next.js Frontend (Port 3000) → fleet.bluehawana.com
    ├─→ .NET API (Port 5000) → fleet.bluehawana.com/api
    ├─→ Grafana (Port 3001) → fleet.bluehawana.com/grafana
    └─→ SQL Server (Port 1433) → Internal only
```

---

## 📋 Prerequisites

### VPS Requirements
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 4GB minimum (8GB recommended)
- **CPU**: 2 cores minimum
- **Storage**: 40GB SSD
- **Domain**: fleet.bluehawana.com pointed to VPS IP

### Software to Install
- Docker & Docker Compose
- Nginx
- Certbot (Let's Encrypt SSL)
- .NET 8 SDK
- Node.js 20+

---

## 🔧 Step-by-Step Deployment

### 1. Initial VPS Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git vim ufw

# Configure firewall
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable

# Create deployment user
adduser bluehawana
usermod -aG sudo bluehawana
su - bluehawana
```

### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

### 3. Install .NET 8 SDK

```bash
# Add Microsoft package repository
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# Install .NET SDK
sudo apt update
sudo apt install -y dotnet-sdk-8.0

# Verify
dotnet --version
```

### 4. Install Node.js 20

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### 5. Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### 6. Clone Repository

```bash
cd ~
git clone https://github.com/bluehawana/FleetManagement-DotNet-React-SQLServer.git
cd FleetManagement-DotNet-React-SQLServer
```

---

## 🐳 Docker Compose Setup

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  # SQL Server
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: fleet-sqlserver
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd123
      - MSSQL_PID=Express
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
    restart: unless-stopped
    networks:
      - fleet-network

  # .NET API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fleet-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:5000
      - ConnectionStrings__DefaultConnection=Server=sqlserver,1433;Database=FleetManagementDB;User Id=sa;Password=YourStrong@Passw0rd123;TrustServerCertificate=True
    ports:
      - "5000:5000"
    depends_on:
      - sqlserver
    restart: unless-stopped
    networks:
      - fleet-network

  # Next.js Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: fleet-frontend
    environment:
      - NEXT_PUBLIC_API_URL=https://fleet.bluehawana.com/api
      - NEXT_PUBLIC_GRAFANA_URL=https://fleet.bluehawana.com/grafana
    ports:
      - "3000:3000"
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - fleet-network

  # Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: fleet-grafana
    environment:
      - GF_SERVER_ROOT_URL=https://fleet.bluehawana.com/grafana
      - GF_SERVER_SERVE_FROM_SUB_PATH=true
    ports:
      - "3001:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    restart: unless-stopped
    networks:
      - fleet-network

volumes:
  sqlserver-data:
  grafana-data:

networks:
  fleet-network:
    driver: bridge
```

### Create Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY FleetManagement.sln ./
COPY FleetManagement.Core/*.csproj ./FleetManagement.Core/
COPY FleetManagement.Infrastructure/*.csproj ./FleetManagement.Infrastructure/
COPY FleetManagement.API/*.csproj ./FleetManagement.API/

# Restore dependencies
RUN dotnet restore

# Copy everything else
COPY . .

# Build
WORKDIR /src/FleetManagement.API
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FleetManagement.API.dll"]
```

### Create Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

---

## 🌐 Nginx Configuration

### Create Nginx config

```bash
sudo nano /etc/nginx/sites-available/fleet.bluehawana.com
```

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name fleet.bluehawana.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name fleet.bluehawana.com;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/fleet.bluehawana.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fleet.bluehawana.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }

    # Grafana
    location /grafana/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Enable site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/fleet.bluehawana.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d fleet.bluehawana.com

# Follow prompts:
# - Enter email: bluehawana@gmail.com
# - Agree to terms: Yes
# - Redirect HTTP to HTTPS: Yes

# Auto-renewal (already set up by Certbot)
sudo systemctl status certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

---

## 🚀 Deploy Application

```bash
cd ~/FleetManagement-DotNet-React-SQLServer

# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Wait for SQL Server to be ready (30 seconds)
sleep 30

# Run database migrations
docker exec -it fleet-api dotnet ef database update

# Seed mock data
curl -X POST https://fleet.bluehawana.com/api/seed/mock-data
```

---

## 🔍 Verify Deployment

### Check Services

```bash
# Check all containers
docker ps

# Check API
curl https://fleet.bluehawana.com/api/bus/statistics

# Check frontend
curl https://fleet.bluehawana.com

# Check Grafana
curl https://fleet.bluehawana.com/grafana
```

### Test in Browser

1. **Frontend**: https://fleet.bluehawana.com
2. **API Swagger**: https://fleet.bluehawana.com/api
3. **Grafana**: https://fleet.bluehawana.com/grafana

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f sqlserver
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
docker-compose restart frontend
```

### Update Application

```bash
cd ~/FleetManagement-DotNet-React-SQLServer

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations if needed
docker exec -it fleet-api dotnet ef database update
```

### Backup Database

```bash
# Backup
docker exec fleet-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd123' \
  -Q "BACKUP DATABASE FleetManagementDB TO DISK = '/var/opt/mssql/backup/fleet.bak'"

# Copy backup to host
docker cp fleet-sqlserver:/var/opt/mssql/backup/fleet.bak ./backup/

# Restore (if needed)
docker exec fleet-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd123' \
  -Q "RESTORE DATABASE FleetManagementDB FROM DISK = '/var/opt/mssql/backup/fleet.bak'"
```

---

## 🎯 For HR Demo

### Demo Script

**1. Open**: https://fleet.bluehawana.com

**2. Show Morning Dashboard**:
- "This is what a fleet manager sees first thing in the morning"
- Point out urgent alerts
- Show cost savings opportunities

**3. Navigate to Business Insights**:
- "These 5 dashboards solve real problems"
- Click Fuel Waste: "This identifies buses wasting fuel"
- Show ROI: "$271,600/year savings"

**4. Show Real-Time Monitoring**:
- "Live fleet status updates every 30 seconds"
- "Based on real US DOT data patterns"

**5. Explain Technical Stack**:
- "Backend: .NET 8 with Domain-Driven Design"
- "Frontend: Next.js 14 with TypeScript"
- "Database: SQL Server with EF Core"
- "Deployed on VPS with Docker"

### Key Points to Mention

✅ "This isn't just a portfolio project - it's production-ready"
✅ "Based on 924 months of real US DOT data"
✅ "Solves actual business problems with quantified ROI"
✅ "Domain-Driven Design with Clean Architecture"
✅ "Deployed on my own VPS with SSL and monitoring"

---

## 🔧 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs api

# Check if port is in use
sudo netstat -tulpn | grep :5000

# Restart Docker
sudo systemctl restart docker
```

### SSL certificate issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate
sudo certbot certificates
```

### Database connection issues

```bash
# Check SQL Server logs
docker logs fleet-sqlserver

# Test connection
docker exec -it fleet-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd123'
```

### High memory usage

```bash
# Check resource usage
docker stats

# Restart services
docker-compose restart
```

---

## 📈 Performance Optimization

### Enable Nginx Caching

```nginx
# Add to nginx config
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    # ... rest of config
}
```

### Enable Gzip Compression

```nginx
# Add to nginx config
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

---

## 🎉 Success!

Your fleet management system is now live at:
**https://fleet.bluehawana.com**

Show this to HR and watch them be impressed! 🚀

---

**Author**: bluehawana  
**Email**: bluehawana@gmail.com  
**GitHub**: https://github.com/bluehawana

