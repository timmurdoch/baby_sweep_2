# 🎨 Baby Sweep - Visual Preview & UI Documentation

Text-based mockups and descriptions of the user interface layout and design.

## 🎯 Design Philosophy

- **Clean and Modern:** Subtle gradients, soft shadows, contemporary aesthetics
- **Mobile-First:** Designed for phones, scales up beautifully to desktop
- **Accessible:** WCAG AA compliant color contrasts, keyboard navigation
- **Intuitive:** Clear visual hierarchy, familiar patterns
- **Family-Friendly:** Warm colors, playful without being childish

---

## 🎨 Color Scheme

### Primary Colors
```
Primary Blue:    #4A90E2  ████ (Buttons, highlights, links)
Boy Color:       #4A90E2  ████ (Blue badge, calendar events)
Girl Color:      #FF69B4  ████ (Pink badge, calendar events)
Surprise Color:  #9370DB  ████ (Purple badge, calendar events)
```

### Supporting Colors
```
Success:         #4CAF50  ████ (Success messages)
Error:           #F44336  ████ (Error messages, validation)
Text Primary:    #333333  ████ (Main text)
Text Secondary:  #666666  ████ (Supporting text)
Border:          #E0E0E0  ████ (Borders, dividers)
Background:      #F8F9FA  ████ (Page background)
White:           #FFFFFF  ████ (Cards, modals)
```

### Gradient Background
```
Linear gradient from top-left to bottom-right:
  From: #F5F7FA (very light blue-gray)
  To:   #E8F0FE (soft blue)
```

---

## 📱 Responsive Breakpoints

```
Mobile:     < 768px   (Single column, stacked layout)
Tablet:     768-1024px (2-column guess grid)
Desktop:    > 1024px  (3-column guess grid, spacious)
```

---

## 🖥️ Screen Layouts

### 1. Login Screen

