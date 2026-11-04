/**
 * Core Domain Models for 4Life AI Content Factory
 */

export type PlatformFormat =
  | 'tiktok'
  | 'reels'
  | 'shorts'
  | 'youtube_long'
  | 'carousel'
  | 'single_image';

export type ClaimStatus =
  | 'VERIFIED'
  | 'SUPPORTED_WITH_LIMITATIONS'
  | 'UNVERIFIED'
  | 'CONFLICTED'
  | 'REJECTED';

export type ProjectStatus =
  | 'draft'
  | 'in_review'
  | 'blocked_compliance'
  | 'approved'
  | 'production_ready';

export interface SourceRecord {
  sourceId: string;
  title: string;
  publisher: string;
  sourceType:
    | 'notebooklm_extract'
    | 'youtube_link'
    | 'pdf_document'
    | 'official_4life'
    | 'bpom_regulator'
    | 'peer_reviewed_paper'
    | 'scientific_institution'
    | 'internal_user_doc';
  publicationDate: string;
  retrievalDate: string;
  urlOrDoc: string;
  relevantPassage: string;
  status: ClaimStatus;
  category: 'product' | 'science' | 'regulation' | 'business_ethics';
  notebookLmRef?: string;
  mediaUrl?: string;
}

export interface NotebookLmConfig {
  notebookUrl: string;
  notebookTitle: string;
  lastSync?: string;
  notesCount: number;
  syncHistory?: Array<{
    id: string;
    timestamp: string;
    addedCount: number;
    summary: string;
  }>;
}

export interface ClaimItem {
  id: string;
  statement: string;
  status: ClaimStatus;
  evidenceNote: string;
  recommendation: string;
  isResolved: boolean;
}

export interface SceneItem {
  sceneNumber: number;
  durationSeconds: number;
  timecodeStart: string;
  timecodeEnd: string;
  narrationSegment: string;
  visualDescription: string;
  characterDescription: string;
  environment: string;
  cameraMovement: string;
  lighting: string;
  transition: string;
  onScreenText?: string;
}

export interface FlowPromptItem {
  sceneNumber: number;
  clipDurationSeconds: number;
  aspectRatio: '9:16' | '16:9' | '1:1';
  promptText: string;
  negativePrompt: string;
  cinematographyStyle: string;
  characterContinuityKey: string;
}

export interface OrchestratorLog {
  timestamp: string;
  agent: string;
  action: string;
  status: 'success' | 'warning' | 'info' | 'error';
  detail: string;
}

export interface ContentProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  objective: string;
  targetAudience: string;
  platform: PlatformFormat;
  duration: number; // in seconds
  status: ProjectStatus;
  approval: {
    isApproved: boolean;
    approvedBy?: string;
    approvedAt?: string;
    feedback?: string;
  };
  strategy: {
    topic: string;
    angle: string;
    keyTakeaway: string;
    seriesName?: string;
    episodeNumber?: number;
    callToActionIntent: 'education' | 'partnership_opportunity' | 'product_discovery' | 'lifestyle';
  };
  research: {
    summary: string;
    sources: SourceRecord[];
    scientificDisclaimer: string;
  };
  script: {
    version: number;
    hook: string;
    bodyNarration: string;
    closing: string;
    cta: string;
    seoTitle: string;
    seoDescription: string;
    hashtags: string[];
    speakingRateWpm: number;
    estimatedTotalSeconds: number;
  };
  claimsReview: {
    overallStatus: 'PASSED' | 'WARNING' | 'BLOCKED';
    reviewedAt: string;
    reviewer: string;
    claims: ClaimItem[];
    medicalDisclaimersRequired: string[];
  };
  scenes: SceneItem[];
  flowPrompts: FlowPromptItem[];
  voiceover: {
    narratorProfile: {
      gender: 'male' | 'female';
      persona: string;
      tone: string;
      pace: 'slow' | 'moderate' | 'energetic';
    };
    fullTtsScript: string;
    timecodedSegments: Array<{
      timecode: string;
      sceneNumber: number;
      text: string;
      durationSeconds: number;
    }>;
  };
  productionPackage: {
    checklist: Array<{ item: string; done: boolean; agent: string }>;
    bgmRecommendation: {
      genre: string;
      mood: string;
      tempoBpm: string;
      referenceVibe: string;
    };
    assemblyInstructions: string[];
    exportTimestamp?: string;
  };
  orchestratorLogs: OrchestratorLog[];
}

export interface KnowledgeBaseData {
  sources: SourceRecord[];
}
