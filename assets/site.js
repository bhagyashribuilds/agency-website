// Bhagyashri Builds — shared site behavior. Linked from every page.
(function(){
  // Nav scroll elevation
  const navEl = document.querySelector('nav');
  if(navEl){
    const onScroll = ()=>{ navEl.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  // Active-section highlighting in the nav (in-page anchor links only)
  (function(){
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    if(!navLinks.length) return;
    const map = new Map();
    navLinks.forEach(a=>{
      const id = a.getAttribute('href');
      const section = id && id.startsWith('#') ? document.querySelector(id) : null;
      if(section) map.set(section, a);
    });
    if(!map.size) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        const link = map.get(entry.target);
        if(!link) return;
        if(entry.isIntersecting){
          navLinks.forEach(a=> a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, {rootMargin:'-45% 0px -50% 0px', threshold:0});
    map.forEach((link, section)=> io.observe(section));
  })();

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if(isDark){
        document.documentElement.removeAttribute('data-theme');
        try{ localStorage.setItem('theme','light'); }catch(e){}
      } else {
        document.documentElement.setAttribute('data-theme','dark');
        try{ localStorage.setItem('theme','dark'); }catch(e){}
      }
    });
  }

  // Mobile nav toggle
  const navBurger = document.getElementById('navBurger');
  const navMobilePanel = document.getElementById('navMobilePanel');
  if(navBurger && navMobilePanel){
    navBurger.addEventListener('click', ()=>{
      const isOpen = navMobilePanel.classList.toggle('open');
      navBurger.classList.toggle('open', isOpen);
      navBurger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navMobilePanel.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        navMobilePanel.classList.remove('open');
        navBurger.classList.remove('open');
        navBurger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i=> i!==item && i.classList.remove('open'));
      item.classList.toggle('open', !isOpen);
    });
  });

  // Hero terminal typing effect (no-op on pages without #typed)
  (function(){
    const html =
`<span class="kw">const</span> dev <span class="punc">= {</span>
  <span class="key">name</span><span class="punc">:</span> <span class="str">"Bhagyashri Chudji"</span><span class="punc">,</span>
  <span class="key">role</span><span class="punc">:</span> <span class="str">"Backend &amp; Cloud Engineer"</span><span class="punc">,</span>
  <span class="key">experience</span><span class="punc">:</span> <span class="str">"7+ years"</span><span class="punc">,</span>
  <span class="key">status</span><span class="punc">:</span> <span class="str">"available_for_hire"</span>
<span class="punc">};</span>

<span class="punc">$</span> deploy(dev)
<span class="ok">✓ ready to ship</span>`;
    const el = document.getElementById('typed');
    if(!el) return;
    const plain = html.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&');
    let i = 0;
    function type(){
      if(i <= plain.length){
        el.textContent = plain.slice(0,i);
        i += 2;
        setTimeout(type, 14);
      } else {
        el.innerHTML = html;
      }
    }
    type();
  })();

  // Count-up numbers (e.g. "90% faster"). The static HTML already shows the
  // real number for SEO/no-JS; JS resets to 0 and animates back up for effect.
  (function(){
    const els = document.querySelectorAll('.countup');
    if(!els.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        const target = parseInt(el.getAttribute('data-target'),10) || 0;
        const dur = 900;
        el.textContent = '0';
        const start = performance.now();
        function step(now){
          const p = Math.min(1,(now-start)/dur);
          el.textContent = Math.round(target * (1 - Math.pow(1-p,3)));
          if(p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, {threshold:0.5});
    els.forEach(el=> io.observe(el));
  })();

  // Scroll-reveal
  (function(){
    const els = document.querySelectorAll('[data-reveal]');
    if(!els.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15});
    els.forEach(el=> io.observe(el));
  })();

  // Lead form -> saves to Google Sheet + emails Bhagyashri, then opens WhatsApp
  // (index.html and contact.html share the same #leadForm markup/IDs)
  const leadForm = document.getElementById('leadForm');
  if(leadForm){
    const WHATSAPP_NUMBER = "919324375046";
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwsoGRx41d73CpY-rVrfwVVPr9gmFUynm3EOzFHhwzLW_mMTfhkNcjWlYNCisSccLo/exec";

    leadForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = document.getElementById('lf-name').value.trim();
      const contact = document.getElementById('lf-contact').value.trim();
      const need = document.getElementById('lf-need').value;
      const msg = document.getElementById('lf-msg').value.trim();

      if (SCRIPT_URL && SCRIPT_URL.indexOf("PASTE_YOUR") === -1) {
        fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ name, contact, need, message: msg })
        }).catch(()=>{ /* even if this fails, still proceed to WhatsApp below */ });
      }

      const text = `Hi, I'm ${name}.\nContact: ${contact}\nNeed: ${need}\n${msg ? 'Details: ' + msg : ''}`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

      document.getElementById('leadFormWrap').style.display = 'none';
      document.getElementById('leadSuccess').classList.add('show');

      window.open(url, '_blank');
    });
  }
})();