```
┌─────────────────────────────────────────────┐
│                                             │
│              [Gradient Background]          │
│                                             │
│         ┌───────────────────────┐           │
│         │                       │           │
│         │   🍼 Baby Sweep       │           │
│         │                       │           │
│         │ Welcome to our Baby   │           │
│         │ Sweep! Make your      │           │
│         │ guess about when      │           │
│         │ our little one will   │           │
│         │ arrive.               │           │
│         │                       │           │
│         │  Password             │           │
│         │  [________________]   │           │
│         │                       │           │
│         │  [    Enter    ]      │           │
│         │                       │           │
│         └───────────────────────┘           │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

**Elements:**
- Centered white card with shadow
- Large emoji (🍼) as branding
- Title: "Baby Sweep" (2rem, primary color, bold)
- Welcome message (customizable)
- Password input field (large, clear)
- Submit button (full width, primary color)
- Subtle hover effects

**Mobile Adjustments:**
- Card takes 90% width
- Padding reduced
- Touch-friendly 44px+ button height

---

### 2. Main Application Header

```
┌─────────────────────────────────────────────┐
│                                             │
│           🍼 Baby Sweep                     │
│           Make your guess!                  │
│                                             │
│   ┌──────────┬──────────┬──────────┐       │
│   │ Make a   │ Calendar │ All      │       │
│   │ Guess    │ View     │ Guesses  │       │
│   │ (Active) │          │ (25)     │       │
│   └──────────┴──────────┴──────────┘       │
│                                             │
│   [Logout]                                  │
│                                             │
└─────────────────────────────────────────────┘
```

**Elements:**
- App title (3rem on desktop, 2rem mobile)
- Subtitle (encouraging text)
- Navigation tabs (pill-style)
  - Active tab: highlighted bottom border
  - Hover: light background
- Logout button (top-right corner)

**Mobile Adjustments:**
- Tabs stack or compress
- Smaller font sizes
- Collapsible on very small screens

---

### 3. Make a Guess Form

```
┌─────────────────────────────────────────────┐
│  Submit Your Guess                          │
│                                             │
│  Your Name *                                │
│  [_____________________]                    │
│                                             │
│  Your Email *                               │
│  [_____________________]                    │
│                                             │
│  Gender Guess *                             │
│  ⚪ Boy  ⚪ Girl  ⚪ Surprise                │
│                                             │
│  Birth Date *                               │
│  [_____|_______|_______]  (date picker)     │
│                                             │
│  Birth Time *                               │
│  [▼ Select a time    ]                      │
│                                             │
│  Weight *                                   │
│  [lbs / oz]  [  kg  ]                       │
│  Pounds      Ounces       or    Kilograms   │
│  [___]   +   [___]               [_____]    │
│  = 7 lbs 8 oz = 3.4 kg                      │
│                                             │
│  [      Submit Guess      ]                 │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Click time slots to create a block guess   │
│                                             │
│  [       Calendar Component       ]         │
│                                             │
└─────────────────────────────────────────────┘
```

**Elements:**
- White card container
- All labels with asterisk (*) for required
- Text inputs: rounded corners, border on focus
- Radio buttons: large, easy to click
- Date picker: native browser control
- Time dropdown: generated based on TIME_BLOCK_MINUTES
- Weight section:
  - Toggle buttons for unit selection
  - Dual input (lbs/oz or kg)
  - Real-time conversion display
- Submit button: full width, prominent
- Mini calendar below form for block selection

**Validation:**
- Red border on invalid fields
- Error messages below fields
- Disabled submit until valid

---

### 4. Calendar View

```
┌─────────────────────────────────────────────┐
│  All Guesses Calendar                       │
│                                             │
│  [◄]  [Month ▼]  [Week]  [Day]  [Today] [►]│
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Sun  Mon  Tue  Wed  Thu  Fri  Sat   │   │
│  ├─────────────────────────────────────┤   │
│  │  1    2    3    4    5    6    7    │   │
│  │                     [John 2PM] ████  │   │
│  │  8    9   10   11   12   13   14    │   │
│  │ [Sue] [Mike]  [Jane 9AM] ████ ████   │   │
│  │ 10AM  3PM                            │   │
│  │ 15   16   17   18   19   20   21    │   │
│  │                [Sarah]               │   │
│  │                4:30PM ████           │   │
│  │ 22   23   24   25   26   27   28    │   │
│  │                                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ████ Boy   ████ Girl   ████ Surprise       │
│                                             │
└─────────────────────────────────────────────┘
```

**Elements:**
- Calendar toolbar (navigation, view switcher)
- Color-coded events:
  - Blue for Boy guesses
  - Pink for Girl guesses
  - Purple for Surprise guesses
- Event labels show name and time
- Clickable events open detail modal
- Legend at bottom
- Responsive: scrolls on mobile

---

### 5. All Guesses Grid

```
┌─────────────────────────────────────────────┐
│  All Submitted Guesses                      │
│                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────┐│
│  │ John Doe   │  │ Jane Smith │  │ Mike   ││
│  │ john@ex.com│  │ jane@ex.com│  │ mike@..││
│  │         BOY│  │        GIRL│  │ SURPRISE│
│  │            │  │            │  │        ││
│  │ Date:      │  │ Date:      │  │ Date:  ││
│  │ Dec 15,2025│  │ Dec 16,2025│  │ Dec 20 ││
│  │            │  │            │  │        ││
│  │ Time:      │  │ Time:      │  │ Time:  ││
│  │ 2:30 PM    │  │ 9:00 AM    │  │ 11:30PM││
│  │            │  │            │  │ [BLOCK]││
│  │ Weight:    │  │ Weight:    │  │ Weight:││
│  │ 7lb 8oz    │  │ 8lb 2oz    │  │ 7lb 4oz││
│  │ (3.4kg)    │  │ (3.7kg)    │  │ (3.3kg)││
│  │            │  │            │  │        ││
│  │ Submitted: │  │ Submitted: │  │ Submit.││
│  │ Jan 10 @   │  │ Jan 11 @   │  │ Jan 12 ││
│  │ 3:45 PM    │  │ 9:20 AM    │  │ 1:15PM ││
│  └────────────┘  └────────────┘  └────────┘│
│                                             │
│  ┌────────────┐  ┌────────────┐            │
│  │ Sarah Lee  │  │ Tom Brown  │            │
│  │ ...        │  │ ...        │            │
│  └────────────┘  └────────────┘            │
│                                             │
└─────────────────────────────────────────────┘
```

**Elements:**
- Grid layout (responsive columns)
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
- Each card:
  - White background
  - Subtle shadow
  - Hover effect (lift + shadow)
  - Name (large, bold)
  - Email (smaller, gray)
  - Gender badge (color-coded, top-right)
  - Details grid (label/value pairs)
  - Block indicator badge if applicable
  - Timestamp (bottom, right-aligned, small, gray)

---

### 6. Guess Detail Modal

```
        ┌─────────────────────────┐
        │ Guess Details       [×] │
        ├─────────────────────────┤
        │                         │
        │ Name:                   │
        │ John Doe                │
        │                         │
        │ Email:                  │
        │ john@example.com        │
        │                         │
        │ Gender:                 │
        │ [BOY]                   │
        │                         │
        │ Date:                   │
        │ December 15, 2025       │
        │                         │
        │ Time:                   │
        │ 2:30 PM                 │
        │                         │
        │ Time Blocks:            │
        │ 2:30 PM, 3:00 PM        │
        │                         │
        │ Weight:                 │
        │ 7 lbs 8 oz (3.4 kg)     │
        │                         │
        │ Submitted:              │
        │ Jan 10, 2025 @ 3:45 PM  │
        │                         │
        └─────────────────────────┘
