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
    'team-collaboration': 'Team Collaboration',
    cloudflare: 'Cloud Services',
    automation: 'Automation',
  };
  if (labels[tag]) return labels[tag];
  return tag
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildCard(project: Project, isMain: boolean): HTMLElement {
  const card = document.createElement('article');
  card.className = isMain ? 'project-card project-card-main' : 'project-card';
  card.setAttribute('data-project-title', project.title.toLowerCase());
  card.setAttribute('data-project-tags', (project.tags || []).join(' ').toLowerCase());

  if (!isMain) {
    const label = document.createElement('p');
    label.className = 'project-card-label';
    label.textContent = (project.tags || []).includes('team-collaboration') ? 'Collaboration' : 'Project';
    card.appendChild(label);
  }

  const title = document.createElement('h3');
  title.className = 'project-title';
  title.textContent = project.title;
  card.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'project-desc';
  desc.textContent = project.desc;
  card.appendChild(desc);

  if (project.tags?.length) {
    const tags = document.createElement('div');
    tags.className = 'project-tags';
    project.tags.forEach((tag: string) => {
      const pill = document.createElement('span');
      pill.className = 'skill-tag';
      pill.textContent = labelFromTag(tag);
      tags.appendChild(pill);
    });
    card.appendChild(tags);
  }

  const link = document.createElement('a');
  link.className = 'project-link';
  link.href = project.link || '#';
  link.textContent = project.linkText + ' →';
  if (project.link && !project.link.startsWith('#')) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  card.appendChild(link);

  return card;
}

let allProjects: Project[] = [];

function renderProjects(query: string = '') {
  const mainContainer = document.getElementById('main-project-container');
  const grid = document.querySelector('[data-projects-grid]') as HTMLElement;
  const sideContainer = document.getElementById('side-projects-container');
  if (!mainContainer || !grid || !sideContainer) return;

  const q = query.toLowerCase().trim();
  const filtered = q
    ? allProjects.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.includes(q))
      )
    : allProjects;

  mainContainer.innerHTML = '';
  grid.innerHTML = '';

  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'section-text';
    empty.textContent = 'No projects match your search.';
    mainContainer.appendChild(empty);
    sideContainer.style.display = 'none';
    return;
  }

  sideContainer.style.display = '';

  const [main, ...rest] = filtered;
  mainContainer.appendChild(buildCard(main, true));

  if (rest.length === 0) {
    sideContainer.style.display = 'none';
  } else {
    sideContainer.style.display = '';
    rest.forEach(p => grid.appendChild(buildCard(p, false)));
  }
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

  renderProjects();

  const searchInput = document.getElementById('projects-search-input') as HTMLInputElement | null;
  if (searchInput) {
    const urlQ = new URLSearchParams(window.location.search).get('q');
    if (urlQ) {
      searchInput.value = urlQ;
      renderProjects(urlQ);
    }
    searchInput.addEventListener('input', () => renderProjects(searchInput.value));
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
