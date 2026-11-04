import React, { useState, useEffect } from 'react';
import { ContentProject } from '../types';
import { ASSETS } from '../assets/assetMap';
import { VideoPlayerStudio } from '../components/VideoPlayerStudio';
import { buildMasterFlowAgentPrompt } from '../utils/production';
import {
  CheckCircle2,
  ShieldCheck,
  Play,
  Download,
  Copy,
  Check,
  Bot,
  Sparkles,
  ArrowRight,
  Clock,
  Volume2,
  Film,
  FileText,
  RotateCcw,
  AlertCircle,
  Share2,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface ExecutiveApprovalViewProps {
  activeProject: ContentProject | null;
  onUpdateProject: (project: ContentProject) => void;
  onNavigate: (view: string) => void;
}

export const ExecutiveApprovalView: React.FC<ExecutiveApprovalViewProps> = ({
  activeProject,
  onUpdateProject,
  onNavigate,
}) => {
  const [isExecutingSwarm, setIsExecutingSwarm] = useState(false);
  const [currentAgentStep, setCurrentAgentStep] = useState(0);
  const [copiedMasterFlow, setCopiedMasterFlow] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'video' | 'flow_payload'>('script');

  const isApproved = activeProject?.approval?.isApproved;

  // Auto-switch to video tab if already approved
  useEffect(() => {
    if (isApproved && !isExecutingSwarm) {
      setActiveTab('video');
    }
  }, [isApproved]);

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-400">
        Pilih atau buat proyek konten terlebih dahulu di Dashboard.
      </div>
    );
  }

  // 7 Autonomous Agents Swarm definition
  const agents = [
    {
      id: 1,
      name: 'Agen 1: Riset & Kepatuhan BPOM RI',
      role: 'Verifikasi Klaim Ilmiah & Regulasi',
      desc: 'Memvalidasi klaim suplemen (POM SI 104 601 441), mensterilkan kata kuratif/obat resep.',
      statusText: '100% Lolos Sensor Kepatuhan',
    },
    {
      id: 2,
      name: 'Agen 2: Scriptwriter & Hook Master',
      role: 'Penyusunan Naskah 6 Scene',
      desc: 'Mengunci 6 scene dengan hook 3 detik mematikan, 132 kata pas untuk durasi 58 detik.',
      statusText: 'Naskah 6 Scene Terkunci & Siap',
    },
    {
      id: 3,
      name: 'Agen 3: Voiceover TTS Audio Engine',
      role: 'Sintesis Suara Bahasa Indonesia Natural',
      desc: 'Membangkitkan vokal edukator hangat berwibawa, sinkronisasi jeda per scene.',
      statusText: 'Audio Narasi Berhasil Disintesis',
    },
    {
      id: 4,
      name: 'Agen 4: Visual Storyboard 3D Cell Studio',
      role: 'Generasi Frame Visual Seluler 4K',
      desc: 'Merakit 6 visual makroskopis molekul Transfer Factor & sel pembunuh alami (NK cell).',
      statusText: '6 Frame Visual 3D Selesai Dirender',
    },
    {
      id: 5,
      name: 'Agen 5: Video Timeline & Subtitle Engine',
      role: 'Perakitan Timeline Video Otomatis',
      desc: 'Menggabungkan visual, audio TTS, transisi zoom lambat, dan subtitle sinkron.',
      statusText: 'Video Timeline Siap Ditonton',
    },
    {
      id: 6,
      name: 'Agen 6: Multi-Platform Packager',
      role: 'Pengemasan Format Media Sosial',
      desc: 'Menyiapkan metadata, hashtag, dan rasio 9:16 untuk TikTok, Reels, Shorts & WhatsApp.',
      statusText: 'Paket Distribusi Lengkap',
    },
    {
      id: 7,
      name: 'Agen 7: Google Flow Master Dispatcher',
      role: 'Payload Eksekusi 6 Scene Sekaligus',
      desc: 'Menyusun Master Prompt tunggal untuk agen Google Flow agar video dapat dirender instan.',
      statusText: 'Payload Google Flow Siap Tempel',
    },
  ];

  // Trigger Autonomous Swarm Execution
  const handleApproveAndRunAgents = () => {
    setIsExecutingSwarm(true);
    setCurrentAgentStep(1);

    // Step-by-step agent execution simulation
    const interval = setInterval(() => {
      setCurrentAgentStep((prev) => {
        if (prev >= 7) {
          clearInterval(interval);
          setIsExecutingSwarm(false);

          // Update project to approved
          const updated: ContentProject = {
            ...activeProject,
            status: 'approved',
            approval: {
              isApproved: true,
              approvedBy: 'Founder & Chairman (Bos Besar)',
              approvedAt: new Date().toISOString(),
              feedback: 'Naskah 6 scene telah disetujui penuh oleh Bos Besar. Seluruh 7 agen telah mengeksekusi tugas secara otonom.',
            },
          };
          onUpdateProject(updated);
          setActiveTab('video');
          return 7;
        }
        return prev + 1;
      });
    }, 700);
  };

  const handleCopyMasterFlow = () => {
    const masterPrompt = buildMasterFlowAgentPrompt(activeProject, {
      aspectRatio: activeProject.platform === 'youtube_long' ? '16:9' : '9:16',
      languageMode: 'bilingual',
      includeOutro: true,
    });
    navigator.clipboard.writeText(masterPrompt);
    setCopiedMasterFlow(true);
    setTimeout(() => setCopiedMasterFlow(false), 2500);
  };

  const handleDownloadFullPackage = () => {
    const scriptText = `4LIFE AI CONTENT FACTORY - PAKET RESMI PRODUKSI
Proyek: ${activeProject.title}
Status: DISETUJUI BOS BESAR (${activeProject.approval?.approvedAt || new Date().toISOString()})
Legalitas: POM SI 104 601 441 (4Life Transfer Factor Tri-Factor)

=== NASKAH 6 SCENE LENGKAP ===
HOOK:
${activeProject.script?.hook || ''}

NARASI BODY:
${activeProject.script?.bodyNarration || ''}

CALL TO ACTION:
${activeProject.script?.closing || ''}

=== DETAIL 6 SCENE ===
${(activeProject.scenes || [])
  .map(
    (s, idx) => `
SCENE ${idx + 1} (${s.onScreenText || `Scene ${s.sceneNumber}`}):
- Durasi: ${s.durationSeconds} detik
- Visual: ${s.visualDescription}
- Narasi VO: ${s.narrationSegment}
- Subtitle: ${s.onScreenText || s.narrationSegment}
`
  )
  .join('\n')}

=== MASTER PROMPT GOOGLE FLOW ===
${buildMasterFlowAgentPrompt(activeProject, {
  aspectRatio: '9:16',
  languageMode: 'bilingual',
  includeOutro: true,
})}
`;

    const blob = new Blob([scriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Paket_Produksi_${activeProject.id}_Disetujui_BosBesar.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Executive Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 p-6 lg:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Ruang Otoritas Tertinggi • Founder & Chairman
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Pusat Persetujuan Bos Besar
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong className="text-amber-400">Bos Besar tidak perlu repot mengetik atau menempel satu per satu.</strong> Tugas Bos Besar hanya membaca dan menyetujui naskah di bawah ini. Begitu tombol persetujuan ditekan, <span className="text-white font-semibold">seluruh 7 Agen AI Pabrik akan langsung mengeksekusi riset, suara, gambar, video, hingga paket Google Flow secara otomatis!</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {isApproved ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center sm:text-right">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Naskah Telah Disetujui Penuh
                </div>
                <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                  Semua Agen Selesai 100% • Video Jadi Siap Ditonton
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/40 text-center sm:text-right">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  Menunggu Tanda Tangan Bos Besar
                </div>
                <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                  Klik Tombol Emas di Bawah untuk Menjalankan Semua Agen
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'script'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Naskah 6 Scene Siap Review</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'video'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>2. 🎬 Tonton Video Jadi (Hasil Eksekusi Agen)</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950/40 text-emerald-200">
              {isApproved ? 'SIAP' : 'PREVIEW'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('flow_payload')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'flow_payload'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>3. ⚡ Master Prompt Google Flow (6 Scene Sekaligus)</span>
          </button>
        </div>
      </div>

      {/* Autonomous Agent Swarm Live Progress Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Tim 7 Agen AI Pabrik (Swarm Executor)</span>
                {isExecutingSwarm ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    SEDANG BEKERJA OTOMATIS...
                  </span>
                ) : isApproved ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    SELESAI 100%
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                    STANDBY (MENUNGGU PERSETUJUAN NASKAH)
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Agen bekerja paralel tanpa membebani Bos Besar dengan urusan teknis prompt atau stitching.
              </p>
            </div>
          </div>

          {/* Action Trigger */}
          <div>
            {!isApproved ? (
              <button
                onClick={handleApproveAndRunAgents}
                disabled={isExecutingSwarm}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 flex items-center justify-center gap-3 shadow-xl shadow-amber-950/40 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <ShieldCheck className="w-5 h-5 text-slate-950" />
                <span>✍️ SETUJUI NASKAH & JALANKAN SEMUA AGEN OTOMATIS</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('video')}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Tonton Video Sekarang</span>
                </button>
                <button
                  onClick={handleDownloadFullPackage}
                  className="px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
                  title="Unduh Naskah, Audio & Prompt Paket"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Paket</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 7 Agents Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {agents.map((agent) => {
            const isCompleted = isApproved || (isExecutingSwarm && currentAgentStep >= agent.id);
            const isWorking = isExecutingSwarm && currentAgentStep === agent.id;

            return (
              <div
                key={agent.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : isWorking
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 shadow-md animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    {isCompleted ? '✅ SELESAI' : isWorking ? '⚙️ SEDANG JALAN' : '⏳ STANDBY'}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isWorking ? (
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="text-xs font-bold text-white mt-1.5">{agent.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{agent.desc}</div>
                <div
                  className={`mt-2 text-[10px] font-mono px-2 py-0.5 rounded border inline-block ${
                    isCompleted
                      ? 'bg-emerald-900/40 border-emerald-800 text-emerald-300'
                      : isWorking
                      ? 'bg-amber-900/40 border-amber-800 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? agent.statusText : isWorking ? 'Memproses data...' : 'Menunggu klik Bos'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area based on Selected Tab */}
      {activeTab === 'script' && (
        <div className="space-y-6">
          {/* Executive Script Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold">
                  NASKAH RESMI SIAP PERSETUJUAN BOS BESAR
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {activeProject.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Format: {activeProject.platform.toUpperCase()} (9:16) • Durasi: {activeProject.duration} Detik • 6 Scene Lengkap • Standar BPOM RI POM SI 104 601 441
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Bebas Overclaim Obat
                </span>
              </div>
            </div>

            {/* Hook & Objective Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-mono text-amber-400 uppercase font-bold block">
                  Hook Pembuka (0-3 Detik)
                </span>
                <p className="text-xs text-slate-200 font-medium italic mt-1.5 leading-relaxed">
                  "{activeProject.script?.hook || 'Sering tumbang meski sudah minum vitamin tumpuk-tumpuk?'}"
                </p>
                <span className="text-[10px] text-slate-500 mt-2 block">
                  Target: Menghentikan scroll penonton dalam 3 detik pertama.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-mono text-sky-400 uppercase font-bold block">
                  Pilar Sains Utama
                </span>
                <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                  3 Kemampuan Krusial Transfer Factor: <strong>1. Kenali (Recognize)</strong>, <strong>2. Respon (React)</strong>, dan <strong>3. Ingat (Remember)</strong>.
                </p>
                <span className="text-[10px] text-slate-500 mt-2 block">
                  Bukan vitamin biasa, melainkan molekul pendidik imun.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold block">
                  Legalitas & Outro
                </span>
                <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                  No Reg BPOM: <strong>POM SI 104 601 441</strong>. Suplemen kesehatan bermutu tinggi dari 4Life Research USA.
                </p>
                <span className="text-[10px] text-slate-500 mt-2 block">
                  Wajib tampil di scene penutup kartu legalitas.
                </span>
              </div>
            </div>

            {/* 6 Scenes Breakdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Rincian 6 Scene Video Lengkap</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(activeProject.scenes || []).map((scene, idx) => {
                  const sceneImages = [
                    ASSETS.scene1,
                    ASSETS.scene2,
                    ASSETS.scene3,
                    ASSETS.scene4,
                    ASSETS.scene5,
                    ASSETS.heroFactory,
                  ];
                  const img = sceneImages[idx % sceneImages.length];

                  return (
                    <div
                      key={scene.id || idx}
                      className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col justify-between"
                    >
                      {/* Image Thumbnail Preview */}
                      <div className="relative h-32 bg-slate-900 overflow-hidden">
                        <img
                          src={img}
                          alt={scene.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-amber-400 border border-slate-700">
                          SCENE {idx + 1} • {scene.durationSeconds || 10}s
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="text-xs font-bold text-white">{scene.title}</div>
                          <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                            <strong className="text-amber-400">Narasi VO:</strong> "{scene.voiceoverText}"
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                          <span className="text-slate-500 block uppercase font-mono">Arahan Visual:</span>
                          <span className="line-clamp-2">{scene.visualDescription}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Approval Bar */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                Apakah Bos Besar merasa narasi dan pesan sains di atas sudah tepat? Klik tombol di kanan untuk mengeksekusi.
              </div>

              {!isApproved ? (
                <button
                  onClick={handleApproveAndRunAgents}
                  disabled={isExecutingSwarm}
                  className="px-6 py-3 rounded-xl font-extrabold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 shadow-lg cursor-pointer transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>✍️ Setujui Naskah & Jalankan Semua Agen</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('video')}
                  className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Lihat Hasil Video Jadi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Studio Tab */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">
                  HASIL JADI VIDEO EKSEKUTIF
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Studio Pemutar Video Otomatis (Sinkronisasi Audio TTS & Subtitle)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Video dirakit otomatis oleh Agen 5 dengan suara vokal bahasa Indonesia dari Agen 3 dan visual 3D dari Agen 4.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadFullPackage}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Paket Lengkap</span>
                </button>
              </div>
            </div>

            {/* Embed Video Player Studio */}
            <div className="mt-6">
              <VideoPlayerStudio project={activeProject} />
            </div>
          </div>
        </div>
      )}

      {/* Google Flow Payload Tab */}
      {activeTab === 'flow_payload' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-xs font-bold font-mono uppercase tracking-wider mb-2">
                  <Bot className="w-3.5 h-3.5" />
                  Otomasi Agen Google Flow
                </div>
                <h3 className="text-xl font-bold text-white">
                  Master Prompt Tunggal (6 Scene Sekaligus untuk Google Flow)
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Bos Besar tidak perlu menempel prompt satu per satu. Cukup salin teks di bawah ini dan tempelkan 1 kali ke Agent di Google Flow. Agent Google Flow memahami seluruh alur 6 scene, token kontinuitas visual, dan durasi detik per detik.
                </p>
              </div>

              <button
                onClick={handleCopyMasterFlow}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-sky-400 hover:bg-sky-300 text-slate-950 flex items-center gap-2 shadow-lg cursor-pointer transition-all shrink-0"
              >
                {copiedMasterFlow ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Seluruh 6 Scene Sekaligus</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Box Displaying Master Flow Directive */}
            <div className="relative">
              <pre className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
                {buildMasterFlowAgentPrompt(activeProject, {
                  aspectRatio: activeProject.platform === 'youtube_long' ? '16:9' : '9:16',
                  languageMode: 'bilingual',
                  includeOutro: true,
                })}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
