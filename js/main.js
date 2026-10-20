// =================================================================
// FILE XỬ LÝ CHÍNH (js/main.js) - ĐÃ FIX HIỂN THỊ ẢNH 3D TRÊN MỌI CHẾ ĐỘ
// =================================================================
const CONFIG = window.PROJECT_CONFIG;

// 1. Áp dụng đường dẫn ảnh và nhạc từ CONFIG vào giao diện HTML
const bgmPlayer = document.getElementById('bgm-player');
if (bgmPlayer && CONFIG.bgmUrl) {
  bgmPlayer.src = CONFIG.bgmUrl;
}

document.getElementById('dock-green-dino').src = CONFIG.greenDinoPng;
document.getElementById('dock-pink-dino').src = CONFIG.pinkDinoPng;
document.getElementById('stage-green-dino').src = CONFIG.greenDinoPng;
document.getElementById('stage-pink-dino').src = CONFIG.pinkDinoPng;
document.getElementById('letter-green-dino').src = CONFIG.greenDinoPng;
document.getElementById('letter-pink-dino').src = CONFIG.pinkDinoPng;
document.getElementById('letter-corner-img').src = CONFIG.couplePhoto;

CONFIG.photos.forEach((src, idx) => {
  const el = document.getElementById(`pop-${idx}`);
  if (el) el.src = src;
});

document.getElementById('letter-title-text').textContent = CONFIG.letterTitle;
document.getElementById('letter-body-text').textContent = CONFIG.letterBody;

// 2. Xử lý phát nhạc nền từ file vật lý trong assets/audio/
let audioCtx = null;
let isMuted = false;

function startBackgroundMusic() {
  if (bgmPlayer && bgmPlayer.paused && !isMuted) {
    bgmPlayer.play().catch(() => {});
  }
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
}

function playCuteBoing(startFreq = 480, endFreq = 880) {
  if (isMuted) return;
  startBackgroundMusic();
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + 0.16);
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.19);
}

function playShootingStarChime() {
  if (isMuted) return;
  startBackgroundMusic();
  if (!audioCtx) return;
  const notes = [1046.5, 1318.5, 1567.98, 2093.0];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      if (isMuted || !audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.65);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.68);
    }, i * 75);
  });
}

document.getElementById('btn-toggle-audio').addEventListener('click', () => {
  isMuted = !isMuted;
  if (bgmPlayer) bgmPlayer.muted = isMuted;
  document.getElementById('icon-sound-on').style.display = isMuted ? 'none' : 'block';
  document.getElementById('icon-sound-off').style.display = isMuted ? 'block' : 'none';
});

