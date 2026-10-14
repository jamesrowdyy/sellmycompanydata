"""Referral attribution checks.

A partner link carries a code in the query (?src=<code>) or in the path (/r/<code>/).
This checks that the code is shown on the referral page, remembered on the estimate page,
carried into the call to action, and posted with both forms. Form posts are intercepted, so
nothing is submitted and no lead is created.

Run against a local static server, or against the live site:
    python3 -m http.server 8765   # in the repo root
    SITE_TEST_URL=http://127.0.0.1:8765 python3 tests/attribution.py
    SITE_TEST_URL=https://sellmycompanydata.com python3 tests/attribution.py

The clean-path check (/r/<code>/) needs the custom 404 page, which only GitHub Pages serves,
so it is skipped locally.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

URL = os.environ.get("SITE_TEST_URL", "http://127.0.0.1:8765").rstrip("/")
CODE = "acme-accounting"
LOCAL = "127.0.0.1" in URL or "localhost" in URL
fails = []


def check(name, ok, detail=None):
    print(("PASS " if ok else "FAIL ") + name + ("" if ok else "  <- " + str(detail)))
    if not ok:
        fails.append(name)


def intercept(page):
    """Capture the next /api/ post instead of sending it."""
    posted = {}

    def handler(route):
        posted["url"] = route.request.url
        posted["body"] = route.request.post_data or ""
        route.fulfill(status=200, content_type="application/json", body='{"ok":true}')

    page.route("**/api/**", handler)
    return posted


def decline_cookies(page):
    btn = page.get_by_role("button", name="Decline")
    if btn.count():
        btn.first.click()


with sync_playwright() as p:
    browser = p.chromium.launch(args=["--no-sandbox"])

    # 1. The referral page shows the code and carries it into its call to action.
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(f"{URL}/r/?src={CODE}", wait_until="networkidle")
    check("/r/ has the referral notice", page.locator("#src-note").count() == 1)
    check("/r/ shows the referral code",
          page.locator("#src-code").count() == 1 and page.locator("#src-code").inner_text().strip() == CODE)
    hrefs = page.eval_on_selector_all("[data-attrib]", "els => els.map(e => e.getAttribute('href'))")
    check("/r/ call to action carries the code",
          len(hrefs) >= 3 and all(("src=" + CODE) in (h or "") for h in hrefs), hrefs)
    check("/r/ has no horizontal overflow",
          page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
    check("/r/ has no javascript errors", not errors, errors)
    page.screenshot(path=os.path.join(os.environ.get('TMPDIR', '.'), 'smcd-r-page.png'))
    ctx.close()

    # 2. A seller arrives through the partner link: the homepage remembers the code and posts it.
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    posted = intercept(page)
    page.goto(f"{URL}/?src={CODE}", wait_until="networkidle")
    decline_cookies(page)
    check("homepage remembers the code", page.evaluate("window.SMCD_SRC") == CODE,
          page.evaluate("window.SMCD_SRC"))
    page.fill("#emp", "120")
    page.select_option("#ctry", "us")
    for i in range(3):
        page.locator("#sys .chip").nth(i).click()
    page.fill("#first-name", "QA")
    page.fill("#last-name", "Attribution")
    page.fill("#email", "qa@example.invalid")
    page.fill("#company", "QA ATTRIBUTION CO")
    page.select_option("#authority", "I own the business")
    page.locator("#lead-submit").click()
    page.wait_for_timeout(1500)
    sent = json.loads(posted["body"]) if posted.get("body", "").startswith("{") else {}
    check("seller form posts to /api/lead", posted.get("url", "").endswith("/api/lead"), posted.get("url"))
    check("seller form posts the referral code", sent.get("src") == CODE, posted.get("body", "")[:200])
    ctx.close()

    # 3. A referrer arrives through the partner link: the referral form posts the code too.
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    posted = intercept(page)
    page.goto(f"{URL}/refer/?src={CODE}", wait_until="networkidle")
    decline_cookies(page)
    check("referral page remembers the code", page.evaluate("window.SMCD_SRC") == CODE,
          page.evaluate("window.SMCD_SRC"))
    page.fill("#r-name", "QA Referrer")
    page.fill("#r-email", "qa-referrer@example.invalid")
    page.fill("#r-company", "QA INTRODUCED CO")
    page.select_option("#r-industry", "Legal")
    page.locator("#r-size-chips button").nth(2).click()
    page.locator("#r-years-chips button").nth(2).click()
    page.locator("#refer-submit").click()
    page.wait_for_timeout(1500)
    sent = json.loads(posted["body"]) if posted.get("body", "").startswith("{") else {}
    check("referral form posts the code", sent.get("src") == CODE, posted.get("body", "")[:200])
    ctx.close()

    # 4. A cleanup check: with no code anywhere, the page still works and posts an empty src.
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    posted = intercept(page)
    page.goto(f"{URL}/", wait_until="networkidle")
    decline_cookies(page)
    check("no code means an empty source", page.evaluate("window.SMCD_SRC") == "",
          page.evaluate("window.SMCD_SRC"))
    page.fill("#emp", "120")
    page.fill("#first-name", "QA")
    page.fill("#email", "qa@example.invalid")
    page.fill("#company", "QA NO SOURCE CO")
    page.select_option("#authority", "I am exploring and need to check permissions")
    page.locator("#lead-submit").click()
    page.wait_for_timeout(1500)
    sent = json.loads(posted["body"]) if posted.get("body", "").startswith("{") else {}
    check("form still submits with an empty source", sent.get("src") == "", posted.get("body", "")[:200])
    ctx.close()

    # 5. A clean partner path (/r/<code>/) is forwarded by the custom 404 page. GitHub Pages only.
    if LOCAL:
        print("SKIP clean partner path (the custom 404 page is served by GitHub Pages only)")
    else:
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        page = ctx.new_page()
        page.goto(f"{URL}/r/{CODE}/", wait_until="networkidle")
        check("clean partner path lands on the referral page",
              "/r/" in page.url and ("src=" + CODE) in page.url, page.url)
        check("clean partner path keeps the code", page.evaluate("window.SMCD_SRC") == CODE,
              page.evaluate("window.SMCD_SRC"))
        ctx.close()

    browser.close()

if fails:
    print("\nFAILED: " + ", ".join(fails))
    sys.exit(1)
print("\nReferral attribution: referral page, estimate page, referral form, empty source and clean path all pass.")
