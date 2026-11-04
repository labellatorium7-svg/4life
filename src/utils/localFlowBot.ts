import JSZip from 'jszip';
import { ContentProject } from '../types';
import { buildMasterFlowAgentPrompt } from './production';

export function generateLocalPythonBotScript(project: ContentProject): string {
  const scenesJson = JSON.stringify(
    project.scenes.map((s, idx) => ({
      sceneNumber: s.sceneNumber || idx + 1,
      duration: s.durationSeconds || 10,
      prompt: project.flowPrompts?.[idx]?.promptText || s.visualDescription,
      negative: project.flowPrompts?.[idx]?.negativePrompt || '',
      outputFilename: `klip_adegan_${s.sceneNumber || idx + 1}.mp4`,
    })),
    null,
    2
  );

  return `# ==============================================================================
# 4LIFE AI CONTENT FACTORY — LOCAL FLOW AUTO-PASTE & DOWNLOAD BOT
# Proyek: ${project.title} (ID: ${project.id})
# Tujuan: Membuka Google Flow secara otomatis, menempel prompt per adegan,
#         dan menyimpan klip video yang selesai ke folder lokal komputer Anda.
# ==============================================================================

import time
import os
import json
from playwright.sync_api import sync_playwright

# 1. Konfigurasi Folder Penyimpanan Lokal di Komputer Anda
OUTPUT_DIR = os.path.join(os.getcwd(), "klip_flow_selesai")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 2. Daftar Prompt dari 4Life AI Content Factory
SCENES = ${scenesJson}

def run_flow_agent():
    print("====================================================================")
    print("🤖 MEMULAI AGEN OTOMASI GOOGLE FLOW...")
    print(f"📁 Folder Penyimpanan Lokal: {OUTPUT_DIR}")
    print(f"🎬 Total Adegan yang akan diproses: {len(SCENES)}")
    print("====================================================================")

    with sync_playwright() as p:
        # Menggunakan browser Chromium lokal Anda (Bisa dengan profil login Google Anda)
        # Catatan: Tambahkan user_data_dir jika ingin menggunakan sesi Google Chrome Anda yang sudah login
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(accept_downloads=True)
        page = context.new_page()

        print("🌐 Membuka Google Flow di browser lokal Anda...")
        page.goto("https://flow.google") # Atau buka URL project Google Flow Anda
        
        print("⏳ Menunggu halaman siap... (Silakan login jika diminta)")
        page.wait_for_timeout(5000)

        for item in SCENES:
            scene_num = item["sceneNumber"]
            prompt = item["prompt"]
            out_file = item["outputFilename"]
            
            print(f"\\n-------------------------------------------------------------")
            print(f"▶️ [AGEN MEMPROSES ADEGAN #{scene_num}]")
            print(f"📝 Menempelkan Prompt ke Flow:\\n{prompt[:90]}...")

            try:
                # 3. Cari kotak prompt di Google Flow (textarea/contenteditable)
                prompt_box = page.locator("textarea, [contenteditable='true']").first
                if prompt_box.is_visible():
                    prompt_box.click()
                    prompt_box.fill(prompt)
                    print("✅ Prompt berhasil ditempelkan oleh Agen!")
                    time.sleep(1)

                    # 4. Klik tombol Generate / Render
                    generate_btn = page.locator("button:has-text('Generate'), button:has-text('Render'), button:has-text('Create')").first
                    if generate_btn.is_visible():
                        generate_btn.click()
                        print("🚀 Tombol Render ditekan. Menunggu klip selesai dibuat...")
                        
                        # Tunggu render video selesai
                        time.sleep(15)
                        
                        # 5. Cari tombol download video dan simpan ke folder lokal
                        download_btn = page.locator("button:has-text('Download'), [aria-label*='Download']").first
                        if download_btn.is_visible():
                            with page.expect_download() as download_info:
                                download_btn.click()
                            download = download_info.value
                            local_path = os.path.join(OUTPUT_DIR, out_file)
                            download.save_as(local_path)
                            print(f"💾 Klip #{scene_num} BERHASIL DISIMPAN KE: {local_path}")
                        else:
                            print(f"ℹ️ Silakan klik download pada klip #{scene_num}")
                else:
                    print(f"⚠️ Kotak input belum terlihat di layar Flow. Harap pastikan halaman siap.")
            except Exception as e:
                print(f"⚠️ Catatan proses adegan #{scene_num}: {e}")

        print("\\n====================================================================")
        print("🎉 SELURUH PROSES SELESAI!")
        print(f"📁 Buka folder lokal komputer Anda: {OUTPUT_DIR}")
        print("====================================================================")
        browser.close()

if __name__ == "__main__":
    run_flow_agent()
`;
}

