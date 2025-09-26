document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const resultDiv = document.getElementById('result');

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    });

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
                const link = `https://telegra.ph${data.url}`;
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

    window.copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Link berhasil disalin!');
        }, (err) => {
            alert('Gagal menyalin link.');
        });
    }

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