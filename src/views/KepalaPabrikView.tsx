import React from 'react';
import { ContentProject } from '../types';
import { KepalaPabrikChat } from '../components/KepalaPabrikChat';
import { ASSETS } from '../assets/assetMap';
import {
  Bot,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  History,
  Terminal,
} from 'lucide-react';

interface KepalaPabrikViewProps {
  activeProject: ContentProject | null;
  onProjectCreatedOrUpdated: (project: ContentProject) => void;
  onNavigate: (view: string) => void;
}

const AGENTS_LIST = [
  {
    num: 1,
    name: 'STRATEGIC DIRECTOR',
    desc: 'Menetapkan strategi konten, menganalisis audiens Indonesia usia 40+, memetakan seri konten imun atau kemitraan.',
  },
  {
    num: 2,
    name: 'KNOWLEDGE MANAGER',
    desc: 'Menyelidiki hierarki bukti (BPOM, 4Life Research, Jurnal Imunologi), melarang fabrikasi uji klinis.',
  },
  {
    num: 3,
    name: 'MASTER SCRIPTWRITER',
    desc: 'Menulis naskah mengalir, hook 3 detik memikat, analogi sederhana, panggilan aksi (CTA) elegan.',
  },
  {
    num: 4,
    name: 'CLAIMS COMPLIANCE OFFICER',
    desc: 'Sensor mutlak: dilarang klaim obat/sembuh penyakit, dilarang garansi income atau skema cepat kaya.',
  },
  {
    num: 5,
    name: 'CREATIVE DIRECTOR',
    desc: 'Arahan visual sinematik otentik Indonesia, pencahayaan alami hangat, tanpa jas lab atau stetoskop palsu.',
  },
  {
    num: 6,
    name: 'SCENE DESIGNER',
    desc: 'Memecah naskah ke segmen adegan dinamis (5-8 adegan) lengkap dengan gerakan kamera & kontinuitas.',
  },
  {
    num: 7,
    name: 'GOOGLE FLOW PROMPT ENGINEER',
    desc: 'Menghasilkan prompt video 10 detik per adegan dengan negative prompt anti-AI slop yang siap dirender.',
  },
  {
    num: 8,
    name: 'VOICEOVER DIRECTOR',
    desc: 'Naskah narasi utuh, pembagian timecode, sinkronisasi WPM (~135 WPM), dan panduan intonasi.',
  },
  {
    num: 9,
    name: 'VIDEO PRODUCTION MANAGER',
    desc: 'Merangkum instruksi perakitan, rekomendasi nada BGM, dan checklist kesiapan final sebelum tayang.',
  },
];

export const KepalaPabrikView: React.FC<KepalaPabrikViewProps> = ({
  activeProject,
  onProjectCreatedOrUpdated,
  onNavigate,
}) => {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <img
            src={ASSETS.avatarKepalaPabrik}
            alt="Kepala Pabrik 4Life"
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Markas Kepala Pabrik 4Life</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                Pusat Komando AI
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Melapor langsung ke Founder & Chairman (Bos Besar). Mengawasi 9 divisi dan memastikan setiap detik konten 100% mematuhi etika sains & BPOM.
            </p>
          </div>
        </div>

        {activeProject && (
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block uppercase">Proyek Terpilih</span>
            <span className="text-xs font-bold text-amber-400 font-mono">{activeProject.id}</span>
            <span className="text-xs text-slate-300 block truncate max-w-xs">{activeProject.title}</span>
          </div>
        )}
      </div>

      {/* Central Conversational Console */}
      <KepalaPabrikChat
        activeProject={activeProject}
        onProjectCreatedOrUpdated={onProjectCreatedOrUpdated}
        onNavigate={onNavigate}
      />

      {/* Grid of 9 Specialist Agents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Struktur 9 Divisi Agen Spesialis</span>
          </h2>
          <span className="text-xs text-slate-400">Terkoordinasi otomatis di setiap instruksi</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AGENTS_LIST.map((agent) => (
            <div
              key={agent.num}
              className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  DIVISI 0{agent.num}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-white tracking-wide">{agent.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Orchestrator Audit Logs */}
      {activeProject && activeProject.orchestratorLogs && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              <span>Log Eksekusi Kepala Pabrik & Agen</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {activeProject.orchestratorLogs.length} Aktivitas Tercatat
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {activeProject.orchestratorLogs.map((log, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs flex items-start gap-3"
              >
                <div className="pt-0.5">
                  {log.status === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : log.status === 'error' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300">{log.agent}</span>
                    <span className="text-[10px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString('id-ID')}</span>
                  </div>
                  <div className="text-slate-300 font-medium mt-0.5">{log.action}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{log.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
