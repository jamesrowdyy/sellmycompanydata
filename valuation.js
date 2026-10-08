/* Payout model verified against grepped.ai/config.js and app.js, 2026-10-08.
   Values are in $K. Industry and systems do not affect the estimate. */
(function(root){
  'use strict';
  var revenue = {pre:12,'0-1m':20,'1-10m':29,'10-50m':55,'50-200m':95,'200m+':150,undisclosed:29};
  var employees = [[1,.8],[10,.85],[24,1],[49,1.15],[99,1.3],[250,1.5],[1000,1.8]];
  var age = [[0,.4],[2,.5],[4,.75],[10,1],[15,1.3],[25,1.45],[50,1.6]];
  function interpolate(curve,x){
    if(x<=curve[0][0]) return curve[0][1];
    for(var i=1;i<curve.length;i++){
      if(x<=curve[i][0]){
        var a=curve[i-1],b=curve[i];
        return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);
      }
    }
    return curve[curve.length-1][1];
  }
  function estimate(input,year){
    year=year || new Date().getFullYear();
    var emp=parseInt(input.employees,10);
    var years=input.founded==='pre-1900'?year-1899:input.founded?year-Number(input.founded):10;
    var low=revenue[input.revenue || 'undisclosed']*interpolate(employees,emp>0?emp:24)*interpolate(age,years);
    var high=low*1.43;
    return {low:Math.round(low*2)/2,high:Math.round(high*2)/2};
  }
  function format(k){return k>=1000?'$'+(Math.round(k/100)/10)+'M':'$'+k+'K';}
  root.DataValuation={estimate:estimate,format:format};
})(typeof window==='undefined'?globalThis:window);
