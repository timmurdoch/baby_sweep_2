# 🚀 Baby Sweep - Phase 2 Roadmap

Future enhancements and features beyond the MVP. Document for planning purposes only - not yet implemented.

## 📋 Overview

Phase 1 (MVP) provides a solid, working baby pool application. Phase 2 enhancements will add:
- Advanced features
- Admin capabilities
- Analytics and insights
- Enhanced user experience
- Revenue features (optional)

**Important:** All Phase 2 features are proposed additions. Implement based on user feedback and needs.

---

## 🎯 Phase 2 Priority Categories

### 🔥 High Priority
Features that significantly improve usability or solve common pain points.

### 📊 Medium Priority
Nice-to-have features that enhance the experience.

### 💡 Low Priority
Future ideas that could be explored later.

---

## 🔐 Admin Panel (High Priority)

### Overview
Separate authentication and interface for hosts to manage their baby pool.

### Features

**Admin Dashboard**
- Total guesses count
- Gender breakdown (pie chart)
- Guesses by date (bar chart)
- Recent activity feed
- Quick stats (average weight guess, most popular date, etc.)

**Admin Authentication**
- Separate admin password (stronger security)
- Admin-only routes `/admin/*`
- Session-based authentication
- Configurable session timeout

**Guess Management**
- View all guesses in detailed table
- Edit individual guesses (fix typos)
- Delete inappropriate guesses
- Export functions (covered below)
- Mark winner(s) manually or automatically

**Settings Management**
- Change password via UI (no need to edit .env)
- Update due date
- Toggle features (duplicates, surprise gender)
- Change time block settings
- Update welcome message
- Preview changes before applying

**Announcement System**
- Post announcements to all users
- "Baby has arrived!" notification
- Winner announcement
- Custom messages

**Technical Implementation**
```javascript
// New database table
CREATE TABLE admins (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

// New routes
POST /api/admin/login
GET /api/admin/dashboard
GET /api/admin/guesses (with edit/delete capabilities)
PUT /api/admin/guesses/:id
DELETE /api/admin/guesses/:id
POST /api/admin/settings
GET /api/admin/analytics
```

---

## 📊 Enhanced Analytics & Statistics (High Priority)

### Overview
Rich data visualization and insights about guess patterns.

### Features

**Visual Charts**
- Gender prediction pie chart
- Guesses per day bar chart
- Weight distribution histogram
- Time of day heatmap
- Cumulative guesses over time (line chart)

**Statistics Dashboard**
- Average guessed weight
- Most popular date
- Most popular time
- Gender split percentage
- Earliest/latest guesses
- Block guess percentage

**Comparisons**
- Individual vs. group average
- Boy guesses vs. Girl guesses (average weight, date, time)
- First vs. last guesses

**Technical Implementation**
```javascript
// Use Chart.js or similar
import { Chart } from 'chart.js';

// New API endpoint
GET /api/analytics/summary
GET /api/analytics/charts/:type

// Response format
{
  genderBreakdown: { boy: 45, girl: 52, surprise: 3 },
  averageWeight: { lbs: 7, oz: 8, kg: 3.4 },
  popularDate: "2025-06-15",
  popularTime: "14:30",
  // ... more stats
}
```

---

## 🏆 Winner Calculation (High Priority)

### Overview
Automatically determine winner(s) based on actual birth details.

### Features

**Winner Input Form**
- Admin enters actual birth details
- Date, time, gender, weight
- Optional: Length, other details

**Calculation Methods**
- **Closest Overall:** Weighted score across all fields
- **Perfect Match:** All fields must match exactly
- **Category Winners:** Winner for each category (date, time, weight, gender)
- **Points System:** Configurable points per field

**Scoring Algorithm**
```javascript
// Example weighted scoring
function calculateScore(guess, actual) {
  let score = 0;

  // Date (30 points max - 1 point per day off)
  const daysDiff = Math.abs(daysBetween(guess.date, actual.date));
  score += Math.max(0, 30 - daysDiff);

  // Time (30 points max - 1 point per hour off)
  const hoursDiff = Math.abs(hoursBetween(guess.time, actual.time));
  score += Math.max(0, 30 - hoursDiff);

  // Weight (20 points max - 1 point per oz off)
  const ozDiff = Math.abs(guess.weightOz - actual.weightOz);
  score += Math.max(0, 20 - ozDiff);

  // Gender (20 points - all or nothing)
  if (guess.gender === actual.gender) score += 20;

  return score;
}
```

**Winner Display**
- Leaderboard showing top 10
- Winner badge on profile
- Share winner announcement
- Winner certificate (PDF export)

