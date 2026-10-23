"""Only the six approved Library trial jobs. Planning never imports/loads TTS models."""
from pathlib import Path
import gc, hashlib, json, random, datetime, zipfile, io

EXPECTED = {
 'hw.library.welcome.lines.01': ('rosie','qwen_rosie_r2','Welcome to the Halloween Library!'),
 'hw.library.teach-crown.lines.01': ('rosie','qwen_rosie_r2','A crown. Crown.'),
 'hw.library.find-princess.lines.01': ('rosie','qwen_rosie_r2','A crown. A pink dress. Who is it?'),
 'hw.library.hello.lines.01': ('princess','af_bella','Hello, Stephanie!'),
 'hw.library.find-book.lines.01': ('princess','af_bella','Where is my book? My book has a crown.'),
 'hw.library.book-found.lines.02': ('princess','af_bella','I found my book! Thank you, Stephanie!'),
}
REFERENCE_HASH='f26a8e4ca3d1226a250e2507027f326f65060bd5cdf4d846e69c32913b051e4f'
SOURCE_HASH='0d64f5d844b7c1c3f53f463cb90da0af4790eb98ecf4999d717ffe1a1832b0ba'
PINS={'Qwen/Qwen3-TTS-12Hz-1.7B-Base':'fd4b254389122332181a7c3db7f27e918eec64e3',
      'hexgrad/Kokoro-82M':'f3ff3571791e39611d31c381e3a41a3af07b4987'}

def read(path): return json.loads(Path(path).read_text(encoding='utf-8-sig'))
def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def save(path,data): Path(path).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
def safe(root,name):
 root=Path(root).resolve();path=(root/name).resolve()
 if not path.is_relative_to(root): raise ValueError('Unsafe path')
 return path

def unpack(raw,destination):
 destination=Path(destination)
 if destination.exists(): raise ValueError('Use a new input directory')
 with zipfile.ZipFile(io.BytesIO(raw)) as z:
  names=[i.filename for i in z.infolist() if not i.is_dir()]
  if len(names)!=len(set(names)) or sum(i.file_size for i in z.infolist())>50_000_000: raise ValueError('Invalid input ZIP')
  paths=[(n,safe(destination,n)) for n in names]
  destination.mkdir(parents=True)
  for n,p in paths: p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(z.read(n))
 return destination

def plan(work):
 work=Path(work);m=read(work/'manifest.json');lock=read(work/'model-lock.json')
 if m.get('scope')!='library-trial6' or set(m['jobs'])!=set(EXPECTED) or len(m['jobs'])!=6 or len(m['assets'])!=6 or set(m['lines'])!=set(EXPECTED): raise ValueError('Only six Library jobs are allowed')
 if m['source']['sha256']!=SOURCE_HASH: raise ValueError('Unexpected story source')
 for repo,revision in PINS.items():
  if lock[repo]['repo']!=repo or lock[repo]['revision']!=revision: raise ValueError('Model revision changed')
 ref=m['characters']['rosie']['reference']
 if ref['use']!='main' or ref['sha256']!=REFERENCE_HASH or ref['ref_text']!='Welcome to the Halloween Bakery!': raise ValueError('Rosie reference configuration changed')
 if sha(safe(work/'references',ref['file']))!=REFERENCE_HASH: raise ValueError('Approved Rosie reference missing or changed')
 jobs=[]
 for line_id in m['jobs']:
  line=m['lines'][line_id];a=m['assets'][line['assetId']];role,voice,text=EXPECTED[line_id]
  if (a['role'],a['voiceId'],a['text'])!=(role,voice,text) or (line['role'],line['text'],line['scene'])!=(role,text,'library'): raise ValueError('Line/voice/text mismatch: '+line_id)
  if m['characters'][role]['voiceId']!=voice or line_id not in a['lineIds'] or any(not i.startswith('hw.library.') for i in a['lineIds']): raise ValueError('Wrong character or non-Library ID')
  if a['src']!='audio/'+a['filename'] or Path(a['filename']).name!=a['filename'] or not a['filename'].endswith('.wav'): raise ValueError('Unexpected audio path')
  jobs.append({'lineId':line_id,**a,'events':line['events'],'emotionTarget':line['emotionTarget']})
 if len({a['assetId'] for a in jobs})!=6: raise ValueError('Duplicate audio jobs')
 return m,jobs

def qwen_backend(work,m,lock):
 import torch,numpy as np
 from huggingface_hub import snapshot_download
 from qwen_tts import Qwen3TTSModel
 spec=lock['Qwen/Qwen3-TTS-12Hz-1.7B-Base']
 model=Qwen3TTSModel.from_pretrained(snapshot_download(spec['repo'],revision=spec['revision'],token=False),
  device_map='cuda:0',dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,attn_implementation='sdpa')
 ref=m['characters']['rosie']['reference']
 prompt=model.create_voice_clone_prompt(ref_audio=str(Path(work)/'references'/ref['file']),ref_text=ref['ref_text'],x_vector_only_mode=False)
 def synth(text):
  wavs,sr=model.generate_voice_clone(text=text,language='English',voice_clone_prompt=prompt,non_streaming_mode=True,max_new_tokens=2048)
  return np.asarray(wavs[0],dtype=np.float32),sr
 return synth,{'model':spec,'referenceSha256':REFERENCE_HASH,'voiceId':'qwen_rosie_r2'}

