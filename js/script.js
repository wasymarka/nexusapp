document.addEventListener('DOMContentLoaded', () => {
  // --- Basic Setup ---
  document.getElementById('year').textContent = new Date().getFullYear();

  // --- Cursor Glow Effect ---
  function setupCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;
    
    document.addEventListener('mousemove', (e) => {
      // Używamy translate, aby przesunąć środek poświaty na kursor
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
  }

  // --- Scroll Reveal ---
  function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));
  }

  // --- Tilt Effect ---
  function setupTiltEffect() {
    // Zastosuj efekt do wszystkich wrapperów
    const wrappers = document.querySelectorAll('.visual-wrapper');
    if (!wrappers.length) return;

    wrappers.forEach(wrapper => {
        const visual = wrapper.querySelector('.visual');
        if (!visual) return;

        wrapper.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = wrapper.getBoundingClientRect();
            const x = e.clientX - left - width / 2;
            const y = e.clientY - top - height / 2;
            const rotateX = (-y / (height / 2) * 5).toFixed(2);
            const rotateY = (x / (width / 2) * 8).toFixed(2);
            visual.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        wrapper.addEventListener('mouseleave', () => {
            visual.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });
  }

  // --- Initialize Effects ---
  setupCursorGlow();
  setupScrollReveal();
  if (window.matchMedia('(min-width: 1024px)').matches) {
    setupTiltEffect();
  }

  // --- Cookie Consent (GDPR) ---
  const CONSENT_COOKIE_NAME = 'cookie_consent';
  const CONSENT_ACCEPTED = 'accepted';
  const CONSENT_DECLINED = 'declined';

  function setCookie(name, value, days){
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name){
    const prefix = name + '=';
    const parts = document.cookie.split(';');
    for (let i = 0; i < parts.length; i++) {
      const c = parts[i].trim();
      if (c.startsWith(prefix)) {
        return decodeURIComponent(c.substring(prefix.length));
      }
    }
    return null;
  }

  function showCookieBanner(){
    const banner = document.getElementById('cookie-consent');
    if (banner) banner.style.display = 'block';
  }

  function hideCookieBanner(){
    const banner = document.getElementById('cookie-consent');
    if (banner) banner.style.display = 'none';
  }

  function handleCookieAccept(){
    setCookie(CONSENT_COOKIE_NAME, CONSENT_ACCEPTED, 365);
    hideCookieBanner();
  }

  function handleCookieDecline(){
    setCookie(CONSENT_COOKIE_NAME, CONSENT_DECLINED, 365);
    hideCookieBanner();
  }

  function initCookieConsent(){
    const banner = document.getElementById('cookie-consent');
    if (!banner) return;

    const consent = getCookie(CONSENT_COOKIE_NAME);
    if (consent === CONSENT_ACCEPTED || consent === CONSENT_DECLINED){
      hideCookieBanner();
      return;
    }

    // No decision yet: show banner
    showCookieBanner();

    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');

    if (acceptBtn) acceptBtn.addEventListener('click', handleCookieAccept);
    if (declineBtn) declineBtn.addEventListener('click', handleCookieDecline);
  }

  // Initialize cookie consent
  initCookieConsent();

  // ============================
  // Clerk + Convex Integration
  // ============================

  // Backend URL jest teraz opcjonalny: ustaw go przez
  //  - globalną zmienną window.CONVEX_URL, lub
  //  - parametr zapytania ?backend=local (ustawi domyślnie http://127.0.0.1:3210)
  const params = new URLSearchParams(location.search);
  const CONVEX_URL = window.CONVEX_URL || (params.get('backend') === 'local' ? 'http://127.0.0.1:3210' : null);

  // Referencja do CTA w nagłówku (prawa strona paska)
  function getHeaderCTA(){
    return document.querySelector('header.nav .auth-cta > a.btn');
  }
  function toggleHeaderCTA(visible){
    const el = getHeaderCTA();
    if (!el) return;
    el.style.display = visible ? '' : 'none';
  }

  // Simple status badge in header
  const authContainer = document.getElementById('app-auth');
  function setBackendStatus(connected){
    if (!authContainer) return;
    let badge = authContainer.querySelector('.backend-status');
    if (!badge){
      badge = document.createElement('span');
      badge.className = 'backend-status';
      badge.style.cssText = 'margin-left:8px; font-size:12px; color:#a9b3c7;';
      authContainer.appendChild(badge);
    }
    badge.textContent = connected ? 'Backend: online' : 'Backend: offline';
    badge.style.color = connected ? '#38e1ad' : '#ff6b8a';
  }

  async function checkConvexConnectivity(){
    // jeśli backend nie jest skonfigurowany, nie próbujemy żadnego połączenia
    if (!CONVEX_URL){
      setBackendStatus(false);
      return false;
    }
    try{
      // Use no-cors to avoid CORS failures; success means reachable
      await fetch(CONVEX_URL, { mode: 'no-cors' });
      setBackendStatus(true);
      return true;
    }catch(err){
      console.warn('Convex connectivity check failed:', err);
      setBackendStatus(false);
      return false;
    }
  }

  // Wait for Clerk global to be available
  function waitForClerk(){
    return new Promise((resolve) => {
      if (window.Clerk) return resolve(window.Clerk);
      const start = Date.now();
      const timer = setInterval(() => {
        if (window.Clerk){
          clearInterval(timer);
          resolve(window.Clerk);
        } else if (Date.now() - start > 10000){
          clearInterval(timer);
          console.error('Clerk failed to load within 10s');
          resolve(null);
        }
      }, 50);
    });
  }

  // Mount appropriate auth UI
  function mountAuthUI(){
    const portal = document.getElementById('auth-portal');
    if (!window.Clerk) return;

    // Clean containers before mounting
    if (authContainer) authContainer.innerHTML = '';
    if (portal) portal.innerHTML = '';

    if (Clerk.user){
      // Signed in: show UserButton i ukryj CTA w nagłówku
      toggleHeaderCTA(false);
      const mountPoint = document.createElement('div');
      mountPoint.id = 'user-button';
      if (authContainer) authContainer.appendChild(mountPoint);
      if (Clerk.mountUserButton){
        Clerk.mountUserButton(mountPoint);
      } else {
        // Fallback simple sign out link
        const btn = document.createElement('button');
        btn.className = 'btn ghost';
        btn.textContent = 'Wyloguj';
        btn.onclick = () => Clerk.signOut();
        authContainer && authContainer.appendChild(btn);
      }
    } else {
      // Signed out: pokaż CTA w nagłówku i przycisk zaloguj
      toggleHeaderCTA(true);
      const signInBtn = document.createElement('button');
      signInBtn.className = 'btn ghost';
      signInBtn.textContent = 'Zaloguj się';
      signInBtn.onclick = () => {
        if (Clerk.openSignIn){
          Clerk.openSignIn();
        } else if (Clerk.mountSignIn && portal){
          Clerk.mountSignIn(portal);
          portal.scrollIntoView({ behavior:'smooth', block:'center' });
        }
      };
      authContainer && authContainer.appendChild(signInBtn);

      // Do not auto-mount inline SignIn to avoid page scroll; open modal on demand only
      // if (Clerk.mountSignIn && portal){
      //   Clerk.mountSignIn(portal);
      // }
    }
  }

  // Initialize Convex client and forward Clerk token
  let convexClient = null;
  function initConvex(){
    // nie inicjalizujemy, jeśli backend nie jest skonfigurowany
    if (!CONVEX_URL) return;
    if (!window.convex || !window.convex.ConvexClient){
      console.error('Convex browser client not loaded');
      return;
    }
    convexClient = new window.convex.ConvexClient(CONVEX_URL);
    // Provide token from Clerk when available
    if (window.Clerk){
      convexClient.setAuth(async () => {
        try{
          // Prefer a JWT template named "convex" if configured; fallback to default
          const token = await Clerk.session?.getToken({ template: 'convex' }).catch(() => null)
                      || await Clerk.session?.getToken().catch(() => null);
          return token ?? null;
        }catch(e){
          console.warn('Failed to get Clerk token for Convex:', e);
          return null;
        }
      }, (isAuthenticated) => {
        console.log('[Convex] auth state changed:', isAuthenticated);
      });
    }
  }

  // Hook CTA to open sign-in if signed out
  function wireCTA(){
    const ctas = [
      ...document.querySelectorAll('a[href="#cta"]'),
      ...document.querySelectorAll('#cta .btn')
    ];
    if (!ctas.length) return;

    ctas.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (!window.Clerk) return;
        if (!Clerk.user){
          // prevent jump to #cta and open centered modal with dark overlay
          e.preventDefault();
          if (Clerk.openSignIn){
            Clerk.openSignIn();
          } else {
            const portal = document.getElementById('auth-portal');
            if (Clerk.mountSignIn && portal){
              portal.innerHTML = '';
              Clerk.mountSignIn(portal);
              portal.scrollIntoView({ behavior:'smooth', block:'center' });
            }
          }
        }
      });
    });
  }

  // Boot sequence
  (async () => {
    wireCTA();
    await checkConvexConnectivity();

    const clerk = await waitForClerk();
    if (!clerk){
      console.warn('Clerk SDK not available, skipping auth UI');
      return;
    }

    try{
      await window.Clerk.load();
    }catch(err){
      console.error('Failed to initialize Clerk:', err);
      return;
    }

    // Ustaw widoczność CTA na podstawie aktualnego stanu jeszcze przed pierwszym montażem
    toggleHeaderCTA(!Clerk.user);

    // React to auth changes
    Clerk.addListener?.((event) => {
      if (event?.type === 'auth:changed' || event?.type === 'user:loaded' || event?.type === 'session:changed'){
        mountAuthUI();
      }
    });

    mountAuthUI();
    initConvex();
  })();
});