"""Four-line Library retakes; originals and two accepted recordings remain read-only."""
from pathlib import Path
import copy,gc,hashlib,json,random,re,datetime,uuid,shutil
import library_runner as base

TARGETS=('hw.library.teach-crown.lines.01','hw.library.hello.lines.01',
         'hw.library.find-book.lines.01','hw.library.book-found.lines.02')
ACCEPTED={
 'hw.library.welcome.lines.01':'efd8173f8f95889f014ea06cf37a6b2fc24e4903fe1f4c735060bf1c5f9af7a1',
 'hw.library.find-princess.lines.01':'e5e5d6da05a9b157243f6ce45843956e6cd26e85b76de4c1e4058ca7512e79a8'}
RECIPES={1:{'speed':.92,'split':'none','sentencePause':0.,'commaPause':0.},
         2:{'speed':.86,'split':'sentence','sentencePause':.28,'commaPause':0.},
         3:{'speed':.82,'split':'sentence-and-comma','sentencePause':.45,'commaPause':.18}}

def verify(work):
 work=Path(work);m,jobs=base.plan(work);old=base.read(work/'originals/generated-manifest.json');lock=base.read(work/'original-lock.json')
 if old['scope']!='library-trial6-review' or old['source']!=m['source'] or old['lines']!=m['lines'] or old['models']!=base.read(work/'model-lock.json') or old['characters']!=m['characters'] or set(old['assets'])!=set(m['assets']):raise ValueError('Original six-line manifest mismatch')
 if base.sha(work/'originals/generated-manifest.json')!=lock['manifestSha256']:raise ValueError('Original manifest hash changed')
 review=base.read(work/'originals/voice-review.json')['lines']
 for job in jobs:
  a=old['assets'][job['assetId']]
  if any(a[k]!=job[k] for k in ('assetId','lineId','lineIds','role','voiceId','text','src','filename','events')):raise ValueError('Original line/event identity mismatch')
  if base.sha(base.safe(work/'originals',a['src']))!=a['sha256'] or a['sha256']!=lock['assets'][a['lineId']]['sha256']:raise ValueError('Original WAV hash changed')
  if a['lineId'] in ACCEPTED:
   if a['sha256']!=ACCEPTED[a['lineId']] or review[a['assetId']]['decision']!='accepted':raise ValueError('Accepted recording changed')
  elif a['lineId'] not in TARGETS or review[a['assetId']]['decision']!='needs-retake':raise ValueError('Unexpected review scope')
 return m,jobs,old

def plan(work):
 m,jobs,old=verify(work)
 return [{'lineId':a['lineId'],'text':a['text'],'role':a['role'],'voiceId':a['voiceId'],'candidates':3,
          'recipes':RECIPES if a['role']=='princess' else 'same approved reference; three random seeds; no pitch/speed changes'} for a in jobs if a['lineId'] in TARGETS]

def segments(text,recipe):
 if recipe['split']=='none':return [text]
 pattern=r'(?<=[.!?])(?=\s)' if recipe['split']=='sentence' else r'(?<=[.!?,])(?=\s)'
 parts=re.split(pattern,text)
 if ''.join(parts)!=text:raise ValueError('Segmentation changed the English text')
 return parts

def princess_factory(work,m,lock):
 import torch,numpy as np
 from huggingface_hub import hf_hub_download
 from kokoro import KModel,KPipeline
 spec=lock['hexgrad/Kokoro-82M'];dl=lambda f:hf_hub_download(spec['repo'],f,revision=spec['revision'],token=False)
 model=KModel(repo_id=spec['repo'],config=dl('config.json'),model=dl('kokoro-v1_0.pth')).to('cpu').eval()
 pipeline=KPipeline(lang_code='a',repo_id=spec['repo'],model=model,device='cpu');v=dl('voices/af_bella.pt')
 voice=torch.load(v,weights_only=True,map_location='cpu')
 def synth(text,recipe):
  parts=segments(text,recipe);audio=[];boundaries=[];elapsed=0.
  for i,part in enumerate(parts):
   with torch.inference_mode():chunks=list(pipeline(part,voice=voice,speed=recipe['speed'],split_pattern=None))
   if not chunks:raise ValueError('No Kokoro audio')
   data=np.concatenate([c.audio.cpu().numpy() for c in chunks]);audio.append(data)
   boundaries.append({'text':part,'start':elapsed,'end':elapsed+len(data)/24000});elapsed+=len(data)/24000
   if i<len(parts)-1:
    pause=recipe['commaPause'] if part.rstrip().endswith(',') else recipe['sentencePause']
    audio.append(np.zeros(round(pause*24000),dtype=np.float32));elapsed+=pause
  return np.concatenate(audio),24000,{'segments':boundaries,'recipe':recipe}
 return synth,{'voiceId':'af_bella','voiceTensorSha256':base.sha(v),'model':spec,'pitchProcessing':False}

