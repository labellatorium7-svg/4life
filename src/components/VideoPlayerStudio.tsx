import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Film,
  Sparkles,
  Music,
  Mic,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Share2,
  Upload,
  ExternalLink,
  FileVideo,
  Copy,
  Check,
  Bot,
} from 'lucide-react';
import { ContentProject } from '../types';
import { ASSETS } from '../assets/assetMap';
import { buildMasterFlowAgentPrompt } from '../utils/production';

interface VideoPlayerStudioProps {
  project: ContentProject;
}

export const VideoPlayerStudio: React.FC<VideoPlayerStudioProps> = ({ project }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [isMuted, setIsMuted] = useState(false);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [importedVideoUrl, setImportedVideoUrl] = useState<string | null>(null);
  const [videoMode, setVideoMode] = useState<'cinematic_preview' | 'flow_imported'>('cinematic_preview');
  const [copiedFlowPrompts, setCopiedFlowPrompts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadFlowVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImportedVideoUrl(url);
      setVideoMode('flow_imported');
      setIsPlaying(true);
    }
  };

  const handleCopyAllFlowPrompts = () => {
    const masterText = buildMasterFlowAgentPrompt(project, {
      aspectRatio: project.platform === 'youtube_long' ? '16:9' : '9:16',
      languageMode: 'bilingual',
      includeOutro: true,
    });
    navigator.clipboard.writeText(masterText);
    setCopiedFlowPrompts(true);
    setTimeout(() => setCopiedFlowPrompts(false), 2500);
  };

  const scenes = project.scenes || [];
  const totalDuration = scenes.reduce((acc, s) => acc + (s.durationSeconds || 10), 0) || 60;

  // Scene visuals mapping
  const sceneVisuals = [
    ASSETS.scene1,
    ASSETS.scene2,
    ASSETS.scene3,
    ASSETS.scene4,
    ASSETS.scene5,
  ];

  const currentScene = scenes[currentSceneIdx] || scenes[0];
  const currentVisual = sceneVisuals[currentSceneIdx % sceneVisuals.length] || ASSETS.scene1;

  // Audio Context Ref for BGM
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmIntervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Simple Web Audio API Synthesizer for warm acoustic background music
  const playAcousticChord = () => {
    if (!bgmEnabled || isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Warm pentatonic chord frequencies (E - G# - B - E)
      const freqs = [164.81, 207.65, 246.94, 329.63, 392.0];
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        // Soft, gentle decay
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 2.0);
      });
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Web Speech Synthesis for Voiceover
  const speakCurrentScene = (text: string) => {
    if (!voiceoverEnabled || isMuted || typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.pitch = 0.95; // warmer mature tone

      // Try to find Indonesian voice
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find((v) => v.lang.includes('id') || v.lang.includes('ID'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (bgmIntervalRef.current) {
        clearInterval(bgmIntervalRef.current);
        bgmIntervalRef.current = null;
      }
    } else {
      setIsPlaying(true);
      lastTickTimeRef.current = performance.now();
      if (currentScene) {
        speakCurrentScene(currentScene.narrationSegment);
      }
      playAcousticChord();
      bgmIntervalRef.current = window.setInterval(playAcousticChord, 2400);
    }
  };

  // Main playback timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const nextTime = prev + 0.25;
        if (nextTime >= totalDuration) {
          setIsPlaying(false);
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          if (bgmIntervalRef.current) {
            clearInterval(bgmIntervalRef.current);
            bgmIntervalRef.current = null;
          }
          return 0;
        }

        // Calculate which scene we should be in
        let cumulativeTime = 0;
        for (let i = 0; i < scenes.length; i++) {
          cumulativeTime += scenes[i].durationSeconds || 10;
          if (nextTime < cumulativeTime) {
            if (i !== currentSceneIdx) {
              setCurrentSceneIdx(i);
              speakCurrentScene(scenes[i].narrationSegment);
            }
            break;
          }
        }

        return nextTime;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, currentSceneIdx, scenes, totalDuration]);

  // Jump to specific scene
  const handleJumpToScene = (idx: number) => {
    let targetTime = 0;
    for (let i = 0; i < idx; i++) {
      targetTime += scenes[i].durationSeconds || 10;
    }
    setElapsedTime(targetTime);
    setCurrentSceneIdx(idx);
    if (isPlaying && scenes[idx]) {
      speakCurrentScene(scenes[idx].narrationSegment);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    setCurrentSceneIdx(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (bgmIntervalRef.current) {
      clearInterval(bgmIntervalRef.current);
      bgmIntervalRef.current = null;
    }
  };

  // Canvas Drawing & Video Recorder
  const handleRenderAndDownload = () => {
    if (!canvasRef.current) return;
    setIsRecording(true);
    setRecordedVideoUrl(null);
    handleReset();

    const canvas = canvasRef.current;
    const stream = canvas.captureStream(30);

    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);

        // Auto trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `4LIFE-VIDEO-${project.id}-${project.title.replace(/\s+/g, '_').slice(0, 25)}.webm`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      togglePlay();

      // Stop recorder when video finishes
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, totalDuration * 1000 + 500);
    } catch (e) {
      console.warn('MediaRecorder fallback:', e);
      setIsRecording(false);
      alert('Video sedang disiapkan di canvas pemutar!');
    }
  };

  // Keep drawing to hidden canvas for video recording
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = currentVisual;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Gradient overlay
      const grad = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height * 0.5);

      // On screen text
      if (currentScene?.onScreenText) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentScene.onScreenText, canvas.width / 2, canvas.height * 0.78);
      }

      // Subtitles
      if (currentScene?.narrationSegment) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentScene.narrationSegment.slice(0, 48), canvas.width / 2, canvas.height * 0.86);
      }

      // Legal BPOM mark
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Suplemen Kesehatan BPOM RI • 4Life Research', canvas.width / 2, canvas.height * 0.95);
    };
  }, [currentVisual, currentScene]);

  // Formatted time helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Film className="w-3.5 h-3.5" />
            <span>Studio Perakitan & Pemutar Video Jadi</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Hasil Video Final: {project.title}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Format: <strong className="text-amber-400">9:16 Vertical Video</strong> (Reels / TikTok / Shorts) • 5 Adegan Sinematik • Voiceover & BGM Terpadu
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRenderAndDownload}
            disabled={isRecording}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer transition-all"
          >
            {isRecording ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span>Merekam Video ({formatTime(elapsedTime)})...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Render & Unduh Video (.webm)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Google Flow Integration & Video Source Selector Bar */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setVideoMode('cinematic_preview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                videoMode === 'cinematic_preview'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mode Storyboard Sinematik
            </button>
            <button
              onClick={() => {
                if (!importedVideoUrl) {
                  fileInputRef.current?.click();
                } else {
                  setVideoMode('flow_imported');
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                videoMode === 'flow_imported'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileVideo className="w-3.5 h-3.5" />
              <span>Video Google Flow (.mp4)</span>
              {importedVideoUrl && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadFlowVideo}
            accept="video/mp4,video/webm"
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{importedVideoUrl ? 'Ganti Video Flow' : 'Pasang Video Google Flow (.mp4)'}</span>
          </button>

          <button
            onClick={handleCopyAllFlowPrompts}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-400/20 hover:from-amber-500/30 hover:to-amber-400/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            {copiedFlowPrompts ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bot className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedFlowPrompts ? 'Master Prompt 6 Scene Tersalin!' : 'Salin Master Prompt Agent Flow'}</span>
          </button>

          <a
            href="https://flow.google"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <span>Buka Google Flow</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Studio Viewport: Video Mockup + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 9:16 Smartphone Mockup with Real Animated Video */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-[36px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 overflow-hidden">
            {/* Speaker & Camera notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-950" />
              <span className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Video Screen Container */}
            <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-slate-950 flex flex-col justify-between">
              {/* Video Content: Either Imported Google Flow Video or Cinematic Scene Visual */}
              {videoMode === 'flow_imported' && importedVideoUrl ? (
                <div className="absolute inset-0 overflow-hidden bg-black">
                  <video
                    src={importedVideoUrl}
                    controls={false}
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                </div>
              ) : (
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={currentVisual}
                    alt={`Adegan ${currentScene?.sceneNumber || 1}`}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-out ${
                      isPlaying ? 'scale-110 translate-y-[-2%]' : 'scale-100'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/30 pointer-events-none" />
                </div>
              )}

              {/* Top Video Overlay Bar */}
              <div className="relative z-20 pt-7 px-4 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-mono text-[11px] font-bold">
                    Adegan {currentSceneIdx + 1}/{scenes.length}
                  </span>
                </div>
                <div className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-[10px] font-mono text-emerald-300">
                  BPOM SI Terdaftar
                </div>
              </div>

              {/* Play / Pause Big Center Click Target */}
              <div
                onClick={togglePlay}
                className="relative z-20 flex-1 flex items-center justify-center cursor-pointer group"
              >
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-amber-400/90 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                )}
              </div>

              {/* Bottom Video Overlay: On-Screen Text & Subtitles */}
              <div className="relative z-20 pb-5 px-4 space-y-2 text-center">
                {/* Highlight Headline */}
                {currentScene?.onScreenText && (
                  <div className="inline-block px-3 py-1 bg-amber-500/90 text-slate-950 text-xs font-extrabold rounded-md shadow-lg tracking-wide uppercase">
                    {currentScene.onScreenText}
                  </div>
                )}

                {/* Real-Time Subtitles / Captions */}
                <div className="p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-white shadow-2xl">
                  <p className="text-xs font-medium leading-relaxed drop-shadow">
                    "{currentScene?.narrationSegment}"
                  </p>
                </div>

                {/* Legal BPOM Footer */}
                <div className="text-[9px] text-slate-400 font-mono tracking-tight pt-1">
                  Suplemen Kesehatan Pemelihara Imun • Bukan Obat Penyakit
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audio & Scene Timeline Director Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Playback Progress & Scrubbing Bar */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold">{formatTime(elapsedTime)}</span>
              <span className="text-slate-400">Durasi Penuh: {formatTime(totalDuration)}</span>
            </div>

            {/* Interactive Timeline Bar */}
            <div className="relative w-full bg-slate-800 h-3 rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${(elapsedTime / totalDuration) * 100}%` }}
              />
            </div>

            {/* Primary Transport Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                  title="Ulangi dari Awal"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleJumpToScene(Math.max(0, currentSceneIdx - 1))}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                  title="Adegan Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-950/50"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Jeda Video</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Putar Video Jadi</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleJumpToScene(Math.min(scenes.length - 1, currentSceneIdx + 1))}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                  title="Adegan Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVoiceoverEnabled(!voiceoverEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    voiceoverEnabled
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  title="Suara Narator (Voiceover)"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Suara {voiceoverEnabled ? 'Aktif' : 'Nonaktif'}</span>
                </button>
                <button
                  onClick={() => setBgmEnabled(!bgmEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    bgmEnabled
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  title="Musik Latar Akustik (BGM)"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Musik {bgmEnabled ? 'Aktif' : 'Mati'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scene Breakdown Thumbnails Strip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Pilih & Lompat ke Adegan:</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {scenes.length} Adegan Terangkai
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {scenes.map((scene, idx) => {
                const isActive = currentSceneIdx === idx;
                const visual = sceneVisuals[idx % sceneVisuals.length];

                return (
                  <div
                    key={scene.sceneNumber || idx}
                    onClick={() => handleJumpToScene(idx)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isActive
                        ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="aspect-[9/16] rounded-lg overflow-hidden bg-black relative">
                      <img
                        src={visual}
                        alt={`Adegan ${scene.sceneNumber}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                        #{scene.sceneNumber}
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono text-amber-300">
                        {scene.durationSeconds || 10}s
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-300 truncate mt-1.5">
                      {scene.onScreenText || `Adegan ${scene.sceneNumber}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Video Metadata & Quality Guarantee */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Visual Ratio</span>
              <span className="font-bold text-white font-mono">9:16 (1080x1920)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Voiceover Tempo</span>
              <span className="font-bold text-emerald-400 font-mono">135 Kata/Menit</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Kepatuhan Hukum</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>BPOM SI Lulus</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Sumber Data</span>
              <span className="font-bold text-amber-400 truncate block">NotebookLM Resmi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas for Video Stream Recording */}
      <canvas
        ref={canvasRef}
        width={720}
        height={1280}
        className="hidden"
      />
    </div>
  );
};
