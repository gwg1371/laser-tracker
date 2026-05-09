// views/history.js — Full session history with area filter tabs
const HistoryView = (() => {

  function render(filterAreaId) {
    const areas       = Store.getAreas().filter(a => a.active);
    const allSessions = Store.getSessions()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const activeId    = filterAreaId || 'all';
    const filtered    = activeId === 'all'
      ? allSessions
      : allSessions.filter(s => s.areaId === activeId);

    document.getElementById('view-container').innerHTML = `
      <div class="space-y-6 pt-6 pb-8">
        <h1 class="font-headline font-extrabold text-3xl tracking-tight text-on-surface">History</h1>

        <!-- Filter tabs -->
        <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button onclick="HistoryView.render('all')"
            class="whitespace-nowrap px-4 py-2 rounded-full font-headline font-bold text-sm transition-all duration-200 active:scale-95
              ${activeId === 'all' ? 'pill-gradient text-white' : 'bg-surface-container-high text-on-surface'}">
            All Areas
          </button>
          ${areas.map(a => `
            <button onclick="HistoryView.render('${a.id}')"
              class="whitespace-nowrap px-4 py-2 rounded-full font-headline font-bold text-sm transition-all duration-200 active:scale-95
                ${activeId === a.id ? 'pill-gradient text-white' : 'bg-surface-container-high text-on-surface'}">
              ${_esc(a.name)}
            </button>`).join('')}
        </div>

        <!-- Sessions -->
        ${filtered.length === 0
          ? `<div class="text-center py-16 text-on-surface-variant">
               <span class="material-symbols-outlined text-5xl mb-4 block" style="color:#bdc9ca">history_edu</span>
               <p class="font-body text-sm">No sessions found.</p>
               <button onclick="App.navigate('log')" class="mt-4 text-primary text-sm font-headline font-semibold">Log a session →</button>
             </div>`
          : `<div class="space-y-4">
               ${filtered.map(s => _card(s)).join('')}
             </div>`
        }
      </div>
    `;
  }

  function _card(session) {
    const area        = Store.getArea(session.areaId);
    const areaName    = area ? area.name : 'Unknown';
    const sessArr     = Store.getSessionsForArea(session.areaId);
    const idx         = sessArr.findIndex(s => s.id === session.id);
    const num         = sessArr.length - idx;
    const painEmojis  = ['','😊','🙂','😐','😬','😣'];
    const photos      = Store.getPhotosForSession(session.id);

    const tags = [
      session.passCount       ? `${session.passCount} passes`   : null,
      session.durationMinutes ? `${session.durationMinutes} min` : null,
      session.painRating      ? painEmojis[session.painRating]   : null
    ].filter(Boolean);

    return `
      <div onclick="App.navigate('area/${session.areaId}')"
        class="bg-surface-container-lowest rounded-[1.5rem] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-surface-container-low transition-colors">
        ${photos.length > 0 ? `
          <img src="${photos[0].dataUrl}" class="w-full h-32 object-cover">` : ''}
        <div class="p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-primary">bolt</span>
              </div>
              <div>
                <div class="font-headline font-bold text-on-surface">${_esc(areaName)} — Session ${num}</div>
                <div class="text-xs text-on-surface-variant">${Utils.formatDate(session.date)}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-headline font-bold text-primary">Lvl ${session.intensityLevel}</div>
            </div>
          </div>
          ${tags.length || session.notes ? `
            <div class="mt-3 flex flex-wrap gap-2 items-center">
              ${tags.map(t => `<span class="text-[10px] uppercase tracking-widest bg-surface-container-low text-on-surface-variant px-2 py-1 rounded-lg font-bold">${t}</span>`).join('')}
              ${session.notes ? `<p class="text-sm text-on-surface-variant font-body w-full mt-1">${_esc(session.notes)}</p>` : ''}
            </div>` : ''}
        </div>
      </div>`;
  }

  function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render };
})();
