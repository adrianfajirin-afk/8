/* =====================================================================
   ⭐ GANTI DI SINI — bagian yang aman diubah tanpa merusak aplikasi ⭐
   =====================================================================
   1) FOTO SAMPUL (hero photo)
      Filenya ada di: img/hero-photo.jpg
      Untuk ganti: cukup timpa file itu dengan foto baru (nama file
      HARUS sama persis: hero-photo.jpg), tidak perlu edit kode apa pun.

   2) NAMA MEMPELAI & TANGGAL
      Muncul di banyak tempat di index.html (elemen dengan class="names"
      dan class="date"). Cari & ganti teks "Ilmi & Agis" dan
      "13 AGUSTUS 2026" di file index.html.

   3) GAMBAR BINGKAI FOTO (frame)
      Sekarang bingkai adalah FILE GAMBAR PNG, sama seperti foto sampul.
      Untuk ganti desain: cukup timpa filenya di folder img/
      (img/frame-1.png, img/frame-2.png, img/frame-3.png), nama file
      HARUS sama persis, tidak perlu edit kode apa pun.

      Syarat gambar PNG bingkai:
      - Background HARUS transparan di bagian tempat foto tamu muncul
        (lubang/jendela foto), supaya foto tamu kelihatan di baliknya.
      - Ukuran & posisi lubang foto HARUS pas dengan koordinat "slots"
        di bawah ini (x, y, w, h dalam satuan pixel), karena posisi
        lubang tidak dibaca otomatis dari gambar.
      - Ukuran gambar PNG persis: frame-1.png = 900x1680, frame-2.png =
        900x1440, frame-3.png = 900x1260 (lebar x tinggi, dalam pixel).
        (Sengaja HD/besar biar hasil download tamu tidak pecah.)
      - Sisakan ruang kosong ±290px di bagian bawah untuk teks nama &
        tanggal mempelai (digambar otomatis oleh kode, di atas bingkai).

      Kalau ganti jumlah/ukuran slot foto, sesuaikan juga field
      "slots" (x, y, w, h) supaya foto tamu pas di lubang gambar baru.
      - label : nama bingkai yang tampil ke tamu
      - image : path ke file PNG bingkai
      - bg    : warna latar sementara, dipakai selagi gambar dimuat
      - accent: warna teks nama & tanggal yang digambar di atas bingkai

   4) GAMBAR BINGKAI VIDEO (img/video-frame.png)
      Sama persis polanya kayak bingkai foto di atas: cukup timpa file
      img/video-frame.png dengan desain baru, nama file HARUS sama persis,
      TIDAK perlu edit kode apa pun.

      Syarat gambar PNG bingkai video:
      - Background HARUS transparan di bagian TENGAH (tempat orangnya
        kelihatan) — dekorasi cukup di sisi kiri & kanan saja, jangan
        sampai nutupin wajah/badan orang yang lagi rekam.
      - Ukuran disarankan rasio potret 9:16 (contoh: 1080x1920px), karena
        bingkai ini otomatis di-stretch penuh menutupi canvas rekaman
        (berapa pun resolusi asli kamera pemakainya).
      - File ini dipakai sama untuk SEMUA filter warna video (cuma ada
        1 filter warna sekarang: Ivory) — bingkainya selalu ikut nempel
        paling atas, baru direkam jadi satu video utuh.

   5) MUSIK LATAR OTOMATIS (music/bgm-1.mp3 ... music/bgm-15.mp3)
      Taro 15 file MP3 di folder music/ dengan nama PERSIS bgm-1.mp3
      sampai bgm-15.mp3, TIDAK perlu edit kode apa pun.

      Cara kerjanya:
      - Berlaku HANYA buat FOTO yang tamu kirim TANPA VN (voice note).
        Kalau tamu udah nyertain VN sendiri, VN itu yang diputer (musik
        BGM tidak dipakai). Video tidak kena BGM ini (video udah punya
        audio rekamannya sendiri).
      - 1 foto SELALU dapet lagu yang SAMA setiap dibuka ulang/di-refresh
        (dipilih dari hash url fotonya sendiri, bukan acak murni) — supaya
        konsisten, bukan ganti-ganti lagu tiap kali halaman dimuat.
      - Otomatis muter pas fotonya DIBUKA (tap → modal/feed) atau lagi
        tampil di story viewer. Grid galeri (3 kolom) SENGAJA dibiarkan
        diam total — nggak ada suara apa pun yang autoplay di situ,
        biar gak berisik pas orang lagi scroll-scroll liat grid-nya.
      - Otomatis berhenti begitu foto lain yang mulai keputer duluan
        (nggak bakal numpuk beberapa lagu sekaligus).
   ===================================================================== */

/* ==================== FIX TINGGI LAYAR (biar pas di semua HP) ====================
   Masalah: 100vh di banyak browser HP dihitung beda-beda tergantung
   toolbar/address bar lagi muncul atau ke-collapse, jadi tampilan bisa
   ketutup/kepotong di sebagian device tapi normal di device lain.
   Solusi: hitung tinggi layar asli lewat JS (window.innerHeight), simpan
   ke variabel CSS --vh, lalu dipakai di style.css sebagai cadangan kalau
   browser belum mendukung unit 100dvh yang lebih baru.
   =================================================================== */
function setViewportHeight(){
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}
setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
// Sebagian browser mobile telat update innerHeight tepat saat orientasi
// berubah, jadi dicek ulang sedikit setelahnya untuk jaga-jaga.
window.addEventListener('orientationchange', () => setTimeout(setViewportHeight, 300));

/* ==================== STATE ==================== */
/* ==================== BLOKIR PINCH-ZOOM (khusus Safari iOS) ====================
   Meta tag "user-scalable=no" saja nggak cukup buat Safari iOS — dia tetap
   ngizinin gesture cubit-2-jari (pinch) & tekan-geser 2 jari buat zoom,
   walau viewport udah bilang "no". Safari punya event khusus 'gesturestart'
   / 'gesturechange' / 'gestureend' (nggak ada di browser lain) yang HARUS
   di-preventDefault() biar gesture itu beneran nggak jalan. Ini kombinasi
   sama touch-action di CSS (yang nutup jalur non-Safari). */
['gesturestart','gesturechange','gestureend'].forEach(evt=>{
  document.addEventListener(evt, e => e.preventDefault());
});
// Jaga-jaga tambahan: blokir double-tap-zoom (2 ketuk cepat) di sebagian
// browser yang masih nurut ke ini meski touch-action sudah diset.
let _lastTouchEnd = 0;
document.addEventListener('touchend', e=>{
  const now = Date.now();
  if(now - _lastTouchEnd <= 300) e.preventDefault();
  _lastTouchEnd = now;
}, { passive:false });

const state = {
  name: '',
  frames: [
    { id:'a', label:'Merah Klasik', slots:3, image:'img/frame-1.png', bg:'#f6ece0', accent:'#8a2530',
      slotRects: [ {x:72,y:162,w:756,h:381}, {x:72,y:585,w:756,h:381}, {x:72,y:1008,w:756,h:381} ] },
    { id:'b', label:'Mawar Senja',  slots:2, image:'img/frame-2.png', bg:'#fbeee0', accent:'#c9743a',
      slotRects: [ {x:72,y:162,w:756,h:474}, {x:72,y:678,w:756,h:474} ] },
    { id:'c', label:'Taman Hijau',  slots:1, image:'img/frame-3.png', bg:'#f3f0e6', accent:'#5c7048',
      slotRects: [ {x:72,y:162,w:756,h:810} ] },
  ],
  frameIndex: 0,
  photos: [],
  currentSlot: 0,
  filter: 'original',
  caption: '',
  audioBlob: null,
  audioUrl: null,
  audioDuration: 0,
  waveSamples: [],
  gallery: [],
  // --- video mode ---
  videoBlob: null,
  videoUrl: null,
  videoCaption: '',
  videoFacingMode: 'user',
};

/* ==================== DEBUG BANNER (buat lacak error langsung di HP) ==================== */
function showDebugBanner(msg){
  const el = document.getElementById('debugBanner');
  if(!el) return;
  const time = new Date().toLocaleTimeString('id-ID');
  el.textContent = `[${time}] ${msg}`;
  el.style.display = 'block';
}

/* ==================== UPLOAD (via Worker proxy) ====================
   Browser TIDAK pernah menyimpan/meminta token GitHub. Foto & suara
   dikirim ke Worker (server kecil) yang menyimpan token secara aman,
   lalu Worker yang commit ke GitHub + catat manifest (nama, link foto,
   link suara, waktu kirim) supaya galeri bisa nampilin data asli buat
   semua orang, bukan cuma di sesi browser pengirimnya sendiri.
   Ganti UPLOAD_ENDPOINT di bawah dengan URL Worker kamu (lihat worker.js).
================================================================= */
const GITHUB_CONFIG = {
  owner:  'photoboothkuningan',
  repo:   '8',
  branch: 'main',
  folder: 'uploads'
};
const UPLOAD_ENDPOINT = 'https://winter-bush-7925.agis-ngu.workers.dev'; // Worker Cloudflare

async function uploadFileToGitHub(dataUrl, filename){
  if(!UPLOAD_ENDPOINT || UPLOAD_ENDPOINT.startsWith('GANTI_')){
    console.warn('[Upload] Endpoint belum dikonfigurasi — lewati upload, file hanya tersimpan lokal.');
    return null;
  }
  // Cari lewat penanda ";base64," (bukan asal potong di koma pertama) — soalnya
  // nama tipe file video/audio (mis. 'video/mp4;codecs="avc1.4D401E, mp4a.40.2"')
  // bisa mengandung koma sendiri, yang dulu bikin Base64-nya kepotong salah tempat.
  const marker = ';base64,';
  const markerIdx = dataUrl.indexOf(marker);
  const base64 = markerIdx >= 0 ? dataUrl.slice(markerIdx + marker.length) : dataUrl.split(',').pop();
  try{
    const res = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upload', filename, contentBase64: base64 })
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok){
      console.error('[Upload] Gagal:', res.status, data.error || data);
      showDebugBanner(`[Upload] Gagal (${res.status}): ${data.error || 'tidak diketahui'}`);
      return null;
    }
    return data.url || null;
  }catch(e){
    console.error('[Upload] Error:', e);
    showDebugBanner(`[Upload] Error: ${e && e.message ? e.message : e}`);
    return null;
  }
}
// Kompatibel dengan pemanggilan lama
async function uploadToGitHub(dataUrl, filename){ return uploadFileToGitHub(dataUrl, filename); }

