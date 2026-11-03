/* ═══════════════════════════════════════════════════════════════
   UMAR RAHI — DATA SCIENTIST PORTFOLIO
   Main Script — v2 (Bug-Fixed)
   Fixes: preloader sequence, counter conflict, heading double-anim,
         cursor positioning, smooth scroll offset, mobile nav visibility,
        body scroll lock, scroll-trigger overlap, filter animation
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── Utilities ────────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

/* ── GSAP setup (register once) ──────────────────────────────── */
let gsapReady = false;
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false, force3D: true });
  gsapReady = true;
}

/* ══════════════════════════════════════════════════════════════
   PRELOADER — Premium Cinematic Welcome Sequence
   ══════════════════════════════════════════════════════════════ */
function initPreloader() {
  const preloader = qs('#preloader');

  // Reduced motion / no element / GSAP unavailable → skip immediately
  if (!preloader || prefersReducedMotion || !gsapReady) {
    if (preloader) preloader.style.display = 'none';
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    revealHeroFallback();
    return;
  }

  // Lock scroll during intro
  document.body.classList.add('loading');

  const welcome  = qs('.preloader__welcome', preloader);
  const logoSvg  = qs('.preloader__logo svg', preloader);
  const line     = qs('.preloader__line', preloader);
  const chars    = qsa('.pl-char', preloader);
  const titleEl  = qs('.preloader__title', preloader);
  const glows    = qsa('.preloader__glow', preloader);
  const barWrap  = qs('.preloader__bar-wrap', preloader);
  const bar      = qs('.preloader__bar', preloader);

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      document.body.classList.remove('loading');
      document.body.classList.add('loaded');
      animateHeroEntranceV3();
    }
  });

  // 0.0 — ambient glow appears
  tl.to(glows, { opacity: 1, duration: 1.2, stagger: 0.3, ease: 'power2.out' }, 0)

  // 0.3 — welcome text slides in
  .to(welcome, { opacity: 1, y: 0, duration: 0.7 }, 0.3)

  // 0.7 — progress bar wrap fades in, bar fills
  .to(barWrap, { opacity: 1, duration: 0.4 }, 0.7)
  .to(bar, { width: '100%', duration: 1.0, ease: 'power2.inOut' }, 0.75)

  // 0.9 — UR logo scales in
  .to(logoSvg, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)' }, 0.9)

  // 1.3 — crimson line expands
  .to(line, { width: '240px', duration: 0.7, ease: 'power3.out' }, 1.3)

  // 1.6 — name letters fly in
  .to(chars, { opacity: 1, y: '0%', duration: 0.55, stagger: 0.055 }, 1.6)

  // 2.3 — title fades in
  .to(titleEl, { opacity: 1, y: 0, duration: 0.5 }, 2.3)

  // 2.9 — brief hold
  .to({}, { duration: 0.5 })

  // 3.4 — wipe preloader off screen
  .to(preloader, {
    yPercent: -100,
    duration: 0.85,
    ease: 'power4.inOut',
    onComplete: () => {
      preloader.style.display = 'none';
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   HERO ENTRANCE — runs after preloader completes
   ══════════════════════════════════════════════════════════════ */
function animateHeroEntrance() {
  if (!gsapReady || prefersReducedMotion) return;

  const items = qsa('.hero .reveal-up');
  if (!items.length) return;

  gsap.to(items, {
    opacity: 1,
    y: 0,
    duration: 0.85,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 0.1,
    clearProps: 'will-change'
  });
}

/* fallback for no-GSAP or reduced-motion */
function revealHeroFallback() {
  qsa('.hero .reveal-up').forEach(el => {
    el.style.opacity  = '1';
    el.style.transform = 'none';
  });
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL — non-hero .reveal-up elements
   (intentionally EXCLUDES hero elements to avoid conflict)
   Also excludes .section__heading — those get their own tween
   ══════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  if (!gsapReady || prefersReducedMotion) {
    qsa('.reveal-up').forEach(el => {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // Select all reveal-up elements OUTSIDE the hero and NOT section headings
  const targets = qsa(
    ':not(.hero) > .reveal-up, ' +
    ':not(.hero) .reveal-up:not(.section__heading)'
  );

  targets.forEach(el => {
    // Skip if already visible (e.g. stats section items)
    if (parseFloat(getComputedStyle(el).opacity) > 0.5) return;

    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'will-change',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        once: true,
      }
    });
  });

  // Section headings — clean single animation (NOT .from to avoid fighting reveal-up)
  qsa('.section__heading').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
      clearProps: 'will-change',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   COUNTER ANIMATION — single plain-JS approach, no GSAP conflict
   ══════════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = qsa('.counter');

  if (prefersReducedMotion) {
    counters.forEach(el => { el.textContent = el.dataset.target || '0'; });
    return;
  }

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target, 10) || 0;
    let triggered = false;

    function doCount() {
      if (triggered) return;
      triggered = true;

      const duration = 1600; // ms
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease out quad
        const eased = 1 - Math.pow(1 - progress, 2);
        counter.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else counter.textContent = target;
      }

      requestAnimationFrame(step);
    }

    if (gsapReady) {
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 88%',
        once: true,
        onEnter: doCount
      });
    } else {
      // Intersection observer fallback
      const io = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { doCount(); io.disconnect(); }
      }, { threshold: 0.3 });
      io.observe(counter);
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   CUSTOM CURSOR — repositioned via direct style to avoid jank
   ══════════════════════════════════════════════════════════════ */
