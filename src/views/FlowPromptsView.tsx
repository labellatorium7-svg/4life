import React, { useState, useMemo } from 'react';
import { ContentProject, FlowPromptItem } from '../types';
import {
  Sparkles,
  Copy,
  Check,
  Video,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info,
  Download,
  Bot,
  ExternalLink,
  FileCode,
  FolderArchive,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  ChevronDown,
  ChevronUp,
  Clock,
  Tv,
} from 'lucide-react';
import { buildGoogleFlowPrompt, buildMasterFlowAgentPrompt, MasterFlowAgentOptions } from '../utils/production';
import { downloadFullProjectZip, generateLocalPythonBotScript } from '../utils/localFlowBot';

interface FlowPromptsViewProps {
  activeProject: ContentProject | null;
  onUpdateProject: (updated: ContentProject) => void;
  onNavigate: (view: string) => void;
}

export const FlowPromptsView: React.FC<FlowPromptsViewProps> = ({
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

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [masterCopied, setMasterCopied] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState<number>(10);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>(
    activeProject.platform === 'youtube_long' ? '16:9' : '9:16'
  );
  const [languageMode, setLanguageMode] = useState<'bilingual' | 'indonesia' | 'english'>('bilingual');
  const [includeOutro, setIncludeOutro] = useState(true);
  const [showDetailedScenes, setShowDetailedScenes] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [customPromptText, setCustomPromptText] = useState<string | null>(null);

  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Generate Master Agent Prompt
  const masterAgentPrompt = useMemo(() => {
    if (customPromptText !== null && isEditingPrompt) {
      return customPromptText;
    }
    return buildMasterFlowAgentPrompt(activeProject, {
      aspectRatio,
      languageMode,
      includeOutro,
    });
  }, [activeProject, aspectRatio, languageMode, includeOutro, customPromptText, isEditingPrompt]);

  const copyTextRobustly = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback to textarea select & execCommand
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopyMasterPrompt = async () => {
    const textToCopy = customPromptText !== null ? customPromptText : masterAgentPrompt;
    await copyTextRobustly(textToCopy);
    setMasterCopied(true);
    setTimeout(() => setMasterCopied(false), 2500);
  };

  const handleDownloadMasterPromptTxt = () => {
    const textToDownload = customPromptText !== null ? customPromptText : masterAgentPrompt;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `00_MASTER_PROMPT_AGENT_FLOW_${activeProject.id}_SEMUA_SCENE.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadFullProjectZip(activeProject);
    } catch (e) {
      console.error('Failed to download ZIP:', e);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleDownloadPythonBot = () => {
    const code = generateLocalPythonBotScript(activeProject);
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `05_BOT_OTOMATIS_FLOW_LOKAL_${activeProject.id}.py`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopy = async (text: string, index: number) => {
    await copyTextRobustly(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegeneratePrompts = () => {
    const newPrompts: FlowPromptItem[] = activeProject.scenes.map((scene) => {
      const generated = buildGoogleFlowPrompt({
        sceneNumber: scene.sceneNumber,
        durationSeconds: defaultDuration,
        environment: scene.environment,
        characterDescription: scene.characterDescription,
        action: scene.visualDescription,
        cameraMovement: scene.cameraMovement,
        lighting: scene.lighting,
        aspectRatio: aspectRatio,
      });

      return {
        sceneNumber: scene.sceneNumber,
        clipDurationSeconds: defaultDuration,
        aspectRatio: aspectRatio,
        promptText: generated.promptText,
        negativePrompt: generated.negativePrompt,
        cinematographyStyle: 'Realistic Indonesian Documentary Cinematography',
        characterContinuityKey: 'char_continuity_indonesia_01',
      };
    });

    const updated: ContentProject = {
      ...activeProject,
      flowPrompts: newPrompts,
    };
    onUpdateProject(updated);
    setCustomPromptText(null);
  };

  const prompts = activeProject.flowPrompts || [];
  const totalSceneCount = activeProject.scenes.length + (includeOutro ? 1 : 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Executive Notice for Bos Besar regarding browser tabs & URLs */}
      <div className="p-4 bg-slate-900/90 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
                Laporan Status Sistem untuk Bos Besar
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Dev Server Aktif
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              Tab browser <strong className="text-white">"4Life AI Content Factory"</strong> yang sedang Bos Besar buka saat ini berjalan normal 100%. Pesan <span className="text-amber-300 font-mono">404</span> di screenshot Anda berasal dari tab staging (<code>ais-pre</code>). Cukup gunakan tab aktif ini!
            </p>
          </div>
        </div>

        <a
          href="https://flow.google"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <span>Tab Google Flow Anda</span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
        </a>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase">
              Agent 7 — Google Flow Prompt Engineer
            </span>
            <span className="text-xs font-mono text-slate-500">[{activeProject.id}]</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Prompt Generator Google Flow Video</h1>
          <p className="text-xs text-slate-300">
            Mendukung mode Master Agent (semua {totalSceneCount} scene sekaligus) atau ekspor per-klip dengan kontinuitas visual terjamin.
          </p>
        </div>

        {/* Global Configurations */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 text-[11px] px-2">Rasio:</span>
            {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          <button
            onClick={handleRegeneratePrompts}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
          >
            Reset Ulang Prompt
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ⚡ HERO: MASTER PROMPT AGENT GOOGLE FLOW (ALL-IN-ONE 6 SCENES DIRECTIVE) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border-2 border-amber-400/50 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header of Master Prompt */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <Bot className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-extrabold uppercase tracking-wider shadow">
                  FITUR AGENT GOOGLE FLOW
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 text-[10px] font-mono border border-emerald-700/60 font-semibold">
                  1-Click Paste • Semua {totalSceneCount} Scene Sekaligus
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Master Prompt untuk Agent Google Flow
              </h2>
              <p className="text-xs text-slate-300">
                Sesuai arahan Bos Besar: tidak perlu salin 1 per 1! Tempelkan satu blok perintah master ini ke kolom input Agent di Google Flow, dan sistem AI Flow akan langsung merender dan merangkai {totalSceneCount} scene secara bersamaan.
              </p>
            </div>
          </div>

          {/* Quick Language & Scene Structure Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLanguageMode('bilingual');
                  setIsEditingPrompt(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  languageMode === 'bilingual'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bilingual (Terbaik)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguageMode('indonesia');
                  setIsEditingPrompt(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  languageMode === 'indonesia'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bahasa Indonesia
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguageMode('english');
                  setIsEditingPrompt(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  languageMode === 'english'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English DeepMind
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIncludeOutro(!includeOutro);
                setIsEditingPrompt(false);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                includeOutro
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{includeOutro ? '6 Scene (+ Outro BPOM)' : '5 Scene Inti'}</span>
            </button>
          </div>
        </div>

        {/* Master Copy & Direct Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-amber-500/20">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Panjang: <strong className="text-amber-300">{masterAgentPrompt.length}</strong> karakter •{' '}
              <strong className="text-emerald-300">{totalSceneCount}</strong> Scene Lengkap
            </span>
            {masterCopied && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 animate-fadeIn">
                <Check className="w-3.5 h-3.5" />
                Siap Tempel (Ctrl+V) ke Flow!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingPrompt(!isEditingPrompt)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium cursor-pointer transition-colors"
            >
              {isEditingPrompt ? 'Kunci Teks' : 'Edit Prompt'}
            </button>

            <button
              onClick={handleDownloadMasterPromptTxt}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Unduh .txt</span>
            </button>

            <button
              onClick={handleCopyMasterPrompt}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                masterCopied
                  ? 'bg-emerald-400 text-slate-950 shadow-emerald-950/50 scale-[1.02]'
                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:brightness-110 text-slate-950 shadow-amber-950/50'
              }`}
            >
              {masterCopied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>BERHASIL DISALIN KE CLIPBOARD!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 stroke-[2.5]" />
                  <span>SALIN 1 MASTER PROMPT UNTUK AGENT FLOW</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Master Prompt Code / Text Box */}
        <div className="relative">
          {isEditingPrompt ? (
            <textarea
              value={customPromptText !== null ? customPromptText : masterAgentPrompt}
              onChange={(e) => setCustomPromptText(e.target.value)}
              rows={14}
              className="w-full p-4 bg-slate-950 border border-amber-500/40 rounded-xl text-xs font-mono text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 leading-relaxed resize-y"
              placeholder="Ketik atau ubah instruksi master prompt di sini..."
            />
          ) : (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl max-h-96 overflow-y-auto space-y-2 select-all font-mono text-xs leading-relaxed text-slate-200 scrollbar-thin scrollbar-thumb-slate-800">
              <pre className="whitespace-pre-wrap">{masterAgentPrompt}</pre>
            </div>
          )}
        </div>

        {/* 3-Step Simple Guide for Bos Besar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-bold font-mono shrink-0">
              1
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">Salin Master Prompt</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Klik tombol emas di atas. Seluruh struktur 6 scene & instruksi agent langsung tersalin.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-bold font-mono shrink-0">
              2
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">Buka Tab Google Flow</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Buka tab <strong className="text-slate-200">"Google Flow - Nov 04"</strong> yang sudah aktif di browser Bos Besar.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono shrink-0">
              3
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">Tempel & Enter di Agent</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Tekan <code className="text-amber-300">Ctrl + V</code> di chat Agent Flow. Agent akan memproses semua scene berurutan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LOCAL AUTOMATION BOT & ZIP PACKAGE (OFFLINE / BACKGROUND ALTERNATIVE) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                  OPSI PAKET LOKAL KOMPUTER
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                  Semua Berkas & Master Prompt
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Unduh Arsip Lengkap Proyek Konten (.ZIP)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all"
            >
              <FolderArchive className="w-4 h-4 text-amber-400" />
              <span>{isDownloadingZip ? 'Mengemas ZIP...' : 'Unduh Paket Lengkap (.ZIP)'}</span>
            </button>

            <button
              onClick={handleDownloadPythonBot}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Skrip Bot Python (.py)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COLLAPSIBLE INDIVIDUAL SCENE PROMPTS (OPTIONAL INSPECTION) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Rincian Per-Adegan Individual ({prompts.length} Scene Inti)
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              (Gunakan jika ingin memeriksa klip per klip)
            </span>
          </div>

          <button
            onClick={() => setShowDetailedScenes(!showDetailedScenes)}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>{showDetailedScenes ? 'Sembunyikan Rincian' : 'Tampilkan Rincian Adegan'}</span>
            {showDetailedScenes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showDetailedScenes && (
          <div className="space-y-4 animate-fadeIn">
            {prompts.map((p, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono text-xs">
                      {p.sceneNumber}
                    </span>
                    <span className="text-xs font-bold text-white">
                      Klip Adegan {p.sceneNumber} ({p.clipDurationSeconds} Detik · {p.aspectRatio})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      Kunci: {p.characterContinuityKey}
                    </span>
                    <button
                      onClick={() => handleCopy(p.promptText, idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        copiedIndex === idx
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Prompt Ini</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Prompt Text Box */}
                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                    Prompt Positif (Google Flow Generator):
                  </span>
                  <p className="text-xs text-slate-100 font-mono leading-relaxed select-all">
                    {p.promptText}
                  </p>
                </div>

                {/* Negative Prompt Box */}
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs">
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-0.5">
                    Negative Prompt (Anti-AI Slop & Anti-Fake Doctor):
                  </span>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {p.negativePrompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => onNavigate('scene_designer')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
        >
          Kembali ke Scene Designer
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('video_studio')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="w-4 h-4 text-amber-400" />
            <span>Lihat Studio Video Jadi</span>
          </button>

          <button
            onClick={() => onNavigate('voiceover_studio')}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Lanjut ke Voiceover Studio (Google AI)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
