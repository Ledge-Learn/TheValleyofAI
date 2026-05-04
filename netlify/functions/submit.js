const Busboy = require('busboy');

const API_URL = 'https://api.airtable.com/v0';
const CONTENT_URL = 'https://content.airtable.com/v0';
const PHOTO_FIELD_ID = 'fldHNPfoetdA7dWUu';

const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const contentType =
      event.headers['content-type'] || event.headers['Content-Type'] || '';

    const bb = Busboy({ headers: { 'content-type': contentType } });

    const fields = {};
    let fileBuffer = null;
    let fileName = null;
    let fileMime = null;

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('file', (name, stream, info) => {
      if (name !== 'photo') { stream.resume(); return; }
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
        fileName = info.filename || 'photo.jpg';
        fileMime = info.mimeType || 'image/jpeg';
      });
    });

    bb.on('close', () => resolve({ fields, fileBuffer, fileName, fileMime }));
    bb.on('error', reject);

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body || '', 'utf8');

    bb.write(body);
    bb.end();
  });
}

async function createRecord(fields) {
  const res = await fetch(`${API_URL}/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  return res;
}

async function uploadPhoto(recordId, fileBuffer, fileName, fileMime) {
  const url = `${CONTENT_URL}/${AIRTABLE_BASE_ID}/${recordId}/${PHOTO_FIELD_ID}/uploadAttachment`;
  const body = JSON.stringify({
    contentType: fileMime,
    file: fileBuffer.toString('base64'),
    filename: fileName,
  });

  console.error('[submit] uploadPhoto request:', {
    url,
    'Content-Type': 'application/json',
    bodyShape: `JSON { contentType: "${fileMime}", filename: "${fileName}", file: <base64 ${fileBuffer.length} bytes> }`,
  });

  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body,
  });
}

async function deleteRecord(recordId) {
  await fetch(`${API_URL}/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${recordId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed' });
  }

  let parsed;
  try {
    parsed = await parseMultipart(event);
  } catch (err) {
    return json(400, { success: false, error: 'Could not parse form data' });
  }

  const { fields, fileBuffer, fileName, fileMime } = parsed;

  // Honeypot — silent success to confuse bots
  if (fields.website) {
    return json(200, { success: true });
  }

  // Validate required fields
  const missing = ['company', 'tagline', 'location'].filter(f => !fields[f]?.trim());
  if (missing.length > 0) {
    return json(400, { success: false, error: `Missing required fields: ${missing.join(', ')}` });
  }
  if (!fileBuffer || fileBuffer.length === 0) {
    return json(400, { success: false, error: 'Photo is required' });
  }

  // Step A: create the record with text fields
  const recordFields = {
    Company: fields.company.trim(),
    Tagline: fields.tagline.trim(),
    Location: fields.location.trim(),
    Status: 'Pending',
  };
  if (fields.highway)  recordFields['Highway/Street'] = fields.highway;
  if (fields.category) recordFields['Category'] = fields.category;
  if (fields.notes)    recordFields['Notes'] = fields.notes.trim();
  if (fields.email)    recordFields['Submitter Email'] = fields.email.trim();

  const createRes = await createRecord(recordFields);
  if (!createRes.ok) {
    const errBody = await createRes.text().catch(() => '(could not read body)');
    console.error(`[submit] Airtable create failed — HTTP ${createRes.status}:`, errBody);
    let msg;
    try { msg = JSON.parse(errBody)?.error?.message; } catch {}
    return json(502, { success: false, error: `Airtable error: ${msg || errBody}` });
  }

  const { id: recordId } = await createRes.json();

  // Step B: attach the photo
  const uploadRes = await uploadPhoto(recordId, fileBuffer, fileName, fileMime);
  if (!uploadRes.ok) {
    const errBody = await uploadRes.text().catch(() => '(could not read body)');
    console.error(`[submit] Airtable photo upload failed — HTTP ${uploadRes.status}:`, errBody);
    let detail = errBody;
    try {
      const parsed = JSON.parse(errBody);
      const { type, message } = parsed?.error || {};
      detail = [type, message].filter(Boolean).join(' — ') || errBody;
    } catch {}
    // Don't leave an orphan record
    await deleteRecord(recordId);
    return json(502, { success: false, error: `Photo upload failed: ${detail}` });
  }

  return json(200, { success: true, recordId });
};
