const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'babysweep.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

/**
 * Initialize database schema
 */
function initializeDatabase() {
  // Create settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT
    )
  `);

  // Create guesses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS guesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      gender TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      birth_time TEXT NOT NULL,
      weight_lbs INTEGER,
      weight_oz INTEGER,
      weight_kg REAL,
      amount_paid REAL DEFAULT 0,
      is_block_guess INTEGER DEFAULT 0,
      time_blocks TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_session_token ON sessions(session_token);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_guesses_created_at ON guesses(created_at);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_guesses_birth_date ON guesses(birth_date);
  `);

  console.log('✓ Database schema initialized');
}

/**
 * Initialize default settings
 */
function initializeSettings() {
  const defaultSettings = [
    { key: 'app_password', value: null }, // Will be set on first run
    { key: 'due_date', value: process.env.DUE_DATE || '2025-12-31' },
    { key: 'welcome_text', value: process.env.WELCOME_TEXT || 'Welcome to our Baby Sweep! Make your guess about when our little one will arrive.' },
    { key: 'time_block_minutes', value: process.env.TIME_BLOCK_MINUTES || '30' },
    { key: 'max_block_selection_minutes', value: process.env.MAX_BLOCK_SELECTION_MINUTES || '60' },
    { key: 'include_surprise_gender', value: process.env.INCLUDE_SURPRISE_GENDER || 'true' },
    { key: 'allow_duplicates', value: process.env.ALLOW_DUPLICATES || 'false' },
    { key: 'primary_color', value: process.env.PRIMARY_COLOR || '#4A90E2' }
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);

  for (const setting of defaultSettings) {
    insertSetting.run(setting.key, setting.value);
  }

  // Hash and set app password if not already set
  const passwordRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('app_password');
  if (!passwordRow || !passwordRow.value) {
    const plainPassword = process.env.APP_PASSWORD || 'babysweep2025';
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);
    db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(hashedPassword, 'app_password');
    console.log('✓ App password initialized (default: babysweep2025)');
  }

  console.log('✓ Settings initialized');
}

/**
 * Get all settings as key-value object
 */
function getAllSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

/**
 * Get a single setting by key
 */
function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

/**
 * Update a setting
 */
function updateSetting(key, value) {
  return db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(value, key);
}

/**
 * Create a new session
 */
function createSession(sessionToken, expiresAt) {
  return db.prepare(`
    INSERT INTO sessions (session_token, expires_at) VALUES (?, ?)
  `).run(sessionToken, expiresAt);
}

/**
 * Get session by token
 */
function getSession(sessionToken) {
  return db.prepare(`
    SELECT * FROM sessions WHERE session_token = ? AND expires_at > datetime('now')
  `).get(sessionToken);
}

/**
 * Delete expired sessions (cleanup)
 */
function cleanupExpiredSessions() {
  return db.prepare(`
    DELETE FROM sessions WHERE expires_at <= datetime('now')
  `).run();
}

/**
 * Create a new guess
 */
function createGuess(guessData) {
  return db.prepare(`
    INSERT INTO guesses (
      name, email, gender, birth_date, birth_time,
      weight_lbs, weight_oz, weight_kg,
      is_block_guess, time_blocks, amount_paid
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    guessData.name,
    guessData.email,
    guessData.gender,
    guessData.birth_date,
    guessData.birth_time,
    guessData.weight_lbs,
    guessData.weight_oz,
    guessData.weight_kg,
    guessData.is_block_guess || 0,
    guessData.time_blocks || null,
    guessData.amount_paid || 0
  );
}

/**
 * Get all guesses
 */
function getAllGuesses() {
  return db.prepare(`
    SELECT * FROM guesses ORDER BY created_at DESC
  `).all();
}

/**
 * Check if a guess already exists for a specific date and time
 */
function guessExists(birthDate, birthTime) {
  const row = db.prepare(`
    SELECT COUNT(*) as count FROM guesses
    WHERE birth_date = ? AND birth_time = ?
  `).get(birthDate, birthTime);
  return row.count > 0;
}

/**
 * Get guess count by date
 */
function getGuessesByDate() {
  const guesses = getAllGuesses();
  const byDate = {};

  for (const guess of guesses) {
    const date = guess.birth_date;
    if (!byDate[date]) {
      byDate[date] = { total: 0, boy: 0, girl: 0, surprise: 0 };
    }
    byDate[date].total++;
    byDate[date][guess.gender.toLowerCase()]++;
  }

  return byDate;
}

// Initialize database on module load
initializeDatabase();
initializeSettings();

// Cleanup expired sessions on startup
cleanupExpiredSessions();

// Export database instance and functions
module.exports = {
  db,
  getAllSettings,
  getSetting,
  updateSetting,
  createSession,
  getSession,
  cleanupExpiredSessions,
  createGuess,
  getAllGuesses,
  guessExists,
  getGuessesByDate
};
