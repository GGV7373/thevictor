document.querySelectorAll('a.scroll-to').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href?.startsWith('/#')) return;
    const id = href.slice(2);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
