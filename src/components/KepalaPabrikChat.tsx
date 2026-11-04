import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Compass,
  FileText,
  Video,
} from 'lucide-react';
import { ContentProject, PlatformFormat } from '../types';
import { ASSETS } from '../assets/assetMap';

interface KepalaPabrikChatProps {
  onProjectCreatedOrUpdated: (project: ContentProject) => void;
  onNavigate: (view: string) => void;
  activeProject: ContentProject | null;
}

const QUICK_PROMPTS = [
  'Buat konten bersumber dari berkas resmi di NotebookLM saya (PDF & YouTube).',
  'Buatkan satu konten hari ini.',
  'Buat konten tentang Transfer Factor.',
  'Cari ide konten edukasi kesehatan untuk audiens usia 40 tahun ke atas.',
  'Buat video edukasi berdurasi 60 detik.',
  'Buat serial konten tentang sistem imun.',
  'Buat konten edukasi sekaligus memperkenalkan peluang kemitraan 4Life.',
];

const SPECIALIST_AGENTS = [
  { id: 1, name: 'Strategic Director', role: 'Audiens & Sudut Pandang' },
  { id: 2, name: 'Knowledge Manager', role: 'Hierarki Bukti Ilmiah' },
  { id: 3, name: 'Master Scriptwriter', role: 'Penyusunan Naskah Alami' },
  { id: 4, name: 'Claims Compliance Officer', role: 'Audit Regulasi BPOM & APLI' },
  { id: 5, name: 'Creative Director', role: 'Sinematografi Realistis' },
  { id: 6, name: 'Scene Designer', role: 'Struktur Adegan Dinamis' },
  { id: 7, name: 'Flow Prompt Engineer', role: 'Prompt Google Flow 10 Detik' },
  { id: 8, name: 'Voiceover Director', role: 'Timecode & Panduan Suara' },
  { id: 9, name: 'Video Production Manager', role: 'Assembling & Paket Produksi' },
];

