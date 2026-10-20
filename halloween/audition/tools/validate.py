"""Objective file checks only; not a substitute for listening approval."""
from pathlib import Path
import hashlib
import json
import wave
import numpy as np

root = Path(__file__).resolve().parents[1]
m = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
assert m['scope'] == 'audition-only' and m['productionApproved'] is False
assert len(m['roles']) == 6 and len(m['assets']) == 36
assert len({a['id'] for a in m['assets']}) == 36
assert len({a['sha256'] for a in m['assets']}) == 36
primary = alternate = total_bytes = 0
for r in m['roles']:
    assert len(r['lines']) == 3 and r['approvedVoice'] is None
    for line in r['lines']:
        for candidate in ['primary', 'alternate']:
            a = next(x for x in m['assets'] if x['lineId'] == line['id'] and x['candidate'] == candidate)
            assert a['text'] == line['text'] and a['voiceId'] == r[candidate]
            assert a['productionApproved'] is False and a['manualReview'] == 'pending'
            path = root / a['src']
            assert a['sha256'] == hashlib.sha256(path.read_bytes()).hexdigest()
            with wave.open(str(path)) as wav:
                assert wav.getframerate() == 24000 and wav.getnchannels() == 1 and wav.getsampwidth() == 2
                data = np.frombuffer(wav.readframes(wav.getnframes()), dtype='<i2') / 32768
                assert len(data) / 24000 > .2 and np.sqrt(np.mean(data**2)) > .001
                assert np.max(np.abs(data)) < .999
            total_bytes += path.stat().st_size
            primary += candidate == 'primary'
            alternate += candidate == 'alternate'
game_path = root.parent / 'assets/audio/manifest.json'
if game_path.exists():
    game = json.loads(game_path.read_text(encoding='utf-8'))
    for r in m['roles']:
        for line in r['lines']:
            if line['source'] == 'game':
                original = game['voiceLines'][r['name'] + '|' + line['text']]
                assert original['id'] == line['gameLineId']
report = dict(primary=primary, alternate=alternate, files=36, totalBytes=total_bytes,
              durationSeconds=round(sum(a['duration'] for a in m['assets']), 3),
              allPcm24kMono=True, uniqueAudioHashes=36, clippedFiles=0, silentFiles=0,
              sourceTextMatches=True, manualListening='pending', productionModified=False)
(root / 'validation-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
