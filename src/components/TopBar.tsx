import React from 'react';
import { ContentProject } from '../types';
import { ASSETS } from '../assets/assetMap';
import { Plus, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  activeProject: ContentProject | null;
  onNavigate: (view: string) => void;
  onNewProject: () => void;
  onApproveProject: (projectId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeProject,
  onNavigate,
  onNewProject,
  onApproveProject,
}) => {
  const isApproved = activeProject?.approval?.isApproved;
  const isBlocked = activeProject?.status === 'blocked_compliance';

  return (
    <header className="h-16 px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-8 shrink-0 z-30">
      {/* Zone 1: Single text element wordmark in display font */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-left group flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm tracking-wider">
            4L
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
              4LIFE CONTENT FACTORY
            </span>
            <div className="text-[11px] text-slate-400 font-mono tracking-wider">
              SISTEM PRODUKSI KONTEN CERDAS
            </div>
          </div>
        </button>
      </div>

      {/* Zone 2: 4-5 concise single-line nav links with hover underlines */}
      <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300">
        <button
          onClick={() => onNavigate('executive_approval')}
          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <span>⭐ Persetujuan Bos Besar</span>
        </button>
        <button
          onClick={() => onNavigate('monitor')}
          className="hover:text-amber-300 text-slate-300 font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>📺 Monitor</span>
        </button>
        <button
          onClick={() => onNavigate('video_studio')}
          className="hover:text-amber-300 text-slate-300 font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          <span>🎬 Tonton Video</span>
        </button>
        <button
          onClick={() => onNavigate('kepala_pabrik')}
          className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
        >
          Kepala Pabrik
        </button>
        <button
          onClick={() => onNavigate('script_studio')}
          className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
        >
          Script Studio
        </button>
        <button
          onClick={() => onNavigate('compliance')}
          className="hover:text-white transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          <span>Kepatuhan BPOM</span>
          {isBlocked && (
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          )}
        </button>
        <button
          onClick={() => onNavigate('flow_prompts')}
          className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
        >
          Google Flow
        </button>
        <button
          onClick={() => onNavigate('production_package')}
          className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
        >
          Paket Produksi
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        {activeProject && !isApproved && (
          <button
            onClick={() => onNavigate('executive_approval')}
            disabled={isBlocked}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              isBlocked
                ? 'bg-rose-950/60 border border-rose-800/80 text-rose-300 cursor-not-allowed opacity-80'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
            title={isBlocked ? 'Perbaiki pelanggaran klaim sebelum menyetujui' : 'Buka Ruang Persetujuan Bos Besar'}
          >
            {isBlocked ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Klaim Tertahan</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-100" />
                <span>Setujui Naskah (Bos Besar)</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={onNewProject}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Buat Konten Baru</span>
        </button>
      </div>
    </header>
  );
};
