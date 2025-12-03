require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
const {
  getAllSettings,
  getSetting,
  createSession,
  getSession,
  cleanupExpiredSessions,
  createGuess,
  getAllGuesses,
  guessExists,
  getGuessesByDate
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Cleanup expired sessions every hour
setInterval(() => {
  cleanupExpiredSessions();
  console.log('✓ Cleaned up expired sessions');
}, 60 * 60 * 1000);

/**
 * Middleware: Verify authentication token
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  const session = getSession(token);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  req.session = session;
  next();
}

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

/**
 * POST /api/auth/login
 * Login with password and receive session token
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Get hashed password from settings
    const hashedPassword = getSetting('app_password');

    if (!hashedPassword) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Compare passwords
    const isValid = await bcrypt.compare(password, hashedPassword);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Store session
    createSession(sessionToken, expiresAt);

    res.json({ token: sessionToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/verify
 * Verify if a session token is valid
 */
app.post('/api/auth/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.json({ valid: false });
    }

    const session = getSession(token);
    res.json({ valid: !!session });
  } catch (error) {
    console.error('Verify error:', error);
    res.json({ valid: false });
  }
});

// ============================================================================
// SETTINGS ROUTES
// ============================================================================

/**
 * GET /api/settings
 * Get all settings (requires authentication)
 */
