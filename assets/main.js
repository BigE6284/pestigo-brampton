(function(){
  document.body.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s,c){return (c||document).querySelector(s)}, $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* Year + Brampton clock */
  var yr=$('#yr'); if(yr) yr.textContent = new Date().getFullYear();
  function tick(){
    try{
      var t = new Intl.DateTimeFormat('en-CA',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'America/Toronto'}).format(new Date()).replace(/\./g,'').toUpperCase();
      $$('.js-time').forEach(function(el){el.textContent=t});
    }catch(e){}
  }
  tick(); setInterval(tick, 20000);

  /* Header state, progress, call bar, back-to-top */
  var header=$('#header'), prog=$('.progress'), callbar=$('#callbar'), totop=$('#totop');
  function onScroll(){
    var y=window.scrollY, h=document.documentElement.scrollHeight-innerHeight;
    header.classList.toggle('scrolled', y>20);
    prog.style.transform='scaleX('+(h>0?y/h:0)+')';
    callbar.classList.toggle('show', y>innerHeight*.6);
    totop.classList.toggle('show', y>innerHeight*1.2);
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  totop.addEventListener('click', function(){scrollTo({top:0,behavior:reduce?'auto':'smooth'})});

  /* Mobile menu */
  var menuBtn=$('.menu-btn');
  menuBtn.addEventListener('click', function(){
    var open=document.body.classList.toggle('menu-open');
    menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open?'Close menu':'Open menu');
  });
  $$('#mobile-menu a').forEach(function(a){a.addEventListener('click',function(){document.body.classList.remove('menu-open');menuBtn.setAttribute('aria-expanded','false')})});

  /* Active nav link */
  var links=$$('.nav-links a'), map={};
  links.forEach(function(a){var h=a.getAttribute('href')||''; if(h.charAt(0)==='#') map[h.slice(1)]=a});
  if('IntersectionObserver' in window){
    var navIO=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting && map[e.target.id]){links.forEach(function(l){l.classList.remove('active')}); map[e.target.id].classList.add('active');}
    })},{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(map).forEach(function(id){var s=document.getElementById(id); if(s) navIO.observe(s)});
  }

  /* Reveal on scroll */
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    $$('.reveal').forEach(function(el,i){el.style.transitionDelay=(i%4)*70+'ms';io.observe(el)});
  } else { $$('.reveal').forEach(function(el){el.classList.add('in')}); }

  /* Count-up */
  if(!reduce){
    $$('[data-count]').forEach(function(el){
      var end=parseFloat(el.dataset.count), dec=+(el.dataset.dec||0), start=null, dur=1400;
      el.textContent=(0).toFixed(dec);
      function step(ts){ if(!start) start=ts; var p=Math.min((ts-start)/dur,1), e=1-Math.pow(1-p,3); el.textContent=(end*e).toFixed(dec); if(p<1) requestAnimationFrame(step); }
      setTimeout(function(){requestAnimationFrame(step)},300);
    });
  }

  /* Hotspots: tap to toggle on touch */
  $$('.hotspot').forEach(function(h){h.addEventListener('click',function(){
    var on=!h.classList.contains('show'); $$('.hotspot').forEach(function(x){x.classList.remove('show')}); if(on) h.classList.add('show');
  })});
  document.addEventListener('click',function(e){ if(!e.target.closest('.hotspot')) $$('.hotspot').forEach(function(x){x.classList.remove('show')}) });

  /* Tabs (pest identifier) */
  var tabs=$$('[role="tab"]');
  function select(tab, focus){
    tabs.forEach(function(t){var on=t===tab; t.setAttribute('aria-selected',on); t.tabIndex=on?0:-1; document.getElementById(t.getAttribute('aria-controls')).hidden=!on;});
    if(focus) tab.focus();
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){select(t)});
    t.addEventListener('keydown',function(e){
      var k=e.key, n=null;
      if(k==='ArrowRight') n=tabs[(i+1)%tabs.length]; if(k==='ArrowLeft') n=tabs[(i-1+tabs.length)%tabs.length];
      if(k==='Home') n=tabs[0]; if(k==='End') n=tabs[tabs.length-1];
      if(n){e.preventDefault(); select(n,true);}
    });
  });

  /* Seasonal calendar */
  var seasons={
    winter:{t:'Winter',s:'December to February · typical activity',m:[['Mice & rats',4],['Cockroaches',3],['Centipedes',2],['Spiders',1]],tip:'Rodents are sheltering indoors. Check for gaps around doors, windows, pipes and vents, and store food securely.'},
    spring:{t:'Spring',s:'March to May · typical activity',m:[['Spiders',3],['Centipedes',3],['Cockroaches',3],['Mice & rats',2]],tip:'Melting snow means moisture. Fix leaks, dry out the basement and clear clutter where pests like to hide.'},
    summer:{t:'Summer',s:'June to August · typical activity',m:[['Spiders',4],['Centipedes',4],['Cockroaches',3],['Mice & rats',1]],tip:'Humidity peaks. Run a dehumidifier in the basement and trim plants back from your foundation.'},
    fall:{t:'Fall',s:'September to November · typical activity',m:[['Mice & rats',4],['Spiders',3],['Centipedes',2],['Cockroaches',3]],tip:'As temperatures drop, mice and rats look for a way in. This is the best time for a pre-winter inspection.'}
  };
  var labels=['','Low','Moderate','Active','High'];
  var sbtns=$$('.season-btn');
  if(sbtns.length){
  function showSeason(key){
    var d=seasons[key];
    sbtns.forEach(function(b){b.setAttribute('aria-pressed', b.dataset.season===key)});
    $('#season-title').textContent=d.t; $('#season-sub').textContent=d.s; $('#season-tip').textContent=d.tip;
    $('#meters').innerHTML=d.m.map(function(r){return '<div class="meter"><span>'+r[0]+'</span><div class="bar" role="img" aria-label="'+r[0]+': '+labels[r[1]]+'"><i'+(r[1]===4?' class="hi"':'')+' data-w="'+(r[1]*25)+'"></i></div><em>'+labels[r[1]]+'</em></div>'}).join('');
    requestAnimationFrame(function(){requestAnimationFrame(function(){$$('#meters i').forEach(function(i){i.style.width=i.dataset.w+'%'})})});
  }
  var mo=+new Intl.DateTimeFormat('en-CA',{month:'numeric',timeZone:'America/Toronto'}).format(new Date());
  var now = (mo===12||mo<=2)?'winter':(mo<=5)?'spring':(mo<=8)?'summer':'fall';
  sbtns.forEach(function(b){ if(b.dataset.season===now) b.classList.add('is-now'); b.addEventListener('click',function(){showSeason(b.dataset.season)}) });
  showSeason(now);
  }

  /* Services dropdown */
  $$('.has-drop').forEach(function(d){
    var b=d.querySelector('button');
    b.addEventListener('click',function(e){e.stopPropagation(); var o=d.classList.toggle('open'); b.setAttribute('aria-expanded',o);});
  });
  document.addEventListener('click',function(e){ $$('.has-drop.open').forEach(function(d){ if(!d.contains(e.target)){d.classList.remove('open');d.querySelector('button').setAttribute('aria-expanded','false')} }) });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ $$('.has-drop.open').forEach(function(d){d.classList.remove('open');d.querySelector('button').setAttribute('aria-expanded','false')}); document.body.classList.remove('menu-open'); } });

  /* ================= QUOTE WIZARD ================= */
  var wz=$('#wizard');
  if(wz){
    var EMAIL=wz.dataset.email, steps=$$('.wz-step',wz), bars=$$('.wz-progress i',wz), sideSteps=$$('.side-steps li'), cur=0;
    var back=$('.wz-back',wz), next=$('.wz-next',wz), submit=$('.wz-submit',wz), err=$('.wz-err',wz), count=$('.wz-count',wz);
    var photoURL=null, photoName='';
    var dateIn=$('#q-date'); if(dateIn){ var t=new Date(); dateIn.min=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0'); }

    function show(i){
      cur=i;
      steps.forEach(function(s,k){s.classList.toggle('active',k===i)});
      bars.forEach(function(b,k){b.classList.toggle('done',k<=i)});
      sideSteps.forEach(function(s,k){s.classList.toggle('on',k===i);s.classList.toggle('done',k<i)});
      count.textContent='Step '+(i+1)+' of '+steps.length;
      back.hidden=i===0; next.hidden=i===steps.length-1; submit.hidden=i!==steps.length-1;
      err.classList.remove('show');
    }
    function val(name){ var el=wz.querySelector('[name="'+name+'"]:checked'); return el?el.value:''; }
    function vals(name){ return $$('[name="'+name+'"]:checked',wz).map(function(e){return e.value}); }
    function fail(msg, el){ err.textContent=msg; err.classList.add('show'); if(el) el.focus(); return false; }
    function check(i){
      if(i===0 && !val('pest')) return fail('Please choose what you’re seeing (or “Not sure”).');
      if(i===2 && !val('urgency')) return fail('Please choose how soon you need help.');
      if(i===3){
        var name=$('#q-name'), phone=$('#q-phone'), email=$('#q-email');
        if(name.value.trim().length<2) return fail('Please add your name.', name);
        var d=phone.value.replace(/\D/g,''); if(d.length<10||d.length>11) return fail('Please add a valid phone number.', phone);
        if(val('contact')==='Email' && !/^\S+@\S+\.\S+$/.test(email.value.trim())) return fail('Please add your email so we can reply by email.', email);
        if(email.value.trim() && !/^\S+@\S+\.\S+$/.test(email.value.trim())) return fail('That email address doesn’t look right.', email);
      }
      return true;
    }
    next.addEventListener('click',function(){ if(check(cur)){ show(cur+1); wz.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'}); } });
    back.addEventListener('click',function(){ show(cur-1); });
    // Auto-advance on pest pick for speed
    $$('[name="pest"]',wz).forEach(function(r){ r.addEventListener('change',function(){ err.classList.remove('show'); }); });
    // Contact preference changes email requirement label
    $$('[name="contact"]',wz).forEach(function(r){ r.addEventListener('change',function(){ $('#q-email-opt').textContent = r.value==='Email' ? '(required for email replies)' : '(optional)'; }); });

    // Photo upload
    var file=$('#q-photo'), dz=$('.drop-zone',wz), pv=$('.photo-preview',wz);
    function setPhoto(f){
      if(!f) return;
      if(!/^image\//.test(f.type)){ fail('Please choose an image file.'); return; }
      if(photoURL) URL.revokeObjectURL(photoURL);
      photoURL=URL.createObjectURL(f); photoName=f.name||'pest-photo.jpg';
      $('img',pv).src=photoURL; $('b',pv).textContent=photoName; $('small',pv).textContent=(f.size/1024/1024).toFixed(1)+' MB · ready to attach';
      pv.classList.add('show'); dz.style.display='none';
    }
    file.addEventListener('change',function(){ setPhoto(file.files[0]); });
    ['dragenter','dragover'].forEach(function(ev){dz.addEventListener(ev,function(e){e.preventDefault();dz.classList.add('drag')})});
    ['dragleave','drop'].forEach(function(ev){dz.addEventListener(ev,function(e){e.preventDefault();dz.classList.remove('drag')})});
    dz.addEventListener('drop',function(e){ if(e.dataTransfer.files[0]) setPhoto(e.dataTransfer.files[0]); });
    $('button',pv).addEventListener('click',function(){ if(photoURL) URL.revokeObjectURL(photoURL); photoURL=null; photoName=''; file.value=''; pv.classList.remove('show'); dz.style.display=''; });

    // Prefill from links (?pest= or data-pest)
    function prefill(p){
      var r=$$('[name="pest"]',wz).filter(function(x){return x.value.toLowerCase()===String(p).toLowerCase()})[0];
      if(r){ r.checked=true; }
    }
    var qp=new URLSearchParams(location.search).get('pest'); if(qp) prefill(qp);
    if(wz.dataset.pest) prefill(wz.dataset.pest);
    $$('[data-pest]').forEach(function(a){ if(a===wz) return; a.addEventListener('click',function(){ prefill(a.dataset.pest); show(0); }); });

    // Submit → confirmation
    var form=$('#qform'), conf=$('#confirm');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!check(3)) return;
      var ref='PB-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
      var data=[
        ['Reference',ref],['Pest',val('pest')],['Property',val('property')||'—'],['Seen in',vals('where').join(', ')||'—'],
        ['Going on for',val('duration')||'—'],['How soon',val('urgency')],
        ['Preferred date',$('#q-date').value?new Date($('#q-date').value+'T12:00').toLocaleDateString('en-CA',{weekday:'short',month:'short',day:'numeric'}):'Flexible'],
        ['Preferred time',val('time')||'Flexible'],['Name',$('#q-name').value.trim()],['Phone',$('#q-phone').value.trim()],
        ['Email',$('#q-email').value.trim()||'—'],['Area',$('#q-area').value.trim()||'—'],['Reply by',val('contact')],
        ['Photo',photoURL?'Attached ('+photoName+')':'None'],['Notes',$('#q-notes').value.trim()||'—']
      ];
      $('#summary').innerHTML=data.filter(function(r){return r[0]!=='Reference'}).map(function(r){return '<dt>'+r[0]+'</dt><dd>'+r[1].replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+'</dd>'}).join('');
      $('#ref').textContent='Ref '+ref;
      var body='Hi Pestigo Brampton,\n\nI’d like a quote. Here are my details:\n\n'+data.map(function(r){return r[0]+': '+r[1]}).join('\n')+(photoURL?'\n\n(Photo of the pest attached.)':'')+'\n\nThanks!';
      var subj='Quote request '+ref+' – '+val('pest')+' – '+$('#q-name').value.trim();
      $('#send-mail').href='mailto:'+EMAIL+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);
      $('#copy-req').dataset.text=body;
      var pr=$('.photo-remind',conf);
      if(photoURL){ $('img',pr).src=photoURL; var dl=$('a',pr); dl.href=photoURL; dl.download=photoName; pr.classList.add('show'); } else pr.classList.remove('show');
      var how={'Phone call':'call you at '+$('#q-phone').value.trim(),'Text message':'text you at '+$('#q-phone').value.trim(),'Email':'email you at '+$('#q-email').value.trim()}[val('contact')];
      $('#sent-how').textContent=how; $('#sent-name').textContent=$('#q-name').value.trim().split(' ')[0];
      $('.wizard').style.display='none'; conf.classList.add('show');
      sideSteps.forEach(function(s){s.classList.remove('on');s.classList.add('done')});
      conf.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
      try{ if(window.gtag) gtag('event','generate_lead',{pest:val('pest')}); }catch(x){}
    });
    $('#send-mail').addEventListener('click',function(){ $('.sent-note').classList.add('show'); try{ if(window.gtag) gtag('event','quote_email_opened'); }catch(x){} });
    $('#copy-req').addEventListener('click',function(){
      var b=this, t=b.dataset.text||''; function done(){ $('span',b).textContent='Copied'; setTimeout(function(){$('span',b).textContent='Copy details'},1800); }
      if(navigator.clipboard) navigator.clipboard.writeText(t).then(done,function(){});
    });
    $('#edit-req').addEventListener('click',function(){ conf.classList.remove('show'); $('.wizard').style.display=''; show(3); });
    show(0);
  }

  /* Track phone taps (if analytics is enabled) */
  $$('a[href^="tel:"]').forEach(function(a){ a.addEventListener('click',function(){ try{ if(window.gtag) gtag('event','phone_call_click'); }catch(x){} }); });

})();
