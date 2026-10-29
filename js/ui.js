/**
 * Page behaviour: hash-based views (home + one section at a time)
 * and the details dialog for publications / projects.
 */
import { detailHTML } from './render.js';

/* ---------- views ---------- */
const views = [...document.querySelectorAll('[data-view]')];
const links = [...document.querySelectorAll('.nav a[href^="#"]')];

function route() {
  const id = location.hash.slice(1) || 'home';
  const view = views.find((v) => v.id === id);
  if (!view) return;                       // e.g. #top or #main: leave as is
  views.forEach((v) => (v.hidden = v !== view));
  links.forEach((a) =>
    a.getAttribute('href') === `#${id}`
      ? a.setAttribute('aria-current', 'true')
      : a.removeAttribute('aria-current')
  );
  window.scrollTo(0, 0);
  const heading = view.querySelector('h1, h2');
  if (heading) heading.focus({ preventScroll: true });
}
window.addEventListener('hashchange', route);
route();

/* ---------- details dialog ---------- */
const dlg = document.getElementById('detail');
const body = document.getElementById('detail-body');

document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-open]');
  if (open && dlg) {
    body.innerHTML = detailHTML(open.dataset.open);
    dlg.showModal();
    dlg.scrollTop = 0;
    return;
  }
  if (e.target.closest('[data-close]') || e.target === dlg) dlg.close();
});