```

**Elements:**
- Centered overlay (dark transparent background)
- White modal card
- Close button (×) top-right
- Same detail layout as cards
- Click outside to close
- Animation: slide up + fade in

---

## 🎭 Interactive States

### Button States

```
Normal:     [  Submit Guess  ]  (Primary color, white text)
Hover:      [  Submit Guess  ]  (Darker, slight lift, larger shadow)
Active:     [  Submit Guess  ]  (Even darker, pressed effect)
Disabled:   [  Submit Guess  ]  (Gray, faded, no pointer)
Loading:    [    ⟳ ...      ]  (Spinner animation)
```

### Input States

```
Normal:     [____________]  (Gray border)
Focus:      [____________]  (Primary color border, blue glow)
Error:      [____________]  (Red border)
            ⚠ Error message here
Valid:      [____________]  (Green border, optional checkmark)
```

### Navigation Tab States

```
Inactive:   [ Make a Guess ]  (Gray text, transparent)
Hover:      [ Make a Guess ]  (Primary color text, light bg)
Active:     [ Make a Guess ]  (Primary color text, bottom border)
```

---

## 📐 Spacing & Typography

### Spacing Scale
```
XS:  5px   (tight spacing)
SM:  10px  (small gaps)
MD:  20px  (default gaps)
LG:  30px  (section spacing)
XL:  40px  (major sections)
```

### Typography Scale
```
Body:         1rem (16px)    - Main text
Small:        0.85rem (14px) - Helper text, timestamps
Button:       1rem (16px)    - Button labels
Label:        0.95rem (15px) - Form labels
H3:           1.3rem (21px)  - Card titles
H2:           1.5rem (24px)  - Section headers
H1 (mobile):  2rem (32px)    - App title mobile
H1 (desktop): 2.5-3rem       - App title desktop
```

### Font Family
```
Primary: -apple-system, BlinkMacSystemFont, 'Segoe UI',
         'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
         'Fira Sans', 'Droid Sans', 'Helvetica Neue',
         sans-serif
```

---

## 🎬 Animations

### Transitions
```
Fast:    0.15s ease  (Hover effects)
Normal:  0.3s ease   (Most transitions)
Slow:    0.5s ease   (Major state changes)
```

### Animations
- **Spinner:** Infinite rotation, 0.6s linear
- **Modal:** Slide up + fade in, 0.3s ease
- **Alert:** Slide down + fade in, 0.3s ease
- **Card Hover:** Lift (translateY -2px) + shadow increase

---

## 🌈 Gender Badges

```
Boy Badge:       [  BOY  ]  ████ Blue background, white text
Girl Badge:      [ GIRL ]  ████ Pink background, white text
Surprise Badge:  [SURPRISE] ████ Purple background, white text
```

Style: Rounded pill shape, uppercase text, small font, bold

---

## 📋 Form Layout Patterns

### Stacked (Mobile)
```
Label
[Input field - full width]

Label
[Input field - full width]
```

### Side-by-side (Desktop)
```
[Label]  [Input field]  [Label]  [Input field]
```

### Weight Input (Special)
```
Mobile:
  Pounds
  [____]
  Ounces
  [____]
  Kilograms
  [____]

