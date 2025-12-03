import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

/**
 * CalendarView Component
 *
 * Interactive calendar for viewing and selecting guess time slots
 *
 * Props:
 * - events: Array of calendar events (formatted guesses)
 * - onSlotSelect: Function to handle slot selection (optional)
 * - onEventClick: Function to handle event click
 * - selectedSlots: Array of selected time slots (optional)
 * - readOnly: Boolean for read-only mode
 */
function CalendarView({
  events = [],
  onSlotSelect,
  onEventClick,
  selectedSlots = [],
  readOnly = false
}) {

  /**
   * Custom event styling based on gender
   */
  const eventStyleGetter = (event) => {
    let backgroundColor = '#4A90E2'; // Default blue

    if (event.gender === 'Boy') {
      backgroundColor = '#4A90E2'; // Blue
    } else if (event.gender === 'Girl') {
      backgroundColor = '#FF69B4'; // Pink
    } else if (event.gender === 'Surprise') {
      backgroundColor = '#9370DB'; // Purple
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.85em',
        padding: '2px 5px'
      }
    };
  };

  /**
   * Handle slot selection for block guesses
   */
  const handleSelectSlot = (slotInfo) => {
    if (readOnly || !onSlotSelect) return;

    // Call the parent handler with slot info
    onSlotSelect(slotInfo);
  };

  /**
   * Handle clicking on an existing event
   */
  const handleSelectEvent = (event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  /**
   * Custom event component to show more details
   */
  const EventComponent = ({ event }) => {
    return (
      <div className="calendar-event">
        <strong>{event.title}</strong>
        <div style={{ fontSize: '0.75em' }}>
          {moment(event.start).format('h:mm A')}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={eventStyleGetter}
        selectable={!readOnly}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        views={['month', 'week', 'day']}
        defaultView="month"
        popup
        components={{
          event: EventComponent
        }}
        step={parseInt(process.env.REACT_APP_TIME_BLOCK_MINUTES || '30')}
        timeslots={1}
      />
    </div>
  );
}

export default CalendarView;
