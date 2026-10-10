"""Mobile shell checks against a running site; no leads or bookings are sent."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

url = os.environ.get('SITE_TEST_URL', 'http://127.0.0.1:8000').rstrip('/')
paths = ['/', '/buyers/', '/refer/', '/privacy/', '/terms/', '/data-licensing/', '/data-valuation/']
out = Path('/tmp/smcd-mobile-checks')
out.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(args=['--no-sandbox'])
    page = browser.new_page(reduced_motion='reduce')
    page.route('https://static.cloudflareinsights.com/**', lambda r: r.fulfill(body=''))
    for width in [320, 390, 768, 900, 1440]:
        page.set_viewport_size({'width': width, 'height': 844})
        for path in paths:
            page.goto(url + path, wait_until='networkidle')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, path)
            tabs = page.get_by_role('navigation', name='Main destinations')
            if width > 900:
                expect(tabs).to_be_hidden()
                continue
            expect(tabs).to_be_visible()
            rect = tabs.bounding_box()
            assert abs(rect['y'] + rect['height'] - 844) < 1
            for link in tabs.locator('a').all():
                assert link.bounding_box()['height'] >= 44
            if path in paths[:3]:
                expect(tabs.locator('[aria-current="page"]')).to_have_attribute('href', path)
            page.locator('.menu-toggle').click()
            expect(page.locator('#site-nav')).to_be_visible()
            page.keyboard.press('Escape')
            expect(page.locator('#site-nav')).to_be_hidden()
            if path == '/':
                result = page.locator('.calc>.result').bounding_box()
                panel = page.locator('.calc>.panel').bounding_box()
                assert result['y'] + result['height'] <= panel['y']
                assert page.locator('#value').bounding_box()['y'] < page.locator('.logoband').bounding_box()['y']
                page.locator('#emp').fill('24')
                expect(tabs).to_be_hidden()
                page.locator('#ctry').select_option('us')
                page.locator('#yr').select_option('2015')
                page.evaluate('document.activeElement.blur()')
                expect(tabs).to_be_visible()
                expect(page.locator('#appbar-label')).to_have_text('Your indicative estimate')
                page.locator('#sys').scroll_into_view_if_needed()
                expect(page.locator('#appbar')).to_have_class('appbar show')
                expect(page.locator('#appbar-v')).to_have_text(page.locator('#range').inner_text())
                assert page.locator('#appbar').bounding_box()['y'] >= 64
                if width == 390:
                    page.screenshot(path=str(out/'mobile-systems.png'))
                    page.locator('.result').scroll_into_view_if_needed()
                    page.screenshot(path=str(out/'mobile-estimate.png'))
                # Not eligible: no estimate to show, so the sticky bar stays hidden.
                page.locator('#yr').select_option(str(page.evaluate('new Date().getFullYear()')))
                page.evaluate('document.activeElement.blur()')
                page.locator('#sys').scroll_into_view_if_needed()
                page.wait_for_timeout(200)
                assert 'show' not in (page.locator('#appbar').get_attribute('class') or '')
                page.locator('#yr').select_option('2015')
                page.evaluate('document.activeElement.blur()')
            if width == 390:
                page.evaluate('window.scrollTo(0,0)')
                page.screenshot(path=str(out/(path.strip('/') or 'home'))+'.png')
    browser.close()
print('Mobile shell, estimate order, active tabs, menus, keyboard and overflow checks passed at five widths across seven pages.')
