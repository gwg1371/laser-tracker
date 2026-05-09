// utils.js — Date helpers and computed data for LazeTrack
const Utils = (() => {

  function addDays(dateStr, days) {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + days);
    return d;
  }

  function diffDays(d1, d2) {
    const a = new Date(d1); a.setHours(0, 0, 0, 0);
    const b = new Date(d2); b.setHours(0, 0, 0, 0);
    return Math.round((a - b) / 86400000);
  }

  function todayString() {
    return new Date().toISOString().split('T')[0];
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
  }

  function formatDateShort(dateStr) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });
  }

  function formatRelative(dateStr) {
    const diff = diffDays(new Date(), new Date(dateStr + 'T12:00:00'));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff === -1) return 'Tomorrow';
    if (diff > 0) return `${diff} days ago`;
    return `In ${Math.abs(diff)} days`;
  }

  function getNextDueDate(areaId) {
    const last = Store.getLastSession(areaId);
    const area = Store.getArea(areaId);
    if (!last || !area) return null;
    return addDays(last.date, area.intervalDays);
  }

  function getDaysUntilDue(areaId) {
    const next = getNextDueDate(areaId);
    if (!next) return null;
    return diffDays(next, new Date());
  }

  function getDueDateStatus(areaId) {
    const days = getDaysUntilDue(areaId);
    if (days === null) return { status: 'never', label: 'No sessions yet', color: 'text-on-surface-variant' };
    if (days < 0)  return { status: 'overdue', label: `${Math.abs(days)} days overdue`, color: 'text-error' };
    if (days === 0) return { status: 'due',    label: 'Due today',          color: 'text-tertiary' };
    if (days <= 3)  return { status: 'soon',   label: `In ${days} days`,    color: 'text-tertiary' };
    return              { status: 'ok',     label: `In ${days} days`,    color: 'text-on-surface-variant' };
  }

  function getProgress(areaId) {
    const area  = Store.getArea(areaId);
    const count = Store.getSessionsForArea(areaId).length;
    const total = (area && area.totalSessions) || 10;
    return { count, total, percent: Math.min(100, Math.round((count / total) * 100)) };
  }

  function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  function compressImage(file, maxPx = 900, quality = 0.78) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxPx || height > maxPx) {
            if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
            else                { width  = Math.round(width  * maxPx / height); height = maxPx; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  return {
    addDays, diffDays, todayString,
    formatDate, formatDateShort, formatRelative,
    getNextDueDate, getDaysUntilDue, getDueDateStatus,
    getProgress, generateId, compressImage
  };
})();
