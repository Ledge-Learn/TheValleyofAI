function buzzPin(score) {
  if (score >= 7.5) return '#C2410C';
  if (score >= 5.5) return '#F04E23';
  return '#FB923C';
}

let BILLBOARDS = [];
let serverSpots = {};

async function loadBillboards() {
  const res = await fetch('data/billboards.json');
  const data = await res.json();
  BILLBOARDS = data.map(b => ({
    ...b,
    get pinColor() { return buzzPin(this.buzzword); }
  }));
}

async function loadServerSpots() {
  try {
    const res = await fetch('/.netlify/functions/spot');
    if (res.ok) {
      const data = await res.json();
      serverSpots = data.counts || {};
    }
  } catch {
    // Local dev or offline — fall back to JSON defaults silently
  }
}

const dataReady = Promise.all([loadBillboards(), loadServerSpots()]);

function getBillboard(id) {
  return BILLBOARDS.find(b => b.id === id);
}

function getSpots(id) {
  if (id in serverSpots) return serverSpots[id];
  const b = getBillboard(id);
  return b ? b.spots : 0;
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

async function addSpot(id) {
  if (hasSpotted(id)) return getSpots(id);
  try {
    const res = await fetch('/.netlify/functions/spot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const data = await res.json();
      serverSpots[id] = data.count;
      markSpotted(id);
      return data.count;
    }
  } catch {}
  // Fallback: local-only increment if function unreachable
  const current = getSpots(id);
  serverSpots[id] = current + 1;
  markSpotted(id);
  return current + 1;
}
