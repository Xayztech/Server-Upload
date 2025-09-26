export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Metode tidak diizinkan' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      body: req.body,
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Content-Type': req.headers.get('Content-Type'),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal mengunggah ke telegra.ph: ${response.statusText} (${response.status}). Respons server: ${errorText}`);
    }

    const result = await response.json();
    
    if (result && result[0] && result[0].src) {
        return new Response(JSON.stringify({ url: result[0].src }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } else {
        throw new Error('Format respons dari telegra.ph tidak valid.');
    }

  } catch (error) {
    console.error('Error in upload handler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
