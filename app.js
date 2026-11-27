import { newAlbum, title, validateFile, movePhoto, validateAlbum, exportHTML, MAX_PHOTOS } from './model.js';

const $ = id => document.getElementById(id);
let albums = [], selectedId = null, db, busy = false, editing = false, viewerIndex = 0, noticeTimer;
const current = () => albums.find(a => a.id === selectedId);
const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
function notify(message, error = false) {
  clearTimeout(noticeTimer); $('status').textContent = message; $('status').className = error ? 'error' : ''; $('status').hidden = false;
  noticeTimer = setTimeout(() => { $('status').hidden = true; }, error ? 12000 : 5000);
}
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('albumia', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('library');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Închide celelalte ferestre Albumia și reîncarcă pagina.'));
  });
}
function load() {
  return new Promise((resolve, reject) => {
    const request = db.transaction('library').objectStore('library').get('albums');
    request.onsuccess = () => resolve(request.result || []); request.onerror = () => reject(request.error);
  });
}
function save() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('library', 'readwrite');
    transaction.objectStore('library').put(albums, 'albums');
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Salvarea a fost întreruptă.'));
  });
}
async function change(action, success, redraw = true) {
  if (busy) { notify('Așteaptă terminarea operației curente.'); return false; }
  if (!db) { notify('Salvarea locală nu este disponibilă. Reîncarcă pagina într-un browser cu IndexedDB activ.', true); return false; }
  busy = true; const previous = structuredClone(albums), previousId = selectedId;
  $('save-state').textContent = 'Se salvează…';
  try { await action(); await save(); if (redraw) render(); if (success) notify(success); return true; }
  catch (error) { albums = previous; selectedId = previousId; render(); notify(error.name === 'QuotaExceededError' ? 'Spațiul local este plin. Exportă un backup și eliberează spațiu înainte de a încerca din nou.' : error.message || 'Operația nu a putut fi salvată.', true); return false; }
  finally { busy = false; $('save-state').textContent = 'Salvat pe dispozitiv'; }
}
function renderList() {
  $('album-count').textContent = albums.length;
  $('album-list').replaceChildren();
  const query = $('search').value.toLocaleLowerCase('ro');
  for (const album of albums.filter(a => a.title.toLocaleLowerCase('ro').includes(query))) {
    const button = el('button', 'album-item'); button.setAttribute('aria-current', String(album.id === selectedId));
    if (album.photos.length) { const img = el('img'); img.src = album.photos[0].src; img.alt = ''; button.append(img); }
    else button.append(el('span', 'album-placeholder', '▧'));
    const text = el('span'); text.append(el('span', 'album-name', album.title), el('small', '', `${album.photos.length} fotografii`)); button.append(text);
    button.onclick = () => { if (busy) return; selectedId = album.id; render(); }; $('album-list').append(button);
  }
  if (!$('album-list').children.length && query) $('album-list').append(el('p', 'meta', 'Niciun album găsit.'));
}
function render() {
  renderList(); const album = current(); $('welcome').hidden = !!album; $('editor').hidden = !album;
  if (!album) return;
  $('album-title').textContent = album.title; $('album-description').textContent = album.description;
  $('album-meta').textContent = `${album.photos.length} / ${MAX_PHOTOS} fotografii · Creat pe ${new Date(album.createdAt).toLocaleDateString('ro-RO')}`;
  $('layout-grid').setAttribute('aria-pressed', String(album.layout === 'grid')); $('layout-story').setAttribute('aria-pressed', String(album.layout === 'story'));
  $('drop-zone').classList.toggle('compact', album.photos.length > 0);
  $('photo-grid').className = `photo-grid ${album.layout === 'story' ? 'story' : ''}`;
  $('photo-grid').replaceChildren();
  album.photos.forEach((photo, index) => {
    const card = el('article', 'photo-card'), open = el('button', 'photo-open'), img = el('img');
    img.src = photo.src; img.alt = photo.caption || photo.name; img.loading = 'lazy'; open.append(img); open.setAttribute('aria-label', `Vezi fotografia ${index + 1}: ${photo.caption || photo.name}`);
    if (!index) open.append(el('span', 'cover-badge', 'Coperta albumului'));
    open.onclick = () => showPhoto(index); card.append(open);
    const body = el('div', 'photo-body'), label = el('label', '', `Momentul ${String(index + 1).padStart(2, '0')}`), caption = el('textarea');
    caption.id = `caption-${photo.id}`; label.htmlFor = caption.id; caption.maxLength = 250; caption.rows = 2; caption.placeholder = 'Adaugă o descriere…'; caption.value = photo.caption;
    caption.onchange = () => { const value = caption.value; change(() => { photo.caption = value; img.alt = value || photo.name; open.setAttribute('aria-label', `Vezi fotografia ${index + 1}: ${value || photo.name}`); }, undefined, false); };
    const controls = el('div', 'photo-controls'), reorder = el('div');
    for (const [text, direction] of [['Înapoi', -1], ['Înainte', 1]]) {
      const button = el('button', 'ghost', text); button.disabled = index + direction < 0 || index + direction >= album.photos.length;
      button.setAttribute('aria-label', `Mută fotografia ${index + 1} ${text.toLocaleLowerCase('ro')}`); button.onclick = () => change(() => movePhoto(album, photo.id, direction)); reorder.append(button);
    }
    const remove = el('button', 'danger ghost', 'Șterge'); remove.setAttribute('aria-label', `Șterge fotografia ${index + 1}`);
    remove.onclick = () => { if (confirm('Ștergi această fotografie din album?')) change(() => { album.photos = album.photos.filter(p => p.id !== photo.id); }, 'Fotografie eliminată.'); };
    controls.append(reorder, remove); body.append(label, caption, controls); card.append(body); $('photo-grid').append(card);
  });
}
function albumDialog(edit = false) {
  if (busy) return; editing = edit; const album = edit ? current() : null;
  $('dialog-title').textContent = edit ? 'Povestea albumului.' : 'Un nou început.';
  $('name-input').value = album?.title || ''; $('description-input').value = album?.description || '';
  $('album-dialog').showModal(); $('name-input').focus();
}
$('new-album').onclick = $('first-album').onclick = () => albumDialog();
$('edit-album').onclick = () => albumDialog(true);
$('cancel-dialog').onclick = () => $('album-dialog').close();
$('album-form').onsubmit = async event => {
  event.preventDefault(); const name = $('name-input').value, description = $('description-input').value.trim();
  const ok = await change(() => { if (editing) { current().title = title(name); current().description = description; } else { const album = newAlbum(name); album.description = description; albums.unshift(album); selectedId = album.id; } }, 'Album salvat.');
  if (ok) $('album-dialog').close();
};
$('search').oninput = renderList;
for (const layout of ['grid', 'story']) $(`layout-${layout}`).onclick = () => change(() => { current().layout = layout; });
$('delete-album').onclick = () => { const album = current(); if (confirm(`Ștergi albumul „${album.title}” și toate fotografiile sale? Exportă mai întâi un backup dacă vrei să-l păstrezi.`)) change(() => { albums = albums.filter(a => a.id !== album.id); selectedId = albums[0]?.id || null; }, 'Album șters.'); };

