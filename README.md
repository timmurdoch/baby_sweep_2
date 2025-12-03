# 🍼 Baby Sweep

A modern, full-stack digital baby pool platform where friends and family can submit guesses about a baby's birth details including gender, date, time, and weight. Simple enough for non-technical users while being production-ready and fully self-contained.

## ✨ Features

- **Single Password Authentication** - No individual accounts needed, perfect for family gatherings
- **Interactive Guess Submission** - Comprehensive form with real-time weight conversion
- **Calendar Visualization** - Beautiful interactive calendar showing all guesses
- **Block Guess Support** - Select multiple consecutive time slots for a single guess
- **Mobile-First Design** - Fully responsive interface works on all devices
- **Real-Time Weight Conversion** - Automatic conversion between imperial (lbs/oz) and metric (kg)
- **Self-Contained** - SQLite database, no external services required
- **Docker Ready** - Easy deployment with Docker and Docker Compose
- **Production Grade** - Built with security, performance, and reliability in mind

## 🚀 Quick Start

Get up and running in 5 minutes:

```bash
# Clone the repository
git clone https://github.com/yourusername/baby-sweep.git
cd baby-sweep

# Start with Docker Compose (recommended)
docker-compose up -d

# Access the application
open http://localhost:3001
```

**Default Password:** `babysweep2025` (⚠️ Change this immediately!)

For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md)

## 📋 Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## 🛠 Technology Stack

### Frontend
- **React 18.2.0** - Modern UI library
- **React Big Calendar** - Interactive calendar component
- **Moment.js** - Date/time manipulation
- **Custom CSS** - Mobile-first responsive design (no frameworks)

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 4.18** - Web framework
- **SQLite** - Self-contained database (better-sqlite3)
- **bcrypt** - Password hashing
- **Session-based authentication** - 24-hour tokens

### Deployment
- **Docker** - Containerization with multi-stage builds
- **Docker Compose** - Service orchestration
- **Nginx** - Reverse proxy (optional)
- **Systemd** - System service (alternative to Docker)

## 📁 Project Structure

```
baby-sweep/
├── backend/
│   ├── server.js              # Express server with all routes
│   ├── database.js            # SQLite database setup
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment template
│
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── CalendarView.js    # Calendar component
│   │   ├── index.js           # React entry point
│   │   ├── index.css          # All styling
│   │   └── reportWebVitals.js
│   ├── package.json           # Frontend dependencies
│   └── .env.example           # Environment template
│
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # Container orchestration
├── nginx.conf                  # Reverse proxy config
├── baby-sweep.service          # Systemd service file
└── README.md                   # This file
```

## 💻 Installation

### Prerequisites

- **Node.js 18+** and npm
- **Docker & Docker Compose** (for containerized deployment)
- **Git** for cloning the repository

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/baby-sweep.git
cd baby-sweep

# Copy and configure environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your settings
nano backend/.env

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 2: Manual Deployment

```bash
# Clone the repository
git clone https://github.com/yourusername/baby-sweep.git
cd baby-sweep

# Setup backend
cd backend
cp .env.example .env
nano .env  # Configure your settings
npm install
cd ..

# Setup frontend
cd frontend
cp .env.example .env
nano .env  # Configure API URL
npm install
npm run build
cd ..

# Start backend (serves built frontend)
cd backend
node server.js
```

### Option 3: Systemd Service

See [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) for detailed systemd setup instructions.

## ⚙️ Configuration

### Backend Environment Variables

```bash
PORT=3001                                    # Server port
APP_PASSWORD=babysweep2025                   # Access password (CHANGE THIS!)
DUE_DATE=2025-12-31                          # Maximum guess date
TIME_BLOCK_MINUTES=30                        # Time slot intervals (15, 30, or 60)
MAX_BLOCK_SELECTION_MINUTES=60               # Maximum block guess duration
INCLUDE_SURPRISE_GENDER=true                 # Show "Surprise" gender option
ALLOW_DUPLICATES=false                       # Allow duplicate date/time guesses
PRIMARY_COLOR=#4A90E2                        # Theme color
WELCOME_TEXT=Welcome to our Baby Sweep!      # Login page message
```

### Frontend Environment Variables

All frontend variables must be prefixed with `REACT_APP_`:

```bash
REACT_APP_API_URL=http://localhost:3001      # Backend API URL
REACT_APP_DUE_DATE=2025-12-31                # Maximum guess date
REACT_APP_TIME_BLOCK_MINUTES=30              # Time slot intervals
REACT_APP_MAX_BLOCK_SELECTION_MINUTES=60     # Max block duration
REACT_APP_INCLUDE_SURPRISE_GENDER=true       # Show "Surprise" option
REACT_APP_PRIMARY_COLOR=#4A90E2              # Theme color
```

