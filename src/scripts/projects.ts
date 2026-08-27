export {};

interface Project {
  title: string;
  desc: string;
  tags?: string[];
  link?: string;
  linkText: string;
}

declare global {
  interface Window {
    __PROJECTS_DATA__?: Project[];
    __PROJECTS_INITIALIZED__?: boolean;
  }
}

function labelFromTag(tag: string) {
  const labels: Record<string, string> = {
    llm: 'LLM',
    'html-css': 'HTML & CSS',
    'team-collaboration': 'Collaboration',
    cloudflare: 'Cloudflare',
    automation: 'Automation',
  };
  if (labels[tag]) return labels[tag];
  return tag
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function kindOf(project: Project) {
  return (project.tags || []).includes('team-collaboration') ? 'Collaboration' : 'Project';
}

function stackOf(project: Project) {
  return (project.tags || [])
    .filter(t => t !== 'team-collaboration')
    .map(labelFromTag)
    .join(' · ');
}

function buildCard(project: Project): HTMLElement {
  const card = document.createElement('a');
  card.className = 'project-card';
  card.href = project.link || '#';
  card.setAttribute('data-project-title', project.title.toLowerCase());
  card.setAttribute('data-project-tags', (project.tags || []).join(' ').toLowerCase());
  if (project.link && !project.link.startsWith('#')) {
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
  }

  const label = document.createElement('span');
  label.className = 'project-card-label';
  label.textContent = kindOf(project);
  card.appendChild(label);

  const title = document.createElement('span');
  title.className = 'project-title';
  title.textContent = project.title;
  card.appendChild(title);

  const desc = document.createElement('span');
  desc.className = 'project-desc';
  desc.textContent = project.desc;
  card.appendChild(desc);

  const stack = stackOf(project);
  if (stack) {
    const stackEl = document.createElement('span');
    stackEl.className = 'project-stack';
    stackEl.textContent = stack;
    card.appendChild(stackEl);
  }

  const link = document.createElement('span');
  link.className = 'project-link';
  link.textContent = project.linkText + ' →';
  card.appendChild(link);

  return card;
}

let allProjects: Project[] = [];
let activeQuery = '';
let activeTag = '';

function matches(p: Project) {
  const q = activeQuery.toLowerCase().trim();
  const queryOk =
    !q ||
    p.title.toLowerCase().includes(q) ||
    p.desc.toLowerCase().includes(q) ||
    (p.tags || []).some(t => t.includes(q));
  const tagOk = !activeTag || (p.tags || []).includes(activeTag);
  return queryOk && tagOk;
}

function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const filtered = allProjects.filter(matches);
  grid.innerHTML = '';

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'section-text';
    empty.textContent = 'No projects match your search.';
    grid.appendChild(empty);
    return;
  }

  filtered.forEach(p => grid.appendChild(buildCard(p)));
}

function renderFilters() {
  const wrap = document.getElementById('project-filters');
  if (!wrap) return;

  const tagCounts = new Map<string, number>();
  allProjects.forEach(p => {
    (p.tags || []).forEach(t => tagCounts.set(t, (tagCounts.get(t) || 0) + 1));
  });
  const tags = [...tagCounts.keys()].sort((a, b) => (tagCounts.get(b)! - tagCounts.get(a)!) || a.localeCompare(b));

  wrap.innerHTML = '';

  const makeChip = (label: string, tag: string) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'project-filter-chip';
    chip.textContent = label;
    chip.setAttribute('aria-pressed', String(activeTag === tag));
    chip.addEventListener('click', () => {
      activeTag = activeTag === tag ? '' : tag;
      renderFilters();
      renderProjects();
    });
    return chip;
  };

  wrap.appendChild(makeChip(`All ${allProjects.length}`, ''));
  tags.forEach(t => wrap.appendChild(makeChip(labelFromTag(t), t)));
}

async function loadAllProjects() {
  if (window.__PROJECTS_DATA__?.length) {
    allProjects = window.__PROJECTS_DATA__;
  } else {
    try {
      const response = await fetch('/data/projects.json');
      if (!response.ok) throw new Error('Failed to load projects');
      const data = (await response.json()) as { projects: Project[] };
      allProjects = data.projects;
    } catch {
      allProjects = [];
    }
  }

  const searchInput = document.getElementById('projects-search-input') as HTMLInputElement | null;
  const urlQ = new URLSearchParams(window.location.search).get('q');
  if (urlQ) {
    activeQuery = urlQ;
    if (searchInput) searchInput.value = urlQ;
  }

  renderFilters();
  renderProjects();

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      activeQuery = searchInput.value;
      renderProjects();
    });
  }
}

function initProjects() {
  if (window.__PROJECTS_INITIALIZED__) return;
  window.__PROJECTS_INITIALIZED__ = true;
  void loadAllProjects();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjects, { once: true });
} else {
  initProjects();
}

document.addEventListener('astro:page-load', initProjects);
