param([string]$Python = 'python')
$ErrorActionPreference = 'Stop'
$auditionRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
& $Python -c "import sys,struct; assert sys.version_info[:2] == (3,12) and struct.calcsize('P')==8, 'Please use 64-bit Python 3.12'"
if ($LASTEXITCODE -ne 0) { throw 'Python 3.12 x64 is required.' }
$venvPath = Join-Path $auditionRoot '.venv'
& $Python -m venv $venvPath
if ($LASTEXITCODE -ne 0) { throw 'Could not create virtual environment.' }
$auditionPython = Join-Path $venvPath 'Scripts/python.exe'
& $auditionPython -m pip install 'torch==2.14.1+cpu' --index-url https://download.pytorch.org/whl/cpu
if ($LASTEXITCODE -ne 0) { throw 'PyTorch CPU installation failed.' }
& $auditionPython -m pip install -r (Join-Path $PSScriptRoot 'requirements-lock.txt')
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
& $auditionPython -m pip check
if ($LASTEXITCODE -ne 0) { throw 'Dependency check failed.' }
Write-Host 'Ready. Generate the audition samples with:'
Write-Host "& '$auditionPython' '$(Join-Path $PSScriptRoot 'generate.py')' --candidate both"
