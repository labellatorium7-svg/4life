import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Play,
  Bot,
  Compass,
  Database,
  FileEdit,
  ShieldAlert,
  Film,
  Sparkles,
  Mic2,
  PackageCheck,
  FolderArchive,
  Sliders,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ContentProject } from '../types';
import { ASSETS } from '../assets/assetMap';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  projects: ContentProject[];
  activeProject: ContentProject | null;
  onSelectProject: (projectId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  projects,
  activeProject,
  onSelectProject,
}) => {
  const navItems = [
    { id: 'executive_approval', label: '⭐ Persetujuan Bos Besar', icon: CheckCircle2, isSpecial: true, badge: 'FOUNDER' },
    { id: 'dashboard', label: '1. Dashboard Utama', icon: LayoutDashboard },
    { id: 'monitor', label: '2. Monitor Real-Time', icon: Activity, isSpecial: true, badge: 'LIVE' },
    { id: 'video_studio', label: '3. 🎬 Tonton Video Jadi', icon: Play, isSpecial: true, badge: 'READY' },
    { id: 'kepala_pabrik', label: '4. Kepala Pabrik', icon: Bot },
    { id: 'strategy', label: '5. Strategi Konten', icon: Compass },
    { id: 'knowledge_base', label: '6. Riset & NotebookLM', icon: Database },
    { id: 'script_studio', label: '7. Script Studio', icon: FileEdit },
    {
      id: 'compliance',
      label: '8. Claims & BPOM',
      icon: ShieldAlert,
      badge: activeProject?.status === 'blocked_compliance' ? 'BLOCKED' : undefined,
    },
    { id: 'scene_designer', label: '9. Scene Designer', icon: Film },
    { id: 'flow_prompts', label: '10. Google Flow Prompts', icon: Sparkles },
    { id: 'voiceover_studio', label: '11. Voiceover Studio', icon: Mic2 },
    { id: 'production_package', label: '12. Paket Produksi', icon: PackageCheck },
    { id: 'content_library', label: '13. Content Library', icon: FolderArchive, count: projects.length },
    { id: 'settings', label: '14. Pengaturan', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Project Selector Box */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
          <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Proyek Aktif
          </label>
          <div className="relative">
            <select
              value={activeProject?.id || ''}
              onChange={(e) => onSelectProject(e.target.value)}
              aria-label="Pilih Proyek Aktif"
              className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg py-2 pl-3 pr-8 text-xs font-medium text-slate-100 appearance-none focus:outline-none focus:ring-1 focus:ring-amber-400 truncate cursor-pointer"
            >
              {projects.length === 0 ? (
                <option value="">Belum ada proyek</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {activeProject && (
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">{activeProject.id}</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  activeProject.status === 'approved'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : activeProject.status === 'blocked_compliance'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {activeProject.status.toUpperCase().replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Divisi Produksi
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                } ${item.isSpecial ? 'text-amber-400' : ''}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-amber-400' : item.isSpecial ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-900/80 text-rose-300 border border-rose-700">
                    {item.badge}
                  </span>
                )}
                {typeof item.count === 'number' && (
                  <span className="text-[11px] font-mono text-slate-500">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User / Bos Besar Profile */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <img
            src={ASSETS.avatarChairman}
            alt="Founder & Chairman (Bos Besar)"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">
              Founder & Chairman
            </div>
            <div className="text-[11px] text-amber-400/90 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>Bos Besar (Otoritas Penuh)</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
