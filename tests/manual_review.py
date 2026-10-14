"""Manual review regressions; API/calendar/analytics intercepted, no live leads."""
import functools
import http.server
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args): pass
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        calls, errors = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.route('https://**', lambda r: r.fulfill(body=''))
        def api(route):
            calls.append(route.request.post_data_json)
            route.fulfill(content_type='application/json', body='{"ok":true}')
        page.route('**/api/lead', api)
        year = page.evaluate('new Date().getFullYear()')
        for staff, age in [(10, 8), (20, 2), (1, 0)]:
            page.goto(url + '/?src=specialist-test')
            page.locator('#emp').fill(str(staff))
            page.locator('#yr').select_option(str(year-age))
            expect(page.locator('#estimate-label')).to_have_text('Manual review needed')
            expect(page.locator('#range')).to_be_hidden()
            expect(page.locator('#calc-cta')).to_be_visible()
            expect(page.locator('#calc-cta')).to_have_text('Request manual review')
            page.locator('#calc-cta').click()
            expect(page.locator('.qualification')).to_have_attribute('open', '')
            page.locator('#data-context').fill('Specialist manufacturing archive and RL environment; scope to review.')
            for field, value in [('first-name','Test'), ('email','test@example.com'), ('company','Test only')]:
                page.locator('#'+field).fill(value)
            page.locator('#authority').select_option(label='I own the business')
            expect(page.locator('#lead-submit')).to_have_text('Request manual review')
            page.locator('#lead-submit').click()
            expect(page.locator('#lead-msg')).to_be_visible()
            expect(page.locator('#lead-msg')).to_contain_text('manual review')
            expect(page.locator('#booking')).to_be_hidden()
            assert not page.locator('#booking-calendar').get_attribute('src')
            payload = calls[-1]
            assert payload['qualified'] is False
            assert payload['range'] == 'Manual review requested (outside calculator scope)'
            assert payload['dataContext'].startswith('Specialist manufacturing')
            assert payload['src'] == 'specialist-test'
            assert set(payload) == {'firstName','lastName','email','company','website','range','employees','qualified','years','founded','industry','systems','estimateIsExample','companyCountry','authority','dataContext','_gotcha','src'}
            events = page.evaluate('window.dataLayer')
            # Existing below-bar event is intentionally outside the collector allowlist.
            assert 'smcd_seller_lead_submitted' not in [e['event'] for e in events]
            assert 'smcd_booking_opened' not in [e['event'] for e in events]
            assert all(set(e) == {'event','page'} for e in events)
        # Boundary still gets the original numerical model and booking path.
        page.goto(url + '/')
        page.locator('#emp').fill('20')
        page.locator('#yr').select_option(str(year-3))
        expect(page.locator('#range')).to_be_visible()
        expect(page.locator('#calc-cta')).to_have_text('Book a valuation call')
        expect(page.locator('#lead-submit')).to_have_text('Continue to booking')
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()
print('PASS: 3 manual-review cases, unchanged payload/attribution/events, visible receipt, no calendar, eligible boundary')
