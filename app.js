// app.js — LUNA GLOW Marine Angler & Astronomical Observatory Engine v9
// Multi-Audience Dual View, Unified Moon Phase Presets, Live Open-Meteo API & Solunar Engine

const LUNAR_MONTH = 29.53058867;
const KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));

let activeSeaMode = 'med'; // 'med' or 'malaysia'
let activeViewMode = 'angler'; // 'angler' or 'astronomy'
let activeDepthFilter = 'all'; // 'all', 'shallow', 'reef', 'deep'
let isCrimsonMode = false;
let currentDate = new Date();
let medDatabase = [];
let medSpeciesImages = [];
let malaysiaDatabase = [];
let liveMarineData = null;
let isTimelapsePlaying = false;
let timelapseTimer = null;

const UPCOMING_CRIMSON_MOONS = [
  { date: new Date(2026, 7, 28), name: "August 28, 2026 (Perigee Eclipse)", note: "Super Moon Eclipse Surge — 16 Days Ahead" },
  { date: new Date(2027, 1, 20), name: "February 20, 2027 (Winter Eclipse)", note: "Deep Reef Surge — 6 Months Ahead" },
  { date: new Date(2027, 6, 18), name: "July 18, 2027 (Mid-Summer Eclipse)", note: "Pelagic & Tuna Syzygy Alignment — 11 Months Ahead" },
  { date: new Date(2028, 0, 12), name: "January 12, 2028 (Winter Solstice Eclipse)", note: "Winter Inshore & Cephalopod Surge — 1.4 Years Ahead" },
  { date: new Date(2028, 6, 6),  name: "July 6, 2028 (Summer Lunar Eclipse)", note: "Summer Dentex & Amberjack Frenzy — 1.9 Years Ahead" },
  { date: new Date(2028, 11, 31), name: "December 31, 2028 (NEW YEAR'S EVE TOTAL BLOOD MOON)", note: "Rare New Year's Eve Total Blood Moon! — 2.4 Years Ahead" },
  { date: new Date(2029, 5, 26), name: "June 26, 2029 (MID-SUMMER TOTAL BLOOD MOON)", note: "Rare Mid-Summer Total Blood Moon — 2.9 Years Ahead" },
  { date: new Date(2029, 11, 20), name: "December 20, 2029 (WINTER TOTAL BLOOD MOON)", note: "Solstice Total Eclipse Surge — 3.4 Years Ahead" }
];
let crimsonIndex = 0;

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

// Moon Phase Mathematics
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
    distance: distance.toLocaleString()
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

