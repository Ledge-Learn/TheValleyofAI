// ===== RATINGS SYSTEM =====

const VIEWER_LABELS = ['Forgettable', 'Mild', 'Notable', 'Strong', 'Iconic'];
const VIEWER_SHORT  = ['FGT', 'MILD', 'NTB', 'STG', 'ICON'];
const BUZZ_LEVELS   = ['Low', 'Medium', 'High', 'Overload'];
const BUZZ_SHORT    = ['LOW', 'MED', 'HIGH', 'MAX'];
const CONF_LEVELS   = ['Clear', 'Somewhat unclear', 'Confusing', 'What does this even mean?'];
const CONF_SHORT    = ['CLEAR', 'UNCLEAR', 'CONFUSING', '???'];

// ─── Seeding ──────────────────────────────────────────────────────────────────

function _seedBuzzLevel(b) {
  return b.buzzword <= 3.5 ? 'Low' : b.buzzword <= 6.5 ? 'Medium' : b.buzzword <= 8.5 ? 'High' : 'Overload';
}

function _seedConfLevel(b) {
  return b.boomer <= 3.5 ? 'Clear' : b.boomer <= 5.5 ? 'Somewhat unclear' : b.boomer <= 8.0 ? 'Confusing' : 'What does this even mean?';
}

function _distribute(levels, modeName, n) {
  const modeIdx = levels.indexOf(modeName);
  const weights  = [0.55, 0.28, 0.12, 0.05];
  const tally    = {};
  let remaining  = n;
  levels.forEach((l, i) => {
    if (i === levels.length - 1) {
      tally[l] = Math.max(0, remaining);
    } else {
      const w     = weights[Math.abs(i - modeIdx)] ?? 0.02;
      const count = Math.min(remaining, Math.round(n * w));
      tally[l]    = Math.max(0, count);
      remaining  -= tally[l];
    }
  });
  return tally;
}

function _seedRatingsData(b) {
  const n       = Math.max(4, Math.min(40, Math.floor(b.spots / 9)));
  const posAvg  = (b.watry + b.memory) / 2;
  const vAvg    = 1 + (posAvg / 10) * 4;
  return {
    viewer:    { sum: Math.round(vAvg * n), count: n },
    buzz:      _distribute(BUZZ_LEVELS,  _seedBuzzLevel(b), n),
    confusion: _distribute(CONF_LEVELS,  _seedConfLevel(b), n),
  };
}

// ─── Storage ──────────────────────────────────────────────────────────────────

