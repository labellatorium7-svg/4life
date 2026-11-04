import React, { useState } from 'react';
import { ContentProject, PlatformFormat } from '../types';
import { Compass, Users, Target, BookmarkCheck, ArrowRight, Save } from 'lucide-react';

interface StrategyViewProps {
  activeProject: ContentProject | null;
  onUpdateProject: (updated: ContentProject) => void;
  onNavigate: (view: string) => void;
}

export const StrategyView: React.FC<StrategyViewProps> = ({
  activeProject,
  onUpdateProject,
  onNavigate,
}) => {
  if (!activeProject) {
    return (
      <div className="p-8 text-center text-slate-400">
        Pilih atau buat proyek konten terlebih dahulu di Dashboard.
      </div>
    );
  }

  const [topic, setTopic] = useState(activeProject.strategy.topic);
  const [angle, setAngle] = useState(activeProject.strategy.angle);
  const [keyTakeaway, setKeyTakeaway] = useState(activeProject.strategy.keyTakeaway);
  const [targetAudience, setTargetAudience] = useState(activeProject.targetAudience);
  const [objective, setObjective] = useState(activeProject.objective);
  const [seriesName, setSeriesName] = useState(activeProject.strategy.seriesName || '');
  const [episodeNumber, setEpisodeNumber] = useState(activeProject.strategy.episodeNumber || 1);
  const [ctaIntent, setCtaIntent] = useState(activeProject.strategy.callToActionIntent);
  const [platform, setPlatform] = useState<PlatformFormat>(activeProject.platform);
  const [duration, setDuration] = useState(activeProject.duration);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    const updated: ContentProject = {
      ...activeProject,
      platform,
      duration,
      targetAudience,
      objective,
      strategy: {
        ...activeProject.strategy,
        topic,
        angle,
        keyTakeaway,
        seriesName,
        episodeNumber: Number(episodeNumber),
        callToActionIntent: ctaIntent,
      },
    };
    onUpdateProject(updated);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase">
              Agent 1 — Strategic Director
            </span>
            <span className="text-xs font-mono text-slate-500">[{activeProject.id}]</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Strategi Konten & Analisis Audiens</h1>
          <p className="text-xs text-slate-300">
            Merumuskan sudut pandang edukasi berbasis kebutuhan audiens Indonesia tanpa repetisi topik.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedToast && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <BookmarkCheck className="w-4 h-4" /> Tersimpan!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Strategi</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Strategy Form (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Parameter Strategi Konten</span>
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Topik Konten
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Sudut Pandang (Angle)
              </label>
              <textarea
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Pesan Kunci (Key Takeaway)
              </label>
              <input
                type="text"
                value={keyTakeaway}
                onChange={(e) => setKeyTakeaway(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Tujuan Konten (Objective)
              </label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Series Planner */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Perencanaan Serial Konten</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nama Seri Konten
                </label>
                <input
                  type="text"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  placeholder="Misal: Seri Imunitas Keluarga Matang"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nomor Episode
                </label>
                <input
                  type="number"
                  min={1}
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audience & Format Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Target Audiens Indonesia</span>
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Profil Demografi & Kebutuhan
              </label>
              <textarea
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Fokus Call to Action
              </label>
              <select
                value={ctaIntent}
                onChange={(e: any) => setCtaIntent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              >
                <option value="education">Edukasi Murni (Simpan & Share)</option>
                <option value="partnership_opportunity">Peluang Kemitraan Etis</option>
                <option value="product_discovery">Pengenalan Transfer Factor BPOM</option>
                <option value="lifestyle">Pola Hidup Sehat Keluarga</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Platform Distribusi
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
                <option value="carousel">Carousel Edukasi (1:1 / 4:5)</option>
                <option value="single_image">Single-Image Post (1:1)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Target Durasi Video
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-1.5 rounded text-xs font-medium border cursor-pointer ${
                      duration === d
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('knowledge_base')}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors"
          >
            <span>Lanjut ke Riset & Knowledge Base</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
