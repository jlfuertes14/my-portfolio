document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav');
  const navList = (nav && nav.querySelector('.nav-list')) || document.querySelector('.nav-list');
  const toggle = document.getElementById('navToggle');
  const header = document.getElementById('header');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const navLinks = navList ? navList.querySelectorAll('a') : [];

  // Intersection Observer for scroll animations
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
      else entry.target.classList.remove('in-view');
    });
  }, observerOptions);
  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

  // Parallax (safe)
  // Parallax removed as requested
  /*
  const heroVisual = document.querySelector('.hero-visual');
  const heroSection = document.querySelector('#home');
  if (heroVisual && heroSection) {
    let raf = null;
    window.addEventListener('scroll', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const heroTop = heroSection.offsetTop;
        const heroHeight = heroSection.offsetHeight;
        const windowCenter = window.innerHeight / 2;
        const scrollY = window.scrollY;
        if (scrollY + windowCenter >= heroTop && scrollY - windowCenter <= heroTop + heroHeight) {
          const distance = scrollY - heroTop + windowCenter;
          heroVisual.style.transform = `translateY(${distance * 0.18}px)`;
        } else {
          heroVisual.style.transform = '';
        }
      });
    }, { passive: true });
  }
  */

  /* ---------- CUSTOM CIRCLE CURSOR ---------- */
  // create only once
  let cursor = document.querySelector('.custom-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
  }

  // track pointer
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  const lerp = (a, b, t) => a + (b - a) * t;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // ensure visible
    cursor.style.display = '';
    // immediate jump to pointer to reduce perceived lag
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  document.addEventListener('mouseleave', () => { if (cursor) cursor.style.display = 'none'; });
  document.addEventListener('mouseenter', () => { if (cursor) cursor.style.display = ''; });

  // grow/shrink on interactive elements
  const clickableSelector = 'a, button, input, textarea, .card, .nav-list a, .social-link';
  const setClickableListeners = () => {
    document.querySelectorAll(clickableSelector).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  };
  setClickableListeners();

  // smooth animation loop (increase lerp to follow faster)
  const renderCursor = () => {
    cursorX = lerp(cursorX, mouseX, 0.5); // was 0.16 — higher = snappier
    cursorY = lerp(cursorY, mouseY, 0.5);
    if (cursor) {
      cursor.style.transform = `translate(${Math.round(cursorX)}px, ${Math.round(cursorY)}px) translate(-50%, -50%)`;
    }
    requestAnimationFrame(renderCursor);
  };
  requestAnimationFrame(renderCursor);
  /* ---------- end custom cursor ---------- */

  /* ---------- Active section highlight ---------- */
  const highlightActiveSection = () => {
    // Skip active section highlighting on resume page (preserve HTML-set active class)
    if (document.body.classList.contains('resume-body')) return;

    const sections = document.querySelectorAll('main section[id]');
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 200) current = section.getAttribute('id');
    });
    if (navLinks.length) {
      navLinks.forEach(link => link.classList.remove('active'));
      navLinks.forEach(link => { if (link.getAttribute('href') === '#' + current) link.classList.add('active'); });
    }
  };
  window.addEventListener('scroll', highlightActiveSection, { passive: true });
  highlightActiveSection();

  /* ---------- Mobile nav toggle ---------- */
  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navList.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------- Header scrolled state ---------- */
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Typed roles (kept intact if present) ---------- */
  const roles = [
    "Computer Engineer",
    "Electronics Hobbyist",
    "Software Developer",
    "Embedded System Enjoyer"
  ];
  const typedEl = document.getElementById('typed');
  const cursorEl = document.querySelector('.typed-cursor');
  if (typedEl) {
    let wordIndex = 0, charIndex = 0, deleting = false;
    const typeSpeed = 60, deleteSpeed = 40, holdDelay = 1400;
    const tick = () => {
      const current = roles[wordIndex % roles.length];
      if (!deleting) {
        typedEl.textContent = current.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) { deleting = true; setTimeout(tick, holdDelay); return; }
        setTimeout(tick, typeSpeed);
      } else {
        typedEl.textContent = current.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) { deleting = false; wordIndex++; setTimeout(tick, typeSpeed); return; }
        setTimeout(tick, deleteSpeed);
      }
    };
    setTimeout(() => { tick(); if (cursorEl) cursorEl.style.opacity = '1'; }, 400);
  }
});