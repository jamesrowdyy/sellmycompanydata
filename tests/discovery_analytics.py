"""Static discovery and consent/event checks; never send real analytics events."""
import functools
import http.server
import json
import os
from pathlib import Path
import re
import threading
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
paths=['/','/buyers/','/refer/','/privacy/','/terms/','/data-licensing/','/data-valuation/']
base='https://sellmycompanydata.com'
titles=set()
for path in paths:
 p=ROOT/path.strip('/')/'index.html' if path!='/' else ROOT/'index.html'
 soup=BeautifulSoup(p.read_text(),'html.parser')
 assert len(soup.select('h1'))==1,path
 title=soup.title.get_text();assert title not in titles; titles.add(title)
 assert soup.select_one('meta[name="description"]')['content'],path
 assert soup.select_one('link[rel="canonical"]')['href']==base+path,path
 assert 'noindex' not in soup.select_one('meta[name="robots"]')['content'],path
 graph=json.loads(soup.select_one('script[type="application/ld+json"]').string)['@graph']
 assert all(n.get('@id') for n in graph),path
 faq=next((g for g in graph if g['@type']=='FAQPage'),None)
 visible=soup.select('.faq details')
 if visible:
  assert len(faq['mainEntity'])==len(visible)
  for q,el in zip(faq['mainEntity'],visible):
   assert q['name']==el.summary.get_text(' ',strip=True)
   assert q['acceptedAnswer']['text']==el.p.get_text(' ',strip=True)
 for anchor in soup.select('a[href^="/"]'):
  target=anchor['href'].split('#')[0]
  f=ROOT/target.lstrip('/')
  assert f.exists(),(path,target)
  if '#' in anchor['href']:
   frag=anchor['href'].split('#')[1]
   target_soup=BeautifulSoup((f/'index.html').read_text(),'html.parser') if f.is_dir() else soup
   assert target_soup.find(id=frag),(path,frag)
 assert not soup.select('a[href^="mailto:"]'),path
sitemap=ET.parse(ROOT/'sitemap.xml'); urls=[e.text for e in sitemap.findall('.//{*}loc')]
assert set(urls)=={base+p for p in paths}
assert '5-10%' not in (ROOT/'llms.txt').read_text()
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=os.environ.get('SITE_TEST_URL',f'http://127.0.0.1:{server.server_port}').rstrip('/')
results={'static_pages':len(paths),'browser_layouts':0,'analytics':[]}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':390,'height':900},reduced_motion='reduce')
  page.route('https://static.cloudflareinsights.com/**',lambda r:r.fulfill(status=200,body=''))
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  for width in [320,390,768,1440]:
   page.set_viewport_size({'width':width,'height':900})
   for path in paths:
    response=page.goto(url+path,wait_until='networkidle');assert response.ok
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,path)
    assert page.locator('.analytics-consent').count()==0,'Unconfigured providers must not show consent UI'
    results['browser_layouts']+=1
  assert not errors,errors
  page.close()
  cfg={'ga4MeasurementId':'G-TEST123','posthogProjectToken':'phc_TEST123','posthogHost':'https://us.i.posthog.com'}
  def configure(context,calls):
   context.route('**/analytics-config.js*',lambda r:r.fulfill(content_type='text/javascript',body='window.SMCD_ANALYTICS_CONFIG='+json.dumps(cfg)+';'))
   context.route('https://static.cloudflareinsights.com/**',lambda r:r.fulfill(status=200,body=''))
   def capture(r):
    calls.append({'url':r.request.url,'body':r.request.post_data_json if r.request.method=='POST' else None})
    r.fulfill(status=200,content_type='application/json' if r.request.method=='POST' else 'text/javascript',body='{}' if r.request.method=='POST' else '',headers={'Access-Control-Allow-Origin':'*'})
   context.route('https://us.i.posthog.com/**',capture)
   context.route('https://www.googletagmanager.com/**',capture)
  calls=[];ctx=browser.new_context(viewport={'width':390,'height':900});configure(ctx,calls);page=ctx.new_page()
  page.goto(url+'/?email=private@example.com#secret',wait_until='networkidle')
  expect(page.locator('.analytics-consent')).to_be_visible();assert not calls
  page.get_by_role('button',name='Decline',exact=True).click()
  page.evaluate("window.SMCD.track('seller_lead_submitted')");page.wait_for_timeout(100);assert not calls
  page.get_by_role('button',name='Analytics preferences',exact=True).click()
  page.get_by_role('button',name='Allow analytics',exact=True).click();page.wait_for_timeout(200)
  page.evaluate("window.dispatchEvent(new CustomEvent('smcd:conversion',{detail:{event:'smcd_estimate_started',email:'private@example.com',range:'$44K'}}))")
  page.evaluate("window.SMCD.track('unknown_event')");page.wait_for_timeout(200)
  events=[c['body'] for c in calls if c['body']]
  assert [e['event'] for e in events]==['$pageview','estimate_started'],events
  for e in events:
   assert 'private@example.com' not in json.dumps(e) and '$44K' not in json.dumps(e) and '#secret' not in json.dumps(e)
   assert e['properties']['$current_url']==url+'/'
   assert e['properties']['$process_person_profile'] is False
   assert e['properties']['$is_identified'] is False
  commands=page.evaluate('window.dataLayer.filter(x=>x[0]).map(x=>Array.from(x))')
  assert len([c for c in commands if c[0]=='config'])==1
  assert [c[1] for c in commands if c[0]=='event']==['page_view','estimate_started']
  page.get_by_role('button',name='Analytics preferences',exact=True).click();page.get_by_role('button',name='Decline',exact=True).click()
  count=len(calls);page.evaluate("window.SMCD.track('booking_opened')");page.wait_for_timeout(100);assert len(calls)==count
  assert page.evaluate("window['ga-disable-G-TEST123']") is True
  page.reload(wait_until='networkidle');assert len(calls)==count
  results['analytics'].append('No provider requests before consent or after decline/revocation; allowlisted events with no PII/query leakage')
  ctx.close()
  calls=[];ctx=browser.new_context();configure(ctx,calls)
  ctx.add_init_script("Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>true});localStorage.setItem('smcd.analytics.consent.v1','granted');")
  page=ctx.new_page();page.goto(url+'/',wait_until='networkidle');assert not calls
  expect(page.locator('.analytics-settings')).to_be_disabled()
  results['analytics'].append('GPC overrides previously granted consent')
  ctx.close();browser.close()
finally:server.shutdown()
Path('/tmp/smcd-discovery-analytics-results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
