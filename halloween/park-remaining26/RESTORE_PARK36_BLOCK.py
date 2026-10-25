import importlib.util,subprocess,sys,urllib.request,hashlib
from pathlib import Path
missing=[p for p in ('numpy','soundfile','ipywidgets') if importlib.util.find_spec(p) is None]
if missing:subprocess.check_call([sys.executable,'-m','pip','install','--quiet',*missing])
EXPECTED={'park_tools.py': '1290d16eed017c3aff349924cf797fb71cb8dfa6ec59dbc3e35ef2521b842412', 'remaining26_runner.py': 'cbb71c716b761811d6c55eb6405a95c4da160463c32fde4bed887d06b4ef94c7'}
modules={}
for filename,h in EXPECTED.items():
    url='https://raw.githubusercontent.com/LiaoPeiTing/rosie-picnic/main/halloween/park-remaining26/'+filename
    data=urllib.request.urlopen(url).read()
    if hashlib.sha256(data).hexdigest()!=h:raise ValueError('工具版本不符，停止；請重開新版Notebook')
    name='park_tools' if filename=='park_tools.py' else 'park_locked_restore'
    spec=importlib.util.spec_from_loader(name,loader=None);module=importlib.util.module_from_spec(spec)
    sys.modules[name]=module;exec(compile(data,filename,'exec'),module.__dict__);modules[filename]=module
runner=modules['remaining26_runner.py']
from google.colab import files,output as colab_output
colab_output.enable_custom_widget_manager()
if 'OUTPUT' in globals() and (Path(OUTPUT)/'generated-manifest.json').exists():
    runner.validate_output(OUTPUT)
else:
    uploaded=files.upload()
    if len(uploaded)!=1:raise ValueError('只上傳一個Park剩餘26段結果ZIP')
    OUTPUT=runner.restore(next(iter(uploaded.values())),Path('/content'))
print('已恢復現有WAV與驗收紀錄；九句+共用音核對鎖定。不下載TTS、不用GPU、不生成。')
PARK_REVIEW_UI=runner.show_review(OUTPUT)