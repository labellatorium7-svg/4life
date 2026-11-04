import React, { useState } from 'react';
import { ContentProject, ClaimItem } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Wand2,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { auditScriptCompliance } from '../utils/compliance';

interface ComplianceViewProps {
  activeProject: ContentProject | null;
  onUpdateProject: (updated: ContentProject) => void;
  onNavigate: (view: string) => void;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({
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

  const [claims, setClaims] = useState<ClaimItem[]>(activeProject.claimsReview.claims);
  const [overallStatus, setOverallStatus] = useState(activeProject.claimsReview.overallStatus);
  const isBlocked = activeProject.status === 'blocked_compliance' || overallStatus === 'BLOCKED';

  const fullScript = `${activeProject.script.hook} ${activeProject.script.bodyNarration} ${activeProject.script.closing} ${activeProject.script.cta}`;

  const handleReAudit = () => {
    const result = auditScriptCompliance(fullScript);
    setOverallStatus(result.overallStatus);
    setClaims(result.claims);

    const updated: ContentProject = {
      ...activeProject,
      status: result.isBlocked ? 'blocked_compliance' : activeProject.status === 'blocked_compliance' ? 'in_review' : activeProject.status,
      claimsReview: {
        ...activeProject.claimsReview,
        overallStatus: result.overallStatus,
        reviewedAt: new Date().toISOString(),
        claims: result.claims,
      },
    };
    onUpdateProject(updated);
  };

  const handleAutoFix = () => {
    let correctedBody = activeProject.script.bodyNarration;
    let correctedHook = activeProject.script.hook;

    const audit = auditScriptCompliance(fullScript);
    for (const v of audit.violations) {
      correctedBody = correctedBody.replace(v.matchedPhrase, v.suggestedCorrection);
      correctedHook = correctedHook.replace(v.matchedPhrase, v.suggestedCorrection);
    }

    const updatedScript = {
      ...activeProject.script,
      hook: correctedHook,
      bodyNarration: correctedBody,
    };

    const newFullText = `${correctedHook} ${correctedBody} ${activeProject.script.closing} ${activeProject.script.cta}`;
    const newAudit = auditScriptCompliance(newFullText);

    const updated: ContentProject = {
      ...activeProject,
      status: newAudit.isBlocked ? 'blocked_compliance' : 'in_review',
      script: updatedScript,
      claimsReview: {
        ...activeProject.claimsReview,
        overallStatus: newAudit.overallStatus,
        reviewedAt: new Date().toISOString(),
        claims: newAudit.claims,
      },
    };
    onUpdateProject(updated);
    setClaims(newAudit.claims);
    setOverallStatus(newAudit.overallStatus);
  };

  const handleApproveOverride = () => {
    const updated: ContentProject = {
      ...activeProject,
      status: 'in_review',
      claimsReview: {
        ...activeProject.claimsReview,
        overallStatus: 'WARNING',
        reviewedAt: new Date().toISOString(),
      },
    };
    onUpdateProject(updated);
    setOverallStatus('WARNING');
  };

  const getStatusBadge = (status: ClaimItem['status']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>VERIFIED</span>
          </span>
        );
      case 'SUPPORTED_WITH_LIMITATIONS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-sky-950 text-sky-400 border border-sky-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            <span>SUPPORTED WITH LIMITATIONS</span>
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>UNVERIFIED</span>
          </span>
        );
      case 'CONFLICTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-950 text-purple-400 border border-purple-800">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
            <span>CONFLICTED</span>
          </span>
        );
      case 'REJECTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-950 text-rose-400 border border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>REJECTED (KLAIM DILARANG)</span>
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 uppercase">
              Agent 4 — Health & Claims Compliance Officer
            </span>
            <span className="text-xs font-mono text-slate-500">[{activeProject.id}]</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Audit Kepatuhan Klaim Kesehatan & Regulasi BPOM</h1>
          <p className="text-xs text-slate-300">
            Menegakkan standar etika tanpa kompromi: Suplemen pangan tidak boleh diklaim menyembuhkan penyakit dan kemitraan tidak boleh menjanjikan kekayaan instan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReAudit}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-sky-400" />
            <span>Audit Ulang Naskah</span>
          </button>
        </div>
      </div>

      {/* Critical Status Box */}
      <div
        className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isBlocked
            ? 'bg-rose-950/50 border-rose-800'
            : overallStatus === 'WARNING'
            ? 'bg-amber-950/40 border-amber-800'
            : 'bg-emerald-950/40 border-emerald-800'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            {isBlocked ? (
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            ) : overallStatus === 'WARNING' ? (
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Status Kepatuhan Proyek:
              </span>
              <span
                className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                  isBlocked
                    ? 'bg-rose-900 text-rose-200'
                    : overallStatus === 'WARNING'
                    ? 'bg-amber-900 text-amber-200'
                    : 'bg-emerald-900 text-emerald-200'
                }`}
              >
                {overallStatus}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {isBlocked
                ? 'PRODUKSI DITAHAN! Naskah terdeteksi memuat klaim medis penyembuhan atau jaminan pendapatan. Konten dilarang dipublikasikan sebelum klaim yang ditolak (REJECTED) diperbaiki.'
                : overallStatus === 'WARNING'
                ? 'Ada klaim dengan batasan edukasi yang perlu dicermati. Tetap patuhi disclaimer wajib.'
                : 'LULUS AUDIT! Naskah memenuhi regulasi BPOM RI dan kode etik APLI. Bebas dari overclaim.'}
            </p>
          </div>
        </div>

        {isBlocked && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAutoFix}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Wand2 className="w-4 h-4" />
              <span>Koreksi Otomatis Etis</span>
            </button>
          </div>
        )}
      </div>

      {/* Evaluated Claims Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-400" />
            <span>Tabel Evaluasi Pernyataan & Klaim ({claims.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Setiap klaim harus mempunyai rujukan bukti
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {claims.map((claim) => (
            <div key={claim.id} className="p-4 space-y-2 hover:bg-slate-800/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="text-xs font-semibold text-white">
                  "{claim.statement}"
                </div>
                <div>{getStatusBadge(claim.status)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium mb-0.5">
                    Catatan Bukti / Regulasi:
                  </span>
                  <span className="text-slate-300">{claim.evidenceNote}</span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium mb-0.5">
                    Rekomendasi Petugas Kepatuhan:
                  </span>
                  <span className="text-amber-300">{claim.recommendation}</span>
                </div>
              </div>
            </div>
          ))}

          {claims.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada klaim yang terdeteksi. Silakan klik "Audit Ulang Naskah".
            </div>
          )}
        </div>
      </div>

      {/* Mandatory BPOM Disclaimers checklist */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Disclaimer Regulasi Wajib (BPOM RI & Etika Kemitraan)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Teks berikut otomatis disematkan pada paket produksi dan panduan video editor:
        </p>

        <div className="space-y-2">
          {(activeProject.claimsReview.medicalDisclaimersRequired || []).map((disc, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{disc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => onNavigate('script_studio')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
        >
          Kembali ke Script Studio
        </button>

        <button
          onClick={() => onNavigate('scene_designer')}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>Lanjut ke Scene Designer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
