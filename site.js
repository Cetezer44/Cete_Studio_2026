/* Cete Studio 2026 — curseur, loader, roulette, page projet, modal contact et transitions Barba.js
   Chargé depuis Webflow (code global du site, pied de page), après barba.umd.js */

/* ---------- Curseur personnalisé (cercle + point, mode différence) ---------- */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return; // pas de curseur sur tactile
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PLAY = 'https://cdn.prod.website-files.com/6acf743eb4f622a1815188f4/6acf78fbe4ae41a4c2e44959_play.svg';
  var c = document.createElement('div');
  c.className = 'c-cursor';
  c.setAttribute('aria-hidden', 'true');
  c.innerHTML = '<div class="c-cursor__ring"></div><div class="c-cursor__dot"></div>' +
    '<div class="c-cursor__label"><div class="c-cursor__label-in"><img src="' + PLAY + '" alt=""><span>Lire le showreel</span></div></div>' +
    '<div class="c-cursor__disc"><span class="c-cursor__disc-in">Découvrir</span></div>' +
    // Modal contact : « Fermer » partout où il n'y a pas de lien
    '<div class="c-cursor__close"><span class="c-cursor__close-in">Fermer</span></div>' +
    // Hero de l'accueil : invitation au scroll (trait qui s'efface, puis « Scroll », en boucle)
    '<div class="c-cursor__cue"><span class="c-cursor__cue-in"><i class="c-cursor__cue-line"></i><span class="c-cursor__cue-txt">Scroll</span></span></div>' +
    // Lecture / pause au survol de la vidéo du showreel (maquette Figma « Play/Pause »)
    '<div class="c-cursor__media"><svg class="c-cursor__icon" viewBox="0 0 60 60" fill="none" stroke="#fff" stroke-width="1">' +
      '<circle cx="30" cy="30" r="29.5"/>' +
      '<g class="c-cursor__pause"><path d="M27.5 25v10M32.5 25v10"/></g>' +
      '<g class="c-cursor__play"><path d="M27.5 24.9v10.4l8.4-5.2z" stroke-linejoin="round"/></g></svg></div>';
  document.body.appendChild(c);
  // « Voir » au survol d'une photo projet (page Projets) : pastille en verre dépoli, hors du mode différence
  // (un parent en mix-blend empêcherait le flou d'arrière-plan)
  var view = document.createElement('div');
  view.className = 'c-view';
  view.setAttribute('aria-hidden', 'true');
  view.innerHTML = '<div class="c-view__in"><span>Voir</span></div>';
  document.body.appendChild(view);
  document.documentElement.classList.add('has-cursor');
  var ring = c.querySelector('.c-cursor__ring'), dot = c.querySelector('.c-cursor__dot'), label = c.querySelector('.c-cursor__label');
  var media = c.querySelector('.c-cursor__media'), over = null;   // vidéo survolée
  var disc = c.querySelector('.c-cursor__disc');
  var cue = c.querySelector('.c-cursor__cue');
  var closer = c.querySelector('.c-cursor__close');
  var mx = -100, my = -100, rx = mx, ry = my;
  var LINKS = 'a, button, [role="button"], input[type="submit"], label, select';

  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!c.classList.contains('is-visible')) { rx = mx; ry = my; c.classList.add('is-visible'); }
  });
  document.addEventListener('mouseleave', function () { c.classList.remove('is-visible'); view.classList.remove('is-on'); });
  // clic sur un projet : la pastille disparaît pendant la transition
  document.addEventListener('click', function () { view.classList.remove('is-on'); c.classList.remove('is-view', 'is-close'); }, true);
  document.addEventListener('mouseover', function (e) {
    var t = e.target.closest ? e.target : null;
    var video = !!(t && t.closest('.showreel'));
    over = t && t.closest('.sr-video');
    var see = !!(t && t.closest('.works-page .works-media, .works-page .wl-media, .wheel-card.is-front'));
    c.classList.toggle('is-video', video);
    c.classList.toggle('is-view', see);
    view.classList.toggle('is-on', see);
    c.classList.toggle('is-hover', !video && !over && !see && !!(t && t.closest(LINKS)));
    c.classList.toggle('is-close', !!(t && ((document.documentElement.classList.contains('is-menu') && t.closest('.cm, .cm-bg') && !t.closest(LINKS)) ||
      (!document.documentElement.classList.contains('is-menu') && t.closest('[data-cursor="close"]')))));
    mediaState();
  });
  // « Voir » piloté par le script de la page (ex. image au centre du cylindre des services, rendue en WebGL)
  // host/before : la pastille est insérée dans ce conteneur (ex. scène des services, sous les titres) au lieu de
  // passer au-dessus de toute la page ; elle revient dans <body> une fois éteinte
  var viewBack = null;
  function viewHome() {
    clearTimeout(viewBack);
    if (view.parentNode !== document.body) { document.body.appendChild(view); view.classList.remove('is-under'); }
  }
  window.__cursorView = function (on, host, before) {
    c.classList.toggle('is-view', !!on);
    clearTimeout(viewBack);
    if (on && host && view.parentNode !== host) {
      host.insertBefore(view, before || null);
      view.classList.add('is-under');
      void view.offsetWidth;   // la transition d'apparition repart du bon état après le déplacement
    }
    view.classList.toggle('is-on', !!on);
    if (!on && view.parentNode !== document.body) viewBack = setTimeout(function () { if (!view.classList.contains('is-on')) viewHome(); }, 450);
  };
  window.__cursorViewHome = viewHome;
  function mediaState() {
    c.classList.toggle('is-media', !!over);
    c.classList.toggle('is-paused', !!over && over.paused);
  }
  // L'icône suit l'état réel de la vidéo (clic, Espace, fin de lecture…)
  ['play', 'pause', 'ended'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.target === over) mediaState(); }, true);
  });

  (function loop() {
    rx += (mx - rx) * (reduce ? 1 : 0.18);   // le cercle suit avec une légère inertie
    ry += (my - ry) * (reduce ? 1 : 0.18);
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    label.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    media.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    view.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    disc.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    cue.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    closer.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    requestAnimationFrame(loop);
  })();
})();

