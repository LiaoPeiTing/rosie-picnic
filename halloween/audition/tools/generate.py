"""Generate audition-only Kokoro samples. Never writes the production manifest."""
import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import time

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault('HF_HOME', str(ROOT / '.cache' / 'huggingface'))
os.environ['HF_HUB_DISABLE_IMPLICIT_TOKEN'] = '1'
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'
os.environ['HF_HUB_DISABLE_XET'] = '1'
os.environ['HF_HUB_ETAG_TIMEOUT'] = '15'
os.environ['HF_HUB_DOWNLOAD_TIMEOUT'] = '30'
os.environ['HF_HUB_DISABLE_SYMLINKS_WARNING'] = '1'

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--candidate', choices=['primary', 'alternate', 'both'], default='both')
    parser.add_argument('--role', default='all')
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--force', action='store_true')
    args = parser.parse_args()
    print('Loading local dependencies...', flush=True)
    import numpy as np
    import soundfile as sf
    import torch
    import espeakng_loader
    from phonemizer.backend.espeak.wrapper import EspeakWrapper
    EspeakWrapper.set_library(espeakng_loader.get_library_path())
    EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
    from huggingface_hub import hf_hub_download
    from kokoro import KModel, KPipeline

    torch.set_num_threads(min(4, os.cpu_count() or 1))
    torch.manual_seed(20261020)
    script = json.loads((ROOT / 'script.json').read_text(encoding='utf-8-sig'))
    if script['scope'] != 'audition-only' or sum(len(r['lines']) for r in script['roles']) != 18:
        raise ValueError('This script is restricted to the 18 audition lines.')
    if args.role != 'all' and args.role not in [r['id'] for r in script['roles']]:
        raise ValueError('Unknown role')
    lock = json.loads((ROOT / 'model-lock.json').read_text(encoding='utf-8-sig'))
    def download(name):
        print('Downloading pinned model file:', name, flush=True)
        return hf_hub_download(lock['repo'], name, revision=lock['revision'], token=False)
    config = download('config.json')
    weights = download('kokoro-v1_0.pth')
    print('Loading model on CPU...', flush=True)
    model = KModel(repo_id=lock['repo'], config=config, model=weights).to('cpu').eval()
    pipeline = KPipeline(lang_code='a', repo_id=lock['repo'], model=model, device='cpu')
    manifest_path = ROOT / 'manifest.json'
    old = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
    assets = {a['id']: a for a in old.get('assets', [])}
    versions = {p: importlib.metadata.version(p) for p in ['kokoro', 'torch', 'misaki', 'transformers', 'soundfile', 'espeakng-loader']}
    metadata = dict(schemaVersion=1, scope='audition-only', productionApproved=False,
                    language='en-US', sampleRate=24000, format='PCM_16 WAV', speed=1,
                    model={**lock, 'weightsSha256': sha(weights), 'configSha256': sha(config)},
                    packages=versions, roles=script['roles'])
    def save():
        manifest_path.write_text(json.dumps({**metadata, 'assets': list(assets.values())}, ensure_ascii=False, indent=2), encoding='utf-8')
    generated = 0
    for role in script['roles']:
        if args.role not in ['all', role['id']]:
            continue
        candidates = ['primary', 'alternate'] if args.candidate == 'both' else [args.candidate]
        for candidate in candidates:
            voice = role[candidate]
            if f'voices/{voice}.pt' not in lock['voices']:
                raise ValueError(f'Unverified voice: {voice}')
            tensor_file = download(f'voices/{voice}.pt')
            tensor = torch.load(tensor_file, weights_only=True, map_location='cpu')
            for line in role['lines']:
                asset_id = f"{line['id']}__{voice}"
                destination = ROOT / 'audio' / f"{line['id']}_{voice}.wav"
                destination.parent.mkdir(exist_ok=True)
                previous = assets.get(asset_id)
                if not args.force and previous and destination.exists() and previous['sha256'] == sha(destination) and previous['text'] == line['text'] and old.get('model', {}).get('weightsSha256') == metadata['model']['weightsSha256'] and previous.get('voiceTensorSha256') == sha(tensor_file):
                    print('KEEP', destination.name, flush=True)
                    continue
                started = time.perf_counter()
                with torch.inference_mode():
                    results = list(pipeline(line['text'], voice=tensor, speed=1, split_pattern=None))
                samples = np.concatenate([r.audio.cpu().numpy() for r in results]).astype(np.float32)
                rms = float(np.sqrt(np.mean(samples ** 2)))
                if not np.isfinite(samples).all() or len(samples) < 2400 or rms < .001:
                    raise ValueError(f'Invalid/silent audio: {asset_id}')
                peak = float(np.max(np.abs(samples)))
                attenuation = min(1., .98 / peak)
                sf.write(destination, samples * attenuation, 24000, subtype='PCM_16')
                assets[asset_id] = dict(id=asset_id, lineId=line['id'], roleId=role['id'], voiceId=voice,
                    candidate=candidate, text=line['text'], emotionIntent=line['emotion'], source=line['source'],
                    gameLineId=line['gameLineId'], src='audio/' + destination.name, status='generated',
                    manualReview='pending', productionApproved=False, sha256=sha(destination),
                    voiceTensorSha256=sha(tensor_file), duration=round(len(samples) / 24000, 4),
                    peak=round(peak, 6), rms=round(rms, 6), gain=round(attenuation, 6),
                    phonemes=' '.join(r.phonemes for r in results),
                    alignment={'status': 'not-aligned', 'visemes': [], 'note': 'Phoneme text is not timing alignment.'},
                    generationSeconds=round(time.perf_counter() - started, 2))
                save()
                generated += 1
                print('GENERATED', destination.name, assets[asset_id]['duration'], 'seconds', flush=True)
                if args.limit and generated >= args.limit:
                    return
    save()
    print('DONE', len(assets), 'actual audition assets; no production files changed.', flush=True)

if __name__ == '__main__':
    main()

