import { SourceRecord } from '../types';

/**
 * Intelligent parser for NotebookLM raw extracts, multi-line YouTube links,
 * and continuous reference updates from Bos Besar.
 */
export function parseNotebookLmBatchText(
  rawText: string,
  defaultNotebookUrl: string = 'https://notebooklm.google.com/notebook/4life-official-library'
): Array<Partial<SourceRecord>> {
  if (!rawText || !rawText.trim()) return [];

  const trimmed = rawText.trim();
  const results: Array<Partial<SourceRecord>> = [];
  const today = new Date().toISOString().split('T')[0];

  // 1. Check if input is a series of YouTube URLs (one or more per line)
  const ytRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)[^\s]*)/gi;
  const youtubeMatches = Array.from(trimmed.matchAll(ytRegex));

  // If input contains lines that start with or are primarily YouTube URLs
  if (youtubeMatches.length > 0 && trimmed.split('\n').filter(l => l.trim()).length <= youtubeMatches.length + 2) {
    youtubeMatches.forEach((match, idx) => {
      const url = match[1];
      // Try to find if there's a title in the same line
      const line = trimmed.split('\n').find(l => l.includes(url)) || '';
      const customTitle = line.replace(url, '').replace(/^[-–—:\d.\s]+/, '').trim();

      results.push({
        sourceId: `SRC-NLM-YT-${Date.now().toString().slice(-4)}-${idx + 1}`,
        title: customTitle || `Video Edukasi YouTube Resmi 4Life #${idx + 1}`,
        publisher: '4Life Indonesia Official YouTube Channel',
        sourceType: 'youtube_link',
        publicationDate: today,
        retrievalDate: today,
        urlOrDoc: url,
        relevantPassage: `Video resmi 4Life: Rujukan materi edukasi audio-visual terkait produk atau sains imunitas (${url}).`,
        status: 'VERIFIED',
        category: 'product',
        notebookLmRef: 'NotebookLM / Sumber YouTube Baru',
        mediaUrl: url,
      });
    });

    if (results.length > 0) return results;
  }

  // 2. Check if input is structured with numbered items (e.g. "1. Judul: ...", "2. ...")
  const numberedBlocks = trimmed.split(/(?:\r?\n)(?=\d+[\.\)]\s+)/);
  if (numberedBlocks.length > 1) {
    numberedBlocks.forEach((block, idx) => {
      const cleanBlock = block.replace(/^\d+[\.\)]\s+/, '').trim();
      if (!cleanBlock) return;

      const lines = cleanBlock.split('\n').map(l => l.trim()).filter(Boolean);
      const firstLine = lines[0] || 'Referensi Baru NotebookLM';
      const body = lines.slice(1).join(' ') || cleanBlock;

      const isYt = cleanBlock.includes('youtube.com') || cleanBlock.includes('youtu.be');
      const isPdf = /\.pdf\b/i.test(cleanBlock) || /dokumen\s+pdf/i.test(cleanBlock);

      let detectedType: SourceRecord['sourceType'] = 'notebooklm_extract';
      let pub = 'NotebookLM AI Synthesis (Berkas Resmi)';
      let cat: SourceRecord['category'] = 'product';

      if (isYt) {
        detectedType = 'youtube_link';
        pub = '4Life Indonesia Official YouTube';
      } else if (isPdf) {
        detectedType = 'pdf_document';
        pub = '4Life Research Official Document';
      }

      if (/bisnis|kemitraan|penjualan|apli/i.test(cleanBlock)) {
        cat = 'business_ethics';
      } else if (/sains|imun|molekul|sel\s+nk/i.test(cleanBlock)) {
        cat = 'science';
      } else if (/bpom|regulasi|ijin|edar/i.test(cleanBlock)) {
        cat = 'regulation';
      }

      results.push({
        sourceId: `SRC-NLM-${Date.now().toString().slice(-4)}-${idx + 1}`,
        title: firstLine.length > 80 ? firstLine.slice(0, 80) + '...' : firstLine,
        publisher: pub,
        sourceType: detectedType,
        publicationDate: today,
        retrievalDate: today,
        urlOrDoc: defaultNotebookUrl,
        relevantPassage: body.length > 30 ? body : cleanBlock,
        status: 'VERIFIED',
        category: cat,
        notebookLmRef: 'NotebookLM / Pembaruan Referensi Bos Besar',
      });
    });

    if (results.length > 0) return results;
  }

  // 3. Fallback: Parse paragraphs or bullet points
  const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 20);
  if (paragraphs.length > 1) {
    paragraphs.forEach((p, idx) => {
      const pClean = p.trim();
      const firstSentence = pClean.split(/[.\n]/)[0] || `Catatan Referensi Baru #${idx + 1}`;

      results.push({
        sourceId: `SRC-NLM-${Date.now().toString().slice(-4)}-${idx + 1}`,
        title: firstSentence.length > 70 ? firstSentence.slice(0, 70) + '...' : firstSentence,
        publisher: 'Google NotebookLM (Berkas Resmi 4Life)',
        sourceType: 'notebooklm_extract',
        publicationDate: today,
        retrievalDate: today,
        urlOrDoc: defaultNotebookUrl,
        relevantPassage: pClean,
        status: 'VERIFIED',
        category: 'product',
        notebookLmRef: 'NotebookLM / Pembaruan Berkas Terkini',
      });
    });

    if (results.length > 0) return results;
  }

  // 4. Single cohesive note or study guide extract
  results.push({
    sourceId: `SRC-NLM-${Date.now().toString().slice(-4)}-1`,
    title: trimmed.split('\n')[0].slice(0, 80) || 'Pembaruan Dokumen & Rujukan NotebookLM',
    publisher: 'Google NotebookLM (Berkas Resmi 4Life)',
    sourceType: 'notebooklm_extract',
    publicationDate: today,
    retrievalDate: today,
    urlOrDoc: defaultNotebookUrl,
    relevantPassage: trimmed,
    status: 'VERIFIED',
    category: 'product',
    notebookLmRef: 'NotebookLM / Pembaruan Berkas Terkini',
  });

  return results;
}
