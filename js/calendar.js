// calendar.js — Google Calendar URL scheme + .ics export
const Calendar = (() => {

  function buildUrl(area, nextDueDate, sessionDetails) {
    const d = new Date(nextDueDate);
    const pad = n => String(n).padStart(2, '0');
    const y  = d.getFullYear();
    const mo = pad(d.getMonth() + 1);
    const dy = pad(d.getDate());

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
      text:     `Laser Treatment — ${area.name}`,
      dates:    `${start}/${end}`,
      details,
      location: 'Home'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function open(area, nextDueDate, sessionDetails) {
    window.open(buildUrl(area, nextDueDate, sessionDetails), '_blank');
  }

  // ── .ics export ───────────────────────────────────────────────────────────

  function _icsDate(dateStr) {
    // dateStr: YYYY-MM-DD → YYYYMMDD
    return dateStr.replace(/-/g, '');
  }

  function _icsStamp() {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  function _icsEscape(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  function _foldLine(line) {
    // RFC 5545: fold lines at 75 chars
    const parts = [];
    while (line.length > 75) {
      parts.push(line.slice(0, 75));
      line = ' ' + line.slice(75);
    }
    parts.push(line);
    return parts.join('\r\n');
  }

  function buildIcsContent(areas) {
    const stamp = _icsStamp();
    const events = [];

    areas.forEach(area => {
      const nextDue = Utils.getNextDueDate(area.id);
      if (!nextDue) return;

      const startDate = nextDue.toISOString().split('T')[0];
      const uid = `lazetrack-${area.id}-${Date.now()}@lazetrack.app`;
      const freq = area.intervalDays === 7 ? 'WEEKLY' :
                   area.intervalDays === 14 ? 'WEEKLY;INTERVAL=2' :
                   `DAILY;INTERVAL=${area.intervalDays}`;

      const count = Store.getSessionsForArea(area.id).length;
      const remaining = Math.max(0, (area.totalSessions || 10) - count);
      if (remaining === 0) return;

      const lines = [
        'BEGIN:VEVENT',
        _foldLine(`UID:${uid}`),
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${_icsDate(startDate)}`,
        `DTEND;VALUE=DATE:${_icsDate(startDate)}`,
        _foldLine(`RRULE:FREQ=${freq};COUNT=${remaining}`),
        _foldLine(`SUMMARY:${_icsEscape('Laser Treatment — ' + area.name)}`),
        _foldLine(`DESCRIPTION:${_icsEscape(`LazeTrack scheduled treatment for ${area.name}. Session ${count + 1} of ${area.totalSessions}.`)}`),
        'LOCATION:Home',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        _foldLine(`DESCRIPTION:${_icsEscape('Laser treatment reminder — ' + area.name)}`),
        'END:VALARM',
        'END:VEVENT'
      ];
      events.push(lines.join('\r\n'));
    });

    if (events.length === 0) return null;

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LazeTrack//LazeTrack PWA//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:LazeTrack Treatments',
      'X-WR-CALDESC:Scheduled laser hair removal sessions from LazeTrack',
      ...events,
      'END:VCALENDAR'
    ].join('\r\n');
  }

  function downloadIcs(areas) {
    const content = buildIcsContent(areas);
    if (!content) {
      showToast('No upcoming sessions to sync.');
      return;
    }
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `lazetrack-schedule-${Utils.todayString()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Calendar file downloaded! Import it in Google Calendar.');
  }

  return { buildUrl, open, buildIcsContent, downloadIcs };
})();
