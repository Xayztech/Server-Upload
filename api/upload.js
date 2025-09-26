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
    const originalFormData = await req.formData();
    const file = originalFormData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'File tidak ditemukan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newFormData = new FormData();
    newFormData.append('img[]', file);
    newFormData.append('content_type', '0'); 
    newFormData.append('max_th_size', '400');

    // Menggunakan domain .to kembali sesuai informasi dari Anda
    const response = await fetch('https://pixhost.to/upload', {
      method: 'POST',
      body: newFormData,
      headers: {
        'Accept': '*/*', 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal mengunggah ke pixhost.to: ${response.statusText} (${response.status}).`);
    }

    const htmlResponse = await response.text();
    const regex = /id="show_image_direct_link".*?value="(.*?)"/;
    const match = htmlResponse.match(regex);

    if (match && match[1]) {
      const directLink = match[1];
      return new Response(JSON.stringify({ url: directLink }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Gagal menemukan link gambar di respons HTML dari pixhost.to.');
    }

  } catch (error) {
    console.error('Error in upload handler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
