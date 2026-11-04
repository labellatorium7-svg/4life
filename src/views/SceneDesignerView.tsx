import React, { useState } from 'react';
import { ContentProject, SceneItem } from '../types';
import {
  Film,
  Camera,
  Sun,
  Layers,
  Clock,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  Eye,
  Type,
  UserCheck,
} from 'lucide-react';

interface SceneDesignerViewProps {
  activeProject: ContentProject | null;
  onUpdateProject: (updated: ContentProject) => void;
  onNavigate: (view: string) => void;
}

export const SceneDesignerView: React.FC<SceneDesignerViewProps> = ({
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

  const [scenes, setScenes] = useState<SceneItem[]>(activeProject.scenes);
  const [savedToast, setSavedToast] = useState(false);

  const handleUpdateScene = (index: number, field: keyof SceneItem, value: any) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], [field]: value };
    setScenes(updated);
  };

  const handleAddScene = () => {
    const newSceneNumber = scenes.length + 1;
    const newScene: SceneItem = {
      sceneNumber: newSceneNumber,
      durationSeconds: 10,
      timecodeStart: '00:00',
      timecodeEnd: '00:10',
      narrationSegment: 'Narasi segmen adegan baru...',
      visualDescription: 'Deskripsi visual sinematik dengan latar belakang Indonesia otentik.',
      characterDescription: 'Masyarakat Indonesia berpakaian kasual rapi, senyum wajar.',
      environment: 'Ruang keluarga atau taman rumah asri di Indonesia.',
      cameraMovement: 'Slow medium push in, shallow depth of field',
      lighting: 'Warm natural daylight with soft directional shadows',
      transition: 'Smooth cut',
      onScreenText: 'Poin Kunci Edukasi',
    };
    setScenes([...scenes, newScene]);
  };

  const handleDeleteScene = (index: number) => {
    const updated = scenes.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      sceneNumber: idx + 1,
    }));
    setScenes(updated);
  };

  const handleSave = () => {
    const updated: ContentProject = {
      ...activeProject,
      scenes,
    };
    onUpdateProject(updated);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const totalSceneDuration = scenes.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 uppercase">
              Agent 5 & 6 — Creative Director & Scene Designer
            </span>
            <span className="text-xs font-mono text-slate-500">[{activeProject.id}]</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Scene Designer — Struktur Adegan Dinamis</h1>
          <p className="text-xs text-slate-300">
            Sinematografi Indonesia berkelas, pencahayaan alami hangat, tanpa seragam dokter palsu atau logo artifisial.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedToast && (
            <span className="text-xs text-emerald-400 font-semibold">Tersimpan!</span>
          )}
          <button
            onClick={handleAddScene}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Tambah Adegan</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Struktur Adegan</span>
          </button>
        </div>
      </div>

      {/* Visual Identity Discipline Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <UserCheck className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-white block">Standar Visual Sinematik Pabrik:</span>
            <span className="text-slate-400">
              Lingkungan otentik Indonesia · Cahaya alami golden/diffused · Wajah natural · Dilarang jas dokter & stetoskop di rumah.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-300 font-mono text-xs shrink-0">
          <div>
            Total Adegan: <strong className="text-white">{scenes.length}</strong>
          </div>
          <div>
            Durasi Akumulasi: <strong className="text-amber-400">{totalSceneDuration}s</strong>
          </div>
        </div>
      </div>

      {/* Scenes Timeline / Cards */}
      <div className="space-y-4">
        {scenes.map((scene, idx) => (
          <div
            key={idx}
            className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 hover:border-slate-700 transition-colors"
          >
            {/* Scene Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono text-xs">
                  {scene.sceneNumber}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Adegan {scene.sceneNumber}: {scene.onScreenText || 'Segmen Visual'}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Timecode: {scene.timecodeStart || '00:00'} - {scene.timecodeEnd || '00:10'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <input
                    type="number"
                    min={3}
                    max={30}
                    value={scene.durationSeconds}
                    onChange={(e) =>
                      handleUpdateScene(idx, 'durationSeconds', Number(e.target.value))
                    }
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-center font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <span>detik</span>
                </div>

                <button
                  onClick={() => handleDeleteScene(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                  title="Hapus Adegan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Narration segment */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <label className="text-[11px] font-semibold text-amber-300 uppercase block">
                Segmen Narasi Voiceover:
              </label>
              <textarea
                rows={2}
                value={scene.narrationSegment}
                onChange={(e) => handleUpdateScene(idx, 'narrationSegment', e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none resize-none font-sans"
              />
            </div>

            {/* Visual breakdown grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Deskripsi Aksi Visual</span>
                </label>
                <textarea
                  rows={2}
                  value={scene.visualDescription}
                  onChange={(e) => handleUpdateScene(idx, 'visualDescription', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Karakter & Ekspresi</span>
                </label>
                <textarea
                  rows={2}
                  value={scene.characterDescription}
                  onChange={(e) => handleUpdateScene(idx, 'characterDescription', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gerakan Kamera & Framing</span>
                </label>
                <input
                  type="text"
                  value={scene.cameraMovement}
                  onChange={(e) => handleUpdateScene(idx, 'cameraMovement', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pencahayaan & Suasana</span>
                </label>
                <input
                  type="text"
                  value={scene.lighting}
                  onChange={(e) => handleUpdateScene(idx, 'lighting', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                  <Type className="w-3.5 h-3.5 text-purple-400" />
                  <span>Teks On-Screen (Judul di Layar)</span>
                </label>
                <input
                  type="text"
                  value={scene.onScreenText || ''}
                  onChange={(e) => handleUpdateScene(idx, 'onScreenText', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Transisi ke Adegan Berikutnya</span>
                </label>
                <input
                  type="text"
                  value={scene.transition}
                  onChange={(e) => handleUpdateScene(idx, 'transition', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => onNavigate('compliance')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
        >
          Kembali ke Claims & Compliance
        </button>

        <button
          onClick={() => onNavigate('flow_prompts')}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Lanjut ke Google Flow Prompts</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
