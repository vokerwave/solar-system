const images = {};
let planets = [];
let speed = 1;
let selectedPlanet = null;
let stars = [];
let nebulaData = [];
let bgCanvas = null;
let frame = 0;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const SLOWEST_PERIOD = 164.8;
const BASE_SPEED = 0.00003;

const camera = { x: 0, y: 0, zoom: 1 };
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 20;


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  bgCanvas = null;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function upscaleImage(img) {
  const scale = Math.max(1, Math.ceil(1024 / img.naturalWidth));
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  cx.drawImage(img, 0, 0, w, h);
  return c;
}

function preloadImages(data) {
  const promises = [];
  for (const planet of data) {
    if (planet.imgPath) {
      promises.push(new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          images[planet.id] = upscaleImage(img);
          resolve();
        };
        img.onerror = resolve;
        img.src = planet.imgPath;
      }));
    }
    if (planet.imgPath2) {
      promises.push(new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          images[planet.id + '_rot'] = upscaleImage(img);
          resolve();
        };
        img.onerror = resolve;
        img.src = planet.imgPath2;
      }));
    }
  }
  return Promise.all(promises);
}

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function generateStars() {
  const seed = Date.now();
  const rand = mulberry32(seed);
  stars = [];
  for (let i = 0; i < 1000; i++) {
    const isBlinker = rand() < 0.08;
    let r, g, b;
    const t = rand();
    if (t < 0.55) { r = 225; g = 228; b = 245; }
    else if (t < 0.70) { r = 200; g = 215; b = 255; }
    else if (t < 0.82) { r = 255; g = 235; b = 200; }
    else if (t < 0.92) { r = 255; g = 200; b = 160; }
    else { r = 240; g = 170; b = 170; }
    r += (rand() - 0.5) * 20;
    g += (rand() - 0.5) * 20;
    b += (rand() - 0.5) * 20;
    stars.push({
      x: rand(),
      y: rand(),
      size: rand() * 2.2 + 0.3,
      r: Math.round(r), g: Math.round(g), b: Math.round(b),
      baseAlpha: rand() * 0.4 + 0.25,
      phase: rand() * Math.PI * 2,
      speed: isBlinker ? 0.02 + rand() * 0.04 : 0.005 + rand() * 0.01,
      blinker: isBlinker,
      amp: isBlinker ? 0.5 + rand() * 0.3 : 0.15 + rand() * 0.15,
    });
  }
  const nrand = mulberry32(seed + 1);
  nebulaData = [];
  const nebulaColors = [
    { r: 60, g: 40, b: 100 },
    { r: 30, g: 60, b: 120 },
    { r: 80, g: 30, b: 60 },
    { r: 40, g: 70, b: 80 },
    { r: 100, g: 50, b: 30 },
  ];
  for (let i = 0; i < 5; i++) {
    nebulaData.push({
      x: nrand(),
      y: nrand(),
      radius: 0.15 + nrand() * 0.2,
      alpha: 0.015 + nrand() * 0.015,
      ...nebulaColors[i],
    });
  }
}

function initPlanets(data) {
  const saved = localStorage.getItem('solarPlanets');
  const angles = saved ? JSON.parse(saved) : null;
  planets = data.map((p, index) => {
    const ecc = p.eccentricity || 0;
    const a = p.orbitRadius || 0;
    return {
      ...p,
      angle: angles && angles[index] !== undefined ? angles[index] : (index / data.length) * Math.PI * 2,
      speedFactor: p.orbitalPeriod ? SLOWEST_PERIOD / p.orbitalPeriod : 0,
      x: 0,
      y: 0,
      rotFrame: 0,
      showFirst: true,
      ringAngle: Math.PI / 6,
      bandOffset: 0,
      semiMinorAxis: a * Math.sqrt(1 - ecc * ecc),
      centerOffset: a * ecc,
    };
  });
}

