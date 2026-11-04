import React, { useState } from 'react';
import { ContentProject } from '../types';
import {
  FileEdit,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Hash,
  Search,
} from 'lucide-react';
import { countWords, estimateVoiceoverDuration } from '../utils/production';
import { auditScriptCompliance } from '../utils/compliance';

interface ScriptStudioViewProps {
  activeProject: ContentProject | null;
  onUpdateProject: (updated: ContentProject) => void;
  onNavigate: (view: string) => void;
}

export const ScriptStudioView: React.FC<ScriptStudioViewProps> = ({
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

  const [title, setTitle] = useState(activeProject.title);
  const [hook, setHook] = useState(activeProject.script.hook);
  const [bodyNarration, setBodyNarration] = useState(activeProject.script.bodyNarration);
  const [closing, setClosing] = useState(activeProject.script.closing);
  const [cta, setCta] = useState(activeProject.script.cta);
  const [seoTitle, setSeoTitle] = useState(activeProject.script.seoTitle);
  const [seoDescription, setSeoDescription] = useState(activeProject.script.seoDescription);
  const [hashtagsStr, setHashtagsStr] = useState(activeProject.script.hashtags.join(' '));
  const [wpm, setWpm] = useState(activeProject.script.speakingRateWpm || 135);
  const [savedToast, setSavedToast] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const fullText = `${hook} ${bodyNarration} ${closing} ${cta}`;
  const totalWords = countWords(fullText);
  const estimatedSeconds = estimateVoiceoverDuration(fullText, wpm);

  const handleRunAudit = () => {
    const res = auditScriptCompliance(fullText);
    setAuditResult(res);
  };

  const handleSave = () => {
    const compliance = auditScriptCompliance(fullText);
    const updated: ContentProject = {
      ...activeProject,
      title,
      status: compliance.isBlocked ? 'blocked_compliance' : activeProject.status,
      script: {
        ...activeProject.script,
        hook,
        bodyNarration,
        closing,
        cta,
        seoTitle,
        seoDescription,
        hashtags: hashtagsStr.split(/\s+/).filter(Boolean),
        speakingRateWpm: wpm,
        estimatedTotalSeconds: estimatedSeconds,
      },
      claimsReview: {
        ...activeProject.claimsReview,
        overallStatus: compliance.overallStatus,
        claims: compliance.claims,
        reviewedAt: new Date().toISOString(),
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
              Agent 3 — Master Scriptwriter
            </span>
            <span className="text-xs font-mono text-slate-500">[{activeProject.id}]</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Script Studio — Naskah Bahasa Indonesia</h1>
          <p className="text-xs text-slate-300">
            Penyusunan naskah edukatif, hook bertenaga, dan panggilan bertindak yang etis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedToast && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Naskah Tersimpan!
            </span>
          )}
          <button
            onClick={handleRunAudit}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Audit Klaim Instan</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Naskah</span>
          </button>
        </div>
      </div>

      {/* Timing and Word Count Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block uppercase">Total Kata</span>
          <span className="text-lg font-mono font-bold text-white tabular-nums">
            {totalWords} kata
          </span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block uppercase">Estimasi Durasi</span>
          <span className="text-lg font-mono font-bold text-amber-400 tabular-nums">
            ~{estimatedSeconds} detik
          </span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block uppercase">Target Video</span>
          <span className="text-lg font-mono font-bold text-slate-300 tabular-nums">
            {activeProject.duration} detik ({activeProject.platform.toUpperCase()})
          </span>
        </div>
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block uppercase">Kecepatan Baca</span>
          <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
            {wpm} WPM
          </span>
        </div>
      </div>

      {/* Audit Banner Result if triggered */}
      {auditResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-4 ${
            auditResult.isBlocked
              ? 'bg-rose-950/60 border-rose-800 text-rose-300'
              : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              {auditResult.isBlocked
                ? 'Terdeteksi pelanggaran klaim! Naskah mengandung janji kesembuhan atau garansi income yang dilarang.'
                : 'Hasil Audit: Lulus! Tidak ditemukan klaim berisiko. Siap untuk produksi.'}
            </span>
          </div>
          <button
            onClick={() => onNavigate('compliance')}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 rounded text-white font-medium shrink-0 cursor-pointer"
          >
            Buka Inspeksi Klaim
          </button>
        </div>
      )}

      {/* Script Sections Editor */}
      <div className="space-y-4">
        {/* Title */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            1. Judul Konten (Headline)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold"
          />
        </div>

        {/* Hook */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Opening Hook (3 - 5 Detik Pertama)</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {countWords(hook)} kata · ~{estimateVoiceoverDuration(hook, wpm)}s
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Wajib menghentak rasa ingin tahu audiens Indonesia dan relevan dengan kehidupan sehari-hari.
          </p>
          <textarea
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-sans"
          />
        </div>

        {/* Main Narration */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white block">
              3. Narasi Utama (Main Educational Body)
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {countWords(bodyNarration)} kata · ~{estimateVoiceoverDuration(bodyNarration, wpm)}s
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Penjelasan edukatif yang mengalir natural, menyederhanakan sains Transfer Factor tanpa istilah membingungkan.
          </p>
          <textarea
            value={bodyNarration}
            onChange={(e) => setBodyNarration(e.target.value)}
            rows={5}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-sans leading-relaxed"
          />
        </div>

        {/* Closing & CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
            <label className="text-xs font-semibold text-white block">
              4. Penutup (Closing Reflection)
            </label>
            <textarea
              value={closing}
              onChange={(e) => setClosing(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
            <label className="text-xs font-semibold text-amber-400 block">
              5. Call To Action (Ajakan Etis)
            </label>
            <textarea
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* SEO & Metadata */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span>Optimasi Distribusi Digital (SEO & Hashtags)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Hashtags
              </label>
              <input
                type="text"
                value={hashtagsStr}
                onChange={(e) => setHashtagsStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                SEO Meta Description
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation Button */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => onNavigate('strategy')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
        >
          Kembali ke Strategi
        </button>

        <button
          onClick={() => onNavigate('compliance')}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Lanjut ke Claims & Compliance</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
