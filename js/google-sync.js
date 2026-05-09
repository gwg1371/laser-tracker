// google-sync.js — Google Calendar OAuth2 + IPL event sync + notifications
const GoogleSync = (() => {

  const SCOPES      = 'https://www.googleapis.com/auth/calendar.readonly';
  const AUTH_URL    = 'https://accounts.google.com/o/oauth2/v2/auth';
  const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
  const NOTIFY_BEFORE_MS = 60 * 60 * 1000; // 1 hour before

  let _notifyTimers = [];

  // ── Token helpers ──────────────────────────────────────

  function _getToken() {
    const gcal = Store.getGCal();
    if (!gcal.accessToken) return null;
    if (Date.now() > (gcal.tokenExpiry || 0)) {
      Store.saveGCal({ accessToken: null, tokenExpiry: null });
      return null;
    }
    return gcal.accessToken;
  }

  function isConnected() { return !!_getToken(); }

  function getClientId() { return Store.getGCal().clientId || ''; }

  // ── OAuth2 implicit flow ───────────────────────────────

  function connect(clientId) {
    const id = (clientId || '').trim();
    if (!id) { showToast('Paste your Google Client ID first.'); return; }
    Store.saveGCal({ clientId: id });

    const redirectUri = window.location.origin + window.location.pathname.replace(/\/$/, '') + '/';
    const params = new URLSearchParams({
      response_type: 'token',
      client_id:     id,
      redirect_uri:  redirectUri,
      scope:         SCOPES,
      prompt:        'consent',
      state:         'gcal_auth'
    });
    window.location.href = `${AUTH_URL}?${params}`;
  }

  function disconnect() {
    Store.saveGCal({ accessToken: null, tokenExpiry: null });
    Store.saveIPLEvents([]);
    _cancelTimers();
  }

  // Called by app.js on every load — handles the redirect back from Google
  function handleAuthCallback() {
    const hash = window.location.hash;
    if (!hash.includes('access_token')) return false;

    const params     = new URLSearchParams(hash.replace(/^#/, ''));
    const token      = params.get('access_token');
    const expiresIn  = parseInt(params.get('expires_in') || '3600', 10);
    const state      = params.get('state');

    if (token && state === 'gcal_auth') {
      Store.saveGCal({
        accessToken:  token,
        tokenExpiry:  Date.now() + expiresIn * 1000
      });
      history.replaceState(null, '', window.location.pathname);
      showToast('Connected to Google Calendar!');
      // Auto-sync after connect
      syncIPLEvents().then(() => {
        if (window.SettingsView) SettingsView.render();
      });
      return true;
    }
    return false;
  }

  // ── API calls ──────────────────────────────────────────

  async function syncIPLEvents() {
    const token = _getToken();
    if (!token) { showToast('Not connected. Tap Connect first.'); return false; }

    const now     = new Date();
    const timeMin = new Date(now.getTime() - 30 * 86400000).toISOString(); // 30 days back
    const timeMax = new Date(now.getTime() + 90 * 86400000).toISOString(); // 90 days ahead

    const params = new URLSearchParams({
      q:             'IPL',
      timeMin,
      timeMax,
      singleEvents:  'true',
      orderBy:       'startTime',
      maxResults:    '100'
    });

    try {
      const res = await fetch(
        `${CALENDAR_API}/calendars/primary/events?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 401) {
        Store.saveGCal({ accessToken: null, tokenExpiry: null });
        showToast('Google session expired. Please reconnect.');
        return false;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data   = await res.json();
      const events = (data.items || [])
        .filter(e => /ipl/i.test(e.summary || ''))
        .map(e => ({
          id:          e.id,
          title:       e.summary || 'IPL',
          start:       e.start.dateTime || e.start.date,
          end:         e.end.dateTime   || e.end.date,
          allDay:      !e.start.dateTime,
          description: e.description || '',
          location:    e.location     || '',
          calendarLink: e.htmlLink    || ''
        }));

      Store.saveIPLEvents(events);
      Store.saveGCal({ lastSync: new Date().toISOString() });
      scheduleNotifications(events);
      return events;
    } catch (err) {
      console.error('GoogleSync.syncIPLEvents:', err);
      showToast('Sync failed. Check your internet connection.');
      return false;
    }
  }

  // ── Notifications ──────────────────────────────────────

  function scheduleNotifications(events) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') _scheduleAll(events);
      });
    } else if (Notification.permission === 'granted') {
      _scheduleAll(events);
    }
  }

  function _cancelTimers() {
    _notifyTimers.forEach(t => clearTimeout(t));
    _notifyTimers = [];
  }

  function _scheduleAll(events) {
    _cancelTimers();
    const now = Date.now();
    events.forEach(ev => {
      const startMs  = new Date(ev.start).getTime();
      if (isNaN(startMs)) return;

      const notifyAt = startMs - NOTIFY_BEFORE_MS;
      const delay    = notifyAt - now;

      // Schedule only if within the next 7 days and hasn't passed yet
      if (delay > 0 && delay < 7 * 86400000) {
        const t = setTimeout(() => {
          _fire(ev, '1 hour');
        }, delay);
        _notifyTimers.push(t);
      }

      // Also notify 24 hours before
      const notifyAt24 = startMs - 24 * 60 * 60 * 1000;
      const delay24    = notifyAt24 - now;
      if (delay24 > 0 && delay24 < 7 * 86400000) {
        const t24 = setTimeout(() => {
          _fire(ev, 'tomorrow');
        }, delay24);
        _notifyTimers.push(t24);
      }
    });
  }

  function _fire(event, when) {
    const body = [
      `Your IPL session is ${when}.`,
      event.location ? `Location: ${event.location}` : ''
    ].filter(Boolean).join('\n');

    new Notification(event.title, {
      body,
      icon:    './icons/icon.svg',
      badge:   './icons/icon.svg',
      tag:     `ipl-${event.id}-${when}`,
      vibrate: [200, 100, 200]
    });
  }

  // Re-schedule notifications from stored events on every app load
  function init() {
    handleAuthCallback();
    const stored = Store.getIPLEvents();
    if (stored.length && Notification.permission === 'granted') {
      _scheduleAll(stored);
    }
  }

  return {
    isConnected, getClientId,
    connect, disconnect,
    handleAuthCallback,
    syncIPLEvents,
    scheduleNotifications,
    init
  };
})();
