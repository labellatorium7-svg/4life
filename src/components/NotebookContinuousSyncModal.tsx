import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  Video,
  Clock,
  ArrowRight,
  BookOpen,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { NotebookLmConfig, SourceRecord } from '../types';

interface NotebookContinuousSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NotebookLmConfig;
  onSyncSuccess: (newSources: SourceRecord[], updatedConfig: NotebookLmConfig) => void;
}

export const NotebookContinuousSyncModal: React.FC<NotebookContinuousSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onSyncSuccess,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'paste_ingest' | 'multi_yt' | 'prompt_helper' | 'history'>('paste_ingest');
  const [pasteContent, setPasteContent] = useState('');
  const [multiYtInput, setMultiYtInput] = useState('');
  const [syncNote, setSyncNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    addedCount: number;
    sources: SourceRecord[];
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const detectionPrompt = `Tolong buatkan daftar ringkas setiap dokumen PDF resmi dan tautan video YouTube 4Life yang baru saja ditambahkan atau diperbarui di notebook ini.
Format per butir:
1. [Tipe: PDF / YouTube / Catatan] - [Judul Berkas/Video]
- Rangkuman fakta sains atau edukasi produk:
- Tautan atau nama dokumen:
Pastikan tanpa klaim pengobatan medis penyakit sesuai regulasi BPOM.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(detectionPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleBatchSync = async (rawInput: string, customSummary?: string) => {
    if (!rawInput.trim()) {
      setErrorMsg('Silakan tempel teks berkas atau daftar link terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSyncResult(null);

    try {
      const res = await fetch('/api/notebooklm/batch-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawInput,
          noteSummary: customSummary || syncNote || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server status ${res.status}`);
      }

      const data = await res.json();
      setSyncResult({
        addedCount: data.addedCount,
        sources: data.addedSources,
        message: data.addedCount > 0
          ? `Berhasil menambahkan ${data.addedCount} referensi berkas baru dari NotebookLM!`
          : 'Pemeriksaan selesai: Semua berkas yang ditempel sudah ada di perpustakaan pabrik.',
      });

      onSyncSuccess(data.addedSources, data.config);
      setPasteContent('');
      setMultiYtInput('');
      setSyncNote('');
    } catch (err: any) {
      console.error('Continuous sync failed:', err);
      setErrorMsg(err.message || 'Gagal menyinkronkan referensi baru. Pastikan format teks memadai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Sinkronisasi Pembaruan Berkas NotebookLM</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                  CONTINUOUS SYNC HUB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Setiap kali Bos Besar menambah PDF/YouTube di NotebookLM, masukkan pembaruannya di sini agar pabrik ikut ter-update.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status bar */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Notebook: <strong className="text-purple-300">{config.notebookTitle}</strong></span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{config.notesCount} Berkas Terindeks</span>
            </span>
          </div>

          <a
            href={config.notebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-300 hover:text-purple-200 flex items-center gap-1 font-semibold text-[11px]"
          >
            <span>Buka NotebookLM Bos Besar</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Multi-Account Gmail Notice */}
        <div className="px-5 py-2 bg-blue-950/40 border-b border-blue-900/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-blue-200">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>
              <strong>Beda Akun Gmail?</strong> Tidak masalah! Anda bisa membuka NotebookLM di akun Google mana pun, lalu cukup tempel ringkasan atau tautan di sini.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText('labellatorium7@gmail.com');
              setCopiedEmail(true);
              setTimeout(() => setCopiedEmail(false), 2000);
            }}
            className="text-[10px] text-blue-300 hover:text-white bg-blue-900/60 hover:bg-blue-800 px-2.5 py-1 rounded border border-blue-700/50 flex items-center gap-1 cursor-pointer transition-colors"
            title="Salin email akun aplikasi ini jika ingin mengundang via fitur Share di NotebookLM"
          >
            {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedEmail ? 'Email Tersalin!' : 'Salin Email Akun Ini (labellatorium7@gmail.com)'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-900/50 text-xs">
          <button
            onClick={() => setActiveTab('paste_ingest')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'paste_ingest'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Pembaruan Cerdas (Tempel Ekstrak / Teks)</span>
          </button>

          <button
            onClick={() => setActiveTab('multi_yt')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'multi_yt'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>2. Tambah Link YouTube Massal</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt_helper')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'prompt_helper'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>3. Salin Prompt Pemanggil Berkas Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Riwayat Pembaruan</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {syncResult && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{syncResult.message}</span>
              </div>
              {syncResult.sources.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Berkas Baru yang Masuk:</span>
                  <div className="space-y-1">
                    {syncResult.sources.map((s, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 bg-slate-900/90 rounded border border-emerald-500/20 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {s.sourceType === 'youtube_link' ? (
                            <Video className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          )}
                          <span className="text-white font-medium truncate">{s.title}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {s.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: PASTE INGEST */}
          {activeTab === 'paste_ingest' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Cara Kerja Pembaruan Otomatis:</span>
                </p>
                <p className="text-slate-400">
                  Cukup salin teks rangkuman, catatan studi, atau kutipan berkas baru dari Google NotebookLM Anda dan tempelkan di bawah. Sistem AI pabrik akan membedah dan memisahkan setiap referensi PDF dan link YouTube ke dalam perpustakaan.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Tempel Teks / Catatan Berkas Baru dari NotebookLM:
                </label>
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={`Contoh tempelan:
1. Riset Formulasi Peptida Kolostrum 4Life (PDF Resmi)
Peptida nanofiltrasi Transfer Factor mendidik sel Natural Killer (NK) hingga 437% tanpa protein makro kasein.

2. Link Video YouTube Resmi: https://www.youtube.com/watch?v=abc123xyz
Penjelasan mekanisme pengenalan antigen oleh sel T.`}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Catatan Pembaruan (Opsional):
                </label>
                <input
                  type="text"
                  value={syncNote}
                  onChange={(e) => setSyncNote(e.target.value)}
                  placeholder="Misal: Penambahan riset sel NK & video YouTube edukasi batch Maret"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                />
              </div>

              <button
                onClick={() => handleBatchSync(pasteContent)}
                disabled={isSubmitting || !pasteContent.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                <span>
                  {isSubmitting
                    ? 'Menganalisis & Menyinkronkan Berkas Baru...'
                    : 'Sinkronkan Semua Berkas Baru ke Pabrik Konten'}
                </span>
              </button>
            </div>
          )}

          {/* TAB 2: MULTI YOUTUBE LINKS */}
          {activeTab === 'multi_yt' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                <p className="font-semibold text-white mb-1">Tambah Beberapa Link YouTube Resmi Sekaligus:</p>
                <p className="text-slate-400">
                  Tempelkan daftar URL YouTube resmi 4Life yang baru saja Anda masukkan ke NotebookLM (satu tautan per baris). Pabrik akan langsung mengindeksnya sebagai materi referensi video terverifikasi.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Daftar Tautan YouTube (1 URL per baris):
                </label>
                <textarea
                  value={multiYtInput}
                  onChange={(e) => setMultiYtInput(e.target.value)}
                  placeholder={`https://www.youtube.com/watch?v=official_4life_vid1 Video Tri-Factor Imun
https://youtu.be/official_4life_vid2 Video Edukasi Sel NK
https://www.youtube.com/watch?v=official_4life_vid3 Peluang Bisnis Beretika`}
                  rows={7}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <button
                onClick={() => handleBatchSync(multiYtInput, 'Sinkronisasi Tautan YouTube Resmi')}
                disabled={isSubmitting || !multiYtInput.trim()}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50"
              >
                <Video className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Mengindeks Link Video...'
                    : 'Indeks Semua Link YouTube Baru ke Pabrik Konten'}
                </span>
              </button>
            </div>
          )}

          {/* TAB 3: PROMPT HELPER */}
          {activeTab === 'prompt_helper' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs text-purple-200">
                <p className="font-semibold text-white mb-1">
                  Prompt Khusus untuk Ditanyakan ke Google NotebookLM:
                </p>
                <p className="text-slate-300">
                  Salin prompt ini, lalu buka NotebookLM Bos Besar dan tempelkan di kolom obrolan NotebookLM. NotebookLM akan secara otomatis menyusun ringkasan dari semua berkas PDF dan YouTube baru Anda yang siap ditempelkan di Tab 1.
                </p>
              </div>

              <div className="relative">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                  {detectionPrompt}
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Tersalin!' : 'Salin Prompt'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={config.notebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka NotebookLM Sekarang</span>
                </a>

                <button
                  onClick={() => setActiveTab('paste_ingest')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Lanjut Tempel Hasil di Sini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
                <span className="font-semibold text-slate-300">Log Sinkronisasi Berkas:</span>
                <span>Terakhir: {config.lastSync ? new Date(config.lastSync).toLocaleString('id-ID') : '-'}</span>
              </div>

              {(!config.syncHistory || config.syncHistory.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  Belum ada catatan riwayat sinkronisasi tambahan.
                </div>
              ) : (
                <div className="space-y-2">
                  {config.syncHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/60">
                            {item.id}
                          </span>
                          <span className="font-semibold text-white">{item.summary}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {new Date(item.timestamp).toLocaleString('id-ID')}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold shrink-0">
                        +{item.addedCount} Berkas
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Semua referensi baru langsung dapat diakses oleh Kepala Pabrik untuk naskah berikutnya.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