def kokoro_backend(work,m,lock):
 import torch,numpy as np
 from huggingface_hub import hf_hub_download
 from kokoro import KModel,KPipeline
 spec=lock['hexgrad/Kokoro-82M']
 download=lambda f:hf_hub_download(spec['repo'],f,revision=spec['revision'],token=False)
 model=KModel(repo_id=spec['repo'],config=download('config.json'),model=download('kokoro-v1_0.pth')).to('cpu').eval()
 pipeline=KPipeline(lang_code='a',repo_id=spec['repo'],model=model,device='cpu')
 tensor_path=download('voices/af_bella.pt');voice=torch.load(tensor_path,weights_only=True,map_location='cpu')
 def synth(text):
  with torch.inference_mode():chunks=list(pipeline(text,voice=voice,speed=1,split_pattern=None))
  if not chunks: raise ValueError('Kokoro returned no audio')
  return np.concatenate([c.audio.cpu().numpy() for c in chunks]),24000
 return synth,{'model':spec,'voiceTensorSha256':sha(tensor_path),'voiceId':'af_bella','speed':1}

def generate(work,output,run=False,confirmation='',factories=None):
 m,jobs=plan(work)
 if not run: return {'dryRun':True,'scope':'library-trial6','count':6,'jobs':jobs,'generated':0}
 if confirmation!='CONFIRM_LIBRARY_SIX': raise ValueError('Stop: first review the dry-run list, then explicitly confirm only these six Library lines')
 # Imports and GPU/model allocation happen only AFTER the explicit confirmation gate.
 import torch,numpy as np,soundfile as sf
 if factories is None and not torch.cuda.is_available(): raise RuntimeError('Select free T4 GPU for Rosie; no paid API fallback')
 output=Path(output).resolve();work=Path(work).resolve()
 if output.is_relative_to(work) or work.is_relative_to(output): raise ValueError('Output must be independent from input')
 mf=output/'generated-manifest.json';lock=read(work/'model-lock.json')
 if output.exists() and any(output.iterdir()) and not mf.exists(): raise ValueError('Nonempty output directory; choose a new Library-only output')
 exported=read(mf) if mf.exists() else {'schemaVersion':1,'scope':'library-trial6-review','source':m['source'],
  'models':lock,'characters':m['characters'],'lines':m['lines'],'assets':{},'productionApproved':False,'qualityReview':'pending-user-listening'}
 if exported.get('scope')!='library-trial6-review' or exported['source']!=m['source'] or exported['models']!=lock or exported['characters']!=m['characters'] or not set(exported['assets']).issubset({a['assetId'] for a in jobs}): raise ValueError('Unrelated or changed output manifest; cannot overwrite')
 output.mkdir(parents=True,exist_ok=True);(output/'audio').mkdir(exist_ok=True)
 factories=factories or {'rosie':qwen_backend,'princess':kokoro_backend}
 for role in ('rosie','princess'):
  pending=[]
  for a in [a for a in jobs if a['role']==role]:
   dest=safe(output,a['src']);prior=exported['assets'].get(a['assetId'])
   if prior and dest.is_file() and prior['text']==a['text'] and prior['voiceId']==a['voiceId'] and sha(dest)==prior['sha256']: print('KEEP',a['lineId']);continue
   if dest.exists(): raise ValueError('Existing WAV is not a verified resume file; use a new output')
   pending.append(a)
  if not pending: continue
  synth,provenance=factories[role](work,m,lock)
  for a in pending:
   seed=int(hashlib.sha256(('library-trial6:'+a['assetId']).encode()).hexdigest()[:8],16)
   random.seed(seed);np.random.seed(seed);torch.manual_seed(seed)
   if torch.cuda.is_available(): torch.cuda.manual_seed_all(seed)
   samples,sr=synth(a['text']);samples=np.asarray(samples,dtype=np.float32)
   if samples.ndim!=1 or not np.isfinite(samples).all() or not .12<len(samples)/sr<45 or np.sqrt(np.mean(samples**2))<.001: raise ValueError('Invalid generated audio')
   gain=min(1.,.98/max(float(np.max(np.abs(samples))),1e-9));dest=safe(output,a['src']);sf.write(dest,samples*gain,sr,subtype='PCM_16')
   exported['assets'][a['assetId']]={**a,'status':'generated','sha256':sha(dest),'sampleRate':sr,'duration':len(samples)/sr,
    'seed':seed,'gain':gain,'generation':provenance,'review':'pending-user-listening','visemes':[],
    'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
   save(mf,exported);print(role,a['lineId'],repr(a['text']))
  del synth;gc.collect()
  if torch.cuda.is_available(): torch.cuda.empty_cache()
 return exported