function initCursor() {
  if (isTouch) return;

  const dot  = qs('#cursor');
  const ring = qs('#cursor-follower');
  if (!dot || !ring) return;

  // Start off-screen
  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  // Smooth follower via RAF
  (function followLoop() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(followLoop);
  })();

  // Hover states
  const hoverEls = qsa(
    'a, button, .project__card, .skill__item, .cert__card, ' +
    '.filter__btn, .contact__card, .whatido__card, .funfact__card'
  );
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor--hover'));
  });
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar     = qs('#navbar');
  const hamburger  = qs('#hamburger');
  const mobileMenu = qs('#mobile-menu');
  const navLinks   = qsa('.nav__link');
  const mobileLinks = qsa('.nav__mobile-link');
  const sections   = qsa('section[id]');

  if (!navbar) return;

  // Scroll → scrolled class + active link + back-to-top
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink();
    updateBackToTop();
  }, { passive: true });

  // Active section detection
  function updateActiveLink() {
    const navH = navbar.offsetHeight;
    let current = '';
    sections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= navH + 40) {
        current = sec.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.classList.toggle('open', isOpen);
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });

    // Close when a mobile link is tapped
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (mobileMenu.classList.contains('open') && !navbar.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
        hamburger.focus();
      }
    });
  }

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }
}

/* ══════════════════════════════════════════════════════════════
   SMOOTH SCROLL — accounts for dynamic nav height
   ══════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const hash   = anchor.getAttribute('href');
      if (hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();

      const navbar = qs('#navbar');
      const navH   = navbar ? navbar.offsetHeight : 72;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   BACK TO TOP
   ══════════════════════════════════════════════════════════════ */
function updateBackToTop() {
  const btn = qs('#back-to-top');
  if (btn) btn.classList.toggle('visible', window.scrollY > 450);
}

function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════════════════════════════
   PROJECT FILTERS
   ══════════════════════════════════════════════════════════════ */
