"""Build the dependency-free, self-contained learning module."""
import json
from pathlib import Path
import course

ROOT=Path(__file__).parent
sources=json.loads((ROOT/'sources.json').read_text())
# JavaScript-only shells are access records, not evidence that the article was read.
for source in sources:
 source['usable']=source['ok'] and source.get('characters',0)>800

data={'version':1,'updated':'26 October 2026','stages':course.STAGES,
 'lessons':course.LESSONS,'exam':course.FINAL,'glossary':course.GLOSSARY,
 'checklist':course.CHECKLIST,'sources':sources}
payload=json.dumps(data,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
html=(ROOT/'template.html').read_text().replace('/* COURSE_CSS */',(ROOT/'style.css').read_text()).replace('/* COURSE_JS */',(ROOT/'app.js').read_text()).replace('COURSE_DATA',payload)
(ROOT/'index.html').write_text(html)
print(f'Built {len(html):,} characters; {len(course.LESSONS)} chapters; {sum(len(x["questions"]) for x in course.LESSONS)+len(course.FINAL)} questions; {sum(s["usable"] for s in sources)} readable primary sources.')
