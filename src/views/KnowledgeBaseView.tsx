import React, { useState, useEffect } from 'react';
import { SourceRecord, ContentProject, NotebookLmConfig } from '../types';
import {
  Database,
  Search,
  Plus,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Filter,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FileText,
  Video,
  Sparkles,
  Link2,
  BookmarkCheck,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { NotebookLmConnectModal } from '../components/NotebookLmConnectModal';
import { NotebookContinuousSyncModal } from '../components/NotebookContinuousSyncModal';

interface KnowledgeBaseViewProps {
  sources: SourceRecord[];
  activeProject: ContentProject | null;
  onAddSource: (source: Partial<SourceRecord>) => void;
  onBatchAddSources?: (newSources: SourceRecord[]) => void;
  onDeleteSource: (sourceId: string) => void;
  onNavigate: (view: string) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  sources,
  activeProject,
  onAddSource,
  onBatchAddSources,
  onDeleteSource,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isContinuousSyncOpen, setIsContinuousSyncOpen] = useState(false);
  const [activeImportTab, setActiveImportTab] = useState<'notebooklm' | 'pdf' | 'youtube' | 'manual'>('notebooklm');

  // NotebookLM Bridge Config State
  const [notebookConfig, setNotebookConfig] = useState<NotebookLmConfig>({
    notebookUrl: 'https://notebooklm.google.com/notebook/4life-official-library',
    notebookTitle: '4Life Official Research & Media Library (PDF & YouTube)',
    notesCount: 3,
  });
  const [isEditingNotebookUrl, setIsEditingNotebookUrl] = useState(false);
  const [customNotebookUrl, setCustomNotebookUrl] = useState(notebookConfig.notebookUrl);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Form states for imports
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [urlOrDoc, setUrlOrDoc] = useState('');
  const [relevantPassage, setRelevantPassage] = useState('');
  const [category, setCategory] = useState<SourceRecord['category']>('product');
  const [notebookLmRef, setNotebookLmRef] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  // Fetch NotebookLM config
  useEffect(() => {
    fetch('/api/notebooklm/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((cfg) => {
        if (cfg) {
          setNotebookConfig(cfg);
          setCustomNotebookUrl(cfg.notebookUrl);
        }
      })
      .catch((err) => console.warn('Could not fetch notebooklm config', err));
  }, []);

  const [urlSaveSuccess, setUrlSaveSuccess] = useState(false);

  const handleSaveNotebookUrl = async () => {
    try {
      const res = await fetch('/api/notebooklm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebookUrl: customNotebookUrl }),
      });
      if (res.ok) {
        const updated = await res.json();
        setNotebookConfig(updated);
        setUrlSaveSuccess(true);
        setTimeout(() => {
          setUrlSaveSuccess(false);
          setIsEditingNotebookUrl(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to update notebooklm config', err);
    }
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !relevantPassage) return;

    let derivedSourceType: SourceRecord['sourceType'] = 'official_4life';
    if (activeImportTab === 'notebooklm') derivedSourceType = 'notebooklm_extract';
    else if (activeImportTab === 'pdf') derivedSourceType = 'pdf_document';
    else if (activeImportTab === 'youtube') derivedSourceType = 'youtube_link';

    onAddSource({
      title,
      publisher: publisher || (activeImportTab === 'notebooklm' ? 'Google NotebookLM (Berkas Resmi 4Life)' : '4Life Research Official'),
      sourceType: derivedSourceType,
      urlOrDoc: urlOrDoc || (activeImportTab === 'notebooklm' ? notebookConfig.notebookUrl : 'Dokumen Resmi 4Life'),
      relevantPassage,
      category,
      status: 'VERIFIED',
      publicationDate: new Date().toISOString().split('T')[0],
      retrievalDate: new Date().toISOString().split('T')[0],
      notebookLmRef: notebookLmRef || (activeImportTab === 'notebooklm' ? 'NotebookLM / Proyek Resmi' : undefined),
      mediaUrl: mediaUrl || (activeImportTab === 'youtube' ? urlOrDoc : undefined),
    });

    setTitle('');
    setPublisher('');
    setUrlOrDoc('');
    setRelevantPassage('');
    setNotebookLmRef('');
    setMediaUrl('');
    setIsAddingSource(false);
  };

  const filteredSources = sources.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.relevantPassage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.notebookLmRef && s.notebookLmRef.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterCategory === 'all') return matchesSearch;
    if (filterCategory === 'notebooklm_files') {
      return (
        matchesSearch &&
        (s.sourceType === 'notebooklm_extract' ||
          s.sourceType === 'pdf_document' ||
          s.sourceType === 'youtube_link' ||
          !!s.notebookLmRef)
      );
    }
    return matchesSearch && s.category === filterCategory;
  });

  const notebookLmCount = sources.filter(
    (s) =>
      s.sourceType === 'notebooklm_extract' ||
      s.sourceType === 'pdf_document' ||
      s.sourceType === 'youtube_link' ||
      !!s.notebookLmRef
  ).length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
              Agent 2 — Knowledge Manager & Researcher
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              NotebookLM Bridge Aktif
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Perpustakaan Riset & Hierarki Bukti Resmi 4Life</h1>
          <p className="text-xs text-slate-300">
            Terhubung langsung dengan NotebookLM dan berkas resmi 4Life (PDF brosur/sains & link video YouTube resmi).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsContinuousSyncOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
            title="Sinkronkan berkas baru (PDF & YouTube) yang baru saja ditambahkan di NotebookLM"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>🔄 Sinkronkan Pembaruan</span>
          </button>

          <button
            onClick={() => setIsAddingSource(!isAddingSource)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-colors shrink-0 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Impor / Tambah Berkas</span>
          </button>
        </div>
      </div>

      {/* Prominent NotebookLM Bridge Status Card */}
      <div className="p-5 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  NotebookLM Official 4Life Knowledge Bridge
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                  SINKRON TERSAMBUNG
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  BEBAS AKUN GMAIL
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Proyek NotebookLM Bos Besar: <strong className="text-purple-300">{notebookConfig.notebookTitle}</strong> ({notebookLmCount} Berkas Terindeks).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsContinuousSyncOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              title="Sinkronkan berkas baru (PDF & YouTube) yang baru saja Anda tambahkan di NotebookLM"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
              <span>Sinkronkan Berkas Baru</span>
            </button>

            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Buka panduan langkah demi langkah cara menghubungkan NotebookLM"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Panduan Konek</span>
            </button>

            <a
              href={notebookConfig.notebookUrl || 'https://notebooklm.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-600/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka NotebookLM</span>
            </a>

            <button
              onClick={() => setIsEditingNotebookUrl(!isEditingNotebookUrl)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
            >
              {isEditingNotebookUrl ? 'Tutup' : 'Ubah Tautan'}
            </button>
          </div>
        </div>

        {/* Notebook URL Editor */}
        {isEditingNotebookUrl && (
          <div className="p-4 bg-slate-950 rounded-xl border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span>Tautkan URL NotebookLM Akun Ini</span>
                <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                  labellatorium7@gmail.com
                </span>
              </span>
              <a
                href="https://notebooklm.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka notebooklm.google.com di Tab Baru</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Buka notebook 4Life yang sudah Anda buat di akun ini, lalu salin tautan dari bilah alamat (address bar) browser Anda dan tempel di bawah ini:
            </p>

            <div className="flex flex-col md:flex-row gap-2 items-center">
              <input
                type="url"
                value={customNotebookUrl}
                onChange={(e) => setCustomNotebookUrl(e.target.value)}
                placeholder="https://notebooklm.google.com/notebook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
              />
              <button
                onClick={handleSaveNotebookUrl}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shrink-0 transition-all shadow-md"
              >
                {urlSaveSuccess ? 'Tersimpan & Terkunci!' : 'Simpan & Konek URL'}
              </button>
            </div>

            {customNotebookUrl && customNotebookUrl.includes('/notebook/') && (
              <div className="flex items-center gap-1.5 text-[11px] text-purple-300 bg-purple-950/40 p-2 rounded-lg border border-purple-900/60 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  Terdeteksi ID: {customNotebookUrl.split('/notebook/')[1]?.split('?')[0] || 'Valid'}
                </span>
              </div>
            )}

            {urlSaveSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tautan proyek NotebookLM Bos Besar berhasil disimpan dan dikunci ke pabrik konten!</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-purple-500/20 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Pabrik memprioritaskan dokumen & tautan video YouTube resmi yang Bos Besar tambahkan di sini untuk naskah & scene video.
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 shrink-0">
            <span>Terakhir Diperbarui: <strong className="text-purple-300">{notebookConfig.lastSync ? new Date(notebookConfig.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Hari ini'}</strong></span>
            <button
              onClick={() => setIsContinuousSyncOpen(true)}
              className="text-purple-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>+ Update Referensi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add / Import Source Modal Form */}
      {isAddingSource && (
        <form
          onSubmit={handleCreateSource}
          className="p-5 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Impor Sumber Resmi dari NotebookLM / PDF / YouTube</span>
            </h3>
            <span className="text-xs text-slate-400">Pilih metode input di bawah</span>
          </div>

          {/* Import Tabs */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveImportTab('notebooklm')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeImportTab === 'notebooklm'
                  ? 'bg-purple-900/80 text-purple-200 border border-purple-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>1. Catatan / Ekstrak NotebookLM</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveImportTab('pdf')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeImportTab === 'pdf'
                  ? 'bg-rose-950/80 text-rose-200 border border-rose-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>2. Berkas PDF Resmi 4Life</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveImportTab('youtube')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeImportTab === 'youtube'
                  ? 'bg-red-950/80 text-red-200 border border-red-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-red-400" />
              <span>3. Link Video YouTube Resmi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveImportTab('manual')}
              className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeImportTab === 'manual'
                  ? 'bg-slate-800 text-white border border-slate-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>4. Input Manual / BPOM</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                {activeImportTab === 'notebooklm'
                  ? 'Judul Catatan / Briefing Doc NotebookLM *'
                  : activeImportTab === 'pdf'
                  ? 'Nama Berkas / Judul Dokumen PDF 4Life *'
                  : activeImportTab === 'youtube'
                  ? 'Judul Video YouTube Resmi 4Life *'
                  : 'Judul Dokumen / Publikasi *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  activeImportTab === 'notebooklm'
                    ? 'Misal: Rangkuman Fisiologi Sistem Imun & Transfer Factor dari NotebookLM'
                    : activeImportTab === 'pdf'
                    ? 'Misal: 4Life_Transfer_Factor_TriFactor_ProductGuide.pdf'
                    : activeImportTab === 'youtube'
                    ? 'Misal: Video Edukasi Resmi: Bagaimana Transfer Factor Mendidik Sel Imun'
                    : 'Judul dokumen'
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Penerbit / Institusi
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder={
                  activeImportTab === 'notebooklm'
                    ? 'NotebookLM AI Synthesis (Sumber Berkas 4Life)'
                    : activeImportTab === 'youtube'
                    ? '4Life Indonesia Official YouTube'
                    : '4Life Research USA LLC'
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
              />
            </div>

            {activeImportTab === 'youtube' && (
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-red-300 block mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-red-400" />
                  <span>Tautan Video YouTube Resmi 4Life *</span>
                </label>
                <input
                  type="url"
                  required
                  value={urlOrDoc}
                  onChange={(e) => {
                    setUrlOrDoc(e.target.value);
                    setMediaUrl(e.target.value);
                  }}
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-400 font-mono"
                />
              </div>
            )}

            {activeImportTab === 'pdf' && (
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-rose-300 block mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>Nama Berkas PDF & Nomor Halaman</span>
                </label>
                <input
                  type="text"
                  value={urlOrDoc}
                  onChange={(e) => setUrlOrDoc(e.target.value)}
                  placeholder="Misal: Dokumen PDF di NotebookLM: 4Life_ProductGuide.pdf (Halaman 12-14)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-400 font-mono"
                />
              </div>
            )}

            {activeImportTab === 'notebooklm' && (
              <div>
                <label className="text-xs font-medium text-purple-300 block mb-1">
                  Tag Referensi di NotebookLM
                </label>
                <input
                  type="text"
                  value={notebookLmRef}
                  onChange={(e) => setNotebookLmRef(e.target.value)}
                  placeholder="Misal: NotebookLM / Study Guide: Imunologi Terapan"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Kategori Konten
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
              >
                <option value="product">Spesifikasi Produk Resmi</option>
                <option value="science">Sains Imunologi & Bukti Riset</option>
                <option value="regulation">Regulasi BPOM RI</option>
                <option value="business_ethics">Etika Bisnis & Kemitraan</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Kutipan / Fakta Kunci yang Diekstrak dari Berkas Resmi *
              </label>
              <textarea
                required
                rows={4}
                value={relevantPassage}
                onChange={(e) => setRelevantPassage(e.target.value)}
                placeholder={
                  activeImportTab === 'notebooklm'
                    ? 'Tempelkan ringkasan, kutipan catatan, atau hasil studi guide dari NotebookLM di sini...'
                    : activeImportTab === 'pdf'
                    ? 'Tuliskan poin formulasi, data uji nano-filtrasi, atau komposisi kolostrum/kuning telur dari PDF...'
                    : activeImportTab === 'youtube'
                    ? 'Tuliskan ringkasan penjelasan dokter/peneliti resmi 4Life dari video YouTube tersebut...'
                    : 'Tuliskan kutipan fakta terverifikasi...'
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 leading-relaxed font-sans"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingSource(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shadow-md"
            >
              Simpan Sumber Resmi ke Pabrik
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari sumber NotebookLM, PDF, YouTube, atau BPOM..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: `Semua Sumber (${sources.length})` },
            { id: 'notebooklm_files', label: `NotebookLM / PDF / YouTube (${notebookLmCount})` },
            { id: 'product', label: 'Produk 4Life' },
            { id: 'science', label: 'Sains Imun' },
            { id: 'regulation', label: 'Regulasi BPOM' },
            { id: 'business_ethics', label: 'Etika Kemitraan' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors whitespace-nowrap cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-3">
        {filteredSources.map((source) => {
          const isNlm =
            source.sourceType === 'notebooklm_extract' ||
            source.sourceType === 'pdf_document' ||
            source.sourceType === 'youtube_link' ||
            !!source.notebookLmRef;

          return (
            <div
              key={source.sourceId}
              className={`p-5 rounded-xl border space-y-3 transition-colors ${
                isNlm
                  ? 'bg-slate-900/90 border-purple-500/30 hover:border-purple-400/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-amber-400">
                      {source.sourceId}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 font-medium">{source.publisher}</span>

                    {source.sourceType === 'notebooklm_extract' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        NotebookLM Extract
                      </span>
                    )}

                    {source.sourceType === 'pdf_document' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-rose-400" />
                        PDF Dokumen Resmi
                      </span>
                    )}

                    {source.sourceType === 'youtube_link' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                        <Video className="w-3 h-3 text-red-400" />
                        YouTube Resmi 4Life
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1">
                    {source.title}
                  </h3>

                  {source.notebookLmRef && (
                    <div className="text-[11px] text-purple-400 font-mono mt-0.5">
                      Rujukan: {source.notebookLmRef}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {source.status}
                  </span>
                  <button
                    onClick={() => onDeleteSource(source.sourceId)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Hapus Sumber"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-lg text-xs text-slate-200 leading-relaxed font-sans">
                <strong className="text-slate-400 block mb-0.5 text-[11px] uppercase tracking-wider">
                  Kutipan Bukti Resmi:
                </strong>
                "{source.relevantPassage}"
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                <span className="capitalize">Kategori: {source.category.replace('_', ' ')}</span>
                {source.urlOrDoc && (
                  <a
                    href={source.urlOrDoc.startsWith('http') ? source.urlOrDoc : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{source.urlOrDoc.startsWith('http') ? 'Buka Tautan Sumber' : source.urlOrDoc}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {filteredSources.length === 0 && (
          <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            Tidak ada dokumen atau sumber yang sesuai pencarian.
          </div>
        )}
      </div>

      {/* Modal Panduan Konek Google NotebookLM */}
      <NotebookLmConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        currentNotebookUrl={notebookConfig.notebookUrl}
        onSaveUrl={async (url) => {
          setCustomNotebookUrl(url);
          try {
            const res = await fetch('/api/notebooklm/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notebookUrl: url }),
            });
            if (res.ok) {
              const updated = await res.json();
              setNotebookConfig(updated);
            }
          } catch (err) {
            console.error('Failed to update notebooklm config', err);
          }
        }}
        onImportExtractedText={(sourceTitle, passage, refTag) => {
          onAddSource({
            title: sourceTitle,
            publisher: 'Google NotebookLM (Berkas Resmi 4Life)',
            sourceType: 'notebooklm_extract',
            urlOrDoc: notebookConfig.notebookUrl,
            relevantPassage: passage,
            category: 'product',
            status: 'VERIFIED',
            publicationDate: new Date().toISOString().split('T')[0],
            retrievalDate: new Date().toISOString().split('T')[0],
            notebookLmRef: refTag,
          });
        }}
      />

      {/* Modal Sinkronisasi Berkelanjutan (Continuous Sync Hub) */}
      <NotebookContinuousSyncModal
        isOpen={isContinuousSyncOpen}
        onClose={() => setIsContinuousSyncOpen(false)}
        config={notebookConfig}
        onSyncSuccess={(newSources, updatedConfig) => {
          if (onBatchAddSources && newSources.length > 0) {
            onBatchAddSources(newSources);
          }
          setNotebookConfig(updatedConfig);
        }}
      />
    </div>
  );
};
