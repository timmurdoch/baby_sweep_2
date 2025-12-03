# ⚙️ Baby Sweep - Environment Configuration Guide

Complete reference for all environment variables and configuration options.

## 📝 Overview

Baby Sweep uses environment variables for configuration. There are two sets of variables:
- **Backend** variables (in `backend/.env`)
- **Frontend** variables (in `frontend/.env`)

Frontend variables must be prefixed with `REACT_APP_`.

---

## 🔧 Backend Environment Variables

Location: `backend/.env`

### PORT

**Purpose:** Server port number
**Type:** Integer
**Default:** `3001`
**Valid Range:** 1024-65535
**Example:** `PORT=3001`

**Impact:**
- Changes which port the server listens on
- Must update firewall rules if changed
- Must update frontend `REACT_APP_API_URL` to match
- Cannot use ports below 1024 without root (not recommended)

**When to Change:**
- Port 3001 is already in use
- Running multiple instances
- Corporate firewall restrictions

---

### APP_PASSWORD

**Purpose:** Single password for all users
**Type:** String
**Default:** `babysweep2025`
**Example:** `APP_PASSWORD=MySecurePassword123!`

**Security:**
- Hashed with bcrypt before storage (10 rounds)
- Never sent in plain text
- Stored in database on first startup

**Impact:**
- Controls access to entire application
- Changing requires database reset or manual update
- Everyone uses the same password (by design)

**Best Practices:**
- ⚠️ **Change immediately** from default
- Use 12+ characters
- Mix letters, numbers, symbols
- Don't share in public channels
- Store in password manager

**Important Notes:**
- Password is hashed on first startup
- Changing `.env` after startup doesn't update database
- To change password after startup:
  1. Delete database file
  2. Update `.env`
  3. Restart server (new hash created)

---

### DUE_DATE

**Purpose:** Maximum date allowed for guesses
**Type:** Date string (YYYY-MM-DD)
**Default:** `2025-12-31`
**Example:** `DUE_DATE=2025-06-15`

**Impact:**
- Form validation prevents guesses after this date
- Calendar view typically centers around this date
- No retroactive changes (already submitted guesses unaffected)

**When to Change:**
- Set to actual estimated due date
- Can extend if baby is overdue
- Consider setting a week after actual due date as buffer

---

### TIME_BLOCK_MINUTES

**Purpose:** Time slot interval size
**Type:** Integer
**Valid Values:** `15`, `30`, or `60`
**Default:** `30`
**Example:** `TIME_BLOCK_MINUTES=15`

**Impact:**
- Determines granularity of time selection
- Affects calendar grid spacing
- Changes number of time options in dropdown

**Options:**
- **15 minutes:** 96 time slots per day (more precise, more options)
- **30 minutes:** 48 time slots per day (balanced, recommended)
- **60 minutes:** 24 time slots per day (simpler, cleaner)

**Recommendation:**
Use 30 minutes for most cases. Use 15 for larger groups where time conflicts likely.

---

### MAX_BLOCK_SELECTION_MINUTES

**Purpose:** Maximum duration for block guesses
**Type:** Integer (minutes)
**Default:** `60`
**Example:** `MAX_BLOCK_SELECTION_MINUTES=120`

**Impact:**
- Limits how many consecutive time slots can be selected
- Prevents users from "hogging" too much time
- Should be multiple of `TIME_BLOCK_MINUTES`

**Calculation:**
```
Max Slots = MAX_BLOCK_SELECTION_MINUTES / TIME_BLOCK_MINUTES
```

Examples:
- `MAX=60, BLOCK=30` → 2 slots max
- `MAX=60, BLOCK=15` → 4 slots max
- `MAX=120, BLOCK=30` → 4 slots max

---

### INCLUDE_SURPRISE_GENDER

**Purpose:** Show "Surprise" as gender option
**Type:** Boolean string
**Valid Values:** `true` or `false`
**Default:** `true`
**Example:** `INCLUDE_SURPRISE_GENDER=false`

**Impact:**
- When `true`: Shows Boy, Girl, Surprise options
- When `false`: Shows only Boy, Girl options

**Use Cases:**
- `true`: Gender is unknown to everyone
- `false`: Gender reveal has already happened

---

### ALLOW_DUPLICATES

**Purpose:** Allow multiple guesses for same date/time
**Type:** Boolean string
**Valid Values:** `true` or `false`
**Default:** `false`
**Example:** `ALLOW_DUPLICATES=true`

**Impact:**
- When `false`: First come, first served (prevents conflicts)
- When `true`: Multiple people can pick identical date/time

**Recommendations:**
- `false` (default): Best for competitive pools
- `true`: Better for casual, non-competitive gathering

---

### PRIMARY_COLOR

**Purpose:** Theme color for UI elements
**Type:** Hex color code
**Default:** `#4A90E2` (soft blue)
**Example:** `PRIMARY_COLOR=#FF69B4`

**Impact:**
- Changes buttons, links, highlights
- Affects calendar "today" highlighting
- Does not change gender colors (blue/pink/purple)

**Popular Options:**
- `#4A90E2` - Blue (default)
- `#FF69B4` - Hot Pink
- `#9370DB` - Medium Purple
- `#20B2AA` - Light Sea Green
- `#FF6347` - Tomato Red

**Accessibility:**
Ensure sufficient contrast with white text (WCAG AA: 4.5:1 minimum)

---

### WELCOME_TEXT

**Purpose:** Message shown on login page
**Type:** String
**Default:** `Welcome to our Baby Sweep! Make your guess about when our little one will arrive.`
**Example:** `WELCOME_TEXT=Welcome to Jane & John's Baby Pool! 🎉`

**Impact:**
- Displays on login screen before authentication
- Personalizes the experience
- Supports emoji and special characters

**Best Practices:**
- Keep under 200 characters
- Friendly, welcoming tone
- Can include baby's name (if sharing)
- Can add instructions if needed

---

## 🎨 Frontend Environment Variables

Location: `frontend/.env`

All frontend variables **must** be prefixed with `REACT_APP_`.

### REACT_APP_API_URL

**Purpose:** Backend API endpoint
**Type:** URL string
**Default:** `http://localhost:3001`
**Example:** `REACT_APP_API_URL=https://babysweep.example.com`

**Impact:**
- All API calls are directed here
- Must match backend server URL exactly
- Include protocol (http/https)
- No trailing slash

**Common Values:**
```bash
# Development
REACT_APP_API_URL=http://localhost:3001

# Production (same server)
REACT_APP_API_URL=https://babysweep.example.com

# Production (different server)
REACT_APP_API_URL=https://api.babysweep.example.com
```

**Troubleshooting:**
If you get CORS errors, verify:
1. URL matches exactly (including protocol)
2. Backend is actually running at this URL
3. No typos or trailing slashes

---

### REACT_APP_DUE_DATE

**Purpose:** Due date (frontend display/validation)
**Type:** Date string (YYYY-MM-DD)
**Default:** `2025-12-31`
**Example:** `REACT_APP_DUE_DATE=2025-06-15`

**Impact:**
- Used for client-side validation
- Should match backend `DUE_DATE`
- Displayed in UI where relevant

**Note:** Backend also validates, so mismatch won't break security, but will confuse users.

---

### REACT_APP_TIME_BLOCK_MINUTES

**Purpose:** Time slot interval (frontend)
**Type:** Integer
**Valid Values:** `15`, `30`, or `60`
**Default:** `30`
**Example:** `REACT_APP_TIME_BLOCK_MINUTES=30`

**Impact:**
- Generates time dropdown options
- Calendar slot sizing
- **Must match backend setting**

---

### REACT_APP_MAX_BLOCK_SELECTION_MINUTES

**Purpose:** Max block duration (frontend)
**Type:** Integer (minutes)
**Default:** `60`
**Example:** `REACT_APP_MAX_BLOCK_SELECTION_MINUTES=120`

**Impact:**
- Limits calendar slot selection UI
- Shows error when exceeded
- **Must match backend setting**

---

### REACT_APP_INCLUDE_SURPRISE_GENDER

**Purpose:** Show "Surprise" option (frontend)
**Type:** Boolean string
**Valid Values:** `true` or `false`
**Default:** `true`
**Example:** `REACT_APP_INCLUDE_SURPRISE_GENDER=false`

**Impact:**
- Controls gender radio button display
- **Must match backend setting**

---

### REACT_APP_PRIMARY_COLOR

**Purpose:** Theme color (frontend)
**Type:** Hex color code
**Default:** `#4A90E2`
**Example:** `REACT_APP_PRIMARY_COLOR=#FF69B4`

**Impact:**
- Overrides CSS variable
- Applied to buttons, highlights
- Should match backend for consistency

---

## 🔄 Applying Configuration Changes

### Docker Deployment

```bash
# Stop containers
docker-compose down

# Edit .env file
nano .env

# Rebuild (if frontend variables changed)
docker-compose build

# Start with new config
docker-compose up -d
```

### Manual Deployment

