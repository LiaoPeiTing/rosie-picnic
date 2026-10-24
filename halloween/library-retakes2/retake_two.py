"""Only the two rejected Rosie lines, three candidates each; accepted28 immutable."""
from pathlib import Path
import json,hashlib,uuid,datetime,random,shutil,gc
import library_runner as base
import validate_originals as validator
TARGETS=('hw.library.crown-on.lines.01','hw.library.command-1.hint.01')
def verify(work):
 work=Path(work);m,mh=validator.validate(work/'originals');review=validator.validate_review(base.read(work/'originals/voice-review.json'),m,mh);lock=base.read(work/'original-lock.json')
 if mh!=lock['manifestSha256'] or base.sha(work/'originals/voice-review.json')!=lock['reviewSha256']:raise ValueError('Original manifest/review changed')
 targets={r['lineId'] for r in review['lines'].values() if r['decision']=='needs-retake'}
 if targets!=set(TARGETS) or len(lock['protectedAssets'])!=28 or set(lock['targets'])!=targets:raise ValueError('Only two rejected lines allowed')
 for aid,a in m['assets'].items():
  if a['sha256']!=lock['assets'][aid]:raise ValueError('Original hash changed')
  if aid in lock['protectedAssets'] and (a['sha256']!=lock['protectedAssets'][aid] or review['lines'][aid]['decision']!='accepted'):raise ValueError('Accepted28 changed')
 ref=m['characters']['rosie']['reference']
 if ref['sha256']!=base.REFERENCE_HASH or base.sha(work/'references'/ref['file'])!=base.REFERENCE_HASH or ref['ref_text']!='Welcome to the Halloween Bakery!':raise ValueError('Approved Rosie reference changed')
 models=base.read(work/'model-lock.json')
 for repo,rev in base.PINS.items():
  if models[repo]['revision']!=rev:raise ValueError('Model revision changed')
 jobs=[a for a in m['assets'].values() if a['lineId'] in TARGETS]
 if len(jobs)!=2 or any(a['role']!='rosie' or a['voiceId']!='qwen_rosie_r2' for a in jobs):raise ValueError('Wrong voice or scope')
 return m,review,lock,jobs

def plan(work):
 m,review,lock,jobs=verify(work)
 return [{**a,'reason':review['lines'][a['assetId']]['notes'],'candidateCount':3} for a in jobs]

def generate(work,parent,run=False,confirmation='',factory=None):
 jobs=plan(work)
 if not run:return {'dryRun':True,'lineCount':2,'candidateCount':6,'generated':0,'jobs':jobs}
 if confirmation!='CONFIRM_LIBRARY_TWO_RETAKES':raise ValueError('Explicit two-line confirmation required')
 import numpy as np,torch,soundfile as sf
 if factory is None and not torch.cuda.is_available():raise RuntimeError('Select free Colab T4 GPU for Qwen; no paid fallback')
 work=Path(work).resolve();parent=Path(parent).resolve()
 if parent.is_relative_to(work) or work.is_relative_to(parent):raise ValueError('Candidates must be outside original/input directory')
 m,review,lock,jobs=verify(work);batch=parent/('library-retakes2-'+uuid.uuid4().hex[:10]);batch.mkdir(parents=True,exist_ok=False)
 result={'scope':'library-retakes2-candidates','originalManifestSha256':lock['manifestSha256'],'protectedAssets':lock['protectedAssets'],'productionApproved':False,'candidates':{}}
 base.save(batch/'candidate-manifest.json',result)
 synth,provenance=(factory or base.qwen_backend)(work,m,base.read(work/'model-lock.json'))
 for a in jobs:
  result['candidates'][a['lineId']]=[]
  for number in (1,2,3):
   seed=int(hashlib.sha256((batch.name+a['lineId']+str(number)).encode()).hexdigest()[:8],16);random.seed(seed);np.random.seed(seed);torch.manual_seed(seed)
   if torch.cuda.is_available():torch.cuda.manual_seed_all(seed)
   data,sr=synth(a['text']);data=np.asarray(data,dtype=np.float32)
   if data.ndim!=1 or not np.isfinite(data).all() or not .12<len(data)/sr<45 or np.sqrt(np.mean(data**2))<.001:raise ValueError('Invalid candidate audio')
   gain=min(1.,.98/max(float(np.max(np.abs(data))),1e-9));name=f"rosie__{a['lineId']}__qwen_rosie_r2__candidate-{number}.wav";sf.write(batch/name,data*gain,sr,subtype='PCM_16')
   row={**a,'filename':name,'src':name,'candidate':number,'sha256':base.sha(batch/name),'duration':len(data)/sr,'sampleRate':sr,'seed':seed,'gain':gain,'generation':provenance,'pitchProcessing':False,'review':'pending-user-selection','visemes':[]}
   result['candidates'][a['lineId']].append(row);base.save(batch/'candidate-manifest.json',result)
 del synth;gc.collect()
 if torch.cuda.is_available():torch.cuda.empty_cache()
 return batch

