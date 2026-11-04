/**
 * Production and Timing Utilities for 4Life AI Content Factory
 */

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estimates voiceover duration in seconds.
 * Average Indonesian conversational pacing is ~130 - 150 words per minute.
 */
export function estimateVoiceoverDuration(text: string, wpm = 135): number {
  const words = countWords(text);
  if (words === 0) return 0;
  return Math.ceil((words / wpm) * 60);
}

export function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export interface FlowPromptInput {
  sceneNumber: number;
  durationSeconds: number;
  environment: string;
  characterDescription: string;
  action: string;
  cameraMovement: string;
  lighting: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
}

/**
 * Builds an authentic Google Flow video generation prompt.
 * Strictly adheres to natural Indonesian environment, realistic cinematography,
 * and no fake medical doctor badges or fabricated logo artifacts.
 */
export function buildGoogleFlowPrompt(input: FlowPromptInput): {
  promptText: string;
  negativePrompt: string;
} {
  const promptText = [
    `Cinematic 4K video clip, ${input.durationSeconds}s duration.`,
    `Subject: ${input.characterDescription}.`,
    `Setting & Environment: ${input.environment}, authentic Indonesian modern interior and atmosphere.`,
    `Action & Motion: ${input.action}.`,
    `Camera & Composition: ${input.cameraMovement}, smooth camera tracking, shallow depth of field, natural eye-level framing.`,
    `Lighting & Mood: ${input.lighting}, warm golden diffused tones, realistic color grading, high dynamic range.`,
    `Atmosphere: Respectful, credible, relatable, premium natural documentary aesthetic.`,
  ].join(' ');

  const negativePrompt =
    'cartoon, 3D animated CGI, oversaturated neon, fake doctor uniform, stethoscope around neck, white lab coat in home setting, distorted hands, floating text overlays, fabricated product packaging, generic stock video look, artificial plastic skin';

  return {
    promptText,
    negativePrompt,
  };
}

export interface MasterFlowAgentOptions {
  aspectRatio?: '9:16' | '16:9' | '1:1';
  languageMode?: 'bilingual' | 'indonesia' | 'english';
  includeOutro?: boolean;
}

/**
 * Generates an all-in-one Master Prompt for Google Flow's Agent.
 * This instructs the Flow Agent to generate and sequence all 5 or 6 scenes simultaneously,
 * maintaining character continuity, lighting coherence, and audio cues in 1 single paste.
 */
