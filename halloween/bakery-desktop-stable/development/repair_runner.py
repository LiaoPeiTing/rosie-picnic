"""Targeted Rosie retakes. Originals are read-only; candidates and export are new folders."""
from pathlib import Path
import copy, datetime, hashlib, json, random, shutil, uuid, zipfile

TARGETS = {
    'hw.bakery.find-cookie.hint.01': 'Pumpkin. Find the pumpkin cookie.',
    'hw.bakery.find-box.retry.01.n02': 'Good try. One pumpkin cookie and two candies.',
}
VOICE = 'qwen_rosie_r2'
REF_HASH = 'f26a8e4ca3d1226a250e2507027f326f65060bd5cdf4d846e69c32913b051e4f'
REF_TEXT = 'Welcome to the Halloween Bakery!'

def read(p):
    return json.loads(Path(p).read_text(encoding='utf-8-sig'))

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def write(p, data):
    Path(p).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

def inside(root, relative):
    root = Path(root).resolve()
    result = (root / relative).resolve()
    if not result.is_relative_to(root):
        raise ValueError('Path outside package')
    return result

def unpack(raw, destination):
    """Extract uploaded zip into a NEW folder, never over existing recordings."""
    import io
    destination = Path(destination)
    if destination.exists():
        raise ValueError('Upload destination already exists')
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        if sum(i.file_size for i in archive.infolist()) > 300_000_000:
            raise ValueError('ZIP exceeds 300 MB')
        names = [i.filename for i in archive.infolist() if not i.is_dir()]
        if len(names) != len(set(names)):
            raise ValueError('Duplicate ZIP members')
        paths = [(n, inside(destination, n)) for n in names]
        destination.mkdir(parents=True)
        for name, path in paths:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(archive.read(name))
    return destination

def plan(work, line_ids=None):
    work = Path(work)
    m = read(work / 'manifest.json')
    c = m['characters']['rosie']
    ref = c['reference']
    if c['voiceId'] != VOICE or c['backend'] != 'qwen-base':
        raise ValueError('Only the approved Rosie Qwen voice is allowed')
    if ref['sha256'] != REF_HASH or ref['ref_text'] != REF_TEXT or ref['use'] != 'main':
        raise ValueError('Approved Rosie reference/transcript mismatch')
    if sha(inside(work / 'references', ref['file'])) != REF_HASH:
        raise ValueError('Rosie reference audio changed')
    ids = list(TARGETS if line_ids is None else line_ids)
    if not ids or len(ids) != len(set(ids)) or any(i not in TARGETS for i in ids):
        raise ValueError('This repair is limited to the two requested line IDs')
    jobs = []
    for line_id in ids:
        line = m['lines'][line_id]
        asset = m['assets'][line['assetId']]
        if asset['role'] != 'rosie' or asset['voiceId'] != VOICE or asset['text'] != TARGETS[line_id]:
            raise ValueError('Line identity or exact text mismatch')
        jobs.append((line_id, asset))
    return m, jobs

_model = None
def load_model(lock):
    global _model
    import torch
    if not torch.cuda.is_available():
        raise RuntimeError('Select a free Colab T4 GPU; no paid fallback is used')
    if _model is None:
        from huggingface_hub import snapshot_download
        from qwen_tts import Qwen3TTSModel
        spec = lock['Qwen/Qwen3-TTS-12Hz-1.7B-Base']
        path = snapshot_download(spec['repo'], revision=spec['revision'], token=False)
        _model = Qwen3TTSModel.from_pretrained(path, device_map='cuda:0',
            dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
            attn_implementation='sdpa')
    return _model

