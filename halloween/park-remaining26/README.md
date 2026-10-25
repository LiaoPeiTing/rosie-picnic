# Park 剩餘26段｜內附已接受九句的鎖定版

1. 開Park_Remaining26_Locked9_Colab.ipynb，使用免費T4 GPU。
2. 第1格安裝；第2格只上傳新park-remaining26-inputs.zip。已內含九句accepted完整WAV/manifest/review及SHA鎖、Rosie/Pirate核准參考與逐字稿、Library共用音、固定catalog/model-lock/程式。不需要另外上傳九句、不用舊park-voice-inputs.zip。
3. 第3格26句dry-run：Rosie10、Pirate16，已接受九句不在jobs。Mermaid af_nicole/ring am_onyx原音保持不變。
4. 第4格RUN_GENERATION=True、CONFIRMATION='CONFIRM_PARK_REMAINING_26'。只生成26，九句及共用1原樣copy到新輸出，SHA必須匹配本次家長已接受檔；不允用另一批九句替代。
5. 第5格驗收：完整36播放器、10段鎖定已接受、26段接受/重錄/未決定與備註。每次選擇/備註自動保存，JSON匯出/重新載入，下載完整WAV+manifest+驗收ZIP。需重錄只建立指定ID清單，不推論。
6. 若中斷，第5格可保存已完成部分；重新開GPU時第2上傳本輸入，第6上傳結果ZIP恢復OUTPUT，回第4只補未完成句。已生成WAV SHA吻合就略過，不重生。
7. 如只需試聽恢復，開Restore_Park36_Locked9_Review.ipynb（免費CPU），唯一區塊上傳結果ZIP即可，不需原WORK/runner、不下載TTS/不用GPU、不生成。可恢復部分或完整36輸出；九句/共用音鎖仍核對。

離開Colab前一定下載結果ZIP；Colab重置會清暫存。人工驗收JSON可另外保存，載入前檢查ID/角色/台詞/音檔hash，避免套到另一批音。

免費Colab可能有T4供應/時數限制；模型需數GB下載，無付費API/訂閱。Qwen Base沿原核准main參考/逐字稿，不換聲線、不pitch假童聲。LICENSES/model-lock保持原固定授權與revision，參考音私人上傳，不公開主參考WAV。實際26音質仍需生成後聽，工具測試不代表音質已接受。

此次僅工具/驗證/私人資料包，不生成26、不修改Bakery53、Library30、穩定備份或正式遊戲。10/30 Windows三關整合目標維持。