def export_selected(work,batch,choices,dest):
 m,review,lock,jobs=verify(work);batch=Path(batch).resolve();dest=Path(dest).resolve();work=Path(work).resolve()
 if set(choices)!=set(TARGETS) or any(type(v) is not int or v not in (1,2,3) for v in choices.values()):raise ValueError('Select one candidate for each of the two lines first')
 if dest.exists() or dest.is_relative_to(work) or dest.is_relative_to(batch) or work.is_relative_to(dest) or batch.is_relative_to(dest):raise ValueError('Use a new independent output folder')
 cm=base.read(batch/'candidate-manifest.json')
 if cm['scope']!='library-retakes2-candidates' or cm['originalManifestSha256']!=lock['manifestSha256'] or cm['protectedAssets']!=lock['protectedAssets'] or set(cm['candidates'])!=set(TARGETS):raise ValueError('Wrong candidate batch')
 selected=[]
 for a in jobs:
  number=choices[a['lineId']];rows=[c for c in cm['candidates'][a['lineId']] if c['candidate']==number]
  if len(rows)!=1:raise ValueError('Candidate missing')
  c=rows[0]
  for k in ('assetId','lineId','lineIds','role','voiceId','text','events'):
   if c[k]!=a[k]:raise ValueError('Candidate line identity changed')
  p=base.safe(batch,c['src'])
  if base.sha(p)!=c['sha256']:raise ValueError('Candidate WAV changed')
  selected.append((a,c,p))
 # Do not modify originals. Fresh full copy only after both candidates are selected.
 shutil.copytree(work/'originals',dest)
 for a,c,p in selected:
  (dest/a['src']).write_bytes(p.read_bytes())
  updated={**a,**{k:c[k] for k in ('sha256','duration','sampleRate','seed','gain','generation','visemes')},'review':'user-selected-retake; in-game-review-pending','retake':{'candidate':c['candidate'],'previousSha256':a['sha256'],'lineId':a['lineId']}}
  m['assets'][a['assetId']]=updated
  review['lines'][a['assetId']]={**validator.identity(updated),'decision':'accepted','notes':'Selected candidate '+str(c['candidate'])+'; pending in-game review','locked':False}
 base.save(dest/'generated-manifest.json',m);mh=base.sha(dest/'generated-manifest.json');review['manifestSha256']=mh;review['productionApproved']=False
 base.save(dest/'voice-review.json',review)
 base.save(dest/'retake-request.json',{'scope':'library-specified-retake-request','manifestSha256':mh,'jobs':[],'generationEnabled':False,'productionApproved':False})
 base.save(dest/'repair-selection.json',{'scope':'library-two-retakes-selection','choices':choices,'protectedAssets':lock['protectedAssets'],'originalManifestSha256':lock['manifestSha256'],'productionApproved':False})
 # Prior HTML contains rejected statuses: regenerate a matching review.html using current records.
 for aid,h in lock['protectedAssets'].items():
  if base.sha(dest/m['assets'][aid]['src'])!=h:raise ValueError('Accepted28 integrity failure')
 validator.validate(dest);validator.validate_review(review,m,mh)
 archive=validator.export_bundle(dest,review,m,mh)
 # Export bundle has 30WAV + latestreview. Add selection provenance, preserving all files.
 import zipfile
 with zipfile.ZipFile(archive,'a',zipfile.ZIP_DEFLATED) as z:z.write(dest/'repair-selection.json','repair-selection.json')
 return dest,archive
