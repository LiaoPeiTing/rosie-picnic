# Windows三關完整配音測試紀錄｜2026-10-26

## 音檔最終驗證
- 實際讀park-remaining26-reviewed-bf584d4f.zip：voice-review共36accepted/0needs-retake/0pending，沒有代填或改寫驗收紀錄。
- Park36 WAV/manifest/固定角色/聲線/原文/lineId/assetId/events、SHA/mono/finite/長度與解碼通過。九句與原核准WAV及metadata逐位元一致；Library共用原音逐位元相同。
- Bakery53、Library30、Park36，去重後118WAV；共用音以Library原檔優先，不覆寫原來源。沒有重新生成、重編碼或音效處理核准WAV。全129line contexts沿固定engine來源。

## Windows瀏覽器實際操作
- Chrome：三關完整故事，音訊原速、原動畫計時，沒有注入playbackRate/clock倍速、沒有手動跳過acting/natural。測試程式代替家長點答題與checkpoint，三關皆complete、貼紙3/3、無pageerror。
- 原速流程播放94種不同核准資產；Park36（含hint/retry）均在流程使用。其他Bakery數量/重試變體以全118校驗/解碼及既有穩定驗收保護，未宣稱原速逐一窮舉所有隨機組合。
- Edge：三關加速回歸（僅測試注入rate8/clock4/部分acting elapsed，交付程式不含），正誤答/hint/數數/派對盒/Stephanie Says/找海盜美人魚戒指船/登船/慶祝/獎勵/告別，三關皆complete。
- Edge另以原速三關Start、Pause/Resume/Replay、快速返回切章取消舊voice；118網路SHA與WebAudio decode全部通過，1366×768無橫向溢出。
- 故意阻斷Library welcome fetch：明確錯誤與重試，重試後voice/mouth皆啟動，無成人TTS；End後voice=false、mouth0、screen ended，再Back to the Party。
- duck實測music設定.30，voice期間bgm約.092，語音後約.295並持續恢復.30；voice結束duckfalse。原4音量controls及獨立儲存保留。
- Chrome/Edge speechSynthesis.speak總呼叫0，pending提示0。原核准美術與事件保留；說話動畫是錄音事件+音量驅動，並非精準音素嘴型。
- 1440×1080首頁三章可見、1366×768長頁可捲動，返回選單不殘留上一章嘴型/音訊。

## 驗收範圍
僅新增獨立windows-complete頁與新儲存namespace，不改正式/halloween/、原Bakery/Library穩定頁、昨天的waiting26頁或回復tag。不做手機裝飾動畫。本次是自動化瀏覽器功能測試，最後的家庭遊玩體驗仍待家長驗收。

## 2026-10-26 家長回饋修正
- 其他檢查家長已表示接受。本輪只改獨立Windows頁：Park ship-found/sail-away說完直接前進，順帶略過兩段中間的checkpoint-3確認停留；Replay亦連續，無改台詞/音檔/固定ID。
- Chrome原速四句實際播放：ship-found→sail-away→happy-question，無acting/checkpoint等待，量測換幕間隔358.5ms（原有自然換句間隔），非8秒動畫空等。
- Edge狀態測試一般/Replay皆連續；find-ship問答仍waiting，gold-found/Library move/Bakery candy-in仍保留原互動/動作流程。
- Bakery僅box-choices畫面移除中央scene-prop.party-box；保留Picture A/B/C三個選答卡。Chrome原速題目/錯答重試皆無大箱子，三卡均存在且可點，正答正確前進至box-delivered。其他裝糖果/送盒畫面不更動。
- 118WAV SHA再次核對不變；原穩定tag/備份/正式入口未改。