**Technical Implementation**
```javascript
// New database table
CREATE TABLE actual_birth (
  id INTEGER PRIMARY KEY,
  birth_date TEXT NOT NULL,
  birth_time TEXT NOT NULL,
  gender TEXT NOT NULL,
  weight_lbs INTEGER,
  weight_oz INTEGER,
  weight_kg REAL,
  announced_at TEXT DEFAULT CURRENT_TIMESTAMP
);

// New routes
POST /api/admin/announce-birth
GET /api/winners
GET /api/leaderboard
```

---

## 💳 Payment Integration (Medium Priority)

### Overview
Allow hosts to charge entry fees and track payments.

### Features

**Payment Configuration**
- Set entry fee per guess
- Multiple pricing tiers:
  - Standard guess: $5
  - Block guess (2 slots): $10
  - Block guess (3+ slots): $15
- Payment methods: Venmo, PayPal, Cash App, Stripe
- Track payment status per guess

**Payment Tracking**
- Mark guesses as paid/unpaid
- Filter guesses by payment status
- Total collected amount
- Outstanding payments report
- Payment reminders (Phase 3)

**Prize Pool Display**
- Show current prize pool
- Automatic calculation (total paid - host cut)
- Display on main page
- Increase excitement

**Integration Options**
- **Stripe:** Full integration, automated
- **PayPal:** Button/link per guess
- **Manual:** Host tracks payments, marks in admin panel
- **Venmo/Cash App:** Request links generated

**Technical Implementation**
```javascript
// Add to guesses table
ALTER TABLE guesses ADD COLUMN amount_paid REAL DEFAULT 0;
ALTER TABLE guesses ADD COLUMN payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE guesses ADD COLUMN payment_method TEXT;
ALTER TABLE guesses ADD COLUMN payment_id TEXT;

// New settings
price_per_guess: 5.00
price_per_block_slot: 2.50
payment_enabled: true
stripe_public_key: pk_...
```

---

## 📤 Enhanced Exports (Medium Priority)

### Overview
Export guess data in various formats for analysis and sharing.

### Formats

**CSV Export**
- All guesses with headers
- Opens in Excel/Google Sheets
- Use case: Data analysis, printing

**Excel (XLSX)**
- Formatted spreadsheet
- Multiple sheets (guesses, stats, summary)
- Charts included
- Professional appearance

**PDF Report**
- Printable guess list
- Includes statistics
- Formatted for sharing
- Option: Individual guess certificates

**JSON Export**
- Raw data export
- For developers/API users
- Includes all fields

**Email List**
- Extract just email addresses
- For thank you notes
- Announcement distribution

**Technical Implementation**
```javascript
// Use libraries
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

// New routes
GET /api/export/csv
GET /api/export/xlsx
GET /api/export/pdf
GET /api/export/json
GET /api/export/emails
```

---

## 📧 Email Notifications (Medium Priority)

### Overview
Automated email notifications for key events.

### Features

**Notification Types**
- Confirmation email after guess submission
- Reminder emails (e.g., "Baby due soon!")
- Winner announcement
- Host notifications (new guess received)

**Email Templates**
- Customizable HTML templates
- Include guess details
- Personalized greeting
- Branding options

**Email Service Integration**
- SendGrid
- Mailgun
- AWS SES
- SMTP server

**Configuration**
- Enable/disable per notification type
- Customize email content
- Set sending schedule
- Test email function

**Technical Implementation**
```javascript
// New dependencies
import nodemailer from 'nodemailer';

// New settings
email_enabled: true
email_from: "noreply@babysweep.com"
email_from_name: "Baby Sweep"
smtp_host: "smtp.example.com"
smtp_port: 587
smtp_user: "user"
smtp_pass: "pass"

// Send confirmation
async function sendConfirmationEmail(guess) {
  const mailOptions = {
    from: '"Baby Sweep" <noreply@babysweep.com>',
    to: guess.email,
    subject: 'Your Guess Has Been Received!',
    html: renderTemplate('confirmation', { guess })
  };
  await transporter.sendMail(mailOptions);
}
```

---

## 👤 User Profiles (Low Priority)

### Overview
Optional individual accounts for users instead of shared password.

### Features

**User Registration**
- Create account with email/password
- Or continue as guest with shared password
- Social login (Google, Facebook)

**User Profile**
- View own guesses
- Edit profile information
- Guess history (if multiple babies)
- Win/loss record

**Benefits**
- Users can submit multiple guesses
- Track guess history across multiple baby pools
- Personalized experience
- Better security

**Trade-offs**
- More complexity
- Barrier to entry
- Not needed for casual family use

---

## 🎨 Theme Customization UI (Medium Priority)

### Overview
Let hosts customize appearance via web interface.

### Features

**Color Picker**
- Choose primary color
- Preview in real-time
- Preset themes (blue, pink, purple, green, sunset)

