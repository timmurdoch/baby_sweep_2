# 🚀 Baby Sweep - Quick Start Guide

Get Baby Sweep running in 5 minutes or less!

## Prerequisites Check

Before you start, make sure you have:

- [ ] **Docker** and **Docker Compose** installed ([Get Docker](https://docs.docker.com/get-docker/))
- [ ] **Git** installed
- [ ] Port **3001** available (or be ready to change it)
- [ ] At least **512MB** free RAM

**Alternative:** If you don't want to use Docker, you'll need **Node.js 18+** instead.

---

## ⚡ Method 1: Docker (Recommended - Fastest!)

### Step 1: Clone and Navigate

```bash
git clone https://github.com/yourusername/baby-sweep.git
cd baby-sweep
```

### Step 2: Configure (Optional but Recommended)

Create a `.env` file in the root directory:

```bash
cat > .env << EOF
APP_PASSWORD=your-secure-password-here
DUE_DATE=2025-12-31
WELCOME_TEXT=Welcome to our Baby Sweep! Guess when baby arrives!
TIME_BLOCK_MINUTES=30
EOF
```

> 💡 **Tip:** Skip this step to use defaults, but **change the password later!**

### Step 3: Launch

```bash
docker-compose up -d
```

### Step 4: Access

Open your browser to:

```
http://localhost:3001
```

**Default Password:** `babysweep2025`

### That's It! ✅

Your Baby Sweep is now running. Skip to [First Login](#first-login) below.

---

## 🔧 Method 2: Manual Setup (No Docker)

### Step 1: Clone and Navigate

```bash
git clone https://github.com/yourusername/baby-sweep.git
cd baby-sweep
```

### Step 2: Setup Backend

```bash
cd backend
cp .env.example .env
nano .env  # Edit with your settings
npm install
cd ..
```

**Minimum .env configuration:**
```env
PORT=3001
APP_PASSWORD=your-secure-password
DUE_DATE=2025-12-31
```

### Step 3: Setup Frontend

```bash
cd frontend
cp .env.example .env
nano .env  # Set API URL
npm install
npm run build
cd ..
```

**Frontend .env:**
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_DUE_DATE=2025-12-31
```

### Step 4: Start the Server

```bash
cd backend
node server.js
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║              🍼 Baby Sweep Server Running 🍼              ║
║  Server:    http://localhost:3001                         ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 5: Access

Open your browser to:

```
http://localhost:3001
```

**Default Password:** `babysweep2025`

---

## 🎉 First Login

1. **Open:** Navigate to `http://localhost:3001`
2. **Enter Password:** Use `babysweep2025` (or your custom password)
3. **Click "Enter"**
4. **You're In!** You'll see three tabs:
   - Make a Guess
   - Calendar View
   - All Guesses

---

## 📝 Make Your First Guess

1. Click **"Make a Guess"** tab
2. Fill in the form:
   - Your Name
   - Your Email
   - Gender Guess (Boy/Girl/Surprise)
   - Birth Date
   - Birth Time
   - Weight (it converts automatically!)
3. Click **"Submit Guess"**
4. Success! Your guess appears in **"All Guesses"** and on the **Calendar**

---

## 🎨 Customize Your Installation

### Change the Password

**Important:** Do this before sharing with others!

1. **If using Docker:**
   ```bash
   docker-compose down
   nano .env  # Change APP_PASSWORD
   docker-compose up -d
   ```

2. **If running manually:**
   ```bash
   # Stop the server (Ctrl+C)
   nano backend/.env  # Change APP_PASSWORD
   node backend/server.js  # Restart
   ```

### Change the Welcome Message

Edit the `WELCOME_TEXT` in your `.env` file:

```env
WELCOME_TEXT=Welcome to Jane and John's Baby Pool! 🎉
```

Restart the application for changes to take effect.

### Set Your Due Date

```env
DUE_DATE=2025-06-15
```

This prevents guesses after your expected due date.

### Adjust Time Blocks

```env
TIME_BLOCK_MINUTES=15   # Options: 15, 30, or 60
```

- **15 minutes** - More granular time guessing
- **30 minutes** - Balanced (default)
- **60 minutes** - Simpler hour-based guessing

---

## 🔍 Verify It's Working

### Check the Health Endpoint

```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2025-01-15T12:00:00.000Z"}
```

### Check the Database

The SQLite database is created at:
- **Docker:** `./data/babysweep.db`
- **Manual:** `backend/data/babysweep.db`

```bash
# Docker
ls -lh ./data/babysweep.db

# Manual
ls -lh backend/data/babysweep.db
```

### View Logs

**Docker:**
```bash
docker-compose logs -f
```

**Manual:**
The server logs print to the console where you ran `node server.js`

---

## 📱 Test on Mobile

1. Find your computer's local IP address:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. On your phone's browser, navigate to:
   ```
   http://YOUR-IP-ADDRESS:3001
   ```
   Example: `http://192.168.1.100:3001`

3. The interface should be fully responsive!

---

## ⚠️ Common Issues

### Port 3001 Already in Use

**Solution:** Change the port in your `.env` file:

```env
PORT=3002
```

Then restart.

### Can't Connect from Another Device

**Solution:** Make sure your firewall allows port 3001:

```bash
# Ubuntu/Debian
sudo ufw allow 3001

# Fedora/CentOS
sudo firewall-cmd --add-port=3001/tcp --permanent
sudo firewall-cmd --reload
```

### Database Permission Errors

**Solution:** Ensure the data directory is writable:

```bash
# Docker
mkdir -p ./data
chmod 755 ./data

# Manual
mkdir -p backend/data
chmod 755 backend/data
```

### "Invalid Password" But You're Using the Right One

**Solution:** The password was changed after the database was created. You have two options:

1. **Reset the database** (loses all data):
   ```bash
   rm -rf ./data/babysweep.db
   # Restart the app
   ```

2. **Update the password in the database** (requires manual database editing)

---

## 🎯 Next Steps

Now that Baby Sweep is running:

1. **✅ Change the default password** (seriously, do this!)
2. **📅 Set your actual due date**
3. **🎨 Customize the welcome message**
4. **👥 Share the URL with friends and family**
5. **📊 Watch the guesses roll in!**

---

## 📚 Further Reading

- **[README.md](README.md)** - Full documentation
- **[DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)** - Production deployment
- **[ENV_CONFIGURATION.md](ENV_CONFIGURATION.md)** - All configuration options
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Detailed problem solving
- **[PHASE2.md](PHASE2.md)** - Future features

---

## 🆘 Need Help?

- **Check logs:** `docker-compose logs` or console output
- **Verify health:** `curl http://localhost:3001/api/health`
- **Read troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Open an issue:** [GitHub Issues](https://github.com/yourusername/baby-sweep/issues)

---

## 🎊 Congratulations!

You've successfully set up Baby Sweep! Your digital baby pool is ready for guesses.

**Remember:** The default password is `babysweep2025` - change it before sharing!

Happy guessing! 🍼✨
