/**
 * Pure rendering layer. Takes plain objects (parsed from /data/*.json)
 * and writes markup into the containers defined in index.html.
 *
 * Field values are inserted as HTML — this is intentional, so you can
 * use <em>, <br> or <a> inside a description in the JSON files.
 */

/* ---------- helpers ---------- */

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '';
};

const extAttrs = (url) =>
  /^https?:/i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';

function tagsHTML(tags) {
  if (!tags || !tags.length) return '';
  return `<ul class="tags">${tags
    .map((t) => `<li class="tag">${t}</li>`)
    .join('')}</ul>`;
}

function linksHTML(links) {
  if (!links || !links.length) return '';
  return `<div class="card-links">${links
    .map(
      (l) =>
        `<a href="${l.url}"${extAttrs(l.url)}>${l.label} <span aria-hidden="true">&rarr;</span></a>`
    )
    .join('')}</div>`;
}

function emptyState(message) {
  return `<p class="section-desc">${message}</p>`;
}

/** Fills an <h2 data-bind="title"> / <p data-bind="description"> pair. */
function applySectionMeta(sectionId, data) {
  const section = document.getElementById(sectionId);
  if (!section || !data) return;

  const title = section.querySelector('[data-bind="title"]');
  const desc = section.querySelector('[data-bind="description"]');

  if (title && data.title) title.textContent = data.title;
  if (desc) desc.innerHTML = data.description || '';
}

/* ---------- hero ---------- */

function renderHero(profile) {
  if (!profile) return;

  if (profile.name) document.title = `${profile.name} — Portfolio`;

  setText('hero-eyebrow', profile.eyebrow);
  setText('hero-name', profile.name);
  setText('hero-role', profile.role);
  setText('hero-summary', profile.summary);

  const links = document.getElementById('hero-links');
  if (links) {
    links.innerHTML = (profile.links || [])
      .map(
        (l) => `<a class="chip" href="${l.url}"${extAttrs(l.url)}>${l.label}</a>`
      )
      .join('');
  }
}

/* ---------- publications ---------- */

function pubCard(p) {
  const meta = [p.authors, p.venue].filter(Boolean).join(' · ');

  return `
    <article class="card pub-card">
      <div class="pub-top">
        <h4 class="pub-title">${p.title}</h4>
        ${p.year ? `<span class="pub-year">${p.year}</span>` : ''}
      </div>
      ${meta ? `<p class="pub-meta">${meta}</p>` : ''}
      ${p.description ? `<p class="pub-desc">${p.description}</p>` : ''}
      ${tagsHTML(p.tags)}
      ${linksHTML(p.links)}
    </article>`;
}

function renderPublications(data) {
  applySectionMeta('research', data);
  const wrap = document.getElementById('pub-list');
  if (!wrap || !data) return;

  // Sections with no items are skipped entirely.
  const sections = (data.sections || []).filter((s) => (s.items || []).length);

  if (!sections.length) {
    wrap.innerHTML = emptyState('Publications will appear here.');
    return;
  }

  wrap.innerHTML = sections
    .map(
      (section) => `
        <div class="pub-group">
          <h3 class="group-title">
            ${section.label}
            <span class="count">${section.items.length}</span>
          </h3>
          ${section.items.map(pubCard).join('')}
        </div>`
    )
    .join('');
}

/* ---------- projects ---------- */

function renderProjects(data) {
  applySectionMeta('projects', data);
  const wrap = document.getElementById('project-list');
  if (!wrap || !data) return;

  const items = data.items || [];

  if (!items.length) {
    wrap.innerHTML = emptyState('Projects will appear here.');
    return;
  }

  wrap.innerHTML = items
    .map(
      (p) => `
        <article class="card project-card">
          ${p.category ? `<p class="project-kicker">${p.category}</p>` : ''}
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.description || ''}</p>
          ${p.highlight ? `<p class="project-note">${p.highlight}</p>` : ''}
          ${tagsHTML(p.tags)}
          ${linksHTML(p.links)}
        </article>`
    )
    .join('');
}

/* ---------- education ---------- */

function renderEducation(data) {
  applySectionMeta('education', data);
  const wrap = document.getElementById('edu-list');
  if (!wrap || !data) return;

  const items = data.items || [];

  if (!items.length) {
    wrap.innerHTML = emptyState('Education history will appear here.');
    return;
  }

  wrap.innerHTML = items
    .map((e) => {
      const meta = [e.period, e.result ? `<strong>${e.result}</strong>` : '']
        .filter(Boolean)
        .join('<br>');

      return `
        <div class="edu-item">
          <p class="edu-degree">${e.degree}</p>
          <p class="edu-school">${e.school}</p>
          <div class="edu-meta">${meta}</div>
        </div>`;
    })
    .join('');
}

/* ---------- skills ---------- */

function renderSkills(data) {
  applySectionMeta('skills', data);
  const wrap = document.getElementById('skill-list');
  if (!wrap || !data) return;

  wrap.innerHTML = (data.groups || [])
    .map(
      (g) => `
        <div class="card skill-card">
          <h3>${g.label}</h3>
          ${tagsHTML(g.items)}
        </div>`
    )
    .join('');
}

/* ---------- references ---------- */

function renderReferences(data) {
  applySectionMeta('contact', data);
  const wrap = document.getElementById('ref-list');
  if (!wrap || !data) return;

  wrap.innerHTML = (data.items || [])
    .map(
      (r) => `
        <div class="card">
          <p class="ref-name">${r.name}</p>
          <p class="ref-role">${r.role || ''}</p>
          <div class="ref-links">
            ${r.email ? `<a href="mailto:${r.email}">${r.email}</a>` : ''}
            ${r.phone ? `<a href="tel:${r.phone.replace(/\s/g, '')}">${r.phone}</a>` : ''}
          </div>
        </div>`
    )
    .join('');
}

/* ---------- entry point ---------- */

export function renderAll(data) {
  renderHero(data.profile);
  renderPublications(data.publications);
  renderProjects(data.projects);
  renderEducation(data.education);
  renderSkills(data.skills);
  renderReferences(data.references);
}