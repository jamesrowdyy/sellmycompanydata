# SellMyCompanyData

Landing page + instant data-valuation calculator.

AI labs pay for the operating record inside a business. This site lets a company
get a ballpark valuation of its operational data in 60 seconds, then book a call.

Static site. Single `index.html`. No build step, no dependencies.

## Brand system

The seller, buyer and referral pages use the approved Exchange identity.
`brand.css` applies the shared colors, typography and responsive
brand treatment. Production logo masters live in `assets/brand/`; Inter is
self-hosted in `assets/fonts/` with its OFL licence. `og-exchange.png` is the
current social preview. Keep the existing conversion scripts independent of
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