Desktop:
  Pounds  +  Ounces     or    Kilograms
  [____]     [____]            [____]
```

---

## 🎨 Card Shadow Hierarchy

```
Resting:  0 2px 4px rgba(0,0,0,0.1)
Hover:    0 4px 8px rgba(0,0,0,0.15)
Modal:    0 8px 16px rgba(0,0,0,0.2)
```

---

## 📱 Mobile Optimizations

### Touch Targets
- Minimum 44x44px for all interactive elements
- Increased padding on buttons
- Larger form inputs

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### Font Scaling
- Uses rem units (respects user font size preferences)
- Minimum body font: 16px (prevents zoom on iOS)

### Scroll Behavior
- Smooth scrolling
- Sticky header (optional)
- Calendar scrolls horizontally if needed

---

## 🎯 Accessibility Features

- **Keyboard Navigation:** Tab through all interactive elements
- **Focus Indicators:** Visible outline on focus
- **ARIA Labels:** Screen reader support
- **Color Contrast:** 4.5:1 minimum (WCAG AA)
- **Alternative Text:** All images have alt text
- **Error Messages:** Associated with form fields
- **Skip Links:** Jump to main content

---

## 🖼️ Empty States

### No Guesses Yet
```
        🤷
    No guesses yet!
 Be the first to make a guess.
```

### Loading State
```
        ⟳
    Loading...
```

### Error State
```
        ⚠️
    Something went wrong
  Please try again later
```

---

## 💡 Visual Hierarchy

1. **Primary Actions** (Submit, Login)
   - Large, colored buttons
   - High contrast

2. **Content** (Guess cards, form fields)
   - White/light backgrounds
   - Clear labels

3. **Navigation** (Tabs, links)
   - Subtle until active/hover
   - Clear indication of current location

4. **Supporting Info** (Timestamps, help text)
   - Smaller, gray text
   - De-emphasized

---

## 🎨 Theme Customization

Users can customize via `PRIMARY_COLOR` environment variable:

```
Default:  #4A90E2 (Blue)
Pink:     #FF69B4
Purple:   #9370DB
Green:    #20B2AA
Red:      #FF6347
```

This affects:
- Buttons
- Links
- Active tab indicators
- Focus states
- "Today" calendar highlight

Does NOT affect:
- Gender badge colors (always blue/pink/purple)
- Error/success colors

---

## 📊 Data Visualization

### Calendar Density
- Low density: 1-3 guesses per day (easy to read)
- Medium: 4-8 guesses per day (still readable)
- High: 9+ guesses per day (events overlap, click to expand)

### Guess Distribution
Could show (Phase 2):
- Bar chart: Guesses per day
- Pie chart: Gender breakdown
- Timeline: Submission over time

---

## ✨ Polish Details

- **Subtle gradients** on backgrounds
- **Smooth transitions** on all interactions
- **Micro-animations** (button press, card hover)
- **Loading states** for all async operations
- **Success animations** after form submission
- **Error shake** on validation failure
- **Skeleton screens** while loading (Phase 2)

---

## 🎬 User Flow Visualizations

### First-Time User Journey

```
1. Land on login page
   → See welcoming message
   → Enter password

2. First view: "Make a Guess" tab
   → Empty form, clear labels
   → Mini calendar below

3. Fill out form
   → Real-time weight conversion
   → Validation feedback

4. Submit
   → Success message
   → Redirected to "All Guesses"

5. See their guess
   → In card grid
   → On calendar
```

### Returning User Journey

```
1. Check localStorage for token
   → If valid, auto-login
   → If invalid, show login

2. Land on last viewed tab

3. See updated guess count

4. Browse guesses/calendar
```

---

## 🎉 Delight Moments

- **Login:** Smooth fade-in of main app
- **Submit:** Confetti animation (Phase 2)
- **First Guess:** Special "First!" badge (Phase 2)
- **Calendar:** Smooth month transitions
- **Hover:** Gentle lift on cards
- **Success:** Green checkmark animation

---

**Note:** This is a text representation. The actual application renders with full CSS styling, responsive breakpoints, and interactive JavaScript. All designs follow modern web standards and best practices.