async function readPhoto(file) {
  validateFile(file);
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error(`„${file.name}” nu este o imagine validă.`); }
  try {
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d'); context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return { id: crypto.randomUUID(), name: file.name.slice(0, 150), caption: '', src: canvas.toDataURL('image/jpeg', .88) };
  } finally { bitmap.close(); }
}
async function addPhotos(files) {
  const album = current(); if (!album || !files.length) return;
  await change(async () => {
    if (album.photos.length + files.length > MAX_PHOTOS) throw new Error(`Un album poate avea cel mult ${MAX_PHOTOS} fotografii.`);
    const photos = []; for (const file of files) photos.push(await readPhoto(file)); album.photos.push(...photos);
  }, `${files.length} fotografii adăugate.`);
}
$('add-photos').onclick = $('drop-zone').onclick = () => { if (!busy) $('photo-input').click(); };
$('drop-zone').onkeydown = e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); $('drop-zone').click(); } };
$('photo-input').onchange = async () => { const files = [...$('photo-input').files]; $('photo-input').value = ''; await addPhotos(files); };
for (const event of ['dragenter', 'dragover']) $('drop-zone').addEventListener(event, e => { e.preventDefault(); $('drop-zone').classList.add('dragging'); });
$('drop-zone').ondragleave = () => $('drop-zone').classList.remove('dragging');
$('drop-zone').ondrop = e => { e.preventDefault(); $('drop-zone').classList.remove('dragging'); addPhotos([...e.dataTransfer.files]); };
// Prevent the browser from navigating to a photograph dropped outside the upload area.
window.addEventListener('dragover', e => e.preventDefault()); window.addEventListener('drop', e => e.preventDefault());
function download(content, type, extension) {
  const url = URL.createObjectURL(new Blob([content], { type })), link = el('a');
  link.href = url; link.download = `${current().title.replace(/[^\p{L}\p{N}\s_-]/gu, '').trim() || 'album'}.${extension}`;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
$('backup-album').onclick = () => { if (!busy) download(JSON.stringify(current(), null, 2), 'application/json', 'json'); };
$('export-album').onclick = () => { if (busy) return; try { download(exportHTML(current()), 'text/html', 'html'); notify('Album exportat. Deschide fișierul HTML pentru vizualizare sau tipărire.'); } catch (e) { notify(e.message, true); } };
$('import-album').onclick = () => { if (!busy) $('import-input').click(); };
$('import-input').onchange = async () => {
  const file = $('import-input').files[0]; $('import-input').value = ''; if (!file) return;
  await change(async () => {
    if (file.size > 100 * 1024 * 1024) throw new Error('Backup-ul depășește limita de import de 100 MB.');
    let value; try { value = JSON.parse(await file.text()); } catch { throw new Error('Fișierul nu conține un album JSON valid.'); }
    const album = validateAlbum(value);
    for (const photo of album.photos) {
      const blob = await (await fetch(photo.src)).blob(); let bitmap;
      try { bitmap = await createImageBitmap(blob); } catch { throw new Error('Backup-ul conține o imagine deteriorată.'); } finally { bitmap?.close(); }
    }
    albums.unshift(album); selectedId = album.id;
  }, 'Album importat ca o copie nouă.');
};
function showPhoto(index) {
  const album = current(); if (!album?.photos.length) return; viewerIndex = (index + album.photos.length) % album.photos.length;
  const photo = album.photos[viewerIndex]; $('viewer-image').src = photo.src; $('viewer-image').alt = photo.caption || photo.name;
  $('viewer-caption').textContent = photo.caption || photo.name; $('viewer-position').textContent = `${viewerIndex + 1} / ${album.photos.length}`;
  if (!$('viewer').open) $('viewer').showModal();
}
$('close-viewer').onclick = () => $('viewer').close(); $('previous-photo').onclick = () => showPhoto(viewerIndex - 1); $('next-photo').onclick = () => showPhoto(viewerIndex + 1);
$('viewer').onkeydown = e => { if (e.key === 'ArrowLeft') showPhoto(viewerIndex - 1); if (e.key === 'ArrowRight') showPhoto(viewerIndex + 1); };
try { db = await openDB(); albums = await load(); selectedId = albums[0]?.id || null; $('save-state').textContent = 'Salvat pe dispozitiv'; render(); }
catch { $('save-state').textContent = 'Stocare indisponibilă'; notify('Nu pot accesa albumele locale. Verifică permisiunile de stocare ale browserului și reîncarcă pagina.', true); }