function initProjectFilters() {
  const btns  = qsa('.filter__btn');
  const cards = qsa('.project__card:not(.project__card--more)');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cats = (card.dataset.categories || '').split(' ');
        const visible = filter === 'all' || cats.includes(filter);

        if (visible) {
          card.classList.remove('hidden');
          if (gsapReady && !prefersReducedMotion) {
            gsap.fromTo(card,
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' }
            );
          } else {
            card.style.opacity = '1';
          }
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   MUSIC PLAYER
   ══════════════════════════════════════════════════════════════ */
function initMusicPlayer() {
  const player = qs('#music-player');
  const toggle = qs('#music-toggle');
  const audio  = qs('#bg-audio');
  if (!toggle || !audio) return;

  let playing = false;
  audio.volume = 0.28;

  toggle.addEventListener('click', async () => {
    if (!playing) {
      try {
        await audio.play();
        playing = true;
        player.classList.add('playing');
        toggle.setAttribute('aria-label', 'Pause ambient music');
        toggle.innerHTML = '<i class="fas fa-pause" aria-hidden="true"></i>';
      } catch (err) {
        console.warn('Audio playback failed (policy or file):', err.message);
      }
    } else {
      audio.pause();
      playing = false;
      player.classList.remove('playing');
      toggle.setAttribute('aria-label', 'Play ambient music');
      toggle.innerHTML = '<i class="fas fa-music" aria-hidden="true"></i>';
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   CONTACT FORM — Formspree
   ══════════════════════════════════════════════════════════════ */
function initContactForm() {
  const form      = qs('#contact-form');
  const submitBtn = qs('#form-submit');
  const statusEl  = qs('#form-status');
  if (!form || !submitBtn) return;

  const btnText    = qs('.btn__text', submitBtn);
  const btnLoading = qs('.btn__loading', submitBtn);

  // Validate a single field; returns true if valid
  function validateField(input) {
    const error    = input.nextElementSibling;
    const isEmpty  = !input.value.trim();
    const badEmail = input.type === 'email' && input.value &&
                     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);

    if (isEmpty) {
      if (error) error.textContent = 'This field is required.';
      input.style.borderColor = 'var(--crimson)';
      return false;
    }
    if (badEmail) {
      if (error) error.textContent = 'Please enter a valid email address.';
      input.style.borderColor = 'var(--crimson)';
      return false;
    }
    if (error) error.textContent = '';
    input.style.borderColor = '';
    return true;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all fields
    const inputs = qsa('input[required], textarea[required]', form);
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) return;

    // Loading state
    if (btnText)    btnText.hidden    = true;
    if (btnLoading) btnLoading.hidden = false;
    submitBtn.disabled = true;
    if (statusEl) { statusEl.textContent = ''; statusEl.className = 'form__status'; }

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        if (statusEl) {
          statusEl.textContent = '✓ Message sent — I\'ll get back to you soon!';
          statusEl.classList.add('success');
        }
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Server error');
      }
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = '✕ Couldn\'t send. Email me at umar.rahi.work@gmail.com';
        statusEl.classList.add('error');
      }
    } finally {
      if (btnText)    btnText.hidden    = false;
      if (btnLoading) btnLoading.hidden = true;
      submitBtn.disabled = false;
    }
  });

  // Clear error on input
  qsa('input, textarea', form).forEach(input => {
    input.addEventListener('input', () => {
      const error = input.nextElementSibling;
      if (error?.classList.contains('form__error')) {
        error.textContent = '';
        input.style.borderColor = '';
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   PARALLAX — hero bg text
   ══════════════════════════════════════════════════════════════ */
function initParallax() {
  if (!gsapReady || prefersReducedMotion) return;
  const bgWord = qs('.hero__bg-word');
  if (!bgWord) return;

  gsap.to(bgWord, {
    yPercent: 22,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 2,
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   MARQUEE — pause on hover
   ══════════════════════════════════════════════════════════════ */
function initMarquee() {
  const track = qs('.marquee__track');
  if (!track) return;
  track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
  track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
}

/* ══════════════════════════════════════════════════════════════
   MAGNETIC BUTTONS — subtle on desktop only
   ══════════════════════════════════════════════════════════════ */
function initMagneticButtons() {
  if (isTouch || prefersReducedMotion) return;

  qsa('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.22;
      const dy = (e.clientY - cy) * 0.22;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   SAFETY NET — ensure nothing stays invisible
   (guards against GSAP failure or very fast scrollers)
   ══════════════════════════════════════════════════════════════ */
function initVisibilityFallback() {
  window.addEventListener('load', () => {
    // If preloader somehow didn't finish after 5s, force-remove it
    setTimeout(() => {
      const preloader = qs('#preloader');
      if (preloader && preloader.style.display !== 'none') {
        preloader.style.opacity      = '0';
        preloader.style.pointerEvents = 'none';
        setTimeout(() => { if (preloader) preloader.remove(); }, 600);
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
      }
    }, 5500);

    // Force all visible after 7s as last-resort fallback
    setTimeout(() => {
      const hero = qs('.hero');
      if (hero && !hero.classList.contains('hero--revealed')) {
        hero.classList.add('hero--revealed');
        qs('.hero__bg-word')?.classList.add('hero--bg-revealed');
        qsa('.hero__ambient-blob').forEach(b => b.classList.add('hero--ambient-on'));
        runHeroCounters();
      }
      qsa('.reveal-up').forEach(el => {
        if (parseFloat(getComputedStyle(el).opacity) < 0.05) {
          el.style.opacity   = '1';
          el.style.transform = 'none';
        }
      });
    }, 7000);
  });
}

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();    // must run first — controls body.loaded state
  initCursor();
  initNavbar();
  initSmoothScroll();
  initBackToTop();
  initMusicPlayer();
  initContactForm();
  initMarquee();
  initMagneticButtons();
  initVisibilityFallback();

  // GSAP-dependent features
  if (gsapReady) {
    initScrollReveal();
    initCounters();
    initParallax();
  } else {
    // No GSAP — reveal everything immediately
    qsa('.reveal-up').forEach(el => {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    });
    qsa('.counter').forEach(el => {
      el.textContent = el.dataset.target || '0';
    });
  }

  initProjectFilters();
});

/* ══════════════════════════════════════════════════════════════
   ENHANCEMENTS v3
   Tech Logo · Verified Certs · Premium Animations
   ══════════════════════════════════════════════════════════════ */

/* ── Reading Progress Bar ──────────────────────────────────────── */
function initReadingProgress() {
  const bar = qs('#reading-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? Math.min(scrollTop / docHeight * 100, 100) : 0;
    bar.style.width  = pct + '%';
  }, { passive: true });
}

/* ── Timeline Animated Line Draw ──────────────────────────────── */
function initTimelineAnimation() {
  if (prefersReducedMotion) return;

  const timeline = qs('.timeline');
  if (!timeline) return;

  // Insert a fill element that grows as you scroll
  const fill = document.createElement('div');
  fill.className = 'timeline__line-fill';
  timeline.appendChild(fill);
  timeline.classList.add('animated');

  if (gsapReady) {
    gsap.to(fill, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: timeline,
        start: 'top 80%',
        end: 'bottom 80%',
        scrub: 1.2,
      }
    });
  } else {
    // Fallback: IntersectionObserver simple reveal
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fill.style.transition = 'height 1.8s ease-out';
        fill.style.height = '100%';
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(timeline);
  }
}

/* ── Skill Items Staggered Entrance ───────────────────────────── */
function initSkillStagger() {
  if (!gsapReady || prefersReducedMotion) return;

  qsa('.skills__category').forEach(cat => {
    const items = qsa('.skill__item', cat);

    ScrollTrigger.create({
      trigger: cat,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        items.forEach((item, i) => {
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: 'power2.out',
            delay: i * 0.06,
          });
        });
      }
    });
  });
}

/* ── Section Heading Char Split Reveal ────────────────────────── */
function initHeadingCharReveal() {
  if (!gsapReady || prefersReducedMotion) return;

  // DOM-safe text-node walker — never touches HTML attribute text
  function wrapTextNodes(node, result) {
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        // Split text into words and wrap each
        const words = child.textContent.split(/(\s+)/);
        words.forEach(part => {
          if (/\S/.test(part)) {
            const outer = document.createElement('span');
            outer.className = 'heading-char';
            const inner = document.createElement('span');
            inner.className = 'heading-char-inner';
            inner.textContent = part;
            outer.appendChild(inner);
            result.push(outer);
            child.parentNode.insertBefore(outer, child);
          } else if (part.length) {
            child.parentNode.insertBefore(document.createTextNode(part), child);
          }
        });
        child.parentNode.removeChild(child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrapTextNodes(child, result);
      }
    });
  }

  qsa('.section__heading').forEach(heading => {
    if (heading.dataset.split) return;
    heading.dataset.split = '1';

    const chars = [];
    wrapTextNodes(heading, chars);

    // collect .heading-char-inner spans after DOM mutation
    const innerChars = qsa('.heading-char-inner', heading);

    ScrollTrigger.create({
      trigger: heading,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        heading.style.opacity = '1';
        heading.style.transform = 'none';
        gsap.to(innerChars, {
          y: '0%',
          duration: 0.65,
          stagger: 0.045,
          ease: 'power3.out',
          clearProps: 'will-change'
        });
      }
    });
  });
}

