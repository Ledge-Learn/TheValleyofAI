// ===== PROGRESS BAR =====
(function () {
  const bar = document.getElementById('progress-bar');
  document.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  }, { passive: true });
})();

// ===== MOBILE NAV =====
function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
}

document.getElementById('mobile-menu-toggle').addEventListener('click', function () {
  document.getElementById('mobile-menu').classList.toggle('open');
});

// ===== STAT COUNT-UP =====
function animateCountUp(el) {
  const target = parseFloat(el.dataset.target);
  const decimal = parseInt(el.dataset.decimal || '0');
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = eased * target;
    const formatted = decimal === 0
      ? Math.round(value).toLocaleString()
      : value.toFixed(decimal);
    el.textContent = prefix + formatted + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Trigger stats when hero is in view
(function () {
  const stats = document.querySelectorAll('.stat-number[data-target]');
  let done = false;
  const obs = new IntersectionObserver(entries => {
    if (done) return;
    if (entries.some(e => e.isIntersecting)) {
      done = true;
      stats.forEach(el => animateCountUp(el));
    }
  }, { threshold: 0.3 });
  stats.forEach(el => obs.observe(el));
})();

// ===== SCROLL REVEAL =====
(function () {
  const els = document.querySelectorAll('.scroll-reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
})();

// ===== RENDER GALLERY =====
let currentFilter = 'all';
let currentCompanyFilter = 'all';

function buildCard(b) {
  const spotCount = getSpots(b.id);
  const alreadySpotted = hasSpotted(b.id);

  const card = document.createElement('div');
  card.className = 'bill-card scroll-reveal';
  card.dataset.id = b.id;
  card.dataset.tags = b.tags.join(',');

  const creditBadge = (b.photo && b.photo_credit)
    ? `<span class="card-photo-credit">PHOTO: ${b.photo_credit}</span>`
    : '';
  const photoHtml = b.photo
    ? `<img class="card-photo-img" src="assets/images/billboards/${b.photo}" alt="${b.company} billboard" loading="lazy">${creditBadge}`
    : `<div class="card-photo-bg card-photo-pending" style="pointer-events:none">
        <div class="card-pending-frame">
          <span class="card-pending-label">Photo Pending</span>
          <span class="card-pending-sub">Spotted but not yet captured</span>
        </div>
      </div>`;

  card.innerHTML = `
    <div class="card-photo" style="pointer-events:none">
      ${photoHtml}
      <span class="card-loc-badge">${b.location}</span>
    </div>
    <div class="card-body">
      <div class="card-head">
        <div class="card-company">${b.company}</div>
        <div class="card-date">${b.date.toUpperCase()}</div>
      </div>
      <div class="card-tagline">"${b.tagline}"</div>
    </div>
    <div class="card-footer">
      <span class="card-spot-count" id="card-spot-count-${b.id}">${spotCount} spot${spotCount !== 1 ? 's' : ''}</span>
      <span class="card-view-cue">View details →</span>
    </div>
  `;

  card.addEventListener('click', () => openModal(b.id));

  return card;
}


function renderGallery(tagFilter, companyFilter) {
  const grid = document.getElementById('card-grid');
  const noResults = document.getElementById('no-results');
  grid.innerHTML = '';

  let filtered = [...BILLBOARDS];
  if (tagFilter && tagFilter !== 'all') {
    filtered = filtered.filter(b => b.tags.includes(tagFilter));
  }
  if (companyFilter && companyFilter !== 'all') {
    filtered = filtered.filter(b => b.company === companyFilter);
  }
  // Newest spotted_date first
  filtered.sort((a, b) => b.spotted_date.localeCompare(a.spotted_date));

  if (filtered.length === 0) {
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';

  filtered.forEach((b, i) => {
    const card = buildCard(b);
    card.style.setProperty('--delay', (i * 80) + 'ms');
    grid.appendChild(card);
  });

  // Trigger scroll reveal for newly added cards
  const newCards = grid.querySelectorAll('.scroll-reveal:not(.visible)');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  newCards.forEach(el => obs.observe(el));
}

function syncCardSpotCount(id, count) {
  const el = document.getElementById('card-spot-count-' + id);
  if (el) el.textContent = count + ' spot' + (count !== 1 ? 's' : '');
}


// ===== FORM =====
document.getElementById('submit-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const company = document.getElementById('f-company');
  const location = document.getElementById('f-location');
  const tagline = document.getElementById('f-tagline');
  const photo = document.getElementById('f-photo');
  const errorEl = document.getElementById('form-error');
  const btn = this.querySelector('.submit-btn');

  // Client-side validation
  let valid = true;
  [company, location, tagline].forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('error');
      valid = false;
    } else {
      field.classList.remove('error');
    }
  });
  if (!photo.files[0]) {
    photo.closest('.file-input-wrap').style.outline = '1px solid var(--meter-neg)';
    valid = false;
  } else {
    photo.closest('.file-input-wrap').style.outline = '';
  }
  if (!valid) return;

  errorEl.style.display = 'none';
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  try {
    const res = await fetch('/.netlify/functions/submit', {
      method: 'POST',
      body: new FormData(this),
    });
    const data = await res.json();

    if (data.success) {
      this.reset();
      document.getElementById('file-label-text').textContent = 'Attach photo';
      this.style.display = 'none';
      document.getElementById('form-success').style.display = 'flex';
      setTimeout(() => { btn.disabled = false; }, 3000);
    } else {
      errorEl.textContent = data.error || 'Something went wrong — please try again.';
      errorEl.style.display = 'block';
      btn.textContent = 'Submit Sighting →';
      btn.disabled = false;
    }
  } catch {
    errorEl.textContent = 'Network error — check your connection and try again.';
    errorEl.style.display = 'block';
    btn.textContent = 'Submit Sighting →';
    btn.disabled = false;
  }
});