// 3. Hiệu ứng bắn hạt PNG khi chạm
function spawnTouchBurst(clientX, clientY) {
  const items = [
    { type: 'img', src: CONFIG.greenDinoPng },
    { type: 'img', src: CONFIG.pinkDinoPng },
    { type: 'text', val: '🍑' },
    { type: 'text', val: '💗' },
    { type: 'text', val: '✨' },
    { type: 'text', val: '🌟' }
  ];
  for (let i = 0; i < items.length; i++) {
    const el = document.createElement('div');
    el.className = 'tap-particle';
    const item = items[i];
    if (item.type === 'img') {
      const img = document.createElement('img');
      img.src = item.src;
      el.appendChild(img);
    } else {
      el.textContent = item.val;
    }
    el.style.left = `${clientX}px`;
    el.style.top = `${clientY}px`;
    const angle = (Math.PI * 2 * i) / items.length + (Math.random() - 0.5) * 0.4;
    const dist = 50 + Math.random() * 55;
    el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--dy', `${Math.sin(angle) * dist - 35}px`);
    el.style.setProperty('--rot', `${(Math.random() - 0.5) * 60}deg`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }
}

// 4. Màn hình 1: Bó hoa tương tác
const bouquetTrigger = document.getElementById('bouquet-trigger');
const instructionEl = document.getElementById('bouquet-instruction');
const holdRing = document.getElementById('hold-ring');
const holdProgress = document.getElementById('hold-progress');

let tapCount = 0;
let isHolding = false;
let holdStart = 0;
let holdRAF = null;

bouquetTrigger.addEventListener('pointerdown', (e) => {
  startBackgroundMusic();
  spawnTouchBurst(e.clientX, e.clientY);

  if (tapCount < 5) {
    document.getElementById(`pop-${tapCount}`).classList.add('show');
    playCuteBoing(480 + tapCount * 80, 780 + tapCount * 80);
    tapCount++;
    if (tapCount < 5) {
      instructionEl.textContent = `Chạm vào bó hoa (${tapCount}/5)`;
    } else {
      instructionEl.textContent = 'Ấn giữ bó hoa để vào Thiên Hà Khủng Long';
      instructionEl.style.color = '#ff80bf';
      instructionEl.style.fontWeight = '700';
    }
    return;
  }

  isHolding = true;
  holdStart = performance.now();
  holdRing.classList.add('active');

  const step = (now) => {
    if (!isHolding) return;
    const p = Math.min((now - holdStart) / 650, 1);
    holdProgress.style.strokeDashoffset = 314 * (1 - p);
    if (p >= 1) {
      isHolding = false;
      playShootingStarChime();
      transitionToGalaxy();
    } else {
      holdRAF = requestAnimationFrame(step);
    }
  };
  holdRAF = requestAnimationFrame(step);
});

const stopHold = () => {
  if (!isHolding) return;
  isHolding = false;
  cancelAnimationFrame(holdRAF);
  holdRing.classList.remove('active');
  holdProgress.style.strokeDashoffset = 314;
};
window.addEventListener('pointerup', stopHold);
window.addEventListener('pointercancel', stopHold);

// 5. Màn hình 2: Vũ trụ 3D, Khung ảnh 3D, Sao băng & Hạt phát sáng
let scene, camera, renderer, controls;
let fallingItems = [];
let dom3DItems = []; // Danh sách các tấm ảnh & khủng long PNG bay trong không gian 3D
let glowParticleSystem;
let glowParticleData = [];
let shootingStars = [];
let galaxyBoostTimer = 0;
let isGalaxyActive = false;
let galaxyInitialized = false;

function createNeonTextTexture(text) {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  const fontSize = 46;
  const fontSpec = `700 ${fontSize}px "Quicksand", sans-serif`;
  tempCtx.font = fontSpec;
  const textWidth = Math.ceil(tempCtx.measureText(text).width);

  const width = Math.max(360, textWidth + 160);
  const height = 140;

  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  ctx.font = fontSpec;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = '#ff007f';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#ff66b3';
  ctx.fillText(text, width / 2, height / 2);

  ctx.shadowColor = '#ff4da6';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ffb3d9';
  ctx.fillText(text, width / 2, height / 2);

  ctx.shadowBlur = 4;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(c);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return { texture, aspect: width / height };
}

function createGlowOrbTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.35, 'rgba(255, 180, 230, 0.85)');
  grad.addColorStop(0.7, 'rgba(255, 77, 166, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function createShootingStarTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 32;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 16, 256, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.6, 'rgba(255, 150, 220, 0.45)');
  grad.addColorStop(0.92, 'rgba(180, 245, 255, 0.95)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 1)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 10, 256, 12, 6);
  ctx.fill();

  const headGrad = ctx.createRadialGradient(244, 16, 1, 244, 16, 16);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(0.5, '#7df9ff');
  headGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(244, 16, 16, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(c);
}

function createEmojiTexture(emoji) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = '74px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff66b3';
  ctx.shadowBlur = 16;
  ctx.fillText(emoji, 64, 68);
  return new THREE.CanvasTexture(c);
}

let shootingStarMat = null;
function spawnShootingStar(isBurst = false) {
  if (!scene) return;
  if (!shootingStarMat) {
    shootingStarMat = new THREE.SpriteMaterial({
      map: createShootingStarTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }
  const sp = new THREE.Sprite(shootingStarMat.clone());
  const length = isBurst ? (9 + Math.random() * 6) : (6 + Math.random() * 4);
  sp.scale.set(length, length * 0.13, 1);

  const startX = (Math.random() - 0.5) * 65 - 12;
  const startY = 18 + Math.random() * 24;
  const startZ = -10 - Math.random() * 25;
  sp.position.set(startX, startY, startZ);

  const angle = -Math.PI * (0.18 + Math.random() * 0.12);
  sp.material.rotation = angle;
  const speed = isBurst ? (38 + Math.random() * 22) : (26 + Math.random() * 15);

  sp.userData = {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: 1.1 + Math.random() * 0.6
  };

  scene.add(sp);
  shootingStars.push(sp);
}

function triggerCosmicBurst() {
  galaxyBoostTimer = 3.5;
  document.body.classList.add('galaxy-boosted');
  document.getElementById('nebula-overlay').classList.add('boost');
  const dock = document.getElementById('galaxy-dino-dock');
  dock.classList.add('glow-active');

  for (let i = 0; i < 12; i++) {
    setTimeout(() => spawnShootingStar(true), i * 110);
  }

  setTimeout(() => {
    document.body.classList.remove('galaxy-boosted');
    document.getElementById('nebula-overlay').classList.remove('boost');
    dock.classList.remove('glow-active');
  }, 3200);
}

function initGalaxy3D() {
  if (galaxyInitialized) return;
  galaxyInitialized = true;

  const container = document.getElementById('galaxy-canvas-container');
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x090214, 0.010);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 220);
  camera.position.set(0, 0, 35);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = false;
  controls.minDistance = 10;
  controls.maxDistance = 68;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.55;

  // 1. 900 Hạt phát sáng đa sắc
  const particleCount = 900;
  const pGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const palette = [
    new THREE.Color('#ff4da6'),
    new THREE.Color('#7df9ff'),
    new THREE.Color('#ffe066'),
    new THREE.Color('#ff99cc'),
    new THREE.Color('#c77dff')
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 95;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 95;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 85;

    const col = palette[i % palette.length];
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    glowParticleData.push({
      speedY: 0.4 + Math.random() * 1.2,
      sway: Math.random() * 6.28
    });
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const pMat = new THREE.PointsMaterial({
    size: 1.45,
    map: createGlowOrbTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  glowParticleSystem = new THREE.Points(pGeo, pMat);
  scene.add(glowParticleSystem);

  // 2. Chữ bay vô tận
  document.fonts.ready.then(() => {
    const wishDataList = CONFIG.wishes.map(w => createNeonTextTexture(w));
    for (let i = 0; i < 42; i++) {
      const itemData = wishDataList[i % wishDataList.length];
      const mat = new THREE.SpriteMaterial({
        map: itemData.texture,
        transparent: true,
        depthWrite: false
      });
      const s = new THREE.Sprite(mat);
      const baseH = 1.9 + Math.random() * 0.6;
      s.scale.set(baseH * itemData.aspect, baseH, 1);
      s.position.set(
        (Math.random() - 0.5) * 52,
        (Math.random() - 0.5) * 64,
        (Math.random() - 0.5) * 44
      );
      s.userData = {
        fallSpeed: 1.7 + Math.random() * 1.9,
        swaySpeed: 0.8 + Math.random(),
        swayOffset: Math.random() * 6.28
      };
      scene.add(s);
      fallingItems.push(s);
    }
  });

  // 3. TẠO LỚP KHUNG ẢNH KỶ NIỆM & KHỦNG LONG PNG 3D (Hoạt động 100% trên cả file:/// và GitHub Pages)
  let photosLayer = document.getElementById('galaxy-3d-photos-layer');
  if (!photosLayer) {
    photosLayer = document.createElement('div');
    photosLayer.id = 'galaxy-3d-photos-layer';
    document.getElementById('stage-galaxy').appendChild(photosLayer);
  }

  // Tạo 15 tấm hình kỷ niệm bay trong không gian 3D (từ photo-1.png .. photo-5.png)
  CONFIG.photos.forEach((photoUrl, idx) => {
    for (let copy = 0; copy < 3; copy++) {
      const img = document.createElement('img');
      img.className = 'floating-3d-photo';
      img.src = photoUrl;
      photosLayer.appendChild(img);

      dom3DItems.push({
        el: img,
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 42,
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 36
        ),
        fallSpeed: 1.35 + Math.random() * 1.15,
        swaySpeed: 0.75 + Math.random() * 0.7,
        swayOffset: (idx + copy) * 1.3,
        baseScale: 0.85 + Math.random() * 0.35
      });
    }
  });

  // Tạo 12 bé Khủng Long Xanh & Hồng PNG bay lơ lửng trong không gian 3D
  [CONFIG.greenDinoPng, CONFIG.pinkDinoPng].forEach((dinoUrl, idx) => {
    for (let copy = 0; copy < 6; copy++) {
      const img = document.createElement('img');
      img.className = 'floating-3d-dino';
      img.src = dinoUrl;
      photosLayer.appendChild(img);

      dom3DItems.push({
        el: img,
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 46,
          (Math.random() - 0.5) * 62,
          (Math.random() - 0.5) * 38
        ),
        fallSpeed: 1.5 + Math.random() * 1.4,
        swaySpeed: 1.0 + Math.random() * 0.8,
        swayOffset: (idx + copy) * 2.1,
        baseScale: 0.8 + Math.random() * 0.3
      });
    }
  });

  // 4. Sticker Đào tiên, Tim hồng & Ngôi sao
  const stickerIcons = ['🍑', '💗', '✨', '🌸'];
  const stickerTextures = stickerIcons.map(ic => createEmojiTexture(ic));
  for (let i = 0; i < 20; i++) {
    const mat = new THREE.SpriteMaterial({ map: stickerTextures[i % stickerTextures.length], transparent: true, depthWrite: false });
    const s = new THREE.Sprite(mat);
    const sc = 1.9 + Math.random() * 0.9;
    s.scale.set(sc, sc, 1);
    s.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 64, (Math.random() - 0.5) * 42);
    s.userData = { fallSpeed: 1.5 + Math.random() * 1.6, swaySpeed: 1.1 + Math.random(), swayOffset: Math.random() * 6.28 };
    scene.add(s);
    fallingItems.push(s);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

let lastTime = performance.now();
let ambientStarTimer = 0;
const projVec = new THREE.Vector3();

function animateGalaxy(now) {
  if (!isGalaxyActive) return;
  requestAnimationFrame(animateGalaxy);

  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  const elapsed = now * 0.001;

  const isBoosted = galaxyBoostTimer > 0;
  if (isBoosted) galaxyBoostTimer -= dt;
  const speedMultiplier = isBoosted ? 1.85 : 1.0;

  // 1. Cập nhật chữ bay 3D
  for (let i = 0; i < fallingItems.length; i++) {
    const item = fallingItems[i];
    item.position.y -= item.userData.fallSpeed * speedMultiplier * dt;
    item.position.x += Math.sin(elapsed * item.userData.swaySpeed + item.userData.swayOffset) * 0.016;
    if (item.position.y < -34) {
      item.position.y = 34;
      item.position.x = (Math.random() - 0.5) * 50;
      item.position.z = (Math.random() - 0.5) * 42;
    }
  }

  // 2. Cập nhật Hạt phát sáng
  if (glowParticleSystem) {
    const posArr = glowParticleSystem.geometry.attributes.position.array;
    for (let i = 0; i < glowParticleData.length; i++) {
      const d = glowParticleData[i];
      posArr[i * 3 + 1] += d.speedY * speedMultiplier * dt;
      posArr[i * 3]     += Math.sin(elapsed + d.sway) * 0.015;
      if (posArr[i * 3 + 1] > 48) posArr[i * 3 + 1] = -48;
    }
    glowParticleSystem.geometry.attributes.position.needsUpdate = true;
    glowParticleSystem.rotation.y += isBoosted ? 0.0045 : 0.001;
    glowParticleSystem.material.size = isBoosted
      ? 2.4 + Math.sin(elapsed * 10) * 0.4
      : 1.45 + Math.sin(elapsed * 3) * 0.2;
  }

  // 3. Cập nhật Sao băng
  ambientStarTimer += dt;
  if (ambientStarTimer > 1.4) {
    ambientStarTimer = 0;
    spawnShootingStar(false);
  }

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const st = shootingStars[i];
    st.userData.life += dt;
    st.position.x += st.userData.vx * dt;
    st.position.y += st.userData.vy * dt;
    const lifeRatio = st.userData.life / st.userData.maxLife;
    st.material.opacity = lifeRatio < 0.2
      ? lifeRatio * 5
      : Math.max(0, 1 - (lifeRatio - 0.2) / 0.8);

    if (st.userData.life >= st.userData.maxLife) {
      scene.remove(st);
      shootingStars.splice(i, 1);
    }
  }

  controls.autoRotateSpeed = isBoosted ? 2.2 : 0.55;
  controls.update();
  renderer.render(scene, camera);

  // 4. Chiếu tọa độ 3D của các tấm hình (photo-1..5.png) & khủng long PNG lên màn hình theo đúng góc xoay Camera
  const halfW = window.innerWidth * 0.5;
  const halfH = window.innerHeight * 0.5;

  for (let i = 0; i < dom3DItems.length; i++) {
    const item = dom3DItems[i];
    item.pos.y -= item.fallSpeed * speedMultiplier * dt;
    item.pos.x += Math.sin(elapsed * item.swaySpeed + item.swayOffset) * 0.016;

    if (item.pos.y < -32) {
      item.pos.y = 32;
      item.pos.x = (Math.random() - 0.5) * 44;
      item.pos.z = (Math.random() - 0.5) * 36;
    }

    projVec.copy(item.pos);
    const dist = camera.position.distanceTo(projVec);
    projVec.project(camera);

    // Nếu vật thể nằm phía sau camera thì ẩn đi
    if (projVec.z > 1) {
      item.el.style.opacity = '0';
      continue;
    }

    const screenX = projVec.x * halfW + halfW;
    const screenY = -projVec.y * halfH + halfH;
    const perspectiveScale = Math.max(0.22, Math.min(1.65, (28 / dist) * item.baseScale));
    const depthOpacity = Math.max(0.15, Math.min(1, 1.35 - dist / 62));

    item.el.style.opacity = depthOpacity.toFixed(2);
    item.el.style.zIndex = Math.round(100 - dist);
    item.el.style.transform = `translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0) translate(-50%, -50%) scale(${perspectiveScale.toFixed(3)})`;
  }
}

function transitionToGalaxy() {
  document.getElementById('stage-bouquet').classList.add('hidden');
  document.getElementById('stage-galaxy').classList.remove('hidden');
  initGalaxy3D();
  isGalaxyActive = true;
  lastTime = performance.now();
  requestAnimationFrame(animateGalaxy);
  triggerCosmicBurst();
}

const galaxyDock = document.getElementById('galaxy-dino-dock');
const dockSpeech = document.getElementById('dock-speech');
let dockTapCount = 0;

galaxyDock.addEventListener('pointerdown', (e) => {
  playShootingStarChime();
  spawnTouchBurst(e.clientX, e.clientY);
  triggerCosmicBurst();

  const gImg = document.getElementById('dock-green-dino');
  const pImg = document.getElementById('dock-pink-dino');
  gImg.style.transform = 'scale(1.25) rotate(-10deg)';
  pImg.style.transform = 'scale(1.25) rotate(10deg)';
  setTimeout(() => {
    gImg.style.transform = '';
    pImg.style.transform = '';
  }, 350);

  dockTapCount++;
  const messages = [
    "🌟 Oaaa! Mưa Sao Băng & Hạt Phát Sáng rực rỡ quá! Bé khủng long hồng ước đi nà!",
    "💌 Bé khủng long hồng mở thư nhé, điều thú vị đang chờ ở nút ✉️ góc trên nà!",
    "✨ Mỗi ngôi sao băng là một lời chúc 20/10 ngọt ngào khủng long xanh dành tặng em!"
  ];
  dockSpeech.textContent = messages[dockTapCount % messages.length];
});

// 6. Màn hình 3: Tương tác 2 bé khủng long PNG & Mở thư
const greenActor = document.getElementById('stage-green-dino');
const pinkActor = document.getElementById('stage-pink-dino');
const dialogueBubble = document.getElementById('dino-dialogue');
let gIdx = 0, pIdx = 0;

function triggerJelly(el) {
  el.classList.remove('dino-jelly');
  void el.offsetWidth;
  el.classList.add('dino-jelly');
  dialogueBubble.classList.remove('pop');
  void dialogueBubble.offsetWidth;
  dialogueBubble.classList.add('pop');
}

greenActor.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  playCuteBoing(420, 780);
  triggerJelly(greenActor);
  gIdx = (gIdx + 1) % CONFIG.greenDinoQuotes.length;
  dialogueBubble.textContent = `"${CONFIG.greenDinoQuotes[gIdx]}"`;
  spawnTouchBurst(e.clientX, e.clientY);
});

