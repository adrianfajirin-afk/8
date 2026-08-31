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

**Catatan:** nama & tanggal yang tercetak DI DALAM bingkai foto (hasil
foto yang di-download tamu) diatur terpisah di `script.js`, cari teks
`Agis & Ilmi` dan `13 AGUSTUS 2026` di situ juga supaya konsisten.

## Cara ganti desain bingkai foto (frame)
Sekarang bingkai adalah **file gambar PNG**, sama seperti foto sampul.
Cukup timpa file di folder `img/`:
- `img/frame-1.png` — bingkai "Merah Klasik" (3 slot foto), ukuran 900x1680px
- `img/frame-2.png` — bingkai "Mawar Senja" (2 slot foto), ukuran 900x1440px
- `img/frame-3.png` — bingkai "Taman Hijau" (1 slot foto), ukuran 900x1260px

(Ukurannya sengaja dibuat besar/HD supaya hasil foto yang di-download
tamu tidak pecah/blur.)

**Nama file & ukuran harus sama persis.** Syarat gambar PNG-nya:
- Bagian tempat foto tamu muncul HARUS transparan (dibuat "lubang"),
  supaya foto tamu kelihatan menembus bingkai.
- Posisi & ukuran lubang harus pas dengan koordinat berikut (dalam pixel,
  dari kiri-atas gambar):
  - frame-1.png: (72,162,756,381), (72,585,756,381), (72,1008,756,381)
  - frame-2.png: (72,162,756,474), (72,678,756,474)
  - frame-3.png: (72,162,756,810)
- Sisakan ruang kosong sekitar 290px di bagian bawah gambar — di situ
  kode otomatis menulis "THE WEDDING OF", nama mempelai, dan tanggal.

Kalau mau ganti jumlah/ukuran slot foto (bukan cuma ganti desain),
koordinat di atas juga perlu disesuaikan di `script.js` bagian
"GANTI DI SINI" (cari `slotRects`).

## Soal resolusi (biar hasil download tidak pecah)
- Foto yang diambil dari kamera sekarang disimpan di resolusi asli
  kamera (maks 1600px), bukan dipaksa kecil seperti sebelumnya.
- Hasil akhir (yang di-download/di-upload tamu) dirender di 900px
  lebar (3x lebih besar dari versi awal), supaya tetap tajam saat
  dilihat di layar besar atau di-zoom.
- Kalau nanti mau menaikkan lagi, ganti semua angka `900`, `1680`,
  `1440`, `1260` di `script.js` (fungsi `drawFrame`) dan buat ulang
  gambar bingkai di resolusi yang sama (kelipatannya harus konsisten
  dengan koordinat `slotRects`, jangan diubah sendiri-sendiri).

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
