# Library四句指定修正｜每句3候選

原六句ZIP已逐檔核對，與家長回傳voice-review.json相同。兩句已接受Rosie音檔固定SHA256：
- Welcome to the Halloween Library!：efd8173f8f95889f014ea06cf37a6b2fc24e4903fe1f4c735060bf1c5f9af7a1
- A crown. A pink dress. Who is it?：e5e5d6da05a9b157243f6ce45843956e6cd26e85b76de4c1e4058ca7512e79a8

## 使用方式
1. 開啟Library_Retakes4_Colab.ipynb，新執行階段選免費T4並執行安裝；原成功Library環境可跳過安裝。
2. 上傳library-retakes4-inputs.zip，包含這次原六句、驗收紀錄、原核准Rosie參考與生成程式，不需重新選角或另找原音。
3. 執行四句dry-run，再將RUN_RETAKES=True執行候選生成格。只做12個候選，另存帶時間/批次碼資料夾。原六句唯讀，兩接受句不生成。
4. 執行比較格，逐句聽原音及候選1/2/3，四個下拉選單各選一版；未選不會匯出或覆蓋。可先按只下載候選，不必勉強接受。
5. 選定後匯出新六句副本ZIP，兩接受句WAV與asset紀錄逐字不變；其餘四句更新hash/長度與候選紀錄，原檔名、ID、英文、角色、字幕及事件保留。另存repair-selection.json與更新的voice-review.json。原音資料夾不會覆蓋。

## 候選策略
Rosie僅A crown. Crown.使用原qwen_rosie_r2核准參考與逐字稿，生成三個不同seed結果，不改pitch、語速或英文。
Princess維持Kokoro af_bella，不換聲線：
- 候選1：整句原文，生成speed 0.92，自然標點停頓。
- 候選2：生成speed 0.86，按原句尾切分，增加0.28秒句間停頓。
- 候選3：生成speed 0.82，原句尾增加0.45秒，逗點增加0.18秒停頓。

切分後所有片段重接必須逐字等於原句；沒有重寫標點/單字。使用Kokoro原生speed參數，不是事後降pitch或拉伸音檔；額外空白停頓與片段位置寫入retakeSettings。切句可能改變語調或顯得不連貫，請逐句挑自然版本，沒有自動保證溫柔感。若都不喜歡可不選，再生成獨立新批次，不擅換聲線。

## 驗證及界線
四項本機測試通過：來源與dry-run12候選、英文切分保真、假模型僅12候選/選定後只改四句/兩接受WAV及紀錄不變/原六句唯讀、Notebook語法。假模型音僅臨時fixture已刪，不是實際試音。本次未在Colab GPU真正產生或聽12候選，品質仍待家長驗收。生成失敗時已完成候選留在批次資料夾，可由Colab檔案側欄下載。

清除被替換句的舊visemes，後續遊戲整合需重新驗收時間；不宣稱精準音素同步。Bakery53、Library其餘24、Park及正式遊戲未改。模型與來源授權沿用LICENSES.md；私人參考及原音包不上傳公開repo，只有家長自己上傳到Colab。