// 3D Moon Canvas Rendering
function render3DMoonCanvas(moonInfo) {
  const canvas = document.getElementById('moon-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = 130;

  ctx.clearRect(0, 0, w, h);

  // Background Sphere Shadow
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0d1a';
  ctx.fill();

  // Moon Texture Base Gradient
  const illumFrac = parseFloat(moonInfo.illumination) / 100;
  const grad = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, r*0.1, cx, cy, r);
  
  if (isCrimsonMode) {
    grad.addColorStop(0, '#ff4d6d');
    grad.addColorStop(0.5, '#cc0033');
    grad.addColorStop(1, '#4a0011');
  } else {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.6, '#cbd5e1');
    grad.addColorStop(1, '#475569');
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.globalAlpha = Math.max(0.15, illumFrac);
  ctx.fill();

  // Draw Craters
  ctx.globalAlpha = isCrimsonMode ? 0.35 : 0.25;
  ctx.fillStyle = isCrimsonMode ? '#28000a' : '#1e293b';
  
  const craterList = [
    {x: -40, y: -30, r: 22}, {x: 20, y: -50, r: 16}, {x: 50, y: 20, r: 28},
    {x: -20, y: 40, r: 18}, {x: 10, y: 60, r: 14}, {x: -60, y: 10, r: 20}
  ];
  craterList.forEach(c => {
    ctx.beginPath();
    ctx.arc(cx + c.x, cy + c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });
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
  headerDiv.style.cssText = "margin-bottom: 0.8rem; font-size:0.85rem; font-weight:700;";
  
  const seaLabel = activeSeaMode === 'malaysia' ? '🇲🇾 MALAYSIAN SEAS' : '🌊 MEDITERRANEAN SEA';
  const depthTag = activeDepthFilter !== 'all' ? ` [${activeDepthFilter.toUpperCase()} HABITAT]` : '';

  if (isCrimsonMode) {
    const cObj = UPCOMING_CRIMSON_MOONS[crimsonIndex];
    headerDiv.style.color = "var(--accent-crimson)";
    headerDiv.innerHTML = `🩸 <b>${seaLabel}${depthTag} — CRIMSON ECLIPSE TARGETS (${cObj.name.toUpperCase()}):</b>`;
  } else {
    headerDiv.style.color = "var(--accent-gold)";
    headerDiv.innerHTML = `🎣 <b>${seaLabel}${depthTag} — ${activeSpecies.length} Target Species in Season for ${mName}:</b>`;
  }
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
    if (isCrimsonMode) {
      card.style.borderColor = "rgba(255, 51, 102, 0.4)";
      card.style.background = "rgba(45, 10, 20, 0.4)";
    }

    card.innerHTML = `
      ${imgHtml}
      <div class="species-info">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="species-name" style="${isCrimsonMode ? 'color:var(--accent-crimson);' : ''}">${sp.name}</div>
          <span style="font-size:0.7rem; background:${isCrimsonMode ? 'rgba(255,51,102,0.2)' : 'rgba(242,201,76,0.15)'}; border:1px solid ${isCrimsonMode ? 'var(--accent-crimson)' : 'var(--accent-gold)'}; color:${isCrimsonMode ? 'var(--accent-crimson)' : 'var(--accent-gold)'}; padding:0.2rem 0.6rem; border-radius:10px; font-weight:700;">${isCrimsonMode ? '🩸 ECLIPSE ACTIVE' : '🔥 PEAK IN ' + mName.toUpperCase()}</span>
        </div>
        <div class="species-latin">${sp.scientificName}</div>
        <div class="species-meta-row">
          <span class="species-season">🏷️ ${sp.seasonCategory}</span>
          <span>🌡️ ${sp.idealSST}</span>
          <span>📏 Depth: ${sp.depth}</span>
        </div>
        <div class="species-desc"><b>Tactics:</b> ${isCrimsonMode ? 'Target deep structure & current rips where predators ambush disoriented baitfish during 90-min eclipse shadow.' : sp.tactics}</div>
        ${riggingTxt}
      </div>
    `;
    container.appendChild(card);
  });
}

// Calculate Solunar Scores
function calculateSeaSolunar(date = new Date(), moonData) {
  const age = parseFloat(moonData.age);
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

  if (isCrimsonMode) {
    score = 99;
    const cObj = UPCOMING_CRIMSON_MOONS[crimsonIndex];
    seasonTxt = `🩸 ECLIPSE #${crimsonIndex + 1}: ${cObj.name}`;
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
  document.getElementById('phase-badge').textContent = isCrimsonMode ? "🩸 CRIMSON ECLIPSE" : moonInfo.phaseName.toUpperCase();

  // Render 3D Canvas
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

// Setup Event Listeners
function setupEvents() {
  // UNIFIED MOON PHASE PRESETS BAR (All Presets Grouped Together!)
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const preset = btn.dataset.preset;

      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (preset === 'crimson') {
        isCrimsonMode = true;
        document.body.classList.add('crimson-theme');
        document.getElementById('crimson-sub-controls').classList.remove('hidden');
        currentDate = UPCOMING_CRIMSON_MOONS[crimsonIndex].date;
      } else {
        isCrimsonMode = false;
        document.body.classList.remove('crimson-theme');
        document.getElementById('crimson-sub-controls').classList.add('hidden');
        currentDate = findNextMoonPhaseDate(currentDate, preset);
      }

      // GSAP Pulse Animation on Canvas
      gsap.fromTo('#moon-canvas', { scale: 0.8, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' });
      updateView(currentDate);
    });
  });

  // Crimson Next Cycle Button
  const nextCrimsonBtn = document.getElementById('next-crimson-btn');
  if (nextCrimsonBtn) {
    nextCrimsonBtn.addEventListener('click', () => {
      crimsonIndex = (crimsonIndex + 1) % UPCOMING_CRIMSON_MOONS.length;
      currentDate = UPCOMING_CRIMSON_MOONS[crimsonIndex].date;
      document.getElementById('crimson-index-tag').textContent = `Eclipse #${crimsonIndex + 1} of ${UPCOMING_CRIMSON_MOONS.length}`;
      updateView(currentDate);
    });
  }

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
      isCrimsonMode = false;
      document.body.classList.remove('crimson-theme');
      document.getElementById('crimson-sub-controls').classList.add('hidden');
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
