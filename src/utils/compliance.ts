/**
 * Health & Claims Compliance Engine for 4Life AI Content Factory
 * Strict regulatory rules for BPOM Indonesia and ethical dietary supplement marketing.
 */

export interface ComplianceViolation {
  category: 'medical_cure' | 'income_guarantee' | 'unverified_potency' | 'misleading_authority';
  severity: 'CRITICAL' | 'WARNING';
  matchedPhrase: string;
  explanation: string;
  suggestedCorrection: string;
}

export interface ClaimEvaluation {
  id: string;
  statement: string;
  status: 'VERIFIED' | 'SUPPORTED_WITH_LIMITATIONS' | 'UNVERIFIED' | 'CONFLICTED' | 'REJECTED';
  evidenceNote: string;
  recommendation: string;
  isResolved: boolean;
}

// Prohibited medical claim patterns (cannot claim to cure, diagnose, treat, or prevent any illness)
const FORBIDDEN_MEDICAL_PATTERNS = [
  {
    regex: /(menyembuhkan|sembuh(kan)?|mengobati|penyembuhan|mencegah|obat)\s+(kanker|diabetes|stroke|tumor|covid|autis|ginjal|jantung|hipertensi)/i,
    category: 'medical_cure' as const,
    severity: 'CRITICAL' as const,
    explanation: 'Suplemen transfer factor tidak boleh diklaim menyembuhkan, mengobati, atau mencegah penyakit klinis.',
    suggestedCorrection: 'Membantu memelihara daya tahan tubuh secara optimal sebagai bagian dari pola hidup sehat.',
  },
  {
    regex: /(menggantikan|lepas dari)\s+(obat|terapi|resep)\s+(dokter|medis)/i,
    category: 'medical_cure' as const,
    severity: 'CRITICAL' as const,
    explanation: 'Suplemen tidak boleh disarankan sebagai pengganti perawatan medis atau obat dokter.',
    suggestedCorrection: 'Dapat dikonsumsi berdampingan atas konsultasi tenaga medis yang merawat.',
  },
  {
    regex: /(garansi\s+sembuh|pasti\s+sembuh|100%\s+manjur|obat\s+mujarab)/i,
    category: 'unverified_potency' as const,
    severity: 'CRITICAL' as const,
    explanation: 'Dilarang menggunakan klaim superlatif atau jaminan kesembuhan mutlak.',
    suggestedCorrection: 'Memberikan molekul transfer factor alami untuk mendukung sistem imun tubuh.',
  },
  {
    regex: /(saya\s+adalah\s+dokter|kami\s+para\s+dokter\s+meresepkan)/i,
    category: 'misleading_authority' as const,
    severity: 'CRITICAL' as const,
    explanation: 'Dilarang melakukan impersonasi dokter atau tenaga kesehatan berlisensi dalam promosi suplemen.',
    suggestedCorrection: 'Berdasarkan literatur sains mengenai transfer factor dari kolostrum sapi dan kuning telur unggas.',
  },
];

// Prohibited financial/MLM guarantee patterns
const FORBIDDEN_INCOME_PATTERNS = [
  {
    regex: /(pasti\s+kaya|garansi\s+penghasilan|cepat\s+kaya|pasti\s+dapat\s+\d+\s+juta)/i,
    category: 'income_guarantee' as const,
    severity: 'CRITICAL' as const,
    explanation: 'Dilarang memberikan janji atau garansi pendapatan dalam peluang kemitraan.',
    suggestedCorrection: 'Peluang bisnis kemitraan yang transparan di mana hasil bergantung pada kerja nyata dan dedikasi.',
  },
  {
    regex: /(tanpa\s+kerja|duduk\s+manis\s+dapat\s+uang|pasif\s+income\s+tanpa\s+usaha)/i,
    category: 'income_guarantee' as const,
    severity: 'CRITICAL' as const,
    explanation: 'Klaim penghasilan pasif tanpa kerja melanggar etika APLI dan regulasi perdagangan langsung.',
    suggestedCorrection: 'Membangun jejaring distribusi produk bernilai tambah melalui edukasi berkelanjutan.',
  },
];

