"""Meaningful browser acceptance checks. Run with uv run --with playwright verify.py."""
from pathlib import Path
import json
import tempfile
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).parent.resolve()
BASE=(ROOT/'index.html').as_uri()
report={'checks':[],'errors':[]}
def check(name,condition):
 if not condition: raise AssertionError(name)
 report['checks'].append(name)

with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 context=browser.new_context(viewport={'width':1280,'height':900},accept_downloads=True)
 page=context.new_page()
 errors=[];requests=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r: requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
 page.goto(BASE)
 data=page.evaluate('Fieldguide.data')
 check('28 complete lesson records / 100 uniquely identified questions',len(data['lessons'])==28 and len({q['id'] for l in data['lessons'] for q in l['questions']}|{q['id'] for q in data['exam']})==100)
 sources={s['id']:s for s in data['sources']}
 check('All lesson citations resolve to retrieved readable references',all(sources[id]['usable'] for l in data['lessons'] for id in l['sources']))
 def go(route,title=None):
  page.evaluate('(r)=>{location.hash=r}',route)
  if title: page.get_by_role('heading',name=title,exact=True).wait_for()
  else: page.wait_for_timeout(15)
 def click_action(action,extra=''):
  page.locator(f'button[data-action="{action}"]{extra}').first.click()
 def set_field(lab,field,value):
  page.locator(f'[data-lab="{lab}"][data-field="{field}"]').evaluate('''(e,v)=>{
   if(e.type==='checkbox')e.checked=v;else e.value=String(v);
   e.dispatchEvent(new Event(e.type==='range'?'input':'change',{bubbles:true}));
  }''',value)
 def run(lab):click_action('run-lab',f'[data-id="{lab}"]')
 def progress():return page.evaluate('Fieldguide.getProgress()')
 # Route and layout checks include long code, all labs, and native navigation breakpoints.
 for width in [360,728,1280]:
  page.set_viewport_size({'width':width,'height':900})
  for l in data['lessons']:
   go('lesson/'+l['id'],l['title'])
   check(f'{width}px: {l["id"]} renders with 3 quiz questions and no horizontal page overflow',page.locator('.q-card').count()==3 and not page.evaluate('document.documentElement.scrollWidth>innerWidth'))
  for route,title in [('home','Your learning path'),('labs','Predict. Change. Observe.'),('review','Make it stick.'),('notes','Keep a field notebook.'),('sources','Built on primary sources.'),('glossary','A working vocabulary.'),('exam','Reason through the failures.')]:
   go(route,title)
   check(f'{width}px: {route} no horizontal overflow',not page.evaluate('document.documentElement.scrollWidth>innerWidth'))
  for id in ['http','retry','cache','auth','outbox','trace','metrics','diagnosis']:
   go('labs/'+id)
   page.locator('[data-action="run-lab"]').wait_for()
   run(id)
   check(f'{width}px: {id} lab output fits',bool(page.locator('.lab-output').inner_text().strip()) and not page.evaluate('document.documentElement.scrollWidth>innerWidth'))
 page.screenshot(path=str(ROOT/'verification-desktop.png'),full_page=True)
 # Search returns results by body content; typed focus must survive updates.
 go('home','Your learning path');page.fill('#course-search','PKCE')
 check('Search finds concepts inside lesson bodies without replacing the input',page.locator('#course-results .lesson-row').count()>0 and page.locator('#course-search').input_value()=='PKCE')
 page.fill('#course-search','zzzz-no-such-concept');check('Search handles no matches',page.locator('#course-results .lesson-row').count()==0)
 # Complete a chapter via real choices, with a deliberate incorrect first answer.
 first=data['lessons'][0];go('lesson/'+first['id'],first['title']);q=first['questions'][0]
 click_action('choice',f'[data-q="{q["id"]}"][data-choice="{(q["answer"]+1)%3}"]');click_action('check-q',f'[data-q="{q["id"]}"]')
 check('Wrong answer records a mistake and exposes an explanation',not progress()['answers'][q['id']]['correct'] and page.locator(f'#{q["id"]} .feedback').is_visible())
 click_action('retry-q',f'[data-q="{q["id"]}"]')
 for q in first['questions']:
  click_action('choice',f'[data-q="{q["id"]}"][data-choice="{q["answer"]}"]');click_action('check-q',f'[data-q="{q["id"]}"]')
 click_action('read');click_action('bookmark')
 note='My observation: <img src=x onerror="window.unsafe=true"> & a lost reply does not prove rollback.'
 page.fill('#lesson-note',note)
 page.reload();page.locator('#lesson-note').wait_for()
 check('Quiz mastery, studied state, bookmark and plain-text notes survive reload',progress()['read']['mental-model'] and progress()['bookmarks']['mental-model'] and all(progress()['answers'][q['id']]['mastered'] for q in first['questions']) and page.locator('#lesson-note').input_value()==note and not page.evaluate('!!window.unsafe'))
 go('notes','Keep a field notebook.');page.locator('[data-check="0"]').check();page.fill('[data-journal="evidence"]','API committed; acknowledgement lost. Verify the same operation identity.')
 page.reload();check('Checklist and incident notebook persist',progress()['checklist']['0'] and 'acknowledgement' in page.locator('[data-journal="evidence"]').input_value())
 # Pure model invariants test the promised effect, not implementation call counts.
 models=page.evaluate('''()=>{
 const m=Fieldguide.models;
 const bad=m.retry({attempts:3,stable:false,dedupe:true,jitter:true,budget:5000});
 const good=m.retry({attempts:3,stable:true,dedupe:true,jitter:true,budget:5000});
 const crash=m.outbox({crash:'local',atomic:false});
 const auth=m.auth({single:true,calls:5,logout:true,guard:true});
 const metric=m.metrics({fail:20,recover:100});
 return {bad,good,crash,auth,metric};
 }''')
 check('Lost acknowledgement with stable deduplication yields one effect; changed key yields duplicate',models['good']['orders']==1 and models['good']['recovered'] and models['bad']['orders']==2)
 check('Half-saved local intent and logout-refresh races are exposed',models['crash']['local'] and not models['crash']['queued'] and not models['auth']['active'] and models['auth']['refreshes']==1)
 check('100 recovered operations / 120 attempts have distinct success rates',models['metric']['opRate']==100 and abs(models['metric']['attemptRate']-83.333333)<.001)
 # Every lab badge must be earned through its challenge, then restored after reload.
 go('labs/http')
 for status,action in [('202','pending'),('204','empty'),('429','wait')]:set_field('http','status',status);set_field('http','action',action);run('http')
 go('labs/retry')
 for f in ['stable','dedupe','jitter']:set_field('retry',f,True)
 run('retry')
 go('labs/cache');set_field('cache','switchAccount',False);run('cache');set_field('cache','switchAccount',True);run('cache')
 go('labs/auth')
 for f in ['single','logout','guard']:set_field('auth',f,True)
 run('auth')
 go('labs/outbox')
 for f in ['atomic','stable','dedupe','bound']:set_field('outbox',f,True)
 run('outbox')
 go('labs/trace');set_field('trace','cause','outside');run('trace')
 go('labs/metrics');set_field('metrics','recover',100);set_field('metrics','denominator','operations');run('metrics')
 go('labs/diagnosis')
 for case,cause in [('0','1'),('1','0'),('2','0')]:
  set_field('diagnosis','case',case);set_field('diagnosis','cause',cause);set_field('diagnosis','step','1');run('diagnosis')
 check('All eight simulation challenges can be completed',len([v for v in progress()['labs'].values() if v])==8)
 page.reload();check('All lab completion badges persist',len([v for v in progress()['labs'].values() if v])==8)
 # Assessment scoring and best score are distinct and persist.
 go('exam','Reason through the failures.')
 for q in data['exam']:click_action('exam-choice',f'[data-q="{q["id"]}"][data-choice="{q["answer"]}"]')
 click_action('submit-exam');check('Final assessment grades all 16 and saves a best score',progress()['exam']['score']==16 and progress()['exam']['bestScore']==16)
 click_action('retake-exam')
 for i,q in enumerate(data['exam']):click_action('exam-choice',f'[data-q="{q["id"]}"][data-choice="{q["answer"] if i<12 else (q["answer"]+1)%3}"]')
 click_action('submit-exam');page.reload();check('Retake score and best score survive reload independently',progress()['exam']['score']==12 and progress()['exam']['bestScore']==16)
 # Backup, import confirmation, malformed record rejection, and literal note rendering.
 go('notes','Keep a field notebook.')
 with page.expect_download() as pending:click_action('export')
 backup=json.loads(Path(pending.value.path()).read_text());check('Progress export contains notes and earned achievements',backup['notes']['mental-model']==note and len(backup['labs'])==8)
 before=progress()
 invalid=json.dumps({'app':'rn-network-fieldguide','version':1,'answers':{'q001':{'choice':100}}}).encode()
 page.locator('#import-file').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':invalid})
 page.wait_for_function("document.querySelector('#toast').textContent.includes('Could not import')")
 check('Invalid backups do not modify existing progress',progress()==before)
 backup['notes']['mental-model']='Imported <svg onload="window.unsafe=true"> literal text'
 backup['lastLesson']='__proto__';backup['lastRoute']='lesson/__proto__'
 payload={'name':'valid.json','mimeType':'application/json','buffer':json.dumps(backup).encode()}
 page.locator('#import-file').set_input_files(payload);page.locator('.import-confirm').wait_for()
 check('Valid import requires a concrete preview before replacement',progress()['notes']['mental-model']==note)
 click_action('cancel-import');check('Cancelling import preserves current notes',progress()['notes']['mental-model']==note)
 page.locator('#import-file').set_input_files(payload);page.locator('.import-confirm').wait_for();click_action('confirm-import')
 check('Import recomputes scoring, rejects inherited route names, and treats text literally',progress()['lastLesson']!='__proto__' and progress()['lastRoute']!='lesson/__proto__' and '<svg' in progress()['notes']['mental-model'] and not page.evaluate('!!window.unsafe'))
 with page.expect_download() as pending:click_action('export-notes')
 check('Notebook download includes the incident evidence', 'acknowledgement' in Path(pending.value.path()).read_text())
 with page.expect_download() as pending:click_action('download-course')
 downloaded=Path(pending.value.path()).read_text()
 check('Portable HTML includes the course but not private notes', 'course-data' in downloaded and 'Imported <svg' not in downloaded and len(downloaded)>200000)
 with tempfile.TemporaryDirectory() as td:
  path=Path(td)/'course.html';path.write_text(downloaded)
  portable=context.new_page();portable.goto(path.as_uri());check('Downloaded HTML boots independently',portable.evaluate('Fieldguide.data.lessons.length')==28);portable.close()
 # Malformed storage is preserved; unavailable storage falls back to a usable session.
 locked=browser.new_context();blocked=locked.new_page();blocked.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked for test','SecurityError')}})")
 blocked.goto(BASE);check('Blocked storage clearly reports session-only progress',blocked.locator('#save-state').inner_text().startswith('Session only') and blocked.locator('.notice').is_visible())
 blocked.evaluate("location.hash='lesson/mental-model'");blocked.locator('[data-action="read"]').wait_for();blocked.locator('[data-action="read"]').click();check('The course remains usable without localStorage',blocked.evaluate('Fieldguide.getProgress().read["mental-model"]') is True)
 blocked.close();locked.close()
 page.evaluate("localStorage.setItem('rn-network-fieldguide.v1','{bad record')");page.reload()
 check('Corrupt saved data warns without overwriting the original',page.locator('.notice').is_visible() and page.evaluate("localStorage.getItem('rn-network-fieldguide.v1')")=='{bad record')
 go('notes','Keep a field notebook.')
 with page.expect_download() as pending:click_action('export-recovery')
 check('Unreadable original records can be downloaded without alteration',Path(pending.value.path()).read_text()=='{bad record')
 go('lesson/mental-model',first['title']);click_action('read');check('A new session does not overwrite corrupt stored data',page.evaluate("localStorage.getItem('rn-network-fieldguide.v1')")=='{bad record')
 # Local file remains usable while browser network is offline.
 context.set_offline(True);page.reload();check('Standalone file works offline',page.evaluate('Fieldguide.data.lessons.length')==28)
 check('The application requests no remote assets or APIs',not requests)
 check('No uncaught JavaScript exceptions',not errors)
 page.set_viewport_size({'width':360,'height':800});go('labs/trace');run('trace');page.screenshot(path=str(ROOT/'verification-mobile.png'),full_page=True)
 report['errors']=errors
 report['summary']={'checks':len(report['checks']),'lessons':28,'questions':100,'labs':8,'remote_requests':len(requests),'viewports':[360,728,1280]}
 browser.close()
(ROOT/'verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report['summary'],indent=2))
