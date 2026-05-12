interface CertificationItem {
  title: string;
  issuer?: string;
  date?: string;
  file?: string;
}

interface QualificationsData {
  cv?: { label: string; file: string };
  categories: { name: string; skills: string[] }[];
  certifications: CertificationItem[];
}

interface RawCertificationItem {
  title?: string;
  Title?: string;
  issuer?: string;
  Issuer?: string;
  date?: string;
  Date?: string;
  file?: string;
  File?: string;
}

function normalizeCertifications(items: RawCertificationItem[] = []): CertificationItem[] {
  return items
    .map(item => ({
      title: item.title || item.Title || '',
      issuer: item.issuer || item.Issuer || '',
      date: item.date || item.Date || '',
      file: item.file || item.File || ''
    }))
    .filter(item => item.title);
}

function createPreviewSection(section: HTMLDivElement, cert: CertificationItem) {
  const preview = document.createElement('div');
  preview.className = 'certification-preview';

  const header = document.createElement('div');
  header.className = 'certification-preview-header';

  const content = document.createElement('div');

  const kicker = document.createElement('span');
  kicker.className = 'certification-preview-kicker';
  kicker.textContent = 'PDF preview';
  content.appendChild(kicker);

  const title = document.createElement('h4');
  title.className = 'certification-preview-title';
  title.textContent = cert.title;
  content.appendChild(title);

  if (cert.issuer || cert.date) {
    const meta = document.createElement('p');
    meta.className = 'certification-preview-meta';
    meta.textContent = [cert.issuer, cert.date].filter(Boolean).join(' · ');
    content.appendChild(meta);
  }

  header.appendChild(content);

  if (cert.file) {
    const openLink = document.createElement('a');
    openLink.className = 'certification-link';
    openLink.href = cert.file;
    openLink.target = '_blank';
    openLink.rel = 'noopener noreferrer';
    openLink.textContent = 'Open PDF in new tab';
    header.appendChild(openLink);
  }

  preview.appendChild(header);

  const frame = document.createElement('div');
  frame.className = 'certification-preview-frame';

  const iframe = document.createElement('iframe');
  iframe.src = cert.file || '';
  iframe.title = `${cert.title} PDF preview`;
  iframe.loading = 'lazy';
  frame.appendChild(iframe);
  preview.appendChild(frame);

  const note = document.createElement('p');
  note.className = 'certification-preview-note';
  note.textContent = 'If the preview does not load in your browser, use the open button to view the PDF directly.';
  preview.appendChild(note);

  section.appendChild(preview);
}

async function loadQualifications() {
  let data: QualificationsData = { categories: [], certifications: [] };

  try {
    const res = await fetch('/data/qualifications.json');
    if (res.ok) {
      const rawData = (await res.json()) as {
        cv?: QualificationsData['cv'];
        categories?: QualificationsData['categories'];
        certifications?: RawCertificationItem[];
      };
      data = {
        cv: rawData.cv,
        categories: rawData.categories || [],
        certifications: normalizeCertifications(rawData.certifications)
      };
    }
  } catch {}

  const cvArea = document.getElementById('cv-download-area');
  if (cvArea && data.cv?.file) {
    const link = document.createElement('a');
    link.href = data.cv.file;
    link.className = 'btn';
    link.textContent = data.cv.label || 'Download CV';
    link.setAttribute('download', '');
    cvArea.appendChild(link);
  }

  const skillsList = document.getElementById('skills-list');
  if (skillsList) {
    data.categories.forEach(cat => {
      const group = document.createElement('div');
      group.className = 'skill-group';

      const heading = document.createElement('h3');
      heading.className = 'skill-category';
      heading.textContent = cat.name;
      group.appendChild(heading);

      const items = document.createElement('div');
      items.className = 'skill-items';
      cat.skills.forEach(skill => {
        const tag = document.createElement('a');
        tag.className = 'skill-tag';
        tag.textContent = skill;
        tag.href = `/projects?q=${encodeURIComponent(skill.toLowerCase())}`;
        tag.title = `See projects using ${skill}`;
        items.appendChild(tag);
      });
      group.appendChild(items);
      skillsList.appendChild(group);
    });
  }

  const certArea = document.getElementById('certifications-area');
  if (!certArea) return;

  const section = document.createElement('div');
  section.className = 'certifications-section';

  const heading = document.createElement('h3');
  heading.className = 'certifications-heading';
  heading.textContent = 'Certifications';
  section.appendChild(heading);

  if (!data.certifications || data.certifications.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'no-certifications';
    empty.textContent = 'No certifications added yet.';
    section.appendChild(empty);
  } else {
    const grid = document.createElement('div');
    grid.className = 'certifications-grid';

    const previewableCertifications = data.certifications.filter(cert => cert.file);
    let activeFile = previewableCertifications[0]?.file || '';

    const updatePreview = (selectedCert: CertificationItem) => {
      if (!selectedCert.file) return;

      activeFile = selectedCert.file;
      section.querySelector('.certification-preview')?.remove();
      createPreviewSection(section, selectedCert);

      grid.querySelectorAll('.certification-card').forEach(card => {
        card.classList.toggle('is-active', card.getAttribute('data-file') === activeFile);
      });

      grid.querySelectorAll('.certification-button').forEach(button => {
        button.classList.toggle('is-active', button.getAttribute('data-file') === activeFile);
      });
    };

    data.certifications.forEach(cert => {
      const card = document.createElement('div');
      card.className = 'certification-card';
      if (cert.file) {
        card.setAttribute('data-file', cert.file);
      }

      const badge = document.createElement('span');
      badge.className = 'certification-badge';
      badge.textContent = 'Certificate';
      card.appendChild(badge);

      const title = document.createElement('p');
      title.className = 'certification-title';
      title.textContent = cert.title;
      card.appendChild(title);

      if (cert.issuer || cert.date) {
        const meta = document.createElement('p');
        meta.className = 'certification-meta';
        meta.textContent = [cert.issuer, cert.date].filter(Boolean).join(' · ');
        card.appendChild(meta);
      }

      if (cert.file) {
        const actions = document.createElement('div');
        actions.className = 'certification-actions';

        const button = document.createElement('button');
        button.className = 'certification-button';
        button.type = 'button';
        button.textContent = 'Preview on page';
        button.setAttribute('data-file', cert.file);
        button.addEventListener('click', () => updatePreview(cert));
        actions.appendChild(button);

        const link = document.createElement('a');
        link.className = 'certification-link';
        link.href = cert.file;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Open PDF';
        actions.appendChild(link);

        card.appendChild(actions);
      }

      grid.appendChild(card);
    });

    section.appendChild(grid);

    if (previewableCertifications.length > 0) {
      updatePreview(previewableCertifications[0]);
    }
  }

  certArea.appendChild(section);
}

document.addEventListener('DOMContentLoaded', loadQualifications);
