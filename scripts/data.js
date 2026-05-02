function buzzPin(score) {
  if (score >= 7.5) return '#C2410C';
  if (score >= 5.5) return '#F04E23';
  return '#FB923C';
}

let BILLBOARDS = [];

async function loadBillboards() {
  const res = await fetch('data/billboards.json');
  const data = await res.json();
  BILLBOARDS = data.map(b => ({
    ...b,
    get pinColor() { return buzzPin(this.buzzword); }
  }));
}

const dataReady = loadBillboards();

function getBillboard(id) {
  return BILLBOARDS.find(b => b.id === id);
}

function getSpots(id) {
  const stored = localStorage.getItem('spots_' + id);
  const b = getBillboard(id);
  return stored !== null ? parseInt(stored) : (b ? b.spots : 0);
}

function getSpotted() {
  try { return JSON.parse(localStorage.getItem('valley-of-ai-spotted') || '[]'); }
  catch { return []; }
}

function hasSpotted(id) {
  return getSpotted().includes(id);
}

function markSpotted(id) {
  const arr = getSpotted();
  if (!arr.includes(id)) {
    arr.push(id);
    localStorage.setItem('valley-of-ai-spotted', JSON.stringify(arr));
  }
}

function addSpot(id) {
  if (hasSpotted(id)) return getSpots(id);
  const current = getSpots(id);
  localStorage.setItem('spots_' + id, current + 1);
  markSpotted(id);
  return current + 1;
}
