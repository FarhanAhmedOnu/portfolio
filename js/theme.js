/**
 * Dark / light toggle. The initial theme is applied by a tiny inline
 * script in index.html so there's no flash of the wrong colour.
 */
const KEY = 'theme';
const root = document.documentElement;
const button = document.getElementById('theme-toggle');

function apply(theme) {
  root.setAttribute('data-theme', theme);
  try { localStorage.setItem(KEY, theme); } catch (e) {}
  if (button) button.setAttribute('aria-pressed', String(theme === 'dark'));
}

if (button) {
  button.setAttribute('aria-pressed', String(root.getAttribute('data-theme') === 'dark'));

  button.addEventListener('click', () => {
    apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
}