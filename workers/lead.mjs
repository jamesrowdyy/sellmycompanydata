const EMAIL_RE = /^[^@ ]+@[^@ ]+[.][^@ ]+$/;
const NL = String.fromCharCode(10);
function cors() {
  return {
    'Access-Control-Allow-Origin': 'https://sellmycompanydata.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}
function json(o, status) {
  return new Response(JSON.stringify(o), { status: status || 200, headers: { 'content-type': 'application/json; charset=utf-8', ...cors() } });
}
function f(d, k, max = 400) { return String((d && d[k]) || '').trim().slice(0, max); }
// Slack receives a concise reference; private free-text stays in the lead store.
function slackText(kind, L) {
  const label = kind === 'buyer' ? 'Buyer brief' : kind === 'refer' ? 'Referral' : 'Seller enquiry';
  const safe = value => String(value || '-').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const lines = ['Sell My Company Data — ' + label];
  if (kind === 'lead') {
    // Triage first: the qualifying bar is 20+ staff and 3+ years.
    const emp = Number(L.employees) || 0;
    const yrs = Number(L.years) || 0;
    const systems = (L.systems || []).join(', ');
    lines.push(
      (L.qualified === true ? 'QUALIFIED' : 'BELOW THE BAR') + ' · ' + emp + ' staff · ' + yrs + ' yrs',
      'Company: ' + safe(L.company),
      'Contact: ' + safe(L.email),
      'Industry: ' + safe(L.industry),
      'Systems: ' + safe(systems),
      'Estimate shown: ' + safe(L.range),
      'Connection: ' + safe(L.authority),
      'Reference: ' + L.id
    );
  } else {
    lines.push(
      'Company: ' + safe(L.company || L.organization),
      'Contact: ' + safe(L.email || L.referrerEmail),
      'Reference: ' + L.id
    );
  }
  lines.push('Details saved in the Sell My Company Data lead store.');
  return lines.join(NL);
}
const MAX_ATTEMPTS = 5;
const RETRY_DELAYS = [60, 300, 1800, 7200, 21600];
async function deliver(key, env) {
  // Never fall back to the previous TwinTone-bound webhook.
  // Two supported transports: a channel incoming webhook (SLACK_LEADS_WEBHOOK)
  // or a bot token posting via chat.postMessage (SLACK_LEADS_BOT_TOKEN).
  const hook = env.SLACK_LEADS_WEBHOOK;
  const token = env.SLACK_LEADS_BOT_TOKEN;
  if (!hook && !token) return;
  let L = await env.LEADS.get(key, 'json');
  if (!L || !L.notification || L.notification.status !== 'pending') return;
  const n = L.notification;
  if (n.nextAttemptAt && Date.parse(n.nextAttemptAt) > Date.now()) return;
  if (n.attempts >= MAX_ATTEMPTS) { n.status = 'failed'; await env.LEADS.put(key, JSON.stringify(L)); return; }
  n.attempts += 1;
  // Save the attempt before sending; delays reduce concurrent duplicate attempts.
  n.nextAttemptAt = new Date(Date.now() + RETRY_DELAYS[Math.min(n.attempts - 1, 4)] * 1000).toISOString();
  await env.LEADS.put(key, JSON.stringify(L));
  let delivered = false;
  try {
    const text = slackText(L.kind, L);
    if (token) {
      const channel = (L.notification && L.notification.channel) || env.SLACK_LEADS_CHANNEL;
      const r = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ channel: channel, text: text, unfurl_links: false, unfurl_media: false }),
        signal: AbortSignal.timeout(10000)
      });
      delivered = r.ok && (await r.json()).ok === true;
    } else {
      const r = await fetch(hook, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, unfurl_links: false, unfurl_media: false }),
        signal: AbortSignal.timeout(10000)
      });
      delivered = r.ok && (await r.text()).trim() === 'ok';
    }
  } catch (_) {}
  n.status = delivered ? 'delivered' : n.attempts >= MAX_ATTEMPTS ? 'failed' : 'pending';
  if (delivered) n.deliveredAt = new Date().toISOString();
  await env.LEADS.put(key, JSON.stringify(L));
}
async function retryNotifications(env) {
  if (!env.SLACK_LEADS_WEBHOOK && !env.SLACK_LEADS_BOT_TOKEN) return;
  const cursor = await env.LEADS.get('internal:notification_cursor') || undefined;
  const page = await env.LEADS.list({ prefix: 'lead:', limit: 25, ...(cursor ? { cursor } : {}) });
  for (const key of page.keys) {
    try { await deliver(key.name, env); } catch (_) {}
  }
  if (page.list_complete) await env.LEADS.delete('internal:notification_cursor');
  else await env.LEADS.put('internal:notification_cursor', page.cursor);
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });
    if (url.pathname === '/api/health') return json({ ok: true, service: 'sellmycompanydata-lead' });
    const routes = { '/api/lead': 'lead', '/api/buyer': 'buyer', '/api/refer': 'refer' };
    const kind = routes[url.pathname];
    if (!kind) return json({ error: 'not_found' }, 404);
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    let d;
    try { d = await request.json(); } catch (e) { return json({ error: 'invalid_json' }, 400); }
    if (!d || typeof d !== 'object' || Array.isArray(d)) return json({ error: 'invalid_json' }, 400);
    if (f(d, '_gotcha')) return json({ ok: true, spam: true });
    const id = crypto.randomUUID();
    const L = { id: id, kind: kind, ts: new Date().toISOString(), ip: request.headers.get('CF-Connecting-IP') || '', country: request.headers.get('CF-IPCountry') || '', ua: (request.headers.get('User-Agent') || '').slice(0, 250) };
    if (kind === 'lead') {
      L.firstName = f(d, 'firstName'); L.lastName = f(d, 'lastName'); L.email = f(d, 'email'); L.company = f(d, 'company'); L.website = f(d, 'website'); L.range = f(d, 'range');
      L.employees = f(d, 'employees', 40); L.revenue = f(d, 'revenue', 40); L.founded = f(d, 'founded', 20);
      L.industry = f(d, 'industry', 120);
      // Triaged by the site against the published bar (20 staff, 3 years).
      L.qualified = d.qualified === true;
      L.years = f(d, 'years', 10);
      L.systems = Array.isArray(d.systems) ? [...new Set(d.systems.filter(x => typeof x === 'string').map(x => x.trim().slice(0, 80)).filter(Boolean))].slice(0, 30) : [];
      L.estimateIsExample = d.estimateIsExample !== false;
      L.authority = f(d, 'authority', 200); L.dataContext = f(d, 'dataContext', 2000);
      if (!L.email || !EMAIL_RE.test(L.email)) return json({ error: 'invalid_email' }, 400);
      if (!L.company) return json({ error: 'company_required' }, 400);
    } else if (kind === 'buyer') {
      L.name = f(d, 'name'); L.email = f(d, 'email'); L.organization = f(d, 'organization'); L.dataTypes = f(d, 'dataTypes'); L.sector = f(d, 'sector'); L.timeline = f(d, 'timeline'); L.budget = f(d, 'budget'); L.notes = f(d, 'notes');
      if (!L.email || !EMAIL_RE.test(L.email)) return json({ error: 'invalid_email' }, 400);
      if (!L.organization) return json({ error: 'organization_required' }, 400);
    } else {
      L.referrerName = f(d, 'referrerName'); L.referrerEmail = f(d, 'referrerEmail'); L.company = f(d, 'company');
      L.industry = f(d, 'industry'); L.size = f(d, 'size'); L.years = f(d, 'years');
      L.country = f(d, 'country') || L.country;
      L.website = f(d, 'website'); L.contact = f(d, 'contact'); L.relationship = f(d, 'relationship'); L.why = f(d, 'why');
      if (!L.referrerEmail || !EMAIL_RE.test(L.referrerEmail)) return json({ error: 'invalid_email' }, 400);
      if (!L.company) return json({ error: 'company_required' }, 400);
      if (!L.industry) return json({ error: 'industry_required' }, 400);
      if (!L.size) return json({ error: 'size_required' }, 400);
    }
    const key = 'lead:' + L.ts + ':' + id;
    L.notification = { channel: 'C0C7RUJV684', status: 'pending', attempts: 0 };
    try { await env.LEADS.put(key, JSON.stringify(L)); }
    catch (_) { return json({ ok: false, error: 'storage_unavailable' }, 503); }
    if ((env.SLACK_LEADS_WEBHOOK || env.SLACK_LEADS_BOT_TOKEN) && ctx) ctx.waitUntil(deliver(key, env).catch(() => {}));
    return json({ ok: true, id: id, notification: 'pending' });
  },
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(retryNotifications(env));
  },
};
