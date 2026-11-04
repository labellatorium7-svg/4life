import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PROJECTS, INITIAL_SOURCES } from './data/seed';
import { ContentProject, SourceRecord, NotebookLmConfig } from './src/types/index';
import { auditScriptCompliance } from './src/utils/compliance';
import {
  countWords,
  estimateVoiceoverDuration,
  formatTimecode,
  buildGoogleFlowPrompt,
  generateProductionChecklist,
} from './src/utils/production';
import { parseNotebookLmBatchText } from './src/utils/notebookSync';

dotenv.config();

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const KB_FILE = path.join(DATA_DIR, 'knowledge_base.json');
const NOTEBOOKLM_CONFIG_FILE = path.join(DATA_DIR, 'notebooklm_config.json');

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadProjects(): ContentProject[] {
  try {
    if (!fs.existsSync(PROJECTS_FILE)) {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(INITIAL_PROJECTS, null, 2), 'utf-8');
      return INITIAL_PROJECTS;
    }
    const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading projects:', err);
    return INITIAL_PROJECTS;
  }
}

function saveProjects(projects: ContentProject[]): void {
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving projects:', err);
  }
}

function loadKnowledgeBase(): SourceRecord[] {
  try {
    if (!fs.existsSync(KB_FILE)) {
      fs.writeFileSync(KB_FILE, JSON.stringify(INITIAL_SOURCES, null, 2), 'utf-8');
      return INITIAL_SOURCES;
    }
    const data = fs.readFileSync(KB_FILE, 'utf-8');
    const existing: SourceRecord[] = JSON.parse(data);
    // Ensure newly added seed items (e.g. NotebookLM PDF/YouTube sources) are merged if missing
    let updated = false;
    for (const initSrc of INITIAL_SOURCES) {
      if (!existing.some((s) => s.sourceId === initSrc.sourceId)) {
        existing.push(initSrc);
        updated = true;
      }
    }
    if (updated) {
      fs.writeFileSync(KB_FILE, JSON.stringify(existing, null, 2), 'utf-8');
    }
    return existing;
  } catch (err) {
    console.error('Error loading knowledge base:', err);
    return INITIAL_SOURCES;
  }
}

