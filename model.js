export const MAX_PHOTOS = 100;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function title(value) {
  const result = String(value ?? '').trim();
  if (!result || result.length > 100) throw new Error('Titlul trebuie să aibă între 1 și 100 de caractere.');
  return result;
}

export function newAlbum(name, id = crypto.randomUUID()) {
  return { id, title: title(name), description: '', layout: 'grid', createdAt: new Date().toISOString(), photos: [] };
}

export function validateFile(file) {
  if (!IMAGE_TYPES.has(file.type)) throw new Error('Folosește fotografii JPG, PNG, WebP sau GIF.');
  if (!file.size || file.size > MAX_FILE_BYTES) throw new Error('Fiecare fotografie trebuie să aibă cel mult 10 MB și să nu fie goală.');
}

export function movePhoto(album, id, direction) {
  const index = album.photos.findIndex(p => p.id === id);
  const target = index + direction;
  if (![-1, 1].includes(direction) || index < 0 || target < 0 || target >= album.photos.length) return false;
  [album.photos[index], album.photos[target]] = [album.photos[target], album.photos[index]];
  return true;
}

export function validateAlbum(value) {
  if (!value || !Array.isArray(value.photos) || value.photos.length > MAX_PHOTOS) throw new Error('Album invalid sau prea multe fotografii.');
  const album = newAlbum(value.title);
  album.description = String(value.description ?? '').slice(0, 500);
  album.layout = value.layout === 'story' ? 'story' : 'grid';
  album.photos = value.photos.map(p => {
    if (!p || typeof p.src !== 'string' || p.src.length > 15_000_000 || !/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(p.src)) throw new Error('Fotografie invalidă în fișierul importat.');
    return { id: crypto.randomUUID(), name: String(p.name ?? 'Fotografie').slice(0, 150), caption: String(p.caption ?? '').slice(0, 250), src: p.src };
  });
  return album;
}

export function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function exportHTML(album) {
  const safe = validateAlbum(album);
  return `<!doctype html><html lang="ro"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(safe.title)}</title><style>body{font:18px system-ui;margin:40px auto;max-width:1100px;padding:0 20px;color:#172a29}h1{font-size:48px}main{display:grid;grid-template-columns:${safe.layout === 'story' ? '1fr' : 'repeat(auto-fit,minmax(260px,1fr))'};gap:24px}figure{margin:0;break-inside:avoid}img{width:100%;max-height:80vh;object-fit:contain;border-radius:12px}figcaption{padding:12px 0;white-space:pre-wrap}p{white-space:pre-wrap}@media print{body{margin:0}img{max-height:65vh}}</style><h1>${escapeHTML(safe.title)}</h1><p>${escapeHTML(safe.description)}</p><main>${safe.photos.map(p => `<figure><img src="${p.src}" alt="${escapeHTML(p.caption || p.name)}"><figcaption>${escapeHTML(p.caption)}</figcaption></figure>`).join('')}</main></html>`;
}
