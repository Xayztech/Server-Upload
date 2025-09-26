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
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'File tidak ditemukan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file, file.name);

    const response = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error(`Gagal mengunggah ke telegra.ph: ${response.statusText}`);
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