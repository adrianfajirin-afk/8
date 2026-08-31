# Wedding Memories - Ilmi & Agis

## Struktur folder
```
index.html    -> halaman utama (jangan diedit sembarangan)
style.css     -> semua tampilan/warna/font
script.js     -> semua logika aplikasi
img/
  hero-photo.jpg -> foto sampul yang muncul di halaman awal
```

## Cara ganti foto sampul
Cukup timpa file `img/hero-photo.jpg` dengan foto baru.
**Nama file harus tetap `hero-photo.jpg`** (format jpg), tidak perlu edit kode apa pun.

## Cara ganti nama mempelai / tanggal
Buka `index.html`, cari teks:
- `Ilmi & Agis`
- `13 AGUSTUS 2026`

lalu ganti dengan nama & tanggal yang baru (muncul di beberapa tempat).

## Cara upload ke GitHub Pages
1. Buka repo GitHub kamu di browser.
2. Klik **Add file > Upload files**.
3. Drag seluruh isi folder ini (index.html, style.css, script.js, dan folder img/) ke halaman upload.
4. Commit.
5. Buka Settings > Pages, pastikan source-nya diarahkan ke branch yang berisi file-file ini.

## Catatan
- Bingkai foto (frame) digambar otomatis pakai kode di `script.js`, bukan file gambar terpisah.
  Warna & jumlah slot bingkai bisa diubah di bagian atas `script.js` (cari komentar "GANTI DI SINI").
- Bagian upload otomatis ke GitHub (lewat Cloudflare Worker) tetap ada di `script.js`,
  tidak perlu disentuh kecuali kamu memang mau ganti endpoint-nya.
