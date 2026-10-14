import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import worker from '../workers/lead.mjs';
globalThis.crypto ||= webcrypto;
const map = new Map();
let failWrite=false, requests=[], responseOk=true, pending=[];
const kv = {put:async(k,v)=>{if(failWrite) throw Error('storage');map.set(k,v)},get:async(k,type)=>{const x=map.get(k);return x ? type==='json'?JSON.parse(x):x:null},list:async()=>({keys:[...map.keys()].filter(k=>k.startsWith('lead:')).map(name=>({name})),list_complete:true}),delete:async(k)=>map.delete(k)};
const env={LEADS:kv,SLACK_WEBHOOK:'https://old.example.invalid/never-send'};
globalThis.fetch=async(url,init)=>{requests.push({url,body:JSON.parse(init.body)});if(String(url).includes('/api/chat.postMessage'))return new Response(JSON.stringify({ok:responseOk}),{status:200,headers:{'content-type':'application/json'}});return new Response(responseOk?'ok':'error',{status:responseOk?200:503})};
const ctx={waitUntil:p=>pending.push(p)};
const BROWSER={'Content-Type':'application/json','Origin':'https://sellmycompanydata.com','User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/154.0 Safari/537.36','CF-Connecting-IP':'203.0.113.9'};
async function post(route,payload,headers=BROWSER){return worker.fetch(new Request('https://sellmycompanydata.com/api/'+route,{method:'POST',headers,body:JSON.stringify(payload)}),env,ctx)}
const seller={firstName:'AUTOMATED',lastName:'TEST',email:'test@example.invalid',company:'SMCD AUTOMATED TEST',employees:'24',revenue:'1m-10m',founded:'2015',industry:'software',systems:['Slack','Xero'],estimateIsExample:false,authority:'Owner',qualified:true,years:11,dataContext:'x'.repeat(2000),range:'$188.5K–$283K',src:'acme-accounting'};
const belowBar={...seller,email:'small@example.invalid',company:'SMCD BELOW BAR',employees:'8',qualified:false,years:2,range:''};
failWrite=true;assert.equal((await post('lead',seller)).status,503);assert.equal(requests.length,0);assert.equal(map.size,0);failWrite=false;
const r=await post('lead',seller);assert.equal(r.status,200);const res=await r.json();assert.equal(res.ok,true);let key=[...map.keys()][0];let record=JSON.parse(map.get(key));for(const k of ['employees','revenue','founded','industry','systems','estimateIsExample','authority','dataContext','src'])assert.deepEqual(record[k],seller[k]);assert.equal(record.notification.status,'pending');assert.equal(requests.length,0);assert.equal(pending.length,0);
assert.equal((await post('buyer',{email:'test@example.invalid',organization:'SMCD TEST BUYER',dataTypes:'Messages'})).status,200);
assert.equal((await post('refer',{referrerEmail:'test@example.invalid',company:'SMCD TEST REFERRAL',industry:'Software',size:'1-10'})).status,200);
assert.equal((await post('lead',null)).status,400);
assert.equal((await post('lead',{})).status,400);
assert.equal((await post('lead',{_gotcha:'spam'})).status,200);assert.equal([...map.keys()].filter(k=>k.startsWith('lead:')).length,3);
await worker.scheduled({},env,ctx);await Promise.all(pending);pending=[];assert.equal(requests.length,0);
env.SLACK_LEADS_WEBHOOK='https://new.example.invalid/approved-channel';await worker.scheduled({},env,ctx);await Promise.all(pending);pending=[];assert.equal(requests.length,3);assert(requests.every(r=>r.url===env.SLACK_LEADS_WEBHOOK));assert(!requests.some(r=>r.body.text.includes(seller.dataContext)));assert.equal(JSON.parse(map.get(key)).notification.status,'delivered');
// the alert must lead with the triage line so James can judge at a glance
assert.ok(requests[0].body.text.includes('QUALIFIED'),'alert names the qualification verdict');
assert.ok(requests[0].body.text.includes('24 staff'),'alert carries the headcount');
assert.ok(requests[0].body.text.includes('Systems: Slack, Xero'),'alert carries the systems of record');
assert.ok(requests[0].body.text.includes('$188.5K'),'alert carries the estimate shown');
assert.ok(requests[0].body.text.includes('Source: acme-accounting'),'alert names the referral source');
await worker.scheduled({},env,ctx);await Promise.all(pending);pending=[];assert.equal(requests.length,3,'delivered records must not resend');
responseOk=false;await post('lead',seller);await Promise.all(pending);pending=[];let retryKey=[...map.keys()].at(-1);record=JSON.parse(map.get(retryKey));assert.equal(record.notification.attempts,1);assert.equal(record.notification.status,'pending');
for(let i=0;i<6;i++){record=JSON.parse(map.get(retryKey));record.notification.nextAttemptAt='2000-01-01T00:00:00Z';map.set(retryKey,JSON.stringify(record));await worker.scheduled({},env,ctx);await Promise.all(pending);pending=[];}
record=JSON.parse(map.get(retryKey));assert.equal(record.notification.attempts,5);assert.equal(record.notification.status,'failed');assert.equal(requests.length,8);
console.log('PASS: storage failure, full calculator context, seller/buyer/referral, validation, old-route suppression, dedicated delivery, free-text minimization, no repeat delivered messages, bounded retry.');
// Bot-token transport: posts via chat.postMessage when no incoming webhook exists.
requests=[];responseOk=true;delete env.SLACK_LEADS_WEBHOOK;env.SLACK_LEADS_BOT_TOKEN='xoxb-test-token';
const tokenSeller={...seller,email:'token@example.invalid',company:'SMCD TOKEN TEST'};
assert.equal((await post('lead',tokenSeller)).status,200);await Promise.all(pending);pending=[];
let tokenKey=[...map.keys()].at(-1);record=JSON.parse(map.get(tokenKey));
assert.equal(record.notification.status,'delivered','token transport must mark delivered');
const posted=requests.at(-1);
assert.ok(String(posted.url).includes('slack.com/api/chat.postMessage'),'token path posts to chat.postMessage');
assert.equal(posted.body.channel,'C0C7RUJV684','posts to the dedicated channel stored on the record');
assert.equal(typeof posted.body.text,'string');assert.ok(!posted.body.text.includes(tokenSeller.dataContext));
responseOk=false;await post('lead',tokenSeller);await Promise.all(pending);pending=[];
record=JSON.parse(map.get([...map.keys()].at(-1)));assert.equal(record.notification.status,'pending','failed Slack post stays pending for retry');
console.log('PASS: bot-token delivery via chat.postMessage to the dedicated channel, with retry on failure.');
// a below-the-bar seller is still stored and still alerts, flagged as below the bar
responseOk=true;requests=[];await post('lead',belowBar);await Promise.all(pending);pending=[];
record=JSON.parse(map.get([...map.keys()].at(-1)));
assert.equal(record.qualified,false,'below-bar lead is stored with qualified=false');
assert.equal(record.company,'SMCD BELOW BAR');
assert.ok(requests[0].body.text.includes('BELOW THE BAR'),'alert flags a below-bar lead');
assert.ok(requests[0].body.text.includes('8 staff'),'alert carries the below-bar headcount');
console.log('PASS: below-the-bar sellers are captured and flagged, never silently dropped.');
// VEN-98 frontend manual review reuses existing fields; no Worker deploy is needed.
const manualReview = {...belowBar, range:'Manual review requested (outside calculator scope)', dataContext:'Specialist archive and RL environment for review', src:'specialist-test'};
requests=[];await post('lead',manualReview);await Promise.all(pending);pending=[];
record=JSON.parse(map.get([...map.keys()].at(-1)));
for (const k of ['range','dataContext','src','qualified']) assert.deepEqual(record[k],manualReview[k]);
assert.ok(requests[0].body.text.includes(manualReview.range),'manual review marker is visible in the existing Slack alert');
assert.ok(!requests[0].body.text.includes(manualReview.dataContext),'private context stays in storage');
console.log('PASS: manual review marker persists and alerts with unchanged Worker payload and privacy.');

