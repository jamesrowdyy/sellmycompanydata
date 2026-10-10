/* Deliberately excludes names, emails, company names, form contents and URL queries.
   These events are available to an authorised analytics integration via dataLayer
   and the smcd:conversion event. No remote collector is configured by default. */
(function(){
  var allowed=['estimate_started','estimate_completed','seller_lead_submitted','buyer_brief_submitted','referral_submitted','booking_opened'];
  window.SMCD={track:function(name){
    if(allowed.indexOf(name)<0)return;
    var detail={event:'smcd_'+name,page:location.pathname};
    window.dataLayer=window.dataLayer||[];window.dataLayer.push(detail);
    window.dispatchEvent(new CustomEvent('smcd:conversion',{detail:detail}));
  }};
  var started=false,completed=false;
  ['emp','yr','ctry'].forEach(function(id){
    var input=document.getElementById(id);if(!input)return;
    input.addEventListener('input',changed);input.addEventListener('change',changed);
  });
  function changed(){
    if(!started){window.SMCD.track('estimate_started');started=true;}
    if(!completed && Number(document.getElementById('emp').value)>=1 && document.getElementById('yr').value){window.SMCD.track('estimate_completed');completed=true;}
  }
  var grid=document.getElementById('industry-grid'),toggle=document.querySelector('.industry-toggle');
  if(grid&&toggle){
    grid.classList.add('is-collapsed');toggle.hidden=false;
    toggle.addEventListener('click',function(){
      var expand=toggle.getAttribute('aria-expanded')!=='true';
      toggle.setAttribute('aria-expanded',String(expand));grid.classList.toggle('is-collapsed',!expand);
      toggle.textContent=expand?'Show fewer industries':'See all 12 industries';
    });
  }
  var link=document.getElementById('booking-link');if(link)link.addEventListener('click',function(){window.SMCD.track('booking_opened');});
})();
