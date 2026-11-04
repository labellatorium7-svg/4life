import React, { useState } from 'react';
import { ContentProject } from '../types';
import {
  PackageCheck,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Music,
  CheckSquare,
  FileSpreadsheet,
  Printer,
  Sparkles,
  AlertTriangle,
  Lock,
  Unlock,
  FolderArchive,
} from 'lucide-react';
import { downloadFullProjectZip } from '../utils/localFlowBot';

interface ProductionPackageViewProps {
  activeProject: ContentProject | null;
  onUpdateProject: (updated: ContentProject) => void;
  onNavigate: (view: string) => void;
}

export const ProductionPackageView: React.FC<ProductionPackageViewProps> = ({
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

  const [copiedMd, setCopiedMd] = useState(false);
  const isApproved = activeProject.approval?.isApproved;
  const isBlocked = activeProject.status === 'blocked_compliance';

  const pkg = activeProject.productionPackage;

  const handleToggleApproval = () => {
    if (isBlocked) {
      alert('Proyek terblokir oleh sensor kepatuhan BPOM. Perbaiki klaim terlebih dahulu!');
      return;
    }

    const updated: ContentProject = {
      ...activeProject,
      status: !isApproved ? 'approved' : 'in_review',
      approval: {
        isApproved: !isApproved,
        approvedBy: !isApproved ? 'Founder & Chairman (Bos Besar)' : undefined,
        approvedAt: !isApproved ? new Date().toISOString() : undefined,
        feedback: !isApproved
          ? 'Paket produksi telah disetujui penuh oleh Founder & Chairman untuk perakitan video.'
          : 'Persetujuan ditarik kembali untuk revisi materi.',
      },
      productionPackage: {
        ...activeProject.productionPackage,
        exportTimestamp: !isApproved ? new Date().toISOString() : undefined,
      },
    };
    onUpdateProject(updated);
  };

  const handleDownloadJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `4LIFE-PROD-${activeProject.id}-${activeProject.title.replace(/\s+/g, '_').slice(0, 30)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyMarkdown = () => {
    const md = `# 4LIFE AI CONTENT FACTORY — LEMBAR PRODUKSI FINAL
ID PROYEK: ${activeProject.id}
JUDUL: ${activeProject.title}
FORMAT: ${activeProject.platform.toUpperCase()} (${activeProject.duration} Detik)
STATUS: ${activeProject.status.toUpperCase()}
OTORISASI: ${isApproved ? 'DISETUJUI OLEH BOS BESAR' : 'MENUNGGU PERSETUJUAN'}

## 1. STRATEGI & AUDIENS
- Topik: ${activeProject.strategy.topic}
- Sudut Pandang: ${activeProject.strategy.angle}
- Pesan Kunci: ${activeProject.strategy.keyTakeaway}
- Target Audiens: ${activeProject.targetAudience}

## 2. NASKAH FINAL
- Hook: ${activeProject.script.hook}
- Isi Narasi: ${activeProject.script.bodyNarration}
- Penutup: ${activeProject.script.closing}
- CTA: ${activeProject.script.cta}

## 3. PANDUAN MUSIK & AUDIO
- Genre: ${pkg.bgmRecommendation.genre}
- Suasana: ${pkg.bgmRecommendation.mood}
- Tempo: ${pkg.bgmRecommendation.tempoBpm}
- Referensi: ${pkg.bgmRecommendation.referenceVibe}

## 4. DAFTAR KLIP GOOGLE FLOW (${activeProject.flowPrompts.length} Klip)
${activeProject.flowPrompts
  .map(
    (p) =>
      `### Adegan ${p.sceneNumber} (${p.clipDurationSeconds}s · ${p.aspectRatio})
PROMPT: ${p.promptText}
NEGATIVE: ${p.negativePrompt}
`
  )
  .join('\n')}

## 5. INSTRUKSI PERAKITAN EDITOR
${pkg.assemblyInstructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
              Agent 9 — Video Production Manager
            </span>
            <span className="text-xs font-mono text-slate-500">[{activeProject.id}]</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Paket Produksi & Otorisasi Final</h1>
          <p className="text-xs text-slate-300">
            Kumpulan seluruh aset produksi (prompt video, naskah timecode, BGM, instruksi assembling).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={async () => {
              try {
                await downloadFullProjectZip(activeProject);
              } catch (e) {
                console.error(e);
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Unduh Paket Lengkap (.ZIP)</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            {copiedMd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedMd ? 'Tersalin!' : 'Salin Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Ekspor JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Cetak Lembar</span>
          </button>
        </div>
      </div>

      {/* Founder & Chairman Approval Stamp Box */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isApproved
            ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500/50 shadow-lg'
            : isBlocked
            ? 'bg-rose-950/50 border-rose-800'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Persetujuan Otoritas Tertinggi:
              </span>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                  isApproved
                    ? 'bg-emerald-900 text-emerald-200'
                    : isBlocked
                    ? 'bg-rose-900 text-rose-200'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isApproved
                  ? 'PRODUCTION APPROVED (SIAP RENDER)'
                  : isBlocked
                  ? 'BLOCKED BY COMPLIANCE SENSOR'
                  : 'MENUNGGU ACC BOS BESAR'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Founder & Chairman Sign-Off (Bos Besar)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isApproved
                ? `Disetujui secara digital oleh ${activeProject.approval.approvedBy} pada ${new Date(
                    activeProject.approval.approvedAt || ''
                  ).toLocaleString('id-ID')}. Paket siap diserahkan ke tim render visual.`
                : isBlocked
                ? 'Persetujuan terkunci karena naskah terdeteksi memuat klaim pengobatan atau janji pendapatan. Koreksi terlebih dahulu di tab Claims & Compliance.'
                : 'Setelah meninjau seluruh materi di atas, klik tombol di sebelah kanan untuk memberikan otorisasi perakitan video kepada Kepala Pabrik.'}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleToggleApproval}
              disabled={isBlocked}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-all shadow-md cursor-pointer ${
                isApproved
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : isBlocked
                  ? 'bg-rose-950 text-rose-400 border border-rose-800 cursor-not-allowed opacity-60'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isApproved ? (
                <>
                  <Unlock className="w-4 h-4 text-amber-400" />
                  <span>Tarik Persetujuan (Revisi)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Tanda Tangan Persetujuan Bos Besar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Assembly Checklist and Music Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quality Gates Checklist */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Checklist Quality Gates Pabrik (7 Tahap)</span>
          </h3>

          <div className="space-y-2">
            {(pkg.checklist || []).map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-slate-500 text-[10px]">0{idx + 1}</span>
                  <span className="text-slate-200 truncate">{item.item}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400">{item.agent}</span>
                  {item.done ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Music & Audio Recommendation */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Music className="w-4 h-4 text-amber-400" />
            <span>Arahan Musik Latar (BGM) & Audio</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">
                Genre & Vibe
              </span>
              <span className="font-semibold text-white block mt-0.5">
                {pkg.bgmRecommendation.genre} · {pkg.bgmRecommendation.mood}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">
                Tempo Rekomendasi
              </span>
              <span className="font-semibold text-amber-400 block mt-0.5 font-mono">
                {pkg.bgmRecommendation.tempoBpm}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">
                Referensi Karakter Musik
              </span>
              <span className="text-slate-300 block mt-0.5 leading-relaxed">
                {pkg.bgmRecommendation.referenceVibe}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assembly Instructions for Editor */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <FileSpreadsheet className="w-4 h-4 text-sky-400" />
          <span>Instruksi Perakitan untuk Video Editor</span>
        </h3>

        <div className="space-y-2">
          {(pkg.assemblyInstructions || []).map((ins, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
            >
              <span className="font-mono font-bold text-amber-400 shrink-0">
                Langkah {idx + 1}:
              </span>
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
