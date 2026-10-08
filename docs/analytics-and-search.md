# Analytics and search setup

## Current activation state

The website integration is prepared, but GA4 and PostHog identifiers are empty.
No GA4 script or PostHog request is emitted until valid public identifiers are
configured AND a visitor opts in. Existing Cloudflare Web Analytics is separate.
Search Console ownership and sitemap submission are not completed by a website
deployment. PostHog and GSC Wizard authentication were confirmed on 9 October
2026. PostHog cannot create a dedicated project until the organization enables
additional project capacity. GSC Wizard has Search Console authorization, but
its Google Analytics connection still requires Analytics consent. The only
verified Search Console property currently available is jamesrowdy.com, which
does not verify ownership of sellmycompanydata.com.

Keep this business in its own PostHog project and GA4 property; do not reuse a
TwinTone identifier. The business timezone must be confirmed at account creation;
use the owner's Asia/Makassar timezone if there is no other business preference.

## Account activation

1. PostHog: create/select the Sell My Company Data project, confirm its US/EU
   region, and obtain the public project token (`phc_…`). Personal API keys stay
   in the authenticated integration or a secret store, never in site files.
2. GA4: create/select a separate property and HTTPS web stream for
   `https://sellmycompanydata.com`. Obtain its `G-…` measurement ID. Disable
   Enhanced Measurement for this stream: the explicit page and funnel events
   below are sent by our integration, and automatic form/outbound-link events
   must not duplicate them or collect booking query strings. Leave Google
   Signals, advertising personalization and user-provided-data collection off.
3. Search Console: prefer a Domain property for `sellmycompanydata.com`, verified
   with Google's exact DNS TXT value in Cloudflare. If DNS access is unavailable,
   an HTTPS URL-prefix property can use the HTML verification token on the root
   page via the script below. Do not invent a verification token.
4. Once verified, submit `https://sellmycompanydata.com/sitemap.xml`. Inspect the
   homepage and the buyer, referral, licensing and methodology URLs. Sitemap
   discovery and a successful inspection do not guarantee indexing or ranking.

## Apply public identifiers

Create a local JSON file containing only the known public identifiers, e.g. keys
`ga4MeasurementId`, `posthogProjectToken`, `posthogHost`,
`googleSiteVerification`. Omit values not yet available. Then run:

```
python scripts/configure_analytics.py /path/to/public-identifiers.json
```

The PostHog host is `https://us.i.posthog.com` or `https://eu.i.posthog.com`, based
on the project's region. Deploy after applying the values. This does not create
accounts or grant management access.

## Funnel and event semantics

| Event | Trigger |
| --- | --- |
| page_view / PostHog $pageview | Once after consent on a page |
| estimate_started | First employee/revenue/founding-year change |
| estimate_completed | All three inputs completed, once per page |
| seller_lead_submitted | API returns a successful seller response |
| buyer_brief_submitted | API returns a successful buyer response |
| referral_submitted | API returns a successful referral response |
| booking_opened | Embedded or direct calendar opened; NOT a booking |

In GA4, mark the three `*_submitted` events as key events after receipt. Do not
mark `booking_opened` as a completed booking. In PostHog, create the seller funnel
`estimate_started → estimate_completed → seller_lead_submitted → booking_opened`.
Direct booking visitors can skip calculator/lead steps and should be analysed
separately. Confirmed bookings require a verified Cal.com webhook, not a click.

The transport allowlists events, page paths and properties. It excludes form
values, contact details, URL queries and fragments, and sends only a referrer's
origin. PostHog receives anonymous, non-profile events with a per-tab session ID.
No session recording or automatic element capture is installed. Browser GPC and
DNT signals disable optional analytics. Withdrawing consent stops future events.

## Verification after activation

Check consent decline causes no provider traffic; then explicitly opt in and
confirm an event in PostHog live events and GA4 Realtime. Check property IDs and
page URLs. Do not send actual company/contact data in a test analytics event.
Use a labelled, authorised test lead only when verifying the real lead backend.
The Cloudflare Worker must independently persist calculator fields and route
notifications: see backend-activation.md.

## Search and AI discovery

All seven pages render meaningful HTML without JavaScript, carry unique titles,
descriptions, canonical URLs and structured data, and are linked internally.
FAQ schema is derived from the visible FAQ answers. Sitemap and robots cover
public pages. `llms.txt` and `llms-full.txt` mirror current website facts; these
files are supplementary conventions, not requirements or guarantees for LLMs.
Cloudflare WAF/bot rules must also allow legitimate search traffic; robots.txt
cannot override a challenge or network denial. Compare crawl responses with
Googlebot, OAI-SearchBot and PerplexityBot as a smoke check, then use official
Search Console diagnostics after ownership verification.

After publishing content, `python scripts/submit_indexnow.py` verifies the public
key in `indexnow-key.txt` and notifies participating engines of the sitemap URLs.
The key is public ownership proof, not a secret. Successful submission does not
mean indexed and does not replace Google Search Console verification/submission.
