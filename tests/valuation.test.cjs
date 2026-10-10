// Payout model anchored to published buyer figures, researched 2026-10-11.
// Old expectations were checked against Grepped's calculator, which returned
// $30.5K-$44K for a 24-person firm. Published buyer floors (micro1 $100K+ tier,
// Nova's two $100K deals, Troveo "six figures" floor) put the qualifying floor at $100K.
const assert = require('node:assert/strict');
require('../valuation.js');
const cases = [
  // below the bar -> no number at all
  [{}, {qualifies:false, complete:false, employees:0, years:0, low:0, high:0}],
  [{employees:1,revenue:'pre',founded:'2026'}, {qualifies:false, complete:true, employees:1, years:0, low:0, high:0}],
  // 12 staff is under the 20 floor
  [{employees:12,revenue:'1-10m',founded:'2015'}, {qualifies:false, complete:true, employees:12, years:11, low:0, high:0}],
  // 24 staff but founded last year is under the 3-year floor
  [{employees:24,revenue:'1-10m',founded:'2025'}, {qualifies:false, complete:true, employees:24, years:1, low:0, high:0}],
  // exactly on both floors -> the published $100K floor
  [{employees:20,revenue:'1-10m',founded:'2023'}, {qualifies:true, complete:true, employees:20, years:3, low:100, high:150}],
  // mid case: 24 staff, 11 years, no systems selected
  [{employees:24,revenue:'1-10m',founded:'2015'}, {qualifies:true, complete:true, employees:24, years:11, low:188.5, high:283}],
  // systems of record raise it
  [{employees:60,revenue:'1-10m',founded:'2018',systems:['Slack','Xero','Salesforce']}, {qualifies:true, complete:true, employees:60, years:8, low:240.5, high:361}],
  // large, long, multi-system
  [{employees:1000,revenue:'200m+',founded:'pre-1900'}, {qualifies:true, complete:true, employees:1000, years:127, low:805, high:1207.5}],
];
for (const [input, expected] of cases) {
  assert.deepEqual(DataValuation.estimate(input, 2026), expected, 'input: ' + JSON.stringify(input));
}
assert.equal(DataValuation.MIN_EMPLOYEES, 20);
assert.equal(DataValuation.MIN_YEARS, 3);
assert.equal(DataValuation.format(188.5), '$188.5K');
assert.equal(DataValuation.format(150), '$150K');
assert.equal(DataValuation.format(1207.5), '$1.2M');
// a qualifying company never sees less than the published floor
assert.ok(DataValuation.estimate({employees:20,revenue:'pre',founded:'2023'}, 2026).low >= 100);
console.log('Valuation regression cases passed');
