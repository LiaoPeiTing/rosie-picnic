"""Auditable, Bakery-only generation. Importing/planning does not load any model."""
from pathlib import Path
import hashlib, json, random, shutil, datetime, sys

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def read(root, name):
    return json.loads((Path(root)/name).read_text(encoding='utf-8-sig'))

def plan(root, scope='bakery_smoke'):
    if scope not in ('bakery_smoke','bakery_complete'):
        raise ValueError('Only Bakery scopes are allowed; full-game generation is disabled.')
    m, jobs = read(root,'manifest.json'), read(root,'jobs.json')
    ids=jobs[scope]
    if len(ids) != (6 if scope=='bakery_smoke' else 53):
        raise ValueError('Unexpected job count; review the source/catalog first.')
    for role,c in m['characters'].items():
        ref=c.get('reference')
        if not ref: continue
        p=Path(root)/'references'/ref['file']
        if not p.is_file() or sha(p)!=ref['sha256']:
            raise ValueError(f'Missing or changed reference: {role}/{ref["file"]}')
        if ref['use']!='main' or 'clone_test' in ref['file'] or not ref['ref_text']:
            raise ValueError('Consistency-test audio cannot be used as the primary reference.')
    result=[]
    for asset_id in ids:
        a=m['assets'][asset_id]
        if a['role'] not in ('rosie','ghost') or not any(m['lines'][i]['scene']=='bakery' for i in a['lineIds']):
            raise ValueError('Non-Bakery job blocked')
        c=m['characters'][a['role']]
        if a['voiceId']!=c['voiceId']: raise ValueError('Voice identity mismatch')
        result.append(a)
    return m,result

