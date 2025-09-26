document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const resultDiv = document.getElementById('result');

    // Klik area upload untuk membuka pilihan file
    uploadArea.addEventListener('click', () => fileInput.click());

    // Menangani ketika file dipilih
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    });

    // Menangani drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('highlight'), false);
    });

    uploadArea.addEventListener('drop', (event) => {
        const dt = event.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }, false);

    function handleFiles(files) {
        const file = files[0];
        // Validasi ukuran file (5 MB)
        if (file.size > 5 * 1024 * 1024) {
            showResult('error', 'Gagal: Ukuran file melebihi 5 MB.');
            return;
        }
        uploadFile(file);
    }

    async function uploadFile(file) {
        showResult('info', 'Mengunggah file, mohon tunggu...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Terjadi kesalahan di server.');
            }

            const data = await response.json();
            
            if (data.url) {
                // ==========================================================
                //  PERUBAHAN DI SINI: Kita langsung gunakan data.url
                //  karena sudah berisi link yang lengkap dari pixhost.
                // ==========================================================
                const link = data.url;

                showResult('success', `
                    Berhasil! Link file Anda:
                    <br>
                    <a href="${link}" target="_blank">${link}</a>
                    <button onclick="copyToClipboard('${link}')">Salin Link</button>
                `);
            } else {
                throw new Error('URL tidak ditemukan dalam respons.');
            }

        } catch (error) {
            showResult('error', `Gagal: ${error.message}`);
        }
    }

    function showResult(type, message) {
        resultDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
    }

    // Fungsi untuk menyalin link
    window.copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Link berhasil disalin!');
        }, (err) => {
            alert('Gagal menyalin link.');
        });
    }

    // Logika untuk Modal Tutorial
    const modal = document.getElementById('tutorial-modal');
    const btn = document.getElementById('tutorial-btn');
    const span = document.getElementsByClassName('close-btn')[0];

    btn.onclick = () => {
        modal.style.display = 'flex';
    }
    span.onclick = () => {
        modal.style.display = 'none';
    }
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});
