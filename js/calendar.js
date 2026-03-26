// calendar.js — Google Calendar URL scheme integration
const Calendar = (() => {

  function buildUrl(area, nextDueDate, sessionDetails) {
    const d = new Date(nextDueDate);
    const pad = n => String(n).padStart(2, '0');
    const y  = d.getFullYear();
    const mo = pad(d.getMonth() + 1);
    const dy = pad(d.getDate());

    // 10:00 AM – 10:30 AM in local time, formatted as UTC-style for Google Calendar
    const start = `${y}${mo}${dy}T100000`;
    const end   = `${y}${mo}${dy}T103000`;

    const sessionCount = Store.getSessionsForArea(area.id).length;
    const details = [
      `LazeTrack — ${area.name} session #${sessionCount}.`,
      sessionDetails.intensityLevel ? `Intensity: ${sessionDetails.intensityLevel}/9.` : '',
      sessionDetails.passCount      ? `Passes: ${sessionDetails.passCount}.`           : '',
      'Tracked with LazeTrack.'
    ].filter(Boolean).join(' ');

    const params = new URLSearchParams({
      action:   'TEMPLATE',
      text:     `Laser Treatment \u2014 ${area.name}`,
      dates:    `${start}/${end}`,
      details,
      location: 'Home'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function open(area, nextDueDate, sessionDetails) {
    window.open(buildUrl(area, nextDueDate, sessionDetails), '_blank');
  }

  return { buildUrl, open };
})();
