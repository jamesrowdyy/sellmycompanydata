// Payout model on published buyer pricing (Handshake AI's data-partnership calculator,
// read 2026-10-11). Its page shows $383,083 - $896,969 for 100 staff, 10 years, US, and
// 75% / 30% of that for Canada-Europe / everywhere else. We must match those exactly when
// a company selects six or more systems.
const assert = require('node:assert/strict');
require('../valuation.js');
const V = DataValuation;
const six = ['a','b','c','d','e','f'];
const est = (input) => V.estimate(input, 2026);
const range = (input) => { const r = est(input); return [r.low, r.high]; };

// Handshake parity, every region
assert.deepEqual(range({employees:100, founded:'2016', country:'us', systems:six}), [383083, 896969]);
assert.deepEqual(range({employees:100, founded:'2016', country:'ca', systems:six}), [287313, 672727]);
assert.deepEqual(range({employees:100, founded:'2016', country:'eu', systems:six}), [287313, 672727]);
assert.deepEqual(range({employees:100, founded:'2016', country:'uk', systems:six}), [287313, 672727]);
assert.deepEqual(range({employees:100, founded:'2016', country:'anz', systems:six}), [114925, 269091]);
assert.deepEqual(range({employees:100, founded:'2016', country:'other', systems:six}), [114925, 269091]);
// Handshake's US floor: exactly $100,000 at 20 staff and 3 years
assert.equal(est({employees:20, founded:'2023', country:'us'}).low, 100000);
// unknown or missing country prices as US
assert.deepEqual(range({employees:100, founded:'2016', systems:six}), [383083, 896969]);
assert.deepEqual(range({employees:100, founded:'2016', country:'zz', systems:six}), [383083, 896969]);

// systems lift only the top end, and never lower it
const tops = [0,1,2,3,4,5,6,7].map(n => est({employees:100, founded:'2016', country:'us', systems:six.concat(['g']).slice(0,n)}));
for (let i = 1; i < tops.length; i++) {
  assert.ok(tops[i].high >= tops[i-1].high, 'systems must not lower the top end');
  assert.equal(tops[i].low, tops[0].low, 'systems must not move the low end');
}
assert.deepEqual(range({employees:100, founded:'2016', country:'us'}), [383083, 638472]);
assert.equal(tops[7].high, tops[6].high, 'six or more systems is the published maximum');

// the gate: 20+ staff and 3+ years, both answers present
assert.equal(est({}).qualifies, false);
assert.equal(est({}).complete, false);
assert.equal(est({employees:100}).complete, false);
assert.equal(est({employees:19, founded:'2010'}).qualifies, false);
assert.equal(est({employees:19, founded:'2010'}).complete, true);
assert.equal(est({employees:100, founded:'2024'}).qualifies, false);
assert.equal(est({employees:100, founded:'2026'}).years, 0);
assert.equal(est({employees:20, founded:'2023'}).qualifies, true);
assert.equal(est({employees:24, founded:'2015'}).fewerBuyers, true);
assert.equal(est({employees:30, founded:'2015'}).fewerBuyers, false);

// caps: 200 staff and 20 years, flagged with a plus
const big = est({employees:1000, founded:'pre-1900', country:'us', systems:six});
assert.deepEqual([big.low, big.high, big.capped], [683978, 2173950, true]);
assert.deepEqual(range({employees:200, founded:'2006', country:'us', systems:six}), [683978, 2173950]);
assert.equal(est({employees:200, founded:'2006', country:'us', systems:six}).capped, false);

// the homepage example (50 staff, 10 years, US, three systems)
assert.deepEqual(range({employees:50, founded:'2016', country:'us', systems:['a','b','c']}), [288755, 545883]);

// value always rises with staff and years
let prev = 0;
for (let e = 20; e <= 200; e += 10) { const l = est({employees:e, founded:'2016', country:'us'}).low; assert.ok(l > prev); prev = l; }
prev = 0;
for (let y = 3; y <= 20; y++) { const l = est({employees:100, founded:String(2026 - y), country:'us'}).low; assert.ok(l > prev); prev = l; }

// formatting
assert.equal(V.format(383083), '$383K');
assert.equal(V.format(896969), '$897K');
assert.equal(V.format(100000), '$100K');
assert.equal(V.format(2173950), '$2.2M');
assert.equal(V.format(999600), '$1M');
assert.equal(V.MIN_EMPLOYEES, 20);
assert.equal(V.MIN_YEARS, 3);
assert.equal(V.REGION_LABEL.anz, 'Australia or New Zealand');
console.log('Valuation regression cases passed');
