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
      <div class="card-company">${b.company}</div>
      <div class="card-meta">${b.location} · ${b.date}</div>
      <div class="card-tagline">"${b.tagline}"</div>
      <div class="card-meters">
        ${meterCell('BUZZWORD', b.buzzword, 'var(--meter-neg)', true)}
        ${meterCell('BOOMER', b.boomer, 'var(--meter-comedy)')}
        ${meterCell('TRY', b.watry, 'var(--meter-pos)')}
        ${meterCell('MEMORY', b.memory, 'var(--meter-mem)')}
      </div>
    </div>
    ${ratingsSectionHtml(b)}
    <div class="card-footer">
      <span class="card-spots-text" id="spots-text-${b.id}">${spotCount} spots</span>
      <button class="spot-btn${alreadySpotted ? ' spotted user-spotted' : ''}" id="spot-btn-${b.id}" onclick="handleSpot(event, '${b.id}')" aria-label="Spot this billboard"${alreadySpotted ? ' title="You\'ve already spotted this billboard"' : ''}>
        ${alreadySpotted ? '✓ Spotted' : '▲ Spot'}
      </button>
    </div>
  `;

  card.addEventListener('click', (e) => {
    if (e.target.closest('.spot-btn')) return;
    if (e.target.closest('.card-rating-section')) return;
    openModal(b.id);
  });

  return card;
}

function meterCell(label, score, color, isBuzz = false) {
  const pct = (score / 10) * 100;
  const fillClass = isBuzz ? 'meter-bar-fill buzz-gradient' : 'meter-bar-fill';
  const fillStyle = isBuzz ? `width:${pct}%` : `width:${pct}%; background:${color}`;
  return `<div class="meter-cell">
    <div class="meter-cell-label">${label}</div>
    <div class="meter-bar-wrap">
      <div class="meter-bar-track">
        <div class="${fillClass}" style="${fillStyle}"></div>
      </div>
      <span class="meter-bar-score">${score.toFixed(1)}</span>
    </div>
  </div>`;
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

function handleSpot(e, id) {
  e.stopPropagation();
  if (hasSpotted(id)) return;
  const newCount = addSpot(id);
  const btn = document.getElementById('spot-btn-' + id);
  const text = document.getElementById('spots-text-' + id);
  if (btn) {
    btn.textContent = '✓ Spotted';
    btn.classList.add('spotted', 'user-spotted');
    btn.title = "You've already spotted this billboard";
  }
  if (text) { text.textContent = newCount + ' spots'; }
}

// ===== LEADERBOARD =====
function renderLeaderboard() {
  renderLB('lb-buzzword', 'buzzword', 'var(--meter-neg)');
  renderLB('lb-boomer', 'boomer', 'var(--meter-comedy)');
  renderLB('lb-try', 'watry', 'var(--meter-pos)');
  renderLB('lb-memory', 'memory', 'var(--meter-mem)');
}

function renderLB(listId, metric, color) {
  // Average each metric per company, then rank
  const byCompany = {};
  BILLBOARDS.forEach(b => {
    if (!byCompany[b.company]) {
      byCompany[b.company] = { company: b.company, scores: [], ids: [] };
    }
    byCompany[b.company].scores.push(b[metric]);
    byCompany[b.company].ids.push(b.id);
  });

  const ranked = Object.values(byCompany)
    .map(c => ({
      company: c.company,
      avg: c.scores.reduce((s, v) => s + v, 0) / c.scores.length,
      count: c.scores.length,
      firstId: c.ids.sort((a, b) =>
        (getBillboard(b) || {spotted_date:''}).spotted_date >
        (getBillboard(a) || {spotted_date:''}).spotted_date ? 1 : -1
      )[0]
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3);

  const list = document.getElementById(listId);
  list.innerHTML = '';

  ranked.forEach((c, i) => {
    const li = document.createElement('li');
    li.className = 'lb-item';
    const sublabel = c.count > 1 ? `${c.count} billboards · avg` : (getBillboard(c.firstId) || {location: ''}).location;
    li.innerHTML = `
      <span class="lb-rank">${i + 1}</span>
      <div class="lb-info">
        <div class="lb-company">${c.company}</div>
        <div class="lb-location">${sublabel}</div>
      </div>
      <span class="lb-score" style="color:${color}">${c.avg.toFixed(1)}</span>
    `;
    li.addEventListener('click', () => openModal(c.firstId));
    list.appendChild(li);
  });
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
  renderLeaderboard();
  initLiveStats();
});
