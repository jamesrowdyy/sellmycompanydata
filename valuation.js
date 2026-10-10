/* Payout model, rebuilt 2026-10-11 on published buyer pricing.

   Most buyers publish ranges, not formulas. Handshake AI is the exception: its
   data-partnership calculator (joinhandshake.com/ai/data-partnerships) ships its
   pricing in the page. Read from that page on 2026-10-11:

     base $140,000 + $2,333 per employee + $11,667 per year of operation
     + $15.75 per GB of records (1 GB per employee-year at the low end, 14 GB at the high end)
     low = 0.75 x that, high = 1.25 x that, both x a region factor:
       US 1.00 | Canada 0.75 | Europe (UK included) 0.75 | everywhere else 0.30
     then both bounds x 1.01 (rounded up), and below 50 staff the low bound loses
     up to $69,102 x region (the full amount at 20 staff, nothing at 50+).
     Staff are clamped to 20-200 and years to 3-20.

   That returns $383,083 - $896,969 for a 100-person, 10-year US company, which is
   exactly what Handshake shows. We reproduce it, with one change: the systems a
   company selects set the record volume behind the HIGH bound. No systems selected
   uses Handshake's low-volume assumption (1 GB per employee-year), six or more uses
   its high-volume one (14 GB), in equal steps. Mercor's own page says the same
   thing in words: the more tools you share, the higher the payout.

   Cross-checks: micro1 tiers start at $100K for 30+ staff, Polyshares quotes
   $100K-$2M+, and Handshake's lowest US figure is exactly $100K at 20 staff, 3 years.
   Revenue and industry do not move the number: no buyer prices on them.
   Output is whole US dollars. Indicative only, never an offer. */
(function(root){
  'use strict';
  var P = {
    baseFee: 140000, perEmployee: 2333, perYear: 11667, perGB: 15.75,
    lowGB: 1, highGB: 14, lowMinTB: 0.1, highMinTB: 0.2,
    lowMul: 0.75, highMul: 1.25, uplift: 1.01,
    smallFrom: 20, smallTo: 50, smallDiscount: 69102
  };
  var REGION = { us: 1, ca: 0.75, uk: 0.75, eu: 0.75, anz: 0.3, other: 0.3 };
  var REGION_LABEL = {
    us: 'United States', ca: 'Canada', uk: 'United Kingdom', eu: 'Europe',
    anz: 'Australia or New Zealand', other: 'Another country'
  };
  var MIN_EMPLOYEES = 20, MIN_YEARS = 3, MAX_EMPLOYEES = 200, MAX_YEARS = 20;
  var FULL_SYSTEMS = 6, MORE_BUYERS_FROM = 30;

  function bump(v){ return Math.max(v + 1, Math.ceil(v * P.uplift)); }

  // Handshake's published formula; gbHigh is the record volume behind the high bound.
  function buyerRange(employees, years, region, gbHigh){
    var ey = employees * years;
    var lowTB = Math.max(P.lowMinTB, ey * P.lowGB / 1000);
    var highTB = Math.max(P.highMinTB, ey * gbHigh / 1000);
    var base = P.baseFee + employees * P.perEmployee + years * P.perYear;
    var r = REGION[region];
    var low = Math.round(P.lowMul * (base + lowTB * 1000 * P.perGB) * r);
    var high = Math.round(P.highMul * (base + highTB * 1000 * P.perGB) * r);
    var small = Math.max(0, (P.smallTo - employees) / (P.smallTo - P.smallFrom));
    return { low: Math.round(bump(low) - P.smallDiscount * r * small), high: bump(high) };
  }

  function yearsInBusiness(founded, year){
    if (founded === 'pre-1900') return year - 1899;
    if (!founded) return 0;
    var n = Number(founded);
    return isNaN(n) ? 0 : Math.max(0, year - n);
  }

  function regionOf(code){ return Object.prototype.hasOwnProperty.call(REGION, code) ? code : 'us'; }

  function estimate(input, year){
    year = year || new Date().getFullYear();
    input = input || {};
    var emp = parseInt(input.employees, 10);
    if (isNaN(emp) || emp < 0) emp = 0;
    var years = yearsInBusiness(input.founded, year);
    var region = regionOf(input.country);
    var systems = (input.systems && input.systems.length) || 0;
    var complete = emp > 0 && Boolean(input.founded);
    var qualifies = complete && emp >= MIN_EMPLOYEES && years >= MIN_YEARS;
    var out = { qualifies: qualifies, complete: complete, employees: emp, years: years,
      region: region, systems: systems, low: 0, high: 0, capped: false, fewerBuyers: false };
    if (!qualifies) return out;
    var e = Math.min(emp, MAX_EMPLOYEES), y = Math.min(years, MAX_YEARS);
    var gbHigh = P.lowGB + (P.highGB - P.lowGB) * Math.min(systems, FULL_SYSTEMS) / FULL_SYSTEMS;
    var r = buyerRange(e, y, region, gbHigh);
    out.low = r.low;
    out.high = r.high;
    out.capped = emp > MAX_EMPLOYEES || years > MAX_YEARS;
    out.fewerBuyers = emp < MORE_BUYERS_FROM;
    return out;
  }

  // Dollars to a short label: $383K, $1.2M.
  function format(n){
    if (n >= 999500) return '$' + (Math.round(n / 100000) / 10) + 'M';
    return '$' + Math.round(n / 1000) + 'K';
  }

  root.DataValuation = {
    estimate: estimate, format: format, buyerRange: buyerRange,
    REGION: REGION, REGION_LABEL: REGION_LABEL,
    MIN_EMPLOYEES: MIN_EMPLOYEES, MIN_YEARS: MIN_YEARS,
    MAX_EMPLOYEES: MAX_EMPLOYEES, MAX_YEARS: MAX_YEARS,
    FULL_SYSTEMS: FULL_SYSTEMS, MORE_BUYERS_FROM: MORE_BUYERS_FROM
  };
})(typeof window === 'undefined' ? globalThis : window);
