# 🍼 Baby Sweep - Proxmox LXC Installation Guide

Complete step-by-step guide for deploying Baby Sweep in a Proxmox LXC container with Cloudflare Tunnel for secure HTTPS access.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step 1: Create LXC Container](#step-1-create-lxc-container)
- [Step 2: Initial Container Setup](#step-2-initial-container-setup)
- [Step 3: Install Node.js 20 LTS](#step-3-install-nodejs-20-lts)
- [Step 4: Install Baby Sweep](#step-4-install-baby-sweep)
- [Step 5: Configure Baby Sweep](#step-5-configure-baby-sweep)
- [Step 6: Build Frontend](#step-6-build-frontend)
- [Step 7: Setup Systemd Service](#step-7-setup-systemd-service)
- [Step 8: Install Cloudflare Tunnel](#step-8-install-cloudflare-tunnel)
- [Step 9: Configure Cloudflare Tunnel](#step-9-configure-cloudflare-tunnel)
- [Step 10: Final Configuration](#step-10-final-configuration)
- [Troubleshooting](#troubleshooting)
- [Database Backup](#database-backup)
- [Maintenance](#maintenance)

## Overview

This guide walks you through deploying Baby Sweep in a Proxmox LXC container with:
- **Node.js 20 LTS** - Current long-term support version
- **Systemd service** - Automatic startup and restart
- **Cloudflare Tunnel** - Secure HTTPS without port forwarding
- **SQLite database** - Self-contained data storage

## Prerequisites

- Proxmox VE 7.0 or newer
- Cloudflare account with a domain
- Basic Linux command line knowledge
- At least 16GB disk space (20GB recommended)

## Step 1: Create LXC Container

### 1.1 Download Debian 12 Template

In Proxmox web UI:
1. Select your storage (e.g., `local`)
2. Go to **CT Templates**
3. Click **Templates**
4. Download: `debian-12-standard`

### 1.2 Create Container

Click **Create CT** and configure:

**General:**
- **CT ID:** 100 (or your preferred ID)
- **Hostname:** baby-sweep
- **Password:** Set a strong root password
- ✅ **Unprivileged container:** Checked (recommended)

**Template:**
- **Storage:** local
- **Template:** debian-12-standard

**Disks:**
- **Disk size:** 20 GB (minimum 16 GB)
  - ⚠️ **Important:** The npm build process requires significant disk space
  - If you encounter `ENOSPC: no space left on device` errors, you need more space

**CPU:**
- **Cores:** 2 (minimum 1, but 2 recommended for build process)

**Memory:**
- **Memory:** 1024 MB
- **Swap:** 512 MB

**Network:**
- **Bridge:** vmbr0
- **IPv4:** DHCP (or static IP)
- **IPv6:** DHCP (or leave empty)

**DNS:**
- Use host settings (recommended)

Click **Finish** to create the container.

### 1.3 Start Container

```bash
# From Proxmox host
pct start 100
```

## Step 2: Initial Container Setup

### 2.1 Access Container

```bash
# From Proxmox host
pct enter 100
```

### 2.2 Update System

```bash
apt update
apt upgrade -y
apt install -y curl wget git build-essential
```

### 2.3 Check Disk Space

```bash
df -h
# Verify you have at least 16GB available
```

## Step 3: Install Node.js 20 LTS

> ⚠️ **Important:** Baby Sweep requires Node.js 20+ (LTS version). Node.js 18 has reached end-of-life and will show deprecation warnings.

### 3.1 Install Node.js 20 from NodeSource

```bash
# Download and install NodeSource setup script
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js 20
apt install -y nodejs

# Verify installation
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x or higher
```

### 3.2 Alternative: Install via nvm (Optional)

If you prefer using nvm:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version
```

## Step 4: Install Baby Sweep

### 4.1 Create Installation Directory

```bash
mkdir -p /opt/baby-sweep
cd /opt/baby-sweep
```

### 4.2 Clone Repository

```bash
# Replace with your repository URL
git clone https://github.com/yourusername/baby-sweep.git .

# Verify files
ls -la
# You should see: backend/, frontend/, docker-compose.yml, etc.
```

## Step 5: Configure Baby Sweep

### 5.1 Configure Backend

```bash
cd /opt/baby-sweep/backend

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

Update the following values:

```bash
PORT=3001
APP_PASSWORD=your-secure-password-here    # CHANGE THIS!
DUE_DATE=2025-12-31                       # Your baby's due date
TIME_BLOCK_MINUTES=30
MAX_BLOCK_SELECTION_MINUTES=60
INCLUDE_SURPRISE_GENDER=true
ALLOW_DUPLICATES=false
PRIMARY_COLOR=#4A90E2
WELCOME_TEXT=Welcome to our Baby Sweep!
```

Save and exit (Ctrl+X, then Y, then Enter).

### 5.2 Install Backend Dependencies

```bash
npm install

# This should complete without errors
# If you see ENOSPC errors, you need more disk space
```

## Step 6: Build Frontend

### 6.1 Configure Frontend

```bash
cd /opt/baby-sweep/frontend

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Important:** Set `REACT_APP_API_URL` to your Cloudflare Tunnel domain (without port):

```bash
# DO NOT use localhost or include port number if using Cloudflare Tunnel
REACT_APP_API_URL=https://babysweep.yourdomain.com

REACT_APP_DUE_DATE=2025-12-31
REACT_APP_TIME_BLOCK_MINUTES=30
REACT_APP_MAX_BLOCK_SELECTION_MINUTES=60
REACT_APP_INCLUDE_SURPRISE_GENDER=true
REACT_APP_PRIMARY_COLOR=#4A90E2
```

Save and exit.

> ⚠️ **Critical:** When using Cloudflare Tunnel or any reverse proxy with HTTPS:
> - ✅ Correct: `REACT_APP_API_URL=https://babysweep.yourdomain.com`
> - ❌ Incorrect: `REACT_APP_API_URL=https://babysweep.yourdomain.com:3001`
> - Including a port causes "Mixed Content" errors

### 6.2 Install Frontend Dependencies and Build

```bash
npm install

# This step requires significant disk space (8-12GB)
# Monitor with: df -h

npm run build

# Build output will be in: /opt/baby-sweep/frontend/build
```

If you encounter `ENOSPC: no space left on device`:
1. Stop the container: `pct stop 100`
2. Increase disk size in Proxmox UI
3. Restart container and retry

## Step 7: Setup Systemd Service

### 7.1 Copy Service File

```bash
cp /opt/baby-sweep/baby-sweep.service /etc/systemd/system/
```

### 7.2 Verify Service File

The service file has been pre-configured for LXC compatibility (User/Group directives removed):

```bash
cat /etc/systemd/system/baby-sweep.service
```

### 7.3 Enable and Start Service

```bash
# Reload systemd
systemctl daemon-reload

# Enable service to start on boot
systemctl enable baby-sweep

# Start the service
systemctl start baby-sweep

# Check status
systemctl status baby-sweep
```

You should see:
```
● baby-sweep.service - Baby Sweep - Digital Baby Pool Application
     Loaded: loaded (/etc/systemd/system/baby-sweep.service; enabled)
     Active: active (running) since...
```

### 7.4 Test Local Access

```bash
# Test from within container
curl http://localhost:3001/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Step 8: Install Cloudflare Tunnel

### 8.1 Download and Install cloudflared

```bash
# Download latest cloudflared for Linux
cd /tmp
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb

# Install
dpkg -i cloudflared.deb

# Verify installation
cloudflared --version
```

### 8.2 Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This will:
1. Print a URL to visit
2. Copy the URL and open in your browser
3. Log in to Cloudflare
4. Select your domain
5. Authorize the tunnel

A cert file will be created at: `/root/.cloudflared/cert.pem`

### 8.3 Create Tunnel

```bash
cloudflared tunnel create baby-sweep

# Note the Tunnel ID shown in the output
# Example: Created tunnel baby-sweep with id: abc123def456...
```

## Step 9: Configure Cloudflare Tunnel

### 9.1 Create Configuration File

```bash
mkdir -p /root/.cloudflared
nano /root/.cloudflared/config.yml
```

Add the following (replace `<tunnel-id>` with your actual tunnel ID):

```yaml
tunnel: <tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: babysweep.yourdomain.com
    service: http://localhost:3001
  - service: http_status:404
```

Save and exit.

### 9.2 Route DNS to Tunnel

```bash
cloudflared tunnel route dns baby-sweep babysweep.yourdomain.com
```

This creates a CNAME record in your Cloudflare DNS pointing to the tunnel.

### 9.3 Test Tunnel

```bash
# Test the tunnel (runs in foreground)
cloudflared tunnel run baby-sweep

# Press Ctrl+C to stop
```

Visit `https://babysweep.yourdomain.com` in your browser. You should see the Baby Sweep login page.

### 9.4 Create Cloudflare Tunnel Service

Create a systemd service for automatic tunnel startup:

```bash
nano /etc/systemd/system/cloudflared.service
```

Add:

```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/cloudflared tunnel run baby-sweep
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Save and exit.

### 9.5 Enable and Start Cloudflare Tunnel Service

```bash
systemctl daemon-reload
systemctl enable cloudflared
systemctl start cloudflared
systemctl status cloudflared
```

## Step 10: Final Configuration

### 10.1 Verify Services

```bash
# Check both services are running
systemctl status baby-sweep
systemctl status cloudflared

# Check logs
journalctl -u baby-sweep -f
journalctl -u cloudflared -f
```

### 10.2 Test External Access

Visit `https://babysweep.yourdomain.com` from an external device.

1. You should see the login page
2. Log in with the password from `.env`
3. Submit a test guess
4. Verify it appears on the calendar

### 10.3 Configure Firewall (Optional)

LXC containers typically use the Proxmox host's firewall. No additional configuration needed for Cloudflare Tunnel since it uses outbound connections only.

## Troubleshooting

### Service Won't Start

**Error: status=217/USER or status=216/GROUP**

Solution: This is why we removed User/Group directives from the service file. If you manually added them back, remove them:

```bash
nano /etc/systemd/system/baby-sweep.service
# Comment out or remove User= and Group= lines
systemctl daemon-reload
systemctl restart baby-sweep
```

**Error: Cannot find module**

Solution: Reinstall dependencies:

```bash
cd /opt/baby-sweep/backend
rm -rf node_modules package-lock.json
npm install
systemctl restart baby-sweep
```

### Build Failures

**Error: ENOSPC: no space left on device**

Solution: Increase container disk size:

```bash
# From Proxmox host
pct stop 100
pct resize 100 rootfs +10G
pct start 100

# Inside container
df -h  # Verify new size
```

**Error: npm ERR! code ELIFECYCLE**

Solution:
1. Check Node.js version: `node --version` (should be 20.x)
2. Clear npm cache: `npm cache clean --force`
3. Retry build: `npm run build`

### Cloudflare Tunnel Issues

**Error: Tunnel not found**

Solution: Verify tunnel exists:

```bash
cloudflared tunnel list
# Should show your baby-sweep tunnel
```

**Error: Failed to connect to Cloudflare**

Solution: Check internet connectivity:

```bash
ping 1.1.1.1
# If fails, check container network settings
```

**Error: Mixed Content errors in browser**

Solution: Verify `REACT_APP_API_URL` does not include port number:

```bash
cd /opt/baby-sweep/frontend
cat .env | grep REACT_APP_API_URL
# Should be: REACT_APP_API_URL=https://babysweep.yourdomain.com
# Should NOT include :3001 or any port
```

If incorrect:
```bash
nano .env
# Fix REACT_APP_API_URL
npm run build  # Rebuild frontend
systemctl restart baby-sweep
```

### Database Issues

**Error: Database locked**

Solution:

```bash
systemctl stop baby-sweep
cd /opt/baby-sweep/backend/data
rm -f babysweep.db-shm babysweep.db-wal
systemctl start baby-sweep
```

**Check database location:**

```bash
ls -lh /opt/baby-sweep/backend/data/
# Should show: babysweep.db
```

## Database Backup

### Manual Backup

```bash
# Create backup directory
mkdir -p /opt/baby-sweep/backups

# Create timestamped backup
cp /opt/baby-sweep/backend/data/babysweep.db \
   /opt/baby-sweep/backups/babysweep-$(date +%Y%m%d-%H%M%S).db

# Verify backup
ls -lh /opt/baby-sweep/backups/
```

### Automated Daily Backups

Create a backup script:

```bash
nano /opt/baby-sweep/backup.sh
```

Add:

```bash
#!/bin/bash
# Baby Sweep Database Backup Script

BACKUP_DIR="/opt/baby-sweep/backups"
DB_FILE="/opt/baby-sweep/backend/data/babysweep.db"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/babysweep-$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
cp "$DB_FILE" "$BACKUP_FILE"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "babysweep-*.db" -mtime +30 -delete

echo "Backup created: $BACKUP_FILE"
```

Make executable:

```bash
chmod +x /opt/baby-sweep/backup.sh
```

Add to crontab for daily backups at 2 AM:

```bash
crontab -e
```

Add line:

```
0 2 * * * /opt/baby-sweep/backup.sh >> /var/log/baby-sweep-backup.log 2>&1
```

### Restore from Backup

```bash
# Stop service
systemctl stop baby-sweep

# Restore database
cp /opt/baby-sweep/backups/babysweep-YYYYMMDD-HHMMSS.db \
   /opt/baby-sweep/backend/data/babysweep.db

# Restart service
systemctl start baby-sweep
```

## Maintenance

### View Logs

```bash
# Baby Sweep application logs
journalctl -u baby-sweep -f

# Cloudflare Tunnel logs
journalctl -u cloudflared -f

# Last 100 lines
journalctl -u baby-sweep -n 100
```

### Update Baby Sweep

```bash
# Stop services
systemctl stop baby-sweep

# Backup database first!
/opt/baby-sweep/backup.sh

# Pull latest code
cd /opt/baby-sweep
git pull

# Update backend
cd backend
npm install

# Update and rebuild frontend
cd ../frontend
npm install
npm run build

# Restart services
systemctl start baby-sweep
systemctl status baby-sweep
```

### Update Node.js

```bash
# Check current version
node --version

# Update via NodeSource (if used)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt upgrade -y nodejs

# Verify
node --version
npm --version

# Reinstall dependencies
cd /opt/baby-sweep/backend
npm install

cd /opt/baby-sweep/frontend
npm install
npm run build

# Restart
systemctl restart baby-sweep
```

### Monitor Resource Usage

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check service memory usage
systemctl status baby-sweep
```

### Clean Up Old Data

```bash
# Remove old backups (older than 90 days)
find /opt/baby-sweep/backups -name "babysweep-*.db" -mtime +90 -delete

# Clean npm cache
npm cache clean --force

# Clean old logs (optional)
journalctl --vacuum-time=30d
```

## Performance Optimization

### Increase Container Resources

If experiencing slow performance:

```bash
# From Proxmox host
pct set 100 -memory 2048  # Increase to 2GB RAM
pct set 100 -cores 2      # Increase to 2 CPU cores

# Restart container
pct stop 100
pct start 100
```

### Enable Log Rotation

```bash
nano /etc/systemd/journald.conf
```

Set:

```ini
[Journal]
SystemMaxUse=200M
SystemMaxFileSize=50M
```

Restart journald:

```bash
systemctl restart systemd-journald
```

## Security Hardening

### Change Default Password

```bash
nano /opt/baby-sweep/backend/.env
# Update APP_PASSWORD
systemctl restart baby-sweep
```

### Enable Automatic Security Updates

```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### Limit Access via Cloudflare

In Cloudflare dashboard:
1. Go to **Zero Trust** → **Access**
2. Create Access Policy for your tunnel
3. Limit by IP, email, or other criteria

## Additional Resources

- [Main README](README.md) - General documentation
- [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - Production deployment checklist
- [ENV_CONFIGURATION.md](ENV_CONFIGURATION.md) - Environment variable reference
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Proxmox LXC Documentation](https://pve.proxmox.com/wiki/Linux_Container)

## Support

If you encounter issues not covered in this guide:

1. Check logs: `journalctl -u baby-sweep -n 100`
2. Verify configuration: `cat /opt/baby-sweep/backend/.env`
3. Test local connectivity: `curl http://localhost:3001/api/health`
4. Check disk space: `df -h`
5. Consult [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

Made with ❤️ for growing families

**Remember:** Always backup your database before making changes!