/* ── Cert Card Staggered Scroll Reveal ────────────────────────── */
function initCertReveal() {
  if (!gsapReady || prefersReducedMotion) return;

  const grid = qs('.certs__grid');
  if (!grid) return;

  const cards = qsa('.cert__card', grid);
  cards.forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: (i % 4) * 0.1,   // stagger within each row of 4
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        once: true,
      },
      clearProps: 'will-change'
    });
  });
}

/* ── Hero Portrait float after heroReady ─────────────────────── */
function initPortraitEntrance() {
  const portrait = qs('.portrait__img');
  if (!portrait) return;

  document.addEventListener('heroReady', () => {
    if (prefersReducedMotion) return;
    if (gsapReady) {
      gsap.to(portrait, {
        y: -10,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1.2,
      });
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   HERO ENTRANCE — CSS-class-based staggered reveal
   Called by preloader onComplete (no monkey-patch)
   ══════════════════════════════════════════════════════════════ */
function animateHeroEntranceV3() {
  const hero = qs('.hero');
  if (!hero) return;

  // --- Reduced-motion: reveal everything instantly ---
  if (prefersReducedMotion) {
    hero.classList.add('hero--revealed');
    qs('.hero__bg-word')?.classList.add('hero--bg-revealed');
    qsa('.hero__ambient-blob').forEach(b => b.classList.add('hero--ambient-on'));
    // Show final counter values directly
    qsa('.hero .stat__num[data-target]').forEach(el => {
      el.textContent = el.dataset.target || '0';
    });
    document.dispatchEvent(new CustomEvent('heroReady'));
    return;
  }

  // --- Normal: CSS transitions handle the stagger via .hero--revealed ---
  // Small rAF delay to ensure layout is painted before transitions fire
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hero.classList.add('hero--revealed');

      // Reveal bg-word slightly later for layered feel
      setTimeout(() => {
        qs('.hero__bg-word')?.classList.add('hero--bg-revealed');
      }, 80);

      // Reveal ambient blobs
      setTimeout(() => {
        qsa('.hero__ambient-blob').forEach(b => b.classList.add('hero--ambient-on'));
      }, 200);

      // Start hero stat counters after the stagger cascade finishes
      // The last entrance element (--9) fires at 0.70s delay + ~0.7s transition = ~1.4s
      setTimeout(() => {
        runHeroCounters();
        document.dispatchEvent(new CustomEvent('heroReady'));
      }, 1400);
    });
  });
}

/* Run stat counters in the hero right panel — called exactly once */
function runHeroCounters() {
  qsa('.hero .stat__num[data-target]').forEach(counter => {
    // Guard: only animate if still showing "0" (not already animated)
    if (counter.dataset.counted) return;
    counter.dataset.counted = '1';

    const target = parseInt(counter.dataset.target, 10) || 0;
    const duration = 1400; // ms
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      counter.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        counter.textContent = target;
      }
    }

    requestAnimationFrame(step);
  });
}

/* ── Init all new features ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  initTimelineAnimation();
  initPortraitEntrance();

  if (gsapReady) {
    initHeadingCharReveal();
    initSkillStagger();
    initCertReveal();
  }
});
