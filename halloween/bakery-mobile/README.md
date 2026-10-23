# Bakery 手機修復獨立測試版｜2026-10-23

## 桌面穩定版
家長親自試玩後標記「桌面版初步驗收通過」。原HTML與53段WAV已逐檔保存，見bakery-desktop-stable/ACCEPTANCE.json；本機另存bakery-desktop-stable-20261023.zip。手機另開bakery-mobile，不回寫桌面穩定版或正式遊戲。

## 手機修復
- 在真實Start/Resume/重試點擊的同步處理中呼叫AudioContext.resume並啟動短靜音buffer，不等下載或解碼後才解鎖。支援時設定navigator.audioSession.type=playback；所有API均先檢測。
- 增加「啟用聲音」「聲音測試」、中斷後自動暫停、重新啟用/續播、簡短手機錯誤與完整配音狀態。缺檔/不支援音訊明示，不使用瀏覽器TTS冒充。
- 直式角色場景、選項、字幕及按鈕依序排列；橫式分左右欄。回答選項移出角色場景，More展開在正常排版流內；保留安全區、捲動及44px主要操作按鈕。
- 修正Ghost內部SVG原固定240px高度造成小螢幕裁切，統一跟隨角色容器尺寸；不更換角色美術。
- 53段WAV直接引用原獨立測試頁同份音檔，包含兩候選1；檔名/字幕/lineId/聲線/檔案雜湊未改。保留BGM ducking、RMS嘴型、重播/暫停/四音量。

## 已做測試與限制
- Chromium/Edge嚴格user-gesture-required政策、390×844觸控操作：Start前不建立AudioContext，點擊同步resume/start記錄userActivation=true；完整Bakery故事含正確/錯誤/提示/數糖果/盒子/貼紙/道別，方向切換及重播/暫停/End/home。
- Google Chrome桌面觸控模擬：503失敗顯示錯誤、啟用聲音後重試成功；外部suspend觸發暫停/關嘴、點啟用聲音恢復；四音量控制可用，沒有TTS呼叫。
- Chrome與WebKit各測320×568、390×844、430×932直式及844×390、667×375橫式，餅乾/糖果/盒子/獎勵/道別場景檢查無水平溢出；角色及SVG在場景範圍內，選項不與場景或控制區重疊。
- **這不是iPhone或Android實機驗收。Windows Playwright WebKit沒有AudioContext/webkitAudioContext，因此WebKit只驗排版及明確不支援訊息，不能宣稱Safari配音已實測正常。** 模擬環境也無法確認靜音開關、藍牙或實體喇叭輸出。需要家長用真實手機Chrome/Safari試玩新網址。
- 嘴型仍是RMS/畫格同步，不是音素級。未生成新聲音，正式遊戲未修改，未進其他關卡配音。

## 手機實機試玩
1. 用手機系統Chrome或Safari開新網址，按Start our story，確認聽到Rosie。
2. 若無聲，按啟用聲音與聲音測試，確認媒體音量/靜音模式/藍牙；配音狀態可看具體錯誤。
3. 測直式/橫式、答對與答錯、暫停/Resume、Replay與音量。背景返回後按啟用聲音或Resume。
4. 完成餅乾、糖果與派對盒，確認獎勵貼紙；回報手機型號/系統/瀏覽器與卡住的畫面。

技術依據：https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices 。採用使用者操作觸發音訊，不繞過自動播放政策。測試報告見mobile-*-report.json。