pinkActor.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  playCuteBoing(580, 1040);
  triggerJelly(pinkActor);
  pIdx = (pIdx + 1) % CONFIG.pinkDinoQuotes.length;
  dialogueBubble.textContent = `"${CONFIG.pinkDinoQuotes[pIdx]}"`;
  spawnTouchBurst(e.clientX, e.clientY);
});

const stageLetter = document.getElementById('stage-letter');
const envelopeCard = document.getElementById('envelope-card');
const envelopeFlap = document.getElementById('envelope-flap');
const letterSlidePreview = document.getElementById('letter-slide-preview');
const fullLetterModal = document.getElementById('full-letter-modal');
const envelopeTrigger = document.getElementById('envelope-trigger');

let isEnvelopeOpening = false;

function resetEnvelope() {
  isEnvelopeOpening = false;
  envelopeCard.classList.remove('flipped');
  envelopeFlap.classList.remove('opened');
  letterSlidePreview.classList.remove('pulled');
  fullLetterModal.classList.remove('visible');
  envelopeTrigger.style.opacity = '1';
  dialogueBubble.textContent = `"Bé khủng long hồng mở thư nhé, điều thú vị đang chờ nà 🍑💗"`;
}

document.getElementById('btn-open-letter').addEventListener('click', () => {
  isGalaxyActive = false;
  resetEnvelope();
  stageLetter.classList.remove('hidden');
  playCuteBoing(520, 880);
});

