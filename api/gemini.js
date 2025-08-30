// api/gemini.js
// Reenvía peticiones al endpoint oficial de Gemini sin exponer tu API key.
// Necesitas configurar GEMINI_API_KEY en Vercel → Project → Settings → Environment Variables.

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';

// Reintentos exponenciales para errores 500/503
async function fetchWithRetry(url, init, tries = 3) {
  let lastRes;
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, init);
    if (res.ok || ![500, 503].includes(res.status)) return res;
    lastRes = res;
    await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
  }
  return lastRes;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'Falta GEMINI_API_KEY en variables de entorno' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!body.contents) {
      return res.status(400).json({ error: "Falta 'contents' en el payload" });
    }

    const upstream = await fetchWithRetry(
      GEMINI_ENDPOINT,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
      3
    );

    const data = await upstream.json().catch(() => ({}));
    return res.status(upstream.status).json(data);
  } catch (error) {
    console.error('💥 Error en endpoint Gemini:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error?.message || String(error),
    });
  }
}
