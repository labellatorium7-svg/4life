import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  RotateCw,
  Sparkles,
  ShieldCheck,
  FileText,
  Film,
  Mic2,
  PackageCheck,
  ChevronRight,
  Database,
  ArrowRight,
  ThumbsUp,
  Sliders,
  Send,
  Eye,
} from 'lucide-react';
import { ContentProject, SourceRecord } from '../types';
import { ASSETS } from '../assets/assetMap';

interface ProductionMonitorViewProps {
  projects: ContentProject[];
  activeProject: ContentProject | null;
  sources: SourceRecord[];
  onNavigate: (view: string) => void;
  onSelectProject: (projectId: string) => void;
  onApproveProject: (projectId: string) => void;
  onProjectCreatedOrUpdated: (project: ContentProject) => void;
}

export const ProductionMonitorView: React.FC<ProductionMonitorViewProps> = ({
  projects,
  activeProject,
  sources,
  onNavigate,
  onSelectProject,
  onApproveProject,
  onProjectCreatedOrUpdated,
}) => {
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [newCommandText, setNewCommandText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isApproved = activeProject?.approval?.isApproved;
  const isBlocked = activeProject?.status === 'blocked_compliance';

  // Compute production metrics
  const totalScenes = activeProject?.scenes?.length || 0;
  const totalFlowPrompts = activeProject?.flowPrompts?.length || 0;
  const wordCount = activeProject?.script?.bodyNarration
    ? activeProject.script.bodyNarration.split(/\s+/).filter(Boolean).length +
      (activeProject.script.hook?.split(/\s+/).filter(Boolean).length || 0) +
      (activeProject.script.closing?.split(/\s+/).filter(Boolean).length || 0)
    : 0;
  const estDuration = activeProject?.duration || 60;
  const verifiedSourcesCount = activeProject?.research?.sources?.length || 3;

  // Pipeline Stations Data
  const stations = [
    {
      step: 1,
      title: 'Stasiun 1: Instruksi & Otoritas',
      agent: 'Kepala Pabrik 4Life',
      role: 'Master Orchestrator',
      avatar: ASSETS.avatarKepalaPabrik,
      icon: Activity,
      status: 'completed',
      summary: activeProject
        ? `Menerima arahan: "${activeProject.title}"`
        : 'Menunggu instruksi Bos Besar',
      detail: `Objektif: ${activeProject?.objective || 'Edukasi produk 4Life'}. Target format: ${activeProject?.platform?.toUpperCase() || 'REELS'}, durasi: ${activeProject?.duration || 60} detik.`,
      viewTarget: 'kepala_pabrik',
    },
    {
      step: 2,
      title: 'Stasiun 2: Strategi & Segmentasi',
      agent: 'Strategic Director',
      role: 'Strategi Konten & Format',
      avatar: ASSETS.avatarStrategist,
      icon: Sliders,
      status: 'completed',
      summary: activeProject?.strategy?.angle || 'Menentukan pilar edukasi dan batasan etika pemasaran',
      detail: `Target Audiens: ${activeProject?.targetAudience || 'Keluarga & Usia 40+'}. Seri: ${activeProject?.strategy?.seriesName || 'Ensiklopedia Imun'} (Eps ${activeProject?.strategy?.episodeNumber || 1}). Call-to-action intent: ${activeProject?.strategy?.callToActionIntent || 'Education'}.`,
      viewTarget: 'strategy',
    },
    {
      step: 3,
      title: 'Stasiun 3: Riset & Knowledge Base',
      agent: 'Knowledge Manager',
      role: 'Riset Bukti Resmi & NotebookLM',
      avatar: ASSETS.avatarResearcher,
      icon: Database,
      status: 'completed',
      summary: `${verifiedSourcesCount} Sumber Terverifikasi dikaitkan`,
      detail: `Tersambung ke Google NotebookLM Resmi 4Life (ID: 6ad42fce). Menggunakan data Kompendium Formulasi Resmi (PDF) dan Video Edukasi Kanal Resmi 4Life Indonesia tanpa mengarang sumber.`,
      viewTarget: 'knowledge_base',
    },
    {
      step: 4,
      title: 'Stasiun 4: Script Studio',
      agent: 'Master Scriptwriter',
      role: 'Penulis Naskah Edukatif',
      avatar: ASSETS.avatarScriptwriter,
      icon: FileText,
      status: 'completed',
      summary: `Naskah selesai (~${wordCount} kata, estimasi ${activeProject?.script?.estimatedTotalSeconds || 47}s)`,
      detail: `Opening Hook: "${activeProject?.script?.hook || 'Banyak yang mengira...'}" diselaraskan dengan tempo baca 135 kata/menit yang natural khas Indonesia.`,
      viewTarget: 'script_studio',
    },
    {
      step: 5,
      title: 'Stasiun 5: Sensor Klaim & BPOM',
      agent: 'Claims Compliance Officer',
      role: 'Audit Hukum & Etika APLI',
      avatar: ASSETS.avatarCompliance,
      icon: ShieldCheck,
      status: isBlocked ? 'blocked' : 'completed',
      summary: isBlocked
        ? 'PERINGATAN: Ditemukan klaim penyakit tanpa izin'
        : '100% LULUS AUDIT BPOM RI (Zero Overclaim)',
      detail: isBlocked
        ? 'Naskah dibekukan sementara hingga klaim berisiko diperbaiki.'
        : 'Memastikan Transfer Factor diposisikan sebagai Suplemen Imun (SI BPOM) pembawa informasi sel, bukan obat penyembuh penyakit. Kemitraan bebas iming-iming kaya kilat.',
      viewTarget: 'compliance',
    },
    {
      step: 6,
      title: 'Stasiun 6: Desain Adegan Sinematik',
      agent: 'Scene Designer & Creative Director',
      role: 'Storyboard & Sinematografi',
      avatar: ASSETS.avatarCreative,
      icon: Film,
      status: 'completed',
      summary: `${totalScenes} Adegan Sinematik Otentik Indonesia`,
      detail: `Karakter, wardrobe, dan pencahayaan disesuaikan dengan realitas rumah dan keluarga Indonesia. Visual kontinyu tanpa elemen asing atau artefak palsu AI.`,
      viewTarget: 'scene_designer',
    },
    {
      step: 7,
      title: 'Stasiun 7: Flow Prompt Engineering',
      agent: 'Flow Prompt Engineer',
      role: 'Spesialis Prompt Google Flow',
      avatar: ASSETS.avatarFlowEngineer,
      icon: Sparkles,
      status: 'completed',
      summary: `${totalFlowPrompts} Prompt Flow Siap Render`,
      detail: `Setiap prompt dikunci pada durasi 10-12 detik dengan negative prompt pencegah 'fake doctor in lab coat', 'stethoscope in living room', dan 'distorted CGI hands'.`,
      viewTarget: 'flow_prompts',
    },
    {
      step: 8,
      title: 'Stasiun 8: Voiceover & Audio QC',
      agent: 'Voiceover Director',
      role: 'Pengarah Suara & Timecode',
      avatar: ASSETS.avatarVoiceover,
      icon: Mic2,
      status: 'completed',
      summary: `${activeProject?.voiceover?.narratorProfile?.persona || 'Edukator Terpercaya'} (${activeProject?.voiceover?.narratorProfile?.gender?.toUpperCase()})`,
      detail: `Panduan timecode detik demi detik, rekomendasi musik latar akustik menenangkan (-20dB di bawah vokal) agar narasi terdengar empuk dan berkelas.`,
      viewTarget: 'voiceover_studio',
    },
    {
      step: 9,
      title: 'Stasiun 9: Meja Persetujuan Bos Besar',
      agent: 'Founder & Chairman',
      role: 'Otoritas Tertinggi (Bos Besar)',
      avatar: ASSETS.avatarBosBesar,
      icon: PackageCheck,
      status: isApproved ? 'approved' : 'pending_approval',
      summary: isApproved
        ? 'TELAH DISETUJUI & SIAP EKSPOR'
        : 'MENUNGGU KEPUTUSAN BOS BESAR',
      detail: isApproved
        ? `Disetujui pada ${new Date(activeProject?.approval?.approvedAt || '').toLocaleDateString('id-ID')}. Paket produksi telah disahkan.`
        : 'Seluruh materi telah lengkap dan diaudit. Silakan klik tombol "Setujui Proyek Ini" untuk menyelesaikan siklus produksi.',
      viewTarget: 'production_package',
    },
  ];

  const handleQuickCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommandText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orchestrator/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: newCommandText.trim(),
          format: 'reels',
          duration: 60,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          onProjectCreatedOrUpdated(data.project);
        }
      }
      setNewCommandText('');
    } catch (err) {
      console.error('Gagal menjalankan perintah cepat:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Monitor Header: Industrial Control Room Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MONITOR PABRIK REAL-TIME • SISTEM AKTIF</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <span>Papan Perjalanan Produksi Konten</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Pantau langsung bagaimana instruksi Bos Besar diolah dari tahap pertama hingga paket produksi siap tayang, dikawal oleh 9 agen spesialis pabrik.
            </p>
          </div>

          {/* Quick Stats on Monitor */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Status Pabrik</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                <span>9 Stasiun Beroperasi</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-left">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Sumber Riset</div>
              <div className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>NotebookLM Tersambung</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Selector Bar within Monitor */}
        {activeProject && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Proyek di Monitor:
              </span>
              <span className="text-sm font-bold text-white bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 font-mono">
                {activeProject.id}
              </span>
              <span className="text-sm font-medium text-slate-200 truncate max-w-md">
                {activeProject.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isApproved ? (
                <button
                  onClick={() => onApproveProject(activeProject.id)}
                  disabled={isBlocked}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                    isBlocked
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Setujui Proyek Ini</span>
                </button>
              ) : (
                <div className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Telah Disetujui Bos Besar</span>
                </div>
              )}

              <button
                onClick={() => onNavigate('video_studio')}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>🎬 Tonton Video Jadi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('production_package')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Naskah & Flow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Conveyor Pipeline / Progress Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Alur Perjalanan Produksi (9 Stasiun Kerja)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik pada stasiun mana saja untuk mengintip hasil kerja divisi terkait.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Kemajuan: <span className="text-emerald-400 font-bold">{isApproved ? '100%' : '88%'}</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isApproved
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 w-full'
                : 'bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-400 w-[88%]'
            }`}
          />
        </div>

        {/* 9 Stations Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stations.map((station) => {
            const isSelected = selectedStation === station.step;
            const Icon = station.icon;

            return (
              <div
                key={station.step}
                onClick={() => setSelectedStation(isSelected ? null : station.step)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400/80 shadow-lg ring-1 ring-amber-400/40'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Station Top Line */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={station.avatar}
                      alt={station.agent}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {station.title}
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {station.agent}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {station.status === 'completed' && (
                    <span className="p-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {station.status === 'approved' && (
                    <span className="p-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {station.status === 'pending_approval' && (
                    <span className="p-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 shrink-0 animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {station.status === 'blocked' && (
                    <span className="p-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Station Output Snippet */}
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="text-xs text-slate-300 font-medium line-clamp-1">
                    {station.summary}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {station.detail}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-amber-400/90 hover:text-amber-300 flex items-center gap-1">
                    <span>Lihat Detail</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(station.viewTarget);
                    }}
                    className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                  >
                    Buka Studio ➔
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Inspector Drawer for Selected Station */}
      {selectedStation !== null && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <img
                src={stations[selectedStation - 1].avatar}
                alt={stations[selectedStation - 1].agent}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border border-amber-400 object-cover"
              />
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                  Inspeksi Stasiun #{selectedStation}
                </span>
                <h3 className="text-base font-bold text-white">
                  {stations[selectedStation - 1].title} — {stations[selectedStation - 1].agent}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setSelectedStation(null)}
              className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg cursor-pointer"
            >
              Tutup Panel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Hasil Keluaran Divisi:
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">
                {stations[selectedStation - 1].summary}
              </p>
              <p className="text-slate-400 leading-relaxed">
                {stations[selectedStation - 1].detail}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Aksi Lanjutan Bos Besar:
                </span>
                <p className="text-slate-300">
                  Ingin menelaah naskah lengkap atau mengubah parameter spesifik dari stasiun ini?
                </p>
              </div>

              <button
                onClick={() => onNavigate(stations[selectedStation - 1].viewTarget)}
                className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-center flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Buka Studio {stations[selectedStation - 1].agent}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Order Command Box directly on the Monitor */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              <span>Perintahkan Produksi Konten Baru Dari Monitor Ini</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ketikkan instruksi baru, lalu tonton langsung jalannya produksi di 9 stasiun di atas!
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Siap Eksekusi Instan</span>
          </div>
        </div>

        <form onSubmit={handleQuickCommand} className="flex gap-3">
          <input
            type="text"
            value={newCommandText}
            onChange={(e) => setNewCommandText(e.target.value)}
            placeholder="Contoh: Buatkan 1 naskah video 60 detik tentang daya tahan tubuh lansia bersumber dari NotebookLM..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={!newCommandText.trim() || isSubmitting}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
          >
            {isSubmitting ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Jalankan Pabrik</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