def generate(root, output, scope='bakery_smoke', run=False, bakery_confirmation=''):
    root,output=Path(root),Path(output)
    manifest,jobs=plan(root,scope)
    print(f'{scope}: {len(jobs)} Bakery assets. No other chapter will be generated.')
    if not run:
        return {'dryRun':True,'scope':scope,'jobs':[{'assetId':a['assetId'],'role':a['role'],'text':a['text'],'voiceId':a['voiceId']} for a in jobs]}
    if scope=='bakery_complete' and bakery_confirmation!='BAKERY_ONLY_53':
        raise ValueError('After reviewing the 6-line test, set bakery_confirmation="BAKERY_ONLY_53" to generate Bakery only.')
    import numpy as np
    import soundfile as sf
    import torch
    if not torch.cuda.is_available():
        raise RuntimeError('This notebook requires a free Colab GPU. Choose Runtime → Change runtime type → T4 GPU; availability is not guaranteed. No paid fallback is used.')
    from huggingface_hub import snapshot_download
    from qwen_tts import Qwen3TTSModel
    output.mkdir(parents=True,exist_ok=True);(output/'audio').mkdir(exist_ok=True)
    lock=read(root,'model-lock.json');seeds=read(root,'seed-manifest.json')
    output_manifest=output/'generated-manifest.json'
    exported=read(output,'generated-manifest.json') if output_manifest.exists() else {
        'schemaVersion':2,'scope':'bakery-generated-review','productionApproved':False,
        'source':manifest['source'],'assets':{},'characters':manifest['characters'],
        'models':lock,'alignmentStatus':'not-aligned; RMS mouth is not phoneme alignment'}
    if exported.get('models')!=lock or exported.get('characters')!=manifest['characters']:
        raise ValueError('Resumed model or reference configuration differs.')
    if exported['source']['sha256']!=manifest['source']['sha256']:
        raise ValueError('Do not resume outputs generated against another engine revision.')
    model=None;prompts={}
    def load_qwen():
        nonlocal model
        if model is None:
            spec=lock['Qwen/Qwen3-TTS-12Hz-1.7B-Base']
            location=snapshot_download(spec['repo'],revision=spec['revision'],token=False)
            model=Qwen3TTSModel.from_pretrained(location,device_map='cuda:0',dtype=(torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16),attn_implementation='sdpa')
        return model
    def clone(character,text):
        q=load_qwen();role=character['id'];ref=character['reference']
        if role not in prompts:
            prompts[role]=q.create_voice_clone_prompt(ref_audio=str(root/'references'/ref['file']),ref_text=ref['ref_text'],x_vector_only_mode=False)
        wavs,sr=q.generate_voice_clone(text=text,language='English',voice_clone_prompt=prompts[role],non_streaming_mode=True,max_new_tokens=2048)
        return np.asarray(wavs[0],dtype=np.float32),sr
    for index,a in enumerate(jobs):
        destination=output/a['src'];prior=exported['assets'].get(a['assetId'])
        if prior and destination.exists() and sha(destination)==prior['sha256'] and prior['voiceId']==a['voiceId'] and prior['text']==a['text']:
            print('KEEP',a['filename']);continue
        seed=seeds.get(a['assetId']);seed_path=root/'approved-seeds'/a['filename']
        rng_seed=int(hashlib.sha256(a['assetId'].encode()).hexdigest()[:8],16)
        random.seed(rng_seed);np.random.seed(rng_seed);torch.manual_seed(rng_seed);torch.cuda.manual_seed_all(rng_seed)
        backend='approved-audition-seed'
        if seed and seed_path.exists() and sha(seed_path)==seed['sha256']:
            shutil.copyfile(seed_path,destination);samples,sr=sf.read(destination);gain=1.
        else:
            character=manifest['characters'][a['role']]
            if character['backend']!='qwen-base':raise ValueError('This phase only runs the Rosie/Ghost Bakery jobs. Kokoro roles are reserved for later approved chapters.')
            samples,sr=clone(character,a['text']);backend='qwen-base';peak=float(np.max(np.abs(samples)))
            if not np.isfinite(samples).all() or len(samples)/sr<.12 or np.sqrt(np.mean(samples**2))<.001:raise ValueError('Invalid or silent generated audio')
            gain=min(1.,.98/max(peak,1e-9));sf.write(destination,samples*gain,sr,subtype='PCM_16')
        exported['assets'][a['assetId']]={**a,'status':'generated','review':'pending-in-game-quality-review','sha256':sha(destination),
            'sampleRate':sr,'duration':len(samples)/sr,'generationBackend':backend,'seed':rng_seed,'gain':gain,
            'referenceSha256':manifest['characters'][a['role']]['reference']['sha256'],
            'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'visemes':[]}
        output_manifest.write_text(json.dumps(exported,ensure_ascii=False,indent=2),encoding='utf-8')
        print(f'{index+1}/{len(jobs)}',a['filename'],round(len(samples)/sr,2),'s')
    return exported

# Future chapters retain these fixed Kokoro voices. This helper is never selected by
# the Bakery job planner; no Princess/Mermaid/ring recordings are made this phase.
def kokoro_fixed_voice(character,text,model_lock):
    import torch,numpy as np
    from huggingface_hub import hf_hub_download
    from kokoro import KModel,KPipeline
    if character['voiceId'] not in ('af_bella','af_nicole','am_onyx'):raise ValueError('Unapproved Kokoro voice')
    spec=model_lock['hexgrad/Kokoro-82M']
    download=lambda f:hf_hub_download(spec['repo'],f,revision=spec['revision'],token=False)
    model=KModel(repo_id=spec['repo'],config=download('config.json'),model=download('kokoro-v1_0.pth'))
    pipeline=KPipeline(lang_code='a',repo_id=spec['repo'],model=model,device='cpu')
    voice=torch.load(download('voices/'+character['voiceId']+'.pt'),weights_only=True,map_location='cpu')
    with torch.inference_mode():chunks=list(pipeline(text,voice=voice,speed=1))
    return np.concatenate([c.audio.cpu().numpy() for c in chunks]),24000

if __name__=='__main__':
    print(json.dumps(generate(sys.argv[1] if len(sys.argv)>1 else '.', 'bakery-output', run=False),ensure_ascii=False,indent=2))
