import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNotebookLmBatchText } from './notebookSync.ts';

test('accurately parses multiple YouTube URLs into discrete verified sources', () => {
  const rawUrls = `
https://www.youtube.com/watch?v=dQw4w9WgXcQ 4Life Transfer Factor Penjelasan Resmi
https://youtu.be/abc123xyz Video Edukasi Sel Imun BPOM
`;

  const parsed = parseNotebookLmBatchText(rawUrls);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].sourceType, 'youtube_link');
  assert.equal(parsed[0].status, 'VERIFIED');
  assert.ok(parsed[0].urlOrDoc?.includes('youtube.com'));
});

test('parses numbered blocks into structured sources with category inference', () => {
  const numbered = `
1. Riset Molekuler Peptida Kolostrum 4Life
Dokumen PDF sains: Peptida mentransfer informasi memori ke sel NK tanpa reaksi alergi.

2. Panduan Etika Penjualan Langsung APLI
Pedoman kemitraan: Kompensasi wajib didasarkan penjualan produk bukan biaya perekrutan.
`;

  const parsed = parseNotebookLmBatchText(numbered);
  assert.equal(parsed.length, 2);
  assert.ok(parsed[0].title?.includes('Riset Molekuler'));
  assert.equal(parsed[0].category, 'science');
  assert.ok(parsed[1].title?.includes('Panduan Etika'));
  assert.equal(parsed[1].category, 'business_ethics');
});