async function blobToBase64(blob){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result); // "data:...;base64,XXXX"
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
async function uploadAudioToGitHub(blob, filename){
  try{
    const dataUrl = await blobToBase64(blob);
    return await uploadFileToGitHub(dataUrl, filename);
  }catch(e){
    console.error('[Upload] Gagal konversi audio:', e);
    showDebugBanner(`[Upload] Gagal konversi audio: ${e && e.message ? e.message : e}`);
    return null;
  }
}
async function addGalleryEntry(entry){
  if(!UPLOAD_ENDPOINT || UPLOAD_ENDPOINT.startsWith('GANTI_')) return null;
  try{
    const res = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addEntry', entry })
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok){ console.error('[Manifest] Gagal simpan:', res.status, data.error || data); showDebugBanner(`[Manifest] Gagal simpan (${res.status}): ${data.error || 'tidak diketahui'}`); return null; }
    return data.entry || null;
  }catch(e){
    console.error('[Manifest] Error:', e);
    showDebugBanner(`[Manifest] Error: ${e && e.message ? e.message : e}`);
    return null;
  }
}
function uniqueFilename(prefix, ext){
  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  const rand = Math.random().toString(36).slice(2,7);
  return `${prefix}-${ts}-${rand}.${ext || 'jpg'}`;
}
// Safari/iOS merekam audio dalam format audio/mp4 (bukan webm), sementara
// Chrome/Android biasanya audio/webm. Ekstensi file HARUS sesuai isi
// aslinya, kalau tidak browser akan gagal memutar filenya setelah
// diupload (tipe di URL beda dari isi file sebenarnya = tidak mau dimainkan).
function audioExtFromMime(mimeType){
  const t = (mimeType || '').toLowerCase();
  if(t.includes('mp4') || t.includes('m4a')) return 'm4a';
  if(t.includes('webm')) return 'webm';
  if(t.includes('ogg')) return 'ogg';
  return 'webm'; // fallback aman kalau mimeType kosong
}

/* ==================== NAV ==================== */
const bottomNav = document.getElementById('bottomNav');
const SCREENS_WITH_BOTTOM_NAV = ['gallery'];
let currentScreenName = null;
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelector(`.screen[data-screen="${name}"]`).classList.add('active');
  currentScreenName = name;
  bottomNav.classList.toggle('visible', SCREENS_WITH_BOTTOM_NAV.includes(name));
}
document.querySelectorAll('[data-back]').forEach(btn=>{
  btn.addEventListener('click', ()=> showScreen(btn.dataset.back));
});
document.querySelectorAll('[data-goto-name]').forEach(btn=>{
  btn.addEventListener('click', ()=> showScreen('name'));
});

// Tombol kiri: balik ke halaman Beranda (awal).
document.getElementById('navHomeBtn').addEventListener('click', ()=> showScreen('welcome'));
// Tombol tengah: ke halaman pilih Foto/Video — kalau nama tamu sudah
// ke-isi di sesi ini, langsung loncat; kalau belum, isi nama dulu (sama
// kayak logika tombol "+" di baris story).
document.getElementById('navCaptureBtn').addEventListener('click', ()=>{
  showScreen(state.name && state.name.trim().length > 0 ? 'modechoice' : 'name');
});
// Tombol kanan: ke halaman Galeri.
document.getElementById('navGalleryBtn').addEventListener('click', ()=>{
  renderGallery(); showScreen('gallery');
});

/* ==================== SCREEN: COVER (ENVELOPE) ==================== */
const envelopeWrap = document.getElementById('envelopeWrap');
const coverInner = document.getElementById('coverInner');
const tapHint = document.getElementById('tapHint');
let coverOpened = false;

envelopeWrap.addEventListener('click', () => {
  if (coverOpened) return;
  coverOpened = true;
  envelopeWrap.classList.add('locked','open');
  tapHint.style.opacity = '0';
  setTimeout(() => { coverInner.classList.add('fade-out'); }, 1450);
  setTimeout(() => { showScreen('welcome'); }, 1900);
});

/* ==================== SCREEN: WELCOME (HERO PHOTO — FIXED, ADMIN ONLY) ====================
   Foto sampul sekarang tetap (fixed), diset langsung di HTML sebagai base64.
   Tamu TIDAK bisa lagi mengganti foto ini. Untuk admin mengganti foto:
   ganti nilai src pada <img id="heroImg"> di bagian HTML (screen-welcome). */

document.getElementById('addMomentBtn').addEventListener('click', ()=> showScreen('name'));
document.getElementById('exploreBtn').addEventListener('click', ()=>{ renderGallery(); showScreen('gallery'); });

/* ==================== SCREEN: GALLERY ==================== */
const BULAN_ID = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
function formatTanggalID(isoString){
  const d = new Date(isoString);
  return `${d.getDate()} ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
}
function formatJamID(isoString){
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2,'0');
  const m = d.getMinutes().toString().padStart(2,'0');
  return `${h}.${m} WIB`;
}
/* ==================== POSTER FRAME UNTUK PREVIEW VIDEO ====================
   MASALAH LAMA: kartu grid galeri & bubble story pakai elemen <video
   autoplay loop> buat preview-nya. Efeknya:
   1) Semua video di layar ke-decode & ke-play BARENGAN begitu grid
      dirender -> berat di GPU/CPU, apalagi pas di-scroll cepat (kerasa
      "tersendat"/delay di Chrome Android khususnya, karena decode video
      itu jauh lebih mahal daripada render gambar biasa).
   2) Preview-nya keliatan "autoplay" padahal cuma buat ngasih pratinjau.
   SOLUSI: ambil SATU frame video aja (sekali per video, di-cache), jadiin
   gambar diam (data URL), lalu pakai <img> biasa buat preview-nya. Video
   ASLI-nya baru beneran diputer pas item-nya dibuka (modal/feed/story
   viewer) — bukan di preview kecil. Ini juga otomatis nyelesain "video
   thumbnail item hitam" karena <video preload="metadata"> doang memang
   tidak menggambar frame apa pun sebelum diputar. */
const _videoPosterCache = new Map(); // videoUrl -> Promise<dataURL|null>
function getVideoPoster(videoUrl){
  if(_videoPosterCache.has(videoUrl)) return _videoPosterCache.get(videoUrl);
  const promise = new Promise((resolve)=>{
    const v = document.createElement('video');
    v.crossOrigin = 'anonymous'; // wajib ada, kalau tidak canvas "kena noda" (tainted) & gagal di-capture
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = videoUrl;
    let done = false;
    const finish = (dataUrl)=>{ if(done) return; done = true; resolve(dataUrl); };
    function capture(){
      try{
        const c = document.createElement('canvas');
        c.width = v.videoWidth || 480; c.height = v.videoHeight || 854;
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        finish(c.toDataURL('image/jpeg', 0.82));
      }catch(e){
        finish(null); // kena CORS/gagal capture -> nyerah, jangan sampe balik ke video autoplay
      }
    }
    v.addEventListener('loadeddata', ()=>{
      try{ v.currentTime = Math.min(0.2, (v.duration || 1) / 4); }catch(e){ capture(); }
    }, { once:true });
    v.addEventListener('seeked', capture, { once:true });
    v.addEventListener('error', ()=> finish(null), { once:true });
    setTimeout(()=> finish(null), 6000); // jaga-jaga kalau videonya lelet/gagal dimuat
  });
  _videoPosterCache.set(videoUrl, promise);
  return promise;
}
/* Isi elemen `el` (biasanya <div> placeholder) dengan <img> hasil poster
   frame video. Kalau capture gagal (CORS dsb), placeholder dibiarin kosong
   (bukan balik jadi video autoplay) supaya scroll tetap ringan. */
function fillVideoPoster(el, videoUrl){
  getVideoPoster(videoUrl).then(dataUrl=>{
    if(!dataUrl || !el.isConnected) return;
    const img = document.createElement('img');
    img.src = dataUrl; img.loading = 'lazy';
    el.replaceWith(img);
  });
}

/* ==================== MUSIK LATAR OTOMATIS (BGM) ====================
   Buat foto yang TIDAK disertai VN (voice note) dari tamu, otomatis
   dikasih 1 dari 15 musik latar yang disiapkan di folder music/.
   - "Random tapi TETAP": lagu dipilih dari HASH url foto itu sendiri
     (bukan Math.random()), jadi 1 foto selalu dapet lagu yang SAMA
     setiap kali dibuka/di-refresh — bukan ganti-ganti terus.
   - GANTI/ISI FILE MUSIK: taro 15 file mp3 di folder music/ dengan nama
     persis music/bgm-1.mp3 sampai music/bgm-15.mp3 — TIDAK perlu edit
     kode apa pun, sama seperti pola gambar bingkai foto/video.
   - Video TIDAK kena musik ini (video sudah punya audio rekamannya
     sendiri). VN asli dari tamu SELALU diutamakan di atas musik ini. */
const BGM_COUNT = 15;
function hashStringToInt(str){
  let hash = 0;
  for(let i=0;i<str.length;i++) hash = (hash*31 + str.charCodeAt(i)) >>> 0;
  return hash;
}
function getBgmUrlFor(item){
  const key = item.img || item.name || '';
  const n = (hashStringToInt(key) % BGM_COUNT) + 1;
  return `music/bgm-${n}.mp3`;
}
/* Suara yang beneran dipakai buat 1 item: VN asli kalau ada, kalau nggak
   ada & itu FOTO -> musik latar otomatis. Video dibiarkan apa adanya
   (null di sini, karena video pakai audio bawaan filenya sendiri). */
function resolveAudioUrlFor(item){
  if(item.audioUrl) return item.audioUrl;
  if(item.type === 'video') return null;
  return getBgmUrlFor(item);
}

/* Penjaga "1 suara aktif dalam satu waktu" LINTAS TEMPAT (grid galeri,
   feed, story viewer bisa saja render bareng dalam 1 halaman) — supaya
   nggak numpuk beberapa lagu/VN muter bersamaan. Begitu ada audio baru
   mulai diputer, audio lain yang lagi aktif otomatis di-pause dulu. */
let _activeAmbientAudio = null;
function playAmbientAudio(audioEl){
  if(!audioEl) return;
  if(_activeAmbientAudio && _activeAmbientAudio !== audioEl) _activeAmbientAudio.pause();
  _activeAmbientAudio = audioEl;
  audioEl.play().catch(()=>{});
}
function pauseAmbientAudio(audioEl){
  if(!audioEl) return;
  audioEl.pause();
  if(_activeAmbientAudio === audioEl) _activeAmbientAudio = null;
}

function mapManifestList(list){
  if(!Array.isArray(list)) return null;
  return list.map(e => ({
    type: e.type === 'video' ? 'video' : 'photo',
    img: e.imageUrl,
    videoUrl: e.videoUrl || null,
    name: e.name || 'Anonim',
    caption: e.caption || '',
    hasAudio: !!e.audioUrl,
    audioUrl: e.audioUrl || null,
    audioDurationLabel: e.audioDuration ? fmtTime(e.audioDuration) : '00:00',
    date: e.ts ? formatTanggalID(e.ts) : '',
    time: e.ts ? formatJamID(e.ts) : ''
  }));
}
/* PENTING: manifest galeri diambil LEWAT Worker (bukan langsung ke
   api.github.com dari browser). Alasannya:
   1) Akses langsung dari browser ke api.github.com tanpa token cuma
      dijatah 60 request/jam PER ALAMAT IP — kalau banyak tamu nyambung
      ke WiFi yang sama (misal di venue acara), jatah itu cepat habis.
   2) Worker sudah punya token GitHub sendiri (jatahnya 5000/jam), dan
      Worker jugalah yang mengatur header CORS-nya sendiri secara
      konsisten — jadi tidak ada lagi bedanya perilaku antar browser
      (sebelumnya Safari lebih sering gagal dibanding Chrome karena soal
      ini).
*/
async function fetchGitHubGallery(){
  if(!UPLOAD_ENDPOINT || UPLOAD_ENDPOINT.startsWith('GANTI_')) return null;
  try{
    const res = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getManifest' })
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok){
      console.error('[GitHub] Gagal ambil manifest:', res.status, data.error || data);
      showDebugBanner(`[GitHub] Gagal ambil manifest (${res.status}): ${data.error || 'tidak diketahui'}`);
      return null;
    }
    return mapManifestList(data.list || []);
  }catch(e){
    console.error('[GitHub] Error ambil manifest:', e);
    showDebugBanner(`[GitHub] Error ambil manifest: ${e && e.message ? e.message : e}`);
    return null;
  }
}
let galleryItemsAll = [];
let galleryFilter = 'all';

function updateGalleryStats(items){
  const photoCount = items.filter(i => i.type !== 'video').length;
  const videoCount = items.filter(i => i.type === 'video').length;
  const guestSet = new Set(items.map(i => (i.name || 'Anonim').trim().toLowerCase()));
  document.getElementById('statMomen').textContent = items.length;
  document.getElementById('statVideo').textContent = videoCount;
  document.getElementById('statTamu').textContent = guestSet.size;
}

function renderGalleryGrid(items){
  const grid = document.getElementById('galleryGrid');
  const empty = document.getElementById('galleryEmpty');
  grid.innerHTML = '';

  const filtered = galleryFilter === 'all' ? items : items.filter(i => (galleryFilter === 'video' ? i.type === 'video' : i.type !== 'video'));

  if(filtered.length === 0){
    empty.style.display = 'block';
    grid.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  grid.style.display = 'grid';

  // PENTING: kartu grid ini SENGAJA diem total, gak ada audio/musik apa
  // pun yang autoplay di sini. Musik/VN baru mulai keputer begitu item-nya
  // di-TAP (buka modal, yang pakai fungsi Feed) atau dibuka di story viewer.
  // Semua item langsung dirender sekaligus (tanpa batas/"+N lagi"),
  // grid akan terus memanjang ke bawah mengikuti jumlah momen.
  filtered.forEach(item=>{
    const card = document.createElement('div');
    card.className = 'gallery-card';
    if(item.type === 'video'){
      card.innerHTML = `<div class="video-thumb-ph"></div>
        <div class="grid-icon"><svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg></div>`;
      fillVideoPoster(card.querySelector('.video-thumb-ph'), item.videoUrl);
    } else {
      card.innerHTML = `<img src="${item.img}" loading="lazy">${item.hasAudio ? '<div class="grid-icon"><svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg></div>' : ''}`;
    }
    card.addEventListener('click', ()=> openPhotoModal(item));
    grid.appendChild(card);
  });
}

document.querySelectorAll('.gallery-tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    if(tab.classList.contains('active')) return;
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    galleryFilter = tab.dataset.filter;
    renderGalleryGrid(galleryItemsAll);
  });
});

async function renderGallery(){
  const grid = document.getElementById('galleryGrid');
  const empty = document.getElementById('galleryEmpty');
  empty.style.display = 'none';
  grid.style.display = 'grid';
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--cream-dim);padding:30px 0;font-size:13px;letter-spacing:0.08em;">MEMUAT MOMEN…</div>';

  const githubItems = await fetchGitHubGallery();
  const items = (githubItems && githubItems.length) ? githubItems : state.gallery;
  galleryItemsAll = items;

  updateGalleryStats(items);

  if(items.length === 0){
    grid.innerHTML = '';
    empty.style.display = 'block';
    grid.style.display = 'none';
    storiesRow.querySelectorAll('.story-bubble').forEach(b=> b.remove());
    return;
  }
  renderGalleryGrid(items);
  renderStoriesRow(items);
}

/* ==================== MODAL: FEED ALA IG ====================
   Semua momen dirender sebagai satu feed yang bisa discroll ke bawah
   (mirip buka foto di IG). Tiap post: header (avatar + nama tamu +
   tombol unduh), media (foto/video), ikon aksi (like & komentar —
   visual saja, tanpa data tersimpan), lalu caption + tanggal/jam.
   Video & voice note otomatis play/pause sendiri sesuai post mana
   yang sedang kelihatan di layar (pakai IntersectionObserver, mirip
   perilaku Reels). Data (nama, caption, tanggal, jam, link suara)
   sudah data asli dari manifest.json GitHub, bukan dummy. */
const photoModal = document.getElementById('photoModal');
const feedContainer = document.getElementById('feedContainer');
const AVATAR_COLORS = ['#e2c58b','#c9a463','#d9c9ac','#f3e8d6'];

function avatarColorFor(name){
  const str = (name || 'A').trim();
  let hash = 0;
  for(let i=0;i<str.length;i++) hash = (hash*31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

let feedObserver = null;
let feedRenderedForItems = null;

function buildFeedPost(item){
  const post = document.createElement('div');
  post.className = 'ig-post';
  const name = item.name || 'Anonim';
  const initial = name.trim().charAt(0).toUpperCase() || 'A';

  const header = document.createElement('div');
  header.className = 'ig-post-header';
  const avatar = document.createElement('div');
  avatar.className = 'ig-avatar';
  avatar.style.background = avatarColorFor(name);
  avatar.textContent = initial;
  const headName = document.createElement('div');
  headName.className = 'ig-post-headname';
  headName.innerHTML = `<span class="n">${name}</span>`;
  const dlBtn = document.createElement('a');
  dlBtn.className = 'ig-download-btn';
  dlBtn.href = item.type === 'video' ? item.videoUrl : item.img;
  dlBtn.setAttribute('download', item.type === 'video' ? 'wedding-memories-video.mp4' : 'wedding-memories.jpg');
  dlBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M11 3h2v10.17l3.59-3.58L18 11l-6 6-6-6 1.41-1.41L11 13.17V3zM5 19h14v2H5v-2z"/></svg>';
  header.appendChild(avatar); header.appendChild(headName); header.appendChild(dlBtn);

  const media = document.createElement('div');
  media.className = 'ig-post-media';
  let videoEl = null, audioEl = null;

  if(item.type === 'video'){
    media.innerHTML = `
      <div class="ig-video-frame">
        <video playsinline loop src="${item.videoUrl}"></video>
        <button class="ig-video-mute-btn" aria-label="Suara">
          <svg viewBox="0 0 24 24"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        </button>
        <button class="ig-video-tap" aria-label="Putar/Jeda">
          <svg class="ig-video-center-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div class="ig-video-progress-track"><div class="ig-video-progress-fill"></div></div>
      </div>`;
    const frame = media.querySelector('.ig-video-frame');
    videoEl = media.querySelector('video');
    const muteBtn = media.querySelector('.ig-video-mute-btn');
    const muteIcon = muteBtn.querySelector('svg');
    const tapLayer = media.querySelector('.ig-video-tap');
    const progressFill = media.querySelector('.ig-video-progress-fill');
    videoEl.muted = false;
    tapLayer.addEventListener('click', ()=>{
      if(videoEl.paused){ videoEl.play().catch(()=>{}); } else { videoEl.pause(); }
    });
    videoEl.addEventListener('play', ()=> frame.classList.add('playing'));
    videoEl.addEventListener('pause', ()=> frame.classList.remove('playing'));
    videoEl.addEventListener('timeupdate', ()=>{
      if(videoEl.duration){ progressFill.style.width = ((videoEl.currentTime / videoEl.duration) * 100) + '%'; }
    });
    muteBtn.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      videoEl.muted = !videoEl.muted;
      muteIcon.innerHTML = videoEl.muted
        ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.8L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
        : '<path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
    });
  } else {
    const img = document.createElement('img');
    img.src = item.img; img.loading = 'lazy';
    media.appendChild(img);
    if(resolveAudioUrlFor(item)){
      audioEl = new Audio(resolveAudioUrlFor(item));
      audioEl.loop = true;
    }
  }

  const actions = document.createElement('div');
  actions.className = 'ig-post-actions';
  actions.innerHTML = `
    <button class="ig-action-btn ig-like-btn" aria-label="Suka">
      <svg viewBox="0 0 24 24"><path d="M12.1 21.35l-1.1-1.02C6.14 15.99 3 13.14 3 9.64 3 6.78 5.24 4.5 8.1 4.5c1.62 0 3.17.76 4.15 1.97C13.24 5.26 14.79 4.5 16.4 4.5 19.26 4.5 21.5 6.78 21.5 9.64c0 3.5-3.14 6.35-7.99 10.7l-1.4 1.01z"/></svg>
    </button>
    <button class="ig-action-btn" aria-label="Komentar">
      <svg viewBox="0 0 24 24"><path d="M12 3C6.48 3 2 6.94 2 11.5c0 2.36 1.19 4.49 3.11 5.99C4.9 18.87 4.24 20.35 4 21c1.6-.34 3.03-1.13 3.87-1.65.99.31 2.04.48 3.13.48 5.52 0 10-3.94 10-8.83S17.52 3 12 3z"/></svg>
    </button>`;
  actions.querySelector('.ig-like-btn').addEventListener('click', function(){
    this.classList.toggle('liked');
  });

  const captionWrap = document.createElement('div');
  if(item.caption){
    captionWrap.className = 'ig-post-caption';
    captionWrap.innerHTML = `<span class="n">${name}</span>${item.caption}`;
  }

  const metaWrap = document.createElement('div');
  metaWrap.className = 'ig-post-meta';
  metaWrap.textContent = [item.date, item.time].filter(Boolean).join(' • ');

  post.appendChild(header);
  post.appendChild(media);
  post.appendChild(actions);
  if(item.caption) post.appendChild(captionWrap);
  post.appendChild(metaWrap);

  post._videoEl = videoEl;
  post._audioEl = audioEl;
  return post;
}

function renderFeed(items){
  feedContainer.innerHTML = '';
  if(feedObserver) feedObserver.disconnect();

  const posts = items.map(item => buildFeedPost(item));
  posts.forEach(p => feedContainer.appendChild(p));

  feedObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const post = entry.target;
      if(entry.isIntersecting && entry.intersectionRatio >= 0.6){
        if(post._videoEl){ post._videoEl.play().catch(()=>{}); }
        if(post._audioEl){ post._audioEl.currentTime = 0; playAmbientAudio(post._audioEl); }
      } else {
        if(post._videoEl){ post._videoEl.pause(); }
        if(post._audioEl){ pauseAmbientAudio(post._audioEl); }
      }
    });
  }, { root: feedContainer, threshold: [0, 0.6, 1] });

  posts.forEach(p => feedObserver.observe(p));
  feedRenderedForItems = items;
  return posts;
}

function openPhotoModal(item){
  const items = galleryItemsAll.length ? galleryItemsAll : [item];
  const posts = renderFeed(items);
  const idx = items.indexOf(item);
  photoModal.classList.add('active');
  bottomNav.classList.remove('visible'); // modal ini nutupin sampai bawah, nav bar-nya harus ilang dulu
  if(idx > 0 && posts[idx]){
    // langsung lompat ke post yang di-tap tanpa animasi scroll
    posts[idx].scrollIntoView({ block:'start' });
  } else {
    feedContainer.scrollTop = 0;
  }
}
function closeFeed(){
  photoModal.classList.remove('active');
  bottomNav.classList.toggle('visible', SCREENS_WITH_BOTTOM_NAV.includes(currentScreenName)); // balikin nav bar sesuai screen yang lagi aktif di belakangnya
  feedContainer.querySelectorAll('.ig-post').forEach(post=>{
    if(post._videoEl){ post._videoEl.pause(); }
    if(post._audioEl){ pauseAmbientAudio(post._audioEl); }
  });
}
document.getElementById('modalCloseBtn').addEventListener('click', closeFeed);

/* ==================== STORIES ROW + STORY VIEWER (kaya IG) ====================
   Baris lingkaran di atas grid galeri (cincin gradien pelangi khas IG).
   Setiap foto/video tamu juga tampil di sini. Diklik -> full-screen,
   auto-lanjut ke story berikutnya, tap kiri/kanan buat mundur/maju,
   TANPA kolom like/komentar/kirim — cuma nama & tombol tutup. */
const storiesRow = document.getElementById('storiesRow');
const storyViewer = document.getElementById('storyViewer');
const storyProgressRow = document.getElementById('storyProgressRow');
const storyAvatarEl = document.getElementById('storyAvatar');
const storyNameEl = document.getElementById('storyName');
const storyImgEl = document.getElementById('storyImg');
const storyVideoEl = document.getElementById('storyVideo');

let storyItems = [];
let storyIndex = 0;
let storyTimer = null;
let storyStartTs = 0;
let storyDurationMs = 5000;
let storyAudioEl = null;
const STORY_PHOTO_MS = 5000;

function renderStoriesRow(items){
  storiesRow.querySelectorAll('.story-bubble').forEach(b=> b.remove());
  items.forEach((item, idx)=>{
    const bubble = document.createElement('div');
    bubble.className = 'story-bubble';
    const name = item.name || 'Anonim';
    bubble.innerHTML = `
      <div class="story-ring"><div class="story-ring-inner">${item.type === 'video' ? '<div class="video-thumb-ph"></div>' : `<img src="${item.img}" loading="lazy">`}</div></div>
      <div class="story-bubble-name">${name}</div>`;
    if(item.type === 'video'){
      fillVideoPoster(bubble.querySelector('.video-thumb-ph'), item.videoUrl);
    }
    bubble.addEventListener('click', ()=> openStoryViewer(items, idx));
    storiesRow.appendChild(bubble);
  });
}

function buildStoryProgressBars(count){
  storyProgressRow.innerHTML = '';
  for(let i=0;i<count;i++){
    const seg = document.createElement('div');
    seg.className = 'story-progress-seg';
    seg.innerHTML = '<div class="fill"></div>';
    storyProgressRow.appendChild(seg);
  }
}
function setStoryProgressState(idx){
  const segs = storyProgressRow.querySelectorAll('.story-progress-seg .fill');
  segs.forEach((fill, i)=>{
    fill.style.transition = 'none';
    fill.style.width = i < idx ? '100%' : '0%';
  });
}
function animateCurrentSegment(ms){
  const segs = storyProgressRow.querySelectorAll('.story-progress-seg .fill');
  const fill = segs[storyIndex];
  if(!fill) return;
  fill.style.transition = 'none';
  fill.style.width = '0%';
  // paksa reflow biar transisi baru kepakai dari 0%
  void fill.offsetWidth;
  fill.style.transition = `width ${ms}ms linear`;
  fill.style.width = '100%';
}

function stopStoryMedia(){
  storyVideoEl.pause();
  storyVideoEl.removeAttribute('src');
  if(storyAudioEl){ pauseAmbientAudio(storyAudioEl); storyAudioEl = null; }
  if(storyTimer){ clearTimeout(storyTimer); storyTimer = null; }
}

function showStoryAt(idx){
  stopStoryMedia();
  if(idx < 0){ idx = 0; }
  if(idx >= storyItems.length){ closeStoryViewer(); return; }
  storyIndex = idx;
  const item = storyItems[idx];
  const name = item.name || 'Anonim';

  storyNameEl.textContent = name;
  if(item.type === 'video'){
    storyAvatarEl.innerHTML = '<div class="video-thumb-ph"></div>';
    fillVideoPoster(storyAvatarEl.querySelector('.video-thumb-ph'), item.videoUrl);
  } else {
    storyAvatarEl.innerHTML = `<img src="${item.img}">`;
  }

  setStoryProgressState(idx);

  if(item.type === 'video'){
    storyImgEl.style.display = 'none';
    storyVideoEl.style.display = 'block';
    storyVideoEl.src = item.videoUrl;
    storyVideoEl.muted = false;
    storyVideoEl.currentTime = 0;
    storyVideoEl.play().catch(()=>{});
    storyVideoEl.onloadedmetadata = ()=>{
      animateCurrentSegment((storyVideoEl.duration || 8) * 1000);
    };
    storyVideoEl.onended = ()=> showStoryAt(storyIndex + 1);
  } else {
    storyVideoEl.style.display = 'none';
    storyImgEl.style.display = 'block';
    storyImgEl.src = item.img;
    const audioUrl = resolveAudioUrlFor(item);
    if(audioUrl){
      storyAudioEl = new Audio(audioUrl);
      storyAudioEl.loop = true;
      playAmbientAudio(storyAudioEl);
    }
    animateCurrentSegment(STORY_PHOTO_MS);
    storyTimer = setTimeout(()=> showStoryAt(storyIndex + 1), STORY_PHOTO_MS);
  }
}

function openStoryViewer(items, startIdx){
  storyItems = items;
  buildStoryProgressBars(items.length);
  storyViewer.classList.add('active');
  bottomNav.classList.remove('visible');
  showStoryAt(startIdx);
}
function closeStoryViewer(){
  stopStoryMedia();
  storyViewer.classList.remove('active');
  bottomNav.classList.toggle('visible', SCREENS_WITH_BOTTOM_NAV.includes(currentScreenName));
}
document.getElementById('storyCloseBtn').addEventListener('click', closeStoryViewer);
document.getElementById('storyTapLeft').addEventListener('click', ()=> showStoryAt(storyIndex - 1));
document.getElementById('storyTapRight').addEventListener('click', ()=> showStoryAt(storyIndex + 1));

// Tombol "+" ("Baru") di ujung kiri baris story — balik ke halaman pilih
// Foto/Video biar tamu bisa nambah momen lagi. Kalau tamu ini sudah pernah
// isi nama di sesi yang sama (state.name sudah keisi), langsung loncat ke
// halaman pilih mode; kalau belum, diarahkan isi nama dulu (existing flow)
// biar momen barunya tetap ke-atribusi ke nama yang benar.
document.getElementById('addMomentStoryBtn').addEventListener('click', ()=>{
  showScreen(state.name && state.name.trim().length > 0 ? 'modechoice' : 'name');
});

/* ==================== SCREEN: NAME ==================== */
const nameInput = document.getElementById('nameInput');
const nameNextBtn = document.getElementById('nameNextBtn');
nameInput.addEventListener('input', ()=>{
  state.name = nameInput.value.trim();
  nameNextBtn.disabled = state.name.length === 0;
});
nameNextBtn.addEventListener('click', ()=>{
  showScreen('modechoice');
});
document.getElementById('pickPhotoModeBtn').addEventListener('click', ()=>{
  buildFrameCarousel();
  showScreen('frame');
});
document.getElementById('pickVideoModeBtn').addEventListener('click', ()=>{
  showScreen('videorecord');
  startVideoCamera();
});

/* ==================== FRAME DRAWING (shared) ====================
   Urutan gambar: (1) latar sementara -> (2) foto tamu di posisi
   slotRects -> (3) gambar PNG bingkai di atasnya (bagian transparan
   di PNG akan menampilkan foto di baliknya) -> (4) teks nama & tanggal
   digambar terakhir supaya selalu terbaca di atas bingkai. */
function drawFrame(canvas, frame, photos, filter){
  const W = 900, H = frame.slots === 1 ? 1260 : (frame.slots === 2 ? 1440 : 1680);
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = frame.bg;
  ctx.fillRect(0,0,W,H);

  frame.slotRects.forEach((r,i)=>{
    ctx.fillStyle = '#d8d2c4';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    if(photos[i]){ drawImageCover(ctx, photos[i], r.x, r.y, r.w, r.h, filter); }
  });

  drawFrameOverlay(ctx, frame, W, H, () => drawFrame(canvas, frame, photos, filter));

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'italic 500 33px "Cormorant Garamond", serif';
  ctx.fillStyle = frame.accent;
  ctx.fillText('THE WEDDING OF', W/2, H-210);
  ctx.font = '600 60px "Cormorant Garamond", serif';
  ctx.fillText('Agis & Ilmi', W/2, H-138);
  ctx.font = '500 33px Cinzel, serif';
  ctx.fillText('13 AGUSTUS 2026', W/2, H-72);
}
/* Menggambar file PNG bingkai (frame.image) menutupi seluruh canvas.
   Kalau gambar belum selesai dimuat, tunggu lalu panggil ulang onLoaded
   (pola yang sama dipakai drawImageCover untuk foto tamu). */
function drawFrameOverlay(ctx, frame, W, H, onLoaded){
  const img = cachedImage(frame.image);
  if(!img.complete){
    img.onload = onLoaded;
    img.onerror = () => console.warn('[Frame] Gagal memuat gambar bingkai:', frame.image);
    return;
  }
  ctx.drawImage(img, 0, 0, W, H);
}
function drawImageCover(ctx, imgOrDataUrl, dx, dy, dw, dh, filter){
  const img = imgOrDataUrl instanceof HTMLImageElement ? imgOrDataUrl : cachedImage(imgOrDataUrl);
  if(!img.complete){ img.onload = () => drawImageCover(ctx, img, dx, dy, dw, dh, filter); return; }
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const ir = iw/ih, dr = dw/dh;
  let sx, sy, sw, sh;
  if(ir > dr){ sh = ih; sw = ih*dr; sx = (iw-sw)/2; sy = 0; }
  else { sw = iw; sh = iw/dr; sx = 0; sy = (ih-sh)/2; }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  if(filter && filter !== 'original'){
    applyPixelFilter(ctx, dx, dy, dw, dh, filter);
  }
}
/* Filter B&W / Vintage dihitung manual per-piksel (bukan pakai ctx.filter).
   ctx.filter (CSS filter di canvas) dukungannya tidak konsisten di Safari/iOS
   (bisa membuat foto jadi blank/putih di beberapa versi iOS) — cara manual ini
   jalan sama persis di semua browser termasuk iPhone. */
function applyPixelFilter(ctx, x, y, w, h, filter){
  let imgData;
  try{ imgData = ctx.getImageData(x, y, w, h); }
  catch(e){ console.warn('[Filter] Gagal ambil data piksel:', e); return; }
  const d = imgData.data;
  for(let i=0; i<d.length; i+=4){
    let r = d[i], g = d[i+1], b = d[i+2];
    if(filter === 'bw'){
      const gray = r*0.299 + g*0.587 + b*0.114;
      const c = (gray - 128) * 1.05 + 128; // sedikit tambah kontras
      r = g = b = c;
    } else if(filter === 'vintage'){
      const tr = r*0.393 + g*0.769 + b*0.189;
      const tg = r*0.349 + g*0.686 + b*0.168;
      const tb = r*0.272 + g*0.534 + b*0.131;
      r = (tr*0.55 + r*0.45) * 1.02;
      g = (tg*0.55 + g*0.45) * 1.02;
      b = (tb*0.55 + b*0.45) * 1.02;
    }
    d[i]   = Math.max(0, Math.min(255, r));
    d[i+1] = Math.max(0, Math.min(255, g));
    d[i+2] = Math.max(0, Math.min(255, b));
  }
  ctx.putImageData(imgData, x, y);
}
const _imgCache = {};
function cachedImage(src){
  if(_imgCache[src]) return _imgCache[src];
  const img = new Image(); img.src = src; _imgCache[src] = img; return img;
}

/* ==================== SCREEN: FRAME PICKER ==================== */
const frameCarousel = document.getElementById('frameCarousel');
const frameDots = document.getElementById('frameDots');
function buildFrameCarousel(){
  frameCarousel.innerHTML = ''; frameDots.innerHTML = '';
  state.frames.forEach((frame, i)=>{
    const slide = document.createElement('div'); slide.className = 'frame-slide';
    const wrap = document.createElement('div'); wrap.className = 'frame-canvas-wrap';
    const canvas = document.createElement('canvas');
    wrap.appendChild(canvas); slide.appendChild(wrap); frameCarousel.appendChild(slide);
    drawFrame(canvas, frame, [], 'original');
    const dot = document.createElement('div'); dot.className = 'dot' + (i===0?' active':'');
    frameDots.appendChild(dot);
  });
  frameCarousel.scrollTo({left:0});
  state.frameIndex = 0;
}
frameCarousel.addEventListener('scroll', ()=>{
  const idx = Math.round(frameCarousel.scrollLeft / frameCarousel.clientWidth);
  state.frameIndex = Math.max(0, Math.min(state.frames.length-1, idx));
  document.querySelectorAll('#frameDots .dot').forEach((d,i)=> d.classList.toggle('active', i===state.frameIndex));
});
document.getElementById('pickFrameBtn').addEventListener('click', ()=>{
  state.photos = []; state.currentSlot = 0;
  buildSlotsRow(); showScreen('camera'); startCamera();
});

/* ==================== SCREEN: CAMERA ==================== */
const video = document.getElementById('video');
const slotsRow = document.getElementById('slotsRow');
const shutterBtn = document.getElementById('shutterBtn');
const switchCamBtn = document.getElementById('switchCamBtn');
const galleryPickBtn = document.getElementById('galleryPickBtn');
const galleryInput = document.getElementById('galleryInput');
const flashBtn = document.getElementById('flashBtn');
const camHint = document.getElementById('camHint');
let currentStream = null, facingMode = 'user', torchOn = false;

function buildSlotsRow(){
  slotsRow.innerHTML = '';
  const frame = state.frames[state.frameIndex];
  for(let i=0;i<frame.slots;i++){
    const box = document.createElement('div'); box.className = 'slot-box'; box.textContent = i+1;
    slotsRow.appendChild(box);
  }
  refreshSlotsRow();
}
function refreshSlotsRow(){
  const boxes = slotsRow.querySelectorAll('.slot-box');
  boxes.forEach((box,i)=>{
    box.classList.toggle('filled', !!state.photos[i]);
    box.classList.toggle('current', i === state.currentSlot);
    box.innerHTML = state.photos[i] ? `<img src="${state.photos[i]}">` : (i+1);
  });
}
async function startCamera(){
  stopCamera();
  // Reset video element dulu sebelum pasang stream baru — kalau srcObject
  // langsung ditimpa tanpa direset, Safari/WebView iOS kadang "nyangkut"
  // di frame lama (preview jadi hitam) terutama pas gonta-ganti kamera
  // depan/belakang berkali-kali dengan cepat.
  video.srcObject = null;
  try{
    currentStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode }, audio:false });
    video.srcObject = currentStream;
    video.style.setProperty('--mirror', facingMode === 'user' ? -1 : 1);
    // autoplay attribute di HTML kadang tidak konsisten di Safari/WebView
    // iOS, apalagi setelah ganti srcObject berkali-kali — paksa play()
    // secara eksplisit supaya preview tidak nyangkut hitam.
    try{ await video.play(); }catch(playErr){ /* browser lain kadang reject kalau dipanggil lagi, aman diabaikan */ }
    camHint.textContent = '';
  }catch(err){
    camHint.textContent = 'Kamera tidak tersedia atau izin ditolak. Gunakan tombol galeri untuk memilih foto.';
  }
}
function stopCamera(){ if(currentStream){ currentStream.getTracks().forEach(t=>t.stop()); currentStream=null; } }
switchCamBtn.addEventListener('click', ()=>{ facingMode = facingMode === 'user' ? 'environment' : 'user'; startCamera(); });
flashBtn.addEventListener('click', async ()=>{
  if(!currentStream) return;
  const track = currentStream.getVideoTracks()[0];
  const caps = track.getCapabilities ? track.getCapabilities() : {};
  if(caps.torch){
    torchOn = !torchOn;
    try{ await track.applyConstraints({ advanced:[{ torch: torchOn }] }); }catch(e){}
    flashBtn.classList.toggle('on', torchOn);
  }else{ flashBtn.classList.toggle('on'); }
});
function capturePhoto(dataUrl){
  const frame = state.frames[state.frameIndex];
  state.photos[state.currentSlot] = dataUrl;
  if(state.currentSlot < frame.slots - 1){ state.currentSlot++; }
  refreshSlotsRow();
  if(state.photos.filter(Boolean).length >= frame.slots){ stopCamera(); goToReview(); }
}
shutterBtn.addEventListener('click', async ()=>{
  if(!currentStream) return;
  // Pengaman: kalau video belum sempat render frame beneran (dimensi 0,0),
  // coba play() ulang dan tunggu sebentar dulu — supaya tidak nge-capture
  // frame kosong/gelap yang bikin hasil foto tidak normal.
  if(!video.videoWidth || !video.videoHeight){
    try{ await video.play(); }catch(e){}
    await new Promise(r => setTimeout(r, 350));
    if(!video.videoWidth || !video.videoHeight){
      camHint.textContent = 'Kamera belum siap, coba ketuk tombol jepret sekali lagi.';
      return;
    }
  }
  const vw = video.videoWidth, vh = video.videoHeight;
  const side = Math.min(vw, vh);
  // pakai resolusi asli kamera (bukan dipaksa kecil), dibatasi max
  // 1600px biar file tetap wajar tapi jauh lebih tajam dari sebelumnya
  const outSide = Math.min(side, 1600);
  const c = document.createElement('canvas'); c.width = outSide; c.height = outSide;
  const ctx = c.getContext('2d');
  const sx = (vw-side)/2, sy = (vh-side)/2;
  ctx.save();
  if(facingMode === 'user'){ ctx.translate(c.width,0); ctx.scale(-1,1); }
  ctx.drawImage(video, sx, sy, side, side, 0, 0, c.width, c.height);
  ctx.restore();
  capturePhoto(c.toDataURL('image/jpeg', 0.95));
});
galleryPickBtn.addEventListener('click', ()=> galleryInput.click());
galleryInput.addEventListener('change', (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => capturePhoto(ev.target.result);
  reader.readAsDataURL(file);
  galleryInput.value = '';
});

/* ==================== SCREEN: REVIEW ==================== */
const reviewMainImg = document.getElementById('reviewMainImg');
const thumbsRow = document.getElementById('thumbsRow');
const reviewNextBtn = document.getElementById('reviewNextBtn');
let reviewSelectedIndex = 0;
function goToReview(){ reviewSelectedIndex = state.photos.length - 1; renderReview(); showScreen('review'); }
function renderReview(){
  reviewMainImg.src = state.photos[reviewSelectedIndex] || '';
  thumbsRow.innerHTML = '';
  state.photos.forEach((p,i)=>{
    if(!p) return;
    const t = document.createElement('div'); t.className = 'thumb' + (i===reviewSelectedIndex ? ' selected':'');
    t.innerHTML = `<img src="${p}"><button class="del" data-i="${i}">×</button>`;
    t.querySelector('img').addEventListener('click', ()=>{ reviewSelectedIndex = i; renderReview(); });
    t.querySelector('.del').addEventListener('click', (ev)=>{
      ev.stopPropagation();
      state.photos[i] = null; state.currentSlot = i;
      buildSlotsRow(); showScreen('camera'); startCamera();
    });
    thumbsRow.appendChild(t);
  });
  const frame = state.frames[state.frameIndex];
  reviewNextBtn.disabled = state.photos.filter(Boolean).length < frame.slots;
}
reviewNextBtn.addEventListener('click', ()=>{ state.filter = 'original'; renderFilterScreen(); showScreen('filterscreen'); });

/* ==================== SCREEN: FILTER / COMPOSE ==================== */
const filterPills = document.getElementById('filterPills');
const composeCanvas = document.getElementById('composeCanvas');
const FILTERS = [ ['original','Original'], ['bw','Black & White'], ['vintage','Vintage'] ];
function renderFilterScreen(){
  const frame = state.frames[state.frameIndex];
  drawFrame(composeCanvas, frame, state.photos, state.filter);
  filterPills.innerHTML = '';
  FILTERS.forEach(([id,label])=>{
    const pill = document.createElement('div');
    pill.className = 'pill' + (state.filter===id ? '' : ' inactive');
    pill.textContent = label;
    pill.addEventListener('click', ()=>{ state.filter = id; renderFilterScreen(); });
    filterPills.appendChild(pill);
  });
}
document.getElementById('filterNextBtn').addEventListener('click', ()=>{
  const frame = state.frames[state.frameIndex];
  drawFrame(document.getElementById('composeCanvas2'), frame, state.photos, state.filter);
  showScreen('sharechoice');
});
document.getElementById('captionInput').addEventListener('input', (e)=>{
  state.caption = e.target.value;
});

/* ==================== SCREEN: SHARE CHOICE ==================== */
document.getElementById('shareOnlyBtn').addEventListener('click', async ()=>{
  const canvas = document.getElementById('composeCanvas2');
  const dataUrl = canvas.toDataURL('image/jpeg',0.9);
  const filename = uniqueFilename('wedding','jpg');
  const nowIso = new Date().toISOString();
  state.gallery.unshift({ img: dataUrl, name: state.name, caption: state.caption || '', hasAudio:false, audioUrl:null, audioDurationLabel:'00:00', date: formatTanggalID(nowIso), time: formatJamID(nowIso) });
  renderGallery();
  showScreen('gallery');

  const imageUrl = await uploadToGitHub(dataUrl, filename);
  if(imageUrl){
    console.log('[GitHub] Foto tersimpan:', imageUrl);
    await addGalleryEntry({ name: state.name, caption: state.caption || '', imageUrl, audioUrl: null, audioDuration: 0 });
    renderGallery(); // refresh biar data asli (bukan cuma lokal) muncul kalau masih di layar galeri
  }
  // Download foto dipanggil PALING TERAKHIR, setelah semua proses network
  // (upload + simpan manifest) selesai — supaya tidak ada proses network
  // yang keinterupsi gara-gara aksi download.
  downloadCanvas(canvas, filename);
});
document.getElementById('goRecordBtn').addEventListener('click', ()=> showScreen('record'));
/* Pakai blob: URL (bukan data: URI) supaya proses download tidak
   membuat Safari "berpindah halaman" sesaat (yang tadinya bikin proses
   upload keinterupsi). blob: URL adalah cara standar & aman untuk
   trigger download lewat JavaScript di semua browser, termasuk Safari. */
function downloadCanvas(canvas, filename){
  canvas.toBlob((blob)=>{
    if(!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = filename;
    a.href = url;
    a.click();
    setTimeout(()=> URL.revokeObjectURL(url), 30000);
  }, 'image/jpeg', 0.95);
}

/* ==================== SCREEN: RECORD ==================== */
const micBtn = document.getElementById('micBtn');
const recTimer = document.getElementById('recTimer');
const recStatus = document.getElementById('recStatus');
const recWave = document.getElementById('recWave');
const useRecordingBtn = document.getElementById('useRecordingBtn');
const recPermHint = document.getElementById('recPermHint');
const WAVE_BARS = 24;
for(let i=0;i<WAVE_BARS;i++){ const s=document.createElement('span'); recWave.appendChild(s); }
const waveBarEls = recWave.querySelectorAll('span');
let mediaRecorder, audioChunks=[], micStream, isRecording=false, recStart, recInterval;
let audioCtx, analyser, dataArray, rafId;

async function startRec(){
  try{ micStream = await navigator.mediaDevices.getUserMedia({ audio:true }); }
  catch(e){ recPermHint.textContent = 'Izin mikrofon ditolak atau tidak tersedia. Aktifkan akses mikrofon di pengaturan browser.'; return; }
  recPermHint.textContent = '';
  audioChunks = []; state.waveSamples = [];
  mediaRecorder = new MediaRecorder(micStream);
  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
    state.audioBlob = blob; state.audioUrl = URL.createObjectURL(blob);
    micStream.getTracks().forEach(t=>t.stop());
    if(audioCtx){ audioCtx.close(); audioCtx=null; }
    cancelAnimationFrame(rafId);
    waveBarEls.forEach(b=> b.style.height='6px');
    useRecordingBtn.disabled = false;
  };
  mediaRecorder.start();
  isRecording = true;
  micBtn.classList.add('recording');
  recStatus.textContent = 'Sedang merekam… ketuk lagi untuk berhenti';
  useRecordingBtn.disabled = true;
  recStart = Date.now();
  recInterval = setInterval(()=>{
    const secs = (Date.now()-recStart)/1000;
    recTimer.textContent = fmtTime(secs);
    state.audioDuration = secs;
  }, 200);
  setupRecWave();
}
function stopRec(){
  if(mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  isRecording = false;
  micBtn.classList.remove('recording');
  recStatus.textContent = 'Rekaman selesai';
  clearInterval(recInterval);
}
function setupRecWave(){
  audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  const src = audioCtx.createMediaStreamSource(micStream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 64;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  src.connect(analyser);
  let frameCount = 0;
  function draw(){
    analyser.getByteFrequencyData(dataArray);
    waveBarEls.forEach((bar,i)=>{
      const v = dataArray[i % dataArray.length] || 0;
      bar.style.height = Math.max(6, (v/255)*28)+'px';
    });
    frameCount++;
    if(frameCount % 6 === 0){
      const avg = dataArray.reduce((a,b)=>a+b,0)/dataArray.length;
      state.waveSamples.push(avg/255);
    }
    rafId = requestAnimationFrame(draw);
  }
  draw();
}
function fmtTime(s){
  const m = Math.floor(s/60).toString().padStart(2,'0');
  const sec = Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}
micBtn.addEventListener('click', ()=>{ isRecording ? stopRec() : startRec(); });
useRecordingBtn.addEventListener('click', ()=>{
  const frame = state.frames[state.frameIndex];
  drawFrame(document.getElementById('composeCanvas3'), frame, state.photos, state.filter);
  buildFinalWave();
  document.getElementById('finalDur').textContent = fmtTime(state.audioDuration);
  showScreen('final');
});

/* ==================== SCREEN: FINAL ==================== */
const finalWave = document.getElementById('finalWave');
const finalPlayBtn = document.getElementById('finalPlayBtn');
const finalPlayIcon = document.getElementById('finalPlayIcon');
let finalAudioEl = null, finalPlaying = false;
function buildFinalWave(){
  finalWave.innerHTML = '';
  const samples = state.waveSamples.length ? state.waveSamples : Array.from({length:24},()=>Math.random());
  const N = 30;
  for(let i=0;i<N;i++){
    const v = samples[Math.floor(i/N*samples.length)] || 0.2;
    const bar = document.createElement('span');
    bar.style.height = Math.max(4, v*20) + 'px';
    finalWave.appendChild(bar);
  }
}
finalPlayBtn.addEventListener('click', ()=>{
  if(!state.audioUrl) return;
  if(!finalAudioEl){
    finalAudioEl = new Audio(state.audioUrl);
    finalAudioEl.addEventListener('ended', ()=>{ finalPlaying=false; finalPlayIcon.innerHTML='<path d="M8 5v14l11-7z"/>'; });
  }
  if(finalPlaying){ finalAudioEl.pause(); finalPlaying=false; finalPlayIcon.innerHTML='<path d="M8 5v14l11-7z"/>'; }
  else{ finalAudioEl.play(); finalPlaying=true; finalPlayIcon.innerHTML='<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>'; }
});
document.getElementById('finalShareBtn').addEventListener('click', async ()=>{
  const canvas = document.getElementById('composeCanvas3');
  const dataUrl = canvas.toDataURL('image/jpeg',0.9);
  const filename = uniqueFilename('wedding','jpg');
  const nowIso = new Date().toISOString();
  state.gallery.unshift({
    img: dataUrl, name: state.name, caption: state.caption || '', hasAudio: !!state.audioUrl, audioUrl: state.audioUrl || null,
    audioDurationLabel: fmtTime(state.audioDuration || 0), date: formatTanggalID(nowIso), time: formatJamID(nowIso)
  });
  renderGallery();
  showScreen('gallery');

  const imageUrl = await uploadToGitHub(dataUrl, filename);
  if(imageUrl){
    console.log('[GitHub] Foto tersimpan:', imageUrl);
    let audioGithubUrl = null;
    if(state.audioBlob){
      const audioExt = audioExtFromMime(state.audioBlob.type);
      const audioFilename = uniqueFilename('harapan', audioExt);
      audioGithubUrl = await uploadAudioToGitHub(state.audioBlob, audioFilename);
      if(audioGithubUrl) console.log('[GitHub] Suara tersimpan:', audioGithubUrl);
    }
    await addGalleryEntry({ name: state.name, caption: state.caption || '', imageUrl, audioUrl: audioGithubUrl, audioDuration: state.audioDuration || 0 });
    renderGallery(); // refresh biar data asli (bukan cuma lokal) muncul kalau masih di layar galeri
  }

  // Download foto & audio dipanggil PALING TERAKHIR, setelah semua proses
  // network (upload foto, upload audio, simpan manifest) selesai — biar
  // tidak ada proses network yang keinterupsi gara-gara aksi download.
  downloadCanvas(canvas, filename);
  if(state.audioUrl){
    const a = document.createElement('a');
    a.download = 'harapan.' + audioExtFromMime(state.audioBlob ? state.audioBlob.type : '');
    a.href = state.audioUrl; a.click();
  }
});
document.getElementById('reRecordBtn').addEventListener('click', ()=>{
  useRecordingBtn.disabled = true;
  recTimer.textContent = '00:00';
  recStatus.textContent = 'Ketuk mikrofon untuk mulai rekam';
  showScreen('record');
});

/* ==================== MODE: VIDEO ==================== */
const VIDEO_MAX_SECONDS = 15; // otomatis berhenti sendiri kalau sudah 15 detik
function videoExtFromMime(mimeType){
  const t = (mimeType || '').toLowerCase();
  if(t.includes('mp4')) return 'mp4';
  if(t.includes('webm')) return 'webm';
  return 'webm';
}

const videoRecPreview = document.getElementById('videoRecPreview');
const videoRecCanvas = document.getElementById('videoRecCanvas');
const videoRecCtx = videoRecCanvas.getContext('2d');
const videoRecTimerEl = document.getElementById('videoRecTimer');
const videoRecHint = document.getElementById('videoRecHint');
let videoStream = null, videoRecorder = null, videoChunks = [];
let videoRecording = false, videoRecStart = null, videoRecInterval = null;
let videoDrawRAF = null;
state.videoFilter = 'natural';

// Resolusi rekaman ngikutin resolusi kamera ASLI apa adanya (tidak
// dipatok/dibatasi) — supaya hasilnya setajam video biasa, sama seperti
// yang kelihatan di preview.
let REC_W = 480, REC_H = 854; // nilai awal/fallback sebelum kamera nyala
videoRecCanvas.width = REC_W; videoRecCanvas.height = REC_H;

// Dipanggil begitu kamera nyala/ganti kamera, sekali video punya ukuran asli
// (video.videoWidth/Height baru kebaca setelah stream benar-benar jalan).
function updateRecCanvasSize(){
  const vw = videoRecPreview.videoWidth, vh = videoRecPreview.videoHeight;
  if(vw && vh){
    // dibulatkan ke angka genap — sebagian encoder video rewel kalau ukurannya ganjil
    REC_W = vw % 2 === 0 ? vw : vw - 1;
    REC_H = vh % 2 === 0 ? vh : vh - 1;
  }
  videoRecCanvas.width = REC_W; videoRecCanvas.height = REC_H;
}
// Bitrate rekaman HARUS ngikutin resolusi — kalau resolusinya dinaikkan tapi
// bitrate-nya dibiarkan default (kecil), hasilnya pecah/kotak-kotak (over-
// compressed). Makin gede resolusinya, makin gede juga jatah bitrate-nya.
function computeVideoBitrate(w, h){
  const px = w * h;
  if(px >= 1280*720) return 6_000_000;   // >= HD 720p ke atas
  if(px >= 854*480)  return 3_500_000;   // sekitar SD/480p
  return 2_000_000;                      // di bawah itu
}

function setVideoFilter(f){ state.videoFilter = f; }

// Gambar 1 frame video ke canvas tujuan dengan crop "cover" (isi penuh,
// dipotong bagian tepi kalau rasio beda) + mirror kalau kamera depan.
function drawVideoCover(ctx, video, destW, destH, mirror){
  const vw = video.videoWidth, vh = video.videoHeight;
  if(!vw || !vh) return;
  const vr = vw/vh, dr = destW/destH;
  let sx, sy, sw, sh;
  if(vr > dr){ sh = vh; sw = vh*dr; sx = (vw-sw)/2; sy = 0; }
  else { sw = vw; sh = vw/dr; sx = 0; sy = (vh-sh)/2; }
  ctx.save();
  if(mirror){ ctx.translate(destW, 0); ctx.scale(-1, 1); }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, destW, destH);
  ctx.restore();
}
/* Bingkai video: file PNG di img/video-frame.png, digambar menutupi
   seluruh canvas persis seperti drawFrameOverlay() buat foto — supaya
   ganti desainnya juga sama gampangnya: timpa file img/video-frame.png,
   TIDAK perlu edit kode. Bagian tengah PNG-nya HARUS transparan (dekorasi
   cukup di kiri-kanan saja) supaya orangnya tetap kelihatan penuh di video. */
const VIDEO_FRAME_IMAGE = 'img/video-frame.png';
function drawVideoFrameOverlay(ctx, W, H){
  const img = cachedImage(VIDEO_FRAME_IMAGE);
  if(!img.complete){
    img.onerror = () => console.warn('[Frame Video] Gagal memuat gambar bingkai:', VIDEO_FRAME_IMAGE);
    return; // frame berikutnya (RAF) otomatis nyoba gambar lagi begitu sudah kemuat
  }
  ctx.drawImage(img, 0, 0, W, H);
}
/* ==================== RESEP FILTER VIDEO: NATURAL & IVORY ====================
   Sengaja TIDAK pakai teknik blur/downscale apa pun (tidak ada
   downsample->upsample, tidak ada ctx.filter blur). Efeknya murni "color
   grading" — sapuan warna lewat canvas composite blend di atas frame
   video ASLI apa adanya, jadi hasilnya tetap tajam/tegas. */
const VIDEO_FILTERS = {
  natural: { layers: [] }, // bawaan HP, apa adanya tanpa olahan sama sekali
  ivory: { layers: [
    { mode:'overlay', color:'rgba(250,240,222,0.18)' },
    { mode:'screen',  color:'rgba(255,255,255,0.05)' },
  ]},
};

function renderVideoFrame(){
  videoDrawRAF = requestAnimationFrame(renderVideoFrame);
  if(!videoStream || videoRecPreview.readyState < 2) return;
  const mirror = state.videoFacingMode === 'user';
  const recipe = VIDEO_FILTERS[state.videoFilter] || VIDEO_FILTERS.natural;

  // Dasar: video asli penuh, tajam apa adanya — TIDAK ada blur di sini.
  drawVideoCover(videoRecCtx, videoRecPreview, REC_W, REC_H, mirror);

  // Tumpuk tiap layer warna/kontras. Semua pakai fillRect polos (bukan
  // drawImage versi kecil/blur), makanya hasilnya tetap tegas & detail.
  for(const layer of recipe.layers){
    videoRecCtx.save();
    videoRecCtx.globalCompositeOperation = layer.mode;
    if(layer.alpha != null) videoRecCtx.globalAlpha = layer.alpha;
    videoRecCtx.fillStyle = layer.color;
    videoRecCtx.fillRect(0, 0, REC_W, REC_H);
    videoRecCtx.restore();
  }

  // Bingkai video (img/video-frame.png) digambar PALING ATAS, setelah warna,
  // supaya bingkainya nggak ikut ketiban tint filter. Ikut kerekam ke hasil
  // akhir karena yang direkam adalah canvas ini (bukan video mentah).
  drawVideoFrameOverlay(videoRecCtx, REC_W, REC_H);
}

async function startVideoCamera(){
  stopVideoCamera();
  videoRecPreview.srcObject = null;
  try{
    videoStream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode: state.videoFacingMode }, audio:true
    });
    videoRecPreview.srcObject = videoStream;
    try{ await videoRecPreview.play(); }catch(e){}
    updateRecCanvasSize(); // baca resolusi asli kamera begitu stream jalan
    videoRecHint.textContent = '';
    if(!videoDrawRAF) renderVideoFrame();
  }catch(err){
    videoRecHint.textContent = 'Kamera/mikrofon tidak tersedia atau izin ditolak.';
  }
}
function stopVideoCamera(){
  if(videoStream){ videoStream.getTracks().forEach(t=>t.stop()); videoStream=null; }
  if(videoDrawRAF){ cancelAnimationFrame(videoDrawRAF); videoDrawRAF = null; }
}
document.getElementById('switchVideoCamBtn').addEventListener('click', ()=>{
  if(videoRecording) return; // jangan ganti kamera pas lagi rekam
  state.videoFacingMode = state.videoFacingMode === 'user' ? 'environment' : 'user';
  startVideoCamera();
});

function fmtVideoTimer(secs){
  const m = Math.floor(secs/60), s = secs%60;
  return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

/* ==================== PILIH FILTER (swipe atau tap) ====================
   Alurnya sekarang 2 tahap, bukan langsung rekam:
   1) Tap filter lain, ATAU swipe sampai filter itu ke tengah -> cuma
      PILIH & PREVIEW filter itu (langsung kelihatan di layar), belum rekam.
   2) Tap LAGI di filter yang sudah terpilih (yang lagi nyala/di tengah)
      -> baru mulai rekam pakai filter itu.
   Tap di filter yang sedang rekam -> berhenti rekam (perilaku lama, tetap). */
const reelsFilterRowEl = document.getElementById('reelsFilterRow');
const reelsFilterBtns = Array.from(document.querySelectorAll('.reels-filter-btn'));

function selectFilter(btn, {scrollIntoView = true} = {}){
  reelsFilterBtns.forEach(b=> b.classList.remove('selected'));
  btn.classList.add('selected');
  setVideoFilter(btn.dataset.filter);
  if(scrollIntoView){
    btn.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
  }
}

reelsFilterBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    if(!videoStream){ videoRecHint.textContent = 'Kamera belum siap.'; return; }
    if(videoRecording){
      // pas lagi rekam, cuma tombol yang aktif rekam yang boleh dipencet (buat stop)
      if(btn.classList.contains('recording')) stopVideoRecording();
      return;
    }
    if(btn.classList.contains('selected')){
      // sudah dipilih sebelumnya -> tap ke-2 ini baru mulai rekam
      startVideoRecording(btn);
    } else {
      // baru pertama kali di-tap -> cuma pilih & preview dulu
      selectFilter(btn);
    }
  });
});

// Swipe: begitu geseran berhenti, filter yang paling dekat ke tengah
// otomatis jadi "terpilih" (preview ikut update) — tanpa perlu tap.
let filterScrollDebounce = null;
reelsFilterRowEl.addEventListener('scroll', ()=>{
  if(videoRecording) return;
  clearTimeout(filterScrollDebounce);
  filterScrollDebounce = setTimeout(()=>{
    const rowRect = reelsFilterRowEl.getBoundingClientRect();
    const centerX = rowRect.left + rowRect.width/2;
    let closest = null, closestDist = Infinity;
    reelsFilterBtns.forEach(b=>{
      const r = b.getBoundingClientRect();
      const dist = Math.abs((r.left + r.width/2) - centerX);
      if(dist < closestDist){ closestDist = dist; closest = b; }
    });
    if(closest) selectFilter(closest, {scrollIntoView:false});
  }, 120);
});

function startVideoRecording(activeBtn){
  videoChunks = [];
  let mimeType = '';
  // Safari/iOS cuma bisa MediaRecorder ke video/mp4, Chrome/Android ke video/webm.
  // Coba beberapa opsi, pakai yang didukung browser-nya duluan.
  const candidates = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  for(const c of candidates){
    if(window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)){ mimeType = c; break; }
  }
  // Sumber rekaman sekarang canvas yang sudah diproses (bukan video mentah) +
  // audio dari mikrofon — ini yang bikin filter "Beauty" ikut kebawa ke hasil
  // akhir, bukan cuma tampilan preview.
  let recordStream;
  try{
    const canvasStream = videoRecCanvas.captureStream(24);
    const audioTracks = videoStream.getAudioTracks();
    recordStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);
  }catch(e){
    videoRecHint.textContent = 'Perekaman ter-filter tidak didukung di browser ini.';
    return;
  }
  try{
    const recOpts = { videoBitsPerSecond: computeVideoBitrate(REC_W, REC_H) };
    if(mimeType) recOpts.mimeType = mimeType;
    videoRecorder = new MediaRecorder(recordStream, recOpts);
  }catch(e){
    videoRecHint.textContent = 'Perekaman video tidak didukung di browser ini.';
    return;
  }
  videoRecorder.ondataavailable = e => { if(e.data && e.data.size) videoChunks.push(e.data); };
  videoRecorder.onstop = onVideoRecordingStop;
  videoRecorder.start();
  videoRecording = true;
  if(activeBtn) activeBtn.classList.add('recording');
  reelsFilterBtns.forEach(b=>{ if(b !== activeBtn) b.disabled = true; });
  reelsFilterRowEl.style.overflowX = 'hidden'; // kunci swipe selama rekam
  videoRecTimerEl.style.display = 'block';
  videoRecStart = Date.now();
  videoRecTimerEl.textContent = fmtVideoTimer(0);
  videoRecInterval = setInterval(()=>{
    const secs = Math.floor((Date.now()-videoRecStart)/1000);
    videoRecTimerEl.textContent = fmtVideoTimer(secs);
    if(secs >= VIDEO_MAX_SECONDS) stopVideoRecording();
  }, 250);
}
function stopVideoRecording(){
  if(videoRecorder && videoRecorder.state !== 'inactive') videoRecorder.stop();
  clearInterval(videoRecInterval);
  videoRecording = false;
  reelsFilterBtns.forEach(b=>{ b.classList.remove('recording'); b.disabled = false; });
  reelsFilterRowEl.style.overflowX = 'auto'; // buka kunci swipe lagi
}
function onVideoRecordingStop(){
  const mimeType = videoRecorder.mimeType || 'video/webm';
  const blob = new Blob(videoChunks, { type: mimeType });
  if(state.videoUrl) URL.revokeObjectURL(state.videoUrl);
  state.videoBlob = blob;
  state.videoUrl = URL.createObjectURL(blob);
  stopVideoCamera();
  videoRecTimerEl.style.display = 'none';
  document.getElementById('videoPreviewPlayer').src = state.videoUrl;
  showScreen('videopreview');
}

document.getElementById('videoUseBtn').addEventListener('click', ()=>{
  document.getElementById('videoPreviewPlayer').pause();
  const thumb = document.getElementById('videoShareThumb');
  thumb.src = state.videoUrl;
  showScreen('videoshare');
});
document.getElementById('videoRetakeBtn').addEventListener('click', ()=>{
  document.getElementById('videoPreviewPlayer').pause();
  if(state.videoUrl){ URL.revokeObjectURL(state.videoUrl); state.videoUrl = null; state.videoBlob = null; }
  showScreen('videorecord');
  startVideoCamera();
});
document.getElementById('videoCaptionInput').addEventListener('input', (e)=>{
  state.videoCaption = e.target.value;
});

document.getElementById('videoShareBtn').addEventListener('click', async ()=>{
  const shareBtn = document.getElementById('videoShareBtn');
  if(!state.videoBlob) return;
  document.getElementById('videoShareThumb').pause();
  shareBtn.disabled = true;
  shareBtn.textContent = 'Mengunggah…';

  const nowIso = new Date().toISOString();
  state.gallery.unshift({
    type:'video', videoUrl: state.videoUrl, name: state.name, caption: state.videoCaption || '',
    hasAudio:false, audioUrl:null, date: formatTanggalID(nowIso), time: formatJamID(nowIso)
  });
  renderGallery();
  showScreen('gallery');

  try{
    const dataUrl = await blobToBase64(state.videoBlob);
    const ext = videoExtFromMime(state.videoBlob.type);
    const filename = uniqueFilename('video', ext);
    const uploadedUrl = await uploadFileToGitHub(dataUrl, filename);
    if(uploadedUrl){
      console.log('[GitHub] Video tersimpan:', uploadedUrl);
      await addGalleryEntry({ type:'video', name: state.name, caption: state.videoCaption || '', videoUrl: uploadedUrl });
      renderGallery();
    }
  }catch(e){
    console.error('[Upload] Gagal upload video:', e);
    showDebugBanner(`[Upload] Gagal upload video: ${e && e.message ? e.message : e}`);
  }

  shareBtn.disabled = false;
  shareBtn.textContent = 'Bagikan Momen';
});