export function auditScriptCompliance(text: string): {
  isBlocked: boolean;
  overallStatus: 'PASSED' | 'WARNING' | 'BLOCKED';
  violations: ComplianceViolation[];
  claims: ClaimEvaluation[];
  disclaimers: string[];
} {
  const violations: ComplianceViolation[] = [];
  const claims: ClaimEvaluation[] = [];

  // Check forbidden patterns
  for (const pattern of FORBIDDEN_MEDICAL_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      violations.push({
        category: pattern.category,
        severity: pattern.severity,
        matchedPhrase: match[0],
        explanation: pattern.explanation,
        suggestedCorrection: pattern.suggestedCorrection,
      });

      claims.push({
        id: `claim-${claims.length + 1}`,
        statement: match[0],
        status: 'REJECTED',
        evidenceNote: pattern.explanation,
        recommendation: pattern.suggestedCorrection,
        isResolved: false,
      });
    }
  }

  for (const pattern of FORBIDDEN_INCOME_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      violations.push({
        category: pattern.category,
        severity: pattern.severity,
        matchedPhrase: match[0],
        explanation: pattern.explanation,
        suggestedCorrection: pattern.suggestedCorrection,
      });

      claims.push({
        id: `claim-${claims.length + 1}`,
        statement: match[0],
        status: 'REJECTED',
        evidenceNote: pattern.explanation,
        recommendation: pattern.suggestedCorrection,
        isResolved: false,
      });
    }
  }

  // Check for allowed healthy statements and classify
  const healthyChecks = [
    {
      keyword: /transfer factor/i,
      statement: 'Mengandung molekul Transfer Factor alami dari kolostrum sapi & kuning telur unggas',
      status: 'VERIFIED' as const,
      evidenceNote: 'Terdokumentasi pada spesifikasi produk resmi 4Life Research dan izin edar BPOM.',
    },
    {
      keyword: /(sistem imun|daya tahan tubuh)/i,
      statement: 'Membantu memelihara daya tahan tubuh / sistem imun',
      status: 'VERIFIED' as const,
      evidenceNote: 'Klaim fungsi suplemen pangan sesuai ketentuan BPOM RI untuk pemeliharaan daya tahan tubuh.',
    },
    {
      keyword: /(usia 40|penuaan|dewasa)/i,
      statement: 'Kebutuhan nutrisi daya tahan tubuh seiring bertambahnya usia',
      status: 'SUPPORTED_WITH_LIMITATIONS' as const,
      evidenceNote: 'Imunosenesens adalah proses alami penurunan efisiensi imun pada lansia menurut studi gerontologi.',
    },
  ];

  for (const item of healthyChecks) {
    if (item.keyword.test(text)) {
      claims.push({
        id: `claim-${claims.length + 1}`,
        statement: item.statement,
        status: item.status,
        evidenceNote: item.evidenceNote,
        recommendation: 'Dapat dipertahankan dengan batasan edukatif.',
        isResolved: true,
      });
    }
  }

  const hasCritical = violations.some((v) => v.severity === 'CRITICAL');
  const isBlocked = hasCritical;
  const overallStatus = isBlocked ? 'BLOCKED' : violations.length > 0 ? 'WARNING' : 'PASSED';

  const disclaimers = [
    'Produk ini adalah suplemen kesehatan dan tidak dimaksudkan untuk mendiagnosis, mengobati, menyembuhkan, atau mencegah penyakit apa pun.',
    'Peluang kemitraan bisnis bergantung pada keterampilan, usaha individu, dan kondisi pasar. Tidak ada jaminan penghasilan tetap.',
  ];

  return {
    isBlocked,
    overallStatus,
    violations,
    claims,
    disclaimers,
  };
}
