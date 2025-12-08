import React, { useState, useEffect, useMemo } from 'react';
import CalendarView from './CalendarView';
import moment from 'moment';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  // ===== STATE MANAGEMENT =====
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('baby_sweep_token'));
  const [currentView, setCurrentView] = useState('form');
  const [loading, setLoading] = useState(false);
  const [welcomeText, setWelcomeText] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: 'Boy',
    birth_date: '',
    birth_time: '',
    weight_lbs: '',
    weight_oz: '',
    weight_kg: '',
    is_block_guess: false,
    time_blocks: []
  });

  // Data state
  const [guesses, setGuesses] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [settings, setSettings] = useState({});

  // UI state
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [weightUnit, setWeightUnit] = useState('imperial'); // imperial or metric
  const [timeOptions, setTimeOptions] = useState([]);

  // Login form
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // ===== COMPUTED VALUES =====

  // Calculate date range: 4 weeks either side of due date
  const dateRange = useMemo(() => {
    if (!settings.due_date) {
      return { minDate: '', maxDate: '' };
    }

    const dueDate = moment(settings.due_date);
    const minDate = dueDate.clone().subtract(4, 'weeks').format('YYYY-MM-DD');
    const maxDate = dueDate.clone().add(4, 'weeks').format('YYYY-MM-DD');

    return { minDate, maxDate };
  }, [settings.due_date]);

  // ===== EFFECTS =====

  useEffect(() => {
    if (sessionToken) {
      verifySession();
    } else {
      fetchWelcomeText();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
      fetchGuesses();
      fetchCalendarEvents();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (settings.time_block_minutes) {
      generateTimeOptions();
    }
  }, [settings]);

  // ===== AUTHENTICATION =====

  async function verifySession() {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionToken })
      });
      const data = await response.json();

      if (data.valid) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('baby_sweep_token');
        setSessionToken(null);
        fetchWelcomeText();
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      localStorage.removeItem('baby_sweep_token');
      setSessionToken(null);
      fetchWelcomeText();
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('baby_sweep_token', data.token);
        setSessionToken(data.token);
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('baby_sweep_token');
    setSessionToken(null);
    setIsAuthenticated(false);
    setGuesses([]);
    setCalendarEvents([]);
    fetchWelcomeText();
  }

  // ===== DATA FETCHING =====

  async function fetchWelcomeText() {
    try {
      const response = await fetch(`${API_URL}/api/settings/welcome`);
      const data = await response.json();
      setWelcomeText(data.welcome_text || 'Welcome to Baby Sweep!');
    } catch (error) {
      console.error('Failed to fetch welcome text:', error);
      setWelcomeText('Welcome to Baby Sweep!');
    }
  }

  async function fetchSettings() {
    try {
      const response = await fetch(`${API_URL}/api/settings`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }

  async function fetchGuesses() {
    try {
      const response = await fetch(`${API_URL}/api/guesses`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      const data = await response.json();
      setGuesses(data);
    } catch (error) {
      console.error('Failed to fetch guesses:', error);
    }
  }

  async function fetchCalendarEvents() {
    try {
      const response = await fetch(`${API_URL}/api/guesses/calendar`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      const data = await response.json();
      setCalendarEvents(data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      })));
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    }
  }

  // ===== TIME OPTIONS GENERATION =====

  function generateTimeOptions() {
    const blockMinutes = parseInt(settings.time_block_minutes || '30');
    const options = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += blockMinutes) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = moment(timeString, 'HH:mm').format('h:mm A');
        options.push({ value: timeString, label: displayTime });
      }
    }

    setTimeOptions(options);
  }

  // ===== WEIGHT CONVERSION =====

  async function convertWeight(fromUnit, values) {
    try {
      const response = await fetch(`${API_URL}/api/convert/weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Weight conversion failed:', error);
      return null;
    }
  }

  async function handleWeightChange(field, value) {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Trigger conversion after a brief delay
    if (field === 'weight_lbs' || field === 'weight_oz') {
      const lbs = parseFloat(newFormData.weight_lbs) || 0;
      const oz = parseFloat(newFormData.weight_oz) || 0;
      if (lbs > 0 || oz > 0) {
        const converted = await convertWeight('imperial', { lbs, oz });
        if (converted) {
          setFormData(prev => ({ ...prev, weight_kg: converted.kg }));
        }
      }
    } else if (field === 'weight_kg') {
      const kg = parseFloat(value);
      if (kg > 0) {
        const converted = await convertWeight('metric', { kg });
        if (converted) {
          setFormData(prev => ({
            ...prev,
            weight_lbs: converted.lbs,
            weight_oz: converted.oz
          }));
        }
      }
    }
  }

  // ===== FORM HANDLING =====

  function handleFormChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.gender ||
        !formData.birth_date || !formData.birth_time) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    if (!formData.weight_kg || formData.weight_kg <= 0) {
      showMessage('Please enter a valid weight', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/guesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          ...formData,
          time_blocks: selectedTimeSlots.length > 0 ? selectedTimeSlots : [formData.birth_time],
          is_block_guess: selectedTimeSlots.length > 1
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Guess submitted successfully!', 'success');
        // Reset form
        setFormData({
          name: '',
          email: '',
          gender: 'Boy',
          birth_date: '',
          birth_time: '',
          weight_lbs: '',
          weight_oz: '',
          weight_kg: '',
          is_block_guess: false,
          time_blocks: []
        });
        setSelectedTimeSlots([]);
        // Refresh data
        fetchGuesses();
        fetchCalendarEvents();
      } else {
        showMessage(data.error || 'Failed to submit guess', 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showMessage('Connection error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showMessage(text, type) {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  }

  // ===== CALENDAR HANDLERS =====

  function handleCalendarSlotClick(slotInfo) {
    const startTime = moment(slotInfo.start).format('HH:mm');
    const maxBlockMinutes = parseInt(settings.max_block_selection_minutes || '60');
    const blockMinutes = parseInt(settings.time_block_minutes || '30');

    // Add the selected slot to the array
    const newSlots = [...selectedTimeSlots];

    if (newSlots.includes(startTime)) {
      // Remove if already selected
      const index = newSlots.indexOf(startTime);
      newSlots.splice(index, 1);
    } else {
      // Add if within limit
      if (newSlots.length * blockMinutes < maxBlockMinutes) {
        newSlots.push(startTime);
        newSlots.sort();
      } else {
        showMessage(`Maximum block selection is ${maxBlockMinutes} minutes`, 'error');
        return;
      }
    }

    setSelectedTimeSlots(newSlots);

    // Update form with first selected time or clear if none
    if (newSlots.length > 0) {
      setFormData(prev => ({
        ...prev,
        birth_date: moment(slotInfo.start).format('YYYY-MM-DD'),
        birth_time: newSlots[0],
        is_block_guess: newSlots.length > 1
      }));
    }
  }

  function handleEventClick(event) {
    setSelectedGuess(event.guessData);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedGuess(null);
  }

  // ===== VIEW SWITCHING =====

  function switchView(view) {
    setCurrentView(view);
  }

  // ===== RENDER =====

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title">🍼 Baby Sweep</h1>
          <p className="login-subtitle">{welcomeText}</p>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className={`form-input ${loginError ? 'error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
              />
              {loginError && <div className="form-error">{loginError}</div>}
            </div>
            <button type="submit" className={`btn btn-primary btn-block ${loading ? 'btn-loading' : ''}`} disabled={loading}>
              {loading ? '' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">🍼 Baby Sweep</h1>
        <p className="app-subtitle">Make your guess!</p>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${currentView === 'form' ? 'active' : ''}`}
          onClick={() => switchView('form')}
        >
          Make a Guess
        </button>
        <button
          className={`nav-tab ${currentView === 'calendar' ? 'active' : ''}`}
          onClick={() => switchView('calendar')}
        >
          Calendar View
        </button>
        <button
          className={`nav-tab ${currentView === 'all-guesses' ? 'active' : ''}`}
          onClick={() => switchView('all-guesses')}
        >
          All Guesses ({guesses.length})
        </button>
      </nav>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* MAKE A GUESS VIEW */}
      {currentView === 'form' && (
        <div className="content-container">
          <h2 className="text-center mb-30">Submit Your Guess</h2>

          {/* Due Date Info */}
          {settings.due_date && (
            <div style={{
              backgroundColor: '#FFF9E6',
              border: '2px solid #FFD700',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.1em', fontWeight: 'bold', marginBottom: '8px' }}>
                📅 Due Date: {moment(settings.due_date).format('MMMM D, YYYY')}
              </div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                Valid guess range: {moment(dateRange.minDate).format('MMM D, YYYY')} - {moment(dateRange.maxDate).format('MMM D, YYYY')}
                <br />
                (4 weeks before and after the due date)
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label required">Your Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label required">Your Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Gender Guess</label>
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    type="radio"
                    id="boy"
                    name="gender"
                    value="Boy"
                    checked={formData.gender === 'Boy'}
                    onChange={(e) => handleFormChange('gender', e.target.value)}
                  />
                  <label htmlFor="boy">Boy</label>
                </div>
                <div className="radio-option">
                  <input
                    type="radio"
                    id="girl"
                    name="gender"
                    value="Girl"
                    checked={formData.gender === 'Girl'}
                    onChange={(e) => handleFormChange('gender', e.target.value)}
                  />
                  <label htmlFor="girl">Girl</label>
                </div>
                {settings.include_surprise_gender === 'true' && (
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="surprise"
                      name="gender"
                      value="Surprise"
                      checked={formData.gender === 'Surprise'}
                      onChange={(e) => handleFormChange('gender', e.target.value)}
                    />
                    <label htmlFor="surprise">Surprise</label>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="birth_date" className="form-label required">Birth Date</label>
              <input
                id="birth_date"
                type="date"
                className="form-input"
                value={formData.birth_date}
                onChange={(e) => handleFormChange('birth_date', e.target.value)}
                min={dateRange.minDate}
                max={dateRange.maxDate}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="birth_time" className="form-label required">Birth Time</label>
              <select
                id="birth_time"
                className="form-select"
                value={formData.birth_time}
                onChange={(e) => handleFormChange('birth_time', e.target.value)}
                required
              >
                <option value="">Select a time</option>
                {timeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {selectedTimeSlots.length > 0 && (
                <div className="form-help">
                  Selected {selectedTimeSlots.length} time slot(s): {selectedTimeSlots.map(t => moment(t, 'HH:mm').format('h:mm A')).join(', ')}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">Weight</label>
              <div className="unit-toggle">
                <button
                  type="button"
                  className={`unit-button ${weightUnit === 'imperial' ? 'active' : ''}`}
                  onClick={() => setWeightUnit('imperial')}
                >
                  lbs / oz
                </button>
                <button
                  type="button"
                  className={`unit-button ${weightUnit === 'metric' ? 'active' : ''}`}
                  onClick={() => setWeightUnit('metric')}
                >
                  kg
                </button>
              </div>

              {weightUnit === 'imperial' ? (
                <div className="weight-input-group">
                  <div className="weight-field">
                    <label htmlFor="weight_lbs" className="form-label">Pounds</label>
                    <input
                      id="weight_lbs"
                      type="number"
                      className="form-input"
                      value={formData.weight_lbs}
                      onChange={(e) => handleWeightChange('weight_lbs', e.target.value)}
                      min="0"
                      max="20"
                      step="1"
                      placeholder="7"
                    />
                  </div>
                  <div className="weight-separator">+</div>
                  <div className="weight-field">
                    <label htmlFor="weight_oz" className="form-label">Ounces</label>
                    <input
                      id="weight_oz"
                      type="number"
                      className="form-input"
                      value={formData.weight_oz}
                      onChange={(e) => handleWeightChange('weight_oz', e.target.value)}
                      min="0"
                      max="15"
                      step="1"
                      placeholder="8"
                    />
                  </div>
                </div>
              ) : (
                <input
                  id="weight_kg"
                  type="number"
                  className="form-input"
                  value={formData.weight_kg}
                  onChange={(e) => handleWeightChange('weight_kg', e.target.value)}
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="3.5"
                />
              )}

              {formData.weight_kg && (
                <div className="form-help">
                  = {formData.weight_lbs || 0} lbs {formData.weight_oz || 0} oz = {formData.weight_kg} kg
                </div>
              )}
            </div>

            <button type="submit" className={`btn btn-primary btn-block mt-30 ${loading ? 'btn-loading' : ''}`} disabled={loading}>
              {loading ? '' : 'Submit Guess'}
            </button>
          </form>

          {/* Mini calendar for selecting time blocks */}
          <div className="calendar-container">
            <h3 className="text-center mb-20">Click time slots to create a block guess</h3>
            <CalendarView
              events={calendarEvents}
              onSlotSelect={handleCalendarSlotClick}
              onEventClick={handleEventClick}
              selectedSlots={selectedTimeSlots}
              defaultDate={settings.due_date}
              dueDate={settings.due_date}
            />
          </div>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {currentView === 'calendar' && (
        <div className="content-container">
          <h2 className="text-center mb-30">All Guesses Calendar</h2>
          <CalendarView
            events={calendarEvents}
            onEventClick={handleEventClick}
            readOnly={true}
            defaultDate={settings.due_date}
            dueDate={settings.due_date}
          />
        </div>
      )}

      {/* ALL GUESSES VIEW */}
      {currentView === 'all-guesses' && (
        <div className="content-container">
          <h2 className="text-center mb-30">All Submitted Guesses</h2>

          {guesses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🤷</div>
              <div className="empty-state-text">No guesses yet!</div>
              <div className="empty-state-subtext">Be the first to make a guess.</div>
            </div>
          ) : (
            <div className="guesses-grid">
              {guesses.map(guess => (
                <div key={guess.id} className="guess-card">
                  <div className="guess-card-header">
                    <div>
                      <div className="guess-name">{guess.name}</div>
                      <div className="guess-email">{guess.email}</div>
                    </div>
                    <div className={`gender-badge ${guess.gender.toLowerCase()}`}>
                      {guess.gender}
                    </div>
                  </div>

                  <div className="guess-details">
                    <div className="guess-detail">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">
                        {moment(guess.birth_date).format('MMM D, YYYY')}
                      </span>
                    </div>
                    <div className="guess-detail">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">
                        {moment(guess.birth_time, 'HH:mm').format('h:mm A')}
                        {guess.is_block_guess && (
                          <span className="block-guess-indicator">BLOCK</span>
                        )}
                      </span>
                    </div>
                    <div className="guess-detail">
                      <span className="detail-label">Weight:</span>
                      <span className="detail-value">
                        {guess.weight_lbs} lbs {guess.weight_oz} oz ({guess.weight_kg} kg)
                      </span>
                    </div>
                  </div>

                  <div className="guess-timestamp">
                    Submitted {moment(guess.created_at).format('MMM D, YYYY @ h:mm A')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL FOR GUESS DETAILS */}
      {showModal && selectedGuess && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Guess Details</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="guess-details">
              <div className="guess-detail">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedGuess.name}</span>
              </div>
              <div className="guess-detail">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedGuess.email}</span>
              </div>
              <div className="guess-detail">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">
                  <span className={`gender-badge ${selectedGuess.gender.toLowerCase()}`}>
                    {selectedGuess.gender}
                  </span>
                </span>
              </div>
              <div className="guess-detail">
                <span className="detail-label">Date:</span>
                <span className="detail-value">
                  {moment(selectedGuess.birth_date).format('MMMM D, YYYY')}
                </span>
              </div>
              <div className="guess-detail">
                <span className="detail-label">Time:</span>
                <span className="detail-value">
                  {moment(selectedGuess.birth_time, 'HH:mm').format('h:mm A')}
                </span>
              </div>
              {selectedGuess.is_block_guess && selectedGuess.time_blocks && (
                <div className="guess-detail">
                  <span className="detail-label">Time Blocks:</span>
                  <span className="detail-value">
                    {selectedGuess.time_blocks.map(t => moment(t, 'HH:mm').format('h:mm A')).join(', ')}
                  </span>
                </div>
              )}
              <div className="guess-detail">
                <span className="detail-label">Weight:</span>
                <span className="detail-value">
                  {selectedGuess.weight_lbs} lbs {selectedGuess.weight_oz} oz ({selectedGuess.weight_kg} kg)
                </span>
              </div>
              <div className="guess-detail">
                <span className="detail-label">Submitted:</span>
                <span className="detail-value">
                  {moment(selectedGuess.created_at).format('MMM D, YYYY @ h:mm A')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
