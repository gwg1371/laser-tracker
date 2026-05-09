// store.js — All localStorage data access for LazeTrack
const Store = (() => {
  const KEYS = {
    AREAS:      'lht_areas',
    SESSIONS:   'lht_sessions',
    SETTINGS:   'lht_settings',
    REGROWTH:   'lht_regrowth',
    IPL_EVENTS: 'lht_ipl_events',
    GCAL:       'lht_gcal'
  };

  const DEFAULT_AREAS = [
    { id: 'area_belly', name: 'Belly', intervalDays: 7, totalSessions: 10, maxIntensity: 5, active: true, icon: 'accessibility_new' },
    { id: 'area_chest', name: 'Chest', intervalDays: 7, totalSessions: 10, maxIntensity: 5, active: true, icon: 'texture' }
  ];

  const DEFAULT_SETTINGS = { userName: 'You', theme: 'light' };

  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }

  function _set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ── Migration ──────────────────────────────────────────
  function _migrate() {
    const saved = _get(KEYS.AREAS);
    if (!saved) return;
    let changed = false;
    const migrated = saved.map(a => {
      // Fix old 28-day default → 7 days
      if (a.intervalDays === 28 && (a.id === 'area_belly' || a.id === 'area_chest')) {
        changed = true;
        return { ...a, intervalDays: 7 };
      }
      return a;
    });
    // Ensure Belly appears before Chest
    const bellyIdx = migrated.findIndex(a => a.id === 'area_belly');
    const chestIdx = migrated.findIndex(a => a.id === 'area_chest');
    if (bellyIdx > 0 && chestIdx === 0) {
      migrated.splice(bellyIdx, 1);
      migrated.unshift(saved.find(a => a.id === 'area_belly') || migrated[0]);
      changed = true;
    }
    if (changed) _set(KEYS.AREAS, migrated);
  }

  // ── Areas ──────────────────────────────────────────────
  function getAreas() { return _get(KEYS.AREAS) || DEFAULT_AREAS; }

  function getArea(id) { return getAreas().find(a => a.id === id) || null; }

  function saveArea(area) {
    const areas = getAreas();
    const idx = areas.findIndex(a => a.id === area.id);
    if (idx >= 0) areas[idx] = area; else areas.push(area);
    _set(KEYS.AREAS, areas);
  }

  // ── Sessions ───────────────────────────────────────────
  function getSessions() { return _get(KEYS.SESSIONS) || []; }

  function getSessionsForArea(areaId) {
    return getSessions()
      .filter(s => s.areaId === areaId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function getLastSession(areaId) {
    const s = getSessionsForArea(areaId);
    return s.length > 0 ? s[0] : null;
  }

  function saveSession(session) {
    const sessions = getSessions();
    sessions.push(session);
    _set(KEYS.SESSIONS, sessions);
    return session;
  }

  function deleteSession(id) {
    _set(KEYS.SESSIONS, getSessions().filter(s => s.id !== id));
  }

  // ── Settings ───────────────────────────────────────────
  function getSettings() { return { ...DEFAULT_SETTINGS, ...(_get(KEYS.SETTINGS) || {}) }; }
  function saveSettings(s) { _set(KEYS.SETTINGS, s); }

  // ── Regrowth ───────────────────────────────────────────
  function getRegrowth() { return _get(KEYS.REGROWTH) || []; }

  function saveRegrowthEntry(entry) {
    const data = getRegrowth();
    data.push(entry);
    _set(KEYS.REGROWTH, data);
  }

  function getLastRegrowth(areaId) {
    const entries = getRegrowth()
      .filter(r => r.areaId === areaId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return entries[0] || null;
  }

  // ── Google Calendar ────────────────────────────────────
  function getGCal()       { return _get(KEYS.GCAL)       || {}; }
  function saveGCal(data)  { _set(KEYS.GCAL, { ...getGCal(), ...data }); }

  function getIPLEvents()  { return _get(KEYS.IPL_EVENTS) || []; }
  function saveIPLEvents(events) { _set(KEYS.IPL_EVENTS, events); }

  // Run migration on module load
  _migrate();

  return {
    getAreas, getArea, saveArea,
    getSessions, getSessionsForArea, getLastSession, saveSession, deleteSession,
    getSettings, saveSettings,
    getRegrowth, saveRegrowthEntry, getLastRegrowth,
    getGCal, saveGCal, getIPLEvents, saveIPLEvents
  };
})();
