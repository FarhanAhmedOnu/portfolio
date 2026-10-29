/**
 * Bootstraps the portfolio: loads every JSON file, then hands the
 * combined object to the renderer.
 *
 * To add a new data file, add one line to DATA below and one
 * matching render call in render.js → renderAll().
 */
import { renderAll } from './render.js';

const DATA = {
  profile:    'data/profile.json',
  publications: 'data/publications.json',
  projects:   'data/projects.json',
  education:  'data/education.json',
  skills:     'data/skills.json',
  references: 'data/references.json'
};

async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${path} — HTTP ${res.status} ${res.statusText}`);
  try {
    return await res.json();
  } catch (err) {
    throw new Error(`${path} — invalid JSON (${err.message})`);
  }
}

function showError(err) {
  const box = document.getElementById('load-error');
  if (!box) return;

  const isFileProtocol = location.protocol === 'file:';
  const hint = isFileProtocol
    ? `<br><br><strong>You're opening this page directly from disk.</strong>
       Browsers block <code>fetch()</code> on <code>file://</code>. Run a local server instead:<br>
       <code>python3 -m http.server 8000</code> — then open
       <code>http://localhost:8000</code>.`
    : `<br><br>Check that the file exists at the given path and contains valid JSON.`;

  box.innerHTML = `<strong>Could not load portfolio data.</strong><br>${err.message}${hint}`;
  box.hidden = false;
  console.error('[portfolio]', err);
}

async function init() {
  try {
    const entries = await Promise.all(
      Object.entries(DATA).map(async ([key, path]) => [key, await loadJSON(path)])
    );
    renderAll(Object.fromEntries(entries));
  } catch (err) {
    showError(err);
  } finally {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }
}

init();