// views/area-detail.js — Area detail page (mirrors chest_detail_page mockup)
const AreaDetailView = (() => {

  function render(areaId) {
    const area = Store.getArea(areaId);
    if (!area) { App.navigate('home'); return; }

    const sessions     = Store.getSessionsForArea(areaId);
    const { count, total, percent } = Utils.getProgress(areaId);
    const { status, label }         = Utils.getDueDateStatus(areaId);
    const nextDue      = Utils.getNextDueDate(areaId);
    const lastRegrowth = Store.getLastRegrowth(areaId);

    const isOverdue  = status === 'overdue';
    const dotColor   = isOverdue ? 'bg-error' : 'bg-tertiary animate-pulse';
    const textColor  = isOverdue ? 'text-error' : 'text-tertiary';
    const countdown  = nextDue
      ? (isOverdue ? label : `Next treatment ${label.toLowerCase()}`)
      : 'Log first session to track';

    document.getElementById('view-container').innerHTML = `
      <div class="pb-8">

        <!-- Hero -->
        <section class="pt-6 pb-6 space-y-6">
          <div class="space-y-2">
            <nav class="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
              <span class="cursor-pointer hover:text-primary" onclick="App.navigate('home')">Areas</span>
              <span class="material-symbols-outlined" style="font-size:14px">chevron_right</span>
              <span class="font-semibold text-primary">${_esc(area.name)}</span>
            </nav>
            <h1 class="font-headline font-extrabold text-4xl tracking-tight text-on-surface">${_esc(area.name)} Treatment</h1>
            <p class="font-body text-on-surface-variant max-w-md">
              ${percent > 0
                ? `Hair density decreasing — ${percent}% progress across ${count} sessions.`
                : 'Start logging sessions to track your hair reduction progress.'}
            </p>
            <div class="pt-4 flex flex-wrap gap-3">
              <button onclick="App.navigate('log/${areaId}')"
                class="pill-gradient text-white px-7 py-3.5 rounded-full font-headline font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2 text-sm">
                <span class="material-symbols-outlined text-base">history_edu</span>
                Log Session
              </button>
              <button onclick="_openRegrowthModal('${areaId}')"
                class="bg-surface-container-highest text-on-surface px-7 py-3.5 rounded-full font-headline font-bold active:scale-95 transition-transform flex items-center gap-2 text-sm">
                <span class="material-symbols-outlined text-base">grass</span>
                Regrowth Check
              </button>
            </div>
          </div>

          <!-- Progress stat card -->
          <div class="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-[0_12px_32px_0_rgba(24,28,29,0.06)] relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4">
              <span class="material-symbols-outlined text-tertiary">analytics</span>
            </div>
            <div class="font-headline font-extrabold text-5xl text-primary tracking-tighter">${percent}%</div>
            <div class="text-on-surface-variant text-xs font-medium uppercase tracking-widest mt-1">Overall Progress</div>
            <div class="mt-4 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div class="h-full pill-gradient rounded-full transition-all duration-700" style="width:${percent}%"></div>
            </div>
            ${lastRegrowth ? `
              <p class="mt-3 text-xs text-on-surface-variant font-body">
                Last regrowth check: <span class="font-semibold text-on-surface">${lastRegrowth.level}/10</span>
                — ${Utils.formatRelative(lastRegrowth.date)}
              </p>` : ''}
          </div>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">

          <!-- History -->
          <section class="md:col-span-7 space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="font-headline font-bold text-xl text-on-surface">Treatment History</h2>
              ${sessions.length > 5
                ? `<span class="text-primary text-sm font-semibold cursor-pointer"
                       onclick="App.navigate('history/${areaId}')">View All</span>`
                : ''}
            </div>
            <div class="space-y-4">
              ${sessions.length === 0
                ? _emptyHistory(areaId)
                : sessions.slice(0, 5).map((s, i) => _sessionRow(s, sessions.length - i)).join('')}
            </div>
          </section>

          <!-- Sidebar -->
          <aside class="md:col-span-5 space-y-6">
            <div class="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-[0_8px_24px_0_rgba(24,28,29,0.04)]">
              <h3 class="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">tune</span>
                Area Settings
              </h3>
              <div class="space-y-4">
                <div class="p-4 rounded-xl bg-surface-container-low">
                  <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1 block">Frequency</label>
                  <div class="flex items-center justify-between">
                    <span class="font-headline font-semibold">Every ${area.intervalDays} days</span>
                    <span class="material-symbols-outlined text-primary text-sm cursor-pointer"
                          onclick="App.navigate('settings')">edit</span>
                  </div>
                </div>
                <div class="p-4 rounded-xl bg-surface-container-low">
                  <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1 block">Max Intensity Limit</label>
                  <div class="flex items-center justify-between">
                    <span class="font-headline font-semibold">Level ${area.maxIntensity || 5}</span>
                    <span class="material-symbols-outlined text-primary text-sm">lock</span>
                  </div>
                </div>
                <div class="pt-2 flex items-center gap-2 ${textColor}">
                  <span class="w-2 h-2 rounded-full ${dotColor}"></span>
                  <span class="text-xs font-semibold">${countdown}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <!-- Regrowth bottom-sheet modal -->
      <div id="regrowth-modal" class="hidden fixed inset-0 z-[100] flex items-end justify-center">
        <div class="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onclick="_closeRegrowthModal()"></div>
        <div class="relative w-full max-w-lg bg-surface-container-lowest rounded-t-[2rem] p-8 shadow-[0_-12px_40px_0_rgba(24,28,29,0.12)]">
          <h3 class="font-headline font-bold text-xl text-on-surface mb-1">Regrowth Check — ${_esc(area.name)}</h3>
          <p class="font-body text-sm text-on-surface-variant mb-6">How much hair regrowth are you noticing?</p>
          <div class="space-y-4">
            <div class="flex justify-between text-xs text-on-surface-variant font-medium">
              <span>None at all</span><span>Fully grown back</span>
            </div>
            <input type="range" id="regrowth-slider" min="0" max="10"
              value="${lastRegrowth ? lastRegrowth.level : 5}"
              class="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-surface-container-high"
              oninput="document.getElementById('regrowth-val').textContent=this.value">
            <div class="text-center">
              <span class="font-headline font-extrabold text-5xl text-primary" id="regrowth-val">${lastRegrowth ? lastRegrowth.level : 5}</span>
              <span class="text-on-surface-variant text-sm"> / 10</span>
            </div>
          </div>
          <div class="mt-8 flex gap-3">
            <button onclick="_saveRegrowth('${areaId}')"
              class="flex-1 pill-gradient text-white py-4 rounded-full font-headline font-bold text-sm active:scale-95 transition-transform">
              Save Check
            </button>
            <button onclick="_closeRegrowthModal()"
              class="px-6 py-4 bg-surface-container-high text-on-surface rounded-full font-headline font-bold text-sm active:scale-95 transition-transform">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function _sessionRow(session, num) {
    const reactions = { 1:'Smooth', 2:'Mild Reaction', 3:'Normal Reaction', 4:'Some Redness', 5:'Strong Reaction' };
    const painEmojis = ['','😊','🙂','😐','😬','😣'];
    const tag = session.painRating
      ? `${reactions[session.painRating]} ${painEmojis[session.painRating]}`
      : (session.notes ? 'With Notes' : 'Completed');
    return `
      <div class="bg-surface-container-low p-5 rounded-[1.25rem] flex items-center justify-between
                  hover:bg-surface-container-high transition-colors">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span class="material-symbols-outlined">bolt</span>
          </div>
          <div>
            <div class="font-headline font-bold text-on-surface">Session ${num}</div>
            <div class="text-sm text-on-surface-variant">${Utils.formatDate(session.date)}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-headline font-bold text-primary">Intensity ${session.intensityLevel}</div>
          <div class="text-[10px] text-on-surface-variant uppercase tracking-widest">${tag}</div>
        </div>
      </div>`;
  }

  function _emptyHistory(areaId) {
    return `
      <div class="text-center py-10 text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl mb-3 block" style="color:#bdc9ca">bolt</span>
        <p class="font-body text-sm">No sessions yet for this area.</p>
        <button onclick="App.navigate('log/${areaId}')" class="mt-4 text-primary text-sm font-headline font-semibold">
          Log your first session →
        </button>
      </div>`;
  }

  function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render };
})();

// Modal globals (called by inline onclick)
function _openRegrowthModal() {
  document.getElementById('regrowth-modal').classList.remove('hidden');
}
function _closeRegrowthModal() {
  document.getElementById('regrowth-modal').classList.add('hidden');
}
function _saveRegrowth(areaId) {
  const level = parseInt(document.getElementById('regrowth-slider').value);
  Store.saveRegrowthEntry({
    id: Utils.generateId('rgr'),
    areaId,
    level,
    date: Utils.todayString(),
    createdAt: new Date().toISOString()
  });
  _closeRegrowthModal();
  AreaDetailView.render(areaId);
  showToast('Regrowth check saved!');
}
