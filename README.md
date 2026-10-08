# SellMyCompanyData

Landing page + instant data-valuation calculator.

AI labs pay for the operating record inside a business. This site lets a company
get a ballpark valuation of its operational data in 60 seconds, then book a call.

Static site. Single `index.html`. No build step, no dependencies.

## Brand system

The seller, buyer and referral pages use the approved Exchange identity.
`brand.css` loads last and applies the shared colors, typography and responsive
brand treatment. Production logo masters live in `assets/brand/`; Inter is
self-hosted in `assets/fonts/` with its OFL licence. `og-exchange.png` is the
current social preview. Keep the existing conversion scripts independent of
branding changes.

Run the calculator regression check with `node tests/valuation.test.cjs`.
GitHub Pages publishes the repository root from `main`.
