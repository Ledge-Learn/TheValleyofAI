// ===== MODAL =====
let currentModalId = null;
let _miniMap = null;
let _miniMarker = null;

// Pure DOM update — no history side-effects. Returns false if id is invalid.
function _applyModal(id) {
  const b = getBillboard(id);
  if (!b) return false;
  currentModalId = id;
  document.getElementById('modal').dataset.id = id;

  // Image
  const img = document.getElementById('modal-image');
  const creditEl = document.getElementById('modal-photo-credit');
  if (b.photo) {
    img.style.background = '';
    img.style.display = '';
    img.style.alignItems = '';
    img.style.justifyContent = '';
    img.innerHTML = `<img src="assets/images/billboards/${b.photo}" alt="${b.company} billboard" class="modal-photo-img">`;
    if (creditEl && b.photo_credit) {
      creditEl.style.display = 'block';
      creditEl.innerHTML = `<a href="${b.photo_credit_url}" target="_blank" rel="noopener">PHOTO: ${b.photo_credit} ↗</a>`;
    } else if (creditEl) {
      creditEl.style.display = 'none';
    }
  } else {
    img.style.background = b.gradient;
    img.style.display = 'flex';
    img.style.alignItems = 'center';
    img.style.justifyContent = 'center';
    img.innerHTML = `<span style="font-family:var(--font-serif);font-size:100px;font-weight:600;font-style:italic;color:rgba(255,255,255,0.15);user-select:none">${b.company.charAt(0)}</span>`;
    if (creditEl) creditEl.style.display = 'none';
  }

  document.getElementById('modal-loc-badge').textContent = b.location;
  document.getElementById('modal-category-tag').textContent = b.category;
  document.getElementById('modal-date-tag').textContent = b.date;
  document.getElementById('modal-company').textContent = b.company;
  document.getElementById('modal-location-line').textContent = b.location;
  document.getElementById('modal-tagline').textContent = '“' + b.tagline + '”';
  document.getElementById('modal-note').textContent = b.note;

  updateModalSpots(id);
  renderModalOther(b);
  initMiniMap(b);

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.title = b.company + ' · ' + b.location + ' — The Valley of AI';
  return true;
}

// Pure DOM close — no history side-effects.
function _closeModalUI() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  currentModalId = null;
  document.title = 'The Valley of AI';
}

// Public — opens modal and pushes a history entry.
function openModal(id) {
  if (!_applyModal(id)) return;
  history.pushState({ billboardId: id }, '', '/billboard/' + id);
}

// Public — closes modal and pushes back to root.
function closeModal() {
  _closeModalUI();
  history.pushState({}, '', '/');
}

// Back / forward navigation syncs UI to URL without touching history.
window.addEventListener('popstate', function (e) {
  if (e.state && e.state.billboardId) {
    _applyModal(e.state.billboardId);
  } else {
    _closeModalUI();
  }
});

function initMiniMap(b) {
  const el = document.getElementById('modal-mini-map');
  if (!el) return;

  const hasCoords = b.lat && b.lng;
  el.classList.toggle('hidden', !hasCoords);
  if (!hasCoords) return;

  const miniPinIcon = L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="26" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#F04E23" opacity="0.95"/>
      <circle cx="14" cy="14" r="5" fill="#0b0f1a"/>
      <circle cx="14" cy="14" r="2.5" fill="#F04E23"/>
    </svg>`,
    iconSize: [20, 26],
    iconAnchor: [10, 26],
  });

  if (_miniMap) {
    _miniMap.setView([b.lat, b.lng], 14);
    if (_miniMarker) _miniMarker.setLatLng([b.lat, b.lng]);
    setTimeout(() => _miniMap.invalidateSize(), 60);
    return;
  }

  _miniMap = L.map('modal-mini-map', {
    center: [b.lat, b.lng],
    zoom: 14,
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(_miniMap);

  _miniMarker = L.marker([b.lat, b.lng], { icon: miniPinIcon }).addTo(_miniMap);
  setTimeout(() => _miniMap.invalidateSize(), 60);
}

function renderModalOther(b) {
  const section = document.getElementById('modal-other-section');
  const scroll = document.getElementById('modal-other-scroll');
  if (!section || !scroll) return;

  const others = BILLBOARDS.filter(o => o.company === b.company && o.id !== b.id);
  if (others.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  scroll.innerHTML = '';
  others.forEach(o => {
    const card = document.createElement('div');
    card.className = 'modal-other-card';
    card.style.background = o.gradient;
    card.innerHTML = `
      <div class="modal-other-initial">${o.company.charAt(0)}</div>
      <div class="modal-other-info">
        <div class="modal-other-location">${o.location}</div>
        <div class="modal-other-date">${o.date}</div>
      </div>
    `;
    card.addEventListener('click', () => openModal(o.id));
    scroll.appendChild(card);
  });
}

function updateModalSpots(id) {
  const count = getSpots(id);
  const spotted = hasSpotted(id);
  const text = document.getElementById('modal-spots-text');
  const btn = document.getElementById('modal-spot-btn');
  const capNote = document.getElementById('modal-spot-cap');
  if (text) text.textContent = count + ' spots';
  if (btn) {
    if (spotted) {
      btn.textContent = '✓ Spotted';
      btn.classList.add('spotted', 'user-spotted');
    } else {
      btn.textContent = '▲ Spot This';
      btn.classList.remove('spotted', 'user-spotted');
    }
  }
  if (capNote) capNote.style.display = spotted ? 'block' : 'none';
}

// Close on overlay click (outside modal)
document.getElementById('modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// Close on Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

async function spotFromModal() {
  if (currentModalId === null) return;
  if (hasSpotted(currentModalId)) return;
  const newCount = await addSpot(currentModalId);
  updateModalSpots(currentModalId);
  syncCardSpotCount(currentModalId, newCount);
}