export function buildMasterFlowAgentPrompt(
  project: {
    id: string;
    title: string;
    platform?: string;
    scenes: Array<{
      sceneNumber: number;
      durationSeconds: number;
      timecodeStart?: string;
      timecodeEnd?: string;
      narrationSegment: string;
      visualDescription: string;
      characterDescription?: string;
      environment?: string;
      cameraMovement?: string;
      lighting?: string;
      onScreenText?: string;
    }>;
  },
  options: MasterFlowAgentOptions = {}
): string {
  const ratio = options.aspectRatio || (project.platform === 'youtube_long' ? '16:9' : '9:16');
  const lang = options.languageMode || 'bilingual';
  const includeOutro = options.includeOutro ?? true;

  const totalScenes = project.scenes.length + (includeOutro ? 1 : 0);

  if (lang === 'indonesia') {
    const sceneBlocks = project.scenes.map((s) => {
      return `■ SCENE ${s.sceneNumber} (Durasi: ${s.durationSeconds}s | ${s.timecodeStart || ''} - ${s.timecodeEnd || ''})
- Aksi & Subjek: ${s.visualDescription} (${s.characterDescription || 'Pria Indonesia profesional usia 45 tahun, pakaian kasual berkelas'}).
- Lokasi & Suasana: ${s.environment || 'Hunian tropis Indonesia modern dengan pencahayaan alami'}.
- Pergerakan Kamera: ${s.cameraMovement || 'Slow push in natural'}.
- Pencahayaan: ${s.lighting || 'Pencahayaan pagi hari yang hangat dan lembut'}.
- Naskah / Audio Cue: "${s.narrationSegment}"
${s.onScreenText ? `- Teks di Layar: "${s.onScreenText}"` : ''}`;
    });

    if (includeOutro) {
      sceneBlocks.push(`■ SCENE ${project.scenes.length + 1} (Durasi: 5s | OUTRO & PENUTUP RESMI)
- Aksi & Subjek: Tampilan penutup elegan kartu edukasi imunitas keluarga dengan transisi bokeh partikel cahaya hangat.
- Pergerakan Kamera: Slow subtle zoom out.
- Teks di Layar: "Transfer Factor • Edukasi Imun Terpercaya | Suplemen Resmi BPOM RI"`);
    }

    return `[INSTRUKSI UNTUK AGEN GOOGLE FLOW: BUAT PROYEK VIDEO MULTI-SCENE LENGKAP]

SPESIFIKASI PROYEK:
- Judul Proyek: "${project.title}"
- Format & Rasio: ${ratio} Video Vertikal (Instagram Reels / TikTok / Shorts)
- Jumlah Scene: ${totalScenes} Scene Berurutan Otomatis
- Karakter & Kontinuitas Visual: Tokoh pria profesional Indonesia usia 40-45 tahun, berkacamata modern tipis, berbusana kasual rapi (polo navy / kemeja batik modern), suasana rumah tropis Indonesia asri dan berkelas.
- Gaya Sinematografi: Sinematografi dokumenter realistis 4K, warna alami Arri Alexa, pencahayaan alami pagi hari yang hangat, tampak nyata dan berbobot.

PERINTAH UNTUK AGEN FLOW:
Tolong buat dan gabungkan ${totalScenes} adegan di bawah ini secara bersamaan menjadi satu alur video sinematik yang utuh:

${sceneBlocks.join('\n\n')}

NEGATIVE PROMPT / BATASAN VISUAL UNTUK SEMUA SCENE:
kartun, animasi 3D CGI fiktif, lampu neon berlebihan, jas dokter palsu, stetoskop di rumah, baju lab di ruang keluarga, jari tangan terdistorsi atau cacat, kulit plastik buatan, suasana klinik atau rumah sakit, klaim obat berlebihan.`;
  }

  // Bilingual / English (Recommended for peak model comprehension in Google Flow)
  const sceneBlocks = project.scenes.map((s) => {
    return `■ SCENE ${s.sceneNumber} (Duration: ${s.durationSeconds}s | Timecode: ${s.timecodeStart || ''} - ${s.timecodeEnd || ''})
- Action & Subject: ${s.visualDescription} (${s.characterDescription || 'Mature Indonesian professional male, 45yo, neat casual attire'}).
- Environment: ${s.environment || 'Authentic Indonesian modern tropical residence, natural daylight'}.
- Camera Movement: ${s.cameraMovement || 'Slow push in, shallow depth of field'}.
- Lighting & Tone: ${s.lighting || 'Warm natural diffused morning sunlight'}.
- Synchronized Audio Voiceover Cue: "${s.narrationSegment}"
${s.onScreenText ? `- On-Screen Graphic Text: "${s.onScreenText}"` : ''}`;
  });

  if (includeOutro) {
    sceneBlocks.push(`■ SCENE ${project.scenes.length + 1} (Duration: 5s | OUTRO & COMPLIANCE BADGE)
- Action & Subject: Elegant visual closing card showing immune wellness crest silhouette with gentle ambient bokeh glow.
- Camera: Slow elegant zoom out.
- On-Screen Graphic Text: "Transfer Factor • Edukasi Imun Terpercaya | Suplemen Resmi BPOM RI"`);
  }

  return `[AGENT DIRECTIVE: GENERATE COMPLETE MULTI-SCENE VIDEO PROJECT]

PROJECT METADATA:
- Project Title: "${project.title}"
- Aspect Ratio: ${ratio} (Vertical Video - Reels / TikTok / Shorts)
- Total Sequence: ${totalScenes} Scenes generated in continuous progression
- Visual Consistency Key: Indonesian mature male professional (45yo, navy polo/shirt, thin modern glasses, trustworthy friendly expression). Modern tropical Indonesian home interior with warm teak wood and lush green patio.
- Cinematography Style: Photorealistic 4K Indonesian documentary, natural color grading, organic morning sunlight, shallow depth of field, high dynamic range.

INSTRUCTION FOR FLOW AGENT:
Generate, render, and sequence all ${totalScenes} scenes simultaneously as a single cohesive video story based on the detailed scene breakdown below:

${sceneBlocks.join('\n\n')}

GLOBAL NEGATIVE PROMPT & QUALITY CONSTRAINTS:
cartoon, 3D animated CGI, oversaturated neon, fake doctor uniform, stethoscope in domestic setting, white lab coat, deformed hands or fingers, plastic skin, hospital or clinical room, floating random text, fabricated pharmaceutical bottles, generic stock video artifacts.`;
}

export function generateProductionChecklist(options: {
  hasComplianceApproval: boolean;
  hasVoiceover: boolean;
  hasFlowPrompts: boolean;
  hasScenes: boolean;
}): Array<{ item: string; done: boolean; agent: string }> {
  return [
    {
      item: 'Strategi Konten & Identifikasi Audiens terverifikasi',
      done: true,
      agent: 'Strategic Director',
    },
    {
      item: 'Riset bukti ilmiah & hierarki sumber terdokumentasi',
      done: true,
      agent: 'Knowledge Manager',
    },
    {
      item: 'Naskah edukasi Bahasa Indonesia diselesaikan',
      done: true,
      agent: 'Master Scriptwriter',
    },
    {
      item: 'Audit kepatuhan klaim kesehatan & etika kemitraan (Zero Unsupported Claims)',
      done: options.hasComplianceApproval,
      agent: 'Claims Compliance Officer',
    },
    {
      item: 'Pemecahan struktur adegan dan transisi sinematik',
      done: options.hasScenes,
      agent: 'Scene Designer',
    },
    {
      item: 'Prompt Google Flow per-adegan siap render',
      done: options.hasFlowPrompts,
      agent: 'Flow Prompt Engineer',
    },
    {
      item: 'Naskah voiceover dengan timecode & panduan intonasi',
      done: options.hasVoiceover,
      agent: 'Voiceover Director',
    },
    {
      item: 'Persetujuan Final Founder & Chairman (Bos Besar)',
      done: false,
      agent: 'Kepala Pabrik 4Life',
    },
  ];
}
