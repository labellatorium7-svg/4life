import React from 'react';
import {
  Activity,
  FolderArchive,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileText,
  Film,
  Mic2,
  PackageCheck,
  Database,
} from 'lucide-react';
import { ContentProject, SourceRecord } from '../types';
import { KepalaPabrikChat } from '../components/KepalaPabrikChat';
import { ASSETS } from '../assets/assetMap';

interface DashboardViewProps {
  projects: ContentProject[];
  activeProject: ContentProject | null;
  sources: SourceRecord[];
  onNavigate: (view: string) => void;
  onSelectProject: (projectId: string) => void;
  onProjectCreatedOrUpdated: (project: ContentProject) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  activeProject,
  sources,
  onNavigate,
  onSelectProject,
  onProjectCreatedOrUpdated,
}) => {
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p) => p.status === 'draft' || p.status === 'in_review').length;
  const awaitingApproval = projects.filter((p) => !p.approval?.isApproved && p.status !== 'blocked_compliance').length;
  const completedPackages = projects.filter((p) => p.approval?.isApproved || p.status === 'production_ready').length;
  const blockedProjects = projects.filter((p) => p.status === 'blocked_compliance').length;

  const verifiedSourcesCount = sources.filter((s) => s.status === 'VERIFIED').length;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Executive Factory Hero Banner with High-Fidelity Asset */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="absolute inset-0">
          <img
            src={ASSETS.heroFactory}
            alt="Pabrik Konten 4Life"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-20 filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40" />
        </div>

        <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sistem Produksi Konten Cerdas
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
              Pusat Komando 4Life AI Content Factory
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Selamat datang, <strong className="text-amber-400">Founder & Chairman (Bos Besar)</strong>. Kepala Pabrik siap mengeksekusi instruksi konten edukasi Transfer Factor, sains imunitas, dan peluang kemitraan beretika tanpa risiko overclaim.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shrink-0">
            <img
              src={ASSETS.avatarKepalaPabrik}
              alt="Kepala Pabrik 4Life"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border border-amber-400"
            />
            <div>
              <div className="text-xs font-bold text-white">Kepala Pabrik 4Life</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>9 Agen Spesialis Siap Tugas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Quick Approval Callout Banner for Bos Besar */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg shrink-0">
            ✍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Alur Otonom • Bos Besar Cukup Menyetujui Naskah
              </span>
              {activeProject?.approval?.isApproved ? (
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  DISETUJUI (SELESAI 100%)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                  MENUNGGU TANDA TANGAN
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Ruang Persetujuan Naskah & Eksekusi Mandiri Tim Agen
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Bos Besar tidak perlu ribet mengurus prompt teknis. Cukup review naskah 6 scene & klik setujui, seluruh 7 agen langsung bekerja merakit suara, gambar, video, hingga payload Google Flow!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('executive_approval')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 flex items-center justify-center gap-2 shadow-xl shadow-amber-950/40 cursor-pointer transition-all transform hover:scale-[1.02]"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>⭐ Buka Ruang Persetujuan Naskah</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Total Proyek
          </span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {totalProjects}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Semua jalur naskah</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Sedang Diproduksi
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {inProgressProjects}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Proses divisi kreatif</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Menunggu Persetujuan
          </span>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
            {awaitingApproval}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Otoritas Bos Besar</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Paket Siap Render
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {completedPackages}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Flow & VO lengkap</span>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
            Peringatan Klaim
          </span>
          <div
            className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
              blockedProjects > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {blockedProjects}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {blockedProjects > 0 ? 'Tertahan sensor BPOM' : 'Zero unverified claims'}
          </span>
        </div>
      </div>

      {/* Real-Time Production Monitor Banner & Pipeline Quick Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Monitor Pabrik Real-Time
                </span>
                {activeProject && (
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    Proyek Aktif: {activeProject.id}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Papan Perjalanan Produksi & Status 9 Stasiun
              </h2>
            </div>
          </div>

          <button
            onClick={() => onNavigate('monitor')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer shrink-0"
          >
            <span>Buka Layar Monitor Penuh</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 9 Mini Pipeline Step Badges */}
        <div className="mt-4 grid grid-cols-3 md:grid-cols-9 gap-2">
          {[
            { step: '1. Otoritas', agent: 'Kepala Pabrik', done: true },
            { step: '2. Strategi', agent: 'Strategist', done: true },
            { step: '3. Riset', agent: 'NotebookLM', done: true },
            { step: '4. Naskah', agent: 'Scriptwriter', done: true },
            { step: '5. BPOM', agent: 'Compliance', done: activeProject?.status !== 'blocked_compliance' },
            { step: '6. Adegan', agent: 'Creative', done: true },
            { step: '7. Flow', agent: 'Flow Eng.', done: true },
            { step: '8. Audio', agent: 'Voiceover', done: true },
            { step: '9. Bos Besar', agent: 'Approval', done: activeProject?.approval?.isApproved },
          ].map((s, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('monitor')}
              className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                s.done
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-300 animate-pulse'
              }`}
            >
              <div className="text-[10px] font-mono font-bold truncate">{s.step}</div>
              <div className="text-[9px] text-slate-400 truncate mt-0.5">{s.agent}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Central Conversational Orchestrator */}
      <section aria-label="Konsol Kepala Pabrik">
        <KepalaPabrikChat
          activeProject={activeProject}
          onProjectCreatedOrUpdated={onProjectCreatedOrUpdated}
          onNavigate={onNavigate}
        />
      </section>

      {/* Active Project Quick Workflow Studio */}
      {activeProject && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Proyek Terbuka
                </span>
                <span className="text-xs font-mono text-slate-400">[{activeProject.id}]</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{activeProject.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('video_studio')}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <span>🎬 Tonton Video Jadi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('production_package')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Paket Produksi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Stage Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { id: 'strategy', label: 'Strategi', icon: Sparkles, done: true },
              { id: 'knowledge_base', label: 'Riset', icon: Database, done: true },
              { id: 'script_studio', label: 'Naskah', icon: FileText, done: true },
              {
                id: 'compliance',
                label: 'Klaim BPOM',
                icon: AlertTriangle,
                done: activeProject.claimsReview.overallStatus === 'PASSED',
                isError: activeProject.status === 'blocked_compliance',
              },
              { id: 'scene_designer', label: 'Adegan', icon: Film, done: activeProject.scenes.length > 0 },
              { id: 'flow_prompts', label: 'Flow Prompt', icon: Sparkles, done: activeProject.flowPrompts.length > 0 },
              { id: 'voiceover_studio', label: 'Voiceover', icon: Mic2, done: !!activeProject.voiceover },
              { id: 'production_package', label: 'Paket Siap', icon: PackageCheck, done: activeProject.approval.isApproved },
            ].map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <button
                  key={stage.id}
                  onClick={() => onNavigate(stage.id)}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                    stage.isError
                      ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900/40'
                      : stage.done
                      ? 'bg-slate-950 border-slate-800 hover:border-amber-400/40 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400">{idx + 1}</span>
                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xs font-semibold truncate">{stage.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Production History and Knowledge Base Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects List */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-amber-400" />
              <span>Riwayat Produksi Terkini</span>
            </h3>
            <button
              onClick={() => onNavigate('content_library')}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              Semua Proyek ({projects.length})
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {projects.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">{p.id}</span>
                    <span className="text-slate-500 text-xs">·</span>
                    <span className="text-[11px] text-slate-400 uppercase">{p.platform} ({p.duration}s)</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 truncate mt-0.5">{p.title}</h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      p.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : p.status === 'blocked_compliance'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {p.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traceable Knowledge Base Status */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Status Riset & Bukti Ilmiah</span>
            </h3>
            <button
              onClick={() => onNavigate('knowledge_base')}
              className="text-xs text-emerald-400 hover:underline cursor-pointer"
            >
              Kelola Sumber ({sources.length})
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span>Hierarki Sumber 1: Dokumen Resmi 4Life</span>
              <span className="text-emerald-400 font-semibold">Tervalidasi</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Hierarki Sumber 2: Registrasi BPOM RI (SI/TI)</span>
              <span className="text-emerald-400 font-semibold">Tervalidasi</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Hierarki Sumber 3: Publikasi Peer-Reviewed Imun</span>
              <span className="text-emerald-400 font-semibold">Tersinkron</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Hierarki Sumber 4: Regulasi Kode Etik APLI</span>
              <span className="text-emerald-400 font-semibold">Kepatuhan 100%</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Semua klaim dipagari regulasi: tidak ada klaim penyembuhan penyakit medis.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
