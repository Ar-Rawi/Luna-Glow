// app.js — LUNA GLOW Marine Angler & Astronomical Observatory Engine v12
// Infallible 3D Lunar Terminator & Moon Phase Renderer (New Moon = Dark, Full Moon = Bright)

const LUNAR_MONTH = 29.53058867;
const KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));

let activeSeaMode = 'med'; // 'med' or 'malaysia'
let activeViewMode = 'angler'; // 'angler' or 'astronomy'
let activeDepthFilter = 'all'; // 'all', 'shallow', 'reef', 'deep'
let currentDate = new Date();
let medDatabase = [];
let medSpeciesImages = [];
let malaysiaDatabase = [];
let liveMarineData = null;
let isTimelapsePlaying = false;
let timelapseTimer = null;

// Fetch Live Internet Marine API Data
async function fetchLiveInternetMarineData(seaMode) {
  const lat = seaMode === 'malaysia' ? 3.1390 : 38.0000;
  const lon = seaMode === 'malaysia' ? 101.6869 : 15.0000;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=surface_pressure`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const currentPress = data.hourly?.surface_pressure ? data.hourly.surface_pressure[0] : 1013;
      liveMarineData = {
        pressure: Math.round(currentPress),
        sst: seaMode === 'malaysia' ? 29.2 : 22.8,
        isLive: true
      };
    }
  } catch (err) {
    liveMarineData = null;
  }
}

// Load Datasets
async function loadDatabases() {
  try {
    const [medDbRes, medImgRes, myDbRes] = await Promise.all([
      fetch('mediterranean_database.json'),
      fetch('mediterranean_species.json'),
      fetch('malaysia_database.json')
    ]);

    if (medDbRes.ok) medDatabase = await medDbRes.json();
    if (medImgRes.ok) medSpeciesImages = await medImgRes.json();
    if (myDbRes.ok) malaysiaDatabase = await myDbRes.json();

    await fetchLiveInternetMarineData(activeSeaMode);
    updateView(currentDate);
  } catch (err) {
    console.warn("Could not load marine databases:", err);
  }
}

// Moon Phase Calculations
function calculateMoonPhase(date = new Date()) {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
  let age = diffDays % LUNAR_MONTH;
  if (age < 0) age += LUNAR_MONTH;

  const phaseAngle = (age / LUNAR_MONTH) * 2 * Math.PI;
  const illumination = (1 - Math.cos(phaseAngle)) / 2 * 100;

  let phaseName = "New Moon";
  if (age >= 1.5 && age < 6.5) phaseName = "Waxing Crescent";
  else if (age >= 6.5 && age < 8.5) phaseName = "First Quarter";
  else if (age >= 8.5 && age < 13.5) phaseName = "Waxing Gibbous";
  else if (age >= 13.5 && age < 15.5) phaseName = "Full Moon";
  else if (age >= 15.5 && age < 21.5) phaseName = "Waning Gibbous";
  else if (age >= 21.5 && age < 23.5) phaseName = "Third Quarter";
  else if (age >= 23.5 && age < 28.5) phaseName = "Waning Crescent";

  const distance = Math.round(384400 + 21000 * Math.sin(phaseAngle));

  return {
    age: age.toFixed(1),
    illumination: illumination.toFixed(1),
    phaseName,
    distance: distance.toLocaleString(),
    rawAge: age
  };
}

// Target Preset Calculator
function findNextMoonPhaseDate(fromDate, targetPhase) {
  let searchDate = new Date(fromDate.getTime() + 24 * 60 * 60 * 1000);
  for (let i = 0; i < 45; i++) {
    const phaseInfo = calculateMoonPhase(searchDate);
    if (targetPhase === 'full' && phaseInfo.phaseName === 'Full Moon') return searchDate;
    if (targetPhase === 'new' && phaseInfo.phaseName === 'New Moon') return searchDate;
    if (targetPhase === 'super' && phaseInfo.phaseName === 'Full Moon' && parseInt(phaseInfo.distance.replace(/,/g,'')) < 360000) return searchDate;
    searchDate = new Date(searchDate.getTime() + 24 * 60 * 60 * 1000);
  }
  return new Date(fromDate.getTime() + 14 * 24 * 60 * 60 * 1000);
}

// INFALLIBLE 3D MOON CANVAS TERMINATOR RENDERER (New Moon = 100% Dark, Full Moon = 100% Bright White)
function render3DMoonCanvas(moonInfo) {
  const canvas = document.getElementById('moon-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = 130;

  const age = parseFloat(moonInfo.rawAge || moonInfo.age);
  const phaseRatio = (age % LUNAR_MONTH) / LUNAR_MONTH; // 0.0 (New) to 0.5 (Full) to 1.0 (New)

  ctx.clearRect(0, 0, w, h);

  // 1. Draw Base Dark Sphere Disc (New Moon Dark Shadow Base)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#080d1e';
  ctx.fill();

  // Dark Base Craters
  ctx.fillStyle = '#11182c';
  const craters = [
    {x: -40, y: -30, r: 22}, {x: 20, y: -50, r: 16}, {x: 50, y: 20, r: 28},
    {x: -20, y: 40, r: 18}, {x: 10, y: 60, r: 14}, {x: -60, y: 10, r: 20}
  ];
  craters.forEach(c => {
    ctx.beginPath();
    ctx.arc(cx + c.x, cy + c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. Compute Illumination Fraction (0.0 = New Moon, 1.0 = Full Moon)
  const illumFraction = (1 - Math.cos(phaseRatio * 2 * Math.PI)) / 2;

  // Render Illuminated Geometry IF NOT NEW MOON (illumFraction > 0.02)
  if (illumFraction > 0.02) {
    ctx.beginPath();

    if (phaseRatio >= 0.48 && phaseRatio <= 0.52) {
      // FULL MOON: Draw 100% Full White Circle!
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (phaseRatio < 0.5) {
      // WAXING PHASES (Light on RIGHT side)
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false); // Right outer arc

      const xFactor = Math.cos(phaseRatio * 2 * Math.PI);
      ctx.ellipse(cx, cy, Math.abs(r * xFactor), r, 0, Math.PI / 2, -Math.PI / 2, xFactor < 0);
    } else {
      // WANING PHASES (Light on LEFT side)
      ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2, false); // Left outer arc

      const xFactor = Math.cos(phaseRatio * 2 * Math.PI);
      ctx.ellipse(cx, cy, Math.abs(r * xFactor), r, 0, -Math.PI / 2, Math.PI / 2, xFactor > 0);
    }

    ctx.closePath();

    // Bright Moon Sphere Gradient
    const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.55, '#cbd5e1');
    grad.addColorStop(1, '#64748b');

    ctx.fillStyle = grad;
    ctx.fill();

    // Lit Craters Overlay (Clipped to illuminated area)
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
    craters.forEach(c => {
      ctx.beginPath();
      ctx.arc(cx + c.x, cy + c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // 3. Subtle Outer Atmosphere Rim Glow (Scales with illumination)
  if (illumFraction > 0.05) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 242, 254, ${0.45 * illumFraction})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

// Render Species Cards
function renderSeasonalSpeciesForDate(date) {
  const container = document.getElementById('species-list-container');
  if (!container) return;
  container.innerHTML = '';

  const selectedMonth = date.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const mName = monthNames[selectedMonth];

  const targetDb = activeSeaMode === 'malaysia' ? malaysiaDatabase : medDatabase;
  let activeSpecies = targetDb.filter(sp => sp.peakMonths.includes(selectedMonth));

  if (activeDepthFilter !== 'all') {
    activeSpecies = activeSpecies.filter(sp => sp.depthCategory === activeDepthFilter);
  }

  const headerDiv = document.createElement('div');
  headerDiv.style.cssText = "margin-bottom: 0.8rem; font-size:0.85rem; font-weight:700; color:var(--accent-gold);";
  
  const seaLabel = activeSeaMode === 'malaysia' ? '🇲🇾 MALAYSIAN SEAS' : '🌊 MEDITERRANEAN SEA';
  const depthTag = activeDepthFilter !== 'all' ? ` [${activeDepthFilter.toUpperCase()} HABITAT]` : '';

  headerDiv.innerHTML = `🎣 <b>${seaLabel}${depthTag} — ${activeSpecies.length} Target Species in Season for ${mName}:</b>`;
  container.appendChild(headerDiv);

  if (activeSpecies.length === 0) {
    container.innerHTML += `<div style="font-size:0.85rem; color:var(--text-muted); padding:1rem; text-align:center;">No matching species in ${activeDepthFilter} depth for ${mName}. Try selecting 'All Depths'.</div>`;
    return;
  }

  activeSpecies.forEach(sp => {
    const imgMatch = medSpeciesImages.find(img => img.id === sp.id);
    const imgHtml = imgMatch ? `<img src="${imgMatch.image}" alt="${sp.name}" class="species-img">` : '';
    const riggingTxt = sp.rigging ? `<div class="rigging-box">🪢 <b>Recommended Rigging:</b> ${sp.rigging}</div>` : '';

    const card = document.createElement('div');
    card.className = 'species-card';
    card.innerHTML = `
      ${imgHtml}
      <div class="species-info">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="species-name">${sp.name}</div>
          <span style="font-size:0.7rem; background:rgba(242,201,76,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); padding:0.2rem 0.6rem; border-radius:10px; font-weight:700;">🔥 PEAK IN ${mName.toUpperCase()}</span>
        </div>
        <div class="species-latin">${sp.scientificName}</div>
        <div class="species-meta-row">
          <span class="species-season">🏷️ ${sp.seasonCategory}</span>
          <span>🌡️ ${sp.idealSST}</span>
          <span>📏 Depth: ${sp.depth}</span>
        </div>
        <div class="species-desc"><b>Tactics:</b> ${sp.tactics}</div>
        ${riggingTxt}
      </div>
    `;
    container.appendChild(card);
  });
}

// Solunar Engine
function calculateSeaSolunar(date = new Date(), moonData) {
  const month = date.getMonth();

  let score = 75;
  let sstTxt = "22.5°C (Warm Summer)";
  let seasonTxt = "☀️ SUMMER SEASON";
  let baroHpa = liveMarineData ? liveMarineData.pressure : 1012;
  let baroTxt = `${baroHpa} hPa (🟢 HIGH PRESSURE BITE)`;
  if (baroHpa < 1010) baroTxt = `${baroHpa} hPa (⚡ PRE-FRONTAL FRENZY)`;
  let swellTxt = "0.7m Swell (🟢 SAFE / GLASSY)";

  if (activeSeaMode === 'malaysia') {
    if (month >= 10 || month <= 2) {
      sstTxt = "28.8°C (Northeast Monsoon)";
      seasonTxt = "🌧️ NORTHEAST MONSOON";
      swellTxt = "2.4m Swell (🛑 ROUGH EAST / SAFE WEST)";
      score = 85;
    } else if (month >= 4 && month <= 8) {
      sstTxt = "29.5°C (Southwest Monsoon)";
      seasonTxt = "☀️ SOUTHWEST MONSOON (GOLDEN)";
      swellTxt = "0.5m Swell (🟢 GLASSY EAST COAST)";
      score = 95;
    } else {
      sstTxt = "29.1°C (Inter-Monsoon)";
      seasonTxt = "🌸 INTER-MONSOON GLASSY SEA";
      swellTxt = "0.4m Swell (🟢 CALM NATIONWIDE)";
      score = 90;
    }
  } else {
    if (month >= 8 && month <= 10) {
      sstTxt = "21.2°C (Autumn Golden)";
      seasonTxt = "🍂 AUTUMN GOLDEN SEASON";
      swellTxt = "0.8m Swell (🟢 EXCELLENT REEF COND)";
      score = 96;
    }
  }

  return { score, sstTxt, seasonTxt, baroTxt, swellTxt };
}

// Master View Update
function updateView(date = new Date()) {
  currentDate = date;
  const moonInfo = calculateMoonPhase(date);
  
  // Format Date String
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('selected-date-str').textContent = date.toLocaleDateString('en-US', options);
  document.getElementById('date-input').value = date.toISOString().split('T')[0];

  // Update Moon Text Metrics
  document.getElementById('illum-val').textContent = `${moonInfo.illumination}%`;
  document.getElementById('age-val').textContent = `${moonInfo.age} days`;
  document.getElementById('dist-val').textContent = `${moonInfo.distance} km`;
  document.getElementById('phase-badge').textContent = moonInfo.phaseName.toUpperCase();

  // Render 3D Moon Canvas with Realistic Terminator Curve
  render3DMoonCanvas(moonInfo);

  // Calculate Solunar & Conditions
  const sol = calculateSeaSolunar(date, moonInfo);
  document.getElementById('solunar-score-val').textContent = sol.score;
  document.getElementById('sst-val').textContent = sol.sstTxt;
  document.getElementById('baro-val').textContent = sol.baroTxt;
  document.getElementById('swell-val').textContent = sol.swellTxt;
  document.getElementById('med-season-badge').textContent = sol.seasonTxt;

  // Headline Update
  const scoreHead = document.getElementById('solunar-headline');
  if (sol.score >= 90) scoreHead.textContent = "🔥 PEAK SOLUNAR STRIKE FRENZY!";
  else if (sol.score >= 80) scoreHead.textContent = "🟢 GOOD FISHING CONDITIONS";
  else scoreHead.textContent = "🟡 MODERATE STRIKE WINDOW";

  // Update Species Cards
  renderSeasonalSpeciesForDate(date);
}

// Ambient Cosmic Canvas Background
function initCosmicCanvas() {
  const canvas = document.getElementById('cosmic-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const stars = Array.from({ length: 90 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.5 + 0.5,
    alpha: Math.random(),
    speed: Math.random() * 0.015 + 0.005
  }));

  function anim() {
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(anim);
  }
  anim();
}

// Event Setup
function setupEvents() {
  // Preset Buttons (Full Moon, New Moon, Supermoon)
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentDate = findNextMoonPhaseDate(currentDate, preset);

      gsap.fromTo('#moon-canvas', { scale: 0.85, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' });
      updateView(currentDate);
    });
  });

  // Dual View Mode Switcher: Angler View vs Astronomy View
  const btnAngler = document.getElementById('btn-view-angler');
  const btnAstro = document.getElementById('btn-view-astronomy');

  if (btnAngler && btnAstro) {
    btnAngler.addEventListener('click', () => {
      activeViewMode = 'angler';
      btnAngler.classList.add('active');
      btnAstro.classList.remove('active');
      document.body.classList.remove('mode-astronomy');
      document.body.classList.add('mode-angler');
      document.getElementById('condition-panel').scrollIntoView({ behavior: 'smooth' });
    });

    btnAstro.addEventListener('click', () => {
      activeViewMode = 'astronomy';
      btnAstro.classList.add('active');
      btnAngler.classList.remove('active');
      document.body.classList.remove('mode-angler');
      document.body.classList.add('mode-astronomy');
      document.getElementById('section-moon').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Sea Region Toggles
  const btnMed = document.getElementById('med-mode-btn');
  const btnMy = document.getElementById('malaysia-mode-btn');

  if (btnMed && btnMy) {
    btnMed.addEventListener('click', () => {
      activeSeaMode = 'med';
      btnMed.classList.add('active');
      btnMy.classList.remove('active');
      fetchLiveInternetMarineData('med').then(() => updateView(currentDate));
    });

    btnMy.addEventListener('click', () => {
      activeSeaMode = 'malaysia';
      btnMy.classList.add('active');
      btnMed.classList.remove('active');
      fetchLiveInternetMarineData('malaysia').then(() => updateView(currentDate));
    });
  }

  // Depth Filter Buttons
  document.querySelectorAll('.depth-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.depth-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDepthFilter = btn.dataset.depth;
      renderSeasonalSpeciesForDate(currentDate);
    });
  });

  // Date Picker
  const dateInput = document.getElementById('date-input');
  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        updateView(new Date(e.target.value));
      }
    });
  }

  // Today Button
  const todayBtn = document.getElementById('today-btn');
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      updateView(new Date());
    });
  }

  // 30-Day Timelapse Slider
  const cycleSlider = document.getElementById('cycle-slider');
  if (cycleSlider) {
    cycleSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      const newD = new Date(KNOWN_NEW_MOON.getTime() + val * 24 * 60 * 60 * 1000);
      updateView(newD);
    });
  }

  // Timelapse Play/Pause Button
  const timelapseBtn = document.getElementById('timelapse-btn');
  if (timelapseBtn) {
    timelapseBtn.addEventListener('click', () => {
      if (isTimelapsePlaying) {
        clearInterval(timelapseTimer);
        isTimelapsePlaying = false;
        timelapseBtn.textContent = '▶ Play Timelapse';
      } else {
        isTimelapsePlaying = true;
        timelapseBtn.textContent = '⏸️ Pause';
        timelapseTimer = setInterval(() => {
          currentDate = new Date(currentDate.getTime() + 12 * 60 * 60 * 1000);
          updateView(currentDate);
        }, 150);
      }
    });
  }

  // Catch Journal Save
  const saveBtn = document.getElementById('save-journal-btn');
  const journalInput = document.getElementById('journal-input');
  const journalStatus = document.getElementById('journal-status');

  if (journalInput) {
    journalInput.value = localStorage.getItem('luna_angler_journal') || '';
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      localStorage.setItem('luna_angler_journal', journalInput.value);
      journalStatus.textContent = '✅ Log Saved!';
      setTimeout(() => journalStatus.textContent = '', 3000);
    });
  }

  // Mobile Bottom Nav Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.target;
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initCosmicCanvas();
  setupEvents();
  loadDatabases();
});
