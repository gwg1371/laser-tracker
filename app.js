// app.js — Router and app initialisation for LazeTrack
const App = (() => {

  function navigate(hash) {
    window.location.hash = hash || 'home';
  }

  function router() {
    const raw   = window.location.hash.replace('#', '') || 'home';
    const parts = raw.split('/');
    const route = parts[0];
    const param = parts[1] || null;

    _updateNav(route);
    _updateFab(route);
    window.scrollTo(0, 0);

    switch (route) {
      case '':
      case 'home':      DashboardView.render();          break;
      case 'area':      AreaDetailView.render(param);    break;
      case 'log':       LogSessionView.render(param);    break;
      case 'history':   HistoryView.render(param);       break;
      case 'gallery':   GalleryView.render();            break;
      case 'settings':  SettingsView.render();           break;
      default:          DashboardView.render();
    }
  }

  function _updateFab(route) {
    const fab = document.getElementById('fab');
    if (!fab) return;
    fab.style.display = (route === 'log') ? 'none' : 'flex';
  }

  function _updateNav(route) {
    const map = {
      '':        'nav-home',
      home:      'nav-home',
      area:      'nav-home',
      history:   'nav-home',
      log:       'nav-log',
      gallery:   'nav-gallery',
      settings:  'nav-settings'
    };
    const activeId = map[route] || 'nav-home';

    const ACTIVE   = 'flex flex-col items-center justify-center bg-[#007b83]/10 text-[#006067] rounded-full px-4 py-1 active:scale-90 duration-200';
    const INACTIVE = 'flex flex-col items-center justify-center text-slate-400 hover:text-[#006067] transition-colors active:scale-90 duration-200';

    ['nav-home', 'nav-gallery', 'nav-log', 'nav-settings'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.className = (id === activeId) ? ACTIVE : INACTIVE;
    });

    // Fill the active icon
    document.querySelectorAll('#bottom-nav .material-symbols-outlined').forEach(icon => {
      icon.style.fontVariationSettings = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
    });
    const activeEl = document.getElementById(activeId);
    if (activeEl) {
      const icon = activeEl.querySelector('.material-symbols-outlined');
      if (icon) icon.style.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
    }
  }

  function init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    GoogleSync.init(); // handles OAuth callback + reschedules notifications

    window.addEventListener('hashchange', router);
    document.getElementById('fab').addEventListener('click', () => navigate('log'));

    router();
  }

  return { navigate, init };
})();

// ── Global helpers ─────────────────────────────────────────────────────────

function showToast(message) {
  const old = document.getElementById('lzt-toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'lzt-toast';
  t.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-[300] bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-full font-headline font-bold text-sm shadow-[0_8px_24px_0_rgba(24,28,29,0.2)] pointer-events-none';
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

document.addEventListener('DOMContentLoaded', App.init);