**Custom Branding**
- Upload logo
- Set app name
- Customize welcome message
- Footer text

**Layout Options**
- Light/dark mode
- Compact/spacious layout
- Font size options

**Technical Implementation**
```javascript
// Store in database
CREATE TABLE theme_settings (
  id INTEGER PRIMARY KEY,
  primary_color TEXT,
  logo_url TEXT,
  app_name TEXT,
  theme_mode TEXT DEFAULT 'light',
  layout_density TEXT DEFAULT 'normal'
);

// Apply via CSS variables
:root {
  --primary-color: ${themeSettings.primary_color};
  --logo: url(${themeSettings.logo_url});
}
```

---

## 📱 Mobile App (Low Priority)

### Overview
Native mobile app for iOS and Android.

### Benefits
- Push notifications
- Offline support
- Better mobile performance
- App store presence

### Technology Options
- **React Native:** Reuse code from React web app
- **Flutter:** New codebase, but excellent performance
- **PWA:** Convert existing web app to Progressive Web App

### Features
- All web features
- Push notifications for:
  - New guesses
  - Winner announcement
  - Baby arrival
- Offline mode (view guesses without internet)
- Share guess via social media

---

## 🔗 Social Sharing (Medium Priority)

### Overview
Easy sharing on social media platforms.

### Features

**Share Buttons**
- Share guess on Facebook, Twitter, Instagram
- "I just made my guess!" template
- Include link to pool
- Custom message

**Open Graph Tags**
- Preview card when link shared
- Shows baby pool name, guess count
- Attractive preview image

**QR Code**
- Generate QR code for baby pool URL
- Print on invitations
- Easy mobile access

**Embeddable Widget**
- Iframe embed for personal websites
- Shows guess count, countdown
- Links to full app

**Technical Implementation**
```javascript
// Add to <head>
<meta property="og:title" content="Baby Sweep for Sarah & Mike" />
<meta property="og:description" content="Make your guess!" />
<meta property="og:image" content="/preview-image.jpg" />

// Share API
POST /api/share/facebook
POST /api/share/twitter

// QR Code generation
import QRCode from 'qrcode';
GET /api/qr-code
```

---

## 🌍 Internationalization (Low Priority)

### Overview
Support multiple languages for international families.

### Features

**Supported Languages**
- English (default)
- Spanish
- French
- German
- Mandarin
- And more...

**Translation System**
- All UI text translatable
- Date/time localization
- Weight unit preferences (metric vs imperial by region)
- Right-to-left language support (Arabic, Hebrew)

**Technical Implementation**
```javascript
// Use react-i18next
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  return <h1>{t('welcome')}</h1>;
}

// Translation files
// en.json
{
  "welcome": "Welcome to Baby Sweep!",
  "submit": "Submit Guess"
}

// es.json
{
  "welcome": "¡Bienvenido a Baby Sweep!",
  "submit": "Enviar Predicción"
}
```

---

## 🎮 Gamification (Low Priority)

### Overview
Add game-like elements to increase engagement.

### Features

**Points System**
- Earn points for guessing
- Bonus points for referring friends
- Early bird points
- Accuracy badges

**Achievements**
- "First Guess" badge
- "Wildcard" (picked unusual date)
- "Precision" (narrowest time range)
- "Optimist" (earliest date)
- "Patient" (latest date)

**Leaderboard**
- Real-time ranking
- Based on points or likelihood score
- Seasonal/all-time leaders

**Rewards**
- Unlock special themes
- Virtual trophies
- Bragging rights

---

## 📊 Multiple Baby Pools (Low Priority)

### Overview
Host can run multiple baby pools from one installation.

### Features

**Multi-Pool Management**
- Create new pool for each baby
- Unique URL/code per pool
- Separate guesses, settings per pool
- Archive old pools

**Pool Templates**
- Save settings as templates
- Quick setup for next baby
- Copy guesses from one pool to another (for testing)

**Cross-Pool Features**
- Shared user accounts
- Combined statistics
- Portfolio view of all pools

**Technical Implementation**
```javascript
// New database table
CREATE TABLE pools (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  archived INTEGER DEFAULT 0
);

// Add pool_id to guesses
ALTER TABLE guesses ADD COLUMN pool_id INTEGER REFERENCES pools(id);

// New routes
GET /pools
POST /pools
GET /pools/:slug
DELETE /pools/:id
```

---

## 🔔 Real-Time Updates (Medium Priority)

### Overview
See new guesses without refreshing.

### Features

**Live Updates**
- WebSocket connection
- New guess appears instantly for all users
- Real-time guess count
- "Someone is guessing..." indicator

**Presence**
- See how many people are online
- "X people viewing" counter

