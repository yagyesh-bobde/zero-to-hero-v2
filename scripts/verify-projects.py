"""Smoke-test the complete chapter builds. Run with a Python that has torch installed."""
import importlib.util
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parent.parent / 'public' / 'projects'
torch_available = importlib.util.find_spec('torch') is not None
projects = [
    ('micrograd', ['--steps', '12'], False),
    ('bigram', ['--samples', '3'], False),
    ('mlp', ['--steps', '2'], True),
    ('batchnorm', ['--steps', '2'], True),
    ('backprop', ['--steps', '2'], True),
    ('wavenet', ['--steps', '2'], True),
    ('gpt', ['--steps', '2'], True),
    ('tokenizer', [], False),
]
failures = []
for name, args, needs_torch in projects:
    path = root / (name + '.py')
    compile(path.read_text(), str(path), 'exec')
    if needs_torch and not torch_available:
        print('SKIP', name, '(install public/projects/requirements.txt for tensor checks)', flush=True)
        continue
    result = subprocess.run([sys.executable, str(path), *args], capture_output=True, text=True, timeout=90)
    print(('PASS' if result.returncode == 0 else 'FAIL'), name, flush=True)
    if result.returncode:
        failures.append(name)
        print(result.stdout + result.stderr)
if failures:
    raise SystemExit('Failed projects: ' + ', '.join(failures))
print('All available project checks passed.')
