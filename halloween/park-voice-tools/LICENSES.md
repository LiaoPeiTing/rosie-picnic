# Park 模型、參考音、費用與使用範圍
- Qwen3-TTS Base/Tokenizer：model-lock.json固定revision，Apache-2.0；官方 https://github.com/QwenLM/Qwen3-TTS 。
- Kokoro-82M：同一模型鎖，Apache-2.0；官方 https://github.com/hexgrad/kokoro 。交付不含模型權重，散布模型時保留授權及通知。
- Rosie主參考為先前核准AI合成音；Pirate主參考及clone_test由家長提供並核准用途。主參考身份/hash/ref_text固定；clone_test不得用作主參考。上游來源/散布權未另行獨立稽核，參考ZIP保持私人本機/家長Colab上傳，不公開WAV參考。
- Mermaid af_nicole、Vampire ring am_onyx為已核准Kokoro固定聲線。不模仿新真人，不錄孩子聲音，不pitch假童聲。
- Library共用Are you happy?為已核准生成音，保持原WAV/hash，不再生成。
- 本階段不新增音樂/音效資產；無付費API/訂閱。生成需免費Colab T4及數GB模型下載；供應/時數不保證。CPU試聽恢復無模型或GPU需求。
