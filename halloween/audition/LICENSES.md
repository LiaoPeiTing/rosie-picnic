# 模型、套件與素材來源（2026-10-20 查核）

## 這次發布的內容

- 試音 WAV：使用既有遊戲台詞與三句專為試音撰寫的句子，在使用者電腦由官方 Kokoro-82M v1.0 原生聲線生成。不使用孩子錄音、參考真人聲音、聲音複製或第三方樣音。不是錄下官方網站展示音檔。
- 不加入背景音樂、取樣、音效。正式遊戲原有的原創合成音樂不改動。
- 模型本體及聲線 embedding 不上傳 GitHub Pages；網站只託管合成 WAV 與必要文件。

## 查核來源

| 項目 | 官方來源／授權 | 本次用途 |
|---|---|---|
| Kokoro-82M v1.0 權重、voices | [官方模型卡](https://huggingface.co/hexgrad/Kokoro-82M)，metadata 標 Apache-2.0，模型卡允許部署；固定 revision 見 model-lock.json | 本機推論；12個美式聲線 |
| Kokoro 推論程式 | [hexgrad/kokoro](https://github.com/hexgrad/kokoro)，Apache-2.0 | 本機執行 |
| Misaki 英文 G2P | [hexgrad/misaki](https://github.com/hexgrad/misaki)，Apache-2.0 | 字句轉音素 |
| eSpeak NG | [原始碼與 COPYING](https://github.com/espeak-ng/espeak-ng)，GPL-3.0-or-later；phonemizer-fork metadata GPLv3 | 本機英文少見字發音後備；不把 DLL 發布到網站 |
| espeakng-loader | [官方專案](https://github.com/thewh1teagle/espeakng-loader)，loader MIT；內附 eSpeak 仍依其 GPL | 在 Windows 指定 DLL 與資料路徑 |
| PyTorch | [授權](https://github.com/pytorch/pytorch/blob/main/LICENSE)，BSD-style 與組成元件授權 | 本機 CPU 推論 |
| Transformers | [授權](https://github.com/huggingface/transformers/blob/main/LICENSE)，Apache-2.0 | 本機模型執行 |
| spaCy / en_core_web_sm | [spaCy](https://github.com/explosion/spaCy)／[英文模型卡](https://huggingface.co/spacy/en_core_web_sm)，MIT | 英文詞性與發音處理 |
| SoundFile / libsndfile | [SoundFile](https://github.com/bastibe/python-soundfile)，BSD-3-Clause；內含 libsndfile LGPL-2.1 | 本機輸出 WAV |

實際版本及套件回報授權存於 licenses/package-metadata.json、tools/requirements-lock.txt。完整 Apache 2.0、模型卡、聲線清單保存於 licenses/，模型卡內原有訓練資料與 CC BY 歸屬一併保留。此次僅使用美式英文聲線；不使用另列 CC BY 音源的日語／法語聲線。

查核依據是官方開放權重標示與模型作者公開用途說明，未把開放權重宣稱為對所有聲音人格權的額外保證。只使用官方匿名通用聲線，不指定或暗示模仿任何真人。

合成音檔沒有另接付費 API 或訂閱條件。本試音頁不進行付費雲端推論，也不含模型金鑰。發布範圍不包含第三方套件二進位；若日後另行散布安裝包／模型權重，須保留相應授權與 notices，不能直接把本頁的 WAV 發布方式套用到二進位散布。
