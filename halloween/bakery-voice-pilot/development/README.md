# Bakery 正式聲線獨立測試

正式遊戲未修改。實際來源113句及原app五個數數字詞，共118個不同音檔；Bakery有59個情境、53個音檔（Rosie43、Ghost10）。完整清單見BAKERY_LINES.md及bakery-lines.csv。

目前只有3段先前核定Rosie試音，Bakery尚缺50段；沒有實際執行Colab GPU，也沒有生成全劇118句。缺音會明示，不用裝置語音替代。

## 操作
1. Colab開啟筆記本，選免費T4 GPU，依序安裝並上傳本機bakery-colab-inputs.zip。此包包含私人參考音，勿公開分享。
2. 播放參考音，先保持bakery_smoke；RUN_GENERATION=False只列6句。
3. 改RUN_GENERATION=True後執行：沿用1段核定Rosie音及新生成5段。
4. 下載輸出ZIP、解壓縮，測試頁選整個輸出資料夾，或同時選generated-manifest.json及audio內WAV。
5. 先聽這6句，確認後才填BAKERY_ONLY_53、選bakery_complete。其他關卡不生成。

同一Colab執行階段可重新執行以略過已完成且雜湊吻合的音檔；新執行階段不會自動恢復。免費GPU不保證可用，無付費API或訂閱替代。

## 固定聲線
|角色|聲線|主參考／逐字稿|
|---|---|---|
|Rosie|qwen_rosie_r2|原核定參考：Welcome to the Halloween Bakery!|
|Ghost|Qwen Base|ghost_qwen_boy_v1.wav：Hello, Stephanie! I have a surprise for you!|
|Pirate|Qwen Base|pirate_A_captain.wav：Arrr! You found me! All aboard! Let's go!|
|Princess|Kokoro af_bella|核定，本階段不生成|
|Mermaid|Kokoro af_nicole|核定，本階段不生成|
|Vampire ring|Kokoro am_onyx|核定，本階段不生成|

兩個clone_test只供比較，不作主參考。Rosie原參考音已找到，沒有擅換聲線。Bakery只有Rosie/Ghost，因此Pirate新句留待其他關卡。

ID採場景＋節點＋通道＋句序＋數量變體，例如hw.bakery.welcome.lines.01；音檔為角色__assetID__voiceID.wav。manifest保留原英文、聲線、來源及動畫事件。情緒標籤是人工驗收目標，不保證模型精準情緒。

## 驗證界線
已測固定ID、參考音雜湊、Notebook語法、模型介面契約、桌面及390px觸控瀏覽器播放/暫停/匯入/缺檔。介面單元測試用臨時假模型，不是實際Qwen生成。尚未實測Colab GPU安裝與推論、完整53句品質、iPhone/Android實機。所有新生成結果仍待家長核定，不自動修改正式遊戲。

另見LICENSES.md、AUDIO_SYNC_PLAN.md。
