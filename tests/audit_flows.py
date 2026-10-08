"""Browser flow regressions. All POSTs and calendar loads are intercepted."""
import functools
import http.server
import json
import os
from pathlib import Path
import threading
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = None
url = os.environ.get('SITE_TEST_URL', '').rstrip('/')
if not url:
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}'
out = Path(os.environ.get('SITE_TEST_ARTIFACTS', '/tmp/smcd-audit-checks'))
out.mkdir(exist_ok=True, parents=True)
results = {'layouts': [], 'flows': []}
try:
 with sync_playwright() as p:
    browser = p.chromium.launch(args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':390,'height':900}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    calls = []
    def api(route):
        calls.append((urlparse(route.request.url).path, route.request.post_data_json))
        route.fulfill(status=200, content_type='application/json', body='{"ok":true}')
    page.route('**/api/*', api)
    page.route('https://cal.com/**', lambda route:route.fulfill(status=200,content_type='text/html',body='<p>Calendar intercepted for test</p>'))
    for width in [320,390,768,1440]:
      page.set_viewport_size({'width':width,'height':900})
      for path in ['/', '/buyers/', '/refer/', '/privacy/', '/terms/']:
        response = page.goto(url+path, wait_until='networkidle')
        assert response.ok, (width,path,response.status)
        page.evaluate('document.fonts.ready')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width,path,'overflow')
        assert not page.locator('a[href^="mailto:"]').count(), (path,'email not removed')
        assert not page.locator('body').inner_text().find('hello@sellmycompanydata.com') >= 0
        broken = page.locator('img').evaluate_all('(imgs)=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)')
        assert not broken, broken
        results['layouts'].append({'width':width,'path':path,'overflow':False})
        if width in [390,1440] and path in ['/','/buyers/']:
          page.screenshot(path=str(out/f'{width}-{path.strip("/") or "home"}.png'))
    page.set_viewport_size({'width':390,'height':900})
    page.goto(url+'/')
    expect(page.locator('#estimate-label')).to_have_text('Example estimate')
    assert page.locator('#value').evaluate('(e)=>e.offsetTop') < page.locator('#business-fit').evaluate('(e)=>e.offsetTop')
    expect(page.locator('.business-card:visible')).to_have_count(4)
    page.locator('.industry-toggle').click()
    expect(page.locator('.business-card:visible')).to_have_count(12)
    page.locator('.industry-toggle').click()
    page.locator('#emp').fill('24')
    page.locator('#rev').select_option('1-10m')
    page.locator('#yr').select_option('2015')
    page.locator('#ind').select_option('Software & SaaS')
    page.locator('#sys button').first.click()
    expect(page.locator('#estimate-label')).to_have_text('Your indicative estimate')
    expect(page.locator('#estimate-hint')).to_be_hidden()
    actual = page.locator('#range').inner_text()
    expected = page.evaluate("()=>{let r=DataValuation.estimate({employees:24,revenue:'1-10m',founded:2015});return DataValuation.format(r.low)+' – '+DataValuation.format(r.high)}")
    assert actual == expected, (actual,expected)
    page.locator('#value .result').scroll_into_view_if_needed()
    page.wait_for_timeout(150)
    assert not page.locator('#appbar').evaluate('(e)=>e.classList.contains("show")')
    page.screenshot(path=str(out/'390-result.png'))
    page.locator('#emp').scroll_into_view_if_needed()
    page.screenshot(path=str(out/'390-calculator.png'))
    for field,value in [('first-name','Audit'),('last-name','Preview'),('email','audit@example.com'),('company','Audit Company'),('website','example.com')]:
      page.locator('#'+field).fill(value)
    page.locator('#authority').select_option(label='I own the business')
    page.locator('.qualification summary').click()
    page.locator('#data-context').fill('Three years of support tickets')
    page.locator('#lead-submit').click()
    expect(page.locator('#booking')).to_be_visible()
    payload = calls[-1][1]
    for key,value in {'employees':'24','revenue':'1-10m','founded':'2015','industry':'Software & SaaS','systems':['Salesforce'],'estimateIsExample':False,'authority':'I own the business','dataContext':'Three years of support tickets'}.items():
      assert payload[key] == value, (key,payload)
    calendar = urlparse(page.locator('#booking-calendar').get_attribute('src'))
    assert calendar.netloc == 'cal.com' and calendar.path == '/jamesrowdyy/15min'
    assert parse_qs(calendar.query)['email'] == ['audit@example.com']
    events = page.evaluate('window.dataLayer')
    assert {e['event'] for e in events} >= {'smcd_estimate_started','smcd_estimate_completed','smcd_seller_lead_submitted','smcd_booking_opened'}
    assert all(set(e)=={'event','page'} for e in events), events
    results['flows'].append('seller context and personal Cal.com handoff; anonymous event contract')
    page.goto(url+'/')
    page.unroute('**/api/*')
    page.route('**/api/*', lambda route:route.abort())
    for field,value in [('first-name','Audit'),('email','audit@example.com'),('company','Audit Company')]:page.locator('#'+field).fill(value)
    page.locator('#authority').select_option(label='I own the business')
    page.locator('#lead-submit').click()
    expect(page.locator('#lead-msg')).to_contain_text('Network error')
    expect(page.locator('#first-name')).to_have_value('Audit')
    expect(page.locator('#booking')).to_be_hidden()
    assert 'smcd_seller_lead_submitted' not in [e['event'] for e in page.evaluate('window.dataLayer || []')]
    results['flows'].append('failed submission keeps answers and does not open booking or emit success')
    page.unroute('**/api/*');page.route('**/api/*',api)
    page.goto(url+'/buyers/')
    for field,value in [('b-sector','Software'),('b-name','Audit'),('b-org','Audit Lab'),('b-email','audit@example.com')]:page.locator('#'+field).fill(value)
    before = len(calls)
    page.locator('#buyer-submit').click()
    expect(page.locator('#buyer-msg')).to_contain_text('select at least one')
    assert len(calls)==before
    page.locator('#b-types button').first.click()
    page.locator('#seg-timeline button').last.click()
    page.locator('#buyer-submit').click()
    expect(page.locator('#buyer-msg')).to_have_class('form-msg ok')
    expect(page.locator('#b-timeline')).to_have_value('ASAP')
    expect(page.locator('#seg-timeline .on')).to_have_attribute('data-v','ASAP')
    expect(page.locator('#b-types .on')).to_have_count(0)
    results['flows'].append('buyer selection validation and complete reset')
    page.goto(url+'/refer/')
    for field,value in [('r-name','Audit'),('r-email','audit@example.com'),('r-company','Audit Company')]:page.locator('#'+field).fill(value)
    page.locator('#r-industry').select_option(label='Software & SaaS')
    before = len(calls)
    page.locator('#refer-submit').click()
    expect(page.locator('#refer-msg')).to_contain_text('select a company size')
    assert len(calls)==before
    page.locator('#r-size-chips button').nth(2).click()
    page.locator('#r-years-chips button').nth(2).click()
    page.locator('#refer-submit').click()
    expect(page.locator('#refer-msg')).to_have_class('form-msg ok')
    for field in ['r-size','r-years','r-name']:expect(page.locator('#'+field)).to_have_value('')
    expect(page.locator('#refer-form .chip.on')).to_have_count(0)
    results['flows'].append('referral validation and complete hidden/visual reset')
    assert not errors, errors
    browser.close()
finally:
 if server: server.shutdown()
(out/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
