const images = {};
let planets = [];
let speed = 1;
let selectedPlanet = null;
let stars = [];

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const SLOWEST_PERIOD = 164.8;
const BASE_SPEED = 0.0003;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  generateStars();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function preloadImages(data) {
  const promises = data.map(planet => new Promise(resolve => {
    const img = new Image();
    img.onload = () => { images[planet.id] = img; resolve(); };
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => { images[planet.id] = fallback; resolve(); };
      fallback.onerror = resolve;
      fallback.src = 'public/earth/earth1.png';
    };
    if (planet.imgPath) {
      img.src = planet.imgPath;
    } else {
      img.onerror(new Event('error'));
    }
  }));
  return Promise.all(promises);
}

function generateStars() {
  stars = [];
  for (let i = 0; i < 300; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
    });
  }
}

function initPlanets(data) {
  planets = data.map((p, index) => ({
    ...p,
    angle: (index / data.length) * Math.PI * 2,
    speedFactor: p.orbitalPeriod ? SLOWEST_PERIOD / p.orbitalPeriod : 0,
    x: 0,
    y: 0,
  }));
}

function update() {
  for (const planet of planets) {
    if (planet.orbitRadius === 0) continue;
    planet.angle += BASE_SPEED * speed * planet.speedFactor;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    planet.x = cx + planet.orbitRadius * Math.cos(planet.angle);
    planet.y = cy + planet.orbitRadius * Math.sin(planet.angle);
  }
}

function drawStars() {
  for (const star of stars) {
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOrbits() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (const planet of planets) {
    if (planet.orbitRadius === 0) continue;
    ctx.beginPath();
    ctx.arc(cx, cy, planet.orbitRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSun() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const sun = planets[0];
  if (!sun) return;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sun.size * 4);
  grad.addColorStop(0, 'rgba(255,200,50,0.3)');
  grad.addColorStop(0.4, 'rgba(255,200,50,0.08)');
  grad.addColorStop(1, 'rgba(255,200,50,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, sun.size * 4, 0, Math.PI * 2);
  ctx.fill();

  if (images['sun']) {
    ctx.drawImage(images['sun'], cx - sun.size, cy - sun.size, sun.size * 2, sun.size * 2);
  } else {
    ctx.fillStyle = sun.color;
    ctx.beginPath();
    ctx.arc(cx, cy, sun.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(sun.name, cx, cy + sun.size + 14);
}

function drawPlanets() {
  for (const planet of planets) {
    if (planet.orbitRadius === 0) continue;

    if (images[planet.id]) {
      const s = planet.size;
      ctx.drawImage(images[planet.id], planet.x - s, planet.y - s, s * 2, s * 2);
    } else {
      ctx.fillStyle = planet.color;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (selectedPlanet && selectedPlanet.id === planet.id) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(planet.name, planet.x, planet.y + planet.size + 13);
  }
}

function getClickedPlanet(mx, my) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const sun = planets[0];
  if (sun) {
    const d = Math.hypot(cx - mx, cy - my);
    if (d <= sun.size + 5) return sun;
  }
  for (const planet of planets) {
    if (planet.orbitRadius === 0) continue;
    if (Math.hypot(planet.x - mx, planet.y - my) <= planet.size + 5) {
      return planet;
    }
  }
  return null;
}

function showInfo(planet) {
  selectedPlanet = planet;
  const panel = document.getElementById('info-panel');
  const title = document.getElementById('info-title');
  const content = document.getElementById('info-content');

  title.textContent = planet.name;

  let html = '';
  const sections = [
    { key: 'orbital', label: 'Орбитальные характеристики' },
    { key: 'physical', label: 'Физические характеристики' },
    { key: 'temperature', label: 'Температура' },
    { key: 'atmosphere', label: 'Атмосфера' },
  ];
  for (const section of sections) {
    if (planet.info[section.key]) {
      html += `<h3>${section.label}</h3><table>`;
      for (const item of planet.info[section.key]) {
        html += `<tr><td class="info-label">${item.label}</td><td class="info-value">${item.value}</td></tr>`;
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
  ctx.fillStyle = '#000011';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars();
  drawOrbits();
  drawSun();
  drawPlanets();
  update();
  requestAnimationFrame(animate);
}

function init() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="controls">
      <label>Скорость: <span id="speed-label">1x</span></label>
      <input type="range" id="speed-slider" min="0" max="20" step="0.1" value="1">
      <button id="reset-btn">Сброс</button>
    </div>
    <div id="info-panel">
      <div id="info-header">
        <h2 id="info-title"></h2>
        <button id="info-close">&times;</button>
      </div>
      <div id="info-content"></div>
    </div>
  `);

  generateStars();
  initPlanets(PLANET_DATA);
  preloadImages(PLANET_DATA).then(() => animate());

  canvas.addEventListener('click', e => {
    if (e.target !== canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const p = getClickedPlanet(x, y);
    p ? showInfo(p) : hideInfo();
  });

  document.getElementById('speed-slider').addEventListener('input', e => {
    speed = parseFloat(e.target.value);
    document.getElementById('speed-label').textContent = speed + 'x';
  });

  document.getElementById('info-close').addEventListener('click', e => {
    e.stopPropagation();
    hideInfo();
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('speed-slider').value = 1;
    speed = 1;
    document.getElementById('speed-label').textContent = '1x';
    planets.forEach((p, i) => {
      p.angle = (i / planets.length) * Math.PI * 2;
    });
  });
}

init();
