/* Payout model anchored to published buyer figures, researched 2026-10-11.
   No buyer publishes a formula: every credible one says a record is priced deal by
   deal after a sample. What they DO publish:
     micro1        tiers of $100K+ / $500K+ / $1M+ by scope, for companies with 30+ staff
     Handshake AI  $100K-$4M per partnership, 20+ staff and 3+ years
     Nova          two deals closed at $100K each (3 and 5 business days)
     Troveo        full-company operational licences "start at six figures"
   So the floor for a qualifying company is $100K, not the tens of thousands that
   grepped.ai's model produced. This model starts at that published floor and scales
   on the factors every buyer names: continuous history (the single biggest driver),
   systems of record, and team size. Revenue is deliberately minor; buyers say it
   tells them little. Output is $K. Indicative only. */
(function(root){
  'use strict';
  var BASE = 100;
  var MIN_EMPLOYEES = 20;
  var MIN_YEARS = 3;

  // Continuous history, in years. Depth is the biggest single driver.
  var ageCurve = [[3,1],[5,1.25],[8,1.55],[12,1.9],[20,2.25],[30,2.55],[50,3]];
  // Team size, standing in for repeatable process.
  var empCurve = [[20,1],[35,1.15],[60,1.35],[120,1.6],[250,1.9],[600,2.2],[1500,2.5]];
  // Systems of record: the biggest lever most companies control.
  var sysCurve = [[0,1],[1,1],[2,1.05],[3,1.15],[5,1.3],[8,1.45],[12,1.55]];
  // Revenue: minor by design.
  var revMul = {'pre':0.85,'0-1m':0.95,'1-10m':1,'10-50m':1.08,'50-200m':1.12,'200m+':1.15,'undisclosed':1};

  function interp(curve,x){
    if(x<=curve[0][0]) return curve[0][1];
    for(var i=1;i<curve.length;i++){
      if(x<=curve[i][0]){
        var a=curve[i-1],b=curve[i];
        return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);
      }
    }
    return curve[curve.length-1][1];
  }

  function yearsInBusiness(founded,year){
    if(founded==='pre-1900') return year-1899;
    if(!founded) return 0;
    var n=Number(founded);
    return isNaN(n)?0:Math.max(0,year-n);
  }

  function estimate(input,year){
    year=year||new Date().getFullYear();
    input=input||{};
    var emp=parseInt(input.employees,10);
    if(isNaN(emp)) emp=0;
    var years=yearsInBusiness(input.founded,year);
    var complete = emp>0 && Boolean(input.founded);
    var qualifies = complete && emp>=MIN_EMPLOYEES && years>=MIN_YEARS;
    if(!qualifies){
      return {qualifies:false, complete:complete, employees:emp, years:years, low:0, high:0};
    }
    var systems=(input.systems&&input.systems.length)||0;
    var low=BASE*interp(ageCurve,years)*interp(empCurve,emp)*interp(sysCurve,systems)*(revMul[input.revenue||'undisclosed']||1);
    low=Math.max(BASE,Math.round(low*2)/2);
    return {qualifies:true, complete:true, employees:emp, years:years, low:low, high:Math.round(low*1.5*2)/2};
  }

  function format(k){ return k>=1000 ? '$'+(Math.round(k/100)/10)+'M' : '$'+k+'K'; }

  root.DataValuation={estimate:estimate,format:format,MIN_EMPLOYEES:MIN_EMPLOYEES,MIN_YEARS:MIN_YEARS};
})(typeof window==='undefined'?globalThis:window);
