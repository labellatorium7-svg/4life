import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  FileText,
  Video,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface NotebookLmConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNotebookUrl: string;
  onSaveUrl: (url: string) => Promise<void>;
  onImportExtractedText: (title: string, passage: string, refTag: string) => void;
}

export const NotebookLmConnectModal: React.FC<NotebookLmConnectModalProps> = ({
  isOpen,
  onClose,
  currentNotebookUrl,
  onSaveUrl,
  onImportExtractedText,
}) => {
  if (!isOpen) return null;

  const [urlInput, setUrlInput] = useState(currentNotebookUrl || 'https://notebooklm.google.com/notebook/');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Quick import helper inside modal
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPassage, setQuickPassage] = useState('');
  const [quickImportSuccess, setQuickImportSuccess] = useState(false);

  const sampleNotebookPrompt = `Tolong buatkan ringkasan briefing konten edukasi dari dokumen PDF dan link YouTube resmi 4Life yang ada di notebook ini. 
Format:
1. Fakta Sains Transfer Factor (peptida kolostrum & kuning telur).
2. Mekanisme 3 Fase Imun (Mengenali, Merespons, Mengingat).
3. Poin penting dari video YouTube resmi 4Life.
4. Pastikan tanpa klaim penyembuhan penyakit (sesuai BPOM).`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveUrl(urlInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopyPromptForNotebook = () => {
    navigator.clipboard.writeText(sampleNotebookPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDirectImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle || !quickPassage) return;
    onImportExtractedText(quickTitle, quickPassage, 'NotebookLM / Ekstrak Bos Besar');
    setQuickImportSuccess(true);
    setTimeout(() => {
      setQuickImportSuccess(false);
      setQuickTitle('');
      setQuickPassage('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Cara Menghubungkan Google NotebookLM</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Panduan Bos Besar
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Langkah praktis menyinkronkan berkas resmi PDF & link YouTube dari NotebookLM ke Pabrik Konten 4Life.
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

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-300">
          {/* Multi-Account Gmail Guidance */}
          <div className="p-4 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 rounded-xl border border-blue-500/30 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 font-mono text-[10px] font-bold">
                  MULTI-ACCOUNT COMPATIBLE
                </span>
                <h4 className="text-xs font-bold text-white">
                  NotebookLM di Akun Gmail Berbeda? Sangat Bisa!
                </h4>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                100% Bebas Akun
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              Bos Besar <strong>TIDAK PERLU</strong> memindahkan file ke akun ini. NotebookLM yang sudah Anda siapkan di akun Gmail lain (akun kerja, akun pribadi, dll.) <strong>bisa langsung dipakai</strong> melalui fitur berbagi resmi Google NotebookLM.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                <strong className="text-white text-[11px] block">Opsi 1: Bagikan Link (Paling Cepat)</strong>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Di NotebookLM akun lain: klik tombol <strong>Share (Bagikan)</strong> di kanan atas &rarr; pilih <em>"Anyone with the link can view"</em> &rarr; salin tautannya ke sini.
                </p>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                <strong className="text-white text-[11px] block">Opsi 2: Undang Email Akun Ini</strong>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Atau klik <strong>Share</strong> &rarr; masukkan email akun ini sebagai <em>Viewer</em>:
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <code className="text-[10px] bg-slate-950 px-2 py-1 rounded text-purple-300 font-mono border border-purple-900/60 truncate flex-1">
                    labellatorium7@gmail.com
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('labellatorium7@gmail.com');
                      setCopiedEmail(true);
                      setTimeout(() => setCopiedEmail(false), 2000);
                    }}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? 'Tersalin!' : 'Salin Email'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent explanation on Google NotebookLM API status */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-purple-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-white block mb-0.5">Mekanisme Jembatan (Bridge) Resmi:</strong>
              Karena Google NotebookLM saat ini belum menyediakan public API otomatis untuk aplikasi pihak ketiga, integrasi berjalan melalui <strong>NotebookLM Knowledge Bridge</strong>: tautkan URL Notebook Anda, dan cukup sekali salin ringkasan (*Study Guide/Notes*) dari NotebookLM ke dalam pabrik ini.
            </div>
          </div>

          {/* 3 Practical Steps */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              3 Langkah Mudah Menghubungkan NotebookLM:
            </h3>

            {/* Step 1 */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-900 text-purple-200 flex items-center justify-center font-mono text-[11px]">
                    1
                  </span>
                  <span>Tautkan URL NotebookLM Anda</span>
                </span>
                <a
                  href="https://notebooklm.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka notebooklm.google.com</span>
                </a>
              </div>
              <p className="text-slate-400">
                Buka proyek NotebookLM tempat Anda mengunggah PDF brosur & link YouTube 4Life, lalu salin tautan dari bilah alamat browser Anda:
              </p>

              <form onSubmit={handleSave} className="flex gap-2 pt-1">
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://notebooklm.google.com/notebook/..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-lg cursor-pointer whitespace-nowrap transition-colors"
                >
                  {isSaved ? 'Tersimpan!' : 'Simpan Tautan'}
                </button>
              </form>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-900 text-purple-200 flex items-center justify-center font-mono text-[11px]">
                    2
                  </span>
                  <span>Minta Ringkasan di NotebookLM dengan Prompt Khusus</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyPromptForNotebook}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Prompt Tersalin!' : 'Salin Prompt Siap Pakai'}</span>
                </button>
              </div>
              <p className="text-slate-400">
                Salin prompt di bawah ini, lalu tempelkan ke kolom obrolan (Chat) NotebookLM Anda agar ia merangkum poin penting dari PDF & YouTube resmi:
              </p>
              <pre className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed select-all">
                {sampleNotebookPrompt}
              </pre>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-900 text-purple-200 flex items-center justify-center font-mono text-[11px]">
                  3
                </span>
                <span>Tempelkan Hasil Ringkasan / Ekstrak ke Aplikasi Ini</span>
              </span>
              <p className="text-slate-400">
                Salin jawaban atau *Study Guide* dari NotebookLM dan tempelkan langsung di bawah ini. Agen 2 (Knowledge Manager) akan langsung menyimpannya:
              </p>

              <form onSubmit={handleDirectImport} className="space-y-2.5 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Judul Materi (Misal: Rangkuman Sains Transfer Factor dari PDF):
                  </label>
                  <input
                    type="text"
                    required
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="Contoh: Rangkuman Dokumen PDF Formulasi 4Life..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Isi Catatan / Ringkasan dari NotebookLM:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={quickPassage}
                    onChange={(e) => setQuickPassage(e.target.value)}
                    placeholder="Tempel teks ringkasan NotebookLM di sini..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-purple-400 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {quickImportSuccess && (
                    <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Berhasil tersimpan di perpustakaan riset pabrik!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shadow-md transition-colors"
                  >
                    Simpan Ringkasan ke Pabrik Konten
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
