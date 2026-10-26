"""Regenerate the React course data and portable HTML from the authored curriculum."""
import json
import runpy
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
course = runpy.run_path(str(HERE / 'course.py'))
sources = json.loads((HERE / 'sources.json').read_text())
for source in sources:
    source['usable'] = source['ok'] and source.get('characters', 0) > 800
data = dict(version=1, updated='26 October 2026', stages=course['STAGES'],
            lessons=course['LESSONS'], exam=course['FINAL'], glossary=course['GLOSSARY'],
            checklist=course['CHECKLIST'], sources=sources)
(REPO / 'src/networking/content.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
# build.py imports its adjacent course module.
import sys
sys.path.insert(0, str(HERE))
runpy.run_path(str(HERE / 'build.py'))
shutil.copyfile(HERE / 'index.html', REPO / 'public/react-native-networking/fieldguide.html')
print('Updated React curriculum and portable field guide. Review and test changes before publishing.')
