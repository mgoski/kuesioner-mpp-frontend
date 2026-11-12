# Kuesioner MPP Majalengka — Frontend GitHub Pages

Frontend statis untuk Survei Kepuasan Masyarakat Pelayanan Cetak KTP-el dan Aktivasi IKD.

## Isi paket
- `index.html`
- `assets/css/style.css`
- `assets/js/app.js`
- `assets/js/config.js`

## Penting: backend PHP tetap diperlukan
GitHub Pages hanya menjalankan HTML, CSS, dan JavaScript. Aplikasi ini tidak menjalankan PHP, tidak menyimpan token GitHub di browser, dan belum dapat mengirim jawaban sampai backend PHP tersedia melalui HTTPS.

## Konfigurasi backend
Edit `assets/js/config.js`:

```js
window.MPP_CONFIG = {
  API_BASE_URL: "https://alamat-backend-php-anda"
};
```

Backend harus menyediakan endpoint `POST /submit`, menerima `multipart/form-data`, mengembalikan JSON, dan mengaktifkan CORS untuk origin GitHub Pages:
`https://mgoski.github.io`

Jangan memasukkan GitHub token, password admin, atau PDF password ke file frontend.

## Deploy ke GitHub Pages
1. Upload isi folder ini ke root repository `kuesioner-mpp-frontend`.
2. Buka Settings → Pages.
3. Pada Build and deployment pilih Deploy from a branch.
4. Pilih branch `main` dan folder `/ (root)`, lalu Save.
5. Tunggu deployment selesai. URL project site:
   `https://mgoski.github.io/kuesioner-mpp-frontend/`

## Backend/admin
Dashboard admin, login, GitHub REST API, dan PDF terenkripsi tetap dijalankan pada backend PHP 8.5 yang terpisah. Jangan mencoba meng-upload file PHP sebagai pengganti frontend GitHub Pages.
