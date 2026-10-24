# Library 30段獨立測試版｜2026-10-24

## 配音最終驗證
- 上傳ZIP CRC/完整30WAV/generated-manifest/voice-review與固定角色/字幕/lineId/assetId/events核對通過；30WAV解碼長度與SHA均通過。
- crown-on及command-1.hint均依repair-selection與retake metadata採候選2；未另提供原候選六檔，候選來源以匯出選擇紀錄核對。
- 與library30-reviewed-5c61ec94原包比較，其餘28WAV逐位元相同，Rosie qwen_rosie_r2、Princess af_bella不變。未重新生成。

## 桌面 Chrome 實際瀏覽器測試
- Start可信點擊啟動WebAudio running；原速welcome字幕與Rosie speaking啟動，pause suspended且mouth class清除、resume、replay通過。
- 完整故事：找Princess/找book各錯答、hint、正答；兩輪Stephanie Says；pages/closebook/happy/celebrate/reward/goodbye/complete，獲Library貼紙；無pageerror。
- 完整流程使用實際核准WAV，測試中音檔playbackRate=8及手動elapsed縮短動畫等待，僅測試注入，不進交付頁。含welcome30種固定lineId均實際播放；原速起播與暫停另測。
- duck觀測：music設定.30播放voice期間gain約.095，voice結束後約.292且持續回復.30；voice bus1不受duck。完成時voiceSource空、duckfalse。原四項音量controls input更動正常。
- 故意拒絕welcome音檔：明確錯誤+重試、重試後播放，speechSynthesis.speak呼叫0。無成人TTSfallback。
- End語音與嘴型停止，Back to the Party返回、Start再開始可出聲。

## 手機尺寸模擬
- Chrome touch 390×844全故事通過；選項移出world在字幕前，world/choices/dock不重疊，scrollWidth=390。
- Chrome touch 844×390橫式world+字幕雙欄不重疊，scrollWidth=844；End/返回/重新Start音訊running。
- 四動作：桌面wave/turn、手機climb/rollerblade均經答題流程進入對應move節點。
- 語音同步沿台詞播放事件與音量動畫，不宣稱精準音素嘴型。
- WebKit 844×390排版及缺AudioContext錯誤提示測試通過；Windows WebKit build無AudioContext，無法驗證Safari出聲。
- 未有實體Android/iPhone，手機Chrome及Safari實機聲音仍待家長驗收，不宣稱已完成實機驗收。

## 範圍
僅更新獨立library-voice-pilot，新增適用Library的音訊手勢解鎖/響應版面與現有合成音樂延伸；正式遊戲與Bakery53未改，Park未生成。
