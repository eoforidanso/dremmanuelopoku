/* Campaign site behaviour: mobile nav, scroll reveal, active section, pledge form.
   No dependencies, no analytics, no data leaves the visitor's device. */

// Where pledges are sent. Replace with the campaign's real inbox.
const CAMPAIGN_EMAIL = 'campaign@example.org';

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
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
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

  /* ── Current year in the footer ───────────────────────────────── */

  const yearEl = document.getElementById('year');
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
