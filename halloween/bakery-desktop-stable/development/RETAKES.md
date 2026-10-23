# Rosie 指定台詞重新生成

## 只修這兩句
- hw.bakery.find-cookie.hint.01：Pumpkin. Find the pumpkin cookie.
- hw.bakery.find-box.retry.01.n02：Good try. One pumpkin cookie and two candies.

使用原核准qwen_rosie_r2參考音與原逐字稿，不改英文、角色、事件。每句3候選以不同seed抽樣；不使用pitch/speed處理，不換VoiceDesign或其他聲線。Base沒有保證童聲或精準情緒控制，必須人工選較童真活潑、且發音正確的版本。

## Colab操作
開啟Rosie_Bakery_Targeted_Retakes.ipynb。
1. 若原Colab執行階段仍在，安裝格可跳過。執行「1 修正準備」，會使用原WORK參考包；新執行階段才要求上傳原bakery-colab-inputs.zip。
2. 執行「2 載入原本完整53段」。原輸出仍在就直接讀取；否則上傳你保存的完整53段輸出ZIP，不是參考包。逐檔核對SHA256，原資料唯讀。
3. 執行「3 只生成兩句」，共6段，另存/content/rosie_bakery_repairs/rosie-retakes-時間-批次碼/。不執行原本完整53段生成格。
4. 執行「4 比較」，逐句播放原音及3候選，兩個下拉選單各選一個版本。預設未選，不會自動套用。
5. 想先留存試音可按「只下載候選、不採用」。選定後按「確認選擇並匯出修正副本」：下載新53段ZIP，含更新generated-manifest.json與repair-selection.json；原51段檔案與紀錄不變，原資料完全不覆蓋。

若三候選都不喜歡，先不要選，可重跑區塊3建立新批次，再重跑區塊4。抽樣不保證每次更童真，也不保證不同seed一定產生不同音訊。Colab免費GPU中斷時已完成候選保存在批次資料夾，可透過檔案側欄下載。

## 資料與驗收界線
生成前核對主參考雜湊與逐字稿；修正版保留台詞ID/assetId/英文/角色/聲線/事件。只更新選定兩句的音檔資訊，清除舊visemes避免過時對齊。新副本供獨立測試頁匯入，仍須人工聽感與遊戲同步驗收；正式遊戲未修改。

本次已測兩句限定、6次模型介面呼叫、正確參考音/逐字稿、拒絕未選版本、原53段不變/新51段逐檔與manifest不變、指定兩句身分不變、壞檔拒絕與Notebook語法。測試以假模型及臨時測試音執行；未實際生成或試聽新候選，也未在Colab GPU執行此修正流程。

Qwen官方API：https://github.com/QwenLM/Qwen3-TTS 。模型授權沿用原LICENSES.md；輸入參考包不公開、不使用付費API、不開麥克風。
