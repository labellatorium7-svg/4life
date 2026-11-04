import React, { useState } from 'react';
import { PlatformFormat, ContentProject } from '../types';
import { X, Sparkles, Loader2, Bot } from 'lucide-react';
import { ASSETS } from '../assets/assetMap';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: ContentProject) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState<PlatformFormat>('reels');
  const [duration, setDuration] = useState<number>(60);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/orchestrator/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          targetFormat: platform,
          targetDuration: duration,
        }),
      });

      const data = await response.json();
      if (data.project) {
        onProjectCreated(data.project);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Gagal membuat proyek baru. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTemplate = (preset: string) => {
    setPrompt(preset);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Mulai Proyek Konten 4Life Baru</h2>
              <p className="text-[11px] text-slate-400">Kepala Pabrik akan mengorkestrasi 9 agen spesialis</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Instruksi atau Ide Konten dari Bos Besar:
            </label>
            <textarea
              required
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Misal: 'Buat video edukasi kesehatan 60 detik tentang Transfer Factor untuk audiens usia 40 tahun ke atas'..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pilihan Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Buatkan satu konten hari ini.',
                'Buat konten tentang Transfer Factor.',
                'Buat video edukasi berdurasi 60 detik.',
                'Buat konten edukasi sekaligus peluang kemitraan 4Life.',
              ].map((ps, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickTemplate(ps)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-slate-300 hover:text-white cursor-pointer"
                >
                  {ps}
                </button>
              ))}
            </div>
          </div>

          {/* Platform & Duration */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Format Distribusi
              </label>
              <select
                value={platform}
                onChange={(e: any) => setPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 uppercase"
              >
                <option value="reels">Instagram Reels (9:16)</option>
                <option value="tiktok">TikTok (9:16)</option>
                <option value="shorts">YouTube Shorts (9:16)</option>
                <option value="youtube_long">YouTube Long-Form (16:9)</option>
                <option value="carousel">Carousel Edukasi</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Durasi Video (Detik)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              >
                <option value={30}>30 Detik</option>
                <option value={60}>60 Detik (Rekomendasi)</option>
                <option value={90}>90 Detik</option>
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Kepala Pabrik Bekerja...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Eksekusi Produksi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
