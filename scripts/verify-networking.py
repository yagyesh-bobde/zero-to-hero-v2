"""Browser acceptance for the integrated React course, not native networking guarantees.

Start Vite, then run: uv run --with playwright scripts/verify-networking.py
Pass --base http://localhost:4173 to check the built preview instead.
Requires Google Chrome. Results and screenshots are written outside the repo by default.
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default='http://localhost:5173')
parser.add_argument('--output', default='/tmp/zero-to-hero-networking-verification')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
data = json.loads((repo / 'src/networking/content.json').read_text())
out = Path(args.output)
out.mkdir(parents=True, exist_ok=True)
checks = []


def check(name, condition):
    if not condition:
        raise AssertionError(name)
    checks.append(name)


with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 960}, accept_downloads=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    # Test only in a fresh browser context. Existing user data is never modified.
    page.goto(args.base + '/react-native-networking')
    page.locator('.net-hero h1').wait_for()
    page.evaluate("""() => {
      localStorage.setItem('zero-to-hero-progress-v1', 'main sentinel');
      localStorage.setItem('rn-ota-learning-v1', 'OTA sentinel');
      localStorage.setItem('zero-to-hero-theme-v1', 'main theme sentinel');
      localStorage.setItem('rn-ota-theme-v1', 'OTA theme sentinel');
    }""")

    def go(route):
        page.evaluate('(r)=>{location.hash="/"+r}', route)
        page.wait_for_function('(r)=>location.hash==="#/"+r', arg=route)
        if route.startswith('lesson/'):
            page.wait_for_function('(id)=>document.querySelector(".net-lesson-header h1")?.textContent===id', arg=next(l['title'] for l in data['lessons'] if l['id'] == route.split('/')[1]))
        else:
            page.wait_for_timeout(40)

    def progress():
        return page.evaluate("JSON.parse(localStorage.getItem('rn-networking-learning-v1'))")

    def tab(name):
        page.get_by_role('tab', name=name, exact=True).click()

    def lab(name):
        go('playground')
        page.get_by_role('button', name=name, exact=True).click()

    def run():
        page.get_by_role('button', name='Run simulation', exact=True).click()

    def selected(label, value):
        page.get_by_label(label, exact=True).select_option(value)

    def checked(label, value=True):
        page.get_by_label(label, exact=True).set_checked(value)

    def slider(label, value):
        # React's native input value setter is needed for range controls in headless Chrome.
        page.get_by_role('slider', name=label, exact=True).evaluate("""(e,v)=>{
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,String(v));
          e.dispatchEvent(new Event('input',{bubbles:true}));
          e.dispatchEvent(new Event('change',{bubbles:true}));
        }""", value)

    # Every lesson, its converted code, and every course page must fit each layout.
    for width in [360, 728, 1440]:
        page.set_viewport_size({'width': width, 'height': 960})
        page.wait_for_timeout(250)
        for lesson in data['lessons']:
            go('lesson/' + lesson['id'])
            check(f'{width}px: {lesson["id"]} content renders and fits', page.locator('.net-article-section').count() >= 3 and not page.evaluate('document.documentElement.scrollWidth>innerWidth'))
            check(f'{width}px: {lesson["id"]} code preserved', page.locator('.net-article-section pre').count() == lesson['body'].count('```') // 2)
            tab('Check in')
            check(f'{width}px: {lesson["id"]} three checks render', page.locator('.net-quiz').count() == 3)
        for route in ['overview', 'path', 'playground', 'review', 'notebook', 'sources']:
            go(route)
            check(f'{width}px: {route} fits', not page.evaluate('document.documentElement.scrollWidth>innerWidth'))
        go('playground')
        for name in ['Response contracts', 'Retry & uncertainty', 'Cache clocks', 'Session races', 'Durable outbox', 'Trace waterfall', 'Honest metrics', 'Incident desk', 'JavaScript workshop']:
            page.get_by_role('button', name=name, exact=True).click()
            check(f'{width}px: {name} activity fits', not page.evaluate('document.documentElement.scrollWidth>innerWidth'))
        go('overview')
        page.screenshot(path=str(out / f'overview-{width}.png'), full_page=True)

    page.set_viewport_size({'width': 1440, 'height': 960})
    go('lesson/mental-model')
    tab('Check in')
    first = data['lessons'][0]
    for i, q in enumerate(first['questions']):
        card = page.locator('.net-quiz').nth(i)
        if i == 0:
            card.locator('.net-quiz-option').nth((q['answer'] + 1) % 3).click()
            check('Incorrect lesson choice includes teaching explanation', card.locator('.net-quiz-feedback p').inner_text() == q['why'])
            go('review')
            check('Mistake review links to the affected lesson', page.locator('.net-review-mistake').count() == 1)
            go('lesson/mental-model')
            tab('Check in')
            card = page.locator('.net-quiz').nth(i)
        card.locator('.net-quiz-option').nth(q['answer']).click()
    page.get_by_role('button', name='Complete lesson', exact=True).click()
    page.get_by_role('button', name='Bookmark lesson', exact=True).click()
    page.get_by_role('button', name='Toggle lesson notes').click()
    note = '<img src=x onerror="window.unsafe=true"> A lost reply does not prove rollback.'
    page.get_by_label('Your explanation, in your words').fill(note)
    page.reload()
    page.locator('.net-lesson-header h1').wait_for()
    check('Lesson progress and bookmark survive reload', 'mental-model' in progress()['completed'] and 'mental-model' in progress()['bookmarks'])
    check('Notes persist and are plain text', progress()['notes']['mental-model'] == note and not page.evaluate('!!window.unsafe'))
    # Roving lesson tabs and arrow keys follow the existing course pattern.
    page.get_by_role('tab', name='Understand', exact=True).focus()
    page.keyboard.press('ArrowRight')
    check('Lesson tabs support keyboard navigation', page.get_by_role('tab', name='Explore', exact=True).get_attribute('aria-selected') == 'true')
    page.get_by_role('button', name='Search course', exact=True).click()
    page.get_by_role('textbox', name='Search lessons').fill('PKCE')
    check('Search finds body concepts', page.locator('.net-search-results a').count() > 0)
    page.keyboard.press('Escape')
    check('Escape closes search', page.get_by_role('dialog').count() == 0)
    page.get_by_role('button', name='Switch to light theme').click()
    page.reload()
    page.locator('.net-lesson-header h1').wait_for()
    check('Independent theme persists', page.evaluate("document.documentElement.dataset.networkTheme") == 'light')

    lab('Response contracts')
    for status, action in [('202', 'pending'), ('204', 'empty'), ('429', 'wait')]:
        selected('Response', status)
        selected('Your next action', action)
        run()
    check('HTTP challenge records three distinct response decisions', 'http' in progress()['labs'])
    lab('Retry & uncertainty')
    run()
    check('Unsafe recovery shows duplicate effects', '2' in page.locator('.net-model-readouts').inner_text())
    checked('Reuse the persisted operation key')
    checked('Server implements atomic durable deduplication')
    run()
    check('Safe retry badge and config persist', 'retry' in progress()['labs'] and progress()['labState']['retry']['stable'])
    lab('Cache clocks')
    run()
    checked('Mount as account B instead of A')
    run()
    check('Cache challenge requires stale data and identity isolation', 'cache' in progress()['labs'])
    lab('Session races')
    checked('Single-flight refresh per session')
    checked('Log out before refresh completes')
    checked('Check captured session epoch before saving / replaying')
    run()
    check('Logout race challenge preserves signed-out state', 'auth' in progress()['labs'] and 'Signed out' in page.locator('.net-model-readouts').inner_text())
    lab('Durable outbox')
    checked('Persist and reuse the same operation key')
    checked('Server durably deduplicates the key')
    checked('Bind outbox to its original account')
    run()
    check('Outbox challenge recovers one authoritative outcome', 'outbox' in progress()['labs'] and 'Recovered: one order' in page.locator('.net-model-output').inner_text())
    lab('Trace waterfall')
    selected('Controlled scenario', 'b')
    selected('Your diagnosis', 'database')
    run()
    check('Trace diagnosis displays a connected waterfall', 'trace' in progress()['labs'] and page.locator('.net-waterfall .net-span-track').count() == 5)
    lab('Honest metrics')
    slider('Failures recovered by retry', 100)
    selected('Denominator for final operation success', 'operations')
    run()
    check('Metric challenge separates attempt and operation success', 'metrics' in progress()['labs'] and '83.3%' in page.locator('.net-model-readouts').inner_text())
    lab('Incident desk')
    for incident, cause, step in [('0', '1', '1'), ('1', '0', '1'), ('2', '0', '1')]:
        selected('Incident', incident)
        selected('Most supported explanation', cause)
        selected('Next action', step)
        page.get_by_role('button', name='Check the evidence', exact=True).click()
    check('Incident challenge requires three correct cause/action pairs', 'diagnosis' in progress()['labs'])

    # Exercise the actual disposable browser worker, not a simulated function call.
    lab('JavaScript workshop')
    exercise_select = page.get_by_label('Choose an exercise', exact=True)
    ids = exercise_select.locator('option').evaluate_all('(options)=>options.map(o=>o.value)')
    check('Workshop exposes all six executable exercises', len(ids) == 6)
    for exercise in ids:
        exercise_select.select_option(exercise)
        page.get_by_role('button', name='Run checks', exact=True).click()
        page.locator('.net-test-row').first.wait_for()
        check(f'{exercise}: starter does not pass browser worker', 'checks passed' in page.locator('.net-test-summary').inner_text() and exercise not in progress()['passed'])
        page.get_by_role('button', name='Show reference solution', exact=True).click()
        page.get_by_role('button', name='Use solution in editor', exact=True).click()
        page.get_by_role('button', name='Run checks', exact=True).click()
        page.wait_for_function('(id)=>JSON.parse(localStorage.getItem("rn-networking-learning-v1")).passed.includes(id)', arg=exercise)
        check(f'{exercise}: reference passes actual browser worker', 'is-correct' in page.locator('.net-test-summary').get_attribute('class'))
    page.get_by_label('JavaScript exercise code').fill('function supports(){while(true){}}')
    page.get_by_role('button', name='Run checks', exact=True).click()
    page.get_by_text('Stopped after 2 seconds.', exact=False).wait_for()
    check('An infinite exercise terminates while the UI stays responsive', page.get_by_role('button', name='Run checks', exact=True).is_enabled())

    # Demonstrate code-gated completion with all three quiz answers.
    go('lesson/http')
    tab('Check in')
    for i, q in enumerate(next(l for l in data['lessons'] if l['id'] == 'http')['questions']):
        page.locator('.net-quiz').nth(i).locator('.net-quiz-option').nth(q['answer']).click()
    check('An assigned passed coding exercise enables lesson completion', page.get_by_role('button', name='Complete lesson', exact=True).is_enabled())
    page.get_by_role('button', name='Complete lesson', exact=True).click()

    go('review')
    page.get_by_role('searchbox', name='Find a concept', exact=True).fill('idempotency')
    page.get_by_role('button', name='Reveal flashcard definition', exact=True).click()
    check('Glossary search and flashcards work', page.locator('.net-flashcard > span').is_visible())
    for i, q in enumerate(data['exam']):
        page.locator('.net-quiz').nth(i).locator('.net-quiz-option').nth(q['answer']).click()
    page.get_by_role('button', name='Check all 16 answers', exact=False).click()
    check('Final assessment submits, explains, and stores best score', progress()['exam']['bestScore'] == 16 and progress()['exam']['submitted'] and page.locator('.net-quiz-feedback').count() == 16)
    page.reload()
    page.locator('.net-quiz').first.wait_for()
    check('Submitted assessment survives reload', page.get_by_text('16/16 · Checkpoint passed', exact=False).is_visible())

    go('notebook')
    page.locator('.net-evidence-list input').first.check()
    page.get_by_label('3. Observations and evidence', exact=True).fill('API committed; reply was lost. Operation identity matched.')
    with page.expect_download() as event:
        page.get_by_role('button', name='Backup progress', exact=True).click()
    backup = out / 'progress.json'
    event.value.save_as(backup)
    exported = json.loads(backup.read_text())
    check('Backup includes notes, labs, code, assessment, checklist, and journal', exported['notes']['mental-model'] == note and len(exported['labs']) == 8 and exported['checklist'] == ['0'] and exported['exam']['bestScore'] == 16 and 'evidence' in exported['journal'])
    before = progress()
    page.locator('input[type=file]').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{"course":"another-course","version":1}'})
    page.get_by_role('status').filter(has_text='Choose a version 1 React Native Networking backup').wait_for()
    check('Wrong-course import is rejected without replacement', page.locator('.net-import-preview').count() == 0 and progress() == before)
    page.locator('input[type=file]').set_input_files(str(backup))
    page.locator('.net-import-preview').wait_for()
    check('Valid import presents a review before replacement', page.locator('.net-import-preview').is_visible() and progress() == before)
    page.get_by_role('button', name='Replace networking progress', exact=True).click()
    check('Confirmed import round-trips the backup', progress()['notes'] == exported['notes'] and progress()['exam'] == exported['exam'])
    with page.expect_download() as event:
        page.get_by_role('link', name='Save standalone course HTML', exact=True).click()
    html_path = out / 'standalone.html'
    event.value.save_as(html_path)
    check('Standalone course download is available', html_path.stat().st_size > 250_000)
    with page.expect_download() as event:
        page.get_by_role('button', name='Export notes', exact=True).click()
    notes_path = out / 'notes.md'
    event.value.save_as(notes_path)
    check('Notebook Markdown contains lesson notes and incident evidence', note in notes_path.read_text() and 'API committed' in notes_path.read_text())
    check('Networking actions preserve all other-course progress and themes', page.evaluate("""() => localStorage.getItem('zero-to-hero-progress-v1')==='main sentinel' && localStorage.getItem('rn-ota-learning-v1')==='OTA sentinel' && localStorage.getItem('rn-ota-theme-v1')==='OTA theme sentinel' && localStorage.getItem('zero-to-hero-theme-v1')==='main theme sentinel'"""))

    # Corrupt-record preservation and explicit recovery in a separate test profile.
    corrupt = browser.new_context()
    corrupt.add_init_script("localStorage.setItem('rn-networking-learning-v1','{broken')")
    bad = corrupt.new_page()
    bad.goto(args.base + '/react-native-networking#/notebook')
    bad.get_by_role('button', name='Download original saved record', exact=True).wait_for()
    check('Corrupt saved record is not overwritten on mount', bad.evaluate("localStorage.getItem('rn-networking-learning-v1')") == '{broken')
    with bad.expect_download() as event:
        bad.get_by_role('button', name='Download original saved record', exact=True).click()
    original = out / 'unreadable.txt'
    event.value.save_as(original)
    check('Recovery downloads the exact original saved bytes', original.read_text() == '{broken')
    bad.locator('input[type=file]').set_input_files(str(backup))
    bad.get_by_role('button', name='Replace networking progress', exact=True).click()
    check('Explicit valid import unlocks recovery writes', bad.evaluate("JSON.parse(localStorage.getItem('rn-networking-learning-v1')).notes['mental-model']") == note)
    corrupt.close()
    blocked = browser.new_context()
    blocked.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError')}})")
    bp = blocked.new_page()
    bp.goto(args.base + '/react-native-networking')
    bp.locator('.net-storage-error').wait_for()
    check('Blocked storage reports session-only use without preventing study', bp.locator('.net-hero h1').is_visible())
    blocked.close()

    # Phone navigation and focus control.
    page.set_viewport_size({'width': 390, 'height': 844})
    go('lesson/retry')
    page.get_by_role('button', name='Toggle navigation', exact=True).click()
    check('Mobile drawer opens with a modal navigation role', page.locator('.net-sidebar').get_attribute('aria-modal') == 'true')
    page.keyboard.press('Escape')
    check('Escape closes the mobile drawer', not page.locator('.net-app').get_attribute('class').endswith('net-mobile-open'))
    tab('Explore')
    run()
    page.screenshot(path=str(out / 'lesson-mobile.png'), full_page=True)
    check('No networking browser runtime exceptions', not errors)

    # Other courses still render with their own entry and styles.
    for path, selector, label in [('/', '.app-shell', 'Main'), ('/react-native-ota', '.ota-app', 'OTA')]:
        other = context.new_page()
        other_errors = []
        other.on('pageerror', lambda e: other_errors.append(str(e)))
        other.goto(args.base + path)
        # Main wrapper is .app, while its h1 is the stable public smoke check.
        other.locator('h1').first.wait_for()
        check(f'{label} course still renders', other.locator('h1').first.is_visible() and not other_errors and other.locator('.net-app').count() == 0)
        check(f'{label} entry does not load networking CSS', not any('networking' in url for url in other.locator('link[rel=stylesheet]').evaluate_all('(els)=>els.map(e=>e.href)')))
        other.close()
    browser.close()

(out / 'results.json').write_text(json.dumps({'base':args.base, 'count':len(checks), 'checks':checks, 'errors':errors}, indent=2))
print(f'{len(checks)} browser checks passed. Results: {out / "results.json"}')
