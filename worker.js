const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sell My Company Data — Get paid for the record your business already creates</title>
<meta name="description" content="AI labs pay for the operating record inside your business. Free valuation in 60 seconds, de-identified before anything moves, paid in 7 days.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#ffffff;
  --surface:#f7f7f8;
  --surface2:#f0f0f2;
  --ink:#0d0d0d;
  --ink2:#353740;
  --muted:#6e6e80;
  --dim:#8e8ea0;
  --line:#e5e5e5;
  --line2:#ececf1;
  --accent:#10a37f;
  --max:1120px;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{
  margin:0;background:var(--bg);color:var(--ink);
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none}
.wrap{max-width:var(--max);margin:0 auto;padding:0 24px}
.narrow{max-width:720px;margin:0 auto}

header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.86);backdrop-filter:saturate(180%) blur(14px);border-bottom:1px solid var(--line2)}
header .wrap{display:flex;align-items:center;justify-content:space-between;height:62px}
.brand{display:flex;align-items:center;gap:10px;font-weight:600;letter-spacing:-.02em;font-size:15.5px}
.brand svg{display:block}
nav{display:flex;align-items:center;gap:30px}
nav a{font-size:14.5px;color:var(--muted);transition:color .15s}
nav a:hover{color:var(--ink)}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font:500 15px/1 Inter,sans-serif;
  border:1px solid transparent;border-radius:9px;padding:11px 18px;cursor:pointer;
  transition:background .15s,border-color .15s}
