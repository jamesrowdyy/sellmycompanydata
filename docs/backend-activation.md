# Backend activation still required

The static deployment does not update the existing Cloudflare Worker. Its source
and credentials were unavailable during this change. Do not replace the running
Worker without exporting and reviewing its current validation, rate limits and
storage behaviour. All existing `/api/lead`, `/api/buyer`, `/api/refer` routes are
preserved by the frontend.

## Seller payload contract

Keep the existing contact fields (`firstName`, `lastName`, `email`, `company`,
`website`, `range`, `_gotcha`). Additionally validate and persist these fields:

| Field | Type | Meaning |
| --- | --- | --- |
| employees | string | Calculator input; may be blank |
| revenue | string | Revenue option key; may be blank |
| founded | string | Year or `pre-1900`; may be blank |
| industry | string | Selected industry; may be blank |
| systems | string[] | Selected product names |
| estimateIsExample | boolean | Incomplete calculator inputs |
| authority | string | Self-reported connection to the data |
| dataContext | string | Optional description; maximum 2,000 characters |

The client now sends these fields. Persistence is **not verified** until the
Worker's field allowlist and stored record are inspected. A client-side range
must never be used as a binding offer or authoritative pricing decision.

Keep the response contract `{ "ok": true }` only after durable lead storage
succeeds. If storage fails, return a non-2xx response so the form retains the
answers and shows an error. Notifications should be retriable independently of
storage, with delivery status, bounded retries and duplicate protection.

## Separate lead notifications

The dedicated Slack channel already exists: `#sellmycompanydata-leads`, channel
ID `C0C7RUJV684`. In the existing Worker, replace the previous TwinTone channel
with this destination. Confirm the application's channel membership and required
scope, and keep its credentials in Worker secrets. Never expose them in this
static repository. Include the lead type and a safe internal reference. Avoid
posting arbitrary confidential free text into notifications.

Email notifications are **not configured**. Do not advertise a business inbox or
promise email delivery. The public footer uses the personal booking calendar.

After access is restored, submit one clearly identified authorised test enquiry,
verify the stored fields and the dedicated Slack delivery, and verify that the
old TwinTone channel receives nothing. Remove the test record afterwards.

## Conversion events and calendar

`site-events.js` emits anonymous `smcd_*` events into `window.dataLayer` and as
`smcd:conversion` CustomEvents. No external conversion collector is configured.
Events cover estimate start/completion, successful enquiry submissions and
calendar opening; calendar opening is **not** a confirmed booking.

Configure a collector before reporting conversion rates. Confirm bookings only
through a verified Cal.com webhook with deduplication and signature verification.
The live scheduling URL is `https://cal.com/jamesrowdyy/15min`. Shared-calendar
conflict checks and the destination calendar require authenticated Cal.com account
access and remain unverified.

A referral status portal and automatic attribution also require a backend. Do not
simulate a status from a local form reset or promise automatic referral tracking.