function update() {
  frame++;
  for (const planet of planets) {
    if (planet.orbitRadius === 0) continue;
    planet.angle += BASE_SPEED * speed * planet.speedFactor;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const a = planet.orbitRadius * 1.08;
    const b = (planet.semiMinorAxis || planet.orbitRadius) * 0.88;
    const off = planet.centerOffset || 0;
    planet.x = cx - off + a * Math.cos(planet.angle);
    planet.y = cy + b * Math.sin(planet.angle);

    planet.rotFrame += speed;
    if (planet.rotInterval && planet.rotFrame >= planet.rotInterval) {
      planet.showFirst = !planet.showFirst;
      planet.rotFrame = 0;
    }

    if (planet.id === 'jupiter') {
      planet.bandOffset = (planet.bandOffset + 0.008 * speed) % (Math.PI * 2);
    }
    if (planet.id === 'uranus' || planet.id === 'neptune') {
      planet.bandOffset = (planet.bandOffset + 0.004 * speed) % (Math.PI * 2);
    }
  }
}

function updateBg() {
  if (bgCanvas && bgCanvas.width === canvas.width && bgCanvas.height === canvas.height) return;
  bgCanvas = document.createElement('canvas');
  bgCanvas.width = canvas.width;
  bgCanvas.height = canvas.height;
  const bg = bgCanvas.getContext('2d');

  bg.fillStyle = '#080810';
  bg.fillRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width, h = canvas.height;
  for (const n of nebulaData) {
    const grad = bg.createRadialGradient(
      n.x * w, n.y * h, 0,
      n.x * w, n.y * h, n.radius * Math.min(w, h)
    );
    grad.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${n.alpha})`);
    grad.addColorStop(1, `rgba(${n.r},${n.g},${n.b},0)`);
    bg.fillStyle = grad;
    bg.fillRect(0, 0, w, h);
  }

  const cx = w / 2, cy = h / 2;
  const vr = Math.min(w, h) * 0.7;
  const vgrad = bg.createRadialGradient(cx, cy, vr * 0.2, cx, cy, vr);
  vgrad.addColorStop(0, 'rgba(0,0,0,0)');
  vgrad.addColorStop(1, 'rgba(0,0,0,0.5)');
  bg.fillStyle = vgrad;
  bg.fillRect(0, 0, w, h);
}

function drawStars() {
  const w = canvas.width;
  const h = canvas.height;
  for (const star of stars) {
    const twinkle = Math.sin(frame * star.speed + star.phase) * star.amp + (1 - star.amp);
    const alpha = star.baseAlpha * twinkle;
    ctx.fillStyle = `rgba(${star.r},${star.g},${star.b},${alpha})`;
    const s = star.size < 1 ? 1 : star.size;
    ctx.fillRect(star.x * w, star.y * h, s, s);
  }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawOrbits() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  for (const planet of planets) {
    if (planet.orbitRadius === 0) continue;
    const a = planet.orbitRadius;
    const b = planet.semiMinorAxis || a;
    const off = planet.centerOffset || 0;

    ctx.strokeStyle = hexToRgba(planet.color, 0.05);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx - off, cy, a * 1.08, b * 0.88, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = hexToRgba(planet.color, 0.2);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx - off, cy, a * 1.08, b * 0.88, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawSun() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const sun = planets[0];
  if (!sun) return;

  const s = sun.size;
  const t = frame * 0.015;
  const pulse = 1 + 0.04 * Math.sin(t * 0.5);

  const glow1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 7 * pulse);
  glow1.addColorStop(0, 'rgba(255,200,50,0.18)');
  glow1.addColorStop(0.25, 'rgba(255,160,30,0.06)');
  glow1.addColorStop(0.55, 'rgba(200,100,0,0.025)');
  glow1.addColorStop(1, 'rgba(200,100,0,0)');
  ctx.fillStyle = glow1;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 7 * pulse, 0, Math.PI * 2);
  ctx.fill();

  const glow2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 2.5);
  glow2.addColorStop(0, 'rgba(255,220,80,0.15)');
  glow2.addColorStop(0.4, 'rgba(255,200,50,0.04)');
  glow2.addColorStop(1, 'rgba(255,200,50,0)');
  ctx.fillStyle = glow2;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 2.5, 0, Math.PI * 2);
  ctx.fill();

  if (images['sun']) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, s, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(images['sun'], cx - s, cy - s, s * 2, s * 2);
    ctx.restore();
  }

  if (selectedPlanet && selectedPlanet.id === 'sun') {
    ctx.strokeStyle = 'rgba(255,215,0,0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, s + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const text = sun.name;
  ctx.font = '10px "Courier New", monospace';
  const tw = ctx.measureText(text).width;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(cx - tw / 2 - 4, cy + s + 4, tw + 8, 14);
  ctx.fillStyle = 'rgba(255,220,100,0.9)';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + s + 16);
}

function drawUranusRings(planet) {
  if (planet.id !== 'uranus') return;
  const rx = planet.size * 1.3;
  const ry = planet.size * 1.0;
  ctx.save();
  ctx.translate(planet.x, planet.y);
  ctx.rotate(Math.PI / 3);
  ctx.strokeStyle = 'rgba(180,210,230,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(180,210,230,0.06)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 1.08, ry * 1.08, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSaturnRings(planet) {
  const rx = planet.size * 1.8;
  const ry = planet.size * 0.9;
  ctx.save();
  ctx.translate(planet.x, planet.y);
  ctx.rotate(planet.ringAngle);
  ctx.fillStyle = 'rgba(200,170,130,0.12)';
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,170,130,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(180,150,110,0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 1.12, ry * 1.12, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawJupiterBands(planet) {
  const s = planet.size;
  ctx.save();
  ctx.beginPath();
  ctx.arc(planet.x, planet.y, s, 0, Math.PI * 2);
  ctx.clip();

  const angle = planet.bandOffset || 0;
  const dx = Math.cos(angle) * s * 1.2;
  const dy = Math.sin(angle) * s * 1.2;
  const grad = ctx.createLinearGradient(
    planet.x - dx, planet.y - dy,
    planet.x + dx, planet.y + dy
  );
  grad.addColorStop(0, 'rgba(180,120,60,0)');
  grad.addColorStop(0.25, 'rgba(200,150,80,0.06)');
  grad.addColorStop(0.45, 'rgba(210,160,90,0.09)');
  grad.addColorStop(0.55, 'rgba(220,170,95,0.1)');
  grad.addColorStop(0.7, 'rgba(200,150,80,0.06)');
  grad.addColorStop(1, 'rgba(180,120,60,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(planet.x - s, planet.y - s, s * 2, s * 2);
  ctx.restore();
}

function drawIceGiantBands(planet) {
  const s = planet.size;
  ctx.save();
  ctx.beginPath();
  ctx.arc(planet.x, planet.y, s, 0, Math.PI * 2);
  ctx.clip();

  const angle = planet.bandOffset || 0;
  const dx = Math.cos(angle) * s * 1.2;
  const dy = Math.sin(angle) * s * 1.2;
  const grad = ctx.createLinearGradient(
    planet.x - dx, planet.y - dy,
    planet.x + dx, planet.y + dy
  );
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.02)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.035)');
  grad.addColorStop(0.65, 'rgba(255,255,255,0.02)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(planet.x - s, planet.y - s, s * 2, s * 2);
  ctx.restore();
}

function drawPlanetGlow(planet) {
  const gs = planet.size * 3.5;
  const grad = ctx.createRadialGradient(planet.x, planet.y, 0, planet.x, planet.y, gs);
  grad.addColorStop(0, hexToRgba(planet.color, 0.1));
  grad.addColorStop(1, hexToRgba(planet.color, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(planet.x, planet.y, gs, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlanets() {
  ctx.imageSmoothingEnabled = true;
  for (const planet of planets) {
    if (planet.orbitRadius === 0) continue;

    drawPlanetGlow(planet);

    if (planet.id === 'saturn') {
      drawSaturnRings(planet);
    }

    const imgKey = planet.showFirst ? planet.id : planet.id + '_rot';
    if (images[imgKey]) {
      const s = planet.size;
      if (planet.textureRotation) {
        ctx.save();
        ctx.translate(planet.x, planet.y);
        ctx.rotate(planet.textureRotation);
        ctx.drawImage(images[imgKey], -s, -s, s * 2, s * 2);
        ctx.restore();
      } else {
        ctx.drawImage(images[imgKey], planet.x - s, planet.y - s, s * 2, s * 2);
      }
    } else if (images[planet.id]) {
      const s = planet.size;
      if (planet.textureRotation) {
        ctx.save();
        ctx.translate(planet.x, planet.y);
        ctx.rotate(planet.textureRotation);
        ctx.drawImage(images[planet.id], -s, -s, s * 2, s * 2);
        ctx.restore();
      } else {
        ctx.drawImage(images[planet.id], planet.x - s, planet.y - s, s * 2, s * 2);
      }
    } else {
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.fill();
    }

    drawUranusRings(planet);
    drawJupiterBands(planet);
    drawIceGiantBands(planet);

    if (selectedPlanet && selectedPlanet.id === planet.id) {
      ctx.strokeStyle = 'rgba(255,215,0,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const text = planet.name;
    ctx.font = '9px "Courier New", monospace';
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const tx = planet.x - tw / 2 - 3;
    const ty = planet.y + planet.size + 13;
    ctx.fillRect(tx, ty - 1, tw + 6, 12);
    ctx.fillStyle = 'rgba(200,210,255,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(text, planet.x, ty + 9);
  }
}

function screenToWorld(sx, sy) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  return {
    x: cx + (sx - cx - camera.x) / camera.zoom,
    y: cy + (sy - cy - camera.y) / camera.zoom,
  };
}

function getClickedPlanet(mx, my) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const { x: wx, y: wy } = screenToWorld(mx, my);
  const sun = planets[0];
  if (sun) {
    const d = Math.hypot(cx - wx, cy - wy);
    if (d <= sun.size + 5) return sun;
  }
  for (const planet of planets) {
    if (planet.orbitRadius === 0) continue;
    if (Math.hypot(planet.x - wx, planet.y - wy) <= planet.size + 5) {
      return planet;
    }
  }
  return null;
}

function drawPlanetPreview(planet) {
  const canvas = document.getElementById('planet-preview');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  ctx.clearRect(0, 0, w, h);

  const s = Math.min(w, h) * 0.3;

  if (planet.id === 'sun') {
    if (images['sun_rot']) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, s, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(images['sun_rot'], cx - s, cy - s, s * 2, s * 2);
      ctx.restore();
    }
    ctx.strokeStyle = 'rgba(60,60,90,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, s + 1, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  const imgKey = planet.id;
  if (images[imgKey]) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, s, 0, Math.PI * 2);
    ctx.clip();
    if (planet.textureRotation) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(planet.textureRotation);
      ctx.drawImage(images[imgKey], -s, -s, s * 2, s * 2);
      ctx.restore();
    } else {
      ctx.drawImage(images[imgKey], cx - s, cy - s, s * 2, s * 2);
    }
    ctx.restore();
  } else {
    ctx.fillStyle = planet.color;
    ctx.beginPath();
    ctx.arc(cx, cy, s, 0, Math.PI * 2);
    ctx.fill();
  }

  if (planet.id === 'saturn') {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 6);
    ctx.fillStyle = 'rgba(200,170,130,0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.8, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,170,130,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.8, s * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (planet.id === 'uranus') {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 3);
    ctx.strokeStyle = 'rgba(180,210,230,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.4, s * 0.8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = 'rgba(60,60,90,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, s + 1, 0, Math.PI * 2);
  ctx.stroke();
}

function showInfo(planet) {
  selectedPlanet = planet;
  const panel = document.getElementById('info-panel');
  const title = document.getElementById('info-title');
  const content = document.getElementById('info-content');
  title.textContent = planet.name;
  drawPlanetPreview(planet);
  let html = '';
  const sections = [
    { key: 'orbital', label: 'ОРБИТА' },
    { key: 'physical', label: 'ФИЗИКА' },
    { key: 'temperature', label: 'ТЕМПЕРАТУРА' },
    { key: 'atmosphere', label: 'АТМОСФЕРА' },
  ];
  for (const section of sections) {
    if (planet.info[section.key]) {
      html += `<h3>● ${section.label}</h3><table>`;
      for (const item of planet.info[section.key]) {
        html += `<tr><td class="info-label">${item.label}</td><td class="info-value">${item.value.replace(/°/g, '<span class="deg">°</span>')}</td></tr>`;
      }
      html += '</table>';
    }
  }
  content.innerHTML = html;
  panel.classList.add('visible');
}

function hideInfo() {
  selectedPlanet = null;
  document.getElementById('info-panel').classList.remove('visible');
}

function animate() {
  updateBg();
  ctx.drawImage(bgCanvas, 0, 0);
  drawStars();

  ctx.save();
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  ctx.translate(cx + camera.x, cy + camera.y);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-cx, -cy);

  drawOrbits();
  drawSun();
  drawPlanets();
  update();
  ctx.restore();
  if (frame % 60 === 0) {
    const angles = planets.map(p => p.angle);
    localStorage.setItem('solarPlanets', JSON.stringify(angles));
  }
  requestAnimationFrame(animate);
}

function init() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="controls">
      <label>СКОРОСТЬ</label>
      <input type="range" id="speed-slider" min="0" max="2" step="0.01" value="1">
      <span id="speed-label">×1.0</span>
      <button id="reset-btn">СБРОС</button>
    </div>
    <div id="info-panel">
      <div id="info-header">
        <h2 id="info-title"></h2>
        <button id="info-close">&times;</button>
      </div>
      <div id="info-planet"><canvas id="planet-preview" width="120" height="120"></canvas></div>
      <div id="info-content"></div>
    </div>
  `);
  generateStars();
  initPlanets(PLANET_DATA);
  preloadImages(PLANET_DATA).then(() => animate());
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let camStartX = 0, camStartY = 0;

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.zoom * factor));
    const actualFactor = newZoom / camera.zoom;
    camera.x = (1 - actualFactor) * (mx - cx) + actualFactor * camera.x;
    camera.y = (1 - actualFactor) * (my - cy) + actualFactor * camera.y;
    camera.zoom = newZoom;
  }, { passive: false });

  canvas.addEventListener('mousedown', e => {
    isDragging = false;
    const rect = canvas.getBoundingClientRect();
    dragStartX = e.clientX - rect.left;
    dragStartY = e.clientY - rect.top;
    camStartX = camera.x;
    camStartY = camera.y;
  });

  canvas.addEventListener('mousemove', e => {
    if (e.buttons !== 1) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = mx - dragStartX;
    const dy = my - dragStartY;
    if (Math.hypot(dx, dy) > 5) {
      isDragging = true;
      camera.x = camStartX + dx;
      camera.y = camStartY + dy;
    }
  });

  canvas.addEventListener('mouseup', e => {
    if (!isDragging) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const p = getClickedPlanet(x, y);
      p ? showInfo(p) : hideInfo();
    }
  });
  document.getElementById('speed-slider').addEventListener('input', e => {
    speed = parseFloat(e.target.value);
    document.getElementById('speed-label').textContent = '×' + speed.toFixed(1);
  });
  document.getElementById('info-close').addEventListener('click', e => {
    e.stopPropagation();
    hideInfo();
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('speed-slider').value = 1;
    speed = 1;
    document.getElementById('speed-label').textContent = '×1.0';
  });
}

init();
