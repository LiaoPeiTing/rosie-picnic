# 修正版53段測試版｜2026-10-23

已載入家長提供selected_53_fce34328.zip，不需再次生成或手動匯入。

- ZIP內53個WAV與generated-manifest.json完整、均可解碼、每檔SHA256符合manifest。
- 兩句修正的選擇紀錄及retake欄位均為候選1；未取得獨立候選包，因此候選版本以家長確認及修正版內的選擇/追溯紀錄核對。
- 與下載資料夾原始bakery-generated-review (2).zip（及(3)同manifest）逐檔比較，51個WAV位元組、SHA256及asset紀錄完全不變，僅指定兩句音檔不同。repair-selection的原manifest雜湊亦吻合。
- 檔名、assetId、角色、核准聲線ID、主參考雜湊、逐字英文與全部lineIds符合原引擎清單。遊戲事件與故事順序未改。
- 桌面1440×1000及390×844觸控模擬各完整關卡，31次實際配音（含兩修正版、hint、答錯、replay及數糖果）、字幕/嘴型class、BGM ducking、答對/答錯音效事件、pause時計凍結/續播、回首頁、End停止均通過；53檔全部以AudioContext解碼成功，JS/HTTP錯誤0，無水平溢出。
- 嘴型是RMS音量動畫，不是音素級對齊；本次客觀驗證不是人工逐句聽感評價。仍待家長手機實機、發音、音色及整體體驗驗收，未宣稱iOS Safari/Android實機已測。
- WAV分檔隨需載入，HTML約0.5MB，不把53段音訊全塞入首次畫面。保留四音量與原有自製音樂/音效。
- 正式遊戲未修改、未生成新音檔、未批量生成其他關卡。原始Ghost/Rosie參考音不另公開。本頁僅含家長提供並要求於獨立測試網址驗收的生成成品。
