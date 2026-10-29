/**
 * Pure rendering layer. Takes plain objects (parsed from /data/*.json)
 * and writes markup into the containers defined in index.html.
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

const details = new Map();
export const detailHTML = (id) => details.get(id) || '';

function imageList(item) {
  return [].concat(item.images || item.image || [])
    .map((i) => (typeof i === 'string' ? { src: i } : i))
    .filter((i) => i && i.src);
}

function coverHTML(item) {
  const [img] = imageList(item);
  if (!img) return '';
  return `<img class="card-cover" src="${img.src}" alt="" loading="lazy" onerror="this.remove()">`;
}

function galleryHTML(item) {
  const imgs = imageList(item);
  if (!imgs.length) return '';
  return `<div class="gallery${imgs.length > 1 ? ' gallery-multi' : ''}">${imgs
    .map(
      (i) => `<figure>
        <img src="${i.src}" alt="${i.alt || item.title || ''}" loading="lazy" onerror="this.closest('figure').remove()">
        ${i.caption ? `<figcaption>${i.caption}</figcaption>` : ''}
      </figure>`
    )
    .join('')}</div>`;
}

const pubSections = (d) => ((d || {}).sections || []).filter((s) => (s.items || []).length);

function emptyState(message) {
  return `<p class="section-desc">${message}</p>`;
}

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

function pubCard(p, id) {
  const meta = [p.authors, p.venue].filter(Boolean).join(' · ');

  details.set(id, `
    <h2 class="detail-title" id="detail-title">${p.title}</h2>
    <p class="detail-meta">${[p.year, p.authors, p.venue].filter(Boolean).join(' · ')}</p>
    ${galleryHTML(p)}
    ${p.description ? `<p class="detail-desc">${p.description}</p>` : ''}
    ${tagsHTML(p.tags)}
    ${linksHTML(p.links)}`);

  return `
    <article class="card pub-card">
      <div class="pub-top">
        <h4 class="pub-title"><button type="button" class="card-open" data-open="${id}">${p.title}</button></h4>
        ${p.year ? `<span class="pub-year">${p.year}</span>` : ''}
      </div>
      ${meta ? `<p class="pub-meta">${meta}</p>` : ''}
      ${p.description ? `<p class="pub-desc">${p.description}</p>` : ''}
      <span class="card-hint" aria-hidden="true">View details</span>
    </article>`;
}

function renderPublications(data) {
  applySectionMeta('research', data);
  const wrap = document.getElementById('pub-list');
  if (!wrap || !data) return;

  const sections = pubSections(data);

  if (!sections.length) {
    wrap.innerHTML = emptyState('Publications will appear here.');
    return;
  }

  wrap.innerHTML = sections
    .map(
      (section, si) => `
        <div class="pub-group">
          <h3 class="group-title">
            ${section.label}
            <span class="count">${section.items.length}</span>
          </h3>
          ${section.items.map((p, i) => pubCard(p, `pub-${si}-${i}`)).join('')}
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
    .map((p, i) => {
      const id = `project-${i}`;
      details.set(id, `
        ${p.category ? `<p class="project-kicker">${p.category}</p>` : ''}
        <h2 class="detail-title" id="detail-title">${p.title}</h2>
        ${galleryHTML(p)}
        <p class="detail-desc">${p.description || ''}</p>
        ${p.highlight ? `<p class="project-note">${p.highlight}</p>` : ''}
        ${tagsHTML(p.tags)}
        ${linksHTML(p.links)}`);

      return `
        <article class="card project-card">
          ${coverHTML(p)}
          ${p.category ? `<p class="project-kicker">${p.category}</p>` : ''}
          <h3 class="project-title"><button type="button" class="card-open" data-open="${id}">${p.title}</button></h3>
          <p class="project-desc">${p.description || ''}</p>
          ${p.highlight ? `<p class="project-note">${p.highlight}</p>` : ''}
          ${tagsHTML((p.tags || []).slice(0, 4))}
          <span class="card-hint" aria-hidden="true">View details</span>
        </article>`;
    })
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
  applySectionMeta('references', data);
  const wrap = document.getElementById('ref-list');
  if (!wrap || !data) return;

  const items = data.items || [];
  if (!items.length) {
    wrap.innerHTML = emptyState('References will appear here.');
    return;
  }

  wrap.innerHTML = items
    .map((r) => {
      const links = [
        r.email ? `<a href="mailto:${r.email}">${r.email}</a>` : '',
        r.phone ? `<a href="tel:${String(r.phone).replace(/[^\d+]/g, '')}">${r.phone}</a>` : ''
      ].filter(Boolean).join('');
      return `
        <div class="card">
          <p class="ref-name">${r.name}</p>
          <p class="ref-role">${r.role}</p>
          ${links ? `<div class="ref-links">${links}</div>` : ''}
        </div>`;
    })
    .join('');
}

/* ---------- home quick links ---------- */

function renderTiles(d) {
  const wrap = document.getElementById('tiles');
  if (!wrap) return;

  const pubs = ((d.publications || {}).sections || []).reduce((n, s) => n + (s.items || []).length, 0);
  const count = (x) => ((x || {}).items || []).length;

  const tiles = [
    ['research',   'Research',   'Papers and publications', pubs],
    ['projects',   'Projects',   'Software and engineering work', count(d.projects)],
    ['education',  'Education',  'Degrees and results', count(d.education)],
    ['skills',     'Skills',     'Tools and technologies', ((d.skills || {}).groups || []).length],
    ['references', 'References', 'Academic references', count(d.references)]
  ];

  wrap.innerHTML = tiles
    .map(
      ([id, title, desc, n]) => `
        <a class="tile" href="#${id}">
          <span class="tile-top"><span class="tile-title">${title}</span>${n ? `<span class="tile-count">${n}</span>` : ''}</span>
          <span class="tile-desc">${desc}</span>
        </a>`
    )
    .join('');
}

/* ---------- home: selected publications ---------- */

const HOME_PUBS = 3;

function renderHomePubs(data) {
  const wrap = document.getElementById('home-pubs');
  if (!wrap) return;

  const all = pubSections(data.publications).flatMap((sec, si) =>
    sec.items.map((p, i) => ({ p, id: `pub-${si}-${i}` }))
  );
  if (!all.length) { wrap.hidden = true; return; }

  const picks = [...all.filter((x) => x.p.featured), ...all.filter((x) => !x.p.featured)]
    .slice(0, HOME_PUBS);

  wrap.innerHTML = `
    <div class="home-pubs-head">
      <h2 class="home-pubs-title">Selected publications</h2>
      ${all.length > picks.length ? `<a class="see-all" href="#research">See all ${all.length} publications</a>` : ''}
    </div>
    ${picks.map((x) => pubCard(x.p, x.id)).join('')}`;
}

/* ---------- entry point ---------- */

export function renderAll(data) {
  renderHero(data.profile);
  renderPublications(data.publications);
  renderProjects(data.projects);
  renderEducation(data.education);
  renderSkills(data.skills);
  renderReferences(data.references);
  renderTiles(data);
  renderHomePubs(data);
}