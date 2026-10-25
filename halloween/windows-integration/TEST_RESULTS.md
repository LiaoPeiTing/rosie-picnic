# Windows三關整合測試｜Park26待生成｜2026-10-25

## 狀態與保護
- Bakery53/53、Library30/30、Park10/36（9核准+Library共用1）；不同核准WAV共92，缺26，只屬於Park。沒有靜音假音檔或瀏覽器TTS補音。
- 92原音copy前後SHA一致。Park九句及原park-remaining26-inputs.zip保留；輸入ZIP SHA見audio-status.json。等待免費Colab GPU，不換聲線、不執行新TTS。
- audio-status.json內含26固定lineId/assetId/英文/角色/聲線/動畫及互動events；來源engine與固定catalog不變。gold舊節點仍對應vampire ring，未改ID。
- 原Bakery/Library獨立穩定頁、正式/halloween/、83原音及舊回復tag/363檔快照不變。

## 已實測（Windows Playwright實際Chrome/Edge瀏覽器）
|項目|結果|
|---|---|
|Chrome三關全流程|Bakery→Library→Park→三貼紙→返回選單，screen complete皆通過，無pageerror|
|正答/錯答/hint|Bakery餅乾/糖果/派對盒；Library角色/書/Stephanie Says；Park四個找物關卡，皆可繼續|
|Park缺音26|26個固定ID都遇到提示，需家長逐句按「以字幕繼續測試」；mixed node跳過缺音第一句後Mermaid核准Hi仍播放|
|原音播放與校驗|流程實際播放68種核准asset；Edge另外92全部fetch/SHA/AudioBuffer解碼通過|
|TTS|兩瀏覽器測試speechSynthesis.speak呼叫0|
|嘴型|Rosie/Ghost/Princess/Pirate/Mermaid/ring依語音啟停；缺音嘴型0；修正Vampire ring含空白角色名稱導致classList錯誤，僅作用本整合版|
|Pause/Resume/Replay|Edge三關均測；Park缺音第二句pause/resume後ID/字幕仍一致，無嘴型/duck假播放|
|切關及返回|返回三關選單會取消語音/計時/動作；缺音Park→Library不殘留提示；Edge快速切三關通過|
|BGM/音量|每場景2個自製合成音樂/環境source；voice開始duck，結束恢復；缺音duck false，4項原音量控制及獨立storage key保留|
|貼紙|同一測試版三關collected合併3/3，以新namespace保存，不動既有穩定版存檔|
|桌面排版|Chrome1440×1080、Edge1366×768無橫向溢出，首頁decor固定到home區域，長頁可捲動|

全故事回歸用真實核准WAV，測試中注入playbackRate8、timeline clock4、部分acting手動elapsed縮時；不進交付程式。Edge原速三關Start/暫停/重播/切換另測。這是整合準備測試，不是完整原速人工驗收或全配音正式完成。

## 後續
26句待GPU生成並人工接受後，使用同一固定ID補入；匯入驗收介面要求Park36的manifest+voice-review全accepted，保留92核准hash，不允覆蓋原音。匯入僅本次記憶體，不自動發布。正式入口需家長確認才能修改。
手機動畫不在本輪驗收範圍。保留10/30 Windows目標，但免費GPU可用時間尚未知。