def generate_candidates(work, parent, line_ids=None, count=3, run=False, model_factory=None):
    m, jobs = plan(work, line_ids)
    if count not in (2, 3):
        raise ValueError('Choose 2 or 3 candidates per line')
    if not run:
        return [{'lineId':i, 'text':a['text'], 'voiceId':a['voiceId'], 'candidates':count} for i,a in jobs]
    import numpy as np
    import soundfile as sf
    import torch
    lock = read(Path(work) / 'model-lock.json')
    model = (model_factory or load_model)(lock)
    ref = m['characters']['rosie']['reference']
    prompt = model.create_voice_clone_prompt(ref_audio=str(Path(work)/'references'/ref['file']),
        ref_text=ref['ref_text'], x_vector_only_mode=False)
    batch = Path(parent) / ('rosie-retakes-' + datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ') + '-' + uuid.uuid4().hex[:8])
    batch.mkdir(parents=True, exist_ok=False)
    result = {'schemaVersion':1, 'scope':'bakery-rosie-retakes', 'source':m['source'],
        'voiceId':VOICE, 'referenceSha256':REF_HASH, 'models':lock,
        'productionApproved':False, 'candidates':{}}
    write(batch/'candidate-manifest.json', result)
    for line_id, asset in jobs:
        result['candidates'][line_id] = []
        for number in range(1, count+1):
            seed = int.from_bytes(hashlib.sha256((batch.name+line_id+str(number)).encode()).digest()[:4], 'big')
            random.seed(seed); np.random.seed(seed); torch.manual_seed(seed)
            if torch.cuda.is_available(): torch.cuda.manual_seed_all(seed)
            settings = dict(do_sample=True, temperature=0.9, top_p=1.0, top_k=50,
                subtalker_dosample=True, subtalker_temperature=0.9, max_new_tokens=2048)
            wavs, sr = model.generate_voice_clone(text=asset['text'], language='English',
                voice_clone_prompt=prompt, non_streaming_mode=True, **settings)
            samples = np.asarray(wavs[0], dtype=np.float32)
            if not np.isfinite(samples).all() or not 0.12 < len(samples)/sr < 45 or np.sqrt(np.mean(samples**2)) < .001:
                raise ValueError('Invalid generated audio; completed candidates remain in '+str(batch))
            gain = min(1., .98/max(float(np.max(np.abs(samples))), 1e-9))
            name = f"{asset['role']}__{line_id}__{VOICE}__candidate-{number}.wav"
            sf.write(batch/name, samples*gain, sr, subtype='PCM_16')
            candidate = dict(assetId=asset['assetId'], lineId=line_id, text=asset['text'],
                role='rosie', voiceId=VOICE, filename=name, sha256=sha(batch/name),
                seed=seed, duration=len(samples)/sr, sampleRate=sr, gain=gain, sampling=settings,
                referenceSha256=REF_HASH, review='pending-listener-choice', visemes=[])
            result['candidates'][line_id].append(candidate)
            write(batch/'candidate-manifest.json', result)
            print(line_id, 'candidate', number, 'saved')
    return batch

def validate_originals(work, original):
    m, _ = plan(work)
    original = Path(original)
    old = read(original/'generated-manifest.json')
    ids = set(read(Path(work)/'jobs.json')['bakery_complete'])
    if old.get('scope') != 'bakery-generated-review' or old['source']['sha256'] != m['source']['sha256'] or set(old['assets']) != ids:
        raise ValueError('Please provide the complete, matching 53-recording output')
    for asset_id, a in old['assets'].items():
        expected = m['assets'][asset_id]
        if any(a.get(k) != expected[k] for k in ('role','voiceId','text','lineIds','src','filename')):
            raise ValueError('Original asset identity mismatch: '+asset_id)
        if sha(inside(original, a['src'])) != a['sha256']:
            raise ValueError('Original WAV hash mismatch: '+asset_id)
    return old

def export_selected(work, original, batch, choices, destination):
    """Write a full 53-file COPY. Change only selected assets in its manifest."""
    old = validate_originals(work, original)
    m, _ = plan(work)
    batch, destination = Path(batch), Path(destination)
    if destination.exists() or destination.resolve().is_relative_to(Path(original).resolve()):
        raise ValueError('Export must be a new independent directory')
    c = read(batch/'candidate-manifest.json')
    if c['source'] != m['source'] or c['voiceId'] != VOICE or c['referenceSha256'] != REF_HASH or c['models'] != read(Path(work)/'model-lock.json'):
        raise ValueError('Candidate configuration mismatch')
    if set(choices) != set(TARGETS):
        raise ValueError('Choose one candidate for each requested line; no automatic choice')
    replacements = {}
    for line_id, number in choices.items():
        if not isinstance(number, int) or isinstance(number, bool) or number < 1:
            raise ValueError('Choose candidate 1, 2, or 3 after listening')
        versions = c['candidates'].get(line_id, [])
        if number > len(versions): raise ValueError('Candidate not generated')
        a = versions[number-1]
        expected = m['assets'][m['lines'][line_id]['assetId']]
        if any(a.get(k) != expected[k] for k in ('assetId','role','voiceId','text')) or a['lineId'] != line_id or a['referenceSha256'] != REF_HASH:
            raise ValueError('Candidate identity mismatch')
        if sha(inside(batch, a['filename'])) != a['sha256']:
            raise ValueError('Candidate WAV changed')
        replacements[a['assetId']] = a
    # Validate everything before writing any export. Original files never receive writes.
    new = copy.deepcopy(old)
    destination.mkdir(parents=True, exist_ok=False)
    for asset_id, asset in old['assets'].items():
        output = inside(destination, asset['src']); output.parent.mkdir(parents=True, exist_ok=True)
        chosen = replacements.get(asset_id)
        source = inside(batch, chosen['filename']) if chosen else inside(original, asset['src'])
        shutil.copyfile(source, output)
        if chosen:
            new['assets'][asset_id].update({k:chosen[k] for k in ('sha256','duration','sampleRate','seed','gain','referenceSha256')})
            new['assets'][asset_id].update(generationBackend='qwen-base',
                generatedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                review='user-selected-retake; in-game-review-pending', visemes=[],
                retake={'lineId':chosen['lineId'], 'candidate':choices[chosen['lineId']],
                        'previousSha256':asset['sha256'], 'sampling':chosen['sampling']})
        if sha(output) != (chosen or asset)['sha256']: raise ValueError('Copy hash mismatch')
    write(destination/'generated-manifest.json', new)
    write(destination/'repair-selection.json', {'choices':choices, 'changedAssetIds':list(replacements),
        'unchangedAssets':51, 'originalManifestSha256':sha(Path(original)/'generated-manifest.json'),
        'productionApproved':False})
    return destination
