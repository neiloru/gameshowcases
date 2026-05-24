window.onload = function () {

  loadData();
};

async function loadData() {
  // Derive the year from the folder name so this script stays generic
  const pathParts = window.location.pathname.split('/');
  const yearIndex = pathParts.findIndex(p => /^\d{4}$/.test(p));
  const year = yearIndex !== -1 ? pathParts[yearIndex] : '2026';

      document.getElementById('archive-title').textContent = year;

     // go up past archive/<year>/
  const res = await fetch(`../../data/${year}/showcases.json`);
  const data = await res.json();

  data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  const list = document.getElementById('showcases-list');

  for (const showcase of data) {
    const date = new Date(showcase.datetime);
    const duration = showcase.duration ? Number(showcase.duration) : 30;

    const item = document.createElement('div');
    item.className = 'showcase-item';

    // Thumbnail
    const thumb = document.createElement('div');
    thumb.className = 'thumbnail';
    thumb.style.backgroundImage = `url(../../${showcase.thumbnail})`;
    item.appendChild(thumb);

    // Info block
    const info = document.createElement('div');
    info.className = 'showcase-info';

    const name = document.createElement('span');
    name.className = 'showcase-name';
    name.textContent = showcase.name;
    info.appendChild(name);

    const dateRow = document.createElement('div');
    dateRow.className = 'showcase-date-row';

    const dateLabel = document.createElement('span');
    dateLabel.className = 'showcase-date';
    dateLabel.textContent = date.toLocaleString(undefined, {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    dateRow.appendChild(dateLabel);
    info.appendChild(dateRow);

    // Links
    if (showcase.links.length > 0) {
      const linksDiv = document.createElement('div');
      linksDiv.className = 'showcase-links';
      for (const link of showcase.links) {
        const a = document.createElement('a');
        a.className = 'showcase-link';
        a.href = link.link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = link.site + ' ↗';
        linksDiv.appendChild(a);
      }
      info.appendChild(linksDiv);
    }

    item.appendChild(info);
    list.appendChild(item);
  }

  function openEmbed(embedUrl, site, showcaseItem) {
    // Remove any existing embed in this item
    const existing = showcaseItem.querySelector('.archive-embed-wrapper');
    if (existing) {
      existing.remove();
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'archive-embed-wrapper';

    const iframe = document.createElement('iframe');
    iframe.className = 'player-iframe';

    if (site === 'YouTube') {
      iframe.src = embedUrl + '?autoplay=1&mute=1';
    } else if (site === 'Twitch') {
      iframe.src = embedUrl + '&autoplay=1&muted=1';
    } else {
      iframe.src = embedUrl;
    }

    iframe.allow = 'autoplay; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.frameBorder = '0';

    wrapper.appendChild(iframe);
    showcaseItem.appendChild(wrapper);
  }
}