export const KepalaPabrikChat: React.FC<KepalaPabrikChatProps> = ({
  onProjectCreatedOrUpdated,
  onNavigate,
  activeProject,
}) => {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState<PlatformFormat>('reels');
  const [duration, setDuration] = useState<number>(60);
  const [prioritizeNotebookLm, setPrioritizeNotebookLm] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(-1);
  const [report, setReport] = useState<{
    greeting: string;
    project: ContentProject;
    complianceAlert?: string | null;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (textToUse?: string) => {
    const inputCommand = textToUse || prompt;
    if (!inputCommand.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setReport(null);
    setActiveAgentIndex(0);

    // Simulate agent progress indicator steps
    const interval = setInterval(() => {
      setActiveAgentIndex((prev) => {
        if (prev < SPECIALIST_AGENTS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    try {
      const response = await fetch('/api/orchestrator/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputCommand,
          existingProjectId: activeProject ? activeProject.id : undefined,
          targetFormat: platform,
          targetDuration: duration,
          prioritizeNotebookLm: prioritizeNotebookLm,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const data = await response.json();
      clearInterval(interval);
      setActiveAgentIndex(SPECIALIST_AGENTS.length);

      setReport({
        greeting: data.greeting,
        project: data.project,
        complianceAlert: data.complianceAlert,
      });

      onProjectCreatedOrUpdated(data.project);
      setPrompt('');
    } catch (err: any) {
      clearInterval(interval);
      console.error('Orchestration failed:', err);
      setErrorMsg('Gagal memproses instruksi pabrik: ' + (err.message || 'Koneksi terputus.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header Profile Kepala Pabrik */}
      <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={ASSETS.avatarKepalaPabrik}
              alt="Kepala Pabrik 4Life"
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Kepala Pabrik 4Life
              </h2>
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                Master AI Orchestrator
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Siap menerima instruksi dari Founder & Chairman (Bos Besar). Mengarahkan 9 divisi spesialis untuk produksi konten terverifikasi.
            </p>
          </div>
        </div>

        {/* Format & Duration Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 text-[11px] px-2 font-medium">Format:</span>
            {(['reels', 'tiktok', 'shorts', 'youtube_long'] as PlatformFormat[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPlatform(f)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer uppercase ${
                  platform === f
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 text-[11px] px-2 font-medium">Durasi:</span>
            {[30, 60, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  duration === d
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Command Input Box */}
      <div className="p-5 space-y-4">
        {/* Quick Directives & NotebookLM toggle */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Instruksi Cepat Bos Besar:
            </label>
            <button
              type="button"
              onClick={() => setPrioritizeNotebookLm(!prioritizeNotebookLm)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                prioritizeNotebookLm
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
              title="Klik untuk mengaktifkan/menonaktifkan prioritas berkas resmi NotebookLM"
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  prioritizeNotebookLm ? 'text-emerald-400' : 'text-slate-600'
                }`}
              />
              <span>Rujukan: Berkas Resmi NotebookLM (PDF & YouTube)</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(qp);
                  handleSubmit(qp);
                }}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-amber-400/40 transition-all text-left flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{qp}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input area */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Berikan instruksi ke Kepala Pabrik (misal: 'Buat video edukasi 60 detik tentang Transfer Factor untuk orang tua usia 50 tahun')..."
            rows={3}
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none font-sans"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Pabrik Beroperasi...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>Perintahkan Pabrik</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live 9 Agents Pipeline status when loading */}
        {isLoading && (
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                Orkestrasi 9 Agen Spesialis Sedang Berjalan...
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Langkah {Math.min(activeAgentIndex + 1, 9)} / 9
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {SPECIALIST_AGENTS.map((agent, i) => {
                const isDone = i < activeAgentIndex;
                const isCurrent = i === activeAgentIndex;
                return (
                  <div
                    key={agent.id}
                    className={`p-2 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                      isDone
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                        : isCurrent
                        ? 'bg-amber-950/50 border-amber-500/80 text-amber-300 ring-1 ring-amber-400'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="font-semibold truncate">{agent.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{agent.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Result Report from Kepala Pabrik */}
        {report && (
          <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl space-y-4 animate-fadeIn">
            {/* Direct Greeting / Report */}
            <div className="flex items-start gap-3">
              <img
                src={ASSETS.avatarKepalaPabrik}
                alt="Kepala Pabrik 4Life"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-amber-400 shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-300">Laporan Kepala Pabrik:</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {report.project.id}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  {report.greeting}
                </p>
              </div>
            </div>

            {/* Compliance Alert if Blocked */}
            {report.complianceAlert && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg flex items-center justify-between text-xs text-rose-300">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{report.complianceAlert}</span>
                </div>
                <button
                  onClick={() => onNavigate('compliance')}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium cursor-pointer"
                >
                  Buka Audit Klaim
                </button>
              </div>
            )}

            {/* Output Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Judul Konten</span>
                <span className="font-semibold text-white block mt-0.5 truncate">
                  {report.project.title}
                </span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Format & Durasi</span>
                <span className="font-semibold text-amber-400 block mt-0.5">
                  {report.project.platform.toUpperCase()} · {report.project.duration}s
                </span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Jumlah Adegan Flow</span>
                <span className="font-semibold text-emerald-400 block mt-0.5">
                  {report.project.scenes.length} Adegan (Klip 10s)
                </span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Status Kepatuhan</span>
                <span
                  className={`font-semibold block mt-0.5 ${
                    report.project.claimsReview.overallStatus === 'PASSED'
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {report.project.claimsReview.overallStatus}
                </span>
              </div>
            </div>

            {/* Fast Navigation Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">Tinjau Hasil Divisi:</span>
              <button
                onClick={() => onNavigate('script_studio')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Script Studio</span>
              </button>
              <button
                onClick={() => onNavigate('flow_prompts')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Flow ({report.project.flowPrompts.length} Prompt)</span>
              </button>
              <button
                onClick={() => onNavigate('production_package')}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Paket Produksi Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
