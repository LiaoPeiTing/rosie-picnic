# 第二輪試音：Rosie 新方向可試聽，Ghost／Pirate 尚缺音檔

## 你的聲線要求

- Rosie：5～6歲小女孩，可愛、甜美、活潑。
- Ghost：5～6歲小男孩，頑皮、淘氣、活潑。
- Pirate：更低沉、明顯沙啞、有老船長感。
- Princess af_bella、Mermaid af_nicole、Vampire ring am_onyx 保留第一輪已選結果。

## 實際完成與缺漏

Rosie 已實際產生3段新試音，以 Qwen3-TTS VoiceDesign 先產生原創 AI 聲線，再由 Base 模型參考這段 AI 音檔生成其餘兩句。不輸入任何真人或孩子錄音；沒有變調、加速或額外聲音效果。頁面同時提供上輪未選定的 af_heart 作同句比較。

**Ghost 3段、Pirate 3段新試音尚未生成。**官方免費開放模型服務在 Ghost 請求時回傳 error:null，有限重試一次仍相同，未提供具體原因，不能斷言是額度或GPU問題；沒有繞過限制、改用付費API或冒充完成。兩位目前只有上一輪比較音檔，新候選不能選。

年齡與音色只是生成目標，不代表已達到5～6歲聽感。新聲線尚未人工核定；此輪不是正式遊戲配音，沒有整合嘴型。公開服務未回報模型精確runtime revision，manifest誠實標為unreported，不能稱為位元級可重製。每個實際WAV保存SHA256及來源，原始AI參考音固定保留。

## 如何使用

直接雙擊index.html，或開GitHub Pages第二輪試音頁。選Rosie，播放「第二輪新聲線」並與「上一輪聲線」比較；可選喜歡的聲線或兩個都不喜歡，下載結果回傳。原本三位已選定角色不會被這頁重設，正式遊戲也不會被修改。

## 免費生成方式

`tools/generate.py` 使用 Python、numpy、soundfile 與標準urllib，呼叫官方開放模型 Space 的公開試音端點：

```powershell
& '你的Python路徑\python.exe' .\tools\generate.py
```

需要同層原試音目錄 `../audition/` 作原台詞與比較音源。它會略過已生成檔案，發生錯誤就停止，不做無限重試。已產生的參考路徑屬官方服務暫存，若日後失效，需要重新上傳我們自己的AI參考音，不能改用真人樣本。免費服務的可用性與額度不保證；本次費用0，沒有API金鑰或訂閱。

目前本機16GB RAM、可用約4GB，不適合直接宣稱1.7B模型已在本機驗證。若要完全不依賴展示服務，下一步是依[官方安裝方式](https://github.com/QwenLM/Qwen3-TTS)另建獨立Python環境，安裝qwen-tts與CPU/GPU PyTorch，下載官方VoiceDesign與Base模型，使用generate_voice_design／generate_voice_clone；需另驗證實際記憶體與速度。**本輪尚未安裝或執行本機Qwen，不宣稱此方案已通過Windows實測。**既有Kokoro環境維持不變。

## 技術查核

Rosie新檔皆24000Hz單聲道，長度約2.70／2.07／2.31秒，非靜音。服務WAV各有1個全幅peak樣本，沒有連續平頂，沒有再對聲音處理；音質、字句和聲線穩定性仍需人工聽。音量起伏不能當作精準音素時間對齊。