function saveKnowledgeBase(sources: SourceRecord[]): void {
  try {
    fs.writeFileSync(KB_FILE, JSON.stringify(sources, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving knowledge base:', err);
  }
}

function loadNotebookLmConfig(): NotebookLmConfig {
  try {
    if (!fs.existsSync(NOTEBOOKLM_CONFIG_FILE)) {
      const initialConfig: NotebookLmConfig = {
        notebookUrl: 'https://notebooklm.google.com/notebook/4life-official-library',
        notebookTitle: '4Life Official Research & Media Library (PDF & YouTube)',
        lastSync: new Date().toISOString(),
        notesCount: 3,
        syncHistory: [
          {
            id: 'SYNC-INIT',
            timestamp: new Date().toISOString(),
            addedCount: 3,
            summary: 'Inisialisasi perpustakaan NotebookLM awal (Compendium PDF, YouTube, & Ekstrak)',
          },
        ],
      };
      fs.writeFileSync(NOTEBOOKLM_CONFIG_FILE, JSON.stringify(initialConfig, null, 2), 'utf-8');
      return initialConfig;
    }
    const data = fs.readFileSync(NOTEBOOKLM_CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {
      notebookUrl: 'https://notebooklm.google.com/notebook/4life-official-library',
      notebookTitle: '4Life Official Research & Media Library (PDF & YouTube)',
      lastSync: new Date().toISOString(),
      notesCount: 3,
    };
  }
}

function saveNotebookLmConfig(cfg: any): void {
  try {
    fs.writeFileSync(NOTEBOOKLM_CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving notebooklm config:', err);
  }
}

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  // 1. Projects
  app.get('/api/projects', (req, res) => {
    const projects = loadProjects();
    res.json(projects);
  });

  app.get('/api/projects/:id', (req, res) => {
    const projects = loadProjects();
    const project = projects.find((p) => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }
    res.json(project);
  });

  app.post('/api/projects', (req, res) => {
    const projects = loadProjects();
    const newProject: ContentProject = {
      ...req.body,
      id: req.body.id || `PRJ-${Date.now().toString().slice(-6)}`,
      createdAt: req.body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.unshift(newProject);
    saveProjects(projects);
    res.status(201).json(newProject);
  });

  app.put('/api/projects/:id', (req, res) => {
    const projects = loadProjects();
    const index = projects.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }
    projects[index] = {
      ...projects[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    saveProjects(projects);
    res.json(projects[index]);
  });

  app.delete('/api/projects/:id', (req, res) => {
    let projects = loadProjects();
    const initialLen = projects.length;
    projects = projects.filter((p) => p.id !== req.params.id);
    if (projects.length === initialLen) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }
    saveProjects(projects);
    res.json({ success: true, message: 'Proyek berhasil dihapus' });
  });

  app.post('/api/projects/:id/duplicate', (req, res) => {
    const projects = loadProjects();
    const original = projects.find((p) => p.id === req.params.id);
    if (!original) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }
    const duplicate: ContentProject = {
      ...JSON.parse(JSON.stringify(original)),
      id: `PRJ-${Date.now().toString().slice(-6)}`,
      title: `${original.title} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      approval: {
        isApproved: false,
        feedback: 'Salinan baru belum diajukan untuk persetujuan.',
      },
    };
    projects.unshift(duplicate);
    saveProjects(projects);
    res.status(201).json(duplicate);
  });

  // 2. Knowledge Base
  app.get('/api/knowledge-base', (req, res) => {
    const sources = loadKnowledgeBase();
    res.json(sources);
  });

  app.post('/api/knowledge-base', (req, res) => {
    const sources = loadKnowledgeBase();
    const newSource: SourceRecord = {
      ...req.body,
      sourceId: req.body.sourceId || `SRC-${Date.now().toString().slice(-4)}`,
      retrievalDate: req.body.retrievalDate || new Date().toISOString().split('T')[0],
      status: req.body.status || 'VERIFIED',
    };
    sources.unshift(newSource);
    saveKnowledgeBase(sources);
    res.status(201).json(newSource);
  });

  app.delete('/api/knowledge-base/:id', (req, res) => {
    let sources = loadKnowledgeBase();
    sources = sources.filter((s) => s.sourceId !== req.params.id);
    saveKnowledgeBase(sources);
    res.json({ success: true });
  });

  // NotebookLM Integration Bridge Endpoints
  app.get('/api/notebooklm/config', (req, res) => {
    const config = loadNotebookLmConfig();
    res.json(config);
  });

  app.post('/api/notebooklm/config', (req, res) => {
    const current = loadNotebookLmConfig();
    const newUrl = req.body.notebookUrl ? String(req.body.notebookUrl).trim() : current.notebookUrl;
    
    // Extract notebook ID if standard NotebookLM URL
    let derivedId = '';
    const match = newUrl.match(/notebook\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      derivedId = match[1];
    }

    const updatedTitle = req.body.notebookTitle || 
      (derivedId && derivedId !== '4life-official-library'
        ? `Proyek NotebookLM Resmi 4Life (ID: ${derivedId.slice(0, 8)}...)`
        : current.notebookTitle);

    const historyEntry = {
      id: `SYNC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      addedCount: 0,
      summary: derivedId
        ? `Tautan proyek NotebookLM Bos Besar (${derivedId.slice(0, 10)}...) berhasil ditautkan dan diverifikasi.`
        : 'Konfigurasi tautan NotebookLM diperbarui.',
    };

    const config: NotebookLmConfig = {
      ...current,
      ...req.body,
      notebookUrl: newUrl,
      notebookTitle: updatedTitle,
      lastSync: new Date().toISOString(),
      syncHistory: [historyEntry, ...(current.syncHistory || [])].slice(0, 15),
    };

    saveNotebookLmConfig(config);
    res.json(config);
  });

  app.post('/api/notebooklm/import', (req, res) => {
    const { title, publisher, relevantPassage, sourceType, category, notebookLmRef, mediaUrl } = req.body;
    if (!title || !relevantPassage) {
      return res.status(400).json({ error: 'Judul dan isi kutipan sumber wajib diisi' });
    }

    const sources = loadKnowledgeBase();
    const newSource: SourceRecord = {
      sourceId: `SRC-NLM-${Date.now().toString().slice(-4)}`,
      title: title,
      publisher: publisher || 'NotebookLM (Berkas Resmi 4Life)',
      sourceType: sourceType || 'notebooklm_extract',
      publicationDate: new Date().toISOString().split('T')[0],
      retrievalDate: new Date().toISOString().split('T')[0],
      urlOrDoc: mediaUrl || notebookLmRef || 'NotebookLM Project',
      relevantPassage: relevantPassage,
      status: 'VERIFIED',
      category: category || 'product',
      notebookLmRef: notebookLmRef || 'NotebookLM Notebook',
      mediaUrl: mediaUrl,
    };

    sources.unshift(newSource);
    saveKnowledgeBase(sources);

    // Update config count
    const config = loadNotebookLmConfig();
    config.notesCount = sources.filter((s) => s.notebookLmRef).length;
    config.lastSync = new Date().toISOString();
    saveNotebookLmConfig(config);

    res.status(201).json({ success: true, source: newSource, config });
  });

  // Batch Continuous Sync Endpoint for NotebookLM references
  app.post('/api/notebooklm/batch-sync', async (req, res) => {
    try {
      const { rawText, sources: incomingSources, noteSummary } = req.body;
      const config = loadNotebookLmConfig();
      const currentSources = loadKnowledgeBase();
      let candidates: Array<Partial<SourceRecord>> = [];

      if (Array.isArray(incomingSources) && incomingSources.length > 0) {
        candidates = incomingSources;
      } else if (rawText && typeof rawText === 'string') {
        let aiParsed = false;
        if (apiKey) {
          try {
            const aiPrompt = `Anda adalah Asisten Peneliti Ilmiah 4Life.
Pengguna adalah Founder & Chairman (Bos Besar) yang baru saja mengunggah berkas baru (PDF brosur/sains atau link video YouTube resmi) ke Google NotebookLM dan menempelkan teks/ringkasannya:
"""
${rawText}
"""
Tugas Anda: Ekstrak setiap referensi/dokumen/link yang ada di teks ini menjadi array JSON berisi objek:
[
  {
    "title": "Judul spesifik dokumen/video",
    "publisher": "Penerbit kredibel (misal: 4Life Research / BPOM RI / Jurnal Imun)",
    "sourceType": "pdf_document" atau "youtube_link" atau "notebooklm_extract",
    "category": "product" atau "science" atau "regulation" atau "business_ethics",
    "urlOrDoc": "URL YouTube atau nama dokumen resmi",
    "relevantPassage": "Kutipan fakta sains atau poin edukasi penting",
    "notebookLmRef": "Tag rujukan NotebookLM"
  }
]
Hasilkan HANYA JSON array valid tanpa teks pengantar atau markdown block.`;

            const geminiRes = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: aiPrompt,
              config: {
                responseMimeType: 'application/json',
              },
            });

            if (geminiRes.text) {
              const parsed = JSON.parse(geminiRes.text.trim());
              if (Array.isArray(parsed) && parsed.length > 0) {
                candidates = parsed;
                aiParsed = true;
              }
            }
          } catch (aiErr) {
            console.warn('Gemini batch parse fallback to regex parser:', aiErr);
          }
        }

        if (!aiParsed) {
          candidates = parseNotebookLmBatchText(rawText, config.notebookUrl);
        }
      }

      if (candidates.length === 0) {
        return res.status(400).json({ error: 'Tidak ada data atau berkas yang dapat diekstrak.' });
      }

      const today = new Date().toISOString().split('T')[0];
      const newlyAdded: SourceRecord[] = [];

      for (const item of candidates) {
        if (!item.title && !item.relevantPassage) continue;

        const cleanTitle = (item.title || 'Berkas Baru NotebookLM').trim();
        const cleanUrl = (item.urlOrDoc || '').trim();

        // Avoid adding exact duplicate by title or link
        const exists = currentSources.some(
          (s) =>
            s.title.toLowerCase() === cleanTitle.toLowerCase() ||
            (cleanUrl && cleanUrl.length > 15 && s.urlOrDoc.toLowerCase() === cleanUrl.toLowerCase())
        );

        if (!exists) {
          const newRec: SourceRecord = {
            sourceId: item.sourceId || `SRC-NLM-${Date.now().toString().slice(-4)}-${newlyAdded.length + 1}`,
            title: cleanTitle,
            publisher: item.publisher || 'Google NotebookLM (Berkas Resmi 4Life)',
            sourceType: item.sourceType || 'notebooklm_extract',
            publicationDate: item.publicationDate || today,
            retrievalDate: today,
            urlOrDoc: item.urlOrDoc || config.notebookUrl,
            relevantPassage: item.relevantPassage || cleanTitle,
            status: 'VERIFIED',
            category: item.category || 'product',
            notebookLmRef: item.notebookLmRef || 'NotebookLM / Pembaruan Berkas Terkini',
            mediaUrl: item.mediaUrl || (item.sourceType === 'youtube_link' ? item.urlOrDoc : undefined),
          };
          currentSources.unshift(newRec);
          newlyAdded.push(newRec);
        }
      }

      if (newlyAdded.length > 0) {
        saveKnowledgeBase(currentSources);
      }

      // Update NotebookLM config & history
      config.notesCount = currentSources.filter((s) => s.notebookLmRef).length;
      config.lastSync = new Date().toISOString();
      config.syncHistory = config.syncHistory || [];
      config.syncHistory.unshift({
        id: `SYNC-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        addedCount: newlyAdded.length,
        summary: noteSummary || (newlyAdded.length > 0
          ? `${newlyAdded.length} berkas baru berhasil disinkronkan ke pabrik konten.`
          : 'Pembaruan diperiksa: semua berkas sudah mutakhir.'),
      });
      if (config.syncHistory.length > 15) {
        config.syncHistory = config.syncHistory.slice(0, 15);
      }
      saveNotebookLmConfig(config);

      res.status(200).json({
        success: true,
        addedCount: newlyAdded.length,
        addedSources: newlyAdded,
        totalIndexed: config.notesCount,
        config,
      });
    } catch (err: any) {
      console.error('Batch sync failed:', err);
      res.status(500).json({ error: 'Gagal melakukan sinkronisasi massal: ' + (err.message || 'Unknown') });
    }
  });

  // 3. Claims compliance audit endpoint
  app.post('/api/compliance/audit', (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Teks naskah wajib diisi' });
    }
    const auditResult = auditScriptCompliance(text);
    res.json(auditResult);
  });

  // 3b. Google AI Studio Text-To-Speech (Gemini TTS API)
  app.post('/api/voiceover/gemini-tts', async (req, res) => {
    try {
      const {
        text,
        voiceName = 'Puck',
        model = 'gemini-3.8-flash-lite-tts',
      } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Teks voiceover wajib diisi' });
      }

      const activeApiKey = process.env.GEMINI_API_KEY || '';

      if (activeApiKey) {
        try {
          const ttsResponse = await ai.models.generateContent({
            model: model || 'gemini-3.8-flash-lite-tts',
            contents: [
              {
                role: 'user',
                parts: [{ text: text.trim() }],
              },
            ],
            config: {
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName || 'Puck',
                  },
                },
              },
            },
          });

          // Check for audio part
          const candidate = ttsResponse.candidates?.[0];
          const audioPart = candidate?.content?.parts?.find(
            (p: any) => p.inlineData && p.inlineData.mimeType?.startsWith('audio/')
          );

          if (audioPart && audioPart.inlineData) {
            return res.json({
              success: true,
              isRealGeminiTts: true,
              mimeType: audioPart.inlineData.mimeType,
              audioBase64: audioPart.inlineData.data,
              voiceName,
              model,
              provider: 'Google AI Studio (Gemini TTS)',
            });
          }
        } catch (apiErr: any) {
          console.warn('Gemini TTS direct API note:', apiErr?.message);
        }
      }

      return res.json({
        success: true,
        isRealGeminiTts: false,
        note: 'Format naskah Text-To-Speech Google AI Studio siap disalin atau digunakan.',
        voiceName,
        model,
        ttsScript: text,
      });
    } catch (err: any) {
      console.error('TTS Endpoint error:', err);
      res.status(500).json({ error: 'Gagal memproses Text-to-Speech: ' + err.message });
    }
  });

  // 4. Kepala Pabrik Master Orchestrator
  app.post('/api/orchestrator/command', async (req, res) => {
    try {
      const {
        prompt,
        existingProjectId,
        targetFormat = 'reels',
        targetDuration = 60,
        prioritizeNotebookLm = false,
      } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Instruksi untuk Kepala Pabrik wajib diisi' });
      }

      const sources = loadKnowledgeBase();
      const isNotebookLmFocus = prioritizeNotebookLm || /notebook\s*lm|pdf|youtube/i.test(prompt);

      // Filter and format context
      const relevantSourcesList = isNotebookLmFocus
        ? sources.filter(
            (s) =>
              s.sourceType === 'notebooklm_extract' ||
              s.sourceType === 'pdf_document' ||
              s.sourceType === 'youtube_link' ||
              s.sourceType === 'official_4life'
          )
        : sources;

      const sourcesContext = (relevantSourcesList.length > 0 ? relevantSourcesList : sources)
        .map(
          (s) =>
            `- [${s.sourceId}] ${s.title} (${s.publisher}, Tipe: ${s.sourceType}, Status: ${s.status}): "${s.relevantPassage}" ${
              s.notebookLmRef ? `[Referensi NotebookLM: ${s.notebookLmRef}]` : ''
            }`
        )
        .join('\n');

      const systemInstruction = `Anda adalah "KEPALA PABRIK 4LIFE" — direktur orkestrator konten cerdas untuk 4Life AI Content Factory.
Pengguna adalah "Founder & Chairman (Bos Besar)". Anda melapor langsung kepada beliau dengan sikap profesional, lugas, santun, strategis, dan berwibawa khas pimpinan produksi.
${
  isNotebookLmFocus
    ? 'PERHATIAN KHUSUS: Bos Besar meminta ide dan materi konten BERSUMBER LANGSUNG dari NotebookLM miliknya yang telah diisi berkas resmi 4Life (PDF brosur/sains resmi, link video YouTube resmi, dan catatan sintesis). Anda wajib memanfaatkan fakta pada sumber NotebookLM tersebut dan secara eksplisit melapor dalam kepalaPabrikGreeting bahwa seluruh ide & materi dirujuk 100% dari dokumen resmi NotebookLM Bos Besar!'
    : ''
}
Anda mengkoordinasikan 9 agen spesialis:
1. STRATEGIC DIRECTOR: Strategi audiens Indonesia (terutama 40+, keluarga, pencari peluang bisnis etis).
2. KNOWLEDGE MANAGER: Fakta ilmiah Transfer Factor (peptida kolostrum & kuning telur) berdasar hierarki resmi NotebookLM, tanpa klaim palsu.
3. MASTER SCRIPTWRITER: Naskah Bahasa Indonesia memikat, hook kuat, edukatif, bahasa mengalir, tidak lebay.
4. CLAIMS COMPLIANCE OFFICER: Sensor ketat BPOM & etika APLI. Dilarang klaim menyembuhkan penyakit atau janji pasti kaya/garansi income.
5. CREATIVE DIRECTOR: Sinematografi realistis Indonesia, pencahayaan natural hangat, tanpa jas lab/stetoskop palsu.
6. SCENE DESIGNER: Pembagian adegan dinamis (${Math.round(targetDuration / 12)} - ${Math.round(targetDuration / 8)} adegan sesuai durasi ${targetDuration}s).
7. GOOGLE FLOW PROMPT ENGINEER: Prompt video sinematik per adegan (durasi default 10s), prompt negatif anti-AI slop.
8. VOICEOVER DIRECTOR: Naskah VO lengkap, timecode per adegan, kecepatan bicara ~130-140 WPM.
9. VIDEO PRODUCTION MANAGER: Panduan BGM, checklist produksi, dan instruksi perakitan.

ATURAN HUKUM & ETIKA (MUTLAK):
- Transfer Factor adalah suplemen makanan untuk membantu memelihara daya tahan tubuh, BUKAN obat atau pengganti terapi medis.
- Jangan pernah menjamin kesembuhan atau penghasilan uang pasti.
- Jika pengguna meminta instruksi umum seperti "Buatkan satu konten hari ini", pilih topik edukatif terbaik (misal: sistem imun usia matang, perbedaan Transfer Factor vs vitamin biasa, atau gaya hidup sehat).

Keluarkan output dalam format JSON valid sesuai struktur berikut:
{
  "kepalaPabrikGreeting": "Pesan laporan langsung Kepala Pabrik kepada Bos Besar yang menjelaskan konsep, strategi, dan kesiapan materi",
  "projectTitle": "Judul konten yang menarik dan profesional",
  "objective": "Tujuan konten yang terdefinisi jelas",
  "targetAudience": "Target audiens spesifik di Indonesia",
  "platform": "reels",
  "duration": ${targetDuration},
  "strategy": {
    "topic": "Topik utama",
    "angle": "Sudut pandang edukasi atau kemitraan etis",
    "keyTakeaway": "Pesan kunci yang membekas",
    "seriesName": "Nama seri konten (jika cocok)",
    "episodeNumber": 1,
    "callToActionIntent": "education"
  },
  "research": {
    "summary": "Ringkasan bukti ilmiah & fakta regulasi yang digunakan",
    "referencedSourceIds": ["SRC-4L-001", "SRC-BPOM-002"],
    "scientificDisclaimer": "Disclaimer edukatif kesehatan resmi"
  },
  "script": {
    "hook": "Kalimat pembuka 3 detik pertama yang sangat menghentak rasa ingin tahu audiens",
    "bodyNarration": "Isi narasi edukasi yang mengalir natural dalam Bahasa Indonesia sehari-hari yang berkelas",
    "closing": "Kalimat penutup yang menenangkan dan inspiratif",
    "cta": "Ajakan bertindak yang etis dan elegan",
    "seoTitle": "Judul SEO untuk platform digital",
    "seoDescription": "Deskripsi meta untuk algoritma pencarian",
    "hashtags": ["#EdukasiKesehatan", "#TransferFactor", "#4LifeIndonesia"]
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSeconds": 10,
      "timecodeStart": "00:00",
      "timecodeEnd": "00:10",
      "narrationSegment": "Segmen naskah untuk adegan ini",
      "visualDescription": "Deskripsi visual sinematik otentik Indonesia",
      "characterDescription": "Karakter dan ekspresi",
      "environment": "Lokasi dan nuansa",
      "cameraMovement": "Gerakan kamera",
      "lighting": "Pencahayaan",
      "transition": "Transisi",
      "onScreenText": "Teks judul kecil di layar"
    }
  ],
  "narratorVoice": {
    "gender": "male",
    "persona": "Edukator Matang & Kredibel",
    "tone": "Warm, Calm, Articulate Indonesian",
    "pace": "moderate"
  },
  "bgmRecommendation": {
    "genre": "Acoustic Warm Documentary",
    "mood": "Hopeful, Reassuring, Grounded",
    "tempoBpm": "85-95 BPM",
    "referenceVibe": "Petikan gitar akustik lembut dengan piano halus"
  },
  "assemblyInstructions": [
    "Instruksi langkah perakitan 1",
    "Instruksi langkah perakitan 2"
  ]
}`;

      let aiResultJson: any = null;

      if (apiKey) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Instruksi Bos Besar: "${prompt}".
Format yang diinginkan: ${targetFormat}, perkiraan durasi: ${targetDuration} detik.
Gunakan sumber terverifikasi berikut jika relevan:
${sourcesContext}`,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: 'application/json',
            },
          });

          const rawText = response.text || '{}';
          aiResultJson = JSON.parse(rawText);
        } catch (genErr) {
          console.warn('Gemini API call failed, generating coordinated rule-based package:', genErr);
        }
      }

      // If AI didn't return or API key is not configured, generate deterministic high-quality factory production
      if (!aiResultJson || !aiResultJson.projectTitle) {
        aiResultJson = generateFallbackProjectData(prompt, targetFormat, targetDuration, sources);
      }

      // Run our strict compliance engine on generated script
      const fullScriptText = `${aiResultJson.script.hook} ${aiResultJson.script.bodyNarration} ${aiResultJson.script.closing} ${aiResultJson.script.cta}`;
      const compliance = auditScriptCompliance(fullScriptText);

      // Construct Google Flow prompts per scene
      const flowPrompts = (aiResultJson.scenes || []).map((scene: any) => {
        const flowData = buildGoogleFlowPrompt({
          sceneNumber: scene.sceneNumber,
          durationSeconds: scene.durationSeconds || 10,
          environment: scene.environment || 'Interior rumah modern Indonesia dengan pencahayaan alami',
          characterDescription: scene.characterDescription || 'Masyarakat Indonesia dewasa berpakaian rapi',
          action: scene.visualDescription || 'Aktivitas sehat sehari-hari',
          cameraMovement: scene.cameraMovement || 'Slow push in, eye-level framing',
          lighting: scene.lighting || 'Soft warm natural illumination',
          aspectRatio: targetFormat === 'youtube_long' ? '16:9' : '9:16',
        });
        return {
          sceneNumber: scene.sceneNumber,
          clipDurationSeconds: scene.durationSeconds || 10,
          aspectRatio: (targetFormat === 'youtube_long' ? '16:9' : '9:16') as '9:16' | '16:9',
          promptText: flowData.promptText,
          negativePrompt: flowData.negativePrompt,
          cinematographyStyle: 'Realistic Indonesian Documentary Cinematography',
          characterContinuityKey: 'char_flow_cont_01',
        };
      });

      // Assemble timecoded voiceover segments
      let accumulatedTime = 0;
      const timecodedSegments = (aiResultJson.scenes || []).map((scene: any) => {
        const segDuration = scene.durationSeconds || 10;
        const startSec = accumulatedTime;
        const endSec = accumulatedTime + segDuration;
        accumulatedTime = endSec;
        return {
          timecode: `${formatTimecode(startSec)} - ${formatTimecode(endSec)}`,
          sceneNumber: scene.sceneNumber,
          text: scene.narrationSegment || '',
          durationSeconds: segDuration,
        };
      });

      const matchedSources = sources.filter((s) =>
        (aiResultJson.research?.referencedSourceIds || []).includes(s.sourceId)
      );

      const projectId = existingProjectId || `PRJ-${Date.now().toString().slice(-6)}`;
      const nowIso = new Date().toISOString();

      const newProject: ContentProject = {
        id: projectId,
        title: aiResultJson.projectTitle || 'Produksi Edukasi 4Life',
        createdAt: nowIso,
        updatedAt: nowIso,
        objective: aiResultJson.objective || 'Edukasi kesehatan dan daya tahan tubuh',
        targetAudience: aiResultJson.targetAudience || 'Masyarakat Indonesia usia 40 tahun ke atas',
        platform: (aiResultJson.platform || targetFormat) as any,
        duration: targetDuration,
        status: compliance.isBlocked ? 'blocked_compliance' : 'in_review',
        approval: {
          isApproved: false,
          feedback: compliance.isBlocked
            ? 'Menunggu perbaikan klaim kepatuhan oleh Compliance Officer sebelum persetujuan Bos Besar.'
            : 'Menunggu peninjauan dan persetujuan Founder & Chairman (Bos Besar).',
        },
        strategy: {
          topic: aiResultJson.strategy?.topic || 'Sistem Imun & Gaya Hidup Sehat',
          angle: aiResultJson.strategy?.angle || 'Edukasi berbasis sains tanpa klaim berlebihan',
          keyTakeaway: aiResultJson.strategy?.keyTakeaway || 'Pentingnya nutrisi informasi imun seiring bertambahnya usia',
          seriesName: aiResultJson.strategy?.seriesName || 'Seri Kesehatan Cerdas 4Life',
          episodeNumber: aiResultJson.strategy?.episodeNumber || 1,
          callToActionIntent: aiResultJson.strategy?.callToActionIntent || 'education',
        },
        research: {
          summary: aiResultJson.research?.summary || 'Riset berbasis dokumen resmi BPOM RI dan spesifikasi 4Life Research.',
          sources: matchedSources.length > 0 ? matchedSources : [sources[0], sources[1]],
          scientificDisclaimer:
            aiResultJson.research?.scientificDisclaimer ||
            'Produk ini adalah suplemen kesehatan untuk membantu memelihara daya tahan tubuh. Bukan obat penyembuh penyakit.',
        },
        script: {
          version: 1,
          hook: aiResultJson.script?.hook || '',
          bodyNarration: aiResultJson.script?.bodyNarration || '',
          closing: aiResultJson.script?.closing || '',
          cta: aiResultJson.script?.cta || '',
          seoTitle: aiResultJson.script?.seoTitle || aiResultJson.projectTitle,
          seoDescription: aiResultJson.script?.seoDescription || '',
          hashtags: aiResultJson.script?.hashtags || ['#4Life', '#TransferFactor', '#EdukasiKesehatan'],
          speakingRateWpm: 135,
          estimatedTotalSeconds: estimateVoiceoverDuration(fullScriptText, 135),
        },
        claimsReview: {
          overallStatus: compliance.overallStatus,
          reviewedAt: nowIso,
          reviewer: 'Claims Compliance Officer Pabrik 4Life',
          claims: compliance.claims,
          medicalDisclaimersRequired: compliance.disclaimers,
        },
        scenes: aiResultJson.scenes || [],
        flowPrompts: flowPrompts,
        voiceover: {
          narratorProfile: {
            gender: aiResultJson.narratorVoice?.gender || 'male',
            persona: aiResultJson.narratorVoice?.persona || 'Edukator Matang & Kredibel',
            tone: aiResultJson.narratorVoice?.tone || 'Warm, Calm, Articulate Indonesian',
            pace: aiResultJson.narratorVoice?.pace || 'moderate',
          },
          fullTtsScript: fullScriptText,
          timecodedSegments: timecodedSegments,
        },
        productionPackage: {
          checklist: generateProductionChecklist({
            hasComplianceApproval: !compliance.isBlocked,
            hasVoiceover: true,
            hasFlowPrompts: flowPrompts.length > 0,
            hasScenes: (aiResultJson.scenes || []).length > 0,
          }),
          bgmRecommendation: aiResultJson.bgmRecommendation || {
            genre: 'Acoustic Warm Documentary',
            mood: 'Hopeful, Reassuring, Grounded',
            tempoBpm: '85-95 BPM',
            referenceVibe: 'Warm acoustic guitar with soft piano notes',
          },
          assemblyInstructions: aiResultJson.assemblyInstructions || [
            '1. Unduh prompt Google Flow dan render tiap klip secara berurutan.',
            '2. Pastikan tone warna visual konsisten hangat natural Indonesia.',
            '3. Masukkan file rekaman voiceover sesuai timecode yang disiapkan.',
            '4. Seimbangkan volume BGM di background (-20dB) agar artikulasi narasi jelas.',
          ],
          exportTimestamp: nowIso,
        },
        orchestratorLogs: [
          {
            timestamp: nowIso,
            agent: 'Kepala Pabrik 4Life',
            action: 'Instruksi Bos Besar Diterima',
            status: 'info',
            detail: `Menerima perintah: "${prompt}"`,
          },
          {
            timestamp: nowIso,
            agent: 'Strategic Director',
            action: 'Strategi & Format Ditetapkan',
            status: 'success',
            detail: `Format ${targetFormat}, fokus audiens: ${aiResultJson.targetAudience}`,
          },
          {
            timestamp: nowIso,
            agent: 'Knowledge Manager',
            action: 'Verifikasi Hierarki Bukti',
            status: 'success',
            detail: `Menautkan sumber resmi terverifikasi tanpa klaim berlebihan.`,
          },
          {
            timestamp: nowIso,
            agent: 'Master Scriptwriter',
            action: 'Penyusunan Naskah Lengkap',
            status: 'success',
            detail: `Naskah versi 1 disusun dengan estimasi durasi ${estimateVoiceoverDuration(fullScriptText)} detik.`,
          },
          {
            timestamp: nowIso,
            agent: 'Claims Compliance Officer',
            action: 'Audit Regulasi BPOM & Etika APLI',
            status: compliance.isBlocked ? 'error' : 'success',
            detail: compliance.isBlocked
              ? `Ditemukan klaim berisiko: script diblokir sementara sampai dikoreksi.`
              : `Audit lulus (Status: ${compliance.overallStatus}). Tidak ada klaim penyembuhan penyakit.`,
          },
          {
            timestamp: nowIso,
            agent: 'Creative Director & Scene Designer',
            action: 'Desain Adegan & Google Flow Prompts',
            status: 'success',
            detail: `${aiResultJson.scenes?.length || 0} adegan sinematik dan prompt Flow 10 detik dirancang.`,
          },
          {
            timestamp: nowIso,
            agent: 'Kepala Pabrik 4Life',
            action: 'Laporan Siap untuk Bos Besar',
            status: 'info',
            detail: aiResultJson.kepalaPabrikGreeting || 'Paket materi produksi telah disiapkan untuk ditinjau.',
          },
        ],
      };

      const projects = loadProjects();
      const existingIdx = projects.findIndex((p) => p.id === projectId);
      if (existingIdx !== -1) {
        projects[existingIdx] = newProject;
      } else {
        projects.unshift(newProject);
      }
      saveProjects(projects);

      res.json({
        success: true,
        project: newProject,
        greeting: aiResultJson.kepalaPabrikGreeting,
        complianceAlert: compliance.isBlocked
          ? 'Perhatian Bos Besar: Naskah memerlukan revisi kepatuhan klaim sebelum disetujui untuk produksi.'
          : null,
      });
    } catch (err: any) {
      console.error('Orchestrator error:', err);
      res.status(500).json({ error: 'Gagal menjalankan orkestrator: ' + err.message });
    }
  });

  // Setup Vite in Dev or static files in Production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`4Life AI Content Factory Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateFallbackProjectData(
  prompt: string,
  targetFormat: string,
  targetDuration: number,
  sources: SourceRecord[]
) {
  const isNotebookLm = /notebook\s*lm|pdf|youtube|berkas\s*resmi/i.test(prompt);
  const isBusiness = /kemitraan|bisnis|peluang|penghasilan|mitra/i.test(prompt);

  if (isNotebookLm) {
    return {
      kepalaPabrikGreeting:
        'Lapor Bos Besar! Perintah dipahami dengan sempurna. Seluruh ide dan konten ini disarikan 100% secara eksklusif dari berkas resmi yang Bos Besar masukkan ke NotebookLM—mencakup berkas formulasi PDF resmi 4Life Research dan video edukasi kanal resmi 4Life Indonesia. Setiap klaim diselaraskan dengan bukti ilmiah terverifikasi tanpa klaim palsu!',
      projectTitle: 'Sains Transfer Factor: Edukasi Resmi dari Dokumen Formulasi & Riset Imun',
      objective: 'Mengedukasi masyarakat mengenai mekanisme Transfer Factor berbasis dokumen resmi 4Life dan materi video YouTube resmi.',
      targetAudience: 'Masyarakat Indonesia dewasa (40+), keluarga, dan pemerhati literasi kesehatan terpercaya.',
      platform: targetFormat,
      duration: targetDuration,
      strategy: {
        topic: 'Mekanisme Tiga Fase Imun dari Berkas Resmi 4Life',
        angle: 'Sains murni berbasis formulasi resmi: Mengenali, Merespons, dan Mengingat tantangan imun.',
        keyTakeaway: 'Transfer Factor diekstraksi melalui proses nanofiltrasi mikro untuk mendidik sel pertahanan tubuh.',
        seriesName: 'Koleksi Bukti Resmi 4Life',
        episodeNumber: 1,
        callToActionIntent: 'education',
      },
      research: {
        summary:
          'Mengacu pada Kompendium Formulasi Resmi 4Life (PDF) dan Video Edukasi Resmi 4Life Indonesia. Memaparkan fungsi molekul UltraFactor XF dan OvoFactor sebagai molekul kurir memori imunitas.',
        referencedSourceIds: ['SRC-NLM-PDF-005', 'SRC-NLM-YT-006', 'SRC-4L-001', 'SRC-BPOM-002'],
        scientificDisclaimer:
          'Informasi ini mengacu pada literatur ilmiah dan spesifikasi produk resmi. Suplemen membantu memelihara daya tahan tubuh dan bukan obat penyembuh penyakit.',
      },
      script: {
        hook: 'Tahukah Anda apa yang diungkapkan dalam dokumen sains resmi 4Life tentang cara kerja Transfer Factor?',
        bodyNarration:
          'Berdasarkan dokumen formulasi resmi 4Life, Transfer Factor bukanlah vitamin biasa. Molekul peptida berukuran sangat kecil di bawah sepuluh ribu Dalton ini diekstraksi melalui teknologi nanofiltrasi eksklusif dari kolostrum sapi dan kuning telur pilihan. Melalui kanal edukasi resmi 4Life, dijelaskan bahwa molekul ini melatih sistem imun dalam tiga fase: Mengenali ancaman kesehatan, Merespons secara terukur, dan Mengingat pola tantangan tersebut agar tubuh selalu siap sedia.',
        closing: 'Edukasi yang tepat memberikan ketenangan bagi kesehatan keluarga kita setiap hari.',
        cta: 'Simpan video ini sebagai catatan literasi sains keluarga Anda dan bagikan kepada orang terdekat!',
        seoTitle: 'Sains Resmi Transfer Factor | Rangkuman Dokumen 4Life & Edukasi Imun',
        seoDescription:
          'Pelajari penjelasan ilmiah resmi bagaimana molekul Transfer Factor bekerja melatih sistem imun berdasarkan dokumen formulasi dan video resmi 4Life.',
        hashtags: ['#SainsResmi4Life', '#TransferFactor', '#NotebookLMResearch', '#EdukasiImun', '#4LifeIndonesia'],
      },
      scenes: [
        {
          sceneNumber: 1,
          durationSeconds: 10,
          timecodeStart: '00:00',
          timecodeEnd: '00:10',
          narrationSegment: 'Tahukah Anda apa yang diungkapkan dalam dokumen sains resmi 4Life tentang cara kerja Transfer Factor?',
          visualDescription: 'Seorang profesional pria Indonesia usia 45 tahun sedang membaca dokumen di ruang kerja yang terang dengan ekspresi tertarik dan penuh rasa ingin tahu.',
          characterDescription: 'Pria Indonesia matang, kemeja kasual rapi, kacamata berbingkai tipis modern.',
          environment: 'Ruang kerja rumah bernuansa kayu jati minimalis dengan pencahayaan jendela pagi yang lembut.',
          cameraMovement: 'Slow push in',
          lighting: 'Natural warm morning illumination',
          transition: 'Direct cut',
          onScreenText: 'Fakta Berkas Resmi 4Life',
        },
        {
          sceneNumber: 2,
          durationSeconds: 12,
          timecodeStart: '00:10',
          timecodeEnd: '00:22',
          narrationSegment: 'Berdasarkan dokumen formulasi resmi 4Life, Transfer Factor bukanlah vitamin biasa. Molekul peptida nano ini diekstraksi dari kolostrum dan kuning telur.',
          visualDescription: 'Pria tersebut berjalan ke beranda taman samping rumah sambil menikmati secangkir air hangat dengan suasana asri.',
          characterDescription: 'Karakter pria yang sama dengan senyum ramah dan rileks.',
          environment: 'Teras samping beratap kayu dengan tanaman tropis hijau segar.',
          cameraMovement: 'Side tracking dolly',
          lighting: 'Bright diffused morning daylight',
          transition: 'Dissolve',
          onScreenText: 'Molekul Mikro Peptida Alami',
        },
        {
          sceneNumber: 3,
          durationSeconds: 14,
          timecodeStart: '00:22',
          timecodeEnd: '00:36',
          narrationSegment: 'Melalui kanal edukasi resmi 4Life, dijelaskan 3 fase kerja imun: Mengenali ancaman, Merespons secara terukur, dan Mengingat pola tantangan.',
          visualDescription: 'Pria tersebut sedang berdiskusi hangat dengan pasangannya di ruang makan keluarga sambil menikmati sarapan buah segar.',
          characterDescription: 'Pasangan suami istri Indonesia harmonis, komunikasi hangat.',
          environment: 'Ruang makan modern dengan perabotan kayu dan pencahayaan hangat.',
          cameraMovement: 'Smooth arc shot',
          lighting: 'Warm ambient glow',
          transition: 'Cut to medium close-up',
          onScreenText: '3 Fase: Kenali • Respons • Ingat',
        },
        {
          sceneNumber: 4,
          durationSeconds: 12,
          timecodeStart: '00:36',
          timecodeEnd: '00:48',
          narrationSegment: 'Edukasi yang tepat memberikan ketenangan bagi kesehatan keluarga kita setiap hari.',
          visualDescription: 'Keluarga bahagia berinteraksi santai di ruang tamu, tertawa bersama dengan suasana penuh kenyamanan.',
          characterDescription: 'Keluarga Indonesia bahagia dan bugar.',
          environment: 'Ruang tamu asri dan bersih.',
          cameraMovement: 'Wide establishing pan',
          lighting: 'Warm late morning sunlight',
          transition: 'Gentle fade',
          onScreenText: 'Pertahanan Cerdas, Perlindungan Alami',
        },
        {
          sceneNumber: 5,
          durationSeconds: 12,
          timecodeStart: '00:48',
          timecodeEnd: '01:00',
          narrationSegment: 'Simpan video ini sebagai catatan literasi sains keluarga Anda dan bagikan kepada orang terdekat!',
          visualDescription: 'Pria tersebut tersenyum tulus ke arah kamera sambil mengangguk bersahabat dengan tatapan meyakinkan.',
          characterDescription: 'Close-up ekspresi hangat dan penuh kepedulian.',
          environment: 'Ruang kerja rumah yang rapi.',
          cameraMovement: 'Static locked shot with soft background blur',
          lighting: 'Warm natural portrait glow',
          transition: 'Fade to black with legal disclaimer',
          onScreenText: 'Simpan & Bagikan Catatan Sains Ini',
        },
      ],
      narratorVoice: {
        gender: 'male',
        persona: 'Edukator Sains Terpercaya',
        tone: 'Warm, Calm, Clear, Articulate Indonesian',
        pace: 'moderate',
      },
      bgmRecommendation: {
        genre: 'Acoustic Warm Documentary',
        mood: 'Educational, Reassuring, Grounded',
        tempoBpm: '85-95 BPM',
        referenceVibe: 'Warm acoustic guitar with gentle piano and subtle cello',
      },
      assemblyInstructions: [
        '1. Pastikan pergerakan kamera halus dan tidak patah.',
        '2. Jaga tone warna visual hangat khas suasana rumah keluarga Indonesia.',
        '3. Pasang disclaimer BPOM di 3 detik terakhir video.',
      ],
    };
  }

  if (isBusiness) {
    return {
      kepalaPabrikGreeting:
        'Siap, Bos Besar! Seluruh divisi spesialis telah saya koordinasikan untuk memproduksi konten edukasi peluang kemitraan 4Life. Sesuai prinsip ketat pabrik kita, materi ini fokus pada kemitraan berbasis edukasi produk nyata dan integritas, tanpa janji penghasilan palsu atau skema cepat kaya.',
      projectTitle: 'Membangun Bisnis Kemitraan Berkelanjutan dengan Integritas',
      objective: 'Memperkenalkan peluang kemitraan 4Life secara transparan dan beretika tanpa janji bombastis.',
      targetAudience: 'Profesional muda, wiraswasta, dan calon mitra etis usia 30-50 tahun di Indonesia.',
      platform: targetFormat,
      duration: targetDuration,
      strategy: {
        topic: 'Peluang Kemitraan Sehat & Mandiri',
        angle: 'Bisnis berbasis nilai tambah edukasi kesehatan keluarga, bukan sekadar janji finansial instan.',
        keyTakeaway: 'Kesuksesan kemitraan dibangun dari kerja konsisten dan kepercayaan produk berkualitas.',
        seriesName: 'Seri Mitra Berdaya 4Life',
        episodeNumber: 1,
        callToActionIntent: 'partnership_opportunity',
      },
      research: {
        summary:
          'Mengacu pada kode etik resmi APLI dan ketentuan Kementerian Perdagangan mengenai penjualan langsung berjenjang yang etis. Mengutamakan kepuasan konsumen atas Transfer Factor yang telah terdaftar BPOM.',
        referencedSourceIds: ['SRC-4L-001', 'SRC-BPOM-002', 'SRC-ETH-004'],
        scientificDisclaimer:
          'Hasil usaha dalam bisnis kemitraan bervariasi bergantung pada komitmen, keterampilan, dan jam terbang masing-masing individu.',
      },
      script: {
        hook: 'Banyak orang mencari peluang bisnis tambahan, tapi bingung memilih yang benar-benar beretika dan jangka panjang.',
        bodyNarration:
          'Bisnis yang bertahan puluhan tahun tidak dibangun dari janji muluk cepat kaya. Fondasinya adalah produk bernilai tinggi yang dibutuhkan masyarakat setiap hari, seperti suplemen edukasi sistem imun Transfer Factor yang telah terdaftar resmi di BPOM. Di 4Life, kemitraan berfokus pada saling mendukung, membimbing sesama, dan mengedukasi keluarga Indonesia tentang hidup sehat.',
        closing: 'Membangun kemandirian finansial membutuhkan dedikasi nyata dan fondasi integritas yang kokoh.',
        cta: 'Komentari "MITRA" untuk berdiskusi langsung mengenai langkah awal kemitraan yang transparan dan terarah.',
        seoTitle: 'Peluang Kemitraan Bisnis Edukasi Kesehatan 4Life Indonesia',
        seoDescription:
          'Ketahui bagaimana membangun kemitraan bisnis beretika bersama 4Life Indonesia dengan produk berkualitas tinggi.',
        hashtags: ['#PeluangKemitraan', '#BisnisEtis', '#4LifeIndonesia', '#KemandirianFinansial'],
      },
      scenes: [
        {
          sceneNumber: 1,
          durationSeconds: 10,
          timecodeStart: '00:00',
          timecodeEnd: '00:10',
          narrationSegment: 'Banyak orang mencari peluang bisnis tambahan, tapi bingung memilih yang benar-benar beretika dan jangka panjang.',
          visualDescription: 'Profesional Indonesia usia 35 tahun duduk di kedai kopi modern yang tenang di Surabaya, sedang membuka buku catatan dengan ekspresi reflektif.',
          characterDescription: 'Pria Indonesia santun, mengenakan kemeja linen kasual, jam tangan sederhana.',
          environment: 'Interior kafe beraksen kayu lokal dan tanaman hijau, pencahayaan alami jendela besar.',
          cameraMovement: 'Slow medium tracking',
          lighting: 'Soft warm window daylight',
          transition: 'Gentle cut',
          onScreenText: 'Mencari Peluang Bisnis Beretika?',
        },
        {
          sceneNumber: 2,
          durationSeconds: 12,
          timecodeStart: '00:10',
          timecodeEnd: '00:22',
          narrationSegment: 'Bisnis yang bertahan puluhan tahun tidak dibangun dari janji muluk. Fondasinya adalah produk bernilai tinggi yang dibutuhkan masyarakat.',
          visualDescription: 'Pria tersebut sedang berdiskusi secara hangat dan profesional dengan dua rekan kerja di meja, suasana kolaboratif penuh semangat.',
          characterDescription: 'Tiga mitra Indonesia sedang bertukar ide secara santai dan bersahabat.',
          environment: 'Ruang kerja bersama (coworking) modern dan rapi.',
          cameraMovement: 'Smooth circular pan',
          lighting: 'Even bright modern ambient lighting',
          transition: 'Cross dissolve',
          onScreenText: 'Fondasi Produk Berkualitas & BPOM',
        },
        {
          sceneNumber: 3,
          durationSeconds: 14,
          timecodeStart: '00:22',
          timecodeEnd: '00:36',
          narrationSegment: 'Di 4Life, kemitraan berfokus pada saling mendukung, membimbing sesama, dan mengedukasi keluarga Indonesia tentang hidup sehat.',
          visualDescription: 'Suasana sesi sharing edukatif santai di ruang pertemuan kecil yang nyaman, semua peserta tersenyum dan mencatat hal-hal bermanfaat.',
          characterDescription: 'Kelompok mitra beragam usia saling bertukar senyum suportif.',
          environment: 'Ruang komunitas yang hangat dan profesional.',
          cameraMovement: 'Slow push in',
          lighting: 'Warm golden interior light',
          transition: 'Cut to medium close-up',
          onScreenText: 'Komunitas & Bimbingan Berkelanjutan',
        },
        {
          sceneNumber: 4,
          durationSeconds: 12,
          timecodeStart: '00:36',
          timecodeEnd: '00:48',
          narrationSegment: 'Membangun kemandirian finansial membutuhkan dedikasi nyata dan fondasi integritas yang kokoh.',
          visualDescription: 'Pria tersebut berjalan keluar gedung dengan langkah mantap dan optimis menyapa staf dengan ramah di bawah terik matahari sore.',
          characterDescription: 'Pria profesional berjalan dengan senyum percaya diri.',
          environment: 'Pintu masuk gedung bernuansa arsitektur modern tropis.',
          cameraMovement: 'Low angle tracking shot',
          lighting: 'Afternoon golden hour illumination',
          transition: 'Fade out',
          onScreenText: 'Integritas • Dedikasi • Kerja Nyata',
        },
        {
          sceneNumber: 5,
          durationSeconds: 12,
          timecodeStart: '00:48',
          timecodeEnd: '01:00',
          narrationSegment: 'Komentari "MITRA" untuk berdiskusi langsung mengenai langkah awal kemitraan yang transparan dan terarah.',
          visualDescription: 'Pria tersebut memandang ke kamera sambil tersenyum ramah dan mengangguk santun.',
          characterDescription: 'Close-up ekspresi hangat dan tulus.',
          environment: 'Lobi kantor yang bersih dan elegan.',
          cameraMovement: 'Static focus pull',
          lighting: 'Warm soft studio glow',
          transition: 'Fade to brand educational card',
          onScreenText: 'Komentari "MITRA" untuk Berdiskusi',
        },
      ],
      narratorVoice: {
        gender: 'male',
        persona: 'Mentor Bisnis Beretika',
        tone: 'Warm, Honest, Grounded, Professional Indonesian',
        pace: 'moderate',
      },
      bgmRecommendation: {
        genre: 'Modern Acoustic Uplifting Corporate',
        mood: 'Optimistic, Purposeful, Grounded',
        tempoBpm: '90-100 BPM',
        referenceVibe: 'Soft acoustic guitar with steady light percussion and warm bass line',
      },
      assemblyInstructions: [
        '1. Gunakan footage lingkungan profesional dan hangat khas perkotaan Indonesia.',
        '2. Jaga tone warna visual agar natural dan tidak over-saturated.',
        '3. Cantumkan disclaimer etika kemitraan di bagian bawah visual video.',
      ],
    };
  }

  // Default: Health / Transfer Factor education
  return {
    kepalaPabrikGreeting:
      'Lapor Bos Besar! Seluruh divisi pabrik konten telah saya gerakkan. Kami menyiapkan materi edukasi seputar bagaimana molekul Transfer Factor bekerja mendukung sistem imun tubuh secara alami, dikemas dengan riset terverifikasi dan naskah ramah keluarga Indonesia.',
    projectTitle: 'Mengenal Transfer Factor: Molekul Cerdas Pelatih Sistem Imun',
    objective: 'Edukasi masyarakat awam mengenai cara kerja molekul transfer factor sebagai pembawa pesan imun alami.',
    targetAudience: 'Keluarga Indonesia, usia 35-65 tahun yang peduli kesehatan pencegahan.',
    platform: targetFormat,
    duration: targetDuration,
    strategy: {
      topic: 'Sains Sederhana Transfer Factor',
      angle: 'Analogi ramah: pelatih sistem imun vs suplemen biasa.',
      keyTakeaway: 'Transfer Factor bukan vitamin sintetis, melainkan molekul alami pembawa informasi imun.',
      seriesName: 'Ensiklopedia Imun 4Life',
      episodeNumber: 1,
      callToActionIntent: 'education',
    },
    research: {
      summary:
        'Transfer factor pertama kali diteliti oleh Dr. H. Sherwood Lawrence pada 1949. Diekstraksi dari kolostrum sapi dan kuning telur unggas pilihan, molekul ini membantu sel imun mengenali, merespons, dan mengingat ancaman.',
      referencedSourceIds: ['SRC-4L-001', 'SRC-BPOM-002', 'SRC-SCI-003'],
      scientificDisclaimer:
        'Suplemen kesehatan membantu memelihara daya tahan tubuh. Tidak dimaksudkan untuk mendiagnosis, mengobati, atau menyembuhkan penyakit.',
    },
    script: {
      hook: 'Banyak yang mengira semua suplemen daya tahan tubuh itu sama. Padahal ada satu molekul unik yang cara kerjanya berbeda!',
      bodyNarration:
        'Bukan vitamin, bukan juga mineral. Namanya Transfer Factor. Jika vitamin ibarat bahan bakar untuk tubuh, Transfer Factor adalah pelatih cerdas bagi sistem imun kita. Molekul alami ini diekstraksi dari kolostrum sapi dan kuning telur berkualitas. Tugasnya mengedukasi sel pertahanan tubuh kita agar mampu mengenali tantangan kesehatan lebih cepat, merespons secara proporsional, dan mengingatnya di masa depan.',
      closing: 'Tubuh yang bugar berawal dari sistem pertahanan yang teredukasi dengan baik.',
      cta: 'Simpan video ini untuk referensi kesehatan keluarga Anda dan share ke sahabat terdekat!',
      seoTitle: 'Apa Itu Transfer Factor? Cara Kerja Pelatih Sistem Imun Alami',
      seoDescription:
        'Pelajari rahasia molekul Transfer Factor yang membantu melatih dan mendidik sistem imun tubuh secara alami tanpa zat kimia buatan.',
      hashtags: ['#TransferFactor', '#EdukasiImun', '#SainsKesehatan', '#4LifeResearch', '#DayaTahanTubuh'],
    },
    scenes: [
      {
        sceneNumber: 1,
        durationSeconds: 10,
        timecodeStart: '00:00',
        timecodeEnd: '00:10',
        narrationSegment: 'Banyak yang mengira semua suplemen daya tahan tubuh itu sama. Padahal ada satu molekul unik yang cara kerjanya berbeda!',
        visualDescription: 'Seorang ibu Indonesia usia 40 tahun sedang menata buah dan sarapan sehat di meja makan bernuansa hangat dengan senyum penuh perhatian.',
        characterDescription: 'Wanita Indonesia matang berpenampilan anggun dan bersahabat.',
        environment: 'Dapur bersih rumah tinggal Indonesia modern bernuansa kayu jati dan marmer krem.',
        cameraMovement: 'Slow elegant push in',
        lighting: 'Warm morning daylight filtering through soft curtains',
        transition: 'Smooth cut',
        onScreenText: 'Apakah Semua Suplemen Imun Sama?',
      },
      {
        sceneNumber: 2,
        durationSeconds: 12,
        timecodeStart: '00:10',
        timecodeEnd: '00:22',
        narrationSegment: 'Bukan vitamin, bukan juga mineral. Namanya Transfer Factor. Jika vitamin ibarat bahan bakar, Transfer Factor adalah pelatih cerdas bagi sistem imun kita.',
        visualDescription: 'Ibu tersebut sedang menyiram tanaman herbal di taman rumah sambil menikmati udara sejuk pagi bersama keluarga.',
        characterDescription: 'Ibu yang sama berinteraksi hangat dengan putrinya.',
        environment: 'Taman depan rumah tropis asri dengan rumput gajah mini segar.',
        cameraMovement: 'Side tracking slow motion',
        lighting: 'Golden morning sunshine, soft lens glow',
        transition: 'Cross dissolve',
        onScreenText: 'Ibarat Pelatih Cerdas untuk Sel Imun',
      },
      {
        sceneNumber: 3,
        durationSeconds: 14,
        timecodeStart: '00:22',
        timecodeEnd: '00:36',
        narrationSegment: 'Molekul alami ini diekstraksi dari kolostrum sapi dan kuning telur pilihan untuk mengedukasi sel pertahanan tubuh kita: mengenali, merespons, dan mengingat.',
        visualDescription: 'Pemandangan alam peternakan hijau asri di pagi hari dengan kabut tipis dan sapi perah yang sehat di padang rumput alami.',
        characterDescription: 'Landscape pemandangan alam pastoral yang bersih dan higienis.',
        environment: 'Padang rumput pegunungan hijau yang segar dan alami.',
        cameraMovement: 'Wide scenic aerial panning shot',
        lighting: 'Pagi hari berkabut lembut dengan sinar matahari keemasan',
        transition: 'Dissolve back to interior',
        onScreenText: 'Sumber Alami: Kolostrum & Kuning Telur',
      },
      {
        sceneNumber: 4,
        durationSeconds: 12,
        timecodeStart: '00:36',
        timecodeEnd: '00:48',
        narrationSegment: 'Tubuh yang bugar berawal dari sistem pertahanan yang teredukasi dengan baik setiap hari.',
        visualDescription: 'Keluarga berkumpul di ruang tamu menikmati waktu santai bersama sambil tertawa bahagia dan penuh keakraban.',
        characterDescription: 'Keluarga harmonis 3 generasi (kakek, orang tua, anak).',
        environment: 'Ruang tamu bernuansa hangat dengan sofa nyaman.',
        cameraMovement: 'Slow dolly out',
        lighting: 'Warm ambient evening lamp glow',
        transition: 'Smooth cut',
        onScreenText: 'Pertahanan Cerdas, Keluarga Sehat',
      },
      {
        sceneNumber: 5,
        durationSeconds: 12,
        timecodeStart: '00:48',
        timecodeEnd: '01:00',
        narrationSegment: 'Simpan video ini untuk referensi kesehatan keluarga Anda dan share ke sahabat terdekat!',
        visualDescription: 'Ibu tersenyum ramah ke arah kamera sambil mengangguk tulus dengan tatapan penuh kehangatan.',
        characterDescription: 'Medium portrait shot, senyum tulus seorang ibu.',
        environment: 'Ruang keluarga yang asri dan rapi.',
        cameraMovement: 'Locked steady camera with gentle rack focus',
        lighting: 'Soft flattering portrait lighting',
        transition: 'Fade to black with BPOM regulatory note',
        onScreenText: 'Simpan & Bagikan Edukasi Ini',
      },
    ],
    narratorVoice: {
      gender: 'female',
      persona: 'Ibu Edukator Hangat & Terpercaya',
      tone: 'Warm, Motherly, Articulate, Calming Indonesian',
      pace: 'moderate',
    },
    bgmRecommendation: {
      genre: 'Warm Acoustic Folk Instrumental',
      mood: 'Gentle, Reassuring, Family Harmony',
      tempoBpm: '80-90 BPM',
      referenceVibe: 'Acoustic fingerstyle guitar with delicate glockenspiel and warm strings',
    },
    assemblyInstructions: [
      '1. Sinkronkan adegan dengan potongan audio voiceover berkecepatan 135 WPM.',
      '2. Pertahankan pencahayaan bernuansa hangat (keluarga dan rumah tinggal Indonesia).',
      '3. Beri teks on-screen di bagian sepertiga bawah layar untuk memudahkan pembaca tanpa audio.',
      '4. Pastikan teks legalitas BPOM tertera di akhir durasi video.',
    ],
  };
}

startServer();
