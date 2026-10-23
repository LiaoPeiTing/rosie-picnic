# Halloween Library 六句Colab試音

本次僅六句：Rosie/qwen_rosie_r2三句、Princess/Kokoro af_bella三句。使用與Bakery相同的核准Rosie參考原檔及逐字稿「Welcome to the Halloween Bakery!」，已在輸入ZIP內，不需重新選角。本階段尚未生成任何配音。

## 現在只做至dry-run
1. 開啟Library_Trial6_Colab.ipynb，選免費T4 GPU。新執行階段先跑安裝格；同一個已成功安裝的Bakery執行階段可跳過安裝。
2. 上傳本機library-trial6-inputs.zip。這是私人輸入包，勿公開分享。
3. 執行「六句dry-run清單」，確認角色、聲線、固定ID、英文，將清單回傳確認，**先停在此格**。

## 之後確認才生成
家長確認六句清單後，再將RUN_GENERATION=True及CONFIRMATION='CONFIRM_LIBRARY_SIX'，執行生成格。缺任一條件不推論；執行整本的預設仍為False/空白，不會自動產音。

Qwen依核准主參考複製Rosie，不使用新VoiceDesign或pitch/speed處理。Rosie三句完成後釋放模型，再以CPU載入Kokoro af_bella做Princess三句，避免同時占用GPU。免費GPU不可用會停止，不轉付費API。模型revision與參考hash固定，Kokoro聲線張量hash記入輸出。

## 六句原文
Rosie：
- Welcome to the Halloween Library!
- A crown. Crown.
- A crown. A pink dress. Who is it?

Princess：
- Hello, Stephanie!
- Where is my book? My book has a crown.
- I found my book! Thank you, Stephanie!

固定ID與原動畫事件保存於manifest.json及輸出generated-manifest.json；不修改字幕或事件。本試音頁只播放人聲，事件欄保留給未來整合，不宣稱現在已與Library動畫串接。

## 生成後試聽與驗收
執行最後一格，先播放核准Rosie主參考，再逐句播放成品，每句標「尚未驗收／接受／需要重錄」並填備註。下載ZIP含完成的WAV、generated-manifest.json、voice-review.json、review.html。解壓縮後保留audio資料夾，開review.html即可逐句試聽。未選的一律pending，productionApproved始終False，不自動套用正式遊戲。

如中斷可下載已完成部分；同一執行階段重跑會略過hash吻合的完成句。新執行階段不自動還原結果，請保存下載檔。沒有Library24句、Park或全劇開關；輸出另存library_trial6_output，禁止混用Bakery或非本次輸出。

## 測試界線與聲線品質
已完成Notebook語法、ZIP結構/參考雜湊、真實dry-run、六句範圍/聲線/確認碼防護，以及假模型六次呼叫/恢復檢查。假模型音僅臨時單元測試fixture，已刪除，不是交付試音。本次未在Colab GPU實際執行Qwen/Kokoro這六句，不宣稱已生成或音質已驗收。

Rosie需自然活潑甜美、保留女孩感，Princess需溫柔優雅親切；Kokoro與Qwen Base不保證指定年齡或精準情緒，必須人工聽感確認，不符合再指定ID修正。Bakery53段、穩定頁及正式遊戲完全不改。

模型/參考授權見LICENSES.md與model-lock.json；沿用免費Apache-2.0模型與既有來源限制。沒有付費API、不開麥克風。