app.get('/api/settings', requireAuth, (req, res) => {
  try {
    const settings = getAllSettings();
    // Don't send the hashed password to the client
    delete settings.app_password;
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * GET /api/settings/welcome
 * Get welcome text (public endpoint)
 */
app.get('/api/settings/welcome', (req, res) => {
  try {
    const welcomeText = getSetting('welcome_text');
    res.json({ welcome_text: welcomeText });
  } catch (error) {
    console.error('Get welcome text error:', error);
    res.status(500).json({ error: 'Failed to fetch welcome text' });
  }
});

// ============================================================================
// GUESS ROUTES
// ============================================================================

/**
 * POST /api/guesses
 * Submit a new guess (requires authentication)
 */
app.post('/api/guesses', requireAuth, (req, res) => {
  try {
    const {
      name,
      email,
      gender,
      birth_date,
      birth_time,
      weight_lbs,
      weight_oz,
      weight_kg,
      is_block_guess,
      time_blocks,
      amount_paid
    } = req.body;

    // Validate required fields
    if (!name || !email || !gender || !birth_date || !birth_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate gender
    const validGenders = ['Boy', 'Girl', 'Surprise'];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({ error: 'Invalid gender value' });
    }

    // Validate birth date against due date
    const dueDate = getSetting('due_date');
    if (new Date(birth_date) > new Date(dueDate)) {
      return res.status(400).json({ error: 'Birth date cannot be after due date' });
    }

    // Check for duplicates if not allowed
    const allowDuplicates = getSetting('allow_duplicates') === 'true';
    if (!allowDuplicates && guessExists(birth_date, birth_time)) {
      return res.status(409).json({ error: 'A guess already exists for this date and time' });
    }

    // Validate weight
    if (weight_kg === undefined || weight_kg === null) {
      return res.status(400).json({ error: 'Weight is required' });
    }

    // Create guess
    const result = createGuess({
      name,
      email,
      gender,
      birth_date,
      birth_time,
      weight_lbs: weight_lbs || null,
      weight_oz: weight_oz || null,
      weight_kg,
      is_block_guess: is_block_guess ? 1 : 0,
      time_blocks: time_blocks ? JSON.stringify(time_blocks) : null,
      amount_paid: amount_paid || 0
    });

    res.status(201).json({
      id: result.lastInsertRowid,
      message: 'Guess submitted successfully'
    });
  } catch (error) {
    console.error('Create guess error:', error);
    res.status(500).json({ error: 'Failed to submit guess' });
  }
});

/**
 * GET /api/guesses
 * Get all guesses (requires authentication)
 */
app.get('/api/guesses', requireAuth, (req, res) => {
  try {
    const guesses = getAllGuesses();

    // Parse time_blocks JSON for each guess
    const parsedGuesses = guesses.map(guess => ({
      ...guess,
      time_blocks: guess.time_blocks ? JSON.parse(guess.time_blocks) : null,
      is_block_guess: !!guess.is_block_guess
    }));

    res.json(parsedGuesses);
  } catch (error) {
    console.error('Get guesses error:', error);
    res.status(500).json({ error: 'Failed to fetch guesses' });
  }
});

/**
 * GET /api/guesses/by-date
 * Get aggregated guess counts by date (requires authentication)
 */
app.get('/api/guesses/by-date', requireAuth, (req, res) => {
  try {
    const byDate = getGuessesByDate();
    res.json(byDate);
  } catch (error) {
    console.error('Get guesses by date error:', error);
    res.status(500).json({ error: 'Failed to fetch guess statistics' });
  }
});

/**
 * GET /api/guesses/calendar
 * Get guesses formatted for react-big-calendar (requires authentication)
 */
app.get('/api/guesses/calendar', requireAuth, (req, res) => {
  try {
    const guesses = getAllGuesses();
    const calendarEvents = [];

    for (const guess of guesses) {
      const timeBlocks = guess.time_blocks ? JSON.parse(guess.time_blocks) : [guess.birth_time];

      // Create an event for each time block
      for (const timeBlock of timeBlocks) {
        const [hours, minutes] = timeBlock.split(':').map(Number);
        const startDate = new Date(guess.birth_date);
        startDate.setHours(hours, minutes, 0, 0);

        // Calculate end time (add time block interval)
        const timeBlockMinutes = parseInt(getSetting('time_block_minutes') || '30');
        const endDate = new Date(startDate.getTime() + timeBlockMinutes * 60000);

        calendarEvents.push({
          id: `${guess.id}-${timeBlock}`,
          title: guess.name,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          gender: guess.gender,
          guessData: {
            id: guess.id,
            name: guess.name,
            email: guess.email,
            gender: guess.gender,
            birth_date: guess.birth_date,
            birth_time: guess.birth_time,
            weight_lbs: guess.weight_lbs,
            weight_oz: guess.weight_oz,
            weight_kg: guess.weight_kg,
            is_block_guess: !!guess.is_block_guess,
            time_blocks: guess.time_blocks ? JSON.parse(guess.time_blocks) : null,
            created_at: guess.created_at
          }
        });
      }
    }

    res.json(calendarEvents);
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// ============================================================================
// UTILITY ROUTES
// ============================================================================

/**
 * POST /api/convert/weight
 * Convert weight between imperial and metric
 */
app.post('/api/convert/weight', (req, res) => {
  try {
    const { lbs, oz, kg } = req.body;

    let resultKg, resultLbs, resultOz;

    if (kg !== undefined && kg !== null) {
      // Convert from kg to lbs/oz
      const totalGrams = kg * 1000;
      const totalOunces = totalGrams / 28.3495;
      resultLbs = Math.floor(totalOunces / 16);
      resultOz = Math.round(totalOunces % 16);
      resultKg = kg;
    } else if (lbs !== undefined && oz !== undefined) {
      // Convert from lbs/oz to kg
      const totalGrams = (lbs * 453.592) + (oz * 28.3495);
      resultKg = parseFloat((totalGrams / 1000).toFixed(3));
      resultLbs = lbs;
      resultOz = oz;
    } else {
      return res.status(400).json({ error: 'Invalid weight input' });
    }

    res.json({
      lbs: resultLbs,
      oz: resultOz,
      kg: resultKg
    });
  } catch (error) {
    console.error('Weight conversion error:', error);
    res.status(500).json({ error: 'Weight conversion failed' });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// SERVE FRONTEND
// ============================================================================

// Serve React frontend for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              🍼 Baby Sweep Server Running 🍼              ║
║                                                           ║
║  Server:    http://localhost:${PORT}                      ║
║  Health:    http://localhost:${PORT}/api/health           ║
║                                                           ║
║  Database:  SQLite (./data/babysweep.db)                 ║
║  Ready:     Accepting connections                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
