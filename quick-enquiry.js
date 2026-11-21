/* 360 Media Group: quick "check your date" form.
   Static on service pages (form[data-qe]); added under the hero on the homepage. */
(function () {
  var KEY = 'c6e346b3-f6ee-4516-806b-92da78cbb922';
  var SEL = 'form[data-qe]';

  var CSS = '' +
    '.qe-ok,.qe-err{grid-column:1/-1;padding:14px 16px;border-radius:12px;font-weight:600;color:#080808;font-size:16px;line-height:1.45;text-transform:none;letter-spacing:0}' +
    '.qe-ok{background:#eef6ee;margin-top:24px;max-width:560px}.qe-err{background:#fdecea}.qe-ok a,.qe-err a{color:#080808}' +
    '.qe-sec{background:#080808;color:#fff;scroll-margin-top:0}' +
    '.qe-in{max-width:1440px;margin:0 auto;padding:96px 16px 64px;display:grid;gap:28px}' +
    '.qe-eyebrow{color:#D8B26A;font-weight:600;text-transform:uppercase;letter-spacing:.14em;font-size:13px;margin:0 0 12px}' +
    '.qe-h{font-size:clamp(2.4rem,5vw,3.8rem);line-height:1;text-transform:uppercase;margin:0 0 14px;color:#fff}' +
    '.qe-p{margin:0;color:rgba(255,255,255,.78);max-width:40ch;font-size:1.05rem;line-height:1.55}' +
    '.qe-form{display:grid;gap:14px;grid-template-columns:1fr;position:relative}' +
    '.qe-form label{display:flex;flex-direction:column;gap:7px;font-size:12.5px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.8)}' +
    '.qe-form input{font:inherit;font-size:16px;font-weight:400;text-transform:none;letter-spacing:0;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.25);background:#fff;color:#080808;width:100%;min-height:50px;box-sizing:border-box}' +
    '.qe-form button{grid-column:1/-1;font:inherit;font-weight:700;font-size:16px;padding:16px 18px;border-radius:999px;border:0;background:#D8B26A;color:#080808;cursor:pointer}' +
    '.qe-form button[disabled]{opacity:.6}' +
    '.qe-form .qe-hp{position:absolute;left:-9999px;width:1px;min-height:0}' +
    '.qe-note{grid-column:1/-1;font-size:13.5px;color:rgba(255,255,255,.65);margin:0}.qe-note a{color:#fff}' +
    '.qe-sec .qe-ok{margin-top:0;max-width:none}' +
    '@media(min-width:640px){.qe-form{grid-template-columns:1fr 1fr 1fr}.qe-in{padding:104px 24px 72px}}' +
    '@media(min-width:1024px){.qe-in{grid-template-columns:5fr 7fr;gap:64px;padding:120px 48px 96px;align-items:center}}';

  var HOME = '' +
    '<div class="qe-in"><div><p class="qe-eyebrow">Check your date</p>' +
    '<h2 class="qe-h font-anton">Is your date free?</h2>' +
    '<p class="qe-p">Name, number and date. That\'s all we need. We reply the same day, usually within a couple of hours.</p></div>' +
    '<form class="qe-form" data-qe>' +
    '<input class="qe-hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<label>Name<input name="name" required autocomplete="name"></label>' +
    '<label>Phone<input name="phone" type="tel" required autocomplete="tel"></label>' +
    '<label>Event date<input name="event-date" type="date"></label>' +
    '<button type="submit">Check my date</button>' +
    '<p class="qe-note">Prefer to talk? Call <a href="tel:+61461406627">0461 406 627</a>.</p>' +
    '</form></div>';

  function clean(s) { return String(s || '').replace(/[<>&]/g, '').trim(); }

  function addCss() {
    if (document.getElementById('qe-css')) return;
    var st = document.createElement('style'); st.id = 'qe-css'; st.textContent = CSS;
    document.head.appendChild(st);
  }

  async function send(f) {
    if (f._honey && f._honey.value) return;
    var d = Object.fromEntries(new FormData(f).entries());
    delete d._honey;
    var b = f.querySelector('button'), label = b.textContent;
    var old = f.querySelector('.qe-err'); if (old) old.remove();
    b.disabled = true; b.textContent = 'Sending…';
    d.form = 'Quick check (top of page)';
    d.page = location.pathname;
    d.referrer = document.referrer || '(direct)';
    try {
      var r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({}, d, {
          access_key: KEY,
          subject: 'New event enquiry — ' + d.name + ' — ' + (d['event-date'] || 'date TBC'),
          from_name: '360 Media Group website',
          botcheck: ''
        }))
      });
      var j = await r.json().catch(function () { return {}; });
      if (!r.ok || j.success === false) throw 0;
      if (window.gtag) {
        gtag('event', 'generate_lead', { form: 'quick_top', page: location.pathname });
        gtag('event', 'conversion', { send_to: 'AW-18261423689/xMW4CIu8sK0dEMns3INE' });
      }
      if (window.fbq) fbq('track', 'Lead');
      var ok = document.createElement('div'); ok.className = 'qe-ok';
      ok.textContent = 'Thanks ' + clean(d.name) + '! Got it. Jack will call or text you back, usually within a couple of hours (7am to 9pm).';
      f.replaceWith(ok);
    } catch (x) {
      b.disabled = false; b.textContent = label;
      var m = document.createElement('div'); m.className = 'qe-err';
      m.innerHTML = 'Sorry, that didn\'t send. Please call <a href="tel:+61461406627">0461 406 627</a>.';
      f.appendChild(m);
    }
  }

  /* window capture runs before the homepage's document-level submit tracker,
     so a quick-form submit is only counted as a lead once it has actually sent. */
  window.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.matches || !f.matches(SEL)) return;
    e.preventDefault(); e.stopPropagation();
    send(f);
  }, true);

  /* Homepage only: add the section under the hero once React has finished with the page. */
  function hero() { return document.querySelector('section#top.hero-section'); }
  function hydrated(el) { return Object.keys(el).some(function (k) { return k.indexOf('__react') === 0; }); }
  function inject() {
    var h = hero();
    if (!h || document.getElementById('quick-check')) return;
    var s = document.createElement('section');
    s.id = 'quick-check'; s.className = 'qe-sec'; s.setAttribute('aria-label', 'Check your date');
    s.innerHTML = HOME;
    h.insertAdjacentElement('afterend', s);
  }
  function start() {
    addCss();
    if (!hero()) return;
    var n = 0, t = setInterval(function () {
      n++;
      var h = hero();
      if (!h) { clearInterval(t); return; }
      if (hydrated(h) || n > 40) {
        clearInterval(t); inject();
        var c = 0, g = setInterval(function () { c++; inject(); if (c > 30) clearInterval(g); }, 1000);
      }
    }, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  /* Homepage: the top "Enquire now" and "Check your date" buttons go to the quick form. */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a.ink-enquire, a.header-cta');
    var q = document.getElementById('quick-check');
    if (!a || !q) return;
    e.preventDefault(); e.stopPropagation();
    q.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var i = q.querySelector('input[name="name"]');
    if (i) setTimeout(function () { i.focus({ preventScroll: true }); }, 800);
  }, true);
})();
