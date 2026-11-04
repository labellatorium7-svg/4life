import React, { useState } from 'react';
import { ContentProject } from '../types';
import {
  FolderArchive,
  Search,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';

interface ContentLibraryViewProps {
  projects: ContentProject[];
  activeProject: ContentProject | null;
  onSelectProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onNewProject: () => void;
  onNavigate: (view: string) => void;
}

export const ContentLibraryView: React.FC<ContentLibraryViewProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onDuplicateProject,
  onDeleteProject,
  onNewProject,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.strategy.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-amber-400" />
            <span>Content Library & Arsip Produksi Pabrik</span>
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Semua arsip proyek konten 4Life yang tersimpan secara persisten pada sistem basis data.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Mulai Proyek Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul, topik, atau ID proyek..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: `Semua (${projects.length})` },
            { id: 'approved', label: 'Disetujui Bos Besar' },
            { id: 'in_review', label: 'Sedang Ditinjau' },
            { id: 'blocked_compliance', label: 'Tertahan BPOM' },
            { id: 'draft', label: 'Draf' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-slate-800 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((proj) => {
          const isSelected = activeProject?.id === proj.id;
          const isApproved = proj.approval?.isApproved;
          const isBlocked = proj.status === 'blocked_compliance';

          return (
            <div
              key={proj.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/50 ring-1 ring-amber-400/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-amber-400 font-bold">
                    {proj.id}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isApproved
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : isBlocked
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {proj.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-2">
                  {proj.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {proj.objective}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Format: <strong className="text-slate-300 uppercase">{proj.platform}</strong></span>
                  <span>·</span>
                  <span>Durasi: <strong className="text-slate-300">{proj.duration}s</strong></span>
                  <span>·</span>
                  <span>{proj.scenes?.length || 0} Adegan</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDuplicateProject(proj.id)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                    title="Duplikasi Proyek"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                    title="Hapus Proyek"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    onSelectProject(proj.id);
                    onNavigate('script_studio');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span>{isSelected ? 'Buka Naskah' : 'Pilih & Kerjakan'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            Tidak ada proyek yang sesuai dengan kata kunci atau filter status.
          </div>
        )}
      </div>
    </div>
  );
};
