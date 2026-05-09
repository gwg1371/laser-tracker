// views/gallery.js — Before/After progress gallery
const GalleryView = (() => {

  function render(filterAreaId) {
    const areas  = Store.getAreas().filter(a => a.active);
    const active = filterAreaId || (areas[0] ? areas[0].id : 'all');
    const photos = active === 'all'
      ? Store.getPhotos().sort((a, b) => new Date(a.date) - new Date(b.date))
      : Store.getPhotosForArea(active);

    document.getElementById('view-container').innerHTML = `
      <div class="space-y-6 pt-6 pb-8">

        <div class="flex items-center justify-between">
          <h1 class="font-headline font-extrabold text-3xl tracking-tight text-on-surface">Gallery</h1>
          ${photos.length > 0
            ? `<span class="text-xs text-on-surface-variant font-body">${photos.length} photo${photos.length !== 1 ? 's' : ''}</span>`
            : ''}
        </div>

        <!-- Area tabs -->
        <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          ${areas.map(a => `
            <button onclick="GalleryView.render('${a.id}')"
              class="whitespace-nowrap px-4 py-2 rounded-full font-headline font-bold text-sm transition-all duration-200 active:scale-95
                ${active === a.id ? 'pill-gradient text-white' : 'bg-surface-container-high text-on-surface'}">
              ${_esc(a.name)}
            </button>`).join('')}
        </div>

        ${photos.length === 0 ? _empty(active) : _grid(photos, active)}
      </div>

      <!-- Lightbox -->
      <div id="lightbox" class="hidden fixed inset-0 z-[200] flex items-center justify-center bg-on-surface/80 backdrop-blur-sm p-4"
           onclick="GalleryView.closeLightbox()">
        <div class="relative max-w-lg w-full" onclick="event.stopPropagation()">
          <img id="lightbox-img" class="w-full rounded-2xl object-contain max-h-[75vh] shadow-2xl">
          <div class="mt-3 flex items-center justify-between px-1">
            <div>
              <p id="lightbox-title" class="font-headline font-bold text-inverse-on-surface text-sm"></p>
              <p id="lightbox-date"  class="font-body text-inverse-on-surface/60 text-xs"></p>
            </div>
            <button onclick="GalleryView.deleteCurrentPhoto()"
              class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-error/20 text-white text-xs font-headline font-semibold active:scale-95">
              <span class="material-symbols-outlined text-base">delete</span>Delete
            </button>
          </div>
          <button onclick="GalleryView.closeLightbox()"
            class="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-lg active:scale-90">
            <span class="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>
      </div>
    `;
  }

  function _grid(photos, areaId) {
    return `
      <div class="grid grid-cols-2 gap-3">
        ${photos.map((p, i) => {
          const area = Store.getArea(p.areaId);
          const sessions = Store.getSessionsForArea(p.areaId);
          const sessIdx  = sessions.findIndex(s => s.id === p.sessionId);
          const sessNum  = sessIdx >= 0 ? sessions.length - sessIdx : '';
          const label    = area ? `${area.name}${sessNum ? ' · #' + sessNum : ''}` : '';
          return `
            <div class="relative aspect-square rounded-2xl overflow-hidden bg-surface-container-low cursor-pointer active:scale-95 transition-transform shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                 onclick="GalleryView.openLightbox('${p.id}')">
              <img src="${p.dataUrl}" class="w-full h-full object-cover">
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-on-surface/60 to-transparent p-2.5">
                <p class="text-white text-[10px] font-bold truncate">${_esc(label)}</p>
                <p class="text-white/70 text-[9px]">${Utils.formatDateShort(p.date)}</p>
              </div>
              ${i === 0 ? '<span class="absolute top-2 left-2 bg-tertiary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Before</span>' : ''}
              ${i === photos.length - 1 && photos.length > 1 ? '<span class="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Latest</span>' : ''}
            </div>`;
        }).join('')}
      </div>
      <p class="text-xs text-on-surface-variant font-body text-center pt-2">
        Tap a photo to view · Add photos when logging sessions
      </p>`;
  }

  function _empty(areaId) {
    return `
      <div class="flex flex-col items-center justify-center py-16 space-y-5 text-center">
        <div class="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl" style="color:#bdc9ca">add_photo_alternate</span>
        </div>
        <div class="space-y-1">
          <p class="font-headline font-bold text-on-surface">No photos yet</p>
          <p class="font-body text-on-surface-variant text-sm max-w-xs">
            Add a photo when logging a session to track your visual progress over time.
          </p>
        </div>
        <button onclick="App.navigate('log')"
          class="pill-gradient text-white px-7 py-3.5 rounded-full font-headline font-bold text-sm active:scale-95 transition-transform flex items-center gap-2">
          <span class="material-symbols-outlined text-base">history_edu</span>
          Log a Session
        </button>
      </div>`;
  }

  let _lightboxPhotoId = null;

  function openLightbox(photoId) {
    const photo = Store.getPhotos().find(p => p.id === photoId);
    if (!photo) return;
    _lightboxPhotoId = photoId;
    const area     = Store.getArea(photo.areaId);
    const sessions = Store.getSessionsForArea(photo.areaId);
    const idx      = sessions.findIndex(s => s.id === photo.sessionId);
    const num      = idx >= 0 ? sessions.length - idx : '';
    document.getElementById('lightbox-img').src   = photo.dataUrl;
    document.getElementById('lightbox-title').textContent = area ? `${area.name}${num ? ' — Session #' + num : ''}` : '';
    document.getElementById('lightbox-date').textContent  = Utils.formatDate(photo.date);
    document.getElementById('lightbox').classList.remove('hidden');
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
    _lightboxPhotoId = null;
  }

  function deleteCurrentPhoto() {
    if (!_lightboxPhotoId) return;
    if (!confirm('Delete this photo?')) return;
    const photo = Store.getPhotos().find(p => p.id === _lightboxPhotoId);
    Store.deletePhoto(_lightboxPhotoId);
    closeLightbox();
    render(photo ? photo.areaId : undefined);
    showToast('Photo deleted.');
  }

  function _esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render, openLightbox, closeLightbox, deleteCurrentPhoto };
})();
