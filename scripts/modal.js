// ===== MODAL =====
let currentModalId = null;

function openModal(id) {
  const b = getBillboard(id);
  if (!b) return;
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
  document.getElementById('modal-tagline').textContent = '"' + b.tagline + '"';
  document.getElementById('modal-note').textContent = b.note;

  // Spots
  updateModalSpots(id);

  // Other sightings by same company
  renderModalOther(b);

  // Open overlay
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';

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

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  currentModalId = null;
}

async function spotFromModal() {
  if (currentModalId === null) return;
  if (hasSpotted(currentModalId)) return;
  const newCount = await addSpot(currentModalId);
  updateModalSpots(currentModalId);
  syncCardSpotCount(currentModalId, newCount);
}

// Close on overlay click (outside modal)
document.getElementById('modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// Close on Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});
