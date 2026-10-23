# 同步整合方案

- 以固定lineId對應音檔、角色及事件，保留Narrator、AudioManager、PlaybackController與四音量。
- 實際音檔開始才切字幕、啟動該角色嘴型、降低背景音樂；結束或取消就停止嘴型。
- 目前是RMS音量與說話狀態嘴型，並非精準音素同步。表情/動作沿用既有劇情順序，不改先說後動的教學流程。
- 數糖果沿用原落盒時鐘與固定數字ID；Pause暫停時鐘及AudioContext，重播/跳過/返回/End取消舊generation防止過期回呼。
- 匯入檢查engine雜湊、角色聲線、英文原文、主參考及音檔SHA256；缺檔提示並可字幕繼續。
- 未來精準音素另建alignment JSON：lineId、audioSha256、duration、phonemes[{start,end,symbol,viseme}]、events[{at,type,target}]；檢查時序與音檔版本。目前visemes空白，不宣稱已對齊。
- 桌面及390px觸控模擬基本播放已測，仍需完整錄音、iOS Safari/Android Chrome實機與人工聽感驗收。
