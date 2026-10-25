# Park 免費Colab配音工具｜2026-10-25

## 第一次只做九句
1. 開Park_Trial9_Colab.ipynb，執行階段選免費T4 GPU。
2. 第1格安裝，第2格上傳本機提供的park-voice-inputs.zip；含Rosie/Pirate核准主參考與精確ref_text、Pirate一致性比較檔、Library共用原音、固定manifest/model-lock及程式。不用重新選角。
3. 第3格dry-run先核對9句：Rosie3/Pirate3/Mermaid1/ring2。未載入TTS模型、未生成。
4. 清單確認後第4格RUN_GENERATION=True，CONFIRMATION='CONFIRM_PARK_NINE'；只生成9句，角色按序載入。同一OUTPUT重跑只補未完成句，不覆蓋已有hash吻合的WAV。
5. 第5格逐句真實音檔播放器、接受此句/需要重錄/尚未決定、備註。自動保存voice-review.json；提供JSON匯出/載入及完整WAV+manifest+驗收ZIP。離開Colab前下載ZIP，不能只留runtime。
6. 如runtime中斷，第5格仍可保存已完成音；之後上傳同一私人input，執行第6格上傳先前結果ZIP恢復OUTPUT，再第4格補缺。絕不全部重生。

## 只恢復試聽（免費CPU）
開Restore_Park_Review.ipynb，執行唯一區塊，上傳Park結果ZIP即可恢復WAV/OUTPUT及驗收紀錄。不需WORK/runner或私人input，不下載TTS、不用GPU。相同runtime重跑保留選擇，跨runtime靠下載ZIP恢復。

## 九句全部接受後，再做剩餘26
Park_Remaining26_Colab.ipynb第1安裝、第2上傳相同input、第3上傳九句結果ZIP；檢查9個accepted及WAV hash。只要有pending/needs-retake就拒絕推論。第4格dry-run26（Rosie10/Pirate16）；第5格開關預設False，確認後CONFIRM_PARK_REMAINING_26才執行。最終36段=九句原音+26新音+Library已接受共用1，10個保留音全部鎖定。第6格驗收，另有第7格結果ZIP恢復續跑。

## 資料與範圍
英文、角色、lineId、assetId與events固定；gold舊內部ID仍保留對應vampire ring，不改成新ID。真實正式新音總共35，不提供繞過九句驗收的all35模式。
Rosie qwen_rosie_r2；Pirate pirate_A_captain；Mermaid af_nicole；Vampire ring am_onyx。不pitch假童聲、不換聲線。Rosie/Pirate用原核准main參考及逐字稿；clone_test只供人工比較。
本地只有範圍、假factory呼叫契約與真實ipywidgets驗收測試，未在Colab GPU替本次9句推論，不宣稱聲音品質已完成。情緒目標靠試聽，非Base instruct承諾。

## 費用與授權
無付費API或訂閱。免費T4有供應/時數限制，模型下載數GB，網路/時間成本依環境。CPU恢復只需numpy/soundfile/ipywidgets。模型固定revision與Apache-2.0資訊見model-lock.json/LICENSES.md。私人參考ZIP不公開；不把人工喜歡聲線宣稱為全部上游權利已獨立查證。不使用孩子麥克風。
Bakery53、Library30與穩定版不在本工具寫入範圍；正式遊戲不改。共享Are you happy?只複製核准WAV，SHA鎖定。
