"""Only the remaining26, protected by this user's exact accepted nine SHA256s."""
from pathlib import Path
import park_tools as park
LOCK = {'scope': 'park-user-accepted-nine-lock', 'manifestSha256': '6bc1fe8eebca9497652e9cf878e1cc3bb6d5e865d3223e594e663c8d051720d4', 'reviewSha256': 'd1384ede512f0e571d41ea00e344072e8ded303326c6c51b894223fdbc1a9f84', 'assets': {'rosie-e0fc10d4cdd10b68': '03fbd33d07efd694d0fded023d57797f4f4b33f3ae5c36ee4233833ff7a16665', 'rosie-b951fc6fcbbb6f6c': '165b005833542835c63eaae31183d3cc1b71350b49313e49366c421867b47f9a', 'rosie-2b075b1122a28fae': '821233b12e830e88a0dc69955e61ecb4b9dcba487f22477286421bc17d1b6893', 'pirate-a4b74cf0d756cdef': 'f004d35d32d2cf66fe295721883246a611f9868f3f40cfd165d360b018adff8b', 'pirate-75f54f5194c0636b': 'b385d67abbb0dc6ce627d48cf7deffd72a3bd5adbaa1211a2198a3c431a2dab6', 'pirate-f341d5d30cb50482': '97852c941f969716585835f66a301964620ba60baf8c4c59594d18e12e2b969b', 'mermaid-c3c2db5d4572c299': '7051249b7e951dca96c8b9e1947be646fe88cf0073972b49e99b45339d507245', 'vampire_ring-fe90b2524e5c007f': 'c33dff2500910b6bee9433f035820200777e4e2019b96a4da561da020a4dc41e', 'vampire_ring-e90eb8e3cebb22a7': '6f68fe89e1ecd8421a81c22a4010a2963fdb76707772077b9752452e1f2462e7'}, 'status': '九句人工試聽已接受；音檔鎖定，不重新生成', 'productionApproved': False}

def accepted_nine(work):
 work=Path(work);folder=work/'approved9'
 if park.read(work/'approved-nine-lock.json')!=LOCK:raise ValueError('Accepted-nine lock changed')
 m,review=park.approved_trial(folder)
 if park.sha(folder/'generated-manifest.json')!=LOCK['manifestSha256'] or park.sha(folder/'voice-review.json')!=LOCK['reviewSha256']:raise ValueError('Accepted-nine manifest/review changed')
 if {aid:a['sha256'] for aid,a in m['assets'].items()}!=LOCK['assets']:raise ValueError('Accepted-nine audio hashes changed')
 return folder

def plan(work):
 folder=accepted_nine(work)
 jobs=park.plan(work,'remaining26',folder)
 if len(jobs)!=26 or {a['assetId'] for a in jobs}&set(LOCK['assets']):raise ValueError('Only remaining26 allowed')
 return jobs

def validate_output(output):
 m=park.validate_output(output)
 if m['stage']!='remaining26':raise ValueError('Use a remaining26 output package')
 protected={**LOCK['assets'],park.CATALOG['sharedAssetId']:park.CATALOG['sharedSha256']}
 if m['protectedAssets']!=protected:raise ValueError('Protected ten audio hashes do not match accepted source')
 for aid,h in protected.items():
  if m['assets'][aid]['sha256']!=h:raise ValueError('Accepted audio changed')
 return m

def generate(work,output,run=False,confirmation='',factory_override=None):
 jobs=plan(work)
 if not run:return {'dryRun':True,'generated':0,'count':26,'protectedNine':9,'shared':1,'jobs':jobs}
 # The actual generator has a second explicit confirmation guard before importing models.
 if (Path(output)/'generated-manifest.json').exists():validate_output(output)
 result=park.generate(work,output,'remaining26',run,confirmation,accepted_nine(work),factory_override)
 validate_output(output);return result

def restore(raw,parent):
 output=park.restore_results(raw,parent);validate_output(output);return output

def show_review(output):
 validate_output(output);return park.show_review(output)
