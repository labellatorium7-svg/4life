import React, { useState, useRef } from 'react';
import { ContentProject } from '../types';
import {
  Mic2,
  Play,
  Square,
  Volume2,
  Clock,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Download,
  ExternalLink,
  Bot,
  Radio,
  Sliders,
  CheckCircle2,
  FileAudio,
} from 'lucide-react';
import { formatTimecode, countWords, estimateVoiceoverDuration } from '../utils/production';

interface VoiceoverViewProps {
  activeProject: ContentProject | null;
  onUpdateProject: (updated: ContentProject) => void;
  onNavigate: (view: string) => void;
}

export const VoiceoverView: React.FC<VoiceoverViewProps> = ({
  activeProject,
  onUpdateProject,
  onNavigate,
}) => {
  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-400">
        Pilih atau buat proyek konten terlebih dahulu di Dashboard.
      </div>
    );
  }

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);

  // Gemini TTS states
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash-lite-tts');
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [generatedAudioBase64, setGeneratedAudioBase64] = useState<string | null>(null);
  const [ttsStatusMessage, setTtsStatusMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voData = activeProject.voiceover;
  const segments = voData?.timecodedSegments || [];
  const fullText = voData?.fullTtsScript || '';

  const voices = [
    { id: 'Puck', label: 'Puck (Pria Tegas & Kredibel)', desc: 'Cocok untuk edukasi sains & kompendium formulasi' },
    { id: 'Charon', label: 'Charon (Pria Hangat & Berwibawa)', desc: 'Ideal untuk pesan kesehatan keluarga matang' },
    { id: 'Aoede', label: 'Aoede (Wanita Ramah & Edukatif)', desc: 'Suara edukator ibu rumah tangga inspiratif' },
    { id: 'Kore', label: 'Kore (Wanita Profesional & Tenang)', desc: 'Artikulasi jernih dan menenangkan' },
    { id: 'Fenrir', label: 'Fenrir (Pria Energik & Optimis)', desc: 'Bagus untuk pengenalan kemitraan etis 4Life' },
  ];

  const handleGenerateGeminiTts = async () => {
    setIsGeneratingTts(true);
    setTtsStatusMessage('Menghubungkan ke Google AI Studio Text-To-Speech...');

    try {
      const res = await fetch('/api/voiceover/gemini-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          voiceName: selectedVoice,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        setGeneratedAudioBase64(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        setTtsStatusMessage(`Suara AI Studio (${data.voiceName}) berhasil digenerate!`);
      } else {
        setTtsStatusMessage(
          'Format naskah Text-To-Speech Google AI Studio siap disalin atau diunduh.'
        );
      }
    } catch (err: any) {
      setTtsStatusMessage('Catatan: ' + err.message);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const handleCopyAiStudioPrompt = () => {
    const aiStudioPrompt = `Role: Professional Indonesian Health & Science Voiceover Narrator
Language: Indonesian (Bahasa Indonesia)
Voice Profile: ${selectedVoice} (Warm, mature, credible, natural cadence, zero exaggerated sales tone)
Pacing: Moderate (~135 words per minute)

[SCRIPT VOICEOVER 4LIFE RESMI]
${fullText}
`;
    navigator.clipboard.writeText(aiStudioPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownloadScriptTxt = () => {
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `4LIFE-VO-${activeProject.id}-Naskah_Voiceover.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase">
              Agent 8 — Voiceover Director
            </span>
            <span className="text-xs font-mono text-slate-500">[{activeProject.id}]</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Google AI Studio Text-To-Speech (TTS) & Studio Voiceover
          </h1>
          <p className="text-xs text-slate-300">
            Penataan narasi tersinkronisasi adegan, integrasi audio terpisah Google AI Studio TTS, dan timecode per adegan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyScript}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks VO'}</span>
          </button>

          <button
            onClick={handleDownloadScriptTxt}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Naskah (.txt)</span>
          </button>
        </div>
      </div>

      {/* Google AI Studio Text-To-Speech Special Hub */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  GOOGLE AI STUDIO TTS ENGINE
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-800">
                  Audio Terpisah
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Produksi Suara Alami Berkualitas Studio
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span>Buka Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleCopyAiStudioPrompt}
              className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? 'Format Tersalin!' : 'Salin Format AI Studio'}</span>
            </button>
          </div>
        </div>

        {/* TTS Parameter Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Voice Character */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Pilih Karakter Suara AI Studio (Gemini Voice):
            </label>
            <div className="space-y-1.5">
              {voices.map((v) => (
                <label
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedVoice === v.id
                      ? 'bg-slate-800 border-amber-400 text-white ring-1 ring-amber-400/40'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Radio className={`w-3.5 h-3.5 ${selectedVoice === v.id ? 'text-amber-400' : 'text-slate-600'}`} />
                    <span className="font-semibold">{v.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate max-w-[180px]">{v.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Model & Generation Action */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Model AI Studio TTS:
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="gemini-3.8-flash-lite-tts">
                    gemini-3.8-flash-lite-tts (Rekomendasi Cepat & Bersih)
                  </option>
                  <option value="gemini-3.8-flash-tts">
                    gemini-3.8-flash-tts (Ekspresi & Nuansa Dialog Maksimal)
                  </option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Panduan Suara Terpisah untuk Google Flow:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Generate suara terpisah di sini atau salin naskah ke Google AI Studio Text-to-Speech, lalu gabungkan dengan hasil video renderan dari Google Flow untuk hasil terbaik!
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateGeminiTts}
              disabled={isGeneratingTts}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer transition-all"
            >
              {isGeneratingTts ? (
                <>
                  <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Menghubungi Google AI Studio TTS...</span>
                </>
              ) : (
                <>
                  <Mic2 className="w-4 h-4" />
                  <span>Generate Suara Google AI Studio (TTS)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Audio Player if generated */}
        {generatedAudioBase64 && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Audio Google AI Studio TTS Siap Diputar & Diunduh:</span>
              </span>

              <a
                href={generatedAudioBase64}
                download={`4LIFE-VOICE-${activeProject.id}-${selectedVoice}.wav`}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File Audio (.wav)</span>
              </a>
            </div>

            <audio
              ref={audioRef}
              src={generatedAudioBase64}
              controls
              className="w-full h-10 rounded-lg"
            />
          </div>
        )}

        {ttsStatusMessage && !generatedAudioBase64 && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-300 flex items-center justify-between">
            <span>{ttsStatusMessage}</span>
            <button
              onClick={handleCopyAiStudioPrompt}
              className="text-white underline hover:text-amber-300 text-[11px] cursor-pointer"
            >
              Salin Prompt ➔
            </button>
          </div>
        )}
      </div>

      {/* Full Script with Timecode Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-amber-400" />
            <span>Naskah & Timecode Per Adegan ({segments.length} Segmen)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Total Kata: ~{countWords(fullText)} kata • Estimasi: {estimateVoiceoverDuration(fullText)} detik
          </span>
        </div>

        <div className="space-y-3">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Adegan #{seg.sceneNumber} • {seg.timecode}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({seg.durationSeconds} detik)
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed pt-1">
                  "{seg.text}"
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(seg.text);
                  alert(`Naskah Adegan #${seg.sceneNumber} tersalin!`);
                }}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Adegan</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
