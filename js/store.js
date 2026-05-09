// store.js — All localStorage data access for LazeTrack
const Store = (() => {
  const KEYS = {
    AREAS: 'lht_areas',
    SESSIONS: 'lht_sessions',
    SETTINGS: 'lht_settings',
    REGROWTH: 'lht_regrowth'
  };

  const DEFAULT_AREAS = [
    { id: 'area_chest', name: 'Chest', intervalDays: 7, totalSessions: 10, maxIntensity: 5, active: true, icon: 'texture' },
    { id: 'area_belly', name: 'Belly', intervalDays: 7, totalSessions: 10, maxIntensity: 5, active: true, icon: 'accessibility_new' }
  ];

  const DEFAULT_SETTINGS = { userName: 'You', theme: 'light' };

  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }

  function _set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
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

  return {
    getAreas, getArea, saveArea,
    getSessions, getSessionsForArea, getLastSession, saveSession, deleteSession,
    getSettings, saveSettings,
    getRegrowth, saveRegrowthEntry, getLastRegrowth
  };
})();
