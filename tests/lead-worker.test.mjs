import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import worker from '../workers/lead.mjs';
globalThis.crypto ||= webcrypto;
const map = new Map();
let failWrite=false, requests=[], responseOk=true, pending=[];
const kv = {put:async(k,v)=>{if(failWrite) throw Error('storage');map.set(k,v)},get:async(k,type)=>{const x=map.get(k);return x ? type==='json'?JSON.parse(x):x:null},list:async()=>({keys:[...map.keys()].filter(k=>k.startsWith('lead:')).map(name=>({name})),list_complete:true}),delete:async(k)=>map.delete(k)};
const env={LEADS:kv,SLACK_WEBHOOK:'https://old.example.invalid/never-send'};
globalThis.fetch=async(url,init)=>{requests.push({url,body:JSON.parse(init.body)});return new Response(responseOk?'ok':'error',{status:responseOk?200:503})};
const ctx={waitUntil:p=>pending.push(p)};
async function post(route,payload){return worker.fetch(new Request('https://sellmycompanydata.com/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),env,ctx)}
const seller={firstName:'AUTOMATED',lastName:'TEST',email:'test@example.invalid',company:'SMCD AUTOMATED TEST',employees:'24',revenue:'1m-10m',founded:'2015',industry:'software',systems:['Slack','Xero'],estimateIsExample:false,authority:'Owner',dataContext:'x'.repeat(2000),range:'$30.5K–$44K'};
failWrite=true;assert.equal((await post('lead',seller)).status,503);assert.equal(requests.length,0);assert.equal(map.size,0);failWrite=false;
const r=await post('lead',seller);assert.equal(r.status,200);const res=await r.json();assert.equal(res.ok,true);let key=[...map.keys()][0];let record=JSON.parse(map.get(key));for(const k of ['employees','revenue','founded','industry','systems','estimateIsExample','authority','dataContext'])assert.deepEqual(record[k],seller[k]);assert.equal(record.notification.status,'pending');assert.equal(requests.length,0);assert.equal(pending.length,0);
assert.equal((await post('buyer',{email:'test@example.invalid',organization:'SMCD TEST BUYER',dataTypes:'Messages'})).status,200);
assert.equal((await post('refer',{referrerEmail:'test@example.invalid',company:'SMCD TEST REFERRAL',industry:'Software',size:'1-10'})).status,200);
assert.equal((await post('lead',null)).status,400);
assert.equal((await post('lead',{})).status,400);
assert.equal((await post('lead',{_gotcha:'spam'})).status,200);assert.equal(map.size,3);
await worker.scheduled({},env,ctx);await Promise.all(pending);pending=[];assert.equal(requests.length,0);
env.SLACK_LEADS_WEBHOOK='https://new.example.invalid/approved-channel';await worker.scheduled({},env,ctx);await Promise.all(pending);pending=[];assert.equal(requests.length,3);assert(requests.every(r=>r.url===env.SLACK_LEADS_WEBHOOK));assert(!requests.some(r=>r.body.text.includes(seller.dataContext)));assert.equal(JSON.parse(map.get(key)).notification.status,'delivered');
await worker.scheduled({},env,ctx);await Promise.all(pending);pending=[];assert.equal(requests.length,3,'delivered records must not resend');
responseOk=false;await post('lead',seller);await Promise.all(pending);pending=[];let retryKey=[...map.keys()].at(-1);record=JSON.parse(map.get(retryKey));assert.equal(record.notification.attempts,1);assert.equal(record.notification.status,'pending');
for(let i=0;i<6;i++){record=JSON.parse(map.get(retryKey));record.notification.nextAttemptAt='2000-01-01T00:00:00Z';map.set(retryKey,JSON.stringify(record));await worker.scheduled({},env,ctx);await Promise.all(pending);pending=[];}
record=JSON.parse(map.get(retryKey));assert.equal(record.notification.attempts,5);assert.equal(record.notification.status,'failed');assert.equal(requests.length,8);
console.log('PASS: storage failure, full calculator context, seller/buyer/referral, validation, old-route suppression, dedicated delivery, free-text minimization, no repeat delivered messages, bounded retry.');
