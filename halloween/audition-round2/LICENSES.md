# 第二輪來源與授權

- [Qwen3-TTS官方模型與程式](https://github.com/QwenLM/Qwen3-TTS)：Apache-2.0。
- [VoiceDesign模型卡](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign)：Apache-2.0，用文字描述原創聲線。
- [Base模型卡](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base)：Apache-2.0，參考我們自己剛生成的AI音檔，未使用真人或孩子聲音。
- 本輪使用[官方開放模型免費Space](https://huggingface.co/spaces/Qwen/Qwen3-TTS)；已讀其app.py確認載入開放模型及使用Spaces GPU。未採用另個連到DashScope商業API的Voice-Design Space。
- 網站只託管實際合成WAV與說明，不依賴雲端推論來播放，不發布模型權重。不新增音效或配樂。
- 第一輪比較音檔來源及授權見[第一輪授權清單](../audition/LICENSES.md)。
- 本輪不模仿指定真人；年齡描述為虛構角色的聲音目標，不宣稱任何真實兒童參與配音。
- 公開服務未提供runtime commit與seed，無法證明與查核當時HF main revision完全一致，已在manifest標明；不把重跑誤稱為逐位元相同。
