import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  Server,
  Sparkles,
  Bot,
  Save,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [defaultDuration, setDefaultDuration] = useState(10);
  const [defaultWpm, setDefaultWpm] = useState(135);
  const [strictness, setStrictness] = useState('ultra');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('4life_factory_default_duration', String(defaultDuration));
    localStorage.setItem('4life_factory_default_wpm', String(defaultWpm));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>Pengaturan Pabrik & Konfigurasi Produksi</span>
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Konfigurasi standar operasional untuk Kepala Pabrik 4Life dan 9 agen spesialis.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'Tersimpan!' : 'Simpan Konfigurasi'}</span>
        </button>
      </div>

      {/* Production Defaults */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Parameter Standar Klip Video & Suara</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Durasi Standar Klip Google Flow (Detik)
            </label>
            <input
              type="number"
              min={5}
              max={20}
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Sesuai spesifikasi prompt (default 10 detik per klip adegan).
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Kecepatan Narator Rata-rata (Words Per Minute)
            </label>
            <input
              type="number"
              min={110}
              max={160}
              value={defaultWpm}
              onChange={(e) => setDefaultWpm(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              130 - 140 WPM ideal untuk artikulasi Bahasa Indonesia yang jelas dan tenang.
            </span>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Tingkat Ketat Sensor BPOM & Kepatuhan Etika
            </label>
            <select
              value={strictness}
              onChange={(e) => setStrictness(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            >
              <option value="ultra">Ketat Maksimal: Blokir mutlak klaim kuratif & income guarantee</option>
              <option value="standard">Standar BPOM: Peringatan pada batasan edukatif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backend & Architecture Status */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Status Arsitektur Pabrik</span>
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Bot className="w-4 h-4 text-amber-400" />
              <span>Model Penalaran AI Server-Side:</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">gemini-3.8-flash (Aktif)</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Penyimpanan Data Persisten:</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">JSON Database File (Aktif)</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Server className="w-4 h-4 text-purple-400" />
              <span>NotebookLM Official Knowledge Bridge:</span>
            </div>
            <span className="font-mono text-purple-300 font-bold">PDF & YouTube Media Sync (Aktif)</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Google Flow Prompt Standard:</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">V1.0 (Sinematik 4K Indonesia)</span>
          </div>
        </div>
      </div>

      {/* Identity & Legal Disclaimer */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Info className="w-4 h-4" />
          <span>Prinsip Identitas Kepala Pabrik 4Life</span>
        </div>
        <p className="leading-relaxed">
          Kepala Pabrik 4Life adalah orkestrator produksi konten berbasis kecerdasan buatan. Sistem ini secara tegas tidak mengklaim sebagai dokter medis, apoteker, atau praktisi kesehatan klinis bersertifikat. Seluruh materi diarahkan semata-mata untuk literasi gizi, edukasi fungsi suplemen pangan sesuai ketentuan BPOM RI, dan pengenalan kemitraan usaha yang transparan.
        </p>
      </div>
    </div>
  );
};
