// views/gallery.js — Progress Gallery (coming soon placeholder)
const GalleryView = (() => {

  function render() {
    document.getElementById('view-container').innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[70vh] space-y-7 pt-6 pb-8 text-center">

        <div class="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl" style="color:#bdc9ca">photo_library</span>
        </div>

        <div class="space-y-2">
          <h1 class="font-headline font-extrabold text-2xl tracking-tight text-on-surface">Progress Gallery</h1>
          <p class="font-body text-on-surface-variant text-sm max-w-xs mx-auto">
            Photo comparison feature coming soon.<br>Track your visual progress over time.
          </p>
        </div>

        <!-- Placeholder grid -->
        <div class="w-full bg-surface-container-lowest rounded-[1.5rem] p-6 shadow-[0_8px_24px_0_rgba(24,28,29,0.04)]">
          <div class="grid grid-cols-2 gap-3">
            ${['Month 0','Month 1','Month 2','Latest'].map((label, i) => `
              <div class="aspect-square rounded-xl bg-surface-container-high flex flex-col items-center justify-center text-on-surface-variant relative overflow-hidden">
                <span class="material-symbols-outlined text-3xl mb-1" style="color:#bdc9ca">add_photo_alternate</span>
                <span class="text-[9px] uppercase tracking-widest font-bold text-outline">${label}</span>
              </div>`).join('')}
          </div>
          <p class="text-xs text-on-surface-variant mt-5 font-body">Coming in a future update</p>
        </div>

        <button onclick="App.navigate('log')"
          class="pill-gradient text-white px-8 py-3.5 rounded-full font-headline font-bold text-sm active:scale-95 transition-transform flex items-center gap-2">
          <span class="material-symbols-outlined text-base">history_edu</span>
          Log a Session Instead
        </button>
      </div>
    `;
  }

  return { render };
})();
