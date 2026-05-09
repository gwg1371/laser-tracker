// views/log-session.js — Log a session + success screen with Google Calendar
const LogSessionView = (() => {

  function render(preselectedAreaId) {
    const areas      = Store.getAreas().filter(a => a.active);
    const selectedId = preselectedAreaId && Store.getArea(preselectedAreaId)
      ? preselectedAreaId
      : (areas[0] ? areas[0].id : '');

    document.getElementById('view-container').innerHTML = `
      <div class="space-y-8 pt-6 pb-8">
        <div>
          <h1 class="font-headline font-extrabold text-3xl tracking-tight text-on-surface">Log Session</h1>
          <p class="font-body text-on-surface-variant text-sm mt-1">Record your treatment details.</p>
        </div>

        <form id="log-form" onsubmit="LogSessionView.submit(event)" class="space-y-7">

          <!-- Area -->
          <div class="space-y-3">
            <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">Treatment Area</label>
            <div class="flex gap-2 flex-wrap">
              ${areas.map(a => `
                <button type="button" id="pill-${a.id}"
                  class="area-pill px-5 py-2.5 rounded-full font-headline font-bold text-sm transition-all duration-200 active:scale-95
                    ${a.id === selectedId ? 'pill-gradient text-white shadow-md' : 'bg-surface-container-high text-on-surface'}"
                  onclick="LogSessionView.selectArea('${a.id}')">
                  ${_esc(a.name)}
                </button>`).join('')}
            </div>
            <input type="hidden" id="area-id" value="${selectedId}">
          </div>

          <!-- Date -->
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">Date</label>
            <input type="date" id="sess-date" value="${Utils.todayString()}"
              class="w-full p-4 bg-surface-container-low rounded-xl font-body text-on-surface border-0 focus:outline-none focus:bg-surface-container-high transition-colors">
          </div>

          <!-- Intensity slider -->
          <div class="space-y-3">
            <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">
              Intensity Level — <span class="text-primary font-extrabold" id="intensity-val">5</span> / 9
            </label>
            <input type="range" id="intensity" min="1" max="9" value="5"
              class="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-surface-container-high"
              oninput="document.getElementById('intensity-val').textContent=this.value">
            <div class="flex justify-between text-xs text-on-surface-variant font-body">
              <span>1 — Lowest</span><span>9 — Highest</span>
            </div>
          </div>

          <!-- Pass count -->
          <div class="space-y-3">
            <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">Pass Count</label>
            <div class="flex gap-2">
              ${[1,2,3,4,5].map(n => `
                <button type="button" id="pass-${n}"
                  class="pass-btn flex-1 py-3 rounded-xl font-headline font-bold text-sm transition-all duration-200 active:scale-95
                    ${n === 2 ? 'pill-gradient text-white' : 'bg-surface-container-high text-on-surface'}"
                  onclick="LogSessionView.selectPasses(${n})">${n}</button>`).join('')}
            </div>
            <input type="hidden" id="pass-count" value="2">
          </div>

          <!-- Duration (optional) -->
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">
              Duration <span class="text-outline normal-case tracking-normal font-normal">minutes — optional</span>
            </label>
            <input type="number" id="duration" min="1" max="180" placeholder="e.g. 20"
              class="w-full p-4 bg-surface-container-low rounded-xl font-body text-on-surface border-0 focus:outline-none focus:bg-surface-container-high transition-colors placeholder:text-outline-variant">
          </div>

          <!-- Pain rating -->
          <div class="space-y-3">
            <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">
              Comfort Rating <span class="text-outline normal-case tracking-normal font-normal">— optional</span>
            </label>
            <div class="flex gap-2">
              ${[
                {v:1,e:'😊',l:'None'},
                {v:2,e:'🙂',l:'Mild'},
                {v:3,e:'😐',l:'Moderate'},
                {v:4,e:'😬',l:'Strong'},
                {v:5,e:'😣',l:'Intense'}
              ].map(item => `
                <button type="button" id="pain-${item.v}"
                  class="pain-btn flex-1 py-3 flex flex-col items-center rounded-xl transition-all duration-200 active:scale-95 bg-surface-container-high"
                  data-v="${item.v}" onclick="LogSessionView.selectPain(${item.v})">
                  <span class="text-xl">${item.e}</span>
                  <span class="text-[9px] text-on-surface-variant mt-0.5 font-medium">${item.l}</span>
                </button>`).join('')}
            </div>
            <input type="hidden" id="pain-rating" value="">
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">
              Notes <span class="text-outline normal-case tracking-normal font-normal">— optional</span>
            </label>
            <textarea id="notes" rows="3" placeholder="Skin reaction, adjustments, observations…"
              class="w-full p-4 bg-surface-container-low rounded-xl font-body text-on-surface border-0 focus:outline-none focus:bg-surface-container-high transition-colors resize-none placeholder:text-outline-variant"></textarea>
          </div>

          <!-- Photo -->
          <div class="space-y-3">
            <label class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">
              Photo <span class="text-outline normal-case tracking-normal font-normal">— optional</span>
            </label>
            <div id="photo-preview" class="hidden relative">
              <img id="photo-img" class="w-full rounded-2xl object-cover max-h-56 bg-surface-container-low">
              <button type="button" onclick="LogSessionView.removePhoto()"
                class="absolute top-2 right-2 w-8 h-8 rounded-full bg-inverse-surface/70 text-inverse-on-surface flex items-center justify-center active:scale-90">
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <label for="photo-input"
              class="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors active:scale-[.99]">
              <span class="material-symbols-outlined text-primary">add_photo_alternate</span>
              <span class="font-body text-on-surface-variant text-sm" id="photo-label">Take or choose a photo</span>
            </label>
            <input type="file" id="photo-input" accept="image/*" capture="environment"
              class="hidden" onchange="LogSessionView.handlePhoto(this)">
          </div>

          <button type="submit"
            class="w-full pill-gradient text-white py-4 rounded-full font-headline font-bold text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">save</span>
            Save Session
          </button>
        </form>
      </div>
    `;
  }

  function selectArea(id) {
    document.getElementById('area-id').value = id;
    document.querySelectorAll('.area-pill').forEach(btn => {
      const mine = btn.id === `pill-${id}`;
      btn.className = `area-pill px-5 py-2.5 rounded-full font-headline font-bold text-sm transition-all duration-200 active:scale-95 ${mine ? 'pill-gradient text-white shadow-md' : 'bg-surface-container-high text-on-surface'}`;
    });
  }

  function selectPasses(n) {
    document.getElementById('pass-count').value = n;
    document.querySelectorAll('.pass-btn').forEach(btn => {
      const mine = btn.id === `pass-${n}`;
      btn.className = `pass-btn flex-1 py-3 rounded-xl font-headline font-bold text-sm transition-all duration-200 active:scale-95 ${mine ? 'pill-gradient text-white' : 'bg-surface-container-high text-on-surface'}`;
    });
  }

  function selectPain(v) {
    const curr = document.getElementById('pain-rating').value;
    const next = (String(curr) === String(v)) ? '' : v;
    document.getElementById('pain-rating').value = next;
    document.querySelectorAll('.pain-btn').forEach(btn => {
      const mine = String(btn.dataset.v) === String(v) && next !== '';
      btn.className = `pain-btn flex-1 py-3 flex flex-col items-center rounded-xl transition-all duration-200 active:scale-95 ${mine ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-surface-container-high'}`;
    });
  }

  let _pendingPhotoDataUrl = null;

  async function handlePhoto(input) {
    const file = input.files[0];
    if (!file) return;
    const dataUrl = await Utils.compressImage(file);
    _pendingPhotoDataUrl = dataUrl;
    document.getElementById('photo-img').src = dataUrl;
    document.getElementById('photo-preview').classList.remove('hidden');
    document.getElementById('photo-label').textContent = 'Photo selected — tap to change';
  }

  function removePhoto() {
    _pendingPhotoDataUrl = null;
    document.getElementById('photo-preview').classList.add('hidden');
    document.getElementById('photo-label').textContent = 'Take or choose a photo';
    document.getElementById('photo-input').value = '';
  }

  async function submit(e) {
    e.preventDefault();
    const areaId = document.getElementById('area-id').value;
    if (!areaId) { showToast('Please select an area.'); return; }

    const session = {
      id:              Utils.generateId('sess'),
      areaId,
      date:            document.getElementById('sess-date').value,
      intensityLevel:  parseInt(document.getElementById('intensity').value),
      passCount:       parseInt(document.getElementById('pass-count').value),
      durationMinutes: document.getElementById('duration').value ? parseInt(document.getElementById('duration').value) : null,
      painRating:      document.getElementById('pain-rating').value ? parseInt(document.getElementById('pain-rating').value) : null,
      notes:           document.getElementById('notes').value.trim() || null,
      createdAt:       new Date().toISOString()
    };

    Store.saveSession(session);

    if (_pendingPhotoDataUrl) {
      Store.savePhoto({
        id:        Utils.generateId('photo'),
        sessionId: session.id,
        areaId:    session.areaId,
        date:      session.date,
        dataUrl:   _pendingPhotoDataUrl
      });
      _pendingPhotoDataUrl = null;
    }

    _renderSuccess(session);
  }

  function _renderSuccess(session) {
    const area       = Store.getArea(session.areaId);
    const nextDue    = Utils.getNextDueDate(session.areaId);
    const nextStr    = nextDue ? Utils.formatDate(nextDue.toISOString().split('T')[0]) : null;
    const count      = Store.getSessionsForArea(session.areaId).length;
    const painEmojis = ['','😊','🙂','😐','😬','😣'];

    const calBtn = nextDue ? `
      <button onclick="LogSessionView.addToCalendar('${session.areaId}','${nextDue.toISOString()}',${session.intensityLevel},${session.passCount})"
        class="w-full bg-surface-container-lowest text-on-surface py-4 rounded-full font-headline font-bold text-sm flex items-center justify-center gap-3 hover:bg-surface-container-low transition-colors active:scale-95 duration-200 shadow-[0_4px_12px_0_rgba(24,28,29,0.06)]">
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="#fff"/>
          <path d="M34 6h-2V2h-4v4H20V2h-4v4h-2a4 4 0 00-4 4v28a4 4 0 004 4h20a4 4 0 004-4V10a4 4 0 00-4-4zm0 32H14V18h20v20z" fill="#006067"/>
          <text x="24" y="34" text-anchor="middle" font-size="12" font-weight="bold" fill="#006067" font-family="sans-serif">G</text>
        </svg>
        Add to Google Calendar
      </button>` : '';

    document.getElementById('view-container').innerHTML = `
      <div class="flex flex-col items-center min-h-[75vh] space-y-7 pt-10 pb-8 text-center">

        <!-- Check circle -->
        <div class="w-20 h-20 rounded-full pill-gradient flex items-center justify-center shadow-[0_12px_32px_0_rgba(0,96,103,0.3)]">
          <span class="material-symbols-outlined text-white text-4xl" style="font-variation-settings:'FILL' 1">check_circle</span>
        </div>

        <div class="space-y-1">
          <h1 class="font-headline font-extrabold text-3xl tracking-tight text-on-surface">Session Logged!</h1>
          <p class="font-body text-on-surface-variant text-sm">Session #${count} for ${_esc(area.name)} saved.</p>
        </div>

        <!-- Summary card -->
        <div class="w-full bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_8px_24px_0_rgba(24,28,29,0.04)] text-left space-y-3">
          ${_row('Area',      _esc(area.name))}
          ${_row('Date',      Utils.formatDate(session.date))}
          ${_row('Intensity', `<span class="text-primary">Level ${session.intensityLevel}</span>`)}
          ${_row('Passes',    session.passCount)}
          ${session.painRating ? _row('Comfort', painEmojis[session.painRating]) : ''}
          ${nextStr ? `
            <div class="pt-2 border-t border-surface-container-high flex justify-between items-center">
              <span class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Next Session</span>
              <span class="font-headline font-semibold text-tertiary">${nextStr}</span>
            </div>` : ''}
        </div>

        ${calBtn}

        <div class="w-full flex gap-3">
          <button onclick="App.navigate('area/${session.areaId}')"
            class="flex-1 bg-surface-container-high text-on-surface py-4 rounded-full font-headline font-bold text-sm active:scale-95 transition-transform">
            View ${_esc(area.name)}
          </button>
          <button onclick="App.navigate('home')"
            class="flex-1 pill-gradient text-white py-4 rounded-full font-headline font-bold text-sm active:scale-95 transition-transform">
            Home
          </button>
        </div>
      </div>
    `;
  }

  function _row(label, value) {
    return `
      <div class="flex justify-between items-center">
        <span class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">${label}</span>
        <span class="font-headline font-semibold text-on-surface">${value}</span>
      </div>`;
  }

  function addToCalendar(areaId, isoDueDate, intensity, passes) {
    const area = Store.getArea(areaId);
    Calendar.open(area, new Date(isoDueDate), { intensityLevel: intensity, passCount: passes });
  }

  function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render, selectArea, selectPasses, selectPain, submit, handlePhoto, removePhoto, addToCalendar };
})();
