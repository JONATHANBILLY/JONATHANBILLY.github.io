(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Scroll reveal */
  var targets = document.querySelectorAll('section .wrap, .hero, .dir-section .wrap, .finding, .shot, .kpis');
  targets.forEach(function(el){ el.classList.add('reveal'); });
  if(reduce || !('IntersectionObserver' in window)){
    targets.forEach(function(el){ el.classList.add('in'); });
  }else{
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{threshold:.08});
    targets.forEach(function(el){ io.observe(el); });
  }

  /* 2. KPI count-up (Case Study page) */
  var nums = document.querySelectorAll('[data-count]');
  function animate(el){
    var end = parseFloat(el.dataset.count),
        dec = parseInt(el.dataset.decimals||'0',10),
        pre = el.dataset.prefix||'', suf = el.dataset.suffix||'',
        dur = 1100, t0 = null;
    function frame(t){
      if(!t0) t0 = t;
      var p = Math.min((t-t0)/dur,1);
      p = 1-Math.pow(1-p,3);
      el.textContent = pre + (end*p).toFixed(dec) + suf;
      if(p<1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if(!reduce && 'IntersectionObserver' in window && nums.length){
    var io2 = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ animate(e.target); io2.unobserve(e.target); }
      });
    },{threshold:.4});
    nums.forEach(function(el){ io2.observe(el); });
  }

  /* 3. Recruiter Role Lens Filter (persisted across pages via localStorage) */
  var lensNotes = {
    all: '<strong>Full Profile View:</strong> Showing end-to-end capabilities across BI &amp; SQL analytics, financial/credit risk analysis, and cross-functional system delivery.',
    da: '<strong>Data Analyst Focus:</strong> Highlighting Power BI (DAX &amp; Star Schema), SQL transaction log investigation, MySQL query optimization, Tableau, and Python EDA.',
    ba: '<strong>Business Analyst Focus:</strong> Highlighting commercial credit &amp; SLIK risk modeling (Rp 500M–25B), requirement &amp; webhook flow design, and SIT/UAT validation.',
    pm: '<strong>Project Manager Focus:</strong> Highlighting PMI Agile &amp; Predictive certifications, cross-functional coordination (business, product, engineering), SIT/UAT governance, and 2–4 day integration SLAs.'
  };
  var lensBtns = document.querySelectorAll('.lens-btn');
  var lensNote = document.getElementById('lens-note');
  var roleItems = document.querySelectorAll('[data-roles]');

  function applyRole(role){
    if(!lensNotes[role]) role = 'all';
    try { localStorage.setItem('jb_recruiter_role', role); } catch(e){}

    lensBtns.forEach(function(b){
      var isMatch = b.dataset.role === role;
      b.classList.toggle('active', isMatch);
      b.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
    if(lensNote){
      lensNote.innerHTML = lensNotes[role];
    }
    roleItems.forEach(function(item){
      var matches = role === 'all' || item.dataset.roles.split(' ').indexOf(role) !== -1;
      item.classList.toggle('dimmed', !matches);
      item.classList.toggle('highlighted', role !== 'all' && matches);
    });
  }

  var initialRole = 'all';
  try {
    var params = new URLSearchParams(window.location.search);
    initialRole = params.get('role') || localStorage.getItem('jb_recruiter_role') || 'all';
  } catch(e){}
  if(lensBtns.length || roleItems.length){
    applyRole(initialRole);
  }

  lensBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      var role = btn.dataset.role;
      if(role !== 'all' && btn.classList.contains('active')){
        role = 'all';
      }
      applyRole(role);
    });
  });

  /* 4. Copy email helper (Contact page) */
  var copyBtn = document.getElementById('copy-email-btn');
  var feedback = document.getElementById('copy-feedback');
  if(copyBtn){
    copyBtn.addEventListener('click', function(){
      var email = 'jonathanbillym@gmail.com';
      function showCopied(){
        feedback.textContent = 'Copied ' + email + ' to clipboard.';
        setTimeout(function(){ feedback.textContent = ''; }, 3000);
      }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(email).then(showCopied).catch(function(){
          var ta = document.createElement('textarea');
          ta.value = email;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showCopied();
        });
      }else{
        var ta = document.createElement('textarea');
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopied();
      }
    });
  }

  /* 5. Lightbox for dashboard screenshots (Case Study page) */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightbox-img');
  var lbCap = document.getElementById('lightbox-caption');
  var lbClose = document.getElementById('lightbox-close');
  function closeLightbox(){
    if(!lb) return;
    lb.classList.remove('open');
    lbImg.src = '';
  }
  document.querySelectorAll('.shot img').forEach(function(img){
    img.addEventListener('click', function(){
      if(!lb) return;
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      var figcap = img.parentElement.querySelector('.shot-caption');
      lbCap.textContent = figcap ? figcap.textContent : img.alt;
      lb.classList.add('open');
    });
  });
  if(lbClose) lbClose.addEventListener('click', closeLightbox);
  if(lb) lb.addEventListener('click', function(e){ if(e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeLightbox(); });
})();
