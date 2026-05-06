// ===== LEAFLET MAP =====
dataReady.then(function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  const map = L.map('map', {
    center: [37.68, -122.34],
    zoom: 10,
    scrollWheelZoom: false,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);

  map.scrollWheelZoom.disable();

  setTimeout(() => map.invalidateSize(), 300);
  window.addEventListener('resize', () => map.invalidateSize());

  // Custom SVG pin factory
  function makePin(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${color}" opacity="0.95"/>
      <circle cx="14" cy="14" r="5" fill="#0b0f1a"/>
      <circle cx="14" cy="14" r="2.5" fill="${color}"/>
    </svg>`;
    return L.divIcon({
      className: 'custom-marker',
      html: svg,
      iconSize: [28, 36],
      iconAnchor: [14, 36],
      popupAnchor: [0, -38]
    });
  }

  const markers = {};

  BILLBOARDS.forEach(b => {
    if (!b.lat || !b.lng) return;

    const marker = L.marker([b.lat, b.lng], { icon: makePin(b.pinColor) });

    const popupHtml = `
      <div class="map-popup">
        <div class="popup-company">${b.company}</div>
        <div class="popup-location">${b.location}</div>
        <div class="popup-tagline">"${b.tagline}"</div>
        <div class="popup-buzz">
          <span class="popup-buzz-label">BUZZWORD</span>
          <div class="popup-buzz-track"><div class="popup-buzz-fill" style="width:${(b.buzzword / 10) * 100}%"></div></div>
          <span class="popup-buzz-val">${b.buzzword.toFixed(1)}</span>
        </div>
        <button class="popup-open-btn" onclick="openModal('${b.id}'); this.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button').click()">View Full Detail →</button>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      maxWidth: 260,
      minWidth: 220,
      closeButton: true,
      autoPan: true,
    });

    marker.on('click', () => {
      highlightSidebarItem(b.id);
    });

    marker.addTo(map);
    markers[b.id] = marker;
  });

  // Sidebar
  buildSidebar(map, markers);

  // Update verified locations count
  const verifiedCount = BILLBOARDS.filter(b => b.lat && b.lng).length;
  const countEl = document.getElementById('sidebar-count');
  if (countEl) countEl.textContent = verifiedCount + ' verified locations';

  // Expose globally so sidebar clicks can fly to marker
  window._mapRef = map;
  window._markersRef = markers;
})();

function buildSidebar(map, markers) {
  const list = document.getElementById('sidebar-list');
  if (!list) return;

  BILLBOARDS.forEach(b => {
    const item = document.createElement('div');
    item.className = 'sidebar-item';
    item.id = 'sidebar-item-' + b.id;
    item.innerHTML = `
      <div class="sidebar-company">${b.company}</div>
      <div class="sidebar-location">${b.location}</div>
    `;

    item.addEventListener('click', () => {
      const marker = markers[b.id];
      if (!marker) return;
      map.setView([b.lat, b.lng], 13, { animate: true, duration: 0.5 });
      setTimeout(() => marker.openPopup(), 400);
      highlightSidebarItem(b.id);
    });

    list.appendChild(item);
  });
}

function highlightSidebarItem(id) {
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  const item = document.getElementById('sidebar-item-' + id);
  if (item) {
    item.classList.add('active');
    item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}
