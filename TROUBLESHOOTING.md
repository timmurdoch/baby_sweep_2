# 🔧 Baby Sweep - Troubleshooting Guide

Solutions to common problems and error messages. Check here before opening an issue!

## 📋 Table of Contents

- [Installation Issues](#installation-issues)
- [Authentication Problems](#authentication-problems)
- [Database Errors](#database-errors)
- [Connection Issues](#connection-issues)
- [Form/Submission Errors](#formsubmission-errors)
- [Calendar Issues](#calendar-issues)
- [Performance Problems](#performance-problems)
- [Docker Issues](#docker-issues)
- [General Debugging](#general-debugging)

---

## 🚀 Installation Issues

### "Port 3001 is already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Causes:**
- Another application using port 3001
- Previous instance still running
- Port not released after crash

**Solutions:**

1. **Find what's using the port:**
   ```bash
   # Linux/Mac
   sudo lsof -i :3001
   sudo netstat -tulpn | grep 3001

   # Kill the process
   kill -9 <PID>
   ```

2. **Change the port:**
   ```bash
   # Edit .env
   PORT=3002

   # Don't forget to update frontend too
   REACT_APP_API_URL=http://localhost:3002
   ```

3. **Stop all Docker containers:**
   ```bash
   docker-compose down
   docker ps -a  # Check for orphaned containers
   ```

---

### "npm install fails" / Module errors

**Symptoms:**
```
npm ERR! code EACCES
npm ERR! syscall access
```

**Solutions:**

1. **Fix npm permissions:**
   ```bash
   sudo chown -R $USER:$USER ~/.npm
   sudo chown -R $USER:$USER node_modules
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use correct Node version:**
   ```bash
   node --version  # Should be 18.x or higher
   # If not, install Node 18+
   ```

4. **Try with sudo (last resort):**
   ```bash
   sudo npm install
   ```

---

### "Cannot find module" errors

**Symptoms:**
```
Error: Cannot find module 'express'
Error: Cannot find module './database'
```

**Solutions:**

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Check you're in the right directory:**
   ```bash
   pwd  # Should be in backend/ or frontend/
   ls   # Should see package.json
   ```

3. **Verify node_modules exists:**
   ```bash
   ls node_modules/  # Should list packages
   ```

---

## 🔐 Authentication Problems

### "Invalid password" but you're using the correct one

**Symptoms:**
- Login fails with correct password
- Password worked before, doesn't now

**Causes:**
- Password was changed in `.env` after database initialization
- Database stores hashed password from first run

**Solutions:**

1. **Check current password in .env:**
   ```bash
   cat backend/.env | grep APP_PASSWORD
   ```

2. **Reset the database (⚠️ deletes all data):**
   ```bash
   rm backend/data/babysweep.db
   # Restart server - new password hash will be created
   ```

3. **Manual database password update (advanced):**
   ```bash
   # Generate new hash
   node -e "console.log(require('bcrypt').hashSync('NEW_PASSWORD', 10))"

   # Update database (use SQLite browser or CLI)
   ```

---

### Session expires immediately / "Invalid or expired token"

**Symptoms:**
- Logged out right after login
- Constant "Invalid session" errors

**Causes:**
- System clock incorrect
- Database session cleanup issue
- Token storage problem

**Solutions:**

1. **Check system time:**
   ```bash
   date  # Should be accurate
   # If wrong, sync time
   sudo ntpdate time.google.com
   ```

2. **Clear browser storage:**
   ```javascript
   // In browser console
   localStorage.clear()
   ```

3. **Check database sessions:**
   ```bash
   sqlite3 backend/data/babysweep.db "SELECT * FROM sessions;"
   ```

---

### Can't logout / stuck logged in

**Symptoms:**
- Logout button doesn't work
- Still authenticated after logout

**Solutions:**

1. **Clear localStorage:**
   ```javascript
   // Browser console (F12)
   localStorage.removeItem('baby_sweep_token')
   location.reload()
   ```

2. **Hard refresh:**
   - Chrome/Firefox: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

---

## 💾 Database Errors

### "Database is locked"

**Symptoms:**
```
Error: SQLITE_BUSY: database is locked
```

**Causes:**
- Multiple processes accessing database
- Previous process didn't close connection
- File permission issues

**Solutions:**

1. **Stop all instances:**
   ```bash
   # Docker
   docker-compose down
   docker ps

   # Manual
   ps aux | grep node
   kill <PID>
   ```

2. **Remove WAL files:**
   ```bash
   rm backend/data/babysweep.db-shm
   rm backend/data/babysweep.db-wal
   ```

3. **Check file permissions:**
   ```bash
   ls -l backend/data/
   chmod 644 backend/data/babysweep.db
   ```

---

### "No such table" errors

**Symptoms:**
```
Error: no such table: guesses
Error: no such table: settings
```

**Causes:**
- Database not initialized
- Database file corrupted
- Wrong database file being used

**Solutions:**

1. **Delete and recreate database:**
   ```bash
   rm backend/data/babysweep.db
   # Restart server - tables will be created
   ```

2. **Verify database location:**
   ```bash
   # Check data directory exists
   ls -la backend/data/

   # Create if missing
   mkdir -p backend/data
   ```

3. **Check database integrity:**
   ```bash
   sqlite3 backend/data/babysweep.db "PRAGMA integrity_check;"
   ```

---

### Database file permission denied

**Symptoms:**
```
Error: SQLITE_CANTOPEN: unable to open database file
```

**Solutions:**

1. **Fix permissions:**
   ```bash
   sudo chown -R $USER:$USER backend/data
   chmod 755 backend/data
   chmod 644 backend/data/babysweep.db
   ```

2. **Create data directory:**
   ```bash
   mkdir -p backend/data
   ```

3. **Docker volume permissions:**
   ```bash
   # In docker-compose.yml, ensure volume is properly mounted
   volumes:
     - ./data:/app/backend/data
   ```

---

## 🌐 Connection Issues

### CORS errors / "Access blocked"

**Symptoms:**
```
Access to fetch at 'http://localhost:3001/api/...' has been blocked by CORS policy
```

**Causes:**
- Frontend and backend URLs don't match
- Missing CORS headers
- Browser security restrictions

**Solutions:**

1. **Check REACT_APP_API_URL:**
   ```bash
   # Must match exactly (including protocol, no trailing slash)
   cat frontend/.env | grep REACT_APP_API_URL
   ```

2. **Verify backend is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Check for typos:**
   ```bash
   # Wrong:
   http://localhost:3001/
   https://localhost:3001
   http://localhost:3001

   # Correct:
   http://localhost:3001
   ```

4. **Rebuild frontend after .env changes:**
   ```bash
   cd frontend
   npm run build
   ```

---

### "Failed to fetch" / Network errors

**Symptoms:**
- All API calls fail
- "Network request failed"
- Blank page or loading forever

**Causes:**
- Backend not running
- Wrong URL
- Firewall blocking connection

**Solutions:**

1. **Verify backend is running:**
   ```bash
   # Docker
   docker-compose ps
   docker-compose logs

   # Manual
   ps aux | grep node
   curl http://localhost:3001/api/health
   ```

2. **Check firewall:**
   ```bash
   sudo ufw status
   # Ensure port 3001 is allowed
   sudo ufw allow 3001
   ```

3. **Test with curl:**
   ```bash
   curl -v http://localhost:3001/api/health
   # Look for connection errors
   ```

---

### Can't connect from other devices

**Symptoms:**
- Works on localhost
- Doesn't work from phone/tablet
- Other computers can't access

**Solutions:**

1. **Find your IP address:**
   ```bash
   # Linux/Mac
   ifconfig | grep "inet "
   # or
   ip addr show

   # Should see something like 192.168.1.100
   ```

2. **Update frontend .env:**
   ```bash
   REACT_APP_API_URL=http://192.168.1.100:3001
   # Rebuild after changing
   npm run build
   ```

3. **Check firewall:**
   ```bash
   sudo ufw allow 3001
   ```

4. **Ensure binding to 0.0.0.0:**
   ```javascript
   // In server.js (should already be correct)
   app.listen(PORT, '0.0.0.0', () => {...})
   ```

---

## 📝 Form/Submission Errors

### Weight conversion not working

**Symptoms:**
- Typing pounds doesn't update kg
- Typing kg doesn't update pounds
- Conversion shows wrong values

**Solutions:**

1. **Check API endpoint:**
   ```bash
   curl -X POST http://localhost:3001/api/convert/weight \
     -H "Content-Type: application/json" \
     -d '{"lbs": 7, "oz": 8}'
   ```

2. **Clear browser cache:**
   - Hard refresh (Ctrl+Shift+R)

3. **Check browser console for errors:**
   - F12 → Console tab
   - Look for API errors

---

### "Guess already exists" error

**Symptoms:**
```
Error: A guess already exists for this date and time
```

**Causes:**
- `ALLOW_DUPLICATES=false` in .env
- Someone already picked that time

**Solutions:**

1. **Choose a different time**

2. **Enable duplicates (if desired):**
   ```bash
   # In backend/.env
   ALLOW_DUPLICATES=true
   # Restart server
   ```

---

### Form validation errors

**Symptoms:**
- "Please fill in all required fields"
- "Invalid date" or "Invalid email"
- Can't submit even when form looks complete

**Solutions:**

1. **Check required fields:**
   - Name (filled)
   - Email (valid format)
   - Gender (selected)
   - Birth date (valid date before due date)
   - Birth time (selected)
   - Weight (filled, positive number)

2. **Check date doesn't exceed due date:**
   ```bash
   # In .env
   DUE_DATE=2025-12-31
   ```

3. **Clear form and start over**

4. **Try different browser:**
   - Test in Chrome, Firefox
   - Check browser console for JS errors

---

## 📅 Calendar Issues

### Calendar not loading / blank

**Symptoms:**
- Calendar section is empty
- Just shows loading spinner forever
- "Failed to load calendar" message

**Solutions:**

1. **Check API response:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/guesses/calendar
   ```

2. **Verify authentication:**
   - Are you logged in?
   - Try logging out and back in

3. **Check browser console:**
   - F12 → Console
   - Look for JavaScript errors

4. **Clear browser cache:**
   - Ctrl+Shift+R (hard refresh)

---

### Calendar colors wrong

**Symptoms:**
- All events same color
- Colors don't match gender
- Calendar looks monochrome

**Causes:**
- CSS not loaded
- Gender field incorrect in database
- Theme override issue

**Solutions:**

1. **Check guess data:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/guesses
   # Verify "gender" field is "Boy", "Girl", or "Surprise"
   ```

2. **Clear browser cache:**
   - Hard refresh

3. **Check CSS loaded:**
   - F12 → Network tab
   - Look for index.css

---

### Calendar events overlap/hidden

**Symptoms:**
- Can't see some events
- Events stacked weirdly
- Clicking doesn't work

**Solutions:**

1. **Switch calendar view:**
   - Try Month → Week → Day views
   - Some views handle overlap better

2. **Use smaller time blocks:**
   ```bash
   # In .env
   TIME_BLOCK_MINUTES=15  # Instead of 30 or 60
   ```

3. **Check for duplicate times:**
   - Look at "All Guesses" view
   - Multiple people may have picked same time

---

## 🐌 Performance Problems

### Slow page load

**Symptoms:**
- Takes 5+ seconds to load
- High memory usage
- Browser feels sluggish

**Solutions:**

1. **Check bundle size:**
   ```bash
   ls -lh frontend/build/static/js/
   # Main bundle should be < 1MB
   ```

2. **Clear browser data:**
   - Clear cache, cookies
   - Close other tabs

3. **Check server resources:**
   ```bash
   # Check CPU/memory
   top
   docker stats  # For Docker
   ```

---

### Database growing too large

**Symptoms:**
- Database file is huge
- Queries getting slower

**Solutions:**

1. **Check database size:**
   ```bash
   ls -lh backend/data/babysweep.db
   ```

2. **Vacuum database:**
   ```bash
   sqlite3 backend/data/babysweep.db "VACUUM;"
   ```

3. **Clean old sessions:**
   ```bash
   sqlite3 backend/data/babysweep.db \
     "DELETE FROM sessions WHERE datetime(expires_at) < datetime('now');"
   ```

---

## 🐳 Docker Issues

### "docker-compose command not found"

**Solutions:**

1. **Install docker-compose:**
   ```bash
   sudo apt install docker-compose
   ```

2. **Or use Docker Compose V2:**
   ```bash
   docker compose up -d  # Note: no hyphen
   ```

---

### Build fails in Docker

**Symptoms:**
```
ERROR [frontend-builder] npm install failed
ERROR [production] npm install failed
```

**Solutions:**

1. **Clear Docker cache:**
   ```bash
   docker-compose build --no-cache
   ```

2. **Prune Docker:**
   ```bash
   docker system prune -a
   ```

3. **Check Dockerfile:**
   - Verify paths are correct
   - Check package.json exists

---

### Container exits immediately

**Symptoms:**
```
baby-sweep exited with code 1
```

**Solutions:**

1. **Check logs:**
   ```bash
   docker-compose logs baby-sweep
   ```

2. **Common causes:**
   - Missing .env file
   - Port already in use
   - Syntax error in code

3. **Run interactively:**
   ```bash
   docker-compose run baby-sweep sh
   # Troubleshoot inside container
   ```

---

## 🔍 General Debugging

### Enable Debug Logging

**Backend:**
```javascript
// Add to server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

**Frontend:**
```javascript
// Browser console
localStorage.setItem('debug', '*')
```

---

### Check Version Compatibility

```bash
# Node version
node --version  # Should be 18+

# npm version
npm --version  # Should be 8+

# React version
cat frontend/package.json | grep react

# Check for updates
npm outdated
```

---

### Database Inspection

```bash
# Open database
sqlite3 backend/data/babysweep.db

# List tables
.tables

# View schema
.schema guesses

# Check settings
SELECT * FROM settings;

# Count guesses
SELECT COUNT(*) FROM guesses;

# Exit
.exit
```

---

### Network Debugging

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test with authentication
TOKEN="your-token-here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/guesses

# Verbose curl
curl -v http://localhost:3001/api/health
```

---

## 🆘 Still Stuck?

### Gather Information

1. **Check logs:**
   ```bash
   docker-compose logs
   # or
   journalctl -u baby-sweep
   ```

2. **Get system info:**
   ```bash
   uname -a
   node --version
   docker --version
   ```

3. **Check browser console:**
   - F12 → Console tab
   - Copy any error messages

4. **Take screenshots**

### Get Help

- **Documentation:** Re-read relevant docs
- **GitHub Issues:** [Search existing issues](https://github.com/yourusername/baby-sweep/issues)
- **Create new issue:** Include logs, errors, system info

### Quick Reset (Last Resort)

⚠️ **Deletes all data!**

```bash
# Stop everything
docker-compose down
# or
sudo systemctl stop baby-sweep

# Delete database
rm -rf backend/data/babysweep.db*

# Delete node modules
rm -rf backend/node_modules frontend/node_modules

# Reinstall
cd backend && npm install
cd ../frontend && npm install && npm run build

# Restart
docker-compose up -d
# or
sudo systemctl start baby-sweep
```

---

## ✅ Prevention Tips

- **Regular backups:** Schedule daily database backups
- **Monitor logs:** Check logs weekly for warnings
- **Test after changes:** Always test after modifying config
- **Keep updated:** Update dependencies regularly
- **Documentation:** Keep your own notes of customizations

---

**Remember:** Most issues are configuration problems. Double-check your `.env` files first!
