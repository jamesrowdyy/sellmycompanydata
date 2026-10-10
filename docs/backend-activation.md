# Lead backend and notification setup

## Worker deployment

The existing `sellmycompanydata-lead` Cloudflare Worker serves `/api/lead`,
`/api/buyer` and `/api/refer`. Its source is tracked in `workers/lead.mjs`.
GitHub Pages deployments do not deploy this Worker. Before a Worker update,
export its current source/settings and preserve its routes and bindings.
Never put API credentials or webhook URLs in the repository.

The Worker requires the `LEADS` KV binding. A successful response is returned
only after the lead record is stored; failed storage returns HTTP 503. Existing
records are preserved. Run `node tests/lead-worker.test.mjs` for storage failure,
payload retention, all three lead types, notification isolation and retry checks.

## Production verification — 10 October 2026

Marked seller, buyer and referral submissions returned success and were checked
in KV. All calculator/context fields were retained. Their notifications remained
pending with zero attempts because the dedicated webhook was not configured.
No matching Slack messages were found. Exactly those three test records were
removed; all four pre-existing records were preserved. Dedicated Slack delivery
is still awaiting its secret and end-to-end verification.

## Seller payload contract

The Worker keeps contact/company fields and the estimate range, plus:

| Field | Type | Meaning |
| --- | --- | --- |
| employees | string | Calculator input; may be blank |
| revenue | string | Revenue option key; may be blank |
| founded | string | Year or `pre-1900`; may be blank |
| industry | string | Selected industry |
| systems | string[] | Selected product names, bounded and deduplicated |
| estimateIsExample | boolean | Incomplete calculator inputs |
| authority | string | Self-reported connection to the data |
| dataContext | string | Optional context, maximum 2,000 characters |

A client-supplied range is not a binding offer or an authoritative valuation.
Calculator context missing from older stored records cannot be reconstructed
from the range alone. No historical records are rewritten or replayed.

## Dedicated Slack delivery

The approved destination is `#sellmycompanydata-leads` (`C0C7RUJV684`). Create an
incoming webhook explicitly bound to that channel and add it as the Cloudflare
Worker **secret** `SLACK_LEADS_WEBHOOK`. The previous `SLACK_WEBHOOK` binding is
preserved for rollback but is never used by this implementation; there is no
fallback to the old TwinTone channel. Incoming webhook channel selection happens
in Slack, not through a payload override.

Each new stored lead includes notification state. Without the dedicated secret,
it remains pending and the lead is still saved. With the secret, delivery is
attempted asynchronously and by the scheduled handler. Attempts are bounded at
five, with increasing delays; failed records retain their status for inspection.
The scheduled handler scans at most 25 records per invocation and uses a cursor.
The production schedule is `*/5 * * * *` (every five minutes). Preserve other
jobs when updating schedules. The Worker’s workers.dev and preview endpoints
remain disabled; production uses the existing site routes.

Messages contain lead type, company, contact email and an internal reference.
Private free-text answers remain in KV. Slack requires an HTTP success response
with body `ok` before delivery is marked successful. Delivered records are not
normally retried, but KV provides no atomic delivery lock: concurrent execution
or a crash between Slack acceptance and the status write can cause a duplicate.
This is at-least-once delivery, not an exactly-once guarantee.

Final delivery acceptance requires a marked test lead to appear in the dedicated
channel, no matching message in the old channel, and the corresponding KV status
to be delivered. Remove only records created for that test. Email notifications
remain unconfigured.

## Conversion events and calendar

GA4 `G-W280P5MS2P` is consent-gated. The public site emits anonymous events for
calculator use, successful form responses and calendar opening. A calendar-open
event is not a confirmed booking. Confirmed booking analytics would require a
verified Cal.com webhook with deduplication.

The personal link is `https://cal.com/jamesrowdyy/15min`. On 10 October 2026 its
personal and TwinTone primary calendars were verified selected for conflict
checks. This event saves meetings to the shared TwinTone calendar; the personal
account default is unchanged. Business/company notes are prefilled by the site.
No test meeting was created during configuration verification.

A referral status portal and automatic referral attribution are not implemented.
