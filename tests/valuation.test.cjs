// Expected values checked against Grepped's public calculator on 2026-10-08.
const assert = require('node:assert/strict');
require('../valuation.js');
const cases = [
  [{}, {low:29, high:41.5}],
  [{employees:24,revenue:'1-10m',founded:'2015'}, {low:30.5,high:44}],
  [{employees:1,revenue:'pre',founded:'2026'}, {low:4,high:5.5}],
  [{employees:1000,revenue:'200m+',founded:'pre-1900'}, {low:432,high:618}]
];
for (const [input, expected] of cases) assert.deepEqual(DataValuation.estimate(input,2026),expected);
assert.equal(DataValuation.format(41.5),'$41.5K');
assert.equal(DataValuation.format(1234),'$1.2M');
console.log('Valuation regression cases passed');
