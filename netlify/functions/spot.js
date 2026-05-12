const { getStore } = require('@netlify/blobs');

function json(status, body) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' };
  }

  const store = getStore('spots');

  // GET — return all current spot counts
  if (event.httpMethod === 'GET') {
    try {
      const raw = await store.get('all-counts');
      const counts = raw ? JSON.parse(raw) : {};
      return json(200, { counts });
    } catch {
      return json(200, { counts: {} });
    }
  }

  // POST — increment a single billboard's count
  if (event.httpMethod === 'POST') {
    let id;
    try {
      ({ id } = JSON.parse(event.body || '{}'));
    } catch {
      return json(400, { error: 'Invalid JSON body' });
    }
    if (!id || typeof id !== 'string') {
      return json(400, { error: 'Missing id' });
    }

    try {
      const raw = await store.get('all-counts');
      const counts = raw ? JSON.parse(raw) : {};
      counts[id] = (counts[id] || 0) + 1;
      await store.set('all-counts', JSON.stringify(counts));
      return json(200, { count: counts[id] });
    } catch (err) {
      return json(500, { error: 'Storage error' });
    }
  }

  return json(405, { error: 'Method not allowed' });
};
