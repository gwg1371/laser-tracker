// views/dashboard.js — Home screen
const DashboardView = (() => {

  function render() {
    const areas    = Store.getAreas().filter(a => a.active);
    const settings = Store.getSettings();
    const recent   = Store.getSessions()
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 3);

    // Soonest-due area for the bento card
    let nextArea = null, soonest = Infinity;
    areas.forEach(area => {
      const days = Utils.getDaysUntilDue(area.id);
      if (days !== null && days < soonest) { soonest = days; nextArea = area; }
    });
    // If no sessions at all, show first area as the "start" card
    if (!nextArea && areas.length) nextArea = areas[0];

    document.getElementById('view-container').innerHTML = `
      <div class="space-y-10 pt-6 pb-8">

        <!-- Welcome -->
        <section class="space-y-1">
          <h2 class="font-headline font-bold text-3xl tracking-tight text-on-surface">Hello, ${_esc(settings.userName)}</h2>
          <p class="font-body text-on-surface-variant text-sm tracking-wide">Your skin health sanctuary is up to date.</p>
        </section>

        <!-- Next Session Bento -->
        ${_nextCard(nextArea)}

        <!-- Treatment Progress -->
        <section class="space-y-6">
          <div class="flex justify-between items-end">
            <h3 class="font-headline font-bold text-xl text-on-surface">Treatment Progress</h3>
            <button onclick="App.navigate('history')" class="font-label text-xs font-semibold text-primary uppercase tracking-widest">View All</button>
          </div>
          <div class="grid grid-cols-1 gap-4">
            ${areas.map(_progressCard).join('')}
          </div>
        </section>

        <!-- Recent Logs -->
        <section class="space-y-5 pb-4">
          <h3 class="font-headline font-bold text-xl text-on-surface">Recent Logs</h3>
          ${recent.length === 0 ? _emptyLogs() : `<div class="space-y-3">${recent.map(_logItem).join('')}</div>`}
        </section>

      </div>
    `;
  }

  function _nextCard(area) {
    if (!area || !Store.getLastSession(area.id)) {
      return `
        <section>
          <div class="relative overflow-hidden bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_12px_32px_0_rgba(24,28,29,0.04)]">
            <div class="absolute top-0 right-0 w-32 h-32 pill-gradient opacity-10 blur-3xl -mr-16 -mt-16 rounded-full"></div>
            <div class="flex justify-between items-start relative z-10">
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-outline-variant"></span>
                  <span class="font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Get Started</span>
                </div>
                <div>
                  <h3 class="font-headline font-extrabold text-4xl text-primary tracking-tighter">LazeTrack</h3>
                  <p class="font-body text-on-surface-variant text-lg mt-1 italic">Log your first session</p>
                </div>
              </div>
              <div class="bg-surface-container-low p-4 rounded-xl">
                <span class="material-symbols-outlined text-primary" style="font-size:28px">calendar_today</span>
              </div>
            </div>
            <div class="mt-8">
              <button onclick="App.navigate('log')" class="pill-gradient text-white px-6 py-3 rounded-full font-headline font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform">
                <span class="material-symbols-outlined text-base">add_circle</span>
                Log First Session
              </button>
            </div>
          </div>
        </section>`;
    }

    const { status, label } = Utils.getDueDateStatus(area.id);
    const nextDue   = Utils.getNextDueDate(area.id);
    const dateLabel = nextDue ? Utils.formatDateShort(nextDue.toISOString().split('T')[0]) : '';
    const isOverdue = status === 'overdue';
    const dotClass  = isOverdue
      ? 'bg-error'
      : 'bg-tertiary shadow-[0_0_8px_rgba(0,97,90,0.4)] animate-pulse';
    const tagColor  = isOverdue ? 'text-error' : 'text-tertiary';
    const tagLabel  = isOverdue ? 'Overdue' : (status === 'due' ? 'Due Today' : 'Upcoming');
    const subColor  = isOverdue ? 'text-error' : 'text-on-surface-variant';

    return `
      <section>
        <div class="relative overflow-hidden bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_12px_32px_0_rgba(24,28,29,0.04)]">
          <div class="absolute top-0 right-0 w-32 h-32 pill-gradient opacity-10 blur-3xl -mr-16 -mt-16 rounded-full"></div>
          <div class="flex justify-between items-start relative z-10">
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full ${dotClass}"></span>
                <span class="font-label text-xs font-semibold uppercase tracking-widest ${tagColor}">${tagLabel}</span>
              </div>
              <div>
                <h3 class="font-headline font-extrabold text-4xl text-primary tracking-tighter">${_esc(area.name)}</h3>
                <p class="font-body ${subColor} text-lg mt-1 italic">${label}${dateLabel ? ' \u2014 ' + dateLabel : ''}</p>
              </div>
            </div>
            <div class="bg-surface-container-low p-4 rounded-xl cursor-pointer" onclick="App.navigate('log/${area.id}')">
              <span class="material-symbols-outlined text-primary" style="font-size:28px">calendar_today</span>
            </div>
          </div>
          <div class="mt-8 flex gap-3">
            <button onclick="App.navigate('log/${area.id}')" class="pill-gradient text-white px-6 py-3 rounded-full font-headline font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform">
              <span class="material-symbols-outlined text-base">history_edu</span>
              Log Session
            </button>
            <button onclick="App.navigate('area/${area.id}')" class="bg-surface-container-high text-on-surface px-6 py-3 rounded-full font-headline font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform">
              View Details
            </button>
          </div>
        </div>
      </section>`;
  }

  function _progressCard(area, i) {
    const { count, total, percent } = Utils.getProgress(area.id);
    const isPrimary = i === 0;
    const pct = percent + '%';
    return `
      <div onclick="App.navigate('area/${area.id}')"
        class="bg-surface-container-low rounded-[1.5rem] p-6 space-y-5 cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] duration-200">
        <div class="flex justify-between items-center">
          <div class="p-3 bg-surface-container-lowest rounded-xl">
            <span class="material-symbols-outlined ${isPrimary ? 'text-primary' : 'text-on-surface'}">${area.icon}</span>
          </div>
          <span class="font-headline font-extrabold text-2xl ${isPrimary ? 'text-primary' : 'text-secondary'}">${pct}</span>
        </div>
        <div>
          <h4 class="font-headline font-bold text-lg text-on-surface">${_esc(area.name)}</h4>
          <p class="font-body text-xs text-on-surface-variant mb-3">${count} of ${total} sessions completed</p>
          <div class="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div class="h-full ${isPrimary ? 'pill-gradient' : 'bg-secondary opacity-60'} rounded-full transition-all duration-500" style="width:${pct}"></div>
          </div>
        </div>
      </div>`;
  }

  function _logItem(session) {
    const area        = Store.getArea(session.areaId);
    const areaName    = area ? area.name : 'Unknown';
    const sessionsArr = Store.getSessionsForArea(session.areaId);
    const idx         = sessionsArr.findIndex(s => s.id === session.id);
    const num         = sessionsArr.length - idx;
    const painEmojis  = ['', '😊', '🙂', '😐', '😬', '😣'];
    const emoji       = session.painRating ? ' ' + painEmojis[session.painRating] : '';
    return `
      <div onclick="App.navigate('area/${session.areaId}')"
        class="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl cursor-pointer hover:bg-surface-container-low transition-colors">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center">
            <span class="material-symbols-outlined text-primary">bolt</span>
          </div>
          <div>
            <p class="font-headline font-bold text-on-surface">${_esc(areaName)} — Session ${num}</p>
            <p class="font-body text-xs text-on-surface-variant">${Utils.formatRelative(session.date)}${emoji}</p>
          </div>
        </div>
        <span class="material-symbols-outlined text-outline">chevron_right</span>
      </div>`;
  }

  function _emptyLogs() {
    return `
      <div class="text-center py-12 text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl mb-3 block" style="color:#bdc9ca">history_edu</span>
        <p class="font-body text-sm">No sessions logged yet.</p>
        <button onclick="App.navigate('log')" class="mt-4 text-primary text-sm font-headline font-semibold">
          Log your first session →
        </button>
      </div>`;
  }

  function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render };
})();
