# Rosie’s Halloween · Kokoro 聲線試音室

本頁是隔離試音，不會修改 `../narration.js`、`../audio-manager.js`、正式 manifest、故事、美術、操作或音量設定。確認前不批量製作正式台詞。

## 怎麼選聲

1. 選六位角色之一，每位有三句不同情境／情緒方向。
2. 每句左右為第一候選／備選，使用相同原文、原速、無變調、無配樂。可隨時暫停；播放另一段會先停止原段。
3. 選喜歡的聲線並按「確認此角色選擇」。不滿意可選「兩個都不喜歡」。
4. 六位選完，按「下載選聲結果」，將 JSON 或六個聲線名稱回傳給 Codex。

喜好只存目前瀏覽器，不上傳、不自動修改正式遊戲。手機與電腦各自儲存，不會自動同步。

## 角色候選

| 角色 | 第一候選 | 備選 | 目標聽感，尚待人工核定 |
|---|---|---|---|
| Rosie | af_heart | af_sky | 甜美活潑、童趣女孩感 |
| Ghost | am_puck | am_echo | 頑皮活潑、男孩感 |
| Princess | af_bella | af_jessica | 溫柔優雅、親切大姊姊 |
| Pirate | am_fenrir | am_adam | 低沉略沙啞、老船長 |
| Mermaid | af_sarah | af_nicole | 成熟知性、柔美 |
| Vampire ring | am_onyx | am_michael | 低沉磁性、神祕而不驚嚇 |

12 個聲線皆由官方 VOICES.md 及固定模型 revision 的檔案清單核對。這些是原生聲線，並非兒童模型；Kokoro 沒有可靠的指定情緒／年齡保證，頁面標示的是試聽方向，不能只憑名稱宣稱童聲或角色已達標。官方也提示短句可能較弱，請注意漏字、字尾與自然度。

台詞原文見 script.json，ID 固定，不因切換聲線改變。Mermaid 原本只有一句、ring 兩句，額外三句均標為 audition-only；不放入正式劇情。其餘原句與原遊戲逐字相同。

## 本機免費生成環境

- 本次使用 Windows x64、Python 3.12、Kokoro 0.9.4、CPU 4 執行緒；不需要 GPU、API 金鑰或訂閱。
- 初次安裝／模型下載需要網路，之後模型及聲線快取可供重跑。建議至少 8GB RAM、預留 3GB 磁碟空間；這是保守建議，非最低官方規格。
- 模型／套件／本機推論費用為 $0，仍使用自己的網路、電力及硬碟。瀏覽器只下載靜態 WAV，不在手機執行模型。
- 24kHz、mono PCM16 WAV；沒有變調、加速、降噪、混響或情緒濾鏡。只有峰值超過 .98 時降低整段增益，避免轉 PCM 時削波；實際 gain 記錄於 manifest。
- 模型固定 `hexgrad/Kokoro-82M` revision，見 model-lock.json；模型、config、聲線與輸出 SHA256 均記錄，可稽核來源與重跑。CPU浮點差異可能讓不同機器輸出位元不完全相同。

## Windows 重跑步驟

已生成試音可直接在網站播放，不需要你安裝任何程式。以下僅供需要自行重製時使用。

1. 安裝官方 Python 3.12 x64，將 `halloween/audition/` 整個資料夾下載到本機。
2. 在該資料夾開 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\setup.ps1 -Python 'C:\你的Python路徑\python.exe'
.\.venv\Scripts\python.exe .\tools\generate.py --candidate both
```

`setup.ps1` 只建立這個試音資料夾內的 .venv，不改系統 Python；eSpeak DLL 由套件提供，不需安裝系統 MSI。若路徑／空間不足或下載中斷，先修正後重跑；程式會驗證已存在的 WAV hash 並略過，絕不寫入正式遊戲的音檔目錄。

只重製一位或先試一段：

```powershell
.\.venv\Scripts\python.exe .\tools\generate.py --role rosie --candidate primary --limit 1
```

`--limit` 計算新生成的段數；已驗證檔案會跳過。`--force` 才覆蓋同名試音。腳本只處理 script.json 的 18 句，每句兩種候選，不會掃描並批量生成全遊戲。

預覽可執行 `python -m http.server 4186` 再開 localhost:4186；不要直接用 file://，因為瀏覽器需要讀取 manifest.json。發布只包含頁面、WAV、manifest、腳本和授權說明，不發布 .venv、.cache 或模型權重。

## 正式整合的下一步（本輪不執行）

人工核定六聲線後，另外建立正式 `lineId → assetId → voiceId → animation events` 對照，保留來源節點、情緒和版本。不能僅以全文字串查找正式錄音。

若需要精準嘴型，需對每段正式錄音建立 word/phoneme 起訖時間、viseme 對應表及手工修正紀錄。manifest 中的 phonemes 目前只是 G2P 文字，沒有時間對齊，不能當精準對嘴。既有 RMS 能量動畫也只能稱為音量驅動嘴型。

正式整合仍需驗收 ducking、嘴型起停、暫停、Replay、跳關、返回與 iPhone/Android 實機。此次完成試音後停止，等待選聲。

## 實際生成與測試記錄

- 已實際生成18段首選＋18段備選，PCM16／24kHz／mono，36個不同的SHA256，總85.85秒／4,122,384 bytes。
- 模型權重SHA256與官方模型卡一致：496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4。
- 全部音檔非靜音、無削波；36段gain均為1，沒有施加音量處理。首次推論各段計時合計約75.69秒，不含環境安裝／下載／載入；不能當所有電腦速度保證。
- 完整快取後以HF_HUB_OFFLINE=1重跑成功，36段hash驗證後略過，證明不需付費推論或每次下載模型。
- Edge桌面1440×1000與390×844觸控模擬各播放36段；單一播放、切角色停止、六角色儲存、下載JSON與重整保存均通過，JS／404／水平溢出0。
- 這些是客觀技術檢查，不是人工音質或發音驗收；六聲線喜好、幼兒適合度與iPhone／Android實機仍待試聽。
