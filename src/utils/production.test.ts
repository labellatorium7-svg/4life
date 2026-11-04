import test from 'node:test';
import assert from 'node:assert/strict';
import {
  countWords,
  estimateVoiceoverDuration,
  formatTimecode,
  buildGoogleFlowPrompt,
  buildMasterFlowAgentPrompt,
} from './production';

test('accurately counts words and estimates voiceover time', () => {
  const sample = 'Sistem imun adalah garda terdepan perlindungan tubuh kita sehari-hari.';
  const words = countWords(sample);
  assert.equal(words, 9);

  // At 135 wpm, 10 words is ~5 seconds
  const estSeconds = estimateVoiceoverDuration(sample, 135);
  assert.ok(estSeconds > 0 && estSeconds <= 6);
});

test('formats timecode correctly', () => {
  assert.equal(formatTimecode(0), '00:00');
  assert.equal(formatTimecode(65), '01:05');
  assert.equal(formatTimecode(132), '02:12');
});

test('builds compliant Google Flow prompt with anti-slop negative prompt', () => {
  const promptData = buildGoogleFlowPrompt({
    sceneNumber: 1,
    durationSeconds: 10,
    environment: 'Ruang tamu modern di Jakarta dengan tanaman hijau dan jendela besar',
    characterDescription: 'Pria Indonesia usia 45 tahun berpakaian kasual polo shirt rapi',
    action: 'Melihat ke arah jendela sambil tersenyum tenang memegang secangkir air hangat',
    cameraMovement: 'Slow push in',
    lighting: 'Warm morning sunlight pouring in through sheer curtains',
    aspectRatio: '9:16',
  });

  assert.ok(promptData.promptText.includes('Indonesian'));
  assert.ok(promptData.promptText.includes('10s duration'));
  assert.ok(promptData.negativePrompt.includes('fake doctor uniform'));
});

test('builds master Flow Agent prompt for multi-scene batch execution', () => {
  const masterPrompt = buildMasterFlowAgentPrompt({
    id: 'PRJ-TEST',
    title: 'Uji Coba Sains Transfer Factor',
    platform: 'reels',
    scenes: [
      {
        sceneNumber: 1,
        durationSeconds: 10,
        timecodeStart: '00:00',
        timecodeEnd: '00:10',
        narrationSegment: 'Tahukah Anda berkas resmi 4Life?',
        visualDescription: 'Pria Indonesia membaca dokumen di ruang kerja kayu.',
        characterDescription: 'Pria Indonesia matang 45 tahun kemeja polo rapi.',
      },
      {
        sceneNumber: 2,
        durationSeconds: 12,
        timecodeStart: '00:10',
        timecodeEnd: '00:22',
        narrationSegment: 'Transfer Factor diekstraksi dari kolostrum.',
        visualDescription: 'Pria tersenyum di beranda asri.',
      },
    ],
  }, {
    aspectRatio: '9:16',
    languageMode: 'bilingual',
    includeOutro: true,
  });

  assert.ok(masterPrompt.includes('AGENT DIRECTIVE'));
  assert.ok(masterPrompt.includes('SCENE 1'));
  assert.ok(masterPrompt.includes('SCENE 2'));
  assert.ok(masterPrompt.includes('SCENE 3')); // Outro scene
  assert.ok(masterPrompt.includes('GLOBAL NEGATIVE PROMPT'));
});

