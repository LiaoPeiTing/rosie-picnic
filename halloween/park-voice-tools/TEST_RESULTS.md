# Park工具測試紀錄｜2026-10-25

- 只準備9句品質試音與剩餘26批次，真實TTS生成0；尚未在Colab GPU實際推論本次台詞，不宣稱品質已接受。
- 角色/原文/固定lineId/assetId/events來源為固定catalog，35新句+Library共用1；Rosie/Pirate主參考及ref_text/hash核對。
- 原生Qwen Base clone，Rosie qwen_rosie_r2、Pirate pirate_A_captain；Kokoro固定af_nicole/am_onyx，無pitch/後製變速。主參考皆私人輸入；Pirate clone_test僅比較。
- 輸入ZIP實際解壓dry-run9/generated0通過；工具SHA核對、模型鎖/參考/共用WAV驗證，三Notebook AST通過。trial9/remaining26預設False；CPU恢復無GPU metadata。
- 以測試factory/暫存WAV驗證9+26恰35次呼叫、九句未accepted不允許26、無all35旁路、resume不重生、最終36WAV、原九句及共用音hash不變、10鎖定音不可改驗收。
- 真實ipywidgets構造測試9播放器/9選項與備註，autosave、重新執行還原、JSON載入備註不丟、ZIP下載通過；Colab I/O在本機mock，未宣稱已操作使用者Colab。
- 模擬第三句中斷：完成2可匯出partial ZIP，恢復後只生成缺7，原accepted備註保留。
- 所有假音僅TemporaryDirectory測試，已移除，不當成交付試音。
- Bakery53及Library30全部SHA再驗不變；正式遊戲/既有穩定頁未改。僅新增park-voice-tools公開工具頁，私人WAV/輸入ZIP不公開。