document.getElementById('btn-close-letter').addEventListener('click', () => {
  stageLetter.classList.add('hidden');
  isGalaxyActive = true;
  lastTime = performance.now();
  requestAnimationFrame(animateGalaxy);
});

document.getElementById('btn-close-paper').addEventListener('click', resetEnvelope);

envelopeTrigger.addEventListener('click', (e) => {
  if (isEnvelopeOpening) return;
  isEnvelopeOpening = true;
  playCuteBoing(600, 960);
  spawnTouchBurst(e.clientX, e.clientY);

  envelopeCard.classList.add('flipped');
  setTimeout(() => {
    envelopeFlap.classList.add('opened');
    playCuteBoing(700, 1080);
  }, 700);
  setTimeout(() => {
    letterSlidePreview.classList.add('pulled');
  }, 1250);
  setTimeout(() => {
    fullLetterModal.classList.add('visible');
    playShootingStarChime();
  }, 1850);
});

// Nền sao 2D
const starCanvas = document.getElementById('star-bg');
const starCtx = starCanvas.getContext('2d');
let stars2D = [];
function initStars() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
  stars2D = Array.from({ length: 75 }, () => ({
    x: Math.random() * starCanvas.width,
    y: Math.random() * starCanvas.height,
    r: Math.random() * 1.6 + 0.4,
    a: Math.random(),
    s: Math.random() * 0.025 + 0.008
  }));
}
function drawStars() {
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  for (const st of stars2D) {
    st.a += st.s;
    starCtx.fillStyle = `rgba(255, 225, 245, ${(Math.sin(st.a) + 1) * 0.42 + 0.15})`;
    starCtx.beginPath();
    starCtx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
    starCtx.fill();
  }
  requestAnimationFrame(drawStars);
}
window.addEventListener('resize', initStars);
initStars();
drawStars();