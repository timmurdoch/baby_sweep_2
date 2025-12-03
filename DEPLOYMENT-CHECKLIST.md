# 🚀 Baby Sweep - Production Deployment Checklist

Complete guide for deploying Baby Sweep to production. Follow these steps to ensure a secure, reliable deployment.

## 📋 Pre-Deployment Checklist

### ✅ Configuration

- [ ] **Change default password**
  - Default `babysweep2025` is public knowledge
  - Use a strong, unique password
  - Store it securely (password manager)

- [ ] **Set accurate due date**
  - Format: `YYYY-MM-DD`
  - Prevents guesses after the date

- [ ] **Customize welcome message**
  - Personalize for your family
  - Keep it friendly and clear

- [ ] **Choose time block size**
  - 15 minutes: More granular
  - 30 minutes: Balanced (recommended)
  - 60 minutes: Simpler

- [ ] **Decide on duplicate guesses**
  - `ALLOW_DUPLICATES=false`: First come, first served
  - `ALLOW_DUPLICATES=true`: Multiple people can pick same time

- [ ] **Set gender options**
  - `INCLUDE_SURPRISE_GENDER=true`: Show "Surprise" option
  - `INCLUDE_SURPRISE_GENDER=false`: Only Boy/Girl

### ✅ Infrastructure

- [ ] **Server Requirements**
  - Minimum 512MB RAM (1GB recommended)
  - 1 CPU core (2 recommended)
  - 5GB storage
  - Ubuntu 20.04+ / Debian 11+ (or equivalent)

- [ ] **Domain Setup**
  - Register domain name (optional)
  - Configure DNS records
  - Point A record to server IP

- [ ] **SSL Certificate**
  - Obtain SSL certificate
  - Options: Cloudflare (free), Let's Encrypt, purchased cert

- [ ] **Firewall Configuration**
  - Allow port 80 (HTTP)
  - Allow port 443 (HTTPS)
  - Allow port 22 (SSH, admin only)
  - Block all other inbound ports

---

## 🐳 Docker Deployment (Recommended)

### Step 1: Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in for group changes
exit
```

### Step 2: Clone and Configure

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/yourusername/baby-sweep.git
sudo chown -R $USER:$USER baby-sweep
cd baby-sweep

# Create environment file
cat > .env << EOF
APP_PASSWORD=YOUR_SECURE_PASSWORD_HERE
DUE_DATE=2025-12-31
WELCOME_TEXT=Welcome to our Baby Sweep!
TIME_BLOCK_MINUTES=30
MAX_BLOCK_SELECTION_MINUTES=60
INCLUDE_SURPRISE_GENDER=true
ALLOW_DUPLICATES=false
PRIMARY_COLOR=#4A90E2
EOF

# Secure the .env file
chmod 600 .env
```

### Step 3: Build and Deploy

```bash
# Build the Docker image
docker-compose build

# Start the service
docker-compose up -d

# Verify it's running
docker-compose ps
docker-compose logs -f
```

### Step 4: Configure Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/baby-sweep

# Edit with your domain
sudo nano /etc/nginx/sites-available/baby-sweep
# Replace 'babysweep.example.com' with your domain

# Enable site
sudo ln -s /etc/nginx/sites-available/baby-sweep /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d babysweep.example.com

# Certbot automatically configures Nginx for HTTPS
# Test renewal
sudo certbot renew --dry-run
```

---

## 🔧 Manual Deployment (Without Docker)

### Step 1: Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x
npm --version
```

### Step 2: Setup Application

```bash
# Create app user
sudo useradd -r -s /bin/bash -d /opt/baby-sweep babysweep
sudo mkdir -p /opt/baby-sweep
sudo chown babysweep:babysweep /opt/baby-sweep

# Clone as app user
sudo -u babysweep git clone https://github.com/yourusername/baby-sweep.git /opt/baby-sweep
cd /opt/baby-sweep

# Setup backend
cd backend
sudo -u babysweep cp .env.example .env
sudo nano .env  # Configure settings
sudo -u babysweep npm install --production
cd ..

# Setup and build frontend
cd frontend
sudo -u babysweep cp .env.example .env
sudo nano .env  # Set REACT_APP_API_URL
sudo -u babysweep npm install
sudo -u babysweep npm run build
cd ..
```

### Step 3: Setup Systemd Service

```bash
# Copy service file
sudo cp baby-sweep.service /etc/systemd/system/

# Edit paths and user
sudo nano /etc/systemd/system/baby-sweep.service

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable baby-sweep
sudo systemctl start baby-sweep

# Check status
sudo systemctl status baby-sweep

# View logs
sudo journalctl -u baby-sweep -f
```

### Step 4: Setup Nginx (same as Docker deployment)

Follow Step 4 from Docker deployment above.

### Step 5: Setup SSL (same as Docker deployment)

Follow Step 5 from Docker deployment above.

---

## 🔐 Security Hardening

### Change Default Password

**Critical:** Do this before sharing the URL!

```bash
# Edit .env file
nano .env  # or /opt/baby-sweep/backend/.env

# Change APP_PASSWORD
APP_PASSWORD=my-super-secure-password-123!@#

# Restart application
docker-compose restart  # Docker
sudo systemctl restart baby-sweep  # Systemd
```

### Setup Firewall

```bash
# Ubuntu/Debian with ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# CentOS/RHEL with firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Regular Updates

```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Docker updates
cd /opt/baby-sweep
git pull
docker-compose build
docker-compose up -d

# Manual deployment updates
cd /opt/baby-sweep
git pull
cd frontend
npm run build
cd ..
sudo systemctl restart baby-sweep
```

---

## 💾 Backup Strategy

### Automatic Backups

Create a backup script:

```bash
sudo nano /opt/backup-baby-sweep.sh
```

```bash
#!/bin/bash
# Baby Sweep Backup Script

BACKUP_DIR="/opt/backups/baby-sweep"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /opt/baby-sweep/data/babysweep.db $BACKUP_DIR/babysweep_$DATE.db

# Backup .env file
cp /opt/baby-sweep/.env $BACKUP_DIR/env_$DATE.txt

# Keep only last 30 days
find $BACKUP_DIR -name "*.db" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Make it executable:

```bash
sudo chmod +x /opt/backup-baby-sweep.sh
```

Schedule daily backups:

```bash
sudo crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /opt/backup-baby-sweep.sh >> /var/log/baby-sweep-backup.log 2>&1
```

### Manual Backup

```bash
# Backup database
cp /opt/baby-sweep/data/babysweep.db ~/babysweep_backup_$(date +%Y%m%d).db

# Download backup (from your computer)
scp user@server:/opt/baby-sweep/data/babysweep.db ./backup/
```

---

## 📊 Monitoring

### Health Checks

```bash
# Check if service is running
curl -s http://localhost:3001/api/health | jq

# Expected response:
# {"status":"ok","timestamp":"2025-01-15T12:00:00.000Z"}
```

### Setup Monitoring (Optional)

```bash
# Simple uptime monitoring with cron
echo '*/5 * * * * curl -s http://localhost:3001/api/health || echo "Baby Sweep is down!" | mail -s "Alert" admin@example.com' | crontab -
```

### Log Monitoring

```bash
# Docker logs
docker-compose logs -f --tail=100

# Systemd logs
sudo journalctl -u baby-sweep -f

# Nginx logs
sudo tail -f /var/log/nginx/baby-sweep-access.log
sudo tail -f /var/log/nginx/baby-sweep-error.log
```

---

## 🧪 Testing Checklist

Before announcing to your guests:

- [ ] **Login Test**
  - Can you log in with your password?
  - Does the welcome message display correctly?

- [ ] **Guess Submission**
  - Can you submit a complete guess?
  - Does weight conversion work?
  - Do validation errors show properly?

- [ ] **Calendar View**
  - Does the calendar load and display guesses?
  - Are colors correct (blue/pink/purple)?
  - Can you click on events to see details?

- [ ] **All Guesses View**
  - Do all guesses display?
  - Are cards formatted correctly?
  - Does it work on mobile?

- [ ] **Mobile Testing**
  - Test on iPhone/Safari
  - Test on Android/Chrome
  - Test form submission on mobile
  - Check calendar responsiveness

- [ ] **Cross-Browser**
  - Test in Chrome
  - Test in Firefox
  - Test in Safari
  - Test in Edge

- [ ] **Load Testing**
  - Can handle 10 people simultaneously?
  - Database writes work under load?

- [ ] **Data Persistence**
  - Restart server, verify data remains
  - Check database file exists and grows

---

## 🚨 Rollback Plan

If something goes wrong:

### Docker Rollback

```bash
# Stop current version
docker-compose down

# Restore database from backup
cp /opt/backups/baby-sweep/babysweep_YYYYMMDD_HHMMSS.db /opt/baby-sweep/data/babysweep.db

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild and start
docker-compose build
docker-compose up -d
```

### Manual Rollback

```bash
# Stop service
sudo systemctl stop baby-sweep

# Restore database
sudo cp /opt/backups/baby-sweep/babysweep_YYYYMMDD_HHMMSS.db /opt/baby-sweep/data/babysweep.db

# Checkout previous version
cd /opt/baby-sweep
git checkout <previous-commit-hash>

# Rebuild frontend if needed
cd frontend
npm run build
cd ..

# Restart
sudo systemctl start baby-sweep
```

---

## ✅ Post-Deployment Verification

After deployment is complete:

1. **Access the site from external network**
   - Use a phone on cellular data
   - Verify HTTPS works (green padlock)

2. **Test full user flow**
   - Login
   - Submit a guess
   - View calendar
   - View all guesses

3. **Check logs for errors**
   ```bash
   docker-compose logs --tail=50
   # or
   sudo journalctl -u baby-sweep -n 50
   ```

4. **Verify backup is working**
   ```bash
   ls -lh /opt/backups/baby-sweep/
   ```

5. **Share with a test user**
   - Have someone else try the full flow
   - Collect feedback

---

## 📞 Support and Maintenance

### Regular Maintenance

- **Weekly:** Check logs for errors
- **Weekly:** Verify backups are running
- **Monthly:** Update system packages
- **Monthly:** Review and archive old logs

### Getting Help

- **Documentation:** Check TROUBLESHOOTING.md
- **GitHub Issues:** Report bugs or ask questions
- **Logs:** Always check logs first

---

## 🎉 Deployment Complete!

Congratulations! Your Baby Sweep is now live in production.

**Final Checklist:**
- ✅ Changed default password
- ✅ SSL/HTTPS enabled
- ✅ Firewall configured
- ✅ Backups scheduled
- ✅ Monitoring in place
- ✅ Tested on mobile
- ✅ Ready for guests!

**Share your URL:** `https://babysweep.example.com`

Happy guessing! 🍼✨
