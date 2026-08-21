/* Campaign site behaviour: mobile nav, scroll reveal, active section, pledge form.
   No dependencies, no analytics, no data leaves the visitor's device. */

// Where pledges are sent. Replace with the campaign's real inbox.
const CAMPAIGN_EMAIL = 'Opokboath@gmail.com';

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  /* ── Mobile menu ──────────────────────────────────────────────── */

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── Sticky nav shading ───────────────────────────────────────── */

  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Scroll reveal ────────────────────────────────────────────── */

  const revealables = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        // Section titles draw their gold rule on arrival. Two of them sit
        // inside a revealed block rather than carrying .reveal themselves,
        // so the class is passed down instead of duplicated in the markup.
        entry.target.querySelectorAll('h2').forEach((h) => h.classList.add('is-visible'));
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
    document.querySelectorAll('.section h2').forEach((h) => h.classList.add('is-visible'));
  }

  /* ── Photographs that never arrived ───────────────────────────── */

  /* A fast scroll can leave a lazily loaded photograph's request cancelled,
     and the browser does not ask again on its own — the card is left blank
     with only its caption. So ask once more: when the request fails, and
     when a card has been on screen a while with nothing in it. */

  const photos = [...document.querySelectorAll('.shot img')];

  const askAgain = (img) => {
    if (img.dataset.retried) return;
    img.dataset.retried = 'true';
    const { src } = img;
    img.removeAttribute('src');
    img.src = src;
  };

  photos.forEach((img) => img.addEventListener('error', () => askAgain(img)));

  if ('IntersectionObserver' in window) {
    const pio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        pio.unobserve(img);
        // Long enough that a photograph still arriving over a slow
        // connection is left alone; short enough to fix a blank card
        // before the reader has scrolled past it.
        setTimeout(() => {
          if (!img.complete || img.naturalWidth === 0) askAgain(img);
        }, 6000);
      });
    }, { rootMargin: '200px 0px' });

    photos.forEach((img) => pio.observe(img));
  }

  /* ── Subtle parallax on the hero crest ────────────────────────── */

  /* The crest drifts at a fraction of the scroll speed while the hero is
     still on screen. Reads as depth rather than movement; anyone who has
     asked for less motion gets none of it. */
  const crest = document.querySelector('.hero .crest');
  const calmer = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (crest && !calmer.matches) {
    const LIMIT = 26;
    let ticking = false;

    const place = () => {
      ticking = false;
      const y = window.scrollY;
      if (y > window.innerHeight) return;
      const shift = Math.min(y * 0.14, LIMIT);
      crest.style.setProperty('--crest-shift', `${shift.toFixed(1)}px`);
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(place);
    }, { passive: true });

    place();
  }

  /* ── Banner video ─────────────────────────────────────────────── */

  /* It is decoration, so it should never fight the reader: paused outright
     for reduced motion, and paused while off screen so it costs nothing to
     scroll past. */
  const banner = document.getElementById('bannerVideo');

  if (banner) {
    if (calmer.matches) {
      banner.removeAttribute('autoplay');
      banner.pause();
    } else if ('IntersectionObserver' in window) {
      const bio = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const p = banner.play();
            if (p && p.catch) p.catch(() => {});
          } else {
            banner.pause();
          }
        });
      }, { threshold: 0.15 });
      bio.observe(banner);
    }
  }

  /* ── Highlight the section you're reading ─────────────────────── */

  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((section) => spy.observe(section));
  }

  /* ── Pillar letters: tabs ─────────────────────────────────────── */

  /* Standard tab pattern: one tab in the tab order, arrows move between the
     rest. Without JavaScript every panel but the first stays hidden, so the
     markup keeps the overview letter visible on its own. */

  const tabWrap = document.getElementById('pillarTabs');

  if (tabWrap) {
    const tabs = [...tabWrap.querySelectorAll('[role="tab"]')];
    const rail = tabWrap.querySelector('.tabrail');

    const show = (tab, { focus = true } = {}) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (!panel) return;
        panel.hidden = !on;
        panel.classList.toggle('is-active', on);
      });

      // On a narrow screen the track scrolls, so the chosen tab is brought
      // into the track rather than left off the side of it.
      if (rail && rail.scrollWidth > rail.clientWidth) {
        const move = tab.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2;
        rail.scrollTo({ left: move, behavior: calmer.matches ? 'auto' : 'smooth' });
      }

      if (focus) tab.focus();
    };

    tabWrap.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) show(tab);
    });

    tabWrap.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i === -1) return;

      const to = {
        ArrowRight: i + 1,
        ArrowLeft: i - 1,
        Home: 0,
        End: tabs.length - 1,
      }[e.key];

      if (to === undefined) return;
      e.preventDefault();
      show(tabs[(to + tabs.length) % tabs.length]);
    });

    /* The overview's list of pillars, and the "read next" card at the foot of
       every letter, open a tab from inside the panel. The track is left at the
       top of the view so the reader starts the new letter at its first line. */
    tabWrap.addEventListener('click', (e) => {
      const jump = e.target.closest('[data-goto]');
      if (!jump) return;
      const tab = document.getElementById(jump.dataset.goto);
      if (!tab || !tabs.includes(tab)) return;

      show(tab, { focus: false });

      const top = tabWrap.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: calmer.matches ? 'auto' : 'smooth' });
      tab.focus({ preventScroll: true });
    });

    // A link straight to a pillar — #pillar-growth and the like — opens that
    // letter instead of the overview.
    const fromHash = () => {
      const id = window.location.hash.replace('#pillar-', '');
      const tab = id && document.getElementById(`tab-${id}`);
      if (tab && tabs.includes(tab)) show(tab, { focus: false });
    };

    fromHash();
    window.addEventListener('hashchange', fromHash);

    // On a narrow screen the track is scrolled, so whichever letter is open
    // starts with its tab in view rather than off the side.
    const centreActive = () => {
      const tab = tabs.find((t) => t.classList.contains('is-active'));
      if (!rail || !tab || rail.scrollWidth <= rail.clientWidth) return;
      rail.scrollLeft = tab.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2;
    };

    centreActive();
    window.addEventListener('resize', centreActive);
  }

  /* ── Current year in the footer ───────────────────────────────── */

  const yearEl = document.getElementById('copyrightYear');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ── Pledge form → the visitor's own email client ─────────────── */

  const form = document.getElementById('pledgeForm');
  const note = document.getElementById('formNote');
  if (!form || !note) return;

  const defaultNote = note.textContent;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const value = (key) => String(data.get(key) || '').trim();

    const name = value('name');
    const email = value('email');
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    form.name.setAttribute('aria-invalid', String(!name));
    form.email.setAttribute('aria-invalid', String(!emailLooksValid));

    if (!name || !emailLooksValid) {
      note.textContent = 'Please add your name and a valid email address.';
      note.className = 'form-note is-error';
      (!name ? form.name : form.email).focus();
      return;
    }

    const intents = data.getAll('intent');
    const body = [
      `Name: ${name}`,
      `Year group: ${value('year') || '—'}`,
      `Email: ${email}`,
      `Chapter / city: ${value('chapter') || '—'}`,
      `I want to: ${intents.length ? intents.join(', ') : '—'}`,
      '',
      'Message:',
      value('message') || '—',
    ].join('\n');

    const href = `mailto:${CAMPAIGN_EMAIL}`
      + `?subject=${encodeURIComponent(`Pledge of support — ${name}`)}`
      + `&body=${encodeURIComponent(body)}`;

    window.location.href = href;

    note.textContent = 'Your email app should now be open with the message ready to send.';
    note.className = 'form-note is-ok';

    window.setTimeout(() => {
      note.textContent = defaultNote;
      note.className = 'form-note';
    }, 12000);
  });
});