**Backend Changes:**
```bash
nano backend/.env
sudo systemctl restart baby-sweep
```

**Frontend Changes:**
```bash
nano frontend/.env
cd frontend
npm run build
cd ..
sudo systemctl restart baby-sweep
```

---

## 📋 Configuration Templates

### Minimal Configuration

```env
# Backend (.env)
PORT=3001
APP_PASSWORD=change-me-now
DUE_DATE=2025-12-31
```

```env
# Frontend (.env)
REACT_APP_API_URL=http://localhost:3001
REACT_APP_DUE_DATE=2025-12-31
```

### Recommended Configuration

```env
# Backend
PORT=3001
APP_PASSWORD=MySecurePassword123!
DUE_DATE=2025-06-15
TIME_BLOCK_MINUTES=30
MAX_BLOCK_SELECTION_MINUTES=60
INCLUDE_SURPRISE_GENDER=true
ALLOW_DUPLICATES=false
PRIMARY_COLOR=#4A90E2
WELCOME_TEXT=Welcome to our Baby Pool! Make your guess.
```

```env
# Frontend
REACT_APP_API_URL=http://localhost:3001
REACT_APP_DUE_DATE=2025-06-15
REACT_APP_TIME_BLOCK_MINUTES=30
REACT_APP_MAX_BLOCK_SELECTION_MINUTES=60
REACT_APP_INCLUDE_SURPRISE_GENDER=true
REACT_APP_PRIMARY_COLOR=#4A90E2
```

### Production Configuration

```env
# Backend
PORT=3001
APP_PASSWORD=VerySecureRandomPassword456!
DUE_DATE=2025-06-15
TIME_BLOCK_MINUTES=30
MAX_BLOCK_SELECTION_MINUTES=60
INCLUDE_SURPRISE_GENDER=false
ALLOW_DUPLICATES=false
PRIMARY_COLOR=#9370DB
WELCOME_TEXT=Welcome to Sarah & Mike's Baby Pool! 🍼
```

```env
# Frontend
REACT_APP_API_URL=https://babysweep.example.com
REACT_APP_DUE_DATE=2025-06-15
REACT_APP_TIME_BLOCK_MINUTES=30
REACT_APP_MAX_BLOCK_SELECTION_MINUTES=60
REACT_APP_INCLUDE_SURPRISE_GENDER=false
REACT_APP_PRIMARY_COLOR=#9370DB
```

---

## ⚠️ Common Mistakes

### Frontend/Backend Mismatch

**Problem:** Different values between frontend and backend

**Symptoms:**
- Validation errors
- Unexpected behavior
- UI doesn't match capabilities

**Solution:** Ensure these match:
- `DUE_DATE` = `REACT_APP_DUE_DATE`
- `TIME_BLOCK_MINUTES` = `REACT_APP_TIME_BLOCK_MINUTES`
- `MAX_BLOCK_SELECTION_MINUTES` = `REACT_APP_MAX_BLOCK_SELECTION_MINUTES`
- `INCLUDE_SURPRISE_GENDER` = `REACT_APP_INCLUDE_SURPRISE_GENDER`
- `PRIMARY_COLOR` = `REACT_APP_PRIMARY_COLOR`

### Password Not Updating

**Problem:** Changed `APP_PASSWORD` but still can't login with new password

**Solution:**
Password is hashed on first startup. To change:
```bash
rm backend/data/babysweep.db  # Deletes all data!
# Or manually update database (advanced)
```

### CORS Errors

**Problem:** Frontend can't connect to backend

**Solution:**
1. Verify `REACT_APP_API_URL` is correct
2. Check protocol (http vs https)
3. Remove trailing slashes
4. Ensure backend is actually running

---

## 🔍 Debugging Configuration

### Check Current Configuration

**Backend:**
```bash
# View loaded settings
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/settings
```

**Frontend:**
```javascript
// In browser console
console.log(process.env)
```

### Verify Environment Loading

**Backend:**
```bash
# Check if .env is being read
cd backend
node -e "require('dotenv').config(); console.log(process.env.APP_PASSWORD)"
```

**Frontend:**
```bash
# Environment variables are built into the bundle
# Must rebuild after changes
npm run build
```

---

## 📞 Need Help?

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for specific issues
- Verify your `.env` syntax (no spaces around `=`)
- Restart application after changes
- Check logs for error messages

---

**Pro Tip:** Keep a backup of your working `.env` file! Comment the version number and date:

```env
# Baby Sweep Configuration
# Version: 1.0.0
# Last Updated: 2025-01-15
PORT=3001
...
```