**Live Feed**
- Activity feed showing recent actions
- "John just guessed Boy!"
- "Jane updated her guess"

**Technical Implementation**
```javascript
// Add WebSocket support
import { Server } from 'socket.io';

const io = new Server(server);

io.on('connection', (socket) => {
  socket.on('new-guess', (guess) => {
    io.emit('guess-added', guess);
  });
});

// Client side
import io from 'socket.io-client';

const socket = io('http://localhost:3001');
socket.on('guess-added', (guess) => {
  addGuessToList(guess);
});
```

---

## 🎁 Gift Registry Integration (Low Priority)

### Overview
Link to baby registry or wishlist.

### Features

**Registry Links**
- Add links to Amazon, Target, Babylist
- Display on main page
- "Shop the registry" button

**Wish List**
- Built-in simple wish list
- Items, links, claimed status

---

## 🧪 Advanced Features (Low Priority)

### Duplicate Account Detection
- Prevent same person from guessing multiple times
- Email/name matching
- IP address tracking (optional)

### Guess Editing
- Allow users to edit their guess (before baby arrives)
- Track edit history
- Deadline for edits

### Private Guesses
- Allow users to make guesses private
- Only visible after baby arrives
- "Sealed envelope" concept

### Confidence Interval
- Users rate confidence (1-10)
- Factor into scoring
- "Most Confident" award

### Photo Upload
- Upload photo with guess
- Baby photo guessing
- Photo gallery of participants

### Comments
- Add comments to guesses
- Discussion thread
- Encouragement messages

### Weather Integration
- Show historical weather on guessed dates
- "What will the weather be like?"

### Astrology
- Display zodiac sign for guessed dates
- "Most popular sign" statistic

---

## 🚀 Implementation Priority

### Immediate (Phase 2.1)
1. Admin Panel
2. Winner Calculation
3. Enhanced Analytics

### Near-Term (Phase 2.2)
1. Export to CSV/Excel
2. Email Notifications
3. Real-Time Updates

### Future (Phase 2.3+)
1. Payment Integration
2. Mobile App
3. Multiple Baby Pools
4. Social Sharing
5. Everything else

---

## 💡 Community-Requested Features

As users provide feedback, track requested features here:

- [ ] Feature request #1
- [ ] Feature request #2
- [ ] Feature request #3

---

## 🛠️ Technical Debt & Refactoring

### Backend Improvements
- Add API rate limiting
- Implement proper logging (Winston, Bunyan)
- Add health monitoring (Prometheus, Grafana)
- Database migrations system
- Unit tests (Jest)
- Integration tests
- API documentation (Swagger/OpenAPI)

### Frontend Improvements
- Component testing (React Testing Library)
- E2E tests (Cypress, Playwright)
- Performance optimization (code splitting, lazy loading)
- Accessibility audit
- SEO optimization
- Progressive Web App features

### DevOps
- CI/CD pipeline (GitHub Actions, GitLab CI)
- Automated testing
- Automated deployment
- Database backups to cloud (S3, Google Cloud Storage)
- Monitoring and alerting
- Log aggregation

---

## 📝 Notes for Contributors

### How to Add Phase 2 Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/admin-panel
   ```

2. **Follow existing patterns**
   - Use same code style
   - Follow existing folder structure
   - Maintain backward compatibility

3. **Test thoroughly**
   - Write tests
   - Test on multiple devices
   - Check accessibility

4. **Document**
   - Update README if needed
   - Add comments to complex code
   - Update ENV_CONFIGURATION.md for new settings

5. **Submit PR**
   - Clear description
   - Screenshots/videos if UI changes
   - Link to related issues

### Feature Flags

For gradual rollout, use feature flags:

```javascript
// In .env
ENABLE_ADMIN_PANEL=false
ENABLE_PAYMENTS=false
ENABLE_ANALYTICS=true

// In code
if (process.env.ENABLE_ADMIN_PANEL === 'true') {
  // Show admin menu
}
```

---

## 🎯 Success Metrics

Track these metrics to measure Phase 2 success:

- **Engagement:** Average session duration
- **Retention:** Return visitor rate
- **Completion:** % of users who submit guess
- **Admin Adoption:** % of hosts using admin panel
- **Revenue:** Total payments (if enabled)
- **Performance:** Page load time, API response time
- **Errors:** Error rate, crash-free sessions

---

## 🤝 Contributing

Want to help implement Phase 2 features?

1. Check the [Issues page](https://github.com/yourusername/baby-sweep/issues) for "Phase 2" label
2. Comment on an issue to claim it
3. Follow contribution guidelines
4. Submit PR for review

---

**Remember:** Phase 1 is already amazing! Phase 2 features should enhance, not complicate. Focus on user value, not feature bloat. Get feedback before implementing.

🍼 Happy coding!