(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.16,1,.3,1)';     // expo.out : entrées
  var INOUT = 'cubic-bezier(.65,0,.35,1)';   // power3.inOut : rideaux, sorties, déplacements
  var LOADER_LOGO = 'https://cdn.prod.website-files.com/6acf743eb4f622a1815188f4/6acf8869d90e9eb863d5e204_logo-cete-loader.svg';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- Outils : masques ---------- */
  function maskText(el, axis) {
    if (!el) return null;
    var inner = document.createElement('span');
    while (el.firstChild) inner.appendChild(el.firstChild);
    el.appendChild(inner);
    if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
    el.style.overflow = 'hidden';
    // marge de sécurité de .15em autour du texte, ajoutée aux marges/paddings existants (Designer)
    var cs = getComputedStyle(el), sides = axis === 'x' ? ['Left', 'Right'] : ['Top', 'Bottom'];
    sides.forEach(function (sd) {
      el.style['padding' + sd] = 'calc(' + cs['padding' + sd] + ' + .15em)';
      el.style['margin' + sd] = 'calc(' + cs['margin' + sd] + ' - .15em)';
    });
    inner.style.display = 'block';
    inner.dataset.axis = axis || 'y';
    hide(inner);
    return inner;
  }
  function hide(el) {
    el.style.transition = 'none';
    el.style.transform = el.dataset.axis === 'x' ? 'translateX(170%)' : 'translateY(170%)';
  }
  function reveal(list, delay, stagger, dur) {
    list.filter(Boolean).forEach(function (el, i) {
      setTimeout(function () {
        el.style.transition = 'transform ' + (dur || 1000) + 'ms ' + EASE;
        el.style.transform = 'none';
      }, delay + i * (stagger || 0));
    });
  }
  function conceal(list, delay, stagger, dur) {
    list.filter(Boolean).forEach(function (el, i) {
      setTimeout(function () {
        el.style.transition = 'transform ' + (dur || 500) + 'ms ' + INOUT;
        el.style.transform = el.dataset.axis === 'x' ? 'translateX(-170%)' : 'translateY(-170%)';
      }, delay + i * (stagger || 0));
    });
  }

  /* =====================================================================
     ACCUEIL : loader (1re visite), titre en masque, roulette pilotée au scroll
     ===================================================================== */
  function Home(container, opts) {
    var first = opts.first;
    var ac = new AbortController();
    function on(t, type, fn, o) { o = o || {}; o.signal = ac.signal; t.addEventListener(type, fn, o); }
    var alive = true, leaving = false;
    var track = $('.home-track', container);
    if (!track) return null;

    /* ---- 1. Titre : chaque ligne monte depuis un masque ---- */
    var titleLines = [], titleReady = false, titleWanted = false;
    function splitTitle() {
      if (titleReady || !alive) return;
      titleReady = true;
      var h = $('.hero-title', track);
      if (!h) return;
      var words = h.textContent.trim().split(/\s+/);
      h.textContent = '';
      var spans = words.map(function (w, i) {
        var s = document.createElement('span');
        s.textContent = w;
        s.style.display = 'inline-block';
        h.appendChild(s);
        // retour à la ligne forcé après « de » (maquette : « Studio de / design digital. »)
        if (i < words.length - 1) h.appendChild(/^de$/i.test(w) ? document.createElement('br') : document.createTextNode(' '));
        return s;
      });
      var lines = [], top = null;
      spans.forEach(function (s) {
        if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; }
        lines[lines.length - 1].push(s.textContent);
      });
      h.textContent = '';
      h.setAttribute('aria-label', words.join(' '));
      lines.forEach(function (l) {
        var mask = document.createElement('span');
        mask.setAttribute('aria-hidden', 'true');
        mask.style.cssText = 'display:block;overflow:hidden;padding-bottom:.08em;margin-bottom:-.08em';
        var inner = document.createElement('span');
        inner.textContent = l.join(' ');
        inner.style.cssText = 'display:block;transform:translateY(110%)';
        mask.appendChild(inner);
        h.appendChild(mask);
        titleLines.push(inner);
      });
      root.classList.remove('is-intro');
      if (titleWanted) revealTitle();
    }
    function revealTitle() {
      titleWanted = true;
      if (!titleReady) return;
      titleLines.forEach(function (s, i) {
        s.style.transition = 'transform 1100ms ' + EASE + ' ' + (i * 90) + 'ms';
        s.style.transform = 'translateY(0)';
      });
    }
    function concealTitle() {
      titleLines.forEach(function (s, i) {
        s.style.transition = 'transform 650ms ' + INOUT + ' ' + (i * 60) + 'ms';
        s.style.transform = 'translateY(-110%)';
      });
    }
    if (reduce) {
      root.classList.remove('is-intro');
      var hr = $('.hero-title', track);
      if (hr) hr.innerHTML = hr.textContent.trim().replace(/(^|\s)de\s+/i, '$1de<br>');
    }
    else if (first && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(splitTitle);
      setTimeout(splitTitle, 1500); // filet de sécurité
    } else { splitTitle(); }

    /* ---- 2. Roulette ---- */
    var wheel = $('.wheel', track);
    var base = $$('.wheel-card', wheel);
    var N = base.length;
    if (!N) return null;

    // Chaque carte vient de la collection CMS « Works » : lien vers la page du projet (/projets/slug)
    base.forEach(function (c) {
      var slug = c.getAttribute('data-slug');
      if (slug) c.setAttribute('href', '/projets/' + slug);
    });
    // On triple la série pour que la boucle se fasse hors écran
    for (var r = 0; r < 2; r++) {
      base.forEach(function (c) {
        var cl = c.cloneNode(true);
        cl.setAttribute('aria-hidden', 'true');
        cl.setAttribute('tabindex', '-1');
        wheel.appendChild(cl);
      });
    }
    var cards = $$('.wheel-card', wheel);
    var M = cards.length;
    // Numéro + titre posés dans chaque photo : ils tournent avec la roue (visibles sur la photo au premier plan)
    cards.forEach(function (c) {
      var cap = document.createElement('span');
      cap.className = 'wheel-cap';
      cap.setAttribute('aria-hidden', 'true');
      cap.innerHTML = '<span class="wheel-cap-num"></span><span class="wheel-cap-title"></span>';
      cap.firstChild.textContent = c.getAttribute('data-num') || '';
      cap.lastChild.textContent = c.getAttribute('data-title') || '';
      c.appendChild(cap);
    });

    var info = $('.wheel-info', track);
    var num = $('.wheel-num', track);
    var title = $('.wheel-title', track);
    var arrow = $('.wheel-arrow', track);

    var START = 0;            // projet affiché à la fin de l'intro (0 = 01)
    var INTRO_DEG = 5;        // l'intro part déjà sur 01 / Naostage et tourne de 5° maximum
    var INTRO_MS = 1600;
    var INTRO_FROM = -0.5;    // recalculé dans geo() : INTRO_DEG / écart angulaire
    var intro = !reduce, introGo = false;
    var cur = intro ? INTRO_FROM : START, target = START, active = -1, g = {}, dirty = true;
    var timer, snapTimer, lock = 0, t0 = null;

    function geo() {
      var W = window.innerWidth, H = window.innerHeight, m = W < 768;
      var k = m ? W / 390 : W / 1440;   // maquette desktop 1440 × 867
      var Z = m ? 1 : 0.91;             // roulette réduite (maquette : photo active 510 px au lieu de 560)
      g = {
        step: m ? 12.5 : 14,              // écart angulaire entre deux photos
        R:    m ? 520 * k : 582 * k,      // rayon de la roue
        px:   m ? W * 1.75 : 1880 * k,    // pivot, hors écran à droite
        py:   m ? H * 0.62 : H / 2,
        sc:   m ? 1.18 : 1.423 * Z,       // photo active : 510 px de large sur la maquette
        n1:   m ? 0.95 : 0.973 * Z,       // taille des photos voisines
        fall: m ? 0.12 : 0.157 * Z,       // réduction de taille par cran supplémentaire
        sh:   m ? 0 : -167 * k,           // décalage vers la gauche de la photo active (centre à x = 1131 sur la maquette)
        bx:   m ? 0 : 55 * k,             // photos de derrière poussées vers la droite (pas de vide sur le bord droit)
        gap:  m ? 20 : 40 * k * Z,
        k:    m ? Math.max(0.6, k * 0.6) : k,
        w: cards[0].offsetWidth,
        h: cards[0].offsetHeight
      };
      INTRO_FROM = START - INTRO_DEG / g.step;
      // la photo au premier plan est agrandie (× sc) : la légende est dimensionnée pour retomber sur la maquette
      wheel.style.setProperty('--cap-pad', (40 * k * Z / g.sc).toFixed(2) + 'px');
      wheel.style.setProperty('--cap-s', (1 / g.sc).toFixed(4));
      if (intro && !introGo) cur = INTRO_FROM;
      dirty = true;
    }
    function smooth(t) { return t * t * (3 - 2 * t); }
    function easeIntro(t) { return t >= 1 ? 1 : 1 - Math.pow(1 - t, 4); }   // quart.out
    function dist(j) { var d = j - cur; d = ((d % M) + M) % M; if (d >= M / 2) d -= M; return d; }

    // Infos du projet : numéro, titre et flèche dans des masques
    var OFF = '170%';
    function masked(el) {
      el.style.display = 'block';
      el.style.overflow = 'hidden';
      el.style.padding = '.15em 0';
      el.style.margin = '-.15em 0';
      var s = el.querySelector('img') || document.createElement('span');
      if (!s.parentNode) { s.textContent = el.textContent; el.textContent = ''; el.appendChild(s); }
      s.style.display = 'block';
      s.style.transform = 'translateY(' + OFF + ')';
      return s;
    }
    var numIn = masked(num), titleIn = masked(title), arrowIn = masked(arrow);
    var parts = [numIn, titleIn, arrowIn];
    function hideInfo() {
      parts.forEach(function (el, i) {
        el.style.transition = 'transform 380ms ' + INOUT + ' ' + (i * 40) + 'ms';
        el.style.transform = 'translateY(-' + OFF + ')';
      });
    }
    function showInfo() {
      parts.forEach(function (el) { el.style.transition = 'none'; el.style.transform = 'translateY(' + OFF + ')'; });
      info.offsetHeight;
      parts.forEach(function (el, i) {
        el.style.transition = 'transform 900ms ' + EASE + ' ' + (i * 70) + 'ms';
        el.style.transform = 'translateY(0)';
      });
    }
    function apply(i) {
      var c = cards[i], h = c.getAttribute('href');
      numIn.textContent = c.getAttribute('data-num');
      titleIn.textContent = c.getAttribute('data-title');
      title.setAttribute('href', h);
      arrow.setAttribute('href', h);
    }
    function setActive(i, instant) {
      active = i;
      if (instant || reduce) {
        apply(i);
        parts.forEach(function (el) { el.style.transition = 'none'; el.style.transform = 'translateY(0)'; });
        return;
      }
      hideInfo();
      clearTimeout(timer);
      timer = setTimeout(function () { if (!leaving) { apply(active); showInfo(); } }, 400);
    }

    function render() {
      for (var j = 0; j < M; j++) {
        var d = dist(j), ad = Math.abs(d);
        var a = -d * g.step;              // les projets suivants arrivent par le bas
        var f = smooth(Math.max(0, 1 - ad));
        var rad = a * Math.PI / 180;
        var x = g.px - g.R * Math.cos(rad) + g.sh * f + g.bx * (1 - f);
        var y = g.py - g.R * Math.sin(rad);
        var s = ad < 1 ? g.n1 + (g.sc - g.n1) * f : Math.max(0.55, g.n1 - g.fall * (ad - 1));
        var c = cards[j];
        c.style.transform = 'translate3d(' + (x - g.w / 2) + 'px,' + (y - g.h / 2) + 'px,0) rotate(' + a + 'deg) scale(' + s + ')';
        c.style.zIndex = String(100 - Math.round(ad * 10));
        c.style.filter = 'grayscale(' + (1 - f).toFixed(3) + ')';   // noir et blanc derrière, couleur devant
        c.style.visibility = ad > 6.5 ? 'hidden' : 'visible';
        c.classList.toggle('is-front', ad < 0.5);   // dégradé + curseur « Voir » sur la photo au premier plan
      }
      // numéro + titre en blanc, posés en bas à gauche de la photo au premier plan (40 px de marge sur la maquette)
      var aw = g.w * g.sc, ah = g.h * g.sc, pad = g.k * 40 * (window.innerWidth < 768 ? 1 : 0.91);
      info.style.left = (g.px - g.R + g.sh - aw / 2 + pad) + 'px';
      info.style.top = (g.py + ah / 2 - pad - info.offsetHeight) + 'px';
      if (intro) return;
      var i = ((Math.round(cur) % N) + N) % N;
      if (i !== active) setActive(i, active === -1);
    }

    /* ---- 3. Entrées : molette, tactile, clavier (la page ne défile jamais) ---- */
    var dir = 0;
    function blocked() { return intro || leaving || root.classList.contains('is-menu') || root.classList.contains('is-reel'); }
    function snapLater() {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(function () {
        target = dir > 0 ? Math.ceil(target - 0.2) : Math.floor(target + 0.2);
        clampT();
        if (!anchoring && !pendingAbout) holdLast();   // jamais d'arrêt entre le 3e projet et le passage
      }, 140);
    }
    // Changement de projet « d'un cran » (lecture auto, clavier) : courbe ease-in-out lente
    // au lieu du suivi exponentiel utilisé pendant le scroll
    var SLIDE_MS = 1800, tween = null;
    function easeInOut(t) { return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; }   // quart.inOut
    // La roulette parcourt les projets START → LAST ; une fois le dernier atteint, le scroll suivant fait
    // défiler la page vers la section du dessous. En revenant en haut, le scroll vers le haut refait tourner la roue.
    // Seuls les 3 premiers projets se parcourent (les autres photos restent visibles en fond sur la roue) ;
    // après le 3e, le scroll suivant fait passer à la section noire. La roue avance alors d'un demi-cran
    // pendant le passage (le 3e projet reste actif), ou finit son tour si tous les projets sont parcourus.
    var NAV = Math.min(3, N), LAST = START + NAV - 1, END = LAST + (NAV === N ? 1 : 0.45);
    var free = false, anchoring = false, pendingAbout = false;
    var ABOUT_MS = 1600;   // durée du passage section 1 → section 2 (défilement + fin de rotation de la roue)
    // départ immédiat (cubic.out) : la page part dans le prolongement du geste, sans temps d'arrêt
    function easeOutC(t) { return 1 - Math.pow(1 - t, 3); }
    // dès que la roue quitte le dernier projet vers le 01, elle termine son tour et l'ancre part vers la section du dessous
    // (la roue doit d'abord s'arrêter sur le dernier projet : un grand geste ne peut pas le sauter)
    function passLast() {
      // dès que la roue arrive sur le 3e projet, le geste suivant enchaîne directement vers la section noire
      // (pas besoin que la roue soit arrêtée) ; la roue continue de tourner pendant que la page descend
      if (target < LAST - 0.001 || cur < LAST - 0.5) return false;
      target = END; tween = reduce ? null : { a: cur, b: END, t0: performance.now(), d: ABOUT_MS, e: easeOutC };
      goAbout();
      return true;
    }
    function holdLast() { if (target > LAST) target = LAST; }
    function clampT() { target = Math.max(START, Math.min(END, target)); }
    function atEnd() { return target >= END - 0.001 && Math.abs(cur - END) < 0.02; }
    function setFree(v) {
      free = v;
      root.classList.toggle('home-free', v);
    }
    ac.signal.addEventListener('abort', function () { root.classList.remove('home-free'); });
    // Réseaux sociaux du hero : ils sortent dans leur masque en passant à la section noire, et reviennent
    // par le bas en remontant à la roulette
    function socialsShow(on) {
      var sp = $$('.home-socials .nav-link > span[data-axis]', track), box = $('.home-socials', track);
      if (on && box) box.style.opacity = '';
      if (!sp.length) { if (box) { box.style.transition = 'opacity 400ms ease'; box.style.opacity = on ? '' : '0'; } return; }
      if (on) { sp.forEach(hide); reveal(sp, 350, 80, 900); }
      else conceal(sp, 0, 50, 450);
    }
    // Après le dernier projet : le moindre scroll vers le bas fait une ancre vers la section du dessous
    var aRaf = null;
    function goAbout() {
      var sec = $('.home-about', container);
      if (!sec || anchoring) return;
      setFree(true);
      anchoring = true;
      zone = 'about';
      socialsShow(false);
      var y0 = window.scrollY, y1 = sec.getBoundingClientRect().top + y0, t0a = null, D = reduce ? 0 : ABOUT_MS;
      var stepA = function (now) {
        if (t0a === null) t0a = now;
        var k = D ? Math.min(1, (now - t0a) / D) : 1;
        window.scrollTo(0, y0 + (y1 - y0) * easeOutC(k));
        if (k < 1 && alive) aRaf = requestAnimationFrame(stepA);
        else { anchoring = false; aRaf = null; }
      };
      aRaf = requestAnimationFrame(stepA);
    }
    // À l'inverse : depuis la section du dessous, un scroll vers le haut ramène en haut (ancre),
    // puis la roue repasse automatiquement du 01 au dernier projet
    function nearAbout() {
      var sec = $('.home-about', container);
      return !sec || sec.getBoundingClientRect().top >= -8;   // on est en haut de la section (ou au-dessus)
    }
    function goTop() {
      if (anchoring) return;
      anchoring = true;
      var y0 = window.scrollY, t0a = null, D = reduce ? 0 : ABOUT_MS;
      // la roue repasse du 01 au dernier projet pendant que la page remonte (même durée)
      target = LAST;
      tween = reduce ? null : { a: cur, b: target, t0: performance.now(), d: ABOUT_MS };
      socialsShow(true);
      var stepT = function (now) {
        if (t0a === null) t0a = now;
        var k = D ? Math.min(1, (now - t0a) / D) : 1;
        window.scrollTo(0, y0 * (1 - easeInOut(k)));
        if (k < 1 && alive) { aRaf = requestAnimationFrame(stepT); return; }
        aRaf = null;
        anchoring = false;
        zone = 'hero';
        setFree(false);
      };
      aRaf = requestAnimationFrame(stepT);
    }
    ac.signal.addEventListener('abort', function () { if (aRaf) cancelAnimationFrame(aRaf); });

    // Section noire ↔ section services : un geste vers le bas depuis la section noire ancre la page
    // au début des services pendant que le fond passe du noir au clair ; dans les services, le défilement
    // est natif (fluide) et pilote l'agrandissement de l'image ; un geste vers le haut tout en haut des
    // services ramène à la section noire (fond qui repasse au noir).
    var svcCtl = null, zone = 'hero', svcOn = false, SVC_MS = 1300;
    function anchorTo(y1, d, done) {
      anchoring = true;
      var y0 = window.scrollY, t0a = null, D = reduce ? 0 : d;
      var stepS = function (now) {
        if (t0a === null) t0a = now;
        var k = D ? Math.min(1, (now - t0a) / D) : 1;
        window.scrollTo(0, y0 + (y1 - y0) * easeInOut(k));
        if (k < 1 && alive) { aRaf = requestAnimationFrame(stepS); return; }
        aRaf = null; anchoring = false;
        if (done) done();
      };
      aRaf = requestAnimationFrame(stepS);
    }
    function secTop(sel) { var el = $(sel, container); return el ? el.getBoundingClientRect().top + window.scrollY : 0; }
    function atSvcTop() { return window.scrollY <= secTop('.home-services') + 2; }
    function goSvc() {
      if (anchoring || !svcCtl) return;
      zone = 'svc'; svcOn = true;
      container.classList.remove('is-dark');
      anchorTo(secTop('.home-services'), SVC_MS);
      setTimeout(function () { if (alive && zone === 'svc') svcCtl.enter(); }, reduce ? 0 : SVC_MS * 0.35);
    }
    function goBack() {
      if (anchoring || !svcCtl) return;
      zone = 'about'; svcOn = false;
      container.classList.add('is-dark');
      anchorTo(secTop('.home-about'), SVC_MS, function () { if (zone === 'about') svcCtl.leave(); });
    }
    // un geste = un passage : la traîne d'inertie du trackpad est ignorée jusqu'à une pause de 180 ms
    var wLast = 0, wUsed = false;
    // Nouveau geste = pause de 180 ms OU relance pendant l'élan (delta qui repart nettement à la hausse) :
    // on n'a pas besoin d'attendre la fin de l'inertie du trackpad pour passer à la section suivante
    var wPrev = 0;
    function gesture(dy) {
      var now = performance.now(), a = Math.abs(dy), fresh = now - wLast > 180, push = a > wPrev * 1.5 + 8;
      wLast = now; wPrev = a;
      if (fresh) wUsed = false;
      if (a < 3 || (wUsed && !push)) return false;
      wUsed = true;
      return true;
    }
    function sectionMove(dir) {
      if (zone === 'svc') { if (dir < 0) goBack(); else if (atSvcEnd()) Menu.open(); }
      else if (dir > 0) goSvc();
      else goTop();
    }
    // Modal contact ouverte sur l'accueil : un geste vers le haut la referme (≈ 40 px)
    var menuAcc = 0;
    function menuScroll(e, up, amount) {
      if (!root.classList.contains('is-menu')) { menuAcc = 0; return false; }
      if (e && e.cancelable) e.preventDefault();
      if (!up) { menuAcc = 0; return true; }
      menuAcc += amount;
      if (!Menu.shown()) { menuAcc = 0; return true; }   // modal encore en cours d'apparition : on attend
      if (menuAcc >= 40) { menuAcc = 0; wLast = performance.now(); wUsed = true; Menu.close(); }
      return true;
    }
    // bas des services (fin de la page d'accueil) : un geste vers le bas ouvre la modal contact
    function atSvcEnd() {
      var el = $('.home-services', container);
      if (!el) return false;
      var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
      return y >= max - 4 || y >= secTop('.home-services') + el.offsetHeight - window.innerHeight - 4;
    }
    // Bords de la section services : le geste qui continue au-delà (même dans l'élan du trackpad, sans pause)
    // enchaîne directement — vers la section noire en haut, vers la modal contact en bas — dès ~60 px de défilement
    var edgeAcc = 0, edgeDir = 0;
    function edgePush(dir, amount) {
      if (dir !== edgeDir) { edgeDir = dir; edgeAcc = 0; }
      edgeAcc += amount;
      if (edgeAcc < 60) return false;
      edgeAcc = 0; edgeDir = 0;
      wLast = performance.now(); wUsed = true;   // la suite de l'élan est ignorée
      sectionMove(dir);
      return true;
    }
    function svcNative(up) { return zone === 'svc' && !(up && atSvcTop()) && !(!up && atSvcEnd()); }
    on(window, 'resize', function () {   // la section noire reste calée
      if (svcCtl && !anchoring && free && zone === 'about') window.scrollTo(0, secTop('.home-about'));
    });
    on(window, 'scroll', function () {   // l'élan dépasse le haut des services : on enchaîne vers la section noire
      if (svcCtl && zone === 'svc' && !anchoring && !blocked() && window.scrollY < secTop('.home-services') - 2) goBack();
    }, { passive: true });
    function stepBy(n) {
      target = Math.round(target) + n;
      clampT();
      tween = !reduce ? { a: cur, b: target, t0: performance.now(), d: SLIDE_MS } : null;
      if (n > 0 && target >= END) { if (tween) tween.d = ABOUT_MS; goAbout(); }
    }

    // Flèche sous le titre : au survol de la photo active ou du titre, elle sort à droite dans son masque
    // et revient par la gauche (animation CSS « is-nudge » sur la propriété translate, indépendante du transform
    // utilisé pour l'apparition des infos)
    var nudgedCard = null;
    function nudge() {
      if (reduce || !arrowIn) return;
      arrowIn.classList.remove('is-nudge');
      void arrowIn.offsetWidth;
      arrowIn.classList.add('is-nudge');
    }
    on(arrowIn, 'animationend', function () { arrowIn.classList.remove('is-nudge'); });
    on(wheel, 'mouseover', function (e) {
      var c = e.target.closest && e.target.closest('.wheel-card');
      if (c === nudgedCard) return;
      nudgedCard = c;
      if (c && Math.abs(dist(cards.indexOf(c))) < 0.5) nudge();   // seulement la photo au premier plan
    });
    on(wheel, 'mouseleave', function () { nudgedCard = null; });
    on(title, 'mouseenter', nudge);
    on(arrow, 'mouseenter', nudge);

    on(window, 'wheel', function (e) {
      var dy0 = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      if (menuScroll(e, dy0 < 0, Math.abs(dy0))) return;
      if (anchoring || pendingAbout) { e.preventDefault(); wLast = performance.now(); wUsed = true; wPrev = Math.abs(dy0); return; }   // la roue rejoint le 01 / l'ancre est en cours
      if (free && svcCtl) {
        if (blocked()) { e.preventDefault(); return; }
        if (svcNative(dy0 < 0)) { wLast = performance.now(); wUsed = true; edgeAcc = 0; return; }   // défilement natif dans les services
        e.preventDefault();
        if (zone === 'svc') { edgePush(dy0 > 0 ? 1 : -1, Math.abs(dy0)); return; }
        if (gesture(dy0)) sectionMove(dy0 > 0 ? 1 : -1);
        return;
      }
      if (free) {
        // page libre : défilement natif, sauf tout en haut vers le haut → la roue reprend la main
        if (dy0 >= 0 || blocked()) return;
        if (window.scrollY > 0) { if (nearAbout()) { e.preventDefault(); goTop(); } return; }
        setFree(false);
      }
      e.preventDefault();
      if (blocked()) return;
      if (dy0 > 0 && atEnd()) { goAbout(); return; }
      var dy = dy0;
      if (reduce) {
        var now = Date.now();
        if (Math.abs(dy) > 4 && now - lock > 450) { lock = now; stepBy(dy > 0 ? 1 : -1); }
        return;
      }
      dy = Math.max(-120, Math.min(120, dy));
      if (dy) dir = dy > 0 ? 1 : -1;
      tween = null;
      if (dy > 0 && passLast()) return;
      target += dy / 700;   // sensibilité de la molette (plus grand = moins sensible)
      clampT();
      if (dy > 0) holdLast();
      snapLater();
    }, { passive: false });

    var ty = null;
    var tsY = null;
    on(window, 'touchstart', function (e) { ty = tsY = e.touches[0].clientY; }, { passive: true });
    on(window, 'touchmove', function (e) {
      if (ty === null) return;
      var y = e.touches[0].clientY;
      if (root.classList.contains('is-menu')) { e.preventDefault(); ty = y; return; }
      if (anchoring || pendingAbout) { e.preventDefault(); ty = y; return; }
      if (free && svcCtl) {   // le geste est lu au relâchement (défilement natif dans les services)
        if (!svcNative(y > ty)) e.preventDefault();
        ty = y; return;
      }
      if (free) {
        if (y <= ty || blocked()) { ty = y; return; }
        if (window.scrollY > 0) { if (nearAbout()) { e.preventDefault(); goTop(); } ty = y; return; }
        setFree(false);
      }
      e.preventDefault();
      if (blocked()) return;
      if (ty - y > 0 && atEnd()) { goAbout(); ty = y; return; }
      if (ty !== y) dir = ty > y ? 1 : -1;
      if (ty - y > 0 && passLast()) { ty = y; return; }
      target += (ty - y) / 320;
      clampT();
      if (ty - y > 0) holdLast();
      ty = y;
      tween = null;
    }, { passive: false });
    on(window, 'touchend', function (e) {
      ty = null;
      if (root.classList.contains('is-menu')) {   // swipe vers le bas (retour vers le haut de page) : la modal se ferme
        if (tsY !== null && e.changedTouches[0].clientY - tsY > 60 && Menu.shown()) Menu.close();
        tsY = null;
        return;
      }
      if (free && svcCtl && tsY !== null && !anchoring && !blocked()) {
        var dyT = tsY - e.changedTouches[0].clientY;
        tsY = null;
        if (Math.abs(dyT) > 40 && (zone !== 'svc' || (dyT < 0 && atSvcTop()) || (dyT > 0 && atSvcEnd()))) sectionMove(dyT > 0 ? 1 : -1);
        return;
      }
      if (blocked() || free) return;
      target = dir > 0 ? Math.ceil(target - 0.2) : Math.floor(target + 0.2);
      clampT();
      if (!anchoring && !pendingAbout) holdLast();
    });
    on(window, 'keydown', function (e) {
      var t = e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA') return;
      if (root.classList.contains('is-menu')) {
        if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); if (Menu.shown()) Menu.close(); }
        return;
      }
      if (blocked()) return;
      if (pendingAbout || anchoring) { e.preventDefault(); return; }
      var down = e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ', up = e.key === 'ArrowUp' || e.key === 'PageUp';
      if (free && svcCtl) {
        if ((down || up) && !svcNative(up)) { e.preventDefault(); sectionMove(down ? 1 : -1); }
        return;
      }
      if (free) {
        if (up && window.scrollY <= 0) { setFree(false); e.preventDefault(); stepBy(-1); }
        else if (up && nearAbout()) { e.preventDefault(); goTop(); }
        return;   // défilement natif de la page
      }
      if (down && atEnd()) { e.preventDefault(); goAbout(); return; }
      if (down) { e.preventDefault(); stepBy(1); }
      if (up) { e.preventDefault(); stepBy(-1); }
    });
    base.forEach(function (c, i) {
      on(c, 'focus', function () {
        var diff = ((i - Math.round(target)) % N + N) % N;
        if (diff > N / 2) diff -= N;
        target = Math.round(target) + diff;
        clampT();
      });
    });

    function tick(now) {
      if (!alive || leaving) return;     // la roue s'arrête pendant la transition vers un projet
      if (intro) {
        if (introGo) {
          if (t0 === null) t0 = now;
          var p = Math.min((now - t0) / INTRO_MS, 1);
          cur = INTRO_FROM + (START - INTRO_FROM) * easeIntro(p);
          dirty = true;
          if (active === -1 && p >= 0.85) {  // 01 / Naostage apparaît en masque une fois la roue posée
            active = ((START % N) + N) % N;
            apply(active);
            showInfo();
          }
          if (p >= 1) { intro = false; cur = target = START; }
        }
      } else if (reduce) {
        if (cur !== target) { cur = target; dirty = true; }
      } else if (tween) {
        var k = Math.min((now - tween.t0) / tween.d, 1);
        cur = tween.a + (tween.b - tween.a) * (tween.e || easeInOut)(k);
        dirty = true;
        if (k >= 1) { cur = target = tween.b; tween = null; }
      } else if (Math.abs(target - cur) > 0.0005) {
        cur += (target - cur) * 0.1;
        dirty = true;
      } else if (cur !== target) {
        cur = target; dirty = true;
      }
      if (dirty) { render(); dirty = false; }
      if (pendingAbout && Math.abs(cur - END) < 0.01) { pendingAbout = false; goAbout(); }
      requestAnimationFrame(tick);
    }

    // Section sous la roulette : les mots s'allument au fil du défilement (15 % → 100 %)
    var aboutText = $('.home-about-text', container), aboutWords = [];
    if (aboutText) {
      var wds = aboutText.textContent.trim().split(/\s+/);
      aboutText.setAttribute('aria-label', wds.join(' '));
      aboutText.textContent = '';
      wds.forEach(function (w, i) {
        var sp = document.createElement('span');
        sp.className = 'home-about-word';
        sp.setAttribute('aria-hidden', 'true');
        sp.textContent = w;
        aboutText.appendChild(sp);
        if (i < wds.length - 1) aboutText.appendChild(document.createTextNode(' '));
        aboutWords.push(sp);
      });
      var litN = -1;
      var aboutSec = aboutText.closest('.home-about') || aboutText;
      var aboutUpdate = function () {
        var r = aboutText.getBoundingClientRect(), vh = window.innerHeight;
        // fond noir en fondu (comme sur le Studio) dès que la section arrive à mi-écran,
        // retour au clair quand la section services (fond clair) prend le relais
        container.classList.toggle('is-dark', aboutSec.getBoundingClientRect().top < vh * 0.5 && !svcOn);

        var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.85 - (vh - r.height) / 2)));
        litGoal = Math.round(p * aboutWords.length);
        if (!litTimer && litGoal !== litN) litTimer = setTimeout(litStep, 0);
      };
      // les mots s'écrivent un par un (≈ 35 ms par mot), vers l'avancée du défilement
      var litGoal = 0, litTimer = null;
      var litStep = function () {
        litTimer = null;
        if (litN < 0) litN = 0;
        if (litN === litGoal) return;
        litN += litGoal > litN ? 1 : -1;
        aboutWords.forEach(function (sp, i) { sp.classList.toggle('is-lit', i < litN); });
        litTimer = setTimeout(litStep, reduce ? 0 : 35);
      };
      ac.signal.addEventListener('abort', function () { clearTimeout(litTimer); });
      on(window, 'scroll', aboutUpdate, { passive: true });
      on(window, 'resize', aboutUpdate);
      aboutUpdate();
    }

    /* ---- Section services : cylindre tournant (même principe que la grille de la page Projets) ----
       Scène collante de 100vh. Le défilement (lissé) fait tourner un cylindre vu de l'intérieur (les images
       des côtés viennent vers nous) : l'image de chaque service arrive par la droite, passe sous le titre
       (centre), repart à gauche ; le titre change à mi-chemin entre deux images. Les voisines restent
       visibles sur les côtés, plus petites ; l'image au centre est agrandie. Les images flottent
       légèrement avec le curseur. En arrivant sur la section, la première image glisse sous son titre.
       Rendu WebGL (photo plaquée sur une portion de cylindre ; tout le bandeau est incliné de 8° autour du centre) ; à défaut, cartes HTML en 3D. */
    var svcSec = $('.home-services', container);
    if (svcSec) (function () {
      var stage = $('.hs-stage', svcSec), head = $('.hs-head', svcSec);
      var data = $$('.hs-item', svcSec).filter(function (it) { return !it.classList.contains('w-condition-invisible'); })
        .sort(function (a, b) { return (+a.getAttribute('data-order') || 0) - (+b.getAttribute('data-order') || 0); })
        .map(function (it) {
          var t = $('.hs-title', it), lines = [];
          if (t) {
            var txt = t.textContent.trim();
            t.setAttribute('aria-label', txt.replace(/\s*\n\s*/g, ' '));
            t.textContent = '';
            txt.split(/\n/).forEach(function (l) {
              var m = document.createElement('span'), s = document.createElement('span');
              m.setAttribute('aria-hidden', 'true');
              m.style.cssText = 'display:block;overflow:hidden;padding:.06em 0 .12em;margin:-.06em 0 -.12em';
              s.style.cssText = 'display:block;transform:translateY(130%)';
              s.textContent = l.trim();
              m.appendChild(s); t.appendChild(m); lines.push(s);
            });
            t.style.opacity = '1';
          }
          var sh = $('.hs-shape', it), img = $('.hs-img', it);
          return { el: it, sh: sh, img: img, t: t, lines: lines, intro: (it.getAttribute('data-intro') || '').trim(), src: img ? bestSrc(img) : '', tex: null, iw: 1, ih: 1, ready: false };
        });
      var N = data.length;
      if (!N || !stage) return;
      var SEG = 0.75, TILT = 0.14, SLOPE = 0,   // vignettes alignées sur l'axe horizontal du titre
        DPR = Math.min(2, window.devicePixelRatio || 1), MESH = 64;
      svcSec.style.height = 'calc(' + Math.round((1.3 + (N - 1) * SEG) * 100) + 'vh)';   // u : 1 → N (service i centré en u = i + 1)
      function bestSrc(img) {
        var set = (img.getAttribute('srcset') || '').split(',').map(function (c) {
          var p = c.trim().split(/\s+/); return { u: p[0], w: parseInt(p[1], 10) || 0 };
        }).filter(function (c) { return c.u && c.w; }).sort(function (a, b) { return a.w - b.w; });
        var want = 1000 * Math.min(DPR, 1.5);
        for (var i = 0; i < set.length; i++) if (set[i].w >= want) return set[i].u;
        return set.length ? set[set.length - 1].u : (img.currentSrc || img.src);
      }

      // ---- WebGL ----
      var gl = null, cv = null, U = {};
      function glFail() {
        gl = null;
        if (cv) { cv.remove(); cv = null; }
        stage.classList.remove('has-gl');
        draw();
      }
      (function initGL() {
        cv = document.createElement('canvas');
        cv.className = 'hs-gl';
        cv.setAttribute('aria-hidden', 'true');
        var ln = $('.hs-line', stage);
        stage.insertBefore(cv, ln ? ln.nextSibling : stage.firstChild);   // le trait vertical reste derrière les images
        var o = { premultipliedAlpha: true, antialias: true, alpha: true };
        gl = cv.getContext('webgl2', o) || cv.getContext('webgl', o);
        if (!gl) { cv.remove(); cv = null; return; }
        var vs = 'attribute vec2 aUV;uniform float uTh,uW,uH,uY,uR,uP,uRot,uSl;uniform vec2 uView,uOff;varying vec2 vUV;varying float vCos;' +
          'vec2 pj(float a,float y){float X=uR*sin(a);float Z=uR-uR*cos(a);float s=uP/(uP-Z);return vec2(uView.x*0.5+X*s,uView.y*0.5+(y-uView.y*0.5)*s);}' +
          'void main(){float ang=uTh+(aUV.x-0.5)*uW/uR;float yc=uY+uR*sin(uTh)*uSl;vec2 p=pj(ang,yc-uH*0.5+aUV.y*uH);' +
          'vec2 o=uView*0.5;vec2 d=p-o;float cs=cos(uRot),sn=sin(uRot);p=o+vec2(d.x*cs-d.y*sn,d.x*sn+d.y*cs)+uOff;' +
          'vUV=aUV;vCos=cos(ang);gl_Position=vec4(p.x/uView.x*2.0-1.0,1.0-p.y/uView.y*2.0,0.0,1.0);}';
        var fs = 'precision highp float;uniform sampler2D uTex;uniform vec3 uImg;uniform float uW,uH,uAlpha,uReady,uRad;varying vec2 vUV;varying float vCos;' +
          'void main(){if(vCos<0.0)discard;vec2 l=vec2(vUV.x*uW,vUV.y*uH);float B=1.16;float Bw=B*uW;float bx=l.x+(B-1.0)*0.5*uW-uImg.z;' +
          'float s=max(Bw/uImg.x,uH/uImg.y);float dw=uImg.x*s,dh=uImg.y*s;vec2 uv=vec2((bx-(Bw-dw)*0.5)/dw,(l.y-(uH-dh)*0.5)/dh);' +
          'vec3 c=mix(vec3(0.0),texture2D(uTex,uv).rgb,uReady);vec2 q=abs(l-vec2(uW,uH)*0.5)-vec2(uW,uH)*0.5+uRad;' +
          'float m=clamp(0.5-(length(max(q,0.0))-uRad),0.0,1.0);gl_FragColor=vec4(c,1.0)*uAlpha*m;}';
        function shd(t, src) { var x = gl.createShader(t); gl.shaderSource(x, src); gl.compileShader(x); return x; }
        var prog = gl.createProgram();
        gl.attachShader(prog, shd(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, shd(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { glFail(); return; }
        gl.useProgram(prog);
        var d = [];
        for (var i = 0; i <= MESH; i++) { var u = i / MESH; d.push(u, 0, u, 1); }
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(d), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(prog, 'aUV');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        ['uTh', 'uW', 'uH', 'uY', 'uR', 'uP', 'uRot', 'uSl', 'uView', 'uOff', 'uTex', 'uImg', 'uAlpha', 'uReady', 'uRad'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
        gl.uniform1i(U.uTex, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        var blank = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, blank);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        data.forEach(function (s) {
          s.tex = blank;
          if (!s.src) return;
          var im = new Image();
          im.crossOrigin = 'anonymous';
          im.onload = function () {
            if (!gl) return;
            try {
              var tx = gl.createTexture();
              gl.bindTexture(gl.TEXTURE_2D, tx);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
              var mip = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
              if (mip) gl.generateMipmap(gl.TEXTURE_2D);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              s.tex = tx; s.iw = im.naturalWidth; s.ih = im.naturalHeight; s.ready = true;
              draw();
            } catch (e) { glFail(); }
          };
          im.onerror = glFail;
          im.src = s.src;
        });
        cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); glFail(); });
        stage.classList.add('has-gl');
      })();
      ac.signal.addEventListener('abort', function () {
        if (gl) { var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); gl = null; }
      });

      // ---- géométrie ----
      var G = {};
      function geo() {
        var vw = stage.clientWidth || window.innerWidth, vh = stage.clientHeight || window.innerHeight, k = Math.min(1, vw / 1440);
        G.vw = vw; G.vh = vh;
        var base = Math.min(577, vw * 0.8);
        G.W = Math.min(680, vw * 0.86); G.H = G.W * 358 / 577;   // image au centre, agrandie
        G.MIN = base * 0.6 / G.W;                               // les voisines gardent leur taille (≈ 346 px)
        G.P = Math.max(1400, 2200 * k);
        var hw = vw / 2;
        G.R = 1.25 * hw;                      // cylindre vu de l'intérieur : courbure douce
        G.D = base * 1.11;                     // écart entre deux services : les voisines restent sur les côtés
        if (gl) { cv.width = Math.round(vw * DPR); cv.height = Math.round(vh * DPR); gl.viewport(0, 0, cv.width, cv.height); }
        if (!gl) data.forEach(function (s) { if (s.sh) { s.sh.style.width = G.W + 'px'; s.sh.style.height = G.H + 'px'; } });
      }
      function titleIn(s, fromBelow) {
        s.lines.forEach(function (l, i) {
          l.style.transition = 'none'; l.style.transform = 'translateY(' + (fromBelow ? 130 : -130) + '%)';
        });
        void s.t.offsetWidth;
        s.lines.forEach(function (l, i) {
          l.style.transition = reduce ? 'none' : 'transform 800ms ' + EASE + ' ' + (80 + i * 70) + 'ms';
          l.style.transform = 'translateY(0)';
        });
      }
      function titleOut(s, up) {
        s.lines.forEach(function (l, i) {
          l.style.transition = reduce ? 'none' : 'transform 450ms ' + INOUT + ' ' + (i * 40) + 'ms';
          l.style.transform = 'translateY(' + (up ? -130 : 130) + '%)';
        });
      }

      var tT = 1, tC = 1, raf = null, titled = -1;
      // position d'une image sur le cylindre : angle, taille (agrandie au centre), flottement au curseur, inclinaison
      function geomOf(off) {
        var e = Math.max(0, 1 - Math.abs(off) / G.D); e = e * e * (3 - 2 * e);
        var dep = 1 + 0.7 * (1 - e);   // les images des côtés flottent un peu plus
        return { th: off / G.R, sc: G.MIN + (1 - G.MIN) * e, ox: cx * 18 * dep, oy: cy * 14 * dep, rot: TILT + cx * 0.02 };
      }
      // rectangle à l'écran de l'image i (centre, taille, rotation) — pour le survol « Voir » et la transition
      function rectOf(i) {
        var off = (i + 1 - (tC + intro)) * G.D, gm = geomOf(off);
        var X = G.R * Math.sin(gm.th), Z = G.R - G.R * Math.cos(gm.th), k = G.P / (G.P - Z);
        var px = X * k, cs = Math.cos(gm.rot), sn = Math.sin(gm.rot), sr = stage.getBoundingClientRect();
        return { x: sr.left + G.vw / 2 + px * cs + gm.ox, y: sr.top + G.vh / 2 + px * sn + gm.oy,
          w: G.W * gm.sc * k, h: G.H * gm.sc * k, rot: gm.rot, off: off };
      }
      // entrée : décalage de -1 (première image à droite) ramené à 0 quand on arrive sur la section
      var intro = reduce ? 0 : -1, introTw = null;
      // flottement au curseur : position de la souris lissée, de -1 à 1 autour du centre
      var fx = 0, fy = 0, cx = 0, cy = 0;
      function draw() {
        var u = tC + intro, list = [];
        // « Services » et le trait s'effacent dès qu'on commence à défiler dans la section
        if (head) {
          var ho = Math.max(0, Math.min(1, 1 - (tC - 1) * 5));
          head.style.opacity = ho.toFixed(3);
          head.style.transform = 'translateY(' + (-20 * (1 - ho)).toFixed(1) + 'px)';
        }
        // titre du service courant : il change quand l'image précédente est sortie à gauche
        var ti = Math.max(0, Math.min(N - 1, Math.round(u - 1)));
        if (ti !== titled) {
          if (titled >= 0) titleOut(data[titled], ti > titled);
          titleIn(data[ti], ti > titled);
          titled = ti;
        }
        data.forEach(function (s, i) {
          var off = (i + 1 - u) * G.D, gm = geomOf(off), th = gm.th, sc = gm.sc, ox = gm.ox, oy = gm.oy, rot = gm.rot;
          var a = s.hidden ? 0 : Math.max(0, Math.min(1, (1.2 - Math.abs(th)) / 0.3));
          if (gl) { if (a > 0) list.push({ s: s, th: th, a: a, sc: sc, ox: ox, oy: oy, rot: rot }); return; }
          // repli sans WebGL : carte HTML plate posée sur le cylindre
          if (!s.sh) return;
          s.sh.style.opacity = a.toFixed(3);
          s.sh.style.visibility = a > 0 ? 'visible' : 'hidden';
          // tout le bandeau est incliné (rotation autour du centre de l'écran), pas chaque image
          var x0 = G.R * Math.sin(th), z = G.R - G.R * Math.cos(th);
          var x = x0 * Math.cos(rot), y = x0 * Math.sin(rot) + x0 * SLOPE;
          s.sh.style.transform = 'translate(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px) perspective(' + Math.round(G.P) + 'px) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + z.toFixed(1) +
            'px) rotateY(' + (-th * 57.2958).toFixed(2) + 'deg) rotate(' + (rot * 57.2958).toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        });
        if (!gl) return;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(U.uP, G.P); gl.uniform1f(U.uR, G.R);
        gl.uniform2f(U.uView, G.vw, G.vh);
        gl.uniform1f(U.uY, G.vh / 2);
        gl.uniform1f(U.uSl, SLOPE); gl.uniform1f(U.uRad, 5);
        list.sort(function (a, b) { return Math.abs(a.th) - Math.abs(b.th); });   // le centre (le plus loin) d'abord, les côtés par-dessus
        list.forEach(function (d) {
          var px = -Math.max(-1, Math.min(1, d.th / 2)) * 8;   // parallaxe horizontale dans la photo (%)
          var w = G.W * d.sc;
          gl.uniform1f(U.uTh, d.th);
          gl.uniform1f(U.uW, w); gl.uniform1f(U.uH, G.H * d.sc);
          gl.uniform1f(U.uRot, d.rot); gl.uniform2f(U.uOff, d.ox, d.oy);
          gl.uniform3f(U.uImg, d.s.iw, d.s.ih, px / 100 * 1.16 * w);
          gl.uniform1f(U.uAlpha, d.a);
          gl.uniform1f(U.uReady, d.s.ready ? 1 : 0);
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, d.s.tex);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 2 * (MESH + 1));
        });
      }
      function loop(now) {
        raf = null;
        tC += (tT - tC) * (reduce ? 1 : 0.085);
        if (Math.abs(tT - tC) < 0.0005) tC = tT;
        cx += (fx - cx) * 0.06; cy += (fy - cy) * 0.06;
        var still = Math.abs(fx - cx) < 0.001 && Math.abs(fy - cy) < 0.001;
        if (still) { cx = fx; cy = fy; }
        if (introTw) {
          var k = Math.min(1, (now - introTw.t0) / introTw.d);
          intro = introTw.a + (introTw.b - introTw.a) * (1 - Math.pow(1 - k, 4));   // quart.out : arrivée douce sous le titre
          if (k >= 1) introTw = null;
        }
        draw();
        if ((tC !== tT || !still || introTw) && alive) raf = requestAnimationFrame(loop);
      }
      function kick() { if (!raf) raf = requestAnimationFrame(loop); }
      ac.signal.addEventListener('abort', function () { if (raf) cancelAnimationFrame(raf); });
      function secY() { return svcSec.getBoundingClientRect().top + window.scrollY; }
      function update() {
        var raw = Math.max(0, Math.min(N - 1, (window.scrollY - secY()) / (window.innerHeight * SEG)));
        tT = 1 + magnet(raw);
        if (shown) setActive(Math.round(tT) - 1);
        kick();
      }

      // Magnétisme : autour de chaque service, le défilement ne fait presque pas bouger les vignettes (zone
      // d'accroche), puis le passage au service suivant se fait d'un coup, dans la seconde moitié du geste
      function magnet(raw) {
        var i = Math.floor(raw), f = raw - i;
        if (i >= N - 1) return N - 1;
        var k = Math.max(0, Math.min(1, (f - 0.22) / 0.56));
        return i + k * k * k * (k * (k * 6 - 15) + 10);   // smootherstep
      }

      // Trait vertical (se construit de bas en haut à l'arrivée), indicateur de slide en bas à gauche et courte
      // introduction du service actif en haut à droite (texte dans un masque, remplacé à chaque changement)
      var vLine = $('.hs-line', stage), introEl = $('.hs-intro', stage), dotsEl = $('.hs-dots', stage);
      var dots = [], active = -1, shown = false, introTok = 0, introIn = null;
      if (dotsEl) {
        dotsEl.innerHTML = '';
        for (var di = 0; di < N; di++) { var dd = document.createElement('span'); dd.className = 'hs-dot'; dotsEl.appendChild(dd); dots.push(dd); }
        dotsEl.setAttribute('aria-hidden', 'true');
      }
      if (introEl) introEl.setAttribute('aria-live', 'polite');
      // texte découpé en lignes (selon la largeur réelle), chaque ligne dans son masque : entrée et sortie
      // ligne par ligne
      function introLines(txt) {
        introEl.innerHTML = '';
        var words = txt.split(/\s+/).filter(Boolean), spans = [];
        words.forEach(function (w) {
          var sp = document.createElement('span');
          sp.textContent = w + ' ';
          introEl.appendChild(sp); spans.push(sp);
        });
        var lines = [], top = null;
        spans.forEach(function (sp, k) {
          if (sp.offsetTop !== top) { lines.push([]); top = sp.offsetTop; }
          lines[lines.length - 1].push(words[k]);
        });
        introEl.innerHTML = '';
        return lines.map(function (l) {
          var m = document.createElement('span'), sp = document.createElement('span');
          m.style.cssText = 'display:block;overflow:hidden;padding:.1em 0 .2em;margin:-.1em 0 -.2em';
          sp.style.cssText = 'display:block;transform:translateY(110%)';
          sp.textContent = l.join(' ');
          m.appendChild(sp); introEl.appendChild(m);
          return sp;
        });
      }
      function introSet(txt, instant) {
        if (!introEl) return;
        var tok = ++introTok, old = introIn;
        var put = function () {
          if (tok !== introTok) return;
          var ls = introLines(txt);
          introIn = ls;
          ls.forEach(function (sp, k) {
            if (instant || reduce) { sp.style.transform = 'none'; return; }
            void sp.offsetWidth;
            sp.style.transition = 'transform 900ms ' + EASE + ' ' + (k * 90) + 'ms';
            sp.style.transform = 'translateY(0)';
          });
        };
        if (old && old.length && !instant && !reduce) {
          old.forEach(function (sp, k) {
            sp.style.transition = 'transform 420ms ' + INOUT + ' ' + (k * 60) + 'ms';
            sp.style.transform = 'translateY(-110%)';
          });
          setTimeout(put, 380 + (old.length - 1) * 60);
        } else put();
      }
      function setActive(i, instant) {
        i = Math.max(0, Math.min(N - 1, i));
        if (i === active) return;
        active = i;
        dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
        introSet(data[i].intro, instant);
      }
      function chrome(on) {
        shown = on;
        if (vLine) {
          vLine.style.transition = on && !reduce ? 'transform 1400ms ' + INOUT : 'none';
          vLine.style.transform = on ? 'scaleY(1)' : 'scaleY(0)';
        }
        if (dotsEl) {
          dotsEl.style.transition = on && !reduce ? 'opacity 600ms ease 700ms' : 'none';
          dotsEl.style.opacity = on ? '1' : '0';
        }
        if (on) { active = -1; introIn = null; setActive(Math.round(tT) - 1); }
        else { introTok++; introIn = null; active = -1; if (introEl) introEl.innerHTML = ''; }
      }
      chrome(false);
      // flottement des images au mouvement du curseur
      on(window, 'mousemove', function (e) {
        if (reduce || zone !== 'svc') return;
        fx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth - 0.5) * 2));
        fy = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight - 0.5) * 2));
        kick();
      }, { passive: true });
      on(window, 'scroll', function () { update(); snapLater(); }, { passive: true });
      // Aimantation : 0,8 s sans défilement → la page glisse doucement vers le service le plus proche (centré
      // sous son titre). Le moindre geste de l'utilisateur interrompt le glissement.
      var snapT = null, snapRaf = null;
      function snapStop() { if (snapRaf) { cancelAnimationFrame(snapRaf); snapRaf = null; } }
      function snapLater() {
        clearTimeout(snapT);
        if (snapRaf) return;
        snapT = setTimeout(snapNow, 800);
      }
      function snapNow() {
        if (!alive || zone !== 'svc' || anchoring || root.classList.contains('is-menu') || root.classList.contains('is-reel')) return;
        var k = Math.max(1, Math.min(N, Math.round(tT)));
        var y0 = window.scrollY, y1 = Math.round(secY() + (k - 1) * window.innerHeight * SEG);
        if (Math.abs(y1 - y0) < 2 || (k === N && y0 > y1)) return;   // au-delà du dernier service : on laisse le bas de page (accès à la modal contact)
        if (reduce) { window.scrollTo(0, y1); return; }
        var t0 = null, D = Math.min(1200, 500 + Math.abs(y1 - y0) * 0.8);
        var step = function (now) {
          if (t0 === null) t0 = now;
          var p = Math.min(1, (now - t0) / D), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          window.scrollTo(0, y0 + (y1 - y0) * e);
          snapRaf = p < 1 && alive ? requestAnimationFrame(step) : null;
        };
        snapRaf = requestAnimationFrame(step);
      }
      ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (t) { on(window, t, snapStop, { passive: true }); });
      ac.signal.addEventListener('abort', function () { clearTimeout(snapT); snapStop(); });
      on(window, 'resize', function () { geo(); update(); draw(); });
      geo();
      update();
      tC = tT;
      draw();
      // Survol de l'image centrale : curseur « Voir » ; clic : page du service (transition Barba)
      var hovered = -1;
      function cardAt(x, y) {
        if (zone !== 'svc' || anchoring || root.classList.contains('is-menu') || root.classList.contains('is-reel')) return -1;
        var best = -1, bo = Infinity;
        data.forEach(function (s, i) { var o = Math.abs((i + 1 - (tC + intro)) * G.D); if (o < bo) { bo = o; best = i; } });
        if (best < 0 || bo > G.W * 0.35 || !data[best].el.getAttribute('data-slug')) return -1;
        var r = rectOf(best), dx = x - r.x, dy = y - r.y, cs = Math.cos(-r.rot), sn = Math.sin(-r.rot);
        var lx = dx * cs - dy * sn, ly = dx * sn + dy * cs;
        return Math.abs(lx) <= r.w / 2 && Math.abs(ly) <= r.h / 2 ? best : -1;
      }
      function setHover(i) {
        if (i === hovered) return;
        hovered = i;
        if (window.__cursorView) window.__cursorView(i >= 0, stage, $('.hs-list-wrap', stage));   // « Voir » sous les titres des services
        stage.style.cursor = i >= 0 ? 'pointer' : '';
      }
      on(window, 'mousemove', function (e) { setHover(cardAt(e.clientX, e.clientY)); }, { passive: true });
      on(window, 'scroll', function () { if (hovered >= 0) setHover(-1); }, { passive: true });
      ac.signal.addEventListener('abort', function () {
        if (hovered >= 0 && window.__cursorView) window.__cursorView(false);
        if (window.__cursorViewHome) window.__cursorViewHome();   // la pastille ne doit pas partir avec l'ancienne page
      });
      var flyIdx = -1;
      on(stage, 'click', function (e) {
        var i = cardAt(e.clientX, e.clientY);
        if (i < 0) return;
        var href = '/services/' + data[i].el.getAttribute('data-slug');
        flyIdx = i;
        setHover(-1);
        if (window.barba) barba.go(href); else window.location.href = href;
      });
      svcCtl = {
        // transition vers la page du service : l'image centrale (copie HTML posée exactement au même endroit)
        // grandit jusqu'au panneau image de gauche de la page ; le reste de l'accueil s'efface
        fly: function () {
          var i = flyIdx;
          flyIdx = -1;
          if (i < 0) return Promise.resolve(null);
          var s = data[i], r = rectOf(i);
          var ov = document.createElement('div');
          ov.className = 'svc-fly';
          ov.style.cssText = 'position:fixed;z-index:60;overflow:hidden;background:#000;border-radius:5px;pointer-events:none;' +
            'left:' + (r.x - r.w / 2) + 'px;top:' + (r.y - r.h / 2) + 'px;width:' + r.w + 'px;height:' + r.h + 'px;transform:rotate(' + r.rot + 'rad)';
          var im = document.createElement('img');
          im.src = s.src || (s.img && (s.img.currentSrc || s.img.src)) || '';
          im.alt = '';
          im.style.cssText = 'display:block;width:100%;height:100%;object-fit:cover;max-width:none';
          ov.appendChild(im);
          document.body.appendChild(ov);
          s.hidden = true; draw();
          var vw = window.innerWidth, vh = window.innerHeight, mob = vw < 768;
          var to = { left: '0px', top: '0px', width: (mob ? vw : vw * 0.3236) + 'px', height: (mob ? vh * 0.6 : vh) + 'px', transform: 'rotate(0rad)', borderRadius: '0px' };
          container.style.transition = 'opacity 600ms ease';
          container.style.opacity = '0';
          var a = ov.animate([{ left: ov.style.left, top: ov.style.top, width: ov.style.width, height: ov.style.height, transform: ov.style.transform, borderRadius: '5px' }, to],
            { duration: 1100, easing: INOUT, fill: 'forwards' });
          return a.finished.then(function () { return { overlay: ov }; }, function () { return { overlay: ov }; });
        },
        // arrivée sur la section : la première image glisse depuis la droite jusque sous son titre
        enter: function () {
          update();
          chrome(true);
          if (reduce) { intro = 0; draw(); return; }
          introTw = { a: intro, b: 0, t0: performance.now(), d: 1800 };
          kick();
        },
        // retour à la section noire : la scène est hors écran, on la remet en position de départ
        leave: function () { introTw = null; intro = reduce ? 0 : -1; fx = fy = cx = cy = 0; chrome(false); draw(); }
      };
    })();

    // Curseur « Scroll » sur le hero (hors liens, photos, showreel, menu) tant que la roue a la main
    if (root.classList.contains('has-cursor')) {
      var cueOn = false;
      var cueSet = function (v) { if (v === cueOn) return; cueOn = v; root.classList.toggle('is-scrollcue', v); };
      on(window, 'mousemove', function (e) {
        var t = e.target;
        var open = !anchoring && !intro && !root.classList.contains('is-menu') && !root.classList.contains('is-reel') && t.closest;
        var inHero = open && !free && t.closest('.home-track') &&
          !t.closest('a, button, .wheel-card, .showreel, .home-nav, .home-logo, .home-socials');
        // même curseur « Scroll » sur la section noire (clic = section services)
        var inAbout = open && free && zone === 'about' && t.closest('.home-about') && !t.closest('a, button');
        cueSet(!!(inHero || inAbout));
      }, { passive: true });
      on(window, 'scroll', function () { if (anchoring || zone !== 'about') { if (free) cueSet(false); } }, { passive: true });
      on(document, 'mouseleave', function () { cueSet(false); });
      ac.signal.addEventListener('abort', function () { root.classList.remove('is-scrollcue'); });
    }

    // clic sur la section noire (hors liens) : on descend à la section services
    var aboutEl = $('.home-about', container);
    if (aboutEl) on(aboutEl, 'click', function (e) {
      if (e.target.closest('a, button') || zone !== 'about' || anchoring || blocked()) return;
      goSvc();
    });

    window.scrollTo(0, 0);
    on(window, 'resize', geo);
    geo();
    render();
    requestAnimationFrame(tick);

    /* ---- 4. État initial caché (titre, tags, showreel, roulette) ---- */
    var tagsBox = $('.hero-tags', track);
    var tags = tagsBox ? $$('.hero-tag', tagsBox) : [];
    var showreel = $('.showreel', track);
    var video = $('.showreel-video', track);
    // Extrait du showreel en boucle (vidéo native dans le Designer) :
    // régler data-start (début, en s) et data-length (durée) dans les attributs de l'élément
    if (video) {
      video.muted = true;
      if (reduce) { video.removeAttribute('autoplay'); video.pause(); }
      else {
        var vs = +video.getAttribute('data-start') || 0, vl = +video.getAttribute('data-length') || 15;
        var restart = function () {
          if (root.classList.contains('is-reel')) return;   // en pause pendant la modal showreel
          video.currentTime = vs; var p = video.play(); if (p && p.catch) p.catch(function () {});
        };
        on(video, 'loadedmetadata', function () { if (video.currentTime < vs) video.currentTime = vs; });
        on(video, 'timeupdate', function () { if (video.currentTime >= vs + vl) restart(); });
        on(video, 'pause', function () { if (video.currentTime >= vs + vl - 0.4) restart(); });
        on(video, 'ended', restart);
        var pv = video.play(); if (pv && pv.catch) pv.catch(function () {});
      }
    }

    var api = {
      destroy: function () { alive = false; ac.abort(); clearTimeout(timer); clearTimeout(snapTimer); },
      leaveTo: leaveTo,
      leaveToService: function () { return svcCtl && svcCtl.fly ? svcCtl.fly() : Promise.resolve(null); },
      goServices: function () {   // lien « Services » de la modal contact : saut direct (la modal couvre l'écran)
        if (!svcCtl) return;
        var was = zone === 'svc';
        setFree(true);
        zone = 'svc'; svcOn = true;
        container.classList.remove('is-dark');
        socialsShow(false);
        window.scrollTo(0, secTop('.home-services'));
        if (!was) svcCtl.enter();
      }
    };
    // Retour depuis la page d'un service (clic sur son image, curseur « Fermer ») : on reprend directement
    // sur la section services
    var resume = null;
    try { resume = sessionStorage.getItem('cete-home-at'); sessionStorage.removeItem('cete-home-at'); } catch (e) {}
    if (resume === 'services' && svcCtl) {
      setFree(true);
      zone = 'svc'; svcOn = true;
      container.classList.remove('is-dark');
      socialsShow(false);
      requestAnimationFrame(function () { window.scrollTo(0, secTop('.home-services')); svcCtl.enter(); });
    }
    if (reduce) { root.classList.remove('is-loading'); intro = false; return api; }

    if (tagsBox) { tagsBox.style.overflow = 'hidden'; tagsBox.style.paddingBottom = '2px'; }
    tags.forEach(function (t) { t.dataset.axis = 'y'; hide(t); });
    if (showreel) showreel.style.clipPath = 'inset(100% 0 0 0 round 5px)';
    wheel.style.opacity = '0';

    // Retour sur l'accueil depuis une autre page : pas de loader, entrée directe (étapes 6 à 8)
    if (!first) {
      setTimeout(function () {
        revealTitle();
        reveal(tags, 450, 70, 900);
      }, 100);
      setTimeout(function () {
        wheel.style.transition = 'opacity 900ms ease';
        wheel.style.opacity = '1';
        introGo = true;
      }, 500);
      setTimeout(function () {
        if (showreel) { showreel.style.transition = 'clip-path 1100ms ' + EASE; showreel.style.clipPath = 'inset(0 0 0 0 round 5px)'; }
      }, 1500);
      return api;
    }

    /* ---- 5. Loader (1re visite, étapes 1 à 8 de la maquette) ---- */
    var burger = $$('.burger-line');   // burger (mobile)
    burger.forEach(function (b) { b.style.transformOrigin = 'right center'; b.style.transform = 'scaleX(0)'; });
    var navLinks = $$('.home-nav .nav-link', track).map(function (a) { return maskText(a); });
    var socials = $$('.home-socials .nav-link', track).map(function (a) { return maskText(a); });
    var logo = $('.home-logo', track);
    var logoImg = $('.home-logo img', track);
    if (logo && logoImg) { logo.style.overflow = 'hidden'; logoImg.dataset.axis = 'y'; hide(logoImg); }

    var L = document.createElement('div');
    L.setAttribute('aria-hidden', 'true');
    L.style.cssText = 'position:fixed;top:0;right:0;bottom:0;width:100vw;z-index:9998;background:#f0f0f0;overflow:hidden;' +
      'transition:background-color 700ms ' + INOUT + ', width 1100ms ' + INOUT;
    var grp = document.createElement('div');
    grp.style.cssText = 'position:absolute;left:50vw;top:50%;width:min(626px, 86vw);transform:translate(-50%,-50%);display:flex;' +
      'justify-content:space-between;align-items:center;mix-blend-mode:difference;color:#fff;pointer-events:none';
    // logo « cete » (SVG vertical tourné de 90°), révélé par un masque qui s'ouvre de gauche à droite
    var lMask = document.createElement('div');
    lMask.style.cssText = 'position:relative;width:55px;height:21px;flex:none;transition:transform 1100ms ' + EASE;
    var lIn = document.createElement('div');
    lIn.style.cssText = 'position:relative;width:55px;height:21px;clip-path:inset(-8px calc(100% + 8px) -8px -8px)';
    var lImg = document.createElement('img');
    lImg.src = LOADER_LOGO; lImg.alt = '';
    lImg.style.cssText = 'position:absolute;left:50%;top:50%;width:17.09px;height:55px;max-width:none;transform:translate(-50%,-50%) rotate(90deg)';
    lIn.appendChild(lImg); lMask.appendChild(lIn);
    // SVG injecté avec overflow visible : une image <img> tournée rognait les bords du logo de 1-2 px
    fetch(LOADER_LOGO).then(function (res) { return res.text(); }).then(function (txt) {
      var box = document.createElement('div');
      box.innerHTML = txt;
      var svg = box.querySelector('svg');
      if (!svg || !lImg.parentNode) return;
      svg.setAttribute('width', '17.09');
      svg.setAttribute('height', '55');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = lImg.style.cssText + ';overflow:visible;display:block';
      lIn.replaceChild(svg, lImg);
    }).catch(function () {});
    var tMask = document.createElement('div');
    tMask.style.cssText = 'overflow:hidden;padding:.15em 0;font-size:20px;line-height:1;letter-spacing:-.03em;text-transform:uppercase;white-space:nowrap';
    var tIn = document.createElement('div');
    tIn.textContent = 'Studio de design digital.';
    tIn.dataset.axis = 'y';
    tMask.appendChild(tIn);
    grp.appendChild(lMask); grp.appendChild(tMask);
    L.appendChild(grp);
    document.body.appendChild(L);
    hide(tIn);
    lMask.style.transform = 'translateX(' + (grp.offsetWidth / 2 - 27.5) + 'px)';   // étape 1 : logo centré
    root.classList.remove('is-loading');      // le loader prend le relais du cache CSS

    var T = 0;
    function at(ms, fn) { setTimeout(fn, ms); }
    // Étape 1 : « cete » apparaît au centre
    at(T += 250, function () {
      lIn.style.transition = 'clip-path 900ms ' + EASE;
      lIn.style.clipPath = 'inset(-8px -8px -8px -8px)';
    });
    // Étape 2 : le logo glisse à gauche, la baseline apparaît à droite
    at(T += 1000, function () { lMask.style.transform = 'translateX(0)'; reveal([tIn], 300, 0, 1000); });
    // Étape 3 : le fond passe au noir (le texte s'inverse grâce au mode différence)
    at(T += 1500, function () { L.style.backgroundColor = '#000'; });
    // Étape 4 : les textes sortent, le fond se retire vers la droite
    at(T += 1000, function () {
      lIn.style.transition = 'clip-path 550ms ' + INOUT;
      lIn.style.clipPath = 'inset(-8px -8px -8px calc(100% + 8px))';
      conceal([tIn], 60, 0, 550);
    });
    at(T += 550, function () { L.style.width = '0px'; });
    // Étape 5 : le burger (mobile) se dessine
    at(T += 1100, function () {
      L.remove();
      burger.forEach(function (b, i) {
        setTimeout(function () { b.style.transition = 'transform 800ms ' + EASE; b.style.transform = 'scaleX(1)'; }, 80 + i * 70);
      });
    });
    // Étape 6 : logo, navigation, titre et tags
    at(T += 350, function () {
      reveal([logoImg], 0, 0, 1000);
      reveal(navLinks, 80, 70, 1000);
      revealTitle();
      reveal(tags, 450, 70, 900);
    });
    // Étape 7 : la roulette apparaît en fondu, le projet 01 glisse doucement à sa place
    at(T += 600, function () {
      wheel.style.transition = 'opacity 900ms ease';
      wheel.style.opacity = '1';
      introGo = true;
    });
    // Étape 8 : showreel et réseaux
    at(T += 1500, function () {
      if (showreel) { showreel.style.transition = 'clip-path 1100ms ' + EASE; showreel.style.clipPath = 'inset(0 0 0 0 round 5px)'; }
      reveal(socials, 150, 80, 900);
    });
    return api;

    /* ---- Transition vers un projet : tout disparaît sauf la photo, qui se centre ---- */
    function leaveTo(path) {
      // Carte du projet ciblé : la plus proche du centre parmi les copies de la roue
      var best = null, bd = 1e9;
      cards.forEach(function (c, j) {
        if (c.getAttribute('href') !== path) return;
        var ad = Math.abs(dist(j));
        if (ad < bd) { bd = ad; best = c; }
      });
      if (!best) return Promise.resolve(null);
      leaving = true;
      intro = false;
      clearTimeout(timer);
      root.classList.add('is-leaving');                 // le zoom de survol se relâche pendant le centrage
      concealTitle();
      tags.forEach(function (t) { t.dataset.axis = 'y'; });
      conceal(tags, 0, 40, 500);
      if (showreel) { showreel.style.transition = 'clip-path 650ms ' + INOUT; showreel.style.clipPath = 'inset(0 0 100% 0 round 5px)'; }
      hideInfo();
      cards.forEach(function (c) {
        if (c === best) return;
        c.style.transition = 'opacity 500ms ease';
        c.style.opacity = '0';
      });
      return wait(350).then(function () {
        // La photo se centre dans la fenêtre, droite et à sa taille de photo active
        best.style.zIndex = '200';
        best.style.transition = 'transform 1000ms ' + INOUT + ', filter 600ms ease';
        best.style.transform = 'translate3d(' + (window.innerWidth / 2 - g.w / 2) + 'px,' + (g.py - g.h / 2) + 'px,0) rotate(0deg) scale(' + g.sc + ')';
        best.style.filter = 'grayscale(0)';
        return wait(1050);
      }).then(function () {
        return { card: best, radius: 4 * g.sc };
      });
    }
  }

  /* Clic sur une tuile projet (page Works, pages légales) : tout disparaît sauf la photo,
     qui se détache et se centre ; la page projet prend le relais */
  function leaveFromCards(container, cards, fadeSel, path) {
    var card = null;
    cards.forEach(function (c) {
      if ($$('a[href]', c).some(function (a) { return a.getAttribute('href') === path; })) card = c;
    });
    if (!card) return Promise.resolve(null);
    var media = $('.works-media', card);
    if (!media) return Promise.resolve(null);
    root.classList.add('is-leaving');              // le zoom de survol se relâche
    // Tout disparaît sauf la photo
    var fade = $$(fadeSel, container)
      .concat(cards.filter(function (c) { return c !== card; }))
      .concat([$('.works-name', card), $('.works-tags', card)]);
    fade.forEach(function (el) {
      if (!el) return;
      el.style.transition = 'opacity 500ms ease';
      el.style.opacity = '0';
    });
    // La photo est détachée à sa place (position fixe) : le défilement de la page ne compte plus
    var r = media.getBoundingClientRect();
    card.style.height = card.getBoundingClientRect().height + 'px';   // la grille ne bouge pas
    media.style.position = 'fixed';
    media.style.left = r.left + 'px';
    media.style.top = r.top + 'px';
    media.style.width = r.width + 'px';
    media.style.height = r.height + 'px';
    media.style.margin = '0';
    media.style.zIndex = '25';   // sous la page projet entrante (z-index 30), qui prend le relais à l'identique
    media.style.aspectRatio = 'auto';
    return wait(350).then(function () {
      // Puis se place au centre de l'écran, à sa taille
      var dx = (window.innerWidth - r.width) / 2 - r.left, dy = (window.innerHeight - r.height) / 2 - r.top;
      media.style.transition = 'transform 1000ms ' + INOUT;
      media.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
      return wait(1050);
    }).then(function () { return { card: media, radius: 0 }; });
  }

  /* =====================================================================
     PAGE WORKS : grille des projets
     - entrée : titre en masque, tuiles qui montent en fondu
     - survol d'une tuile : zoom dans l'image (CSS) et flèche qui sort à droite / revient par la gauche
     - clic sur un projet : tout disparaît sauf la photo, qui se centre ; la page projet prend le relais
     ===================================================================== */
  function Works(container, opts) {
    var ac = new AbortController();
    function on(t, type, fn, o) { o = o || {}; o.signal = ac.signal; t.addEventListener(type, fn, o); }
    root.classList.remove('is-wintro');            // posée par le script du head pour toute page ≠ accueil
    // Liens des tuiles : /projets/<slug> (slug lié au CMS via l'attribut data-slug, comme la roulette de l'accueil)
    $$('[data-slug]', container).forEach(function (a) {
      var slug = a.getAttribute('data-slug');
      if (slug) a.setAttribute('href', '/projets/' + slug);
    });
    var cards = $$('.works-card', container);
    var title = $('.works-title', container);

    /* Vue liste / vue grille ------------------------------------------------------------
       La liste est construite à partir des tuiles CMS (nom, année via data-year, catégories, photo, lien) :
       une seule source de contenu. Au survol d'une ligne, les autres passent à 15 % et la photo du projet
       se dévoile à droite (comme les services du Studio) ; le curseur devient « Voir » sur la photo. */
    var head = $('.works-head', container), gridWrap = $('.works-list', container);
    gridWrap = gridWrap ? gridWrap.parentNode : null;
    var rowsEl = null, rows = [];
    var wg = null;
    function buildGrid() {
      var N = cards.length;
      if (!N) return null;
      var PER = N % 2 ? 2 * N : N;   // l'alternance carré / allongé retombe juste au bout d'une période
      var pin = document.createElement('div'); pin.className = 'wg-pin';
      var stage = document.createElement('div'); stage.className = 'wg-stage';
      pin.appendChild(stage);
      gridWrap.parentNode.insertBefore(pin, gridWrap);
      var els = [];
      for (var r = 0; r < PER; r++) {
        var el = cards[r % N].cloneNode(true);
        el.classList.add('wg-card', r % 2 ? 'is-wide' : 'is-sq');
        el.removeAttribute('id');
        // nom découpé en lettres : au survol, chaque lettre sort par le haut et revient par le bas (comme la liste)
        var ttl = el.querySelector('.works-card-title');
        if (ttl) {
          var lab = ttl.textContent.trim();
          ttl.setAttribute('aria-label', lab);
          ttl.innerHTML = lab.split('').map(function (ch, i) {
            var c = ch === ' ' ? '&nbsp;' : ch.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
            return '<span class="wl-ch" aria-hidden="true" style="--i:' + i + '"><span data-c="' + c + '">' + c + '</span></span>';
          }).join('');
        }
        stage.appendChild(el);
        els.push(el);
      }
      container.classList.add('has-wg');
      gridWrap.classList.add('wg-src');
      /* Tuiles courbées, rendues en WebGL : chaque photo est plaquée sur une portion de cylindre (maillage de
         64 colonnes) dans un canvas placé derrière les tuiles. Les tuiles HTML restent en place, photo masquée,
         pour le nom du projet, le survol (« Voir »), le clic et la transition vers la page projet.
         Sans WebGL (ou si une image ne peut pas être lue), les tuiles HTML s'affichent à plat sur le cylindre. */
      var SEG = 64, FADE = 1000, DPR = Math.min(2, window.devicePixelRatio || 1);
      var tiles = els.map(function (el) {
        var img = el.querySelector('.works-img');
        el.style.opacity = '0';
        return { el: el, media: el.querySelector('.works-media'), src: img ? bestSrc(img) : '', alpha: 0, a0: 0, target: 0, at: 0, dur: FADE, hidden: false };
      });
      function bestSrc(img) {
        var set = (img.getAttribute('srcset') || '').split(',').map(function (c) {
          var p = c.trim().split(/\s+/); return { u: p[0], w: parseInt(p[1], 10) || 0 };
        }).filter(function (c) { return c.u && c.w; }).sort(function (a, b) { return a.w - b.w; });
        var want = 1400 * Math.min(DPR, 1.5);
        for (var i = 0; i < set.length; i++) if (set[i].w >= want) return set[i].u;
        return set.length ? set[set.length - 1].u : (img.currentSrc || img.src);
      }
      var gl = null, cv = null, prog = null, U = {}, texCache = {}, glFailed = false;
      function glFail() {
        if (glFailed) return;
        glFailed = true; gl = null;
        if (cv) cv.remove();
        els.forEach(function (el) { el.classList.remove('is-bent'); });
        render(true);
      }
      (function initGL() {
        if (reduce) return;
        cv = document.createElement('canvas');
        cv.className = 'wg-gl';
        cv.setAttribute('aria-hidden', 'true');
        stage.insertBefore(cv, stage.firstChild);
        var o = { premultipliedAlpha: true, antialias: true, alpha: true };
        gl = cv.getContext('webgl2', o) || cv.getContext('webgl', o);
        if (!gl) { glFail(); return; }
        var vs = 'attribute vec2 aUV;uniform float uTh,uW,uH,uY,uR,uP;uniform vec2 uView;varying vec2 vUV;varying float vCos;' +
          'void main(){float a=(aUV.x-0.5)*uW;float ang=uTh+a/uR;float X=uR*sin(ang);float Z=uR*cos(ang)-uR;' +
          'float sc=uP/(uP-Z);float sx=uView.x*0.5+X*sc;float Y=uY+aUV.y*uH;float sy=uView.y*0.5+(Y-uView.y*0.5)*sc;' +
          'vUV=aUV;vCos=cos(ang);gl_Position=vec4(sx/uView.x*2.0-1.0,1.0-sy/uView.y*2.0,0.0,1.0);}';
        var fs = 'precision highp float;uniform sampler2D uTex,uOv;uniform vec3 uImg;uniform float uW,uH,uAlpha,uReady,uHasOv,uBox;varying vec2 vUV;varying float vCos;' +
          'void main(){if(vCos<0.0)discard;vec2 l=vec2(vUV.x*uW,vUV.y*uH);float Bw=uBox*uW;float bx=l.x+(uBox-1.0)*0.5*uW-uImg.z;' +
          'float s=max(Bw/uImg.x,uH/uImg.y);float dw=uImg.x*s,dh=uImg.y*s;vec2 uv=vec2((bx-(Bw-dw)*0.5)/dw,(l.y-(uH-dh)*0.5)/dh);' +
          'vec3 c=mix(vec3(0.851),texture2D(uTex,uv).rgb,uReady);vec4 o=texture2D(uOv,vUV);c=mix(c,o.rgb,o.a*uHasOv);' +
          'gl_FragColor=vec4(c,1.0)*uAlpha;}';
        function sh(t, src) { var x = gl.createShader(t); gl.shaderSource(x, src); gl.compileShader(x); return x; }
        prog = gl.createProgram();
        gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { glFail(); return; }
        gl.useProgram(prog);
        var d = [];
        for (var i = 0; i <= SEG; i++) { var u = i / SEG; d.push(u, 0, u, 1); }
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(d), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(prog, 'aUV');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        ['uTh', 'uW', 'uH', 'uY', 'uR', 'uP', 'uView', 'uTex', 'uOv', 'uImg', 'uAlpha', 'uReady', 'uHasOv', 'uBox'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
        gl.uniform1i(U.uTex, 0); gl.uniform1i(U.uOv, 1);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        els.forEach(function (el) { el.classList.add('is-bent'); });
        tiles.forEach(function (t) {
          if (!t.src) return;
          var c = texCache[t.src];
          if (!c) {
            c = texCache[t.src] = { tex: null, iw: 1, ih: 1, ready: false };
            var im = new Image();
            im.crossOrigin = 'anonymous';
            im.onload = function () {
              if (!gl) return;
              try {
                var tx = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tx);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
                var mip = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
                if (mip) gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                c.tex = tx; c.iw = im.naturalWidth; c.ih = im.naturalHeight; c.ready = true;
                render(true);
              } catch (e) { glFail(); }
            };
            im.onerror = glFail;
            im.src = t.src;
          }
          t.img = c;
        });
        cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); glFail(); });
      })();
      var blankTex = null;
      function blank() {
        if (blankTex) return blankTex;
        blankTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, blankTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        return blankTex;
      }
      // étiquettes (Web, Branding…) dessinées dans une texture transparente, posée sur la photo
      function overlays() {
        if (!gl) return;
        tiles.forEach(function (t) {
          if (!t.media) return;
          var w = t.media.offsetWidth, h = t.media.offsetHeight;
          if (!w || !h) return;
          var c = document.createElement('canvas');
          c.width = Math.round(w * DPR); c.height = Math.round(h * DPR);
          var x = c.getContext('2d');
          x.scale(DPR, DPR);
          $$('.works-tag', t.media).forEach(function (g) {
            var ox = 0, oy = 0, e = g;
            while (e && e !== t.media) { ox += e.offsetLeft; oy += e.offsetTop; e = e.offsetParent; }
            var cs = getComputedStyle(g), gw = g.offsetWidth, gh = g.offsetHeight, rad = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, gh / 2);
            x.fillStyle = cs.backgroundColor;
            x.beginPath();
            if (x.roundRect) x.roundRect(ox, oy, gw, gh, rad); else x.rect(ox, oy, gw, gh);
            x.fill();
            x.fillStyle = cs.color;
            x.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
            if ('letterSpacing' in x) x.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
            x.textBaseline = 'middle';
            x.textAlign = 'center';
            var txt = cs.textTransform === 'uppercase' ? g.textContent.trim().toUpperCase() : g.textContent.trim();
            x.fillText(txt, ox + gw / 2, oy + gh / 2 + 0.5);
          });
          if (!t.ov) t.ov = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, t.ov);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        });
      }

      var G = {}, LOOP = 0;
      function mod(a, b) { return ((a % b) + b) % b; }
      function geo() {
        var vw = root.clientWidth, k = vw / 1440;
        G = { k: k, SQ: 392 * k, WD: 680 * k, GAP: 25 * k, DY: 200 * k, vw: vw, vh: window.innerHeight };
        G.X0 = vw / 2 - G.SQ / 2;   // le premier projet démarre au centre de l'écran
        // cylindre sur toute la largeur : rayon tel que sa silhouette (bords à ±90°) touche les bords de l'écran
        G.P = 2200 * k;
        var hw = vw / 2;
        G.R = hw * G.P / (G.P - hw);
        stage.style.perspective = Math.round(G.P) + 'px';
        G.P2 = G.SQ + G.WD + 2 * G.GAP;
        LOOP = (PER / 2) * G.P2;
        pin.style.height = (G.vh + 3 * LOOP) + 'px';
        stage.style.setProperty('--wg-sq', G.SQ + 'px');
        stage.style.setProperty('--wg-wd', G.WD + 'px');
        if (gl) {
          cv.width = Math.round(vw * DPR); cv.height = Math.round(G.vh * DPR);
          gl.viewport(0, 0, cv.width, cv.height);
          overlays();
        }
        measure();
      }
      // le premier projet démarre sous le titre
      function measure() {
        // la scène démarre en haut de la page : les photos peuvent passer sous le titre
        pin.style.marginTop = '0px';
        var natural = pin.getBoundingClientRect().top + window.scrollY;
        pin.style.marginTop = (-natural) + 'px';
        var hb = head ? head.getBoundingClientRect().bottom + window.scrollY : natural;
        G.Y0 = hb + 20 * G.k;   // cylindre remonté : le nom du projet central reste bien visible
      }
      function xOf(n) { return Math.floor(n / 2) * G.P2 + (mod(n, 2) === 1 ? G.SQ + G.GAP : 0); }
      function pOf(sx) {
        var n2 = Math.floor(sx / G.P2), rem = sx - n2 * G.P2;
        return rem < G.SQ + G.GAP ? 2 * n2 + rem / (G.SQ + G.GAP) : 2 * n2 + 1 + (rem - G.SQ - G.GAP) / (G.WD + G.GAP);
      }
      /* Rendu : la « caméra » suit le défilement avec un léger retard (lissage), ce qui donne de l'inertie.
         Les tuiles tournent autour d'un cylindre (vis) et apparaissent / s'effacent en fondu animé (ease in-out). */
      var sCur = null, raf = null, frozen = false, hold = !reduce, introOff = 0, bendR = -1, bendU = 0, fading = false, lastS = 0;
      function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
      function fadeTo(t, v, now, dur) {
        if (t.target === v) return;
        t.a0 = t.alpha; t.target = v; t.at = now; t.dur = dur || FADE;
      }
      function target() {
        var t = Math.max(0, window.scrollY);   // le défilement horizontal démarre dès le premier pixel
        // boucle : au-delà de 2 périodes, on recule d'une période (rendu identique)
        if (t > 2 * LOOP && !root.classList.contains('is-leaving')) {
          window.scrollTo(0, window.scrollY - LOOP); t -= LOOP;
          if (sCur !== null) sCur -= LOOP;
        }
        return t;
      }
      function draw(s) {
        lastS = s;
        var p = pOf(s), c = p + 2.5, half = G.vw / 2, now = performance.now(), list = [];
        fading = false;
        // Vis : les projets s'enroulent autour d'un cylindre vertical (rayon R) ; la position horizontale
        // devient un angle (longueur d'arc), la descente en escalier devient le pas de la vis
        tiles.forEach(function (t, r) {
          var el = t.el;
          var n = r + PER * Math.round((c - r) / PER);
          var w = n % 2 ? G.WD : G.SQ;
          var x = G.X0 + xOf(n) - s, y = G.Y0 + (n - p) * G.DY;
          el._n = n;
          // tuile cliquée : son rayon grandit jusqu'à l'infini → elle se déplie et devient plate
          var R = r === bendR ? G.R / Math.max(1 - bendU, 0.004) : G.R;
          var th = (x + w / 2 - half) / R;   // angle en radians, 0 = face à l'écran
          var vis = n >= 0 && th > -1.62 && th < 1.62 && y < G.vh + 80   // rien avant le premier projet
             && y > -G.SQ - 140;
          // fondu : apparition quand la tuile arrive sur la face avant par la droite, disparition en repartant à gauche
          if (!frozen || r !== bendR) fadeTo(t, (vis && (reduce || (!hold && th < 1.25 && th > -1.35))) && !(frozen && r !== bendR) ? 1 : 0, now, frozen ? 600 : FADE);
          var k = Math.min(1, (now - t.at) / t.dur);
          t.alpha = t.a0 + (t.target - t.a0) * (reduce ? 1 : ease(k));
          if (k < 1) fading = true;
          if (!vis || t.alpha <= 0.001) {
            if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
            if (!vis) { t.alpha = t.target = t.a0 = 0; }
            return;
          }
          if (el.style.visibility !== 'visible') el.style.visibility = 'visible';
          el.style.opacity = t.alpha.toFixed(3);
          el.style.zIndex = String(Math.round(Math.cos(th) * 100) + 100);
          var px = -Math.max(-1, Math.min(1, th / 2)) * 8;   // parallaxe horizontale dans la photo (%)
          el.style.setProperty('--px', px.toFixed(2) + '%');
          if (gl) {
            // la tuile HTML (nom + zone de clic) s'accroche au bord gauche de la photo courbée, tangente au cylindre
            var thL = th - w / (2 * R);
            if (r === bendR && bendU > 0) el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';   // tuile cliquée : à plat, alignée sur le rendu WebGL déplié
            else el.style.transform = 'translate3d(' + half.toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + (-R).toFixed(1) + 'px) rotateY(' + (thL * 57.2958).toFixed(2) + 'deg) translateZ(' + R.toFixed(1) + 'px)';
            // tuile cliquée : les étiquettes s'effacent d'abord, puis le cadrage de la photo revient au
            // cadrage standard (cover sur la tuile, sans la marge de parallaxe) — celui de la page projet
            var fb = r === bendR ? bendU : 0;
            if (!t.hidden) list.push({ t: t, th: th, w: w, y: y, R: R, px: px * (1 - fb), box: 1.2 - 0.2 * fb, ov: Math.max(0, 1 - fb * 3) });
          } else {
            el.style.transformOrigin = '50% 50%';
            el.style.transform = 'translate3d(' + (half - w / 2).toFixed(1) + 'px,' + y.toFixed(1) + 'px,' + (-R).toFixed(1) + 'px) rotateY(' + (th * 57.2958).toFixed(2) + 'deg) translateZ(' + R.toFixed(1) + 'px)';
          }
        });
        if (!gl) return;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(U.uP, G.P);
        gl.uniform2f(U.uView, G.vw, G.vh);
        list.sort(function (a, b) { return Math.cos(a.th) - Math.cos(b.th); });   // de l'arrière vers l'avant
        list.forEach(function (d) {
          var im = d.t.img || { ready: false, iw: 1, ih: 1 };
          gl.uniform1f(U.uTh, d.th); gl.uniform1f(U.uW, d.w); gl.uniform1f(U.uH, G.SQ);
          gl.uniform1f(U.uY, d.y); gl.uniform1f(U.uR, d.R);
          gl.uniform3f(U.uImg, im.iw, im.ih, d.px / 100 * d.box * d.w);
          gl.uniform1f(U.uBox, d.box);
          gl.uniform1f(U.uAlpha, d.t.alpha);
          gl.uniform1f(U.uReady, im.ready ? 1 : 0);
          gl.uniform1f(U.uHasOv, d.t.ov ? d.ov : 0);
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, im.ready ? im.tex : blank());
          gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, d.t.ov || blank());
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 2 * (SEG + 1));
        });
      }
      function loop() {
        raf = null;
        if (frozen || container.classList.contains('is-list')) return;
        var t = target();
        if (sCur === null || reduce) sCur = t;
        sCur += (t - sCur) * 0.085;
        if (Math.abs(t - sCur) < 0.3) sCur = t;
        draw(sCur + introOff);
        if (sCur !== t || fading) raf = requestAnimationFrame(loop);
      }
      function render() {
        if (container.classList.contains('is-list')) return;
        if (!raf) raf = requestAnimationFrame(loop);
      }
      on(window, 'scroll', render, { passive: true });
      on(window, 'resize', function () { geo(); sCur = null; render(); });
      geo(); sCur = null; loop();
      on(window, 'load', function () { measure(); render(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!frozen) { measure(); overlays(); render(); } });
      ac.signal.addEventListener('abort', function () {
        if (raf) cancelAnimationFrame(raf);
        if (gl) { var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); gl = null; }
      });
      // entrée : le cylindre part tourné d'un demi-radian et revient à sa position initiale (ease out)
      function intro(delay) {
        if (reduce || !delay) { hold = false; introOff = 0; render(); return; }
        introOff = -0.5 * G.R;
        setTimeout(function () {
          hold = false;
          var t0 = performance.now(), from = introOff;
          (function step(now) {
            var t = Math.min(1, (now - t0) / 1500), e = 1 - Math.pow(1 - t, 3);
            introOff = from * (1 - e);
            if (!frozen && !container.classList.contains('is-list')) draw((sCur === null ? 0 : sCur) + introOff);
            if (t < 1) requestAnimationFrame(step); else render();
          })(t0);
        }, delay);
      }
      /* Clic sur un projet : le cylindre tourne pour amener la tuile face à l'écran pendant qu'elle se déplie
         (rayon → infini) ; les autres tuiles s'effacent. À la fin, la photo HTML d'origine, plate, remplace le
         rendu WebGL exactement au même endroit : pas de saut. */
      function focus(el, dur) {
        frozen = true;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        var r = els.indexOf(el);
        var s0 = lastS, n = el._n, w = n % 2 ? G.WD : G.SQ;
        var s1 = G.X0 + xOf(n) + w / 2 - G.vw / 2;   // caméra qui centre la tuile
        bendR = r;
        return new Promise(function (res) {
          if (reduce) { bendU = 1; draw(s1); res(); return; }
          var t0 = performance.now();
          (function step(now) {
            var t = Math.min(1, (now - t0) / dur), e = ease(t);
            bendU = e;
            draw(s0 + (s1 - s0) * e);
            if (t < 1) requestAnimationFrame(step); else res();
          })(t0);
        }).then(function () {
          if (gl) {
            el.classList.remove('is-bent');   // la photo HTML plate réapparaît…
            tiles[r].hidden = true;           // …à la place du rendu WebGL
            draw(s1);
            cv.style.opacity = '0';
          }
        });
      }
      return { els: els, pin: pin, intro: intro, focus: focus, render: function () { geo(); render(); } };
    }
    if (head && gridWrap) {
      var tg = document.createElement('div');
      tg.className = 'works-toggle';
      tg.setAttribute('role', 'group');
      tg.setAttribute('aria-label', 'Affichage des projets');
      tg.innerHTML =
        '<button type="button" class="works-tg" data-view="grid" aria-pressed="true">Grille</button>' +
        '<button type="button" class="works-tg" data-view="list" aria-pressed="false">Liste</button>';
      head.appendChild(tg);

      rowsEl = document.createElement('div');
      rowsEl.className = 'works-rows';
      cards.forEach(function (c) {
        var link = $('a[href]', c), img = $('.works-img', c), t = $('.works-card-title', c);
        var a = document.createElement('a');
        a.className = 'wl-row';
        a.setAttribute('href', link ? link.getAttribute('href') : '#');
        var tags = $$('.works-tag', c).map(function (g) { return '<span class="wl-tag">' + g.textContent + '</span>'; }).join('');
        a.innerHTML = '<span class="wl-name"></span><span class="wl-year"></span><span class="wl-tags">' + tags + '</span>' +
          '<span class="wl-icon" aria-hidden="true"><i></i><i></i></span><span class="wl-media"></span>';
        // nom découpé en lettres : au survol, chaque lettre sort par le haut et revient par le bas (décalées)
        var nm = $('.wl-name', a), label = t ? t.textContent.trim() : '';
        nm.setAttribute('aria-label', label);
        nm.innerHTML = label.split('').map(function (ch, i) {
          var c = ch === ' ' ? '&nbsp;' : ch.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
          return '<span class="wl-ch" aria-hidden="true" style="--i:' + i + '"><span data-c="' + c + '">' + c + '</span></span>';
        }).join('');
        $('.wl-year', a).textContent = c.getAttribute('data-year') || '';
        if (img) {
          var im = document.createElement('img');
          im.src = img.currentSrc || img.src;
          if (img.getAttribute('srcset')) { im.setAttribute('srcset', img.getAttribute('srcset')); im.setAttribute('sizes', '360px'); }
          im.alt = img.alt || '';
          im.loading = 'lazy';
          $('.wl-media', a).appendChild(im);
        }
        rowsEl.appendChild(a);
        rows.push(a);
      });
      gridWrap.parentNode.insertBefore(rowsEl, gridWrap.nextSibling);

      // la photo flotte légèrement avec le curseur (comme sur le Studio)
      if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        var lfx = 0, lfy = 0, lcx = 0, lcy = 0, lRaf = null;
        var lStep = function () {
          lRaf = null;
          lcx += (lfx - lcx) * 0.08; lcy += (lfy - lcy) * 0.08;
          rowsEl.style.setProperty('--fx', lcx.toFixed(2) + 'px');
          rowsEl.style.setProperty('--fy', lcy.toFixed(2) + 'px');
          if (Math.abs(lfx - lcx) > 0.05 || Math.abs(lfy - lcy) > 0.05) lRaf = requestAnimationFrame(lStep);
        };
        on(rowsEl, 'mousemove', function (e) {
          var row = e.target.closest && e.target.closest('.wl-row');
          if (!row) return;
          var lr = rowsEl.getBoundingClientRect(), ir = row.getBoundingClientRect();
          lfx = Math.max(-28, Math.min(28, (e.clientX - lr.left - lr.width / 2) * 0.05));
          lfy = Math.max(-12, Math.min(12, (e.clientY - ir.top - ir.height / 2) * 0.25));
          if (!lRaf) lRaf = requestAnimationFrame(lStep);
        });
        on(rowsEl, 'mouseleave', function () { lfx = 0; lfy = 0; if (!lRaf) lRaf = requestAnimationFrame(lStep); });
        ac.signal.addEventListener('abort', function () { if (lRaf) cancelAnimationFrame(lRaf); });
      }

      /* Vue grille (desktop) : défilement horizontal en boucle -----------------------------------
         Les projets se suivent en escalier (carré 392 / allongé 680, 200 px plus bas à chaque projet,
         maquette 1440) ; le défilement vertical de la page fait avancer la « caméra » en diagonale.
         La série est répétée (10 cartes) et la page est ramenée d'une période en arrière quand on
         avance trop : la boucle est sans fin. */
      if (window.innerWidth >= 768) wg = buildGrid();

      var VIEW_KEY = 'cete-works-view';
      var setView = function (v, animate) {
        var list = v === 'list';
        $$('.works-tg', tg).forEach(function (b) {
          var onB = b.getAttribute('data-view') === v;
          b.classList.toggle('is-active', onB);
          b.setAttribute('aria-pressed', onB ? 'true' : 'false');
        });
        try { sessionStorage.setItem(VIEW_KEY, v); } catch (e) {}
        var apply = function () {
          container.classList.toggle('is-list', list);
          if (!list && typeof plxUpdate === 'function') requestAnimationFrame(plxUpdate);
          if (!list && wg) requestAnimationFrame(wg.render);
          if (list && !reduce) {
            rows.forEach(function (r, i) {
              r.style.transition = 'none'; r.style.opacity = '0'; r.style.transform = 'translateY(24px)';
              void r.offsetWidth;
              r.style.transition = 'opacity 700ms ease ' + (i * 60) + 'ms, transform 900ms ' + EASE + ' ' + (i * 60) + 'ms';
              r.style.opacity = ''; r.style.transform = '';
            });
            setTimeout(function () { rows.forEach(function (r) { r.style.transition = ''; }); }, 1000 + rows.length * 60);
          }
        };
        if (!animate || reduce) { apply(); return; }
        var gEl = wg ? wg.pin : gridWrap;
        var cur = list ? gEl : rowsEl;
        cur.style.transition = 'opacity 350ms ease';
        cur.style.opacity = '0';
        setTimeout(function () {
          cur.style.transition = ''; cur.style.opacity = '';
          apply();
          if (!list) {
            gEl.style.opacity = '0';
            void gEl.offsetWidth;
            gEl.style.transition = 'opacity 600ms ease';
            gEl.style.opacity = '';
            setTimeout(function () { gEl.style.transition = ''; }, 650);
          }
        }, 360);
      };
      $$('.works-tg', tg).forEach(function (b) {
        on(b, 'click', function () {
          var v = b.getAttribute('data-view');
          if (container.classList.contains('is-list') === (v === 'list')) return;
          setView(v, true);
        });
      });
      var saved = null;
      try { saved = sessionStorage.getItem(VIEW_KEY); } catch (e) {}
      setView(saved === 'list' ? 'list' : 'grid', false);
    }

    // Flèches : même animation que sous le nom du projet sur l'accueil
    function nudge(icon) {
      if (reduce || !icon) return;
      icon.classList.remove('is-nudge');
      void icon.offsetWidth;
      icon.classList.add('is-nudge');
    }
    $$('.works-arrow-icon', container).forEach(function (i) {
      on(i, 'animationend', function () { i.classList.remove('is-nudge'); });
    });
    cards.forEach(function (c) { on(c, 'mouseenter', function () { nudge($('.works-arrow-icon', c)); }); });

    // Entrée — titre : sans masque. Il apparaît en fondu centré sur sa ligne, glisse vers la gauche à sa place, puis « Grille / Liste »
    // apparaissent et la grille arrive en tournant légèrement sur le cylindre jusqu'à sa position initiale
    var tgl = $('.works-toggle', container);
    if (!reduce && title) {
      // lettre par lettre, chaque lettre monte dans son masque
      var label = title.textContent.trim();
      title.setAttribute('aria-label', label);
      title.innerHTML = label.split('').map(function (ch) {
        return '<span class="wt-m" aria-hidden="true"><span class="wt-l">' + (ch === ' ' ? '&nbsp;' : ch.replace(/[&<>]/g, '')) + '</span></span>';
      }).join('');
      var letters = $$('.wt-l', title);
      letters.forEach(function (l) { l.style.transform = 'translate3d(0,110%,0)'; });
      var tr = title.getBoundingClientRect();
      var tdx = window.innerWidth / 2 - (tr.left + tr.width / 2);   // même ligne : déplacement horizontal seulement
      title.style.transition = 'none';
      title.style.transform = 'translate3d(' + tdx.toFixed(1) + 'px,0,0)';
      if (tgl) { tgl.style.transition = 'none'; tgl.style.opacity = '0'; }
      void title.offsetWidth;
      letters.forEach(function (l, i) {
        l.style.transition = 'transform 700ms ' + EASE + ' ' + (100 + i * 45) + 'ms';
        l.style.transform = 'translate3d(0,0,0)';
      });
      setTimeout(function () {
        title.style.transition = 'transform 950ms ' + INOUT;
        title.style.transform = 'translate3d(0,0,0)';
      }, 750);
      setTimeout(function () { if (tgl) { tgl.style.transition = 'opacity 550ms ease'; tgl.style.opacity = '1'; } }, 1450);
      setTimeout(function () { title.style.transition = ''; title.style.transform = ''; letters.forEach(function (l) { l.style.transition = ''; }); }, 1750);
      if (wg) wg.intro(container.classList.contains('is-list') ? 0 : 1600);
    } else if (wg) wg.intro(0);
    // Grille mobile (empilée) : à l'arrivée de chaque tuile, son nom et sa flèche montent dans leur masque
    if (!reduce && !wg) {
      var tiles = cards.map(function (c) {
        var name = maskText($('.works-card-title', c));
        var icon = $('.works-arrow-icon', c);
        if (icon) { icon.dataset.axis = 'y'; hide(icon); }
        return { card: c, texts: [name, icon] };
      });
      var queue = [], flushTimer = null;
      function show(t, delay) { setTimeout(function () { reveal(t.texts, 650, 80, 900); }, delay); }
      // Les tuiles qui entrent ensemble s'enchaînent avec un léger décalage
      function flush() { queue.forEach(function (t, i) { show(t, i * 120); }); queue = []; flushTimer = null; }
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            tiles.forEach(function (t) { if (t.card === e.target) queue.push(t); });
          });
          if (queue.length && !flushTimer) flushTimer = setTimeout(flush, 0);
        }, { threshold: 0.15 });
        setTimeout(function () { tiles.forEach(function (t) { io.observe(t.card); }); }, 250);   // après le titre
        ac.signal.addEventListener('abort', function () { io.disconnect(); });
      } else {
        tiles.forEach(function (t, i) { show(t, 250 + i * 120); });
      }
    }

    // Grille mobile : parallaxe verticale à l'intérieur de chaque photo (l'image, plus haute que son cadre, glisse au défilement)
    var plx = reduce || wg ? [] : cards.map(function (c) { return { media: $('.works-media', c), img: $('.works-img', c) }; })
      .filter(function (p) { return p.media && p.img; });
    plx.forEach(function (p) { p.img.classList.add('works-plx'); });
    var plxTick = false;
    function plxUpdate() {
      plxTick = false;
      if (container.classList.contains('is-list') || root.classList.contains('is-leaving')) return;
      var vh = window.innerHeight;
      plx.forEach(function (p) {
        var r = p.media.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var k = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
        p.img.style.setProperty('--py', (k * r.height * 0.1).toFixed(1) + 'px');
      });
    }
    if (plx.length) {
      on(window, 'scroll', function () { if (!plxTick) { plxTick = true; requestAnimationFrame(plxUpdate); } }, { passive: true });
      on(window, 'resize', plxUpdate);
      plxUpdate();
      setTimeout(plxUpdate, 400);
    }

    function leaveTo(path) {
      if (container.classList.contains('is-list')) return leaveFromRow(path);
      if (wg) return leaveFromGrid(path);
      // la photo cliquée revient à son cadrage normal (sans parallaxe) pendant qu'elle se centre
      plx.forEach(function (p) {
        var a = p.media.parentNode && $('a[href]', p.media.parentNode.closest('.works-card') || p.media);
        if (!a || a.getAttribute('href') !== path) return;
        p.img.style.transition = 'transform 1200ms ' + EASE + ', top 900ms ' + INOUT + ', height 900ms ' + INOUT + ', translate 900ms ' + INOUT;
        p.img.classList.remove('works-plx');
        p.img.style.setProperty('--py', '0px');
      });
      return leaveFromCards(container, cards, '.home-logo, .home-nav, .home-socials, .works-head', path);
    }
    // Vue grille (défilement horizontal) : la photo cliquée la plus visible sert de relais
    function leaveFromGrid(path) {
      var best = null, bd = 1e9, cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      wg.els.forEach(function (el) {
        if (el.style.visibility === 'hidden') return;
        var a = $('a[href]', el);
        if (!a || a.getAttribute('href') !== path) return;
        var r = el.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - cx) + Math.abs(r.top + r.height / 2 - cy);
        if (d < bd) { bd = d; best = el; }
      });
      var media = best && $('.works-media', best);
      if (!media) return Promise.resolve(null);
      root.classList.add('is-leaving');
      // les autres tuiles, l'en-tête et le nom du projet cliqué s'effacent pendant que la tuile se déplie
      $$('.home-logo, .home-nav, .home-socials, .works-head', container).concat($$('.works-name', best)).forEach(function (el) { el.style.transition = 'opacity 500ms ease'; el.style.opacity = '0'; });
      var r;
      return wg.focus(best, 900).then(function () {
        r = media.getBoundingClientRect();
        // la photo sort de sa carte (transformée) pour pouvoir être fixée à l'écran
        media.classList.add('wg-media-leaving');   // garde le cadrage de la photo une fois sortie de la tuile
        container.appendChild(media);
        media.style.position = 'fixed';
        media.style.left = r.left + 'px'; media.style.top = r.top + 'px';
        media.style.width = r.width + 'px'; media.style.height = r.height + 'px';
        media.style.margin = '0'; media.style.zIndex = '25'; media.style.aspectRatio = 'auto';
        best.style.opacity = '0';
        return wait(30);
      }).then(function () {
        var dx = (window.innerWidth - r.width) / 2 - r.left, dy = (window.innerHeight - r.height) / 2 - r.top;
        media.style.transition = 'transform 1000ms ' + INOUT;
        media.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
        return wait(1050);
      }).then(function () { return { card: media, radius: 0 }; });
    }
    // Vue liste : la photo dévoilée de la ligne cliquée sert de relais vers la page projet
    function leaveFromRow(path) {
      var row = null;
      rows.forEach(function (r) { if (r.getAttribute('href') === path) row = r; });
      var media = row && $('.wl-media', row);
      if (!media) return Promise.resolve(null);
      var r = media.getBoundingClientRect();
      if (!r.width || getComputedStyle(media).clipPath.indexOf('100%') !== -1) return Promise.resolve(null);
      root.classList.add('is-leaving');
      $$('.home-logo, .home-nav, .home-socials, .works-head', container).concat(rows).forEach(function (el) {
        if (el === row) return;
        el.style.transition = 'opacity 500ms ease'; el.style.opacity = '0';
      });
      $$('.wl-name, .wl-year, .wl-tags, .wl-icon', row).forEach(function (el) { el.style.transition = 'opacity 500ms ease'; el.style.opacity = '0'; });
      media.style.transition = 'none';
      media.style.clipPath = 'inset(0 0 0 0)';
      media.style.position = 'fixed';
      media.style.left = r.left + 'px'; media.style.top = r.top + 'px';
      media.style.width = r.width + 'px'; media.style.height = r.height + 'px';
      media.style.right = 'auto'; media.style.translate = 'none';
      media.style.transform = 'none'; media.style.margin = '0'; media.style.zIndex = '25';
      return wait(350).then(function () {
        var dx = (window.innerWidth - r.width) / 2 - r.left, dy = (window.innerHeight - r.height) / 2 - r.top;
        media.style.transition = 'transform 1000ms ' + INOUT;
        media.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
        return wait(1050);
      }).then(function () { return { card: media, radius: 0 }; });
    }

    return { destroy: function () { ac.abort(); }, leaveTo: leaveTo };
  }

  /* =====================================================================
     PAGE PROJET : photo plein écran, titre en masque (mode différence), puis réduction à 50 %
     ===================================================================== */
  // Découpe un paragraphe en lignes, chacune dans son masque
  function splitLines(el) {
    var txt = el.textContent.trim(), words = txt.split(/\s+/);
    el.textContent = '';
    var spans = words.map(function (w, i) {
      var s = document.createElement('span');
      s.textContent = w;
      s.style.display = 'inline-block';
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });
    var lines = [], top = null;
    spans.forEach(function (s) {
      if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; }
      lines[lines.length - 1].push(s.textContent);
    });
    el.textContent = '';
    el.setAttribute('aria-label', txt);
    return lines.map(function (l) {
      var m = document.createElement('span');
      m.setAttribute('aria-hidden', 'true');
      m.style.cssText = 'display:block;overflow:hidden;padding-bottom:.1em;margin-bottom:-.1em';
      var s = document.createElement('span');
      s.textContent = l.join(' ');
      s.style.cssText = 'display:block;transform:translateY(110%)';
      m.appendChild(s);
      el.appendChild(m);
      return s;
    });
  }

  function Work(container, opts) {
    var media = $('.work-media', container);
    var img = $('.work-img', container);
    var heading = $('.work-heading', container);
    var tagsBox = $('.work-tags', container);
    var tags = tagsBox ? $$('.hero-tag', tagsBox) : [];
    var text = $('.work-text', container);
    if (!media || !heading) { root.classList.remove('is-wintro'); return null; }
    if (img) { img.loading = 'eager'; img.decoding = 'async'; }
    if (text && !text.textContent.trim()) text.style.display = 'none';

    var wac = new AbortController();
    function won(t, type, fn, o) { o = o || {}; o.signal = wac.signal; t.addEventListener(type, fn, o); }
    var projectName = heading.textContent.trim().toLowerCase();

    // Bandeau (Client, Design, Dev…) : un détail sans valeur dans le CMS est masqué, le bandeau aussi s'il est vide
    var details = $('.work-details', container);
    if (details) {
      $$('.work-detail', details).forEach(function (d) {
        var v = $('.work-detail-value', d);
        if (!v || !v.textContent.trim()) d.style.display = 'none';
      });
      if (!$$('.work-detail', details).some(function (d) { return d.style.display !== 'none'; })) details.style.display = 'none';
    }

    // Blocs photo/texte (composants) : un bloc sans photo est masqué, un texte vide aussi
    // Contenu en rich text (composants insérés depuis le CMS) : on retire les paragraphes vides
    // que l'éditeur ajoute entre les composants, sinon ils créent des écarts dans la mise en page
    var rt = $('.work-content', container);
    if (rt) {
      Array.prototype.slice.call(rt.children).forEach(function (ch) {
        if (ch.matches('[data-work-block]') || ch.querySelector('[data-work-block], img, video, iframe')) return;
        if (!ch.textContent.replace(/[\s\u200b-\u200d\ufeff]/g, '')) ch.remove();
      });
      if (!rt.children.length) rt.style.display = 'none';
    }
    var blocks = $$('[data-work-block]', container).filter(function (b) {
      var kind = b.getAttribute('data-work-block');
      // Composant « Texte centré » : masqué s'il est vide, simple fondu
      if (kind === 'text') {
        if (!b.textContent.replace(/[\s\u200b-\u200d\ufeff]/g, '') || b.classList.contains('w-dyn-bind-empty')) { b.style.display = 'none'; return false; }
        return true;
      }
      // Composant « Image » : masqué sans photo ; parallaxe de la photo dans son cadre
      if (kind === 'image') {
        var pic = $('img', b);
        if (!pic || pic.classList.contains('w-dyn-bind-empty') || !pic.getAttribute('src')) { b.style.display = 'none'; return false; }
        b._img = pic;
        return true;
      }
      // Anciens composants photo + texte
      var im = $('img', b), tx = $('p', b);
      if (tx && (!tx.textContent.trim() || tx.classList.contains('w-dyn-bind-empty'))) { tx.style.display = 'none'; tx = null; }
      if (!im || im.classList.contains('w-dyn-bind-empty') || !im.getAttribute('src')) { b.style.display = 'none'; return false; }
      b._media = im.parentElement; b._text = tx; b._img = im;
      return true;
    });
    if (!reduce && 'IntersectionObserver' in window) {
      // Apparition : un très léger fondu, sans masque
      var targets = [];
      if (details && details.style.display !== 'none') targets.push(details);
      blocks.forEach(function (b) { targets.push(b); });
      targets.forEach(function (el) { el.style.opacity = '0'; });
      var wio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          wio.unobserve(e.target);
          e.target.style.transition = 'opacity 1400ms ease';
          e.target.style.opacity = '';
        });
      }, { threshold: 0.15 });
      setTimeout(function () { targets.forEach(function (el) { wio.observe(el); }); }, 400);
      wac.signal.addEventListener('abort', function () { wio.disconnect(); });

    }

    // Projet suivant (ordre du CMS, en boucle) : sa photo centrée en fin de page ; arrivé en bas (ou au clic),
    // la page suivante s'ouvre depuis cette photo, comme depuis l'accueil — un défilement infini entre les projets
    var items = $$('.work-list-item', container);
    var nextCard = $('.work-next-card', container), nextSection = $('.work-next', container);
    var next = null, going = false;
    if (items.length > 1 && nextCard) {
      var idx = -1;
      items.forEach(function (it, i) { if ((it.getAttribute('data-name') || '').trim().toLowerCase() === projectName) idx = i; });
      if (idx < 0) {
        var cur = location.pathname.replace(/\/+$/, '').split('/').pop();
        items.forEach(function (it, i) { if (it.getAttribute('data-slug') === cur) idx = i; });
      }
      var n = items[(idx + 1) % items.length];
      var nImg = $('img', n);
      next = { name: n.getAttribute('data-name'), href: '/projets/' + n.getAttribute('data-slug'), img: nImg ? (nImg.currentSrc || nImg.src) : '' };
      var cImg = $('img', nextCard);
      if (cImg && next.img) {
        cImg.removeAttribute('srcset'); cImg.removeAttribute('sizes');
        cImg.loading = 'eager';
        cImg.src = next.img;
        cImg.alt = next.name || '';
      }
      nextCard.setAttribute('role', 'link');
      nextCard.setAttribute('tabindex', '0');
      nextCard.setAttribute('aria-label', next.name || '');
    } else if (nextSection) nextSection.style.display = 'none';

    // Étape 4 : « Projet suivant » seul au centre de l'écran — le trait se construit, le libellé monte en masque
    // Étape 5 : il sort, la photo du projet suivant apparaît en masque à la même place, puis l'ouverture se lance
    var nextLabel = $('.work-next-label', container);
    var nextLine = nextLabel && $('.work-next-line', nextLabel);
    var nextText = nextLabel && $('.work-next-text', nextLabel);
    var nextTextIn = nextText ? maskText(nextText) : null;   // caché par défaut (sous son masque)
    var labelShownAt = 0;
    function showLabel() {
      if (labelShownAt) return;
      labelShownAt = Date.now();
      if (nextLine) {
        nextLine.style.transition = 'transform 700ms ' + EASE;
        nextLine.style.transform = 'scaleY(1)';
      }
      if (nextTextIn) reveal([nextTextIn], 250, 0, 1000);
    }
    if (next && !reduce) {
      nextCard.style.clipPath = 'inset(100% 0 0 0)';
      if (nextLine) { nextLine.style.transformOrigin = '50% 0'; nextLine.style.transform = 'scaleY(0)'; }
      if (nextLabel && 'IntersectionObserver' in window) {
        var lio = new IntersectionObserver(function (en) {
          if (en[0].isIntersecting) { lio.disconnect(); showLabel(); autoScroll(); }
        }, { threshold: 1, rootMargin: '0px 0px -10% 0px' });
        lio.observe(nextLabel);
        wac.signal.addEventListener('abort', function () { lio.disconnect(); });
      } else showLabel();
    } else if (nextTextIn) nextTextIn.style.transform = 'none';
    if (nextLabel && next) nextLabel.style.cursor = 'pointer';

    // Dès que « Projet suivant » apparaît : la page défile seule jusqu'en bas, puis la photo apparaît
    // (annulé si l'internaute remonte pendant le défilement)
    var autoRaf = null;
    function autoScroll() {
      if (!next || reduce || going) return;
      var from = window.pageYOffset, t0 = null, dur = 1100;
      var to = document.documentElement.scrollHeight - window.innerHeight;
      if (to - from < 2) { goNext(); return; }
      var stop = function () { if (autoRaf) cancelAnimationFrame(autoRaf); autoRaf = null; detach(); };
      var onWheel = function (e) { if (e.deltaY < 0) stop(); };
      var onTouch = function () { stop(); };
      var detach = function () {
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('touchstart', onTouch);
      };
      window.addEventListener('wheel', onWheel, { passive: true });
      window.addEventListener('touchstart', onTouch, { passive: true });
      var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        to = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, from + (to - from) * ease(p));
        if (p < 1) { autoRaf = requestAnimationFrame(step); return; }
        autoRaf = null; detach();
        goNext();
      };
      autoRaf = requestAnimationFrame(step);
      wac.signal.addEventListener('abort', stop);
    }

    function goNext() {
      if (!next || going) return;
      going = true;
      if (reduce || !window.barba) { location.href = next.href; return; }
      showLabel();
      // le libellé reste lisible au moins 1,3 s avant de sortir
      wait(Math.max(0, labelShownAt + 1300 - Date.now())).then(function () {
        // 1. le libellé sort en masque vers le haut, le trait se rétracte
        if (nextTextIn) conceal([nextTextIn], 0, 0, 600);
        if (nextLine) {
          nextLine.style.transformOrigin = '50% 0';
          nextLine.style.transition = 'transform 500ms ' + INOUT + ' 150ms';
          nextLine.style.transform = 'scaleY(0)';
        }
        return wait(600);
      }).then(function () {
        // 2. la photo apparaît en masque, du bas vers le haut, à la place du libellé
        nextCard.style.transition = 'clip-path 1100ms ' + INOUT;
        nextCard.style.clipPath = 'inset(0% 0 0 0)';
        return wait(1150);
      }).then(function () {
        // 3. l'animation d'ouverture du projet prend le relais (photo plein écran, titre…)
        barba.go(next.href);
      });
    }
    if (next) {
      won(nextCard, 'click', goNext);
      if (nextLabel) won(nextLabel, 'click', goNext);
      won(nextCard, 'keydown', function (e) { if (e.key === 'Enter') goNext(); });
      var bornAt = Date.now(), lastY = window.pageYOffset, prefetched = false, atEnd = null;
      won(window, 'scroll', function () {
        var y = window.pageYOffset, down = y > lastY;
        lastY = y;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (!prefetched && y > max - window.innerHeight * 1.5 && window.barba && barba.prefetch) { prefetched = true; try { barba.prefetch(next.href); } catch (e) {} }
        if (down && y >= max - 2 && Date.now() - bornAt > 1500 && !atEnd) {
          atEnd = setTimeout(function () {   // la photo est posée à l'écran un court instant, puis s'agrandit
            var m2 = document.documentElement.scrollHeight - window.innerHeight;
            if (window.pageYOffset >= m2 - 2) goNext();
            atEnd = null;
          }, 250);
        }
      }, { passive: true });
      wac.signal.addEventListener('abort', function () { if (atEnd) clearTimeout(atEnd); });
    }

    // Titre dans un masque : le texte monte depuis le bas
    var hIn = document.createElement('span');
    while (heading.firstChild) hIn.appendChild(heading.firstChild);
    heading.appendChild(hIn);
    hIn.style.transform = reduce ? 'none' : 'translateY(110%)';
    if (!reduce) {
      // Étapes 2-3 : le titre est centré dans la fenêtre ; à l'étape 4 il descend à sa place, centré sous la photo
      var hr = heading.getBoundingClientRect();
      heading.style.transform = 'translate(' + (window.innerWidth / 2 - (hr.left + hr.width / 2)) + 'px,' +
        (window.innerHeight / 2 - (hr.top + hr.height / 2)) + 'px)';
      if (tagsBox) { tagsBox.style.overflow = 'hidden'; tagsBox.style.padding = '2px 0'; }
      tags.forEach(function (t) { t.dataset.axis = 'y'; hide(t); });
      if (text) text.style.visibility = 'hidden';
    }
    root.classList.remove('is-wintro');
    // Réseaux en bas à gauche : présents aux étapes 1 à 3, ils sortent en masque à l'étape 4
    var socials = $$('.home-socials .nav-link', container).map(function (a) {
      var s = maskText(a);
      if (!reduce) s.style.transform = 'none';
      return s;
    });

    // Étape 4 : le titre descend sous la photo, les catégories puis l'introduction (centrées) apparaissent en masque
    function settle(delay) {
      return wait(delay).then(function () {
        conceal(socials, 0, 40, 400);
        heading.style.transition = 'transform 900ms ' + INOUT;
        heading.style.transform = 'translate(0,0)';
        reveal(tags, 440, 55, 750);
        if (text && text.style.display !== 'none') {
          var lines = splitLines(text);
          text.style.visibility = '';
          text.offsetHeight;   // les lignes partent bien de leur masque (sinon elles s'affichent d'un coup)
          lines.forEach(function (s, i) {
            s.style.transition = 'transform 900ms ' + EASE + ' ' + (600 + i * 65) + 'ms';
            s.style.transform = 'translateY(0)';
          });
        }
        return wait(950);
      }).then(function () {
        heading.style.transition = '';
        heading.style.transform = '';
      });
    }

    var PROPS = ['left', 'top', 'width', 'height', 'border-radius'];
    function full() { return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }; }
    function place(r, radius) {
      media.style.left = r.left + 'px'; media.style.top = r.top + 'px';
      media.style.width = r.width + 'px'; media.style.height = r.height + 'px';
      media.style.borderRadius = (radius || 0) + 'px';
    }
    function showTitle(delay) {
      setTimeout(function () {
        hIn.style.transition = 'transform 1000ms ' + EASE;
        hIn.style.transform = 'translateY(0)';
      }, delay);
    }
    function shrink(delay) {   // étape 4 : la photo se réduit à 50 % de la hauteur
      return wait(delay).then(function () {
        media.style.transition = 'clip-path 900ms ' + INOUT;
        media.style.clipPath = 'inset(0 0 50% 0)';
        return wait(950);
      }).then(function () {
        media.style.transition = '';
        media.style.clipPath = '';
        PROPS.forEach(function (p) { media.style.removeProperty(p); });
      });
    }

    var api = {
      // Transition depuis l'accueil : la photo part exactement de la carte centrée
      fromCard: function (card, radius) {
        var cImg = card.querySelector('img');
        var r = card.getBoundingClientRect();
        media.style.transition = 'none';
        media.style.clipPath = 'inset(0 0 0% 0)';
        place(r, radius);
        if (!img || !cImg) return Promise.resolve();
        // Même fichier que la carte (déjà en cache) : aucun flash au moment du relais
        var srcset = img.getAttribute('srcset');
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.src = cImg.currentSrc || cImg.src;
        if (srcset) {   // version haute définition chargée en fond, échangée une fois prête
          var hi = new Image();
          hi.sizes = '100vw'; hi.srcset = srcset;
          (hi.decode ? hi.decode() : Promise.resolve()).then(function () {
            img.sizes = '100vw'; img.srcset = srcset;
          }).catch(function () {});
        }
        var ready = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
        return Promise.race([ready, wait(1200)]);
      },
      // Étapes 2 à 4
      play: function () {
        media.offsetWidth;
        media.style.transition = PROPS.map(function (p) { return p + ' 900ms ' + INOUT; }).join(',');
        place(full(), 0);
        showTitle(550);
        // Étapes 3 et 4 en même temps : la photo se réduit pendant que le titre descend
        settle(1500);
        return shrink(1500);
      }
    };

    // Vers le projet suivant : la photo centrée sert de relais, comme une carte de l'accueil
    api.leaveTo = function (path) {
      if (nextCard && next && path && path.replace(/\/+$/, '') === next.href) {
        // le verrouillage du défilement pendant la transition renverrait la page en haut :
        // on la fige à l'écran (même rendu) pour que la photo grandisse depuis sa place réelle
        var y = window.pageYOffset;
        container.style.marginTop = (-y) + 'px';
        window.scrollTo(0, 0);
        return Promise.resolve({ card: nextCard, radius: 0 });
      }
      return Promise.resolve(null);
    };
    api.destroy = function () { wac.abort(); };
    if (opts.transition) return api;
    if (reduce) { media.style.clipPath = ''; return api; }
    // Arrivée directe sur la page (ou retour) : photo plein écran, titre en masque, réduction, puis étape 4
    media.style.transition = 'none';
    media.style.clipPath = 'inset(0 0 0% 0)';
    showTitle(200);
    shrink(1100);
    settle(1100);
    return api;
  }

  /* =====================================================================
     PAGES LÉGALES : mentions légales, protection des données, cookies
     - entrée : titre et liens de la navigation de droite en masque, puis les blocs de texte
       montent en fondu à leur arrivée à l'écran
     - survol d'un lien de la navigation : la flèche sort à droite et revient par la gauche
     ===================================================================== */
  function Legal(container) {
    var ac = new AbortController();
    function on(t, type, fn, o) { o = o || {}; o.signal = ac.signal; t.addEventListener(type, fn, o); }
    root.classList.remove('is-wintro');
    // Dernier projet : liens /projets/<slug> (slug lié au CMS via data-slug)
    $$('[data-slug]', container).forEach(function (a) {
      var slug = a.getAttribute('data-slug');
      if (slug) a.setAttribute('href', '/projets/' + slug);
    });
    var cards = $$('.legal-latest .works-card', container);
    cards.forEach(function (c) {
      var icon = $('.works-arrow-icon', c);
      if (!icon) return;
      on(icon, 'animationend', function () { icon.classList.remove('is-nudge'); });
      on(c, 'mouseenter', function () {
        if (reduce) return;
        icon.classList.remove('is-nudge');
        void icon.offsetWidth;
        icon.classList.add('is-nudge');
      });
    });
    function leaveTo(path) {
      return leaveFromCards(container, cards, '.home-logo, .home-nav, .home-socials, .legal-title, .legal-body, .legal-nav, .legal-tag', path);
    }
    var links = $$('.legal-link', container);
    links.forEach(function (a) {
      var icon = $('.works-arrow-icon', a);
      if (!icon) return;
      on(icon, 'animationend', function () { icon.classList.remove('is-nudge'); });
      on(a, 'mouseenter', function () {
        if (reduce) return;
        icon.classList.remove('is-nudge');
        void icon.offsetWidth;
        icon.classList.add('is-nudge');
      });
    });
    if (reduce) return { destroy: function () { ac.abort(); }, leaveTo: leaveTo };

    var title = maskText($('.legal-title', container));
    // En-tête (navigation, réseaux) : en masque comme le reste, pour une entrée sans à-coup
    var head = $$('.home-nav .nav-link, .home-socials .nav-link', container).map(function (a) { return maskText(a); });
    var logoEl = $('.home-logo', container);
    if (logoEl) { logoEl.style.clipPath = 'inset(0 0 100% 0)'; }
    var navTexts = [];
    links.forEach(function (a) {
      var label = a.firstElementChild;
      if (label && !label.classList.contains('works-arrow')) navTexts.push(maskText(label));
      var icon = $('.works-arrow-icon', a);
      if (icon) { icon.dataset.axis = 'y'; hide(icon); navTexts.push(icon); }
    });
    // Dernier projet : pastille et nom en masque, photo dévoilée de bas en haut
    var tag = $('.legal-tag', container);
    if (tag) {
      tag.style.clipPath = 'inset(0 100% 0 0 round 20px)';
      setTimeout(function () {
        tag.style.transition = 'clip-path 800ms ' + INOUT;
        tag.style.clipPath = 'inset(0 0% 0 0 round 20px)';
      }, 550);
    }
    var latest = [];
    cards.forEach(function (c) {
      var media = $('.works-media', c);
      if (media) {
        media.style.clipPath = 'inset(100% 0 0 0)';
        setTimeout(function () {
          media.style.transition = 'clip-path 1200ms ' + INOUT;
          media.style.clipPath = 'inset(0% 0 0 0)';
          setTimeout(function () { media.style.transition = ''; media.style.clipPath = ''; }, 1250);
        }, 650);
      }
      latest.push(maskText($('.works-card-title', c)));
      var icon = $('.works-arrow-icon', c);
      if (icon) { icon.dataset.axis = 'y'; hide(icon); latest.push(icon); }
    });
    reveal([title], 150, 0, 1000);
    reveal(head, 250, 40, 900);
    if (logoEl) setTimeout(function () {
      logoEl.style.transition = 'clip-path 900ms ' + INOUT;
      logoEl.style.clipPath = 'inset(0 0 0% 0)';
      setTimeout(function () { logoEl.style.transition = ''; logoEl.style.clipPath = ''; }, 950);
    }, 250);
    reveal(navTexts, 450, 70, 900);
    reveal(latest, 1200, 80, 900);

    // Blocs de texte : chapô, sections, date de mise à jour
    var blocks = $$('.legal-body > *', container);
    blocks.forEach(function (b) {
      b.style.opacity = '0';
      b.style.transform = 'translateY(40px)';
    });
    function show(b, delay) {
      setTimeout(function () {
        b.style.transition = 'opacity 900ms ease, transform 1100ms ' + EASE;
        b.style.opacity = '';
        b.style.transform = '';
      }, delay);
    }
    if ('IntersectionObserver' in window) {
      var queue = [], timer = null;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          queue.push(e.target);
        });
        if (queue.length && !timer) timer = setTimeout(function () {
          queue.forEach(function (b, i) { show(b, i * 100); });
          queue = []; timer = null;
        }, 0);
      }, { threshold: 0.1 });
      setTimeout(function () { blocks.forEach(function (b) { io.observe(b); }); }, 400);   // après le titre
      ac.signal.addEventListener('abort', function () { io.disconnect(); });
    } else {
      blocks.forEach(function (b, i) { show(b, 400 + i * 100); });
    }
    return { destroy: function () { ac.abort(); }, leaveTo: leaveTo };
  }


  /* =====================================================================
     PAGE STUDIO
     - le fond du body (et la couleur du texte) suit la section au centre de l'écran : pas de coupure nette
     - textes en masque à leur arrivée à l'écran (même animation que le reste du site)
     - services : image au survol (CSS), description au clic (une seule ouverte à la fois)
     - équipe : la section se fixe et défile horizontalement jusqu'à la dernière personne,
       tuiles dévoilées par un masque de bas en haut
     ===================================================================== */
  /* =====================================================================
     PAGE SERVICE (collection « Services ») : image à gauche (curseur « Fermer » : retour à l'accueil, section
     services), titre, présentation et projets liés. Arrivée depuis l'accueil : l'image du cylindre devient
     le panneau de gauche, puis les textes montent depuis leur masque.
     ===================================================================== */
  function Service(container, opts) {
    opts = opts || {};
    var ac = new AbortController();
    function on(t, type, fn, o) { o = o || {}; o.signal = ac.signal; t.addEventListener(type, fn, o); }
    root.classList.remove('is-wintro');
    $$('[data-slug]', container).forEach(function (a) {
      var slug = a.getAttribute('data-slug');
      if (slug) a.setAttribute('href', '/projets/' + slug);
    });
    var media = $('.svc-media', container), title = $('.svc-title', container), text = $('.svc-text', container);
    var proj = $('.svc-projects', container), label = $('.svc-label', container), rows = $$('.svc-row', container);
    if (proj && (!rows.length || !label || !label.textContent.trim())) proj.style.display = 'none';
    // nom du projet découpé en lettres : au survol, chaque lettre sort par le haut et revient par le bas
    rows.forEach(function (r) {
      var nm = $('.svc-name', r);
      if (!nm) return;
      var lab = nm.textContent.trim();
      nm.setAttribute('aria-label', lab);
      nm.innerHTML = lab.split('').map(function (ch, i) {
        var c = ch === ' ' ? '&nbsp;' : ch.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        return '<span class="wl-ch" aria-hidden="true" style="--i:' + i + '"><span data-c="' + c + '">' + c + '</span></span>';
      }).join('');
    });
    // clic sur l'image : retour à l'accueil, directement sur la section services
    if (media) on(media, 'click', function () {
      try { sessionStorage.setItem('cete-home-at', 'services'); } catch (e) {}
      if (window.barba) barba.go('/'); else window.location.href = '/';
    });

    // Textes : titre ligne par ligne, présentation, libellé et lignes de projets dans des masques
    var lines = [];
    if (title) {
      var txt = title.textContent.trim();
      title.setAttribute('aria-label', txt.replace(/\s*\n\s*/g, ' '));
      title.textContent = '';
      txt.split(/\n/).forEach(function (l) {
        var m = document.createElement('span'), sp = document.createElement('span');
        m.setAttribute('aria-hidden', 'true');
        m.style.cssText = 'display:block;overflow:hidden;padding-bottom:.08em;margin-bottom:-.08em';
        sp.style.cssText = 'display:block';
        sp.textContent = l.trim();
        m.appendChild(sp); title.appendChild(m); lines.push(sp);
      });
    }
    var fades = [text].concat(rows).filter(Boolean);
    var lab2 = label ? maskText(label) : null;
    function prep() {
      if (reduce) return;
      lines.forEach(function (l) { l.style.transition = 'none'; l.style.transform = 'translateY(110%)'; });
      fades.forEach(function (el) { el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = 'translateY(24px)'; });
    }
    function play() {
      if (reduce) { if (lab2) lab2.style.transform = 'none'; return Promise.resolve(); }
      lines.forEach(function (l, i) { l.style.transition = 'transform 1100ms ' + EASE + ' ' + (i * 90) + 'ms'; l.style.transform = 'translateY(0)'; });
      fades.forEach(function (el, i) {
        var d = 350 + (i ? 150 + i * 70 : 0);
        el.style.transition = 'opacity 900ms ease ' + d + 'ms, transform 1000ms ' + EASE + ' ' + d + 'ms';
        el.style.opacity = ''; el.style.transform = '';
      });
      if (lab2) reveal([lab2], 450, 0, 900);
      return Promise.resolve();
    }
    prep();
    if (!opts.transition) {
      // arrivée directe : l'image se dévoile depuis le bas, puis les textes
      if (media && !reduce) {
        media.style.clipPath = 'inset(100% 0 0 0)';
        void media.offsetWidth;
        media.style.transition = 'clip-path 1100ms ' + INOUT;
        media.style.clipPath = 'inset(0 0 0 0)';
      }
      setTimeout(play, reduce ? 0 : 500);
    }
    return { destroy: function () { ac.abort(); }, play: play };
  }

  function Studio(container) {
    var ac = new AbortController();
    function on(t, type, fn, o) { o = o || {}; o.signal = ac.signal; t.addEventListener(type, fn, o); }
    root.classList.remove('is-wintro');
    var THEMES = { light: ['#f0f0f0', '#000000'], dark: ['#000000', '#f0f0f0'] };
    var sections = $$('[data-bg]', container);
    var theme = null;
    function applyTheme(t, instant) {
      if (!THEMES[t] || t === theme) return;
      theme = t;
      if (instant) { document.body.style.transition = 'none'; container.style.transition = 'none'; }
      document.body.style.backgroundColor = THEMES[t][0];
      container.style.color = THEMES[t][1];
      container.setAttribute('data-theme', t);
      if (instant) { void document.body.offsetWidth; document.body.style.transition = ''; container.style.transition = ''; }
    }
    function pickTheme(instant) {
      var mid = window.innerHeight * 0.5, t = null;
      sections.forEach(function (s) {
        var r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) t = s.getAttribute('data-bg');
      });
      if (!t && sections.length) t = sections[0].getAttribute('data-bg');
      applyTheme(t, instant);
    }

    // Liens « Découvrir » de l'équipe sans lien renseigné dans le CMS : masqués
    $$('.st-member-link', container).forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || h === '#') a.style.display = 'none';
      else if (/^https?:/.test(h)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
    });

    // Flèches : même petite animation que sur le reste du site
    $$('.st-discover, .st-member-link', container).forEach(function (a) {
      var icon = $('.works-arrow-icon', a);
      if (!icon) return;
      on(icon, 'animationend', function () { icon.classList.remove('is-nudge'); });
      on(a, 'mouseenter', function () {
        if (reduce) return;
        icon.classList.remove('is-nudge'); void icon.offsetWidth; icon.classList.add('is-nudge');
      });
    });

    // « Découvrir » : défilement doux jusqu'aux services
    var scrollRaf = null;
    function toServices(e) {
      var target = $('#services', container);
      if (!target) return;
      if (e) e.preventDefault();
      var from = window.pageYOffset, to = target.getBoundingClientRect().top + from;
      if (reduce) { window.scrollTo(0, to); return; }
      // défilement lent et doux (≈ 1,6 s, accélération puis ralentissement progressifs)
      var dur = 1600, t0 = null;
      var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      var stop = function () { if (scrollRaf) cancelAnimationFrame(scrollRaf); scrollRaf = null; };
      stop();
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        window.scrollTo(0, from + (to - from) * ease(p));
        scrollRaf = p < 1 ? requestAnimationFrame(step) : null;
      };
      scrollRaf = requestAnimationFrame(step);
      on(window, 'wheel', stop, { passive: true, once: true });
      on(window, 'touchstart', stop, { passive: true, once: true });
    }
    var discover = $('.st-discover', container);
    if (discover) on(discover, 'click', toServices);
    // Hero : le curseur devient une pastille « Découvrir » ; au clic, défilement vers les services
    // et le curseur redevient normal (jusqu'à ce que la souris ressorte puis revienne sur le hero)
    var heroDisc = $('.st-hero', container);
    if (heroDisc && root.classList.contains('has-cursor')) {
      var discOff = false, py = -1, px = -1;
      // la pastille s'ouvre et se referme lentement (classe « disc-anim » le temps de la transition de retour)
      var discT = null;
      var discSet = function (on) {
        var was = root.classList.contains('is-discover');
        if (was === on) return;
        root.classList.toggle('is-discover', on);
        root.classList.add('disc-anim');
        clearTimeout(discT);
        discT = setTimeout(function () { if (!root.classList.contains('is-discover')) root.classList.remove('disc-anim'); }, 1100);
      };
      var inHero = function () {
        var r = heroDisc.getBoundingClientRect();
        return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
      };
      on(window, 'mousemove', function (e) {
        px = e.clientX; py = e.clientY;
        // pas de pastille par-dessus la modale contact / le showreel, ni hors du hero lui-même
        var inside = inHero() && heroDisc.contains(e.target) && !root.classList.contains('is-menu') && !root.classList.contains('is-reel') &&
          !(e.target.closest && e.target.closest('a, button, .home-nav, .home-logo'));
        if (!inside && !inHero()) discOff = false;
        discSet(inside && !discOff);
      }, { passive: true });
      on(window, 'scroll', function () { if (!inHero()) { discOff = false; discSet(false); } }, { passive: true });
      on(heroDisc, 'click', function (e) {
        if (e.target.closest && e.target.closest('a, button')) return;
        discOff = true;
        discSet(false);
        toServices(e);
      });
      ac.signal.addEventListener('abort', function () { root.classList.remove('is-discover', 'disc-anim'); if (scrollRaf) cancelAnimationFrame(scrollRaf); });
    }

    // Services : clic = la description s'ouvre (l'image disparaît), nouveau clic = fermeture
    var services = $$('.st-service', container);
    function setOpen(item, open) {
      var desc = $('.st-service-desc', item);
      item.classList.toggle('is-open', open);
      item.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!desc) return;
      var from = desc.getBoundingClientRect().height;
      desc.style.height = from + 'px';
      void desc.offsetHeight;
      desc.style.height = open ? desc.scrollHeight + 'px' : '0px';
      clearTimeout(desc._t);
      if (open) desc._t = setTimeout(function () { if (item.classList.contains('is-open')) desc.style.height = 'auto'; }, 720);
    }
    services.forEach(function (item) {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-expanded', 'false');
      function toggle() {
        var open = !item.classList.contains('is-open');
        services.forEach(function (o) { if (o !== item && o.classList.contains('is-open')) setOpen(o, false); });
        setOpen(item, open);
      }
      on(item, 'click', toggle);
      on(item, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });

    // Équipe : section fixée, défilement horizontal piloté par le scroll vertical
    var pin = $('.st-team-pin', container), sticky = $('.st-team-sticky', container), track = $('.st-team-list', container);
    // la 1re carte démarre centrée dans l'écran, la dernière finit centrée, puis le défilement vertical reprend
    var dist = 0, stickyTop = 0, horizontal = false, x0 = 0;
    function layout() {
      if (!pin || !sticky || !track) return;
      horizontal = window.innerWidth > 767;
      if (!horizontal) { pin.style.height = ''; track.style.transform = ''; track.style.setProperty('--k', '0'); parallax(); return; }
      var items = track.children;
      if (!items.length) return;
      track.style.transform = 'none';
      var mid = root.clientWidth / 2;
      var f = items[0].getBoundingClientRect(), l = items[items.length - 1].getBoundingClientRect();
      x0 = mid - (f.left + f.width / 2);
      dist = Math.max(0, (l.left + l.width / 2) - (f.left + f.width / 2));
      var h = sticky.offsetHeight;
      // cartes décalées en hauteur (maquette : de -180 à +288 px) ; on réduit l'écart si l'écran est trop bas
      var up = 180, down = 288;
      var k = Math.max(0, Math.min(1, (window.innerHeight - 40 - h) / (up + down)));
      track.style.setProperty('--k', k.toFixed(3));
      stickyTop = Math.max(20, Math.round((window.innerHeight - h - (up + down) * k) / 2 + up * k));
      sticky.style.top = stickyTop + 'px';
      pin.style.height = (h + dist) + 'px';
      update();
    }
    function update() {
      if (!horizontal || !pin) return;
      var r = pin.getBoundingClientRect();
      // le défilement horizontal démarre un peu avant que la section ne se fige (lead), pour une entrée fluide
      var lead = Math.round(window.innerHeight * 0.8);
      var p = dist ? Math.min(1, Math.max(0, (stickyTop + lead - r.top) / (dist + lead))) : 0;
      track.style.transform = 'translate3d(' + (x0 - p * dist).toFixed(1) + 'px,0,0)';
      parallax();
    }
    // Parallaxe horizontale dans les photos : l'image (agrandie de 40 %) glisse à contre-sens du défilement
    var pImgs = reduce ? [] : $$('.st-member-media img', container);
    pImgs.forEach(function (img) { img.classList.add('st-plx'); });

    function parallax() {
      if (!pImgs.length) return;
      var vw = root.clientWidth;
      pImgs.forEach(function (img) {
        if (!horizontal) { img.style.transform = ''; return; }
        // toujours recalculée (même hors écran) pour éviter un saut quand la photo réapparaît
        var r = img.parentNode.getBoundingClientRect();
        var d = (r.left + r.width / 2 - vw / 2) / vw;
        var sx = Math.max(-17, Math.min(17, -d * 30));
        img.style.transform = 'translate3d(' + sx.toFixed(2) + '%,0,0) scale(1.4)';
      });
    }

    // Équipe : halo lumineux qui suit le curseur sur les photos (position lissée)
    if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      $$('.st-member-media', container).forEach(function (m) {
        var tx = 50, ty = 50, cx = 50, cy = 50, raf = null;
        var step = function () {
          raf = null;
          cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
          m.style.setProperty('--mx', cx.toFixed(2) + '%');
          m.style.setProperty('--my', cy.toFixed(2) + '%');
          if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(step);
        };
        var kick = function () { if (!raf) raf = requestAnimationFrame(step); };
        on(m, 'mouseenter', function (e) {
          var r = m.getBoundingClientRect();
          cx = tx = (e.clientX - r.left) / r.width * 100; cy = ty = (e.clientY - r.top) / r.height * 100;
          m.style.setProperty('--mx', cx + '%'); m.style.setProperty('--my', cy + '%');
          m.classList.add('is-lit');
        });
        on(m, 'mousemove', function (e) {
          var r = m.getBoundingClientRect();
          tx = (e.clientX - r.left) / r.width * 100; ty = (e.clientY - r.top) / r.height * 100;
          kick();
        });
        on(m, 'mouseleave', function () { m.classList.remove('is-lit'); });
        ac.signal.addEventListener('abort', function () { if (raf) cancelAnimationFrame(raf); });
      });
    }

    // Services : l'image flotte et suit très légèrement le curseur
    var svcList = $('.st-services-list', container);
    if (svcList && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var fx = 0, fy = 0, cx = 0, cy = 0, fRaf = null;
      var fStep = function () {
        fRaf = null;
        cx += (fx - cx) * 0.08; cy += (fy - cy) * 0.08;
        svcList.style.setProperty('--fx', cx.toFixed(2) + 'px');
        svcList.style.setProperty('--fy', cy.toFixed(2) + 'px');
        if (Math.abs(fx - cx) > 0.05 || Math.abs(fy - cy) > 0.05) fRaf = requestAnimationFrame(fStep);
      };
      var fKick = function () { if (!fRaf) fRaf = requestAnimationFrame(fStep); };
      on(svcList, 'mousemove', function (e) {
        var item = e.target.closest && e.target.closest('.st-service');
        if (!item) return;
        var lr = svcList.getBoundingClientRect(), ir = item.getBoundingClientRect();
        fx = Math.max(-28, Math.min(28, (e.clientX - lr.left - lr.width / 2) * 0.05));
        fy = Math.max(-12, Math.min(12, (e.clientY - ir.top - ir.height / 2) * 0.25));
        fKick();
      });
      on(svcList, 'mouseleave', function () { fx = 0; fy = 0; fKick(); });
      ac.signal.addEventListener('abort', function () { if (fRaf) cancelAnimationFrame(fRaf); });
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        pickTheme(false);
        update();
      });
    }
    on(window, 'scroll', onScroll, { passive: true });
    on(window, 'resize', function () { layout(); pickTheme(false); });
    $$('img', container).forEach(function (img) { if (!img.complete) on(img, 'load', layout); });
    layout();
    pickTheme(true);

    // Apparitions
    if (!reduce && 'IntersectionObserver' in window) {
      // Titre : ligne par ligne, chacune dans son masque (comme l'accueil)
      var titleEl = $('.st-title', container);
      if (titleEl) {
        var showTitle = function () {
          if (titleEl._split) return;
          titleEl._split = true;
          splitLines(titleEl).forEach(function (l, i) {
            setTimeout(function () {
              l.style.transition = 'transform 1100ms ' + EASE;
              l.style.transform = 'translateY(0)';
            }, 150 + i * 90);
          });
        };
        titleEl.style.visibility = 'hidden';
        var go = function () { showTitle(); titleEl.style.visibility = ''; };
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
        setTimeout(go, 1200);   // filet de sécurité
      }
      var texts = $$('.st-intro, .st-label, .st-head-text, .st-big, .st-small, .st-cta-title, .st-cta-link', container);
      var masks = texts.map(function (el) { return maskText(el); });
      var blocks = $$('.st-discover, .st-service', container);
      blocks.forEach(function (b) { b.style.opacity = '0'; b.style.transform = 'translateY(40px)'; });
      var members = $$('.st-member', container).map(function (m) {
        var media = $('.st-member-media', m), info = $('.st-member-info', m);
        if (media) media.style.clipPath = 'inset(100% 0 0 0)';
        if (info) { info.style.opacity = '0'; info.style.transform = 'translateY(20px)'; }
        return { el: m, media: media, info: info };
      });
      var queue = [], timer = null;
      function flush() {
        queue.forEach(function (el, i) {
          setTimeout(function () {
            if (el._mask) { el._mask.style.transition = 'transform 1000ms ' + EASE; el._mask.style.transform = 'none'; }
            else if (el._member) {
              var m = el._member;
              if (m.media) { m.media.style.transition = 'clip-path 1200ms ' + INOUT; m.media.style.clipPath = 'inset(0% 0 0 0)'; }
              if (m.info) setTimeout(function () { m.info.style.transition = 'opacity 800ms ease, transform 1000ms ' + EASE; m.info.style.opacity = ''; m.info.style.transform = ''; }, 500);
            } else {
              el.style.transition = 'opacity 900ms ease, transform 1100ms ' + EASE;
              el.style.opacity = ''; el.style.transform = '';
              setTimeout(function () { el.style.transition = ''; }, 1150);
            }
          }, i * 90);
        });
        queue = []; timer = null;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          queue.push(e.target);
        });
        if (queue.length && !timer) timer = setTimeout(flush, 0);
      }, { threshold: 0.15 });
      texts.forEach(function (el, i) { el._mask = masks[i]; });
      setTimeout(function () {
        texts.forEach(function (el) { io.observe(el); });
        blocks.forEach(function (b) { io.observe(b); });
        members.forEach(function (m) { m.el._member = m; io.observe(m.el); });
      }, 300);
      ac.signal.addEventListener('abort', function () { io.disconnect(); });
    }

    return {
      destroy: function () {
        ac.abort();
        document.body.style.backgroundColor = '';
        document.body.style.transition = '';
      }
    };
  }

  /* =====================================================================
     MODAL CONTACT : le fond noir s'étend depuis la droite sur toute la largeur, le contenu apparaît en masque
     ===================================================================== */
  var CONTACT = {
    name: 'Charles Tremblais',
    email: 'cetestudio.pro@gmail.com',
    tel: ['06.58.02.66.87', '+33658026687'],
    social: [['Instagram', 'https://www.instagram.com/cete.studio_/'], ['Awwwards', 'https://www.awwwards.com/cetestudio/'], ['Dribbble', 'https://dribbble.com/Cete']],
    menu: [['Projets', '/projets'], ['Services', '/']],   // « Studio » retiré pour le moment ; « Services » : section de l'accueil
    legal: [['Cookies', '/cookies'], ['Données', '/protection-des-donnees'], ['Mentions légales', '/mentions-legales']]
  };
  var CONTACT_BG = 'https://cdn.prod.website-files.com/6acf743eb4f622a1815188f4/6ae47f8c33e7c74b6ffbeb2b_contact-bg.webp';
  var Menu = (function () {
    var isOpen = false, busy = false, lastFocus = null, timers = [], shownAt = 0;
    function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function clearLater() { timers.forEach(clearTimeout); timers = []; }
    function col(title, items) {
      return '<div class="cm-col"><p class="cm-head">' + title + '</p>' + items.map(function (it) {
        var ext = /^https?:/.test(it[1]) ? ' target="_blank" rel="noopener"' : '';   // liens externes : nouvel onglet
        return '<a class="cm-link" href="' + it[1] + '"' + ext + '>' + it[0] + '</a>';
      }).join('') + '</div>';
    }
    var bg = document.createElement('div');
    bg.className = 'cm-bg';
    bg.setAttribute('aria-hidden', 'true');
    var box = document.createElement('div');
    box.className = 'cm';
    box.id = 'contact-modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Contact');
    box.setAttribute('tabindex', '-1');   // focus sur la modal à l'ouverture (le bouton « Fermer » ne s'affiche qu'au clavier)
    box.innerHTML =
      '<div class="cm-cols">' + col('Social', CONTACT.social) + col('Menu', CONTACT.menu) + col('Légal', CONTACT.legal) + '</div>' +
      '<div class="cm-main"><p class="cm-title"><span class="cm-tl">Discutons</span><span class="cm-tl">de votre</span><span class="cm-tl">projet</span></p><div class="cm-coords">' +
        '<p class="cm-coord cm-name">' + CONTACT.name + '</p>' +
        '<div class="cm-mail">' +
          '<a class="cm-coord cm-mail-link" href="mailto:' + CONTACT.email + '" aria-label="Copier l’adresse ' + CONTACT.email + '">' + CONTACT.email +
            '<svg class="cm-copy" viewBox="17 17 15.75 15.75" aria-hidden="true"><path d="M20.7654 20.7905V21.5878H17.7973V31.9527H28.1622V28.9846H28.9595V32.75H17V20.7905H20.7654Z"/><path d="M32.75 17V26.5676H23.1824V17H32.75ZM23.9797 25.7703H31.9527V17.7973H23.9797V25.7703Z"/></svg></a>' +
          '<span class="cm-tip" role="status" aria-live="polite"></span>' +
        '</div>' +
        '<a class="cm-coord cm-tel" href="tel:' + CONTACT.tel[1] + '">' + CONTACT.tel[0] + '</a>' +
      '</div></div>' +
      '<button type="button" class="cm-close">Fermer</button>' +
      '<div class="cm-logo" aria-hidden="true"><img src="' + LOADER_LOGO + '" alt=""></div>';
    document.body.appendChild(bg);
    document.body.appendChild(box);
    // clic en dehors des liens (curseur « Fermer ») : la modal se ferme
    bg.addEventListener('click', function () { if (isOpen && !busy) shut(); });
    // « Services » : sur l'accueil, la modal se ferme sur la section services ; ailleurs, retour à l'accueil
    // directement sur cette section
    $$('.cm-link', box).forEach(function (a) {
      if (a.textContent !== 'Services') return;
      a.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (page && page.goServices) { page.goServices(); shut(); return; }
        try { sessionStorage.setItem('cete-home-at', 'services'); } catch (err) {}
        if (window.barba) barba.go('/'); else window.location.href = '/';
      });
    });

    // Fond noir ; au passage du curseur, la photo se révèle en volutes de fumée animées.
    // 1. Traînée : bouffées qui montent, gonflent et s'estompent, dessinées dans un masque basse résolution.
    // 2. Rendu WebGL : le masque est déformé par un bruit fractal qui s'écoule vers le haut (les volutes
    //    continuent d'onduler même curseur immobile), puis découpe la photo. Sans WebGL : masque appliqué tel quel.
    var Smoke = (function () {
      if (reduce) return { start: function () {}, stop: function () {} };
      var RES = 0.6;   // résolution de rendu (fumée douce : inutile de calculer chaque pixel)
      var cv = document.createElement('canvas');
      cv.className = 'cm-smoke';
      bg.appendChild(cv);
      var mk = document.createElement('canvas'), mctx = mk.getContext('2d');
      var img = new Image(), ready = false;
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      var parts = [], raf = null, on = false, W = 0, H = 0, lx = null, ly = null, last = 0, clock = 0, MS = 0.25;
      var gl = null, ctx = null, U = {}, texImg = null, texMask = null;

      var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
      var FS = [
        'precision mediump float;varying vec2 v;uniform sampler2D uImg,uMask;uniform float uT;uniform vec2 uAsp,uCov;',
        'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
        'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
        'return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}',
        'float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}',
        'void main(){',
        '  vec2 p=v*uAsp*3.4;float t=uT;',
        // déformation en cascade (domain warping) qui dérive vers le haut : effet de volutes
        '  vec2 q=vec2(fbm(p-vec2(0.,t*.22)),fbm(p+vec2(5.2,1.3)-vec2(t*.03,t*.28)));',
        '  vec2 r=vec2(fbm(p+2.8*q+vec2(1.7,9.2)-vec2(0.,t*.36)),fbm(p+2.8*q+vec2(8.3,2.8)-vec2(-t*.04,t*.31)));',
        '  float f=fbm(p+2.4*r-vec2(0.,t*.2));',
        '  float m=texture2D(uMask,v+(r-.5)*vec2(.09,.13)).a;',
        // filaments : densité contrastée (zones vides et volutes plus denses) à l'intérieur de la traînée
        '  float w=smoothstep(.32,.78,f);',
        '  float s=smoothstep(.02,.7,m*(.28+1.2*w));',
        '  float g=dot(texture2D(uImg,(v-.5)*uCov+.5).rgb,vec3(.299,.587,.114));',
        '  gl_FragColor=vec4(vec3(g*s),1.);',
        '}'
      ].join('\n');
      function initGL() {
        var g = cv.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false });
        if (!g) return null;
        function sh(type, src) { var s = g.createShader(type); g.shaderSource(s, src); g.compileShader(s); return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null; }
        var vs = sh(g.VERTEX_SHADER, VS), fs = sh(g.FRAGMENT_SHADER, FS);
        if (!vs || !fs) return null;
        var pr = g.createProgram();
        g.attachShader(pr, vs); g.attachShader(pr, fs); g.linkProgram(pr);
        if (!g.getProgramParameter(pr, g.LINK_STATUS)) return null;
        g.useProgram(pr);
        var buf = g.createBuffer();
        g.bindBuffer(g.ARRAY_BUFFER, buf);
        g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
        var loc = g.getAttribLocation(pr, 'p');
        g.enableVertexAttribArray(loc);
        g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
        ['uImg', 'uMask', 'uT', 'uAsp', 'uCov'].forEach(function (k) { U[k] = g.getUniformLocation(pr, k); });
        g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
        function tex(unit) {
          var t = g.createTexture();
          g.activeTexture(g.TEXTURE0 + unit);
          g.bindTexture(g.TEXTURE_2D, t);
          g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
          g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
          g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
          g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
          return t;
        }
        texImg = tex(0); texMask = tex(1);
        g.uniform1i(U.uImg, 0); g.uniform1i(U.uMask, 1);
        return g;
      }
      try { gl = initGL(); } catch (e) { gl = null; }
      if (!gl) {   // repli 2D sur un nouveau canvas (celui-ci a peut-être déjà un contexte WebGL)
        var c2 = document.createElement('canvas');
        c2.className = 'cm-smoke';
        bg.replaceChild(c2, cv);
        cv = c2; ctx = cv.getContext('2d');
      }
      img.onload = function () {
        ready = true;
        if (gl) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texImg); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); }
      };
      img.onerror = function () {   // image refusée en WebGL (CORS) : repli 2D
        if (!gl) return;
        gl = null;
        var c2 = document.createElement('canvas');
        c2.className = 'cm-smoke';
        bg.replaceChild(c2, cv);
        cv = c2; ctx = cv.getContext('2d'); size();
        img = new Image(); img.decoding = 'async'; img.onload = function () { ready = true; }; img.src = CONTACT_BG;
      };

      function size() {
        W = window.innerWidth; H = window.innerHeight;
        var k = gl ? RES : Math.min(window.devicePixelRatio || 1, 1.5);
        cv.width = Math.round(W * k); cv.height = Math.round(H * k);
        mk.width = Math.ceil(W * MS); mk.height = Math.ceil(H * MS);
        if (gl) gl.viewport(0, 0, cv.width, cv.height);
      }
      function puff(x, y, v) {
        parts.push({
          x: x + (Math.random() - 0.5) * 16, y: y + (Math.random() - 0.5) * 16,
          r: 30 + Math.random() * 30, g: 90 + Math.random() * 90 + Math.min(v, 60) * 1.4,
          a: 0.38 + Math.min(v, 40) * 0.007, t: 0, d: 2200 + Math.random() * 1400,
          vx: (Math.random() - 0.5) * 30, vy: -14 - Math.random() * 24, ph: Math.random() * 6.28
        });
        if (parts.length > 180) parts.shift();
      }
      function move(e) {
        if (!on) return;
        var x = e.clientX, y = e.clientY;
        if (lx === null) { lx = x; ly = y; puff(x, y, 0); }
        var dx = x - lx, dy = y - ly, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10) return;
        var n = Math.min(6, Math.ceil(dist / 22));
        for (var i = 1; i <= n; i++) puff(lx + dx * i / n, ly + dy * i / n, dist / n);
        lx = x; ly = y;
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      }
      function drawMask(dt) {
        mctx.clearRect(0, 0, mk.width, mk.height);
        for (var i = parts.length - 1; i >= 0; i--) {
          var p = parts[i];
          p.t += dt;
          var k = p.t / p.d;
          if (k >= 1) { parts.splice(i, 1); continue; }
          // la bouffée monte en ondulant, comme une vapeur
          p.x += (p.vx + Math.sin(p.t * 0.0022 + p.ph) * 26) * dt / 1000;
          p.y += p.vy * dt / 1000;
          var r = (p.r + p.g * Math.pow(k, 0.65)) * MS, al = p.a * Math.min(1, k * 7) * Math.pow(1 - k, 1.5);
          var gx = p.x * MS, gy = p.y * MS, gr = mctx.createRadialGradient(gx, gy, 0, gx, gy, r);
          gr.addColorStop(0, 'rgba(255,255,255,' + al + ')');
          gr.addColorStop(0.55, 'rgba(255,255,255,' + al * 0.45 + ')');
          gr.addColorStop(1, 'rgba(255,255,255,0)');
          mctx.fillStyle = gr;
          mctx.beginPath(); mctx.arc(gx, gy, r, 0, 6.2832); mctx.fill();
        }
      }
      function renderGL() {
        var ia = img.naturalWidth / img.naturalHeight, sa = W / H;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texMask);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mk);
        gl.uniform1f(U.uT, clock / 1000);
        gl.uniform2f(U.uAsp, sa, 1);
        gl.uniform2f(U.uCov, Math.min(1, sa / ia), Math.min(1, ia / sa));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      function render2D() {
        var dpr = cv.width / W;
        ctx.clearRect(0, 0, cv.width, cv.height);
        if (!parts.length) return;
        var s = Math.max(W / img.naturalWidth, H / img.naturalHeight), w = img.naturalWidth * s, h = img.naturalHeight * s;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, (W - w) / 2 * dpr, (H - h) / 2 * dpr, w * dpr, h * dpr);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(mk, 0, 0, cv.width, cv.height);
        ctx.globalCompositeOperation = 'source-over';
      }
      function frame(now) {
        var dt = Math.max(0, Math.min(50, now - last)); last = now;   // l'horodatage rAF peut précéder performance.now()
        clock += dt;
        drawMask(dt);
        if (ready) { if (gl) renderGL(); else render2D(); }
        raf = parts.length ? requestAnimationFrame(frame) : null;
        if (!raf && gl) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
      }
      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('resize', function () { if (on) size(); });
      return {
        start: function () {
          if (!img.src) img.src = CONTACT_BG;
          size(); on = true; lx = null; ly = null;
        },
        stop: function () {
          on = false; parts = [];
          if (raf) { cancelAnimationFrame(raf); raf = null; }
          if (gl) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); } else if (ctx) ctx.clearRect(0, 0, cv.width, cv.height);
        }
      };
    })();

    // Adresse e-mail : un clic la copie dans le presse-papier, une infobulle le confirme
    var mailLink = $('.cm-mail-link', box), tip = $('.cm-tip', box), tipTimer = null;
    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
      return new Promise(function (res, rej) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(ta);
        ok ? res() : rej();
      });
    }
    function showTip(text) {
      tip.textContent = text;
      tip.classList.remove('is-on');
      void tip.offsetWidth;
      tip.classList.add('is-on');
      clearTimeout(tipTimer);
      tipTimer = setTimeout(function () { tip.classList.remove('is-on'); }, 1800);
    }
    mailLink.addEventListener('click', function (e) {
      e.preventDefault();
      copyText(CONTACT.email).then(function () { showTip('Adresse copiée'); }, function () {
        window.location.href = 'mailto:' + CONTACT.email;   // copie impossible : on ouvre la messagerie
      });
    });

    // Chaque texte dans son masque (même système que le loader et l'accueil)
    $$('.cm-head, .cm-link', box).forEach(function (el) { maskText(el); });
    var title = $$('.cm-tl', box).map(function (el) { return maskText(el); });   // titre : une ligne par masque
    var coords = $$('.cm-coord', box).map(function (el) { return maskText(el); });
    var close = maskText($('.cm-close', box));
    var logo = $('.cm-logo', box);
    // Grand logo « cete » en SVG inline : chaque lettre (pleine) monte depuis le bas du logo, l'une après l'autre
    var logoPaths = [];
    fetch(LOADER_LOGO).then(function (res) { return res.text(); }).then(function (txt) {
      var tmp = document.createElement('div');
      tmp.innerHTML = txt;
      var svg = tmp.querySelector('svg'), img = $('img', logo);
      if (!svg || !img) return;
      svg.setAttribute('aria-hidden', 'true');
      svg.removeAttribute('width'); svg.removeAttribute('height');
      logo.replaceChild(svg, img);
      logoPaths = $$('path', svg).map(function (p) { return { el: p }; });
      if (!isOpen) prepLogo();
    }).catch(function () {});
    // SVG vertical tourné de 90° : +x dans le SVG = vers le bas à l'écran ; 18 unités = toute la hauteur du logo
    function prepLogo() {
      logoPaths.forEach(function (o) {
        o.el.style.transition = 'none';
        o.el.style.transform = 'translate(18px, 0)';
      });
    }
    function buildLogo(delay) {
      if (!logoPaths.length) {   // SVG pas encore chargé : simple dévoilement
        later(delay, function () { logo.style.transition = 'clip-path 1400ms ' + EASE; logo.style.clipPath = 'inset(-2% -2% -2% -2%)'; });
        return;
      }
      logo.style.transition = 'none';
      logo.style.clipPath = 'inset(-2% -2% -1% -2%)';   // le bas du logo sert de masque
      prepLogo();
      void logo.offsetWidth;
      // ordre de lecture : de gauche à droite à l'écran
      var order = logoPaths.slice().sort(function (a, b) {
        return a.el.getBoundingClientRect().left - b.el.getBoundingClientRect().left;
      });
      order.forEach(function (o, i) {
        later(delay + i * 110, function () {
          o.el.style.transition = 'transform 1300ms ' + EASE;
          o.el.style.transform = 'translate(0, 0)';
        });
      });
    }
    var cols = [];   // ordre d'apparition : colonne par colonne
    $$('.cm-col', box).forEach(function (c) { cols = cols.concat($$('span[data-axis]', c)); });
    var all = cols.concat(title, coords, [close]);

    function burger(open) {
      $$('.burger-line').forEach(function (b) { b.style.transform = ''; b.style.transformOrigin = ''; b.style.transition = ''; });
      $$('.side-burger').forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    }
    function open() {
      if (isOpen || busy) return;
      isOpen = true; busy = true; clearLater();
      lastFocus = document.activeElement;
      root.classList.add('is-menu'); root.classList.remove('is-discover');
      burger(true);
      Smoke.start();
      all.forEach(hide);
      logo.style.transition = 'none';
      logo.style.clipPath = 'inset(-2% 102% -2% -2%)';
      prepLogo();
      box.style.visibility = 'visible';
      box.offsetHeight;
      shownAt = 0;
      if (reduce) { bg.style.transition = 'none'; bg.style.clipPath = 'inset(0 0 0 0)'; all.forEach(function (el) { el.style.transform = 'none'; }); logo.style.clipPath = 'inset(-2% -2% -2% -2%)'; logoPaths.forEach(function (o) { o.el.style.transform = 'none'; }); busy = false; box.focus({ preventScroll: true }); return; }
      // 1. Le fond noir monte depuis le bas de l'écran
      bg.style.transition = 'clip-path 1000ms ' + INOUT;
      bg.style.clipPath = 'inset(0 0 0 0)';
      // 2. Les textes montent depuis leur masque, colonne par colonne
      reveal(cols, 650, 35, 900);
      reveal(title, 800, 70, 1100);
      reveal(coords, 900, 80, 1000);
      reveal([close], 950, 0, 900);
      // 3. Le grand logo se construit lettre par lettre
      buildLogo(850);
      later(1000, function () { busy = false; box.focus({ preventScroll: true }); });
      // pendant 1,8 s après l'ouverture, un geste de défilement ne referme pas la modal
      shownAt = performance.now() + 1800;
    }
    function shut(fast) {
      if (!isOpen) return Promise.resolve();
      isOpen = false; busy = true; clearLater();
      tip.classList.remove('is-on');
      burger(false);
      var out = reduce || fast ? 0 : 450;
      if (out) {
        conceal(all, 0, 15, 450);
        logo.style.transition = 'clip-path 550ms ' + INOUT;
        logo.style.clipPath = 'inset(-2% -2% -2% 102%)';
      }
      return new Promise(function (res) {
        later(out, function () {
          if (!out) box.style.visibility = 'hidden';
          bg.style.transition = out ? 'clip-path 900ms ' + INOUT : 'none';
          bg.style.clipPath = '';   // le fond redescend
          root.classList.remove('is-menu');
          later(out ? 950 : 0, function () {
            box.style.visibility = 'hidden';
            busy = false;
            Smoke.stop();
            if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
            res();
          });
        });
      });
    }
    // Ouverture : « Contact » (navigation principale, [data-contact]) ou le burger (mobile) ;
    // fermeture : clic hors des liens (curseur « Fermer »), le burger (croix) ou Échap
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.side-burger, .cm-close, [data-contact]');
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      if (t.classList.contains('cm-close') || isOpen) shut(); else open();
    }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) shut(); });
    $$('.side-burger').forEach(function (b) { b.setAttribute('aria-controls', 'contact-modal'); b.setAttribute('aria-expanded', 'false'); });
    // Vers une page légale : les éléments sortent ; le fond noir, déjà plein écran, laisse place à la page légale (noire)
    function expand() {
      if (!isOpen) return Promise.resolve();
      clearLater();
      busy = true;
      tip.classList.remove('is-on');
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();   // pas de contour de focus qui reste à l'écran
      if (reduce) return Promise.resolve();
      conceal(all, 0, 15, 450);
      logo.style.transition = 'clip-path 550ms ' + INOUT;
      logo.style.clipPath = 'inset(-2% -2% -2% 102%)';
      return wait(500);
    }
    // Après le changement de page : la modal est remise à zéro sans animation (cachée par la page noire)
    function reset() {
      clearLater();
      Smoke.stop();
      isOpen = false; busy = false;
      box.style.visibility = 'hidden';
      bg.style.transition = 'none';
      bg.style.clipPath = '';
      root.classList.add('is-menu-reset');   // logo, burger : bascule sans animation (pas de saut visible)
      root.classList.remove('is-menu');
      burger(false);
      void root.offsetWidth;
      requestAnimationFrame(function () { root.classList.remove('is-menu-reset'); });
    }
    return { open: open, close: shut, expand: expand, reset: reset, isOpen: function () { return isOpen; },
      shown: function () { return isOpen && performance.now() >= shownAt; } };
  })();

  /* =====================================================================
     MODAL SHOWREEL : le fond noir monte du bas de l'écran, puis la vidéo apparaît en fondu
     Vidéo muette ; lecture / pause au clic sur la vidéo (icône dans le curseur), Entrée ou Espace
     ===================================================================== */
  var REEL_SRC = 'https://cetestudio.b-cdn.net/Cete/Showreel_2026.mp4';
  var Reel = (function () {
    var isOpen = false, busy = false, lastFocus = null, timers = [];
    function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function clearLater() { timers.forEach(clearTimeout); timers = []; }

    var box = document.createElement('div');
    box.className = 'sr';
    box.id = 'showreel-modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Showreel');
    box.innerHTML =
      '<div class="sr-bg"></div>' +
      '<a class="sr-mark" href="/" aria-label="Cete Studio — accueil"></a>' +
      '<nav class="sr-nav" aria-label="Menu"></nav>' +
      '<div class="sr-zone"><div class="sr-frame">' +
        '<video class="sr-video" muted loop playsinline preload="none" tabindex="0" role="button" aria-label="Pause"></video>' +
        '<div class="sr-state" aria-hidden="true"><svg viewBox="0 0 60 60" fill="none" stroke="#fff" stroke-width="1"><circle cx="30" cy="30" r="29.5"/><path d="M27.5 24.9v10.4l8.4-5.2z" stroke-linejoin="round"/></svg></div>' +
        '<div class="sr-bar">' +
          '<button type="button" class="sr-close" aria-label="Fermer le showreel"><span></span><span></span></button>' +
        '</div>' +
      '</div></div>';
    document.body.appendChild(box);

    var bg = $('.sr-bg', box), mark = $('.sr-mark', box), nav = $('.sr-nav', box);
    var frame = $('.sr-frame', box), video = $('.sr-video', box);
    var texts = [];
    video.muted = true;
    video.loop = true;   // le showreel tourne en boucle
    var closeBtn = $('.sr-close', box);
    var preview = null;   // extrait en boucle de l'accueil, mis en pause pendant la lecture

    // Logo et navigation repris de la page, en blanc
    function fillChrome() {
      var logo = $('.home-logo-img');
      mark.innerHTML = logo ? '<img src="' + (logo.currentSrc || logo.src) + '" alt="">' : '';
      nav.innerHTML = '';
      $$('.home-nav .nav-link').forEach(function (a) {
        var l = document.createElement('a');
        l.className = 'sr-link';
        l.href = a.getAttribute('href') || '#';
        l.textContent = a.textContent.trim();
        nav.appendChild(l);
      });
      return $$('.sr-link', nav).map(function (l) { return maskText(l); });
    }
    var links = [];

    function sync() {
      video.setAttribute('aria-label', video.paused ? 'Lecture' : 'Pause');
      frame.classList.toggle('is-paused', video.paused);
    }
    function toggle() {
      if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else video.pause();
    }
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('click', toggle);
    video.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); toggle(); } });

    function open() {
      if (isOpen || busy) return;
      isOpen = true; busy = true; clearLater();
      lastFocus = document.activeElement;
      root.classList.add('is-reel');
      links = fillChrome();
      preview = $('.showreel-video');
      if (preview) preview.pause();
      // Chargement lancé dès le clic : la vidéo se met en mémoire pendant que le fond noir monte
      if (!video.src) { video.preload = 'auto'; video.src = REEL_SRC; }
      links.concat(texts).forEach(hide);
      frame.style.transition = 'none';
      frame.style.opacity = '0';
      mark.style.transition = 'none';
      mark.style.opacity = '0';
      closeBtn.classList.remove('is-in');
      bg.style.transition = 'none';
      bg.style.clipPath = 'inset(100% 0 0 0)';
      box.style.visibility = 'visible';
      box.offsetHeight;
      sync();
      if (reduce) {
        bg.style.clipPath = 'inset(0)'; frame.style.opacity = '1'; mark.style.opacity = '1';
        links.concat(texts).forEach(function (el) { el.style.transform = 'none'; });
        closeBtn.classList.add('is-in');
        video.currentTime = 0; toggle(); sync();
        busy = false; closeBtn.focus({ preventScroll: true });
        return;
      }
      // 1. Le fond noir monte depuis le bas
      bg.style.transition = 'clip-path 1000ms ' + INOUT;
      bg.style.clipPath = 'inset(0 0 0 0)';
      // 2. Une fois le fond en place : la vidéo apparaît en fondu et démarre
      later(1000, function () {
        try { video.currentTime = 0; } catch (e) {}
        if (video.paused) toggle();
        frame.style.transition = 'opacity 900ms ease';
        frame.style.opacity = '1';
        mark.style.transition = 'opacity 600ms ease';
        mark.style.opacity = '1';
      });
      // 3. Navigation et contrôles en masque
      reveal(links, 1100, 60, 900);
      reveal(texts, 1300, 80, 900);
      later(1300, function () { closeBtn.classList.add('is-in'); });
      later(1300, function () { busy = false; closeBtn.focus({ preventScroll: true }); });
    }

    function shut(fast) {
      if (!isOpen) return Promise.resolve();
      isOpen = false; busy = true; clearLater();
      var out = reduce || fast ? 0 : 450;
      if (out) {
        conceal(links.concat(texts), 0, 20, 450);
        closeBtn.classList.remove('is-in');
        frame.style.transition = 'opacity 450ms ease';
        frame.style.opacity = '0';
        mark.style.transition = 'opacity 400ms ease';
        mark.style.opacity = '0';
      }
      return new Promise(function (res) {
        later(out, function () {
          video.pause();
          // Le fond noir repart vers le haut et découvre la page
          bg.style.transition = out ? 'clip-path 900ms ' + INOUT : 'none';
          bg.style.clipPath = 'inset(0 0 100% 0)';
          later(out ? 950 : 0, function () {
            box.style.visibility = 'hidden';
            root.classList.remove('is-reel');
            if (preview && document.contains(preview) && !reduce) { var p = preview.play(); if (p && p.catch) p.catch(function () {}); }
            busy = false;
            if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
            res();
          });
        });
      });
    }

    document.addEventListener('click', function (e) {
      // Logo dans la modal : retour à l'accueil (déjà sur l'accueil : la modal se ferme simplement)
      var m = e.target.closest && e.target.closest('.sr-mark');
      if (m && isOpen) {
        if (location.pathname.replace(/\/+$/, '') === '') { e.preventDefault(); e.stopPropagation(); shut(); }
        return;   // autre page : Barba prend le lien, la modal est fermée dans son hook « before »
      }
      var t = e.target.closest && e.target.closest('.showreel, .sr-close');
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      if (t.classList.contains('sr-close')) shut(); else open();
    }, true);
    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); shut(); }
      else if (e.key === ' ' && e.target === document.body || (e.key === ' ' && e.target === video)) { e.preventDefault(); toggle(); }
    });
    // Molette et gestes ne font pas tourner la roulette derrière la modal
    ['wheel', 'touchmove'].forEach(function (ev) {
      box.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
    });
    return { open: open, close: shut, isOpen: function () { return isOpen; } };
  })();

  /* =====================================================================
     RIDEAU NOIR des pages légales : monte par le bas à l'entrée, part par le haut à la sortie
     ===================================================================== */
  var Curtain = (function () {
    var el = document.createElement('div');
    el.className = 'page-curtain';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    function set(y, ms) {
      el.style.transition = ms ? 'transform ' + ms + 'ms ' + INOUT : 'none';
      el.style.transform = 'translate3d(0,' + y + ',0)';
    }
    return {
      cover: function () {      // du bas vers le haut, jusqu'à couvrir l'écran
        el.style.visibility = 'visible';
        set('100%', 0); void el.offsetWidth;
        set('0%', 900);
        return wait(920);
      },
      show: function () { el.style.visibility = 'visible'; set('0%', 0); },
      uncover: function () {    // continue sa course vers le haut
        void el.offsetWidth;
        set('-100%', 1000);
        return wait(1020).then(function () { el.style.visibility = 'hidden'; set('100%', 0); });
      },
      reset: function () { el.style.visibility = 'hidden'; set('100%', 0); }
    };
  })();

  /* =====================================================================
     NAVIGATION : Barba.js
     ===================================================================== */
  var page = null, prev = null;
  function initPage(container, opts) {
    var ns = container.getAttribute('data-barba-namespace');
    root.setAttribute('data-page', ns);
    if (ns === 'home') page = Home(container, opts);
    else if (ns === 'work') page = Work(container, opts);
    else if (ns === 'works') page = Works(container, opts);
    else if (ns === 'legal') page = Legal(container, opts);
    else if (ns === 'studio') page = Studio(container, opts);
    else if (ns === 'service') page = Service(container, opts);
    else page = null;
    return page;
  }
  // Les <script> d'une page chargée par Barba ne s'exécutent pas seuls (ex. boucle du showreel)
  function runScripts(container) {
    $$('script', container).forEach(function (s) {
      var n = document.createElement('script');
      [].forEach.call(s.attributes, function (a) { n.setAttribute(a.name, a.value); });
      n.textContent = s.textContent;
      s.parentNode.replaceChild(n, s);
    });
  }
  // Webflow : réinitialise ses modules sur la nouvelle page
  function resetWebflow(data) {
    try {
      var doc = new DOMParser().parseFromString(data.next.html, 'text/html');
      var id = doc.documentElement.getAttribute('data-wf-page');
      if (id) root.setAttribute('data-wf-page', id);
      if (window.Webflow && Webflow.destroy) {
        Webflow.destroy();
        Webflow.ready();
        var ix = Webflow.require && Webflow.require('ix2');
        if (ix && ix.init) ix.init();
      }
    } catch (e) {}
  }
  function fixed(c, on) {
    if (on) c.style.cssText += ';position:fixed;top:0;left:0;width:100%;height:100vh;z-index:30;overflow:hidden';
    else ['position', 'top', 'left', 'width', 'height', 'z-index', 'overflow', 'visibility'].forEach(function (p) { c.style.removeProperty(p); });
  }

  if (!window.barba) {   // Barba indisponible : la page fonctionne seule
    var c0 = $('[data-barba="container"]');
    if (c0) initPage(c0, { first: true });
    return;
  }

  var leaveData = null, flyData = null;
  var LEGAL_PATH = /^\/(mentions-legales|protection-des-donnees|cookies)\/?$/;
  barba.hooks.before(function (data) {   // un lien d'une modal la ferme avant la transition
    if (Reel.isOpen()) return Promise.resolve(Reel.close(true));
    // vers une page légale, la modal contact reste ouverte : son fond noir sert de transition
    if (Menu.isOpen() && !LEGAL_PATH.test(data.next.url.path || '')) return Promise.resolve(Menu.close(true));
  });   // un lien du menu ferme la modal
  barba.hooks.beforeLeave(function () { prev = page; });
  barba.hooks.afterLeave(function () { if (prev && prev.destroy) prev.destroy(); });
  barba.hooks.after(function (data) {
    root.classList.remove('is-leaving');
    resetWebflow(data);
  });

  barba.init({
    preventRunning: true,
    timeout: 10000,
    prevent: function (o) { return o.el && (o.el.closest('.w-editor') || (o.el.getAttribute('href') || '').charAt(0) === '#'); },
    transitions: [
      {
        name: 'accueil-vers-projet',       // aussi depuis la page Works : la photo cliquée sert de relais
        from: { namespace: ['home', 'works', 'work'] },   // work → work : projet suivant (défilement infini)
        to: { namespace: ['work'] },
        leave: function (data) {
          leaveData = null;
          if (reduce || !page || !page.leaveTo) return;
          return page.leaveTo(data.next.url.path).then(function (res) { leaveData = res; });
        },
        beforeEnter: function (data) {
          runScripts(data.next.container);
          fixed(data.next.container, true);            // la page projet se pose au-dessus de l'accueil
          data.next.container.style.visibility = 'hidden';
          initPage(data.next.container, { transition: !!leaveData });
          root.setAttribute('data-page', 'home');      // garde le défilement bloqué pendant la transition
        },
        enter: function (data) {
          var c = data.next.container, w = page;
          if (!leaveData || !w) { c.style.visibility = ''; return; }
          return w.fromCard(leaveData.card, leaveData.radius).then(function () {
            c.style.visibility = '';                   // relais invisible : même photo, même position
            if (leaveData.cleanup) leaveData.cleanup();
            return w.play();
          });
        },
        after: function (data) {
          fixed(data.next.container, false);
          root.setAttribute('data-page', 'work');
          window.scrollTo(0, 0);
        }
      },
      {
        name: 'accueil-vers-service',      // l'image au centre du cylindre devient le panneau de gauche de la page service
        from: { namespace: ['home'] },
        to: { namespace: ['service'] },
        leave: function () {
          flyData = null;
          if (reduce || !page || !page.leaveToService) return;
          return page.leaveToService().then(function (res) { flyData = res; });
        },
        beforeEnter: function (data) {
          window.scrollTo(0, 0);
          runScripts(data.next.container);
          initPage(data.next.container, { transition: !!flyData });
        },
        enter: function (data) {
          if (!flyData || !flyData.overlay) return;
          var ov = flyData.overlay, img = $('.svc-img', data.next.container);
          var ready = img && img.decode ? img.decode().catch(function () {}) : Promise.resolve();
          // relais invisible : même photo, même cadrage, même position ; puis les textes de la page montent
          return Promise.race([ready, wait(1500)]).then(function () {
            ov.remove();
            flyData = null;
            return page && page.play ? page.play() : null;
          });
        }
      },
      {
        name: 'vers-legal',                // depuis la modal contact : ses éléments sortent, son fond noir s'étend à tout l'écran
        from: { namespace: ['home', 'works', 'work', 'studio', 'legal', 'service'] },
        to: { namespace: ['legal'] },
        leave: function (data) {
          var c = data.current.container;
          if (Menu.isOpen()) return Menu.expand().then(function () { c.style.display = 'none'; });
          if (reduce) { c.style.display = 'none'; return; }
          if (data.current.namespace === 'legal') {   // d'une page légale à l'autre : simple fondu sur le noir
            c.style.transition = 'opacity 450ms ease';
            c.style.opacity = '0';
            return wait(460).then(function () { c.style.display = 'none'; });
          }
          return Curtain.cover().then(function () { c.style.display = 'none'; });   // lien direct (hors modal)
        },
        beforeEnter: function (data) {
          window.scrollTo(0, 0);
          runScripts(data.next.container);
          initPage(data.next.container, { first: false });   // les éléments de la page apparaissent
        },
        after: function () { Menu.reset(); Curtain.reset(); }   // la page légale est noire : le relais est invisible
      },
      {
        name: 'depuis-legal',              // le fond noir part par le haut et dévoile la page suivante
        from: { namespace: ['legal'] },
        to: { namespace: ['home', 'works', 'work', 'studio', 'service'] },
        leave: function (data) {
          var c = data.current.container;
          if (!reduce) Curtain.show();       // même noir que la page : rien ne bouge à l'écran
          c.style.display = 'none';
        },
        beforeEnter: function (data) {
          window.scrollTo(0, 0);
          var ns = data.next.container.getAttribute('data-barba-namespace');
          if (ns === 'home' && !reduce) root.classList.add('is-intro');
          runScripts(data.next.container);
          initPage(data.next.container, { first: false });
        },
        enter: function () {
          if (reduce) return;
          return Curtain.uncover();
        }
      },
      {
        name: 'defaut',
        leave: function (data) {
          var c = data.current.container;
          if (reduce) { c.style.display = 'none'; return; }
          c.style.transition = 'opacity 450ms ease';
          c.style.opacity = '0';
          return wait(460).then(function () { c.style.display = 'none'; });
        },
        beforeEnter: function (data) {
          window.scrollTo(0, 0);
          var ns = data.next.container.getAttribute('data-barba-namespace');
          if (ns === 'home' && !reduce) root.classList.add('is-intro');
          runScripts(data.next.container);
          initPage(data.next.container, { first: false });
        }
      }
    ]
  });

  // Première page affichée
  initPage($('[data-barba="container"]'), { first: true });
})();
