import React from 'react';
import { ContentProject } from '../types';
import { VideoPlayerStudio } from '../components/VideoPlayerStudio';
import { Film, ArrowLeft, Download, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface VideoStudioViewProps {
  activeProject: ContentProject | null;
  onNavigate: (view: string) => void;
}

export const VideoStudioView: React.FC<VideoStudioViewProps> = ({
  activeProject,
  onNavigate,
}) => {
  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-400">
        Pilih atau buat proyek konten terlebih dahulu di Dashboard.
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('monitor')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Monitor Produksi</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Video Siap Tayang • 100% Selesai
          </span>
        </div>
      </div>

      {/* Embedded Video Studio Player */}
      <VideoPlayerStudio project={activeProject} />
    </div>
  );
};
