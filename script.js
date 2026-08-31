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

   3) DESAIN BINGKAI FOTO (frame) di bawah ini — boleh diubah:
      - label   : nama bingkai yang tampil ke tamu
      - slots   : jumlah foto dalam satu bingkai (1, 2, atau 3)
      - bg      : warna latar bingkai (kode warna HTML, contoh '#f6ece0')
      - accent  : warna teks/garis utama
      - accent2 : warna garis sekunder/ornamen
   ===================================================================== */

/* ==================== STATE ==================== */
const state = {
  name: '',
  frames: [
    { id:'a', label:'Merah Klasik', slots:3, bg:'#f6ece0', accent:'#8a2530', accent2:'#c9a463' },
    { id:'b', label:'Mawar Senja',  slots:2, bg:'#fbeee0', accent:'#c9743a', accent2:'#e2b06a' },
    { id:'c', label:'Taman Hijau',  slots:1, bg:'#f3f0e6', accent:'#5c7048', accent2:'#a9b98c' },
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

/* ==================== FOTO UPLOAD (via Worker proxy) ====================
   Browser TIDAK pernah menyimpan/meminta token GitHub. Foto dikirim ke
   Worker (server kecil) yang menyimpan token secara aman, lalu Worker
   yang commit ke GitHub. Ganti UPLOAD_ENDPOINT di bawah dengan URL
   Worker kamu setelah di-deploy (lihat file worker.js).
================================================================= */
const GITHUB_CONFIG = {
  owner:  'adrianfajirin-afk',
  repo:   '8',
  branch: 'main',
  folder: 'uploads'
};
const UPLOAD_ENDPOINT = 'https://winter-bush-7925.agis-ngu.workers.dev'; // Worker Cloudflare untuk upload foto

async function uploadToGitHub(dataUrl, filename){
  if(!UPLOAD_ENDPOINT || UPLOAD_ENDPOINT.startsWith('GANTI_')){
    console.warn('[Upload] Endpoint belum dikonfigurasi — lewati upload, gambar hanya tersimpan lokal.');
    return null;
  }
  const base64 = dataUrl.split(',')[1];
  try{
    const res = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, contentBase64: base64 })
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok){
      console.error('[Upload] Gagal:', res.status, data.error || data);
      return null;
    }
    return data.url || null;
  }catch(e){
    console.error('[Upload] Error:', e);
    return null;
  }
}
function uniqueFilename(prefix){
  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  const rand = Math.random().toString(36).slice(2,7);
  return `${prefix}-${ts}-${rand}.jpg`;
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
async function fetchGitHubGallery(){
  if(!GITHUB_CONFIG.owner || GITHUB_CONFIG.owner.startsWith('GANTI_')) return null;
  const apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.folder}?ref=${GITHUB_CONFIG.branch}`;
  try{
    const headers = { 'Accept': 'application/vnd.github+json' }; // repo public -> baca galeri tidak perlu token
    const res = await fetch(apiUrl, { headers });
    if(!res.ok){
      console.error('[GitHub] Gagal ambil galeri:', res.status);
      return null;
    }
    const files = await res.json();
    if(!Array.isArray(files)) return null;
    return files
      .filter(f => f.type === 'file' && /\.(jpe?g|png)$/i.test(f.name))
      .sort((a,b)=> b.name.localeCompare(a.name)) // nama file mengandung timestamp -> terbaru duluan
      .map(f => ({ img: f.download_url, name: '', hasAudio: false }));
  }catch(e){
    console.error('[GitHub] Error ambil galeri:', e);
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
    grid.appendChild(card);
  });
}

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

/* ==================== FRAME DRAWING (shared) ==================== */
function drawFrame(canvas, frame, photos, filter){
  const W = 300, H = frame.slots === 1 ? 420 : (frame.slots === 2 ? 480 : 560);
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = frame.bg;
  ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = frame.accent2;
  ctx.lineWidth = 6;
  ctx.strokeRect(3,3,W-6,H-6);
  ctx.fillStyle = frame.accent;
  ctx.font = '600 13px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WEDDING MEMORIES', W/2, 30);
  drawCornerOrnament(ctx, 14, 46, frame.accent2, 1);
  drawCornerOrnament(ctx, W-14, 46, frame.accent2, -1);
  drawCornerOrnament(ctx, 14, H-56, frame.accent2, 1);
  drawCornerOrnament(ctx, W-14, H-56, frame.accent2, -1);

  const padX = 24, gap = 14, topY = 54, bottomPad = 96;
  const slotW = W - padX*2;
  const slotH = (H - topY - bottomPad - gap*(frame.slots-1)) / frame.slots;

  for(let i=0;i<frame.slots;i++){
    const sx = padX, sy = topY + i*(slotH+gap);
    ctx.fillStyle = '#d8d2c4';
    ctx.fillRect(sx, sy, slotW, slotH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, slotW, slotH);
    if(photos[i]){ drawImageCover(ctx, photos[i], sx, sy, slotW, slotH, filter); }
  }

  ctx.font = 'italic 500 11px "Cormorant Garamond", serif';
  ctx.fillStyle = frame.accent;
  ctx.fillText('THE WEDDING OF', W/2, H-70);
  ctx.font = '600 20px "Cormorant Garamond", serif';
  ctx.fillText('Agis & Ilmi', W/2, H-46);
  ctx.font = '500 11px Cinzel, serif';
  ctx.fillText('13 AGUSTUS 2026', W/2, H-24);
}
function drawCornerOrnament(ctx, x, y, color, dir){
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x+dir*18, y-6, x+dir*22, y+14, x+dir*6, y+18);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x+dir*10, y+6, 2.4, 0, Math.PI*2);
  ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}
function drawImageCover(ctx, imgOrDataUrl, dx, dy, dw, dh, filter){
  const img = imgOrDataUrl instanceof HTMLImageElement ? imgOrDataUrl : cachedImage(imgOrDataUrl);
  if(!img.complete){ img.onload = () => drawImageCover(ctx, img, dx, dy, dw, dh, filter); return; }
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const ir = iw/ih, dr = dw/dh;
  let sx, sy, sw, sh;
  if(ir > dr){ sh = ih; sw = ih*dr; sx = (iw-sw)/2; sy = 0; }
  else { sw = iw; sh = iw/dr; sx = 0; sy = (ih-sh)/2; }
  ctx.save();
  ctx.filter = filterCss(filter);
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
}
const _imgCache = {};
function cachedImage(src){
  if(_imgCache[src]) return _imgCache[src];
  const img = new Image(); img.src = src; _imgCache[src] = img; return img;
}
function filterCss(f){
  if(f === 'bw') return 'grayscale(1) contrast(1.05)';
  if(f === 'vintage') return 'sepia(0.55) saturate(1.2) contrast(0.95) brightness(1.02)';
  return 'none';
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
  try{
    currentStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode }, audio:false });
    video.srcObject = currentStream;
    video.style.setProperty('--mirror', facingMode === 'user' ? -1 : 1);
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
shutterBtn.addEventListener('click', ()=>{
  if(!currentStream) return;
  const c = document.createElement('canvas'); c.width = 640; c.height = 640;
  const ctx = c.getContext('2d');
  const vw = video.videoWidth, vh = video.videoHeight;
  const side = Math.min(vw, vh);
  const sx = (vw-side)/2, sy = (vh-side)/2;
  ctx.save();
  if(facingMode === 'user'){ ctx.translate(c.width,0); ctx.scale(-1,1); }
  ctx.drawImage(video, sx, sy, side, side, 0, 0, c.width, c.height);
  ctx.restore();
  capturePhoto(c.toDataURL('image/jpeg', 0.92));
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
  const filename = uniqueFilename('wedding');
  state.gallery.unshift({ img: dataUrl, name: state.name, hasAudio:false });
  downloadCanvas(canvas, filename);
  renderGallery();
  showScreen('gallery');
  const githubUrl = await uploadToGitHub(dataUrl, filename);
  if(githubUrl) console.log('[GitHub] Tersimpan:', githubUrl);
});
document.getElementById('goRecordBtn').addEventListener('click', ()=> showScreen('record'));
function downloadCanvas(canvas, filename){
  const a = document.createElement('a'); a.download = filename; a.href = canvas.toDataURL('image/jpeg', 0.95); a.click();
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
  const filename = uniqueFilename('wedding');
  state.gallery.unshift({ img: dataUrl, name: state.name, hasAudio: !!state.audioUrl });
  downloadCanvas(canvas, filename);
  if(state.audioUrl){
    const a = document.createElement('a'); a.download = 'harapan.webm'; a.href = state.audioUrl; a.click();
  }
  renderGallery();
  showScreen('gallery');
  const githubUrl = await uploadToGitHub(dataUrl, filename);
  if(githubUrl) console.log('[GitHub] Tersimpan:', githubUrl);
});
document.getElementById('reRecordBtn').addEventListener('click', ()=>{
  useRecordingBtn.disabled = true;
  recTimer.textContent = '00:00';
  recStatus.textContent = 'Ketuk mikrofon untuk mulai rekam';
  showScreen('record');
});