For detailed configuration documentation, see [ENV_CONFIGURATION.md](ENV_CONFIGURATION.md)

## 🚢 Deployment

### Production Checklist

Before deploying to production:

1. ✅ Change the default password in `.env`
2. ✅ Set appropriate `DUE_DATE` for your baby
3. ✅ Configure `WELCOME_TEXT` with personalized message
4. ✅ Set `ALLOW_DUPLICATES` based on your preference
5. ✅ Update `REACT_APP_API_URL` for production domain
6. ✅ Set up SSL/HTTPS (via Cloudflare or Let's Encrypt)
7. ✅ Configure firewall rules
8. ✅ Set up backup strategy for database
9. ✅ Test on mobile devices
10. ✅ Review security settings

For complete deployment guidance, see [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)

### Resource Requirements

**Minimum:**
- 512MB RAM
- 1 CPU core
- 1GB storage
- Suitable for personal/family use

**Recommended:**
- 1GB RAM
- 2 CPU cores
- 5GB storage
- Better for larger gatherings

## 📡 API Documentation

### Authentication

**POST** `/api/auth/login`
```json
Request:  { "password": "your-password" }
Response: { "token": "session-token-here" }
```

**POST** `/api/auth/verify`
```json
Request:  { "token": "session-token" }
Response: { "valid": true }
```

### Guesses

**POST** `/api/guesses` (requires auth)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "gender": "Boy",
  "birth_date": "2025-12-15",
  "birth_time": "14:30",
  "weight_lbs": 7,
  "weight_oz": 8,
  "weight_kg": 3.4,
  "is_block_guess": false,
  "time_blocks": []
}
```

**GET** `/api/guesses` (requires auth)
- Returns array of all guesses

**GET** `/api/guesses/calendar` (requires auth)
- Returns guesses formatted for calendar display

**GET** `/api/guesses/by-date` (requires auth)
- Returns aggregated statistics by date

### Utilities

**POST** `/api/convert/weight`
```json
Request:  { "lbs": 7, "oz": 8 }
Response: { "lbs": 7, "oz": 8, "kg": 3.4 }

Request:  { "kg": 3.5 }
Response: { "lbs": 7, "oz": 11, "kg": 3.5 }
```

**GET** `/api/health`
```json
Response: { "status": "ok", "timestamp": "2025-01-15T12:00:00.000Z" }
```

## 🔧 Development

### Running in Development Mode

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Server runs on http://localhost:3001
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm start
# Development server runs on http://localhost:3000
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# The build folder is automatically served by the backend
cd ../backend
node server.js
```

### Database Management

The SQLite database is created automatically at `backend/data/babysweep.db`.

**Backup:**
```bash
cp backend/data/babysweep.db backup-$(date +%Y%m%d).db
```

**Reset (caution!):**
```bash
rm backend/data/babysweep.db
# Database will be recreated on next server start
```

## 📚 Documentation

Comprehensive documentation is available:

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)** - Production deployment guide
- **[ENV_CONFIGURATION.md](ENV_CONFIGURATION.md)** - Environment variable reference
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[VISUAL-PREVIEW.md](VISUAL-PREVIEW.md)** - UI/UX layout descriptions
- **[PHASE2.md](PHASE2.md)** - Future enhancement roadmap

## 🎯 Use Cases

- **Baby Showers** - Interactive game for guests
- **Family Pools** - Friendly competition among relatives
- **Office Pools** - Workplace baby betting
- **Virtual Gatherings** - Remote participation support
- **Multiple Babies** - Deploy separate instances

## 🔒 Security

- Passwords hashed with bcrypt (10 salt rounds)
- Session tokens: 32-byte cryptographically random
- SQL injection prevention via parameterized queries
- CORS configured (not wide-open)
- Input validation on all endpoints
- No sensitive data in client responses
- Regular session cleanup

**Important:** Change the default password immediately!

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change PORT in .env file
PORT=3002
```

**Database locked:**
```bash
# Stop all instances of the app
# Delete .db-shm and .db-wal files
```

**CORS errors:**
```bash
# Ensure REACT_APP_API_URL matches backend URL exactly
```

For more solutions, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍👩‍👧‍👦 About

Baby Sweep was created to make baby pools more accessible, interactive, and fun. No accounts, no complexity—just pure guessing enjoyment!

## 🙏 Acknowledgments

- React Big Calendar for the excellent calendar component
- The Node.js and React communities
- All the families who inspired this project

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/baby-sweep/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/baby-sweep/discussions)
- **Documentation:** See the `/docs` folder

---

Made with ❤️ for growing families

**Default Password:** `babysweep2025` - Don't forget to change it!