.btn-primary{background:var(--ink);color:#fff}
.btn-primary:hover{background:#2d2d2d}
.btn-ghost{background:#fff;color:var(--ink);border-color:var(--line)}
.btn-ghost:hover{background:var(--surface)}
.btn-lg{padding:14px 24px;font-size:15.5px;border-radius:10px}
.btn-block{width:100%}

.hero{padding:96px 0 72px;text-align:center}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);
  background:var(--surface);border:1px solid var(--line2);border-radius:999px;padding:6px 13px;margin-bottom:28px}
.eyebrow i{width:6px;height:6px;border-radius:50%;background:var(--accent);display:block}
h1{font-size:clamp(38px,5.4vw,60px);line-height:1.05;letter-spacing:-.032em;font-weight:600;margin:0 0 22px}
h1 em{font-style:normal;color:var(--muted)}
.hero p{font-size:clamp(17px,1.6vw,19px);color:var(--muted);max-width:640px;margin:0 auto 34px;line-height:1.5}
.hero .actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.hero .trust{margin-top:26px;font-size:13.5px;color:var(--dim);display:flex;gap:22px;justify-content:center;flex-wrap:wrap}
.hero .trust span{display:inline-flex;align-items:center;gap:7px}
.tick{color:var(--accent);font-weight:700}

section{padding:88px 0;border-top:1px solid var(--line2)}
.sec-head{text-align:center;max-width:660px;margin:0 auto 52px}
h2{font-size:clamp(28px,3.2vw,38px);letter-spacing:-.025em;font-weight:600;margin:0 0 14px;line-height:1.15}
.sec-head p{color:var(--muted);font-size:17px;margin:0}

.calc{display:grid;grid-template-columns:1.2fr .8fr;gap:24px;align-items:start}
.panel{background:#fff;border:1px solid var(--line);border-radius:16px;padding:28px}
label{display:block;font-size:13.5px;font-weight:500;color:var(--ink2);margin-bottom:8px}
label .hint{font-weight:400;color:var(--dim)}
.field{margin-bottom:20px}
select,input{width:100%;background:#fff;border:1px solid var(--line);border-radius:10px;
  padding:11px 13px;font:400 15px Inter,sans-serif;color:var(--ink);outline:none;
  transition:border-color .15s,box-shadow .15s}
select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236e6e80' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 14px center;padding-right:38px}
select:focus,input:focus{border-color:#b4b4bb;box-shadow:0 0 0 3px rgba(13,13,13,.06)}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{font-size:13.5px;padding:8px 13px;border:1px solid var(--line);border-radius:999px;background:#fff;
  color:var(--ink2);cursor:pointer;user-select:none;transition:.12s;font-weight:450}
.chip:hover{border-color:#c9c9d1}
.chip.on{background:var(--ink);border-color:var(--ink);color:#fff}

.result{position:sticky;top:86px;border:1px solid var(--line);border-radius:16px;padding:28px;background:#fff}
.result .k{font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);font-weight:500}
.result .val{font-size:clamp(34px,3.6vw,44px);font-weight:600;letter-spacing:-.03em;margin:12px 0 4px;line-height:1.1}
.bar{height:5px;background:var(--surface2);border-radius:999px;overflow:hidden;margin:20px 0 6px}
.bar i{display:block;height:100%;width:8%;background:var(--accent);border-radius:999px;transition:width .35s cubic-bezier(.4,0,.2,1)}
.result .note{font-size:12.5px;color:var(--dim);line-height:1.5;margin-top:14px}
.result .btn{margin-top:22px}

.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.card{border:1px solid var(--line);border-radius:16px;padding:26px;background:#fff;transition:border-color .15s,box-shadow .15s}
.card:hover{border-color:#d8d8dd;box-shadow:0 1px 3px rgba(13,13,13,.04)}
.card .num{font-size:12.5px;font-weight:600;color:var(--accent);letter-spacing:.04em;margin-bottom:14px}
.card h3{margin:0 0 8px;font-size:17.5px;font-weight:600;letter-spacing:-.01em}
.card p{margin:0;color:var(--muted);font-size:14.5px;line-height:1.55}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px}
.tags span{font-size:12px;color:var(--muted);background:var(--surface);border:1px solid var(--line2);border-radius:6px;padding:4px 9px}
.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}

.trustgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.trustgrid h4{margin:0 0 8px;font-size:15px;font-weight:600}
.trustgrid p{margin:0;font-size:14px;color:var(--muted);line-height:1.5}
.trustgrid .ico{width:30px;height:30px;border-radius:8px;background:var(--surface);border:1px solid var(--line2);
  display:flex;align-items:center;justify-content:center;margin-bottom:14px;font-size:14px;color:var(--ink2)}

.faq details{border-bottom:1px solid var(--line2);padding:18px 0}
.faq summary{cursor:pointer;font-weight:500;font-size:16px;list-style:none;display:flex;justify-content:space-between;gap:16px}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";color:var(--dim);font-weight:400;font-size:19px;line-height:1}
.faq details[open] summary::after{content:"\\2013"}
.faq p{color:var(--muted);font-size:15px;margin:12px 0 0;line-height:1.6;max-width:640px}

.formgrid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.fine{font-size:12.5px;color:var(--dim);margin-top:14px;text-align:center}

footer{border-top:1px solid var(--line2);padding:40px 0;color:var(--dim);font-size:13.5px}
footer .wrap{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}

@media(max-width:900px){
  .calc{grid-template-columns:1fr}.result{position:static}
  .steps,.grid2,.trustgrid{grid-template-columns:1fr}
  .formgrid{grid-template-columns:1fr}
  nav a:not(.btn){display:none}
  .hero{padding:64px 0 48px}
  section{padding:64px 0}
}
</style>
</head>
<body>

<header><div class="wrap">
  <a class="brand" href="#top">
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect width="22" height="22" rx="6" fill="#0d0d0d"/><path d="M6.6 14.6c.9.9 2.3 1.5 4 1.5 2.6 0 4.2-1.2 4.2-3.1 0-1.7-1-2.5-3.4-3l-1.3-.3c-1.3-.3-1.8-.6-1.8-1.2 0-.7.7-1.1 1.8-1.1 1.1 0 2.1.4 2.9 1.1l1.5-1.7C13.7 5.7 12.3 5.1 10.4 5.1 7.9 5.1 6.3 6.4 6.3 8.3c0 1.7 1.1 2.5 3.4 3l1.3.3c1.3.3 1.8.6 1.8 1.2 0 .7-.8 1.2-2 1.2-1.2 0-2.4-.5-3.2-1.3l-1.4 1.9z" fill="#fff"/></svg>
    SellMyCompanyData
  </a>
  <nav>
    <a href="#value">Valuation</a>
    <a href="#how">How it works</a>
    <a href="#what">What qualifies</a>
    <a href="#faq">FAQ</a>
    <a class="btn btn-primary" href="#apply">Get my valuation</a>
  </nav>
</div></header>

<div class="hero wrap" id="top">
  <div class="eyebrow"><i></i>AI labs are buying the record of how real businesses run</div>
  <h1>Your company's data is worth<br><em>more than you think.</em></h1>
  <p>Every order, ticket, email and reconciliation your team produces is a record frontier AI labs will pay to learn from. See what yours could licence for in 60 seconds. No upload, no commitment.</p>
  <div class="actions">
    <a class="btn btn-primary btn-lg" href="#value">Value my data</a>
    <a class="btn btn-ghost btn-lg" href="#how">See how it works</a>
  </div>
  <div class="trust">
    <span><b class="tick">&#10003;</b> De-identified before anything moves</span>
    <span><b class="tick">&#10003;</b> You approve every source</span>
    <span><b class="tick">&#10003;</b> Paid in as little as 7 days</span>
  </div>
</div>

<section id="value">
  <div class="wrap">
    <div class="sec-head">
      <h2>Estimate what your data could licence for</h2>
      <p>Five questions. The estimate updates as you go. Nothing is uploaded and nothing is stored.</p>
    </div>
    <div class="calc">
      <div class="panel">
        <div class="field">
          <label>Full-time employees</label>
          <select id="emp">
            <option value="0.5">Fewer than 10</option>
            <option value="1" selected>10 &ndash; 50</option>
            <option value="1.5">50 &ndash; 200</option>
            <option value="2">200 &ndash; 1,000</option>
            <option value="3">1,000+</option>
          </select>
        </div>
        <div class="field">
          <label>Annual revenue</label>
          <select id="rev">
            <option value="0.3">Pre-revenue</option>
            <option value="0.8">$0 &ndash; $1M</option>
            <option value="1.5" selected>$1M &ndash; $10M</option>
            <option value="2.5">$10M &ndash; $50M</option>
            <option value="3.5">$50M &ndash; $200M</option>
            <option value="5">$200M+</option>
          </select>
        </div>
        <div class="field">
          <label>Year founded</label>
          <select id="yr"></select>
        </div>
        <div class="field">
          <label>Industry</label>
          <select id="ind">
            <option value="1">General / other</option>
            <option value="1.3">Accounting &amp; bookkeeping</option>
            <option value="1.2">Legal</option>
            <option value="1.25">Healthcare</option>
            <option value="1.3">Chemistry &amp; materials</option>
            <option value="1.3">Semiconductors</option>
            <option value="1.15">Manufacturing</option>
            <option value="1.15">Logistics &amp; 3PL</option>
            <option value="1.1">Financial services</option>
            <option value="1.1">Software &amp; SaaS</option>
          </select>
        </div>
        <div class="field" style="margin-bottom:4px">
          <label>Which systems does your team run on? <span class="hint">Select all that apply</span></label>
          <div class="chips" id="sys">
            <span class="chip">Salesforce</span>
            <span class="chip">HubSpot</span>
            <span class="chip">Xero</span>
            <span class="chip">QuickBooks</span>
            <span class="chip">Slack</span>
            <span class="chip">Microsoft Teams</span>
            <span class="chip">Jira</span>
            <span class="chip">Zendesk</span>
            <span class="chip">NetSuite / SAP</span>
            <span class="chip">Google Drive</span>
            <span class="chip">SharePoint</span>
            <span class="chip">DocuSign</span>
          </div>
        </div>
      </div>

      <div class="result">
        <div class="k">Estimated payout range</div>
        <div class="val" id="range">$103K &ndash; $144K</div>
        <div class="bar"><i id="bar"></i></div>
        <div class="note">Directional only. The final figure depends on your data sources, volume, quality, access terms and due diligence.</div>
        <a class="btn btn-primary btn-block" href="#apply">Book a valuation call</a>
      </div>
    </div>
  </div>
</section>

<section id="how">
  <div class="wrap">
    <div class="sec-head">
      <h2>List, review, get paid</h2>
      <p>You keep ownership of everything. We handle the rights review, the de-identification and the buyer conversation.</p>
    </div>
    <div class="steps">
      <div class="card">
        <div class="num">01 &middot; 60 SECONDS</div>
        <h3>Get an estimate</h3>
        <p>Tell us your team size, years in business and revenue. See your payout range instantly. No listing required and nothing is shared.</p>
      </div>
      <div class="card">
        <div class="num">02 &middot; ONE CALL</div>
        <h3>Scope the data</h3>
        <p>We walk through your systems together and agree exactly what is in scope and what is not. A signed NDA covers the conversation.</p>
      </div>
      <div class="card">
        <div class="num">03 &middot; 7 DAYS</div>
        <h3>Get paid</h3>
        <p>Read-only access to the approved sources only. Customer details are stripped before anything leaves processing. Payment lands in 7 days.</p>
      </div>
    </div>
  </div>
</section>

<section id="what">
  <div class="wrap">
    <div class="sec-head">
      <h2>What AI labs will pay for</h2>
      <p>Not volume. The record of how real work gets decided, done and checked.</p>
    </div>
    <div class="grid2">
      <div class="card">
        <h3>Work conversations</h3>
        <p>Slack, Teams, internal email and support threads where problems get argued over and resolved.</p>
        <div class="tags"><span>Slack</span><span>Teams</span><span>Gmail</span><span>Outlook</span></div>
      </div>
      <div class="card">
        <h3>Operations &amp; finance</h3>
        <p>Orders, invoices, reconciliations, ledgers, purchase orders and the exception notes around them.</p>
        <div class="tags"><span>Xero</span><span>QuickBooks</span><span>NetSuite</span><span>SAP</span></div>
      </div>
      <div class="card">
        <h3>CRM &amp; customer support</h3>
        <p>Pipelines, account history, tickets and the service knowledge behind each resolution.</p>
        <div class="tags"><span>Salesforce</span><span>HubSpot</span><span>Zendesk</span><span>Intercom</span></div>
      </div>
      <div class="card">
        <h3>Documents &amp; internal knowledge</h3>
        <p>Contracts, reports, SOPs, decks and the operating playbooks your team wrote.</p>
        <div class="tags"><span>Drive</span><span>SharePoint</span><span>Notion</span><span>DocuSign</span></div>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <h2>How we protect your data</h2>
      <p>Defined in writing before anything moves, and you sign off on every source.</p>
    </div>
    <div class="trustgrid">
      <div><div class="ico">&#9636;</div><h4>Scope, in writing</h4><p>Approved sources and clear boundaries agreed up front. Originals deleted after processing.</p></div>
      <div><div class="ico">&#8984;</div><h4>Read-only access</h4><p>Encrypted in transit and at rest. Access is read-only and revoked when the project ends.</p></div>
      <div><div class="ico">&#9678;</div><h4>De-identified</h4><p>Names, contact details and identifying fields removed to a documented standard before anything ships.</p></div>
      <div><div class="ico">&sect;</div><h4>Signed terms</h4><p>Use, retention and payment set out in an agreement you approve before a single record is shared.</p></div>
    </div>
  </div>
</section>

<section id="apply">
  <div class="wrap narrow">
    <div class="sec-head">
      <h2>Book a valuation call</h2>
      <p>Two minutes. We reply within one business day.</p>
    </div>
    <div class="panel">
      <div class="formgrid">
        <div class="field" style="margin:0"><label>First name</label><input type="text" placeholder="Jane"></div>
        <div class="field" style="margin:0"><label>Last name</label><input type="text" placeholder="Cooper"></div>
      </div>
      <div class="field" style="margin:18px 0 0"><label>Work email</label><input type="email" placeholder="jane@company.com"></div>
      <div class="field" style="margin:18px 0 0"><label>Company</label><input type="text" placeholder="Company Ltd"></div>
      <div class="field" style="margin:18px 0 0"><label>Company website</label><input type="text" placeholder="company.com"></div>
      <div style="margin-top:22px">
        <button class="btn btn-primary btn-lg btn-block" onclick="alert('Demo build. Connect to Formspree, Tally, or a Cloudflare Worker to receive submissions.')">Request my valuation</button>
      </div>
      <div class="fine">We use these details to prepare your estimate. No newsletters.</div>
    </div>
  </div>
</section>

<section id="faq">
  <div class="wrap narrow faq">
    <div class="sec-head"><h2>Questions</h2></div>
    <details open><summary>Who buys the data?</summary><p>We licence de-identified business workflow data to AI labs and research teams training frontier models. Your data is never resold to competitors or published.</p></details>
    <details><summary>What kind of data qualifies?</summary><p>Operational records from the tools your team uses daily: CRM pipelines, support tickets, contracts, invoices, project boards, SOPs and internal docs. Larger teams and more years of history generally mean a higher payout.</p></details>
    <details><summary>Will my customers' information be exposed?</summary><p>No. Personal and customer-identifying information is removed during processing to a documented standard, and original datasets are deleted once processing is complete.</p></details>
    <details><summary>Do I still own my data?</summary><p>Yes. This is a licence, not a sale. You keep ownership and the licence is bounded by scope, permitted use and duration.</p></details>
    <details><summary>How fast do I get paid?</summary><p>Within 7 days of your data passing review. Most companies go from first call to payment in two to three weeks.</p></details>
    <details><summary>Does this take a lot of my team's time?</summary><p>Usually a single call and granting read-only access. We handle extraction, cleaning and de-identification.</p></details>
  </div>
</section>

<footer><div class="wrap">
  <div>&copy; 2026 SellMyCompanyData Ltd. All rights reserved.</div>
  <div>hello@sellmycompanydata.com</div>
</div></footer>

<script>
(function(){
  var y=document.getElementById('yr'), html='';
  for(var i=2026;i>=1900;i--){ html += '<option value="'+i+'"'+(i===2015?' selected':'')+'>'+i+'</option>'; }
  y.innerHTML = '<option value="0">Before 1900</option>'+html;
})();

var chips=[].slice.call(document.querySelectorAll('#sys .chip'));
chips.forEach(function(c){ c.addEventListener('click',function(){ c.classList.toggle('on'); calc(); }); });

function money(n){
  if(n>=1e6) return '$'+(n/1e6).toFixed(n/1e6>=2?1:2).replace(/\\.0$/,'')+'M';
  if(n>=1e3) return '$'+Math.round(n/1e3)+'K';
  return '$'+Math.round(n);
}
function calc(){
  var emp=parseFloat(document.getElementById('emp').value);
  var rev=parseFloat(document.getElementById('rev').value);
  var ind=parseFloat(document.getElementById('ind').value);
  var founded=parseInt(document.getElementById('yr').value,10);
  var years = founded===0 ? 40 : Math.max(1, 2026-founded);
  var yearsScore = Math.min(years,25)/25*1.5;
  var sysCount = chips.filter(function(c){return c.classList.contains('on');}).length;
  var sysScore = Math.min(sysCount,6)*0.35;
  var raw = (emp*1.2 + rev*1.5 + yearsScore + sysScore) * ind;
  var low = 25000 + Math.pow(Math.max(raw,0.3),2.1)*4000;
  var high = low*1.4;
  document.getElementById('range').textContent = money(low)+' \\u2013 '+money(high);
  document.getElementById('bar').style.width = Math.max(6,Math.min(100,(raw/20.5)*100)).toFixed(0)+'%';
}
['emp','rev','ind','yr'].forEach(function(id){ document.getElementById(id).addEventListener('change',calc); });
calc();
</script>
</body>
</html>
`;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return new Response('ok', { headers: { 'content-type': 'text/plain' } });
    }
    return new Response(HTML, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300',
        'x-content-type-options': 'nosniff'
      }
    });
  }
};