function resetForm() {
  const form = document.getElementById('submit-form');
  form.reset();
  form.style.display = 'flex';
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  const btn = form.querySelector('.submit-btn');
  btn.textContent = 'Submit Sighting →';
  btn.disabled = false;
  document.getElementById('form-success').style.display = 'none';
}

document.getElementById('f-photo').addEventListener('change', function () {
  const label = document.getElementById('file-label-text');
  label.textContent = this.files[0] ? this.files[0].name : 'Attach photo';
});

// ===== LIVE STATS SECTION =====
function initLiveStats() {
  // Dynamic date
  const dateEl = document.getElementById('stats-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  // Sync hero stats from live data (runs before IntersectionObserver fires)
  const archivedEl = document.getElementById('stat-hero-archived');
  if (archivedEl) {
    archivedEl.dataset.target = BILLBOARDS.length;
    archivedEl.textContent = BILLBOARDS.length;
  }
  const companiesEl = document.getElementById('stat-hero-companies');
  if (companiesEl) {
    const uniqueCount = new Set(BILLBOARDS.map(b => b.company)).size;
    companiesEl.dataset.target = uniqueCount;
    companiesEl.textContent = uniqueCount;
  }

  // Compute total community sightings from archive
  const totalSightings = BILLBOARDS.reduce((sum, b) => sum + getSpots(b.id), 0);
  const sightingsEl = document.getElementById('stat-sightings-num');
  if (sightingsEl) {
    sightingsEl.dataset.target = totalSightings;
  }

  // Count-up for stat cards when section scrolls into view
  const statNumbers = document.querySelectorAll('.stat-card-number[data-target]');
  let done = false;
  const obs = new IntersectionObserver(entries => {
    if (done) return;
    if (entries.some(e => e.isIntersecting)) {
      done = true;
      statNumbers.forEach(el => animateCountUp(el));
    }
  }, { threshold: 0.2 });
  statNumbers.forEach(el => obs.observe(el));

  // Populate company dropdown
  const companySelect = document.getElementById('company-filter');
  if (companySelect) {
    const companies = [...new Set(BILLBOARDS.map(b => b.company))].sort();
    companies.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      companySelect.appendChild(opt);
    });
  }
}

// ===== INIT =====
dataReady.then(() => {
  renderGallery('all', 'all');
  initLiveStats();

  // Hero stat — live count from loaded data
  const archivedEl = document.getElementById('stat-hero-archived');
  if (archivedEl) {
    archivedEl.dataset.target = BILLBOARDS.length;
    animateCountUp(archivedEl);
  }
});
