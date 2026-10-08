# SellMyCompanyData

Landing page + instant data-valuation calculator.

AI labs pay for the operating record inside a business. This site lets a company
get a ballpark valuation of its operational data in 60 seconds, then book a call.

Static site. Single `index.html`. No build step, no dependencies.

## Brand system

The seller, buyer and referral pages use the approved Exchange identity.
`brand.css` applies the shared colors, typography and responsive
brand treatment. Production logo masters live in `assets/brand/`; Inter is
self-hosted in `assets/fonts/` with its OFL licence. The seller, buyer and referral pages each use an approved
`assets/brand/*-link-preview.png` social preview. The licensing-process and
buyer-workflow SVGs reuse the content regions of the approved brand artwork;
mobile renders readable text equivalents. The core tagline is “Your company
data. Licensed for AI.” and the footer descriptor is “Business data licensing
for AI.”. Keep the existing conversion scripts independent of
branding changes.

Run the calculator regression check with `node tests/valuation.test.cjs`.
GitHub Pages publishes the repository root from `main`.

## Flow and mobile audit fixes

`audit.css` follows `brand.css` with focused layout corrections using Exchange
tokens. The calculator appears before the industry grid; the grid can expand on
mobile. Privacy and website/referral terms are available at `/privacy/` and
`/terms/`. The unsupported business email address has been removed.

The frontend now sends calculator context with a seller enquiry and opens the
personal Cal.com calendar after an API success. Backend persistence of the new
fields, separate Slack delivery, conversion collection and calendar sync still
need verification: see [backend activation](docs/backend-activation.md).

Browser regression checks: install Python Playwright and Chromium, then run
`python tests/audit_flows.py`. API requests are intercepted; tests do not create
real leads or bookings. Set `SITE_TEST_URL` to check a deployed site.

## Analytics and search

Public discovery content lives in `data-licensing/`, `data-valuation/`,
`robots.txt`, `sitemap.xml`, `llms.txt` and `llms-full.txt`. Schema describes the
visible pages and FAQ answers; do not add invented reviews, clients or prices.

`analytics.js` provides consent-gated GA4/PostHog event transport. Providers are
disabled while `analytics-config.js` identifiers are empty. Account activation,
Google ownership verification and end-to-end delivery are separate steps; see
[analytics and search setup](docs/analytics-and-search.md).

Verification: `python tests/discovery_analytics.py` checks metadata, structured
FAQ parity, links, sitemap, all seven page layouts, consent and event privacy.
After a production deploy, `python scripts/submit_indexnow.py` notifies IndexNow
of the published sitemap URLs; it does not guarantee indexing.

## Mobile app layout

`mobile.css` is the final shared stylesheet on all seven pages. At 900px and
below it provides a compact header, safe-area-aware bottom navigation, and
touch controls. The seller calculator and estimate come before the sources
band; the estimate precedes its fields and becomes a compact top summary
when scrolled away. Navigation and the summary yield while form fields have
focus. Desktop retains its existing two-column calculator.

With the site running locally on port 8000, run `python tests/mobile_layout.py`
(or set `SITE_TEST_URL`) to check the app shell at five viewport widths.
