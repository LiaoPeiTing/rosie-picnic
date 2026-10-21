"""Free official open-model demo, audition only. No paid endpoint or real voice input."""
from pathlib import Path
import json, hashlib, urllib.request, datetime, time
import numpy as np
import soundfile as sf

ROOT=Path(__file__).resolve().parents[1]
BASE='https://qwen-qwen3-tts.hf.space'
PROMPTS={
 'rosie':'A cute five-to-six-year-old girl character speaking natural clear American English. A genuinely youthful childlike timbre, small bright and sweet voice, warm and lively, with age-appropriate playful curiosity. Not an adult voice pitched up. Clear consonants, natural conversational rhythm, friendly for preschool children. No singing, no imitation of any real person.',
 'ghost':'A mischievous five-to-six-year-old little boy character speaking clear natural American English. A genuinely young child voice with small light vocal resonance, cheeky playful energy and a smile in his voice. Lively, impish and friendly, never scary. Clear words for preschool learners. Not a grown man pitched up. No singing, no imitation of any real person.',
 'pirate':'A weathered elderly male sea captain, about seventy years old, speaking natural American English in a very deep bass voice. Strong low chest resonance, distinctly gravelly, rough, husky and pleasantly hoarse vocal grain. A warm hearty old pirate captain, rugged and experienced but kind to children. Clearly articulated words, a smiling confident delivery, no shouting, no singing and no imitation of any real person.'
}

def request_json(url,data=None):
 req=urllib.request.Request(url,data=json.dumps(data).encode() if data is not None else None,headers={'Content-Type':'application/json'})
 return json.load(urllib.request.urlopen(req,timeout=30))

def call(endpoint,data):
 queued=request_json(BASE+'/gradio_api/call/'+endpoint,{'data':data})
 print('QUEUED',endpoint,queued['event_id'],flush=True)
 with urllib.request.urlopen(BASE+'/gradio_api/call/'+endpoint+'/'+queued['event_id'],timeout=55) as response:
  event=''
  for raw in response:
   line=raw.decode().strip()
   if line.startswith('event:'):event=line[6:].strip()
   if line.startswith('data:') and event in ['complete','error']:
    result=json.loads(line[5:])
    if event=='error' or not result or not isinstance(result[0],dict):raise RuntimeError(str(result))
    return result[0]
 raise RuntimeError('No audio returned. No retry or quota bypass is attempted.')

def main():
 old=json.loads((ROOT.parent/'audition/manifest.json').read_text(encoding='utf-8'))
 roles=[r for r in old['roles'] if r['id'] in PROMPTS]
 manifest={'schemaVersion':1,'scope':'audition-only','productionApproved':False,'language':'en-US',
  'model':{'repo':'Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign','revision':'official-demo-runtime-unreported'},
  'generationService':BASE,'roles':[],'assets':[],
  'note':'VoiceDesign creates an original synthetic reference; Base model reuses that reference. No real person voice is supplied. Age and timbre remain subject to human listening approval.'}
 existing=ROOT/'manifest.json'
 if existing.exists():manifest=json.loads(existing.read_text(encoding='utf-8'))
 def save():
  existing.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
  (ROOT/'manifest.js').write_text('window.RosieAuditionManifest='+json.dumps(manifest,ensure_ascii=False)+';\n',encoding='utf-8')
 for role in roles:
  role_id=role['id'];voice='qwen_'+role_id+'_r2'
  if not any(r['id']==role_id for r in manifest['roles']):
   manifest['roles'].append({**role,'primary':voice,'alternate':role['primary'],'direction':{'rosie':'5～6歲可愛小女孩聲線目標','ghost':'5～6歲頑皮小男孩聲線目標','pirate':'更低沉、沙啞、有老船長感的聲線目標'}[role_id],'approvedVoice':None})
  for a in old['assets']:
   if a['roleId']==role_id and a['voiceId']==role['primary'] and not any(x['id']==a['id'] for x in manifest['assets']):
    target=ROOT/a['src'];target.write_bytes((ROOT.parent/'audition'/a['src']).read_bytes());manifest['assets'].append({**a,'candidate':'previous-rejected-comparison'})
  reference=None
  for i,line in enumerate(role['lines']):
   asset_id=line['id']+'__'+voice
   previous=next((a for a in manifest['assets'] if a['id']==asset_id),None)
   if previous and (ROOT/previous['src']).exists():
    if i==0:reference=previous['remoteReference']
    print('KEEP',asset_id,flush=True);continue
   if i==0:
    first=ROOT/'first-request-result.json'
    if role_id=='rosie' and first.exists():result=json.loads(first.read_text(encoding='utf-8'))['data'][0]
    else:result=call('generate_voice_design',[line['text'],'English',PROMPTS[role_id]])
    reference=result
   else:
    result=call('generate_voice_clone',[reference,role['lines'][0]['text'],line['text'],'English',False,'1.7B'])
   url=result['url']
   if not url.startswith(BASE+'/'):raise ValueError('Unexpected audio origin')
   raw=urllib.request.urlopen(url,timeout=30).read()
   file=ROOT/'audio'/f"{line['id']}_{voice}.wav";file.write_bytes(raw)
   samples,sr=sf.read(file)
   if samples.ndim!=1 or sr!=24000 or not np.isfinite(samples).all() or np.sqrt(np.mean(samples**2))<.001:raise ValueError('Invalid audio')
   manifest['assets'].append({'id':asset_id,'lineId':line['id'],'roleId':role_id,'voiceId':voice,
    'candidate':'round2-new','text':line['text'],'emotionIntent':line['emotion'],'source':line['source'],
    'gameLineId':line['gameLineId'],'src':'audio/'+file.name,'status':'generated','duration':len(samples)/sr,
    'sha256':hashlib.sha256(raw).hexdigest(),'manualReview':'pending','productionApproved':False,
    'method':'voice-design' if i==0 else 'base-with-own-synthetic-reference',
    'instruction':PROMPTS[role_id],'remoteReference':reference,'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'alignment':{'status':'not-aligned','visemes':[]}})
   save();print('GENERATED',file.name,len(samples)/sr,flush=True)
  save()

if __name__=='__main__':main()
