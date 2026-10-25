import importlib.util,subprocess,sys,urllib.request,hashlib
missing=[p for p in ('numpy','soundfile','ipywidgets') if importlib.util.find_spec(p) is None]
if missing:subprocess.check_call([sys.executable,'-m','pip','install','--quiet',*missing])
url='https://raw.githubusercontent.com/LiaoPeiTing/rosie-picnic/main/halloween/park-voice-tools/park_tools.py'
raw=urllib.request.urlopen(url).read()
if hashlib.sha256(raw).hexdigest()!='1290d16eed017c3aff349924cf797fb71cb8dfa6ec59dbc3e35ef2521b842412':raise ValueError('工具版本hash不符，停止；請重開最新恢復Notebook')
spec=importlib.util.spec_from_loader('park_cpu_review',loader=None)
park=importlib.util.module_from_spec(spec);exec(compile(raw,'park_tools.py','exec'),park.__dict__)
from google.colab import files,output as colab_output
from pathlib import Path
colab_output.enable_custom_widget_manager()
if 'OUTPUT' in globals() and (Path(OUTPUT)/'generated-manifest.json').exists():
    park.validate_output(OUTPUT)
else:
    uploaded=files.upload()
    if len(uploaded)!=1:raise ValueError('只上傳一個Park九句或36句結果ZIP')
    OUTPUT=park.restore_results(next(iter(uploaded.values())),Path('/content'))
print('已恢復現有WAV與驗收紀錄，不下載TTS模型、不生成。OUTPUT=',OUTPUT)
PARK_REVIEW_UI=park.show_review(OUTPUT)