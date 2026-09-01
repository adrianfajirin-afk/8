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
  audioBlob: null,
  audioUrl: null,
  audioDuration: 0,
  waveSamples: [],
  gallery: [],
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
  const base64 = dataUrl.split(',')[1];
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
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelector(`.screen[data-screen="${name}"]`).classList.add('active');
}
document.querySelectorAll('[data-back]').forEach(btn=>{
  btn.addEventListener('click', ()=> showScreen(btn.dataset.back));
});
document.querySelectorAll('[data-goto-name]').forEach(btn=>{
  btn.addEventListener('click', ()=> showScreen('name'));
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
function mapManifestList(list){
  if(!Array.isArray(list)) return null;
  return list.map(e => ({
    img: e.imageUrl,
    name: e.name || 'Anonim',
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
async function renderGallery(){
  const grid = document.getElementById('galleryGrid');
  const empty = document.getElementById('galleryEmpty');
  empty.style.display = 'none';
  grid.style.display = 'grid';
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--cream-dim);padding:30px 0;font-size:13px;letter-spacing:0.08em;">MEMUAT MOMEN…</div>';

  const githubItems = await fetchGitHubGallery();
  const items = (githubItems && githubItems.length) ? githubItems : state.gallery;

  grid.innerHTML = '';
  if(items.length === 0){
    empty.style.display = 'block';
    grid.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  grid.style.display = 'grid';
  items.forEach(item=>{
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `<img src="${item.img}" loading="lazy"><div class="meta"><span>${item.name || 'Anonim'}</span>${item.hasAudio ? '♪' : ''}</div>`;
    card.addEventListener('click', ()=> openPhotoModal(item));
    grid.appendChild(card);
  });
}

/* ==================== MODAL: DETAIL FOTO GALERI ====================
   Data di modal ini sudah data asli (nama, tanggal/waktu kirim, dan
   link suara) yang datang dari manifest.json di GitHub — bukan dummy
   lagi. Kalau momen itu memang tidak menyertakan suara, kotak pemutar
   suara otomatis disembunyikan. */
const photoModal = document.getElementById('photoModal');
let currentModalItem = null;
let modalAudioEl = null, modalPlaying = false;

function setModalPlayIcon(playing){
  document.getElementById('modalPlayIcon').innerHTML = playing
    ? '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';
}
function openPhotoModal(item){
  currentModalItem = item;
  if(modalAudioEl){ modalAudioEl.pause(); modalAudioEl = null; }
  modalPlaying = false; setModalPlayIcon(false);

  document.getElementById('modalImg').src = item.img;
  const dlBtn = document.getElementById('modalDownloadBtn');
  dlBtn.href = item.img; dlBtn.setAttribute('download', 'wedding-memories.jpg');
  document.getElementById('modalSender').textContent = item.name || 'Anonim';
  document.getElementById('modalDate').textContent = item.date || '';
  document.getElementById('modalTime').textContent = item.time || '';

  const audioPill = document.getElementById('modalAudioPill');
  if(item.audioUrl){
    audioPill.style.display = 'flex';
    document.getElementById('modalDur').textContent = item.audioDurationLabel || '00:00';
    const wave = document.getElementById('modalWave');
    wave.innerHTML = '';
    for(let i=0;i<26;i++){
      const s = document.createElement('span');
      s.style.height = (6 + Math.random()*16) + 'px';
      wave.appendChild(s);
    }
  } else {
    audioPill.style.display = 'none';
  }
  photoModal.classList.add('active');
}
document.getElementById('modalCloseBtn').addEventListener('click', ()=>{
  photoModal.classList.remove('active');
  if(modalAudioEl){ modalAudioEl.pause(); }
});
document.getElementById('modalPlayBtn').addEventListener('click', ()=>{

  // Tahap tampilan: kalau item ini punya audio asli (dibuat di sesi
  // ini sendiri) tombol play sudah berfungsi. Untuk item tanpa audio
  // asli (dummy), tombol tetap tampil tapi belum memutar apa-apa —
  // menunggu tahap upload VN ke server.
  const item = currentModalItem;
  if(!item || !item.audioUrl) return;
  if(!modalAudioEl){
    modalAudioEl = new Audio(item.audioUrl);
    modalAudioEl.addEventListener('ended', ()=>{ modalPlaying = false; setModalPlayIcon(false); });
  }
  if(modalPlaying){ modalAudioEl.pause(); modalPlaying = false; setModalPlayIcon(false); }
  else{ modalAudioEl.play(); modalPlaying = true; setModalPlayIcon(true); }
});

/* ==================== SCREEN: NAME ==================== */
const nameInput = document.getElementById('nameInput');
const nameNextBtn = document.getElementById('nameNextBtn');
nameInput.addEventListener('input', ()=>{
  state.name = nameInput.value.trim();
  nameNextBtn.disabled = state.name.length === 0;
});
nameNextBtn.addEventListener('click', ()=>{
  buildFrameCarousel();
  showScreen('frame');
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

/* ==================== SCREEN: SHARE CHOICE ==================== */
document.getElementById('shareOnlyBtn').addEventListener('click', async ()=>{
  const canvas = document.getElementById('composeCanvas2');
  const dataUrl = canvas.toDataURL('image/jpeg',0.9);
  const filename = uniqueFilename('wedding','jpg');
  const nowIso = new Date().toISOString();
  state.gallery.unshift({ img: dataUrl, name: state.name, hasAudio:false, audioUrl:null, audioDurationLabel:'00:00', date: formatTanggalID(nowIso), time: formatJamID(nowIso) });
  renderGallery();
  showScreen('gallery');

  const imageUrl = await uploadToGitHub(dataUrl, filename);
  if(imageUrl){
    console.log('[GitHub] Foto tersimpan:', imageUrl);
    await addGalleryEntry({ name: state.name, imageUrl, audioUrl: null, audioDuration: 0 });
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
    img: dataUrl, name: state.name, hasAudio: !!state.audioUrl, audioUrl: state.audioUrl || null,
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
    await addGalleryEntry({ name: state.name, imageUrl, audioUrl: audioGithubUrl, audioDuration: state.audioDuration || 0 });
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