def generate(work,parent,run=False,factories=None):
 planned=plan(work)
 if not run:return {'dryRun':True,'lineCount':4,'candidateCount':12,'jobs':planned,'generated':0}
 import torch,numpy as np,soundfile as sf
 if factories is None and not torch.cuda.is_available():raise RuntimeError('Rosie requires free Colab T4 GPU; no paid fallback')
 work=Path(work).resolve();parent=Path(parent).resolve()
 if parent.is_relative_to(work) or work.is_relative_to(parent):raise ValueError('Retakes must be outside the input/original package')
 m,jobs,old=verify(work);lock=base.read(work/'model-lock.json')
 batch=parent/('library-retakes-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'-'+uuid.uuid4().hex[:8]);batch.mkdir(parents=True,exist_ok=False)
 result={'scope':'library-retakes4-candidates','source':m['source'],'models':lock,'originalManifestSha256':base.sha(work/'originals/generated-manifest.json'),
         'acceptedHashes':ACCEPTED,'productionApproved':False,'candidates':{}}
 base.save(batch/'candidate-manifest.json',result);print('Independent candidate folder:',batch)
 factories=factories or {'rosie':base.qwen_backend,'princess':princess_factory}
 for role in ('rosie','princess'):
  synth,provenance=factories[role](work,m,lock)
  for a in [a for a in jobs if a['lineId'] in TARGETS and a['role']==role]:
   result['candidates'][a['lineId']]=[]
   for number in (1,2,3):
    seed=int(hashlib.sha256((batch.name+a['lineId']+str(number)).encode()).hexdigest()[:8],16)
    random.seed(seed);np.random.seed(seed);torch.manual_seed(seed)
    if torch.cuda.is_available():torch.cuda.manual_seed_all(seed)
    if role=='rosie':samples,sr=synth(a['text']);details={'recipe':'same-reference-different-seed','pitchProcessing':False}
    else:samples,sr,details=synth(a['text'],RECIPES[number])
    samples=np.asarray(samples,dtype=np.float32)
    if samples.ndim!=1 or not np.isfinite(samples).all() or not .12<len(samples)/sr<45 or np.sqrt(np.mean(samples**2))<.001:raise ValueError('Invalid candidate audio')
    gain=min(1.,.98/max(float(np.max(np.abs(samples))),1e-9))
    name=f"{role}__{a['lineId']}__{a['voiceId']}__candidate-{number}.wav"
    sf.write(batch/name,samples*gain,sr,subtype='PCM_16')
    candidate={**a,'filename':name,'sha256':base.sha(batch/name),'sampleRate':sr,'duration':len(samples)/sr,'gain':gain,
               'seed':seed,'candidate':number,'generation':provenance,'retakeSettings':details,'review':'pending-choice','visemes':[]}
    result['candidates'][a['lineId']].append(candidate);base.save(batch/'candidate-manifest.json',result)
    print(a['lineId'],'candidate',number)
  del synth;gc.collect()
  if torch.cuda.is_available():torch.cuda.empty_cache()
 return batch

def export_selected(work,batch,choices,destination):
 m,jobs,old=verify(work);work=Path(work).resolve();batch=Path(batch).resolve();destination=Path(destination).resolve()
 if destination.exists() or destination.is_relative_to(work) or destination.is_relative_to(batch) or work.is_relative_to(destination) or batch.is_relative_to(destination):raise ValueError('Use a new independent export directory')
 c=base.read(batch/'candidate-manifest.json')
 if c['scope']!='library-retakes4-candidates' or c['source']!=m['source'] or c['models']!=base.read(work/'model-lock.json') or c['acceptedHashes']!=ACCEPTED or c['originalManifestSha256']!=base.sha(work/'originals/generated-manifest.json'):raise ValueError('Candidate batch mismatch')
 if set(choices)!=set(TARGETS):raise ValueError('Choose one candidate for each of the four requested lines')
 selected={}
 for line_id,n in choices.items():
  if type(n) is not int or n not in (1,2,3) or n>len(c['candidates'].get(line_id,[])):raise ValueError('Unselected or missing candidate')
  a=c['candidates'][line_id][n-1];expected=next(x for x in jobs if x['lineId']==line_id)
  if any(a[k]!=expected[k] for k in ('assetId','lineId','lineIds','role','voiceId','text','events','src')) or a['candidate']!=n:raise ValueError('Candidate identity/events mismatch')
  if base.sha(base.safe(batch,a['filename']))!=a['sha256']:raise ValueError('Candidate audio changed')
  selected[a['assetId']]=a
 new=copy.deepcopy(old);destination.mkdir(parents=True,exist_ok=False)
 for asset_id,a in old['assets'].items():
  chosen=selected.get(asset_id);out=base.safe(destination,a['src']);out.parent.mkdir(parents=True,exist_ok=True)
  shutil.copyfile(base.safe(batch,chosen['filename']) if chosen else base.safe(work/'originals',a['src']),out)
  if chosen:
   new['assets'][asset_id].update({k:chosen[k] for k in ('sha256','sampleRate','duration','seed','gain','generation','retakeSettings')})
   new['assets'][asset_id].update(review='user-selected-retake; in-game-review-pending',visemes=[],
     generatedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),retake={'candidate':chosen['candidate'],'previousSha256':a['sha256'],'lineId':chosen['lineId']})
  if base.sha(out)!=(chosen or a)['sha256']:raise ValueError('Export copy hash mismatch')
 base.save(destination/'generated-manifest.json',new)
 review=copy.deepcopy(base.read(work/'originals/voice-review.json'))
 for asset_id,a in selected.items():review['lines'][asset_id]={'decision':'accepted-retake','notes':'User selected candidate '+str(a['candidate'])+'; in-game review pending'}
 base.save(destination/'voice-review.json',review)
 base.save(destination/'repair-selection.json',{'choices':choices,'unchangedAcceptedHashes':ACCEPTED,'changedAssets':list(selected),
   'originalManifestSha256':c['originalManifestSha256'],'productionApproved':False})
 return destination
