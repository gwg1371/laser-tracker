// views/settings.js — App settings
const SettingsView = (() => {

  function render() {
    const areas    = Store.getAreas();
    const settings = Store.getSettings();
    const total    = Store.getSessions().length;

    document.getElementById('view-container').innerHTML = `
      <div class="space-y-8 pt-6 pb-8">
        <h1 class="font-headline font-extrabold text-3xl tracking-tight text-on-surface">Settings</h1>

        <!-- Profile -->
        <div class="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_8px_24px_0_rgba(24,28,29,0.04)] space-y-4">
          <h2 class="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">person</span>
            Profile
          </h2>
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">Your Name</label>
            <input type="text" id="user-name" value="${_esc(settings.userName)}"
              class="w-full p-4 bg-surface-container-low rounded-xl font-body text-on-surface border-0 focus:outline-none focus:bg-surface-container-high transition-colors">
          </div>
          <button onclick="SettingsView.saveName()"
            class="pill-gradient text-white px-6 py-3 rounded-full font-headline font-bold text-sm active:scale-95 transition-transform">
            Save Name
          </button>
        </div>

        <!-- Treatment Areas -->
        <div class="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_8px_24px_0_rgba(24,28,29,0.04)] space-y-5">
          <h2 class="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">tune</span>
            Treatment Areas
          </h2>
          ${areas.map(area => `
            <div class="p-4 bg-surface-container-low rounded-xl space-y-4">
              <div class="font-headline font-bold text-on-surface flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-base">${area.icon}</span>
                ${_esc(area.name)}
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1">Interval (days)</label>
                  <input type="number" id="interval-${area.id}" value="${area.intervalDays}" min="1" max="90"
                    class="w-full p-2.5 bg-surface-container-high rounded-lg font-body text-on-surface text-sm border-0 focus:outline-none focus:bg-surface-variant transition-colors">
                </div>
                <div>
                  <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1">Total Sessions</label>
                  <input type="number" id="total-${area.id}" value="${area.totalSessions}" min="1" max="50"
                    class="w-full p-2.5 bg-surface-container-high rounded-lg font-body text-on-surface text-sm border-0 focus:outline-none focus:bg-surface-variant transition-colors">
                </div>
                <div>
                  <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1">Max Intensity</label>
                  <input type="number" id="maxint-${area.id}" value="${area.maxIntensity || 5}" min="1" max="9"
                    class="w-full p-2.5 bg-surface-container-high rounded-lg font-body text-on-surface text-sm border-0 focus:outline-none focus:bg-surface-variant transition-colors">
                </div>
              </div>
              <button onclick="SettingsView.saveArea('${area.id}')"
                class="text-primary text-sm font-headline font-semibold hover:underline active:opacity-70">
                Save ${_esc(area.name)} settings
              </button>
            </div>`).join('')}
        </div>

        <!-- Google Calendar Sync -->
        <div class="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_8px_24px_0_rgba(24,28,29,0.04)] space-y-4">
          <h2 class="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" class="flex-shrink-0">
              <rect width="48" height="48" rx="8" fill="#fff"/>
              <path d="M34 6h-2V2h-4v4H20V2h-4v4h-2a4 4 0 00-4 4v28a4 4 0 004 4h20a4 4 0 004-4V10a4 4 0 00-4-4zm0 32H14V18h20v20z" fill="#006067"/>
              <text x="24" y="34" text-anchor="middle" font-size="12" font-weight="bold" fill="#006067" font-family="sans-serif">G</text>
            </svg>
            Google Calendar Sync
          </h2>
          <p class="text-xs text-on-surface-variant font-body leading-relaxed">
            Download a <strong>.ics</strong> file with all your upcoming scheduled sessions.
            Open it to import directly into Google Calendar (or any calendar app).
          </p>
          <button onclick="SettingsView.syncCalendar()"
            class="w-full bg-surface-container-high text-on-surface py-4 rounded-full font-headline font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-3">
            <span class="material-symbols-outlined text-primary text-base">event_available</span>
            Download Calendar File (.ics)
          </button>
          <p class="text-[10px] text-outline font-body text-center">
            Tip: In Google Calendar → Other calendars → Import
          </p>
        </div>

        <!-- Data Management -->
        <div class="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_8px_24px_0_rgba(24,28,29,0.04)] space-y-4">
          <h2 class="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">database</span>
            Data
          </h2>
          <p class="text-xs text-on-surface-variant font-body">${total} session${total !== 1 ? 's' : ''} stored on this device.</p>
          <div class="flex gap-3 flex-wrap">
            <button onclick="SettingsView.exportData()"
              class="bg-surface-container-high text-on-surface px-5 py-3 rounded-full font-headline font-bold text-sm active:scale-95 transition-transform flex items-center gap-2">
              <span class="material-symbols-outlined text-base">download</span>
              Export JSON
            </button>
            <button onclick="SettingsView.clearData()"
              class="bg-error-container text-on-error-container px-5 py-3 rounded-full font-headline font-bold text-sm active:scale-95 transition-transform flex items-center gap-2">
              <span class="material-symbols-outlined text-base">delete_forever</span>
              Clear Sessions
            </button>
          </div>
        </div>

        <!-- About -->
        <div class="bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_8px_24px_0_rgba(24,28,29,0.04)]">
          <h2 class="font-headline font-bold text-lg text-on-surface flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-primary">info</span>
            About LazeTrack
          </h2>
          <p class="text-sm font-body text-on-surface-variant">
            Personal at-home laser hair removal tracker.<br>
            All data is stored locally on your device — nothing is sent anywhere.
          </p>
          <p class="text-xs font-body text-outline mt-3">v1.0 — PWA</p>
        </div>
      </div>
    `;
  }

  function saveName() {
    const name = document.getElementById('user-name').value.trim();
    if (!name) { showToast('Please enter a name.'); return; }
    Store.saveSettings({ ...Store.getSettings(), userName: name });
    showToast('Name saved!');
  }

  function saveArea(areaId) {
    const area = { ...Store.getArea(areaId) };
    const iv   = document.getElementById(`interval-${areaId}`);
    const tv   = document.getElementById(`total-${areaId}`);
    const mv   = document.getElementById(`maxint-${areaId}`);
    if (iv) area.intervalDays   = parseInt(iv.value)  || area.intervalDays;
    if (tv) area.totalSessions  = parseInt(tv.value)  || area.totalSessions;
    if (mv) area.maxIntensity   = parseInt(mv.value)  || area.maxIntensity;
    Store.saveArea(area);
    showToast(`${area.name} settings saved!`);
  }

  function syncCalendar() {
    Calendar.downloadIcs(Store.getAreas().filter(a => a.active));
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({
      areas:      Store.getAreas(),
      sessions:   Store.getSessions(),
      settings:   Store.getSettings(),
      regrowth:   Store.getRegrowth(),
      exportedAt: new Date().toISOString()
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `lazetrack-${Utils.todayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearData() {
    if (!confirm('Delete ALL session data? This cannot be undone.')) return;
    localStorage.removeItem('lht_sessions');
    localStorage.removeItem('lht_regrowth');
    showToast('Session data cleared.');
    render();
  }

  function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render, saveName, saveArea, syncCalendar, exportData, clearData };
})();
