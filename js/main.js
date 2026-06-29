'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var header = document.getElementById('site-header');
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.getElementById('mobile-nav');
  var mobileClose = document.querySelector('.mobile-nav__close');
  var mobileLinks = document.querySelectorAll('.mobile-link');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function handleScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 44);
    var current = '';
    document.querySelectorAll('section[id]').forEach(function (section) {
      if (y >= section.offsetTop - 130) current = section.id;
    });
    document.querySelectorAll('.nav-link').forEach(function (link) {
      var href = (link.getAttribute('href') || '').replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }

  function openMenu() {
    if (!mobileNav || !hamburger) return;
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileNav || !hamburger) return;
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  mobileLinks.forEach(function (link) { link.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMenu(); });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
    });
  });

  var canvas = document.getElementById('hero-canvas');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var width = 0;
    var height = 0;
    var particles = [];
    var count = 92;

    function resizeCanvas() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    function makeParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.35,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.14,
        a: Math.random() * 0.5 + 0.18,
        p: Math.random() * Math.PI * 2
      };
    }

    function resetParticle(p) {
      var fresh = makeParticle();
      Object.assign(p, fresh);
    }

    function drawConnections() {
      var max = 116;
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < max) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(125, 216, 255, ' + ((1 - dist / max) * 0.075) + ')';
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      drawConnections();
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.p += 0.016;
        if (p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) resetParticle(p);
        var alpha = p.a * (0.7 + 0.3 * Math.sin(p.p));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(125, 216, 255, ' + alpha + ')';
        ctx.fill();
      });
      requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    for (var i = 0; i < count; i++) particles.push(makeParticle());
    animateParticles();
  }

  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right'));
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 90px 0px' });
    revealItems.forEach(function (item) { observer.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('in-view'); });
  }

  document.querySelectorAll('.service-card__toggle').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      var card = button.closest('.service-card');
      var expanded = card.classList.toggle('expanded');
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      button.innerHTML = expanded ? 'Read less <span aria-hidden="true">&uarr;</span>' : 'Read more <span aria-hidden="true">&darr;</span>';
    });
  });

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.hero-content .reveal-up').forEach(function (el, i) {
      gsap.fromTo(el, { opacity: 0, y: 38 }, { opacity: 1, y: 0, duration: 0.55, delay: 0.05 + i * 0.06, ease: 'power3.out' });
      el.classList.add('in-view');
    });

    gsap.to('.hero-path', {
      scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1.1 },
      y: -90,
      x: -40,
      opacity: 0.18,
      ease: 'none'
    });

    gsap.to('#hero-visual', {
      scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1.2 },
      y: -130,
      x: -70,
      rotate: -3,
      opacity: 0.28,
      ease: 'none'
    });

    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
      var speed = Number(el.getAttribute('data-speed') || 18);
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        y: -speed,
        ease: 'none'
      });
    });

  } else {
    document.querySelectorAll('.hero-content .reveal-up').forEach(function (el) { el.classList.add('in-view'); });
  }
});