// Abuse guard: scripts, off-site posts, blocked senders and referral floods are quarantined silently.
{const before=[...map.keys()].filter(k=>k.startsWith('lead:')).length;
const ref={referrerEmail:'farmer@example.invalid',company:'X LTD',industry:'Other',size:'50-99'};
let r1=await post('refer',ref,{...BROWSER,'User-Agent':'DataSellReferralSubmission/1.0'});assert.equal(r1.status,200);
let r2=await post('refer',ref,{...BROWSER,'User-Agent':'Mozilla/5.0'});assert.equal(r2.status,200);
let r3=await post('refer',ref,{'Content-Type':'application/json','User-Agent':BROWSER['User-Agent']});assert.equal(r3.status,200);
for(let i=0;i<5;i++)assert.equal((await post('refer',{...ref,company:'FLOOD '+i})).status,200);
map.set('block:email:blocked@example.invalid','1');
assert.equal((await post('lead',{...seller,email:'blocked@example.invalid'})).status,200);
map.set('block:ip:198.51.100.7','1');
assert.equal((await post('lead',seller,{...BROWSER,'CF-Connecting-IP':'198.51.100.7'})).status,200);
const after=[...map.keys()].filter(k=>k.startsWith('lead:')).length;
assert.equal(after-before,3,'only the first 3 browser referrals per sender per day become leads');
const spam=[...map.keys()].filter(k=>k.startsWith('spam:')).map(k=>JSON.parse(map.get(k)).reason);
for(const want of ['scripted_ua','origin','referral_flood','blocked_email','blocked_ip'])assert.ok(spam.includes(want),'quarantined for '+want);
assert.equal(spam.filter(x=>x==='referral_flood').length,2);
console.log('PASS: abuse guard quarantines scripted UA, off-site posts, blocked email/IP and referral floods, with a normal-looking response.');}