export async function downloadFullProjectZip(project: ContentProject): Promise<void> {
  const zip = new JSZip();

  // 0. Master Prompt for Google Flow Agent (All-in-One Multi-Scene)
  const masterAgentPrompt = buildMasterFlowAgentPrompt(project, {
    aspectRatio: project.platform === 'youtube_long' ? '16:9' : '9:16',
    languageMode: 'bilingual',
    includeOutro: true,
  });
  zip.file('00_MASTER_PROMPT_AGENT_FLOW_SEMUA_SCENE_SEKALIGUS.txt', masterAgentPrompt);

  // 1. Text Script & Narration
  const scriptContent = `4LIFE AI CONTENT FACTORY — NASKAH RESMI
ID Proyek: ${project.id}
Judul: ${project.title}
Format: ${project.platform.toUpperCase()} (${project.duration} Detik)
Status Kepatuhan BPOM: ${project.claimsReview.overallStatus}
Diperiksa oleh: Claims Compliance Officer Pabrik 4Life

[HOOK (00:00 - 00:10)]
${project.script.hook}

[ISI NARASI EDUKASI (00:10 - 00:36)]
${project.script.bodyNarration}

[CLOSING (00:36 - 00:48)]
${project.script.closing}

[CALL TO ACTION (00:48 - 01:00)]
${project.script.cta}

[METADATA SEO]
Judul SEO: ${project.script.seoTitle}
Deskripsi: ${project.script.seoDescription}
Hashtag: ${project.script.hashtags.join(' ')}
`;
  zip.file('01_Naskah_Voiceover_Indonesia.txt', scriptContent);

  // 2. Google Flow Prompts File
  const flowPromptsContent = `DAFTAR PROMPT GOOGLE FLOW VIDEO (5 ADEGAN)
Proyek: ${project.title}
Rasio: 9:16 Vertikal (Reels / TikTok / Shorts)

${(project.scenes || [])
  .map(
    (s, idx) => `================================================================
ADEGAN #${s.sceneNumber || idx + 1} (${s.durationSeconds || 10} DETIK)
Headline Layar: ${s.onScreenText || ''}
Narasi: "${s.narrationSegment}"
----------------------------------------------------------------
PROMPT FLOW:
${project.flowPrompts?.[idx]?.promptText || s.visualDescription}

NEGATIVE PROMPT:
${project.flowPrompts?.[idx]?.negativePrompt || ''}
================================================================`
  )
  .join('\n\n')}
`;
  zip.file('02_Prompt_Google_Flow_Adegan_1_sampai_5.txt', flowPromptsContent);

  // 3. Complete JSON Project Metadata
  zip.file('03_Metadata_Lengkap_Proyek.json', JSON.stringify(project, null, 2));

  // 4. BPOM Legal Compliance Document
  const complianceContent = `LEMBAR AUDIT KEPATUHAN KLAIM BPOM RI & KODE ETIK APLI
Status Audit: ${project.claimsReview.overallStatus}
Ditinjau pada: ${project.claimsReview.reviewedAt}

POIN KEPATUHAN:
${project.claimsReview.claims
  .map((c, i) => `${i + 1}. [${c.status}] "${c.statement}" -> ${c.evidenceNote}`)
  .join('\n')}

DISCLAIMER HUKUM:
${project.claimsReview.medicalDisclaimersRequired.join('\n\n')}
`;
  zip.file('04_Audit_Kepatuhan_BPOM_dan_APLI.txt', complianceContent);

  // 5. Python Automation Script (The requested Agent Auto-Paste & Downloader Bot)
  const pythonScript = generateLocalPythonBotScript(project);
  zip.file('05_BOT_OTOMATIS_FLOW_LOKAL.py', pythonScript);

  // 6. Readme
  const readmeContent = `CARA MENGGUNAKAN PAKET INI DI KOMPUTER LOKAL:
1. File '01_Naskah_Voiceover_Indonesia.txt': Naskah siap rekam atau input ke Text-to-Speech.
2. File '02_Prompt_Google_Flow_Adegan_1_sampai_5.txt': Kumpulan prompt yang siap ditempelkan ke Google Flow.
3. File '05_BOT_OTOMATIS_FLOW_LOKAL.py': Skrip robot python yang otomatis membuka browser lokal Anda, menempelkan prompt ke Google Flow, dan mengunduh video klipnya ke folder lokal!
   Cara menjalankan bot:
   - Buka terminal / command prompt di folder ini
   - Jalankan: pip install playwright && playwright install
   - Jalankan: python 05_BOT_OTOMATIS_FLOW_LOKAL.py
`;
  zip.file('README_CARA_PAKAI.txt', readmeContent);

  // Generate ZIP and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `4LIFE-PAKET-PRODUKSI-${project.id}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