function getRatingsData(b) {
  const key    = 'tvai_rdata_' + b.id;
  const stored = localStorage.getItem(key);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const seeded = _seedRatingsData(b);
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

function getUserVotes(id) {
  try { return JSON.parse(localStorage.getItem('tvai_myvote_' + id) || 'null') || {}; }
  catch { return {}; }
}

// ─── Submit ───────────────────────────────────────────────────────────────────

function submitRating(b, type, value) {
  const userVotes = getUserVotes(b.id);
  if (userVotes[type] !== undefined) return false;

  const data = getRatingsData(b);
  if (type === 'viewer') {
    data.viewer.sum   += value;
    data.viewer.count += 1;
  } else {
    data[type][value] = (data[type][value] || 0) + 1;
  }

  localStorage.setItem('tvai_rdata_' + b.id, JSON.stringify(data));
  userVotes[type] = value;
  localStorage.setItem('tvai_myvote_' + b.id, JSON.stringify(userVotes));
  return true;
}

// ─── Computed stats ───────────────────────────────────────────────────────────

function _viewerStat(data) {
  if (!data?.viewer?.count) return { avg: 0, count: 0 };
  return { avg: data.viewer.sum / data.viewer.count, count: data.viewer.count };
}

function _modeStat(tally) {
  let modeKey = null, modeVal = 0, total = 0;
  for (const [k, v] of Object.entries(tally)) {
    total += v;
    if (v > modeVal) { modeVal = v; modeKey = k; }
  }
  return { mode: modeKey, count: total, tally };
}

// ─── Card HTML builder ────────────────────────────────────────────────────────

function ratingsSectionHtml(b) {
  const data      = getRatingsData(b);
  const userVotes = getUserVotes(b.id);
  const vStat     = _viewerStat(data);
  const bStat     = _modeStat(data.buzz);
  const cStat     = _modeStat(data.confusion);

  const id           = b.id;
  const totalRatings = vStat.count;

  const viewerDisplay = vStat.avg ? `${vStat.avg.toFixed(1)} AVG` : '';
  const buzzDisplay   = bStat.mode
    ? (BUZZ_SHORT[BUZZ_LEVELS.indexOf(bStat.mode)] ?? bStat.mode.toUpperCase())
    : '';
  const confDisplay   = cStat.mode
    ? (cStat.mode === 'What does this even mean?' ? '???' : (CONF_SHORT[CONF_LEVELS.indexOf(cStat.mode)] ?? cStat.mode.toUpperCase()))
    : '';

  const hasVV = userVotes.viewer    !== undefined;
  const hasVB = userVotes.buzz      !== undefined;
  const hasVC = userVotes.confusion !== undefined;

  const viewerBtns = VIEWER_LABELS.map((label, i) => {
    const val = i + 1;
    const sel = hasVV && userVotes.viewer === val;
    return `<button class="cr-v-btn${sel ? ' cr-selected' : ''}${hasVV ? ' cr-voted' : ''}"
      onclick="handleRating(event,'${id}','viewer',${val})" aria-label="${label}">
      <span class="cr-v-num">${val}</span>
      <span class="cr-v-label">${VIEWER_SHORT[i]}</span>
    </button>`;
  }).join('');

  const buzzBtns = BUZZ_LEVELS.map((level, i) => {
    const sel = hasVB && userVotes.buzz === level;
    return `<button class="cr-seg-btn${sel ? ' cr-selected' : ''}${hasVB ? ' cr-voted' : ''}"
      onclick="handleRating(event,'${id}','buzz','${level}')">${BUZZ_SHORT[i]}</button>`;
  }).join('');

  const confBtns = CONF_LEVELS.map((level, i) => {
    const sel = hasVC && userVotes.confusion === level;
    return `<button class="cr-seg-btn${sel ? ' cr-selected' : ''}${hasVC ? ' cr-voted' : ''}"
      onclick="handleRating(event,'${id}','confusion','${level}')">${CONF_SHORT[i]}</button>`;
  }).join('');

  return `<div class="card-rating-section" data-id="${id}">
    <div class="cr-header">
      <span class="cr-header-label">READER RATINGS</span>
      <span class="cr-header-count">${totalRatings} rating${totalRatings !== 1 ? 's' : ''}</span>
    </div>
    <div class="cr-row">
      <div class="cr-row-head">
        <span class="cr-label">OVERALL IMPACT</span>
        <span class="cr-stat">${viewerDisplay}</span>
      </div>
      <div class="cr-viewer-btns">${viewerBtns}</div>
    </div>
    <div class="cr-row">
      <div class="cr-row-head">
        <span class="cr-label">BUZZWORD LEVEL</span>
        <span class="cr-stat">${buzzDisplay}</span>
      </div>
      <div class="cr-seg-btns">${buzzBtns}</div>
    </div>
    <div class="cr-row">
      <div class="cr-row-head">
        <span class="cr-label">CLARITY</span>
        <span class="cr-stat">${confDisplay}</span>
      </div>
      <div class="cr-seg-btns">${confBtns}</div>
    </div>
  </div>`;
}

// ─── Card event handler ───────────────────────────────────────────────────────

function handleRating(e, id, type, value) {
  e.stopPropagation();
  const b = getBillboard(id);
  if (!b || !submitRating(b, type, value)) return;

  // Re-render just the rating section in the card
  const section = document.querySelector(`.card-rating-section[data-id="${id}"]`);
  if (section) {
    const tmp = document.createElement('div');
    tmp.innerHTML = ratingsSectionHtml(b);
    section.replaceWith(tmp.firstElementChild);
  }

  // Sync modal if it's currently showing this billboard
  if (typeof currentModalId !== 'undefined' && currentModalId === id) {
    renderModalRatings(b);
  }
}

// ─── Modal ratings ────────────────────────────────────────────────────────────

function renderModalRatings(b) {
  const container = document.getElementById('modal-ratings');
  if (!container) return;

  const data      = getRatingsData(b);
  const userVotes = getUserVotes(b.id);
  const vStat     = _viewerStat(data);
  const bStat     = _modeStat(data.buzz);
  const cStat     = _modeStat(data.confusion);

  const total          = vStat.count;
  const viewerStatText = vStat.avg
    ? `${vStat.avg.toFixed(1)} avg · ${total} rating${total !== 1 ? 's' : ''}`
    : '';

  const hasVV = userVotes.viewer    !== undefined;
  const hasVB = userVotes.buzz      !== undefined;
  const hasVC = userVotes.confusion !== undefined;

  const viewerBtns = VIEWER_LABELS.map((label, i) => {
    const val = i + 1;
    const sel = hasVV && userVotes.viewer === val;
    return `<button class="mr-v-btn${sel ? ' cr-selected' : ''}${hasVV ? ' cr-voted' : ''}"
      onclick="handleModalRating('viewer',${val})" aria-label="${label}">
      <span class="mr-v-num">${val}</span>
      <span class="mr-v-label">${label}</span>
    </button>`;
  }).join('');

  const buzzBtns = BUZZ_LEVELS.map(level => {
    const pct = bStat.count > 0 ? Math.round((bStat.tally[level] / bStat.count) * 100) : 0;
    const sel = hasVB && userVotes.buzz === level;
    return `<button class="mr-seg-btn${sel ? ' cr-selected' : ''}${hasVB ? ' cr-voted' : ''}"
      onclick="handleModalRating('buzz','${level}')">
      <span class="mr-seg-label">${level}</span>
      <span class="mr-seg-pct">${pct}%</span>
    </button>`;
  }).join('');

  const confBtns = CONF_LEVELS.map(level => {
    const pct = cStat.count > 0 ? Math.round((cStat.tally[level] / cStat.count) * 100) : 0;
    const sel = hasVC && userVotes.confusion === level;
    return `<button class="mr-seg-btn${sel ? ' cr-selected' : ''}${hasVC ? ' cr-voted' : ''}"
      onclick="handleModalRating('confusion','${level}')">
      <span class="mr-seg-label">${level}</span>
      <span class="mr-seg-pct">${pct}%</span>
    </button>`;
  }).join('');

  container.innerHTML = `
    <div class="mr-header">
      <span class="mono-label">READER RATINGS</span>
      <span class="mr-total">${total} rating${total !== 1 ? 's' : ''}</span>
    </div>
    <div class="mr-group">
      <div class="mr-group-head">
        <span class="mr-group-label">OVERALL IMPACT</span>
        <span class="mr-group-stat">${viewerStatText}</span>
      </div>
      <div class="mr-viewer-btns">${viewerBtns}</div>
    </div>
    <div class="mr-group">
      <div class="mr-group-head">
        <span class="mr-group-label">BUZZWORD LEVEL</span>
      </div>
      <div class="mr-seg-btns">${buzzBtns}</div>
    </div>
    <div class="mr-group">
      <div class="mr-group-head">
        <span class="mr-group-label">CLARITY</span>
      </div>
      <div class="mr-seg-btns mr-conf-btns">${confBtns}</div>
    </div>
  `;
}

function handleModalRating(type, value) {
  if (typeof currentModalId === 'undefined' || currentModalId === null) return;
  const b = getBillboard(currentModalId);
  if (!b || !submitRating(b, type, value)) return;

  renderModalRatings(b);

  // Sync the gallery card
  const section = document.querySelector(`.card-rating-section[data-id="${currentModalId}"]`);
  if (section) {
    const tmp = document.createElement('div');
    tmp.innerHTML = ratingsSectionHtml(b);
    section.replaceWith(tmp.firstElementChild);
  }
}
