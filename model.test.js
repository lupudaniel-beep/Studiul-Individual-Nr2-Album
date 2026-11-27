import test from 'node:test';
import assert from 'node:assert/strict';
import { newAlbum, title, validateFile, movePhoto, validateAlbum, exportHTML, MAX_FILE_BYTES } from '../model.js';

const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
const sample = () => ({ ...newAlbum('Vacanță'), photos: [{ id: 'a', name: 'a.png', caption: '', src: pixel }, { id: 'b', name: 'b.png', caption: '', src: pixel }] });
test('creează albume independente cu titlu normalizat', () => {
  const a = newAlbum('  Vacanță  '), b = newAlbum('Familie');
  assert.equal(a.title, 'Vacanță'); assert.notEqual(a.id, b.id); assert.deepEqual(a.photos, []);
});
test('respinge titluri goale și excesiv de lungi', () => {
  for (const value of ['', '  ', null, 'a'.repeat(101)]) assert.throws(() => title(value));
});
test('validează formatul și mărimea fișierelor', () => {
  assert.doesNotThrow(() => validateFile({ type: 'image/jpeg', size: MAX_FILE_BYTES }));
  for (const file of [{ type: 'image/svg+xml', size: 50 }, { type: 'image/png', size: 0 }, { type: 'image/png', size: MAX_FILE_BYTES + 1 }]) assert.throws(() => validateFile(file));
});
test('reordonează și protejează limitele albumului', () => {
  const a = sample(); assert.equal(movePhoto(a, 'a', -1), false); assert.equal(movePhoto(a, 'a', 1), true);
  assert.deepEqual(a.photos.map(p => p.id), ['b', 'a']); assert.equal(movePhoto(a, 'absent', 1), false); assert.equal(movePhoto(a, 'a', 2), false);
});
test('importul creează identități noi și păstrează conținutul', () => {
  const a = sample(), b = validateAlbum(JSON.parse(JSON.stringify(a)));
  assert.notEqual(a.id, b.id); assert.notEqual(a.photos[0].id, b.photos[0].id); assert.equal(a.photos[0].src, b.photos[0].src);
});
test('respinge surse active, URL-uri externe și albume invalide', () => {
  for (const src of ['javascript:alert(1)', 'https://example.com/a.jpg', 'data:image/svg+xml;base64,PHN2Zz4=', 'data:image/png;base64,abc" onerror="alert(1)']) assert.throws(() => validateAlbum({ title: 'x', photos: [{ src }] }));
  assert.throws(() => validateAlbum({ title: 'x', photos: Array(101).fill({ src: pixel }) }));
  assert.throws(() => validateAlbum(null));
});
test('export HTML portabil cu text escapadat și imagini incluse', () => {
  const a = sample(); a.title = '<script>alert(1)</script>'; a.photos[0].caption = '<img src=x onerror=alert(1)>';
  const html = exportHTML(a); assert.ok(html.includes(pixel)); assert.ok(html.includes('&lt;script&gt;')); assert.ok(!html.includes('<script>')); assert.ok(!html.includes('<img src=x'));
});
