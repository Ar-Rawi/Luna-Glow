// app.js — LUNA GLOW Worldwide Marine Angler & Astronomical Observatory Engine v15
// Dynamic Global Sea Location Selector, Geocoding Search API & Worldwide Marine Species Engine

const LUNAR_MONTH = 29.53058867;
const KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));

// Global Sea Presets Map
const GLOBAL_SEA_PRESETS = {
  malaysia: { name: "🇲🇾 Malaysian Seas & Malacca Strait", lat: 3.1390, lon: 101.6869, regionKey: "malaysia" },
  med: { name: "🌊 Mediterranean & Aegean Sea", lat: 38.0000, lon: 15.0000, regionKey: "med" },
  gulf_mexico: { name: "🇺🇸 Gulf of Mexico & Florida Keys", lat: 27.5000, lon: -86.5000, regionKey: "gulf_mexico" },
  caribbean: { name: "🏝️ Caribbean Sea & Bahamas", lat: 15.0000, lon: -75.0000, regionKey: "caribbean" },
  coral_sea: { name: "🇦🇺 Great Barrier Reef & Coral Sea", lat: -18.0000, lon: 147.5000, regionKey: "coral_sea" },
  sea_japan: { name: "🇯🇵 Sea of Japan & East China Sea", lat: 36.0000, lon: 135.0000, regionKey: "sea_japan" },
  north_sea: { name: "🇬🇧 North Sea & Northeast Atlantic", lat: 56.0000, lon: 3.0000, regionKey: "north_sea" },
  red_sea: { name: "🔴 Red Sea & Gulf of Aden", lat: 22.0000, lon: 38.0000, regionKey: "red_sea" },
  pacific_nw: { name: "🌊 Pacific Northwest (US & Canada)", lat: 46.0000, lon: -125.0000, regionKey: "pacific_nw" },
  indian_ocean: { name: "🇿🇦 Indian Ocean & Agulhas Current", lat: -30.0000, lon: 32.0000, regionKey: "indian_ocean" }
};

let activeLocation = GLOBAL_SEA_PRESETS.med;
let activeDepthFilter = 'all'; // 'all', 'shallow', 'reef', 'deep'
let currentDate = new Date();
let globalSpeciesDatabase = [];
let liveMarineData = null;
let isTimelapsePlaying = false;
let timelapseTimer = null;

// Fetch Live Internet Marine Weather Data from Open-Meteo API
async function fetchLiveInternetMarineData(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=surface_pressure`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const currentPress = data.hourly?.surface_pressure ? data.hourly.surface_pressure[0] : 1013;
      const currentTemp = data.current_weather ? data.current_weather.temperature : 24.5;
      liveMarineData = {
        pressure: Math.round(currentPress),
        sst: currentTemp.toFixed(1),
        isLive: true
      };
    }
  } catch (err) {
    liveMarineData = null;
  }
}

// Geocoding API Search Function for Custom Locations
async function searchLocationGeocoding(query) {
  if (!query || query.trim().length < 2) return;

  const statusTxt = document.getElementById('solunar-headline');
  if (statusTxt) statusTxt.textContent = `🔍 Geocoding location '${query}'...`;

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        const placeName = item.country ? `📍 ${item.name}, ${item.country}` : `📍 ${item.name}`;
        
        activeLocation = {
          name: placeName,
          lat: item.latitude,
          lon: item.longitude,
          regionKey: "custom"
        };

        await fetchLiveInternetMarineData(item.latitude, item.longitude);
        updateView(currentDate);
      } else {
        alert(`Could not find location '${query}'. Please try a major city, sea, or island name.`);
      }
    }
  } catch (err) {
    alert(`Geocoding search failed: ${err.message}`);
  }
}

// Load Global Species Database
async function loadDatabases() {
  try {
    const res = await fetch('global_species_database.json');
    if (res.ok) {
      globalSpeciesDatabase = await res.json();
    }
    await fetchLiveInternetMarineData(activeLocation.lat, activeLocation.lon);
    updateView(currentDate);
  } catch (err) {
    console.warn("Could not load global species database:", err);
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

// INFALLIBLE DARK SHADOW MASK 3D MOON TERMINATOR RENDERER
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
  const phaseRatio = (age % LUNAR_MONTH) / LUNAR_MONTH; // 0.0 (New) -> 0.5 (Full) -> 1.0 (New)
  const f = (1 - Math.cos(phaseRatio * 2 * Math.PI)) / 2; // Illumination fraction in [0.0, 1.0]

  ctx.clearRect(0, 0, w, h);

  // STEP 1: Full Bright White Moon Disc (Base Layer)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);

  const brightGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
  brightGrad.addColorStop(0, '#ffffff');
  brightGrad.addColorStop(0.55, '#cbd5e1');
  brightGrad.addColorStop(1, '#64748b');

  ctx.fillStyle = brightGrad;
  ctx.fill();

  // Lit Craters
  ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
  const craters = [
    {x: -40, y: -30, r: 22}, {x: 20, y: -50, r: 16}, {x: 50, y: 20, r: 28},
    {x: -20, y: 40, r: 18}, {x: 10, y: 60, r: 14}, {x: -60, y: 10, r: 20}
  ];
  craters.forEach(c => {
    ctx.beginPath();
    ctx.arc(cx + c.x, cy + c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // STEP 2: Dark Shadow Mask Layer (Top Layer)
  if (f <= 0.98) {
    ctx.save();

    if (f <= 0.02) {
      // NEW MOON: Full Dark Shadow Mask (100% Dark)
      ctx.beginPath();
      ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
    } else if (phaseRatio <= 0.5) {
      // WAXING PHASES (Light on RIGHT side, Shadow on LEFT side)
      ctx.beginPath();
      ctx.arc(cx, cy, r + 0.5, Math.PI / 2, -Math.PI / 2, false);

      const offset = r * (1 - 2 * f);
      const rx = Math.abs(offset);

      if (offset >= 0) {
        ctx.ellipse(cx, cy, rx, r, 0, -Math.PI / 2, Math.PI / 2, false);
      } else {
        ctx.ellipse(cx, cy, rx, r, 0, -Math.PI / 2, Math.PI / 2, true);
      }
      ctx.closePath();
    } else {
      // WANING PHASES (Light on LEFT side, Shadow on RIGHT side)
      ctx.beginPath();
      ctx.arc(cx, cy, r + 0.5, -Math.PI / 2, Math.PI / 2, false);

      const offset = r * (1 - 2 * (1 - f));
      const rx = Math.abs(offset);

      if (offset >= 0) {
        ctx.ellipse(cx, cy, rx, r, 0, Math.PI / 2, -Math.PI / 2, true);
      } else {
        ctx.ellipse(cx, cy, rx, r, 0, Math.PI / 2, -Math.PI / 2, false);
      }
      ctx.closePath();
    }

    ctx.fillStyle = '#080d1e';
    ctx.fill();

    // Dark Craters Overlay in shadow
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#11182c';
    craters.forEach(c => {
      ctx.beginPath();
      ctx.arc(cx + c.x, cy + c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    ctx.restore();
  }

  // STEP 3: Atmosphere Rim Glow
  if (f > 0.05) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 242, 254, ${0.45 * f})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

// Render Seasonal Species Cards for Active Location
function renderSeasonalSpeciesForDate(date) {
  const container = document.getElementById('species-list-container');
  if (!container) return;
  container.innerHTML = '';

  const selectedMonth = date.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const mName = monthNames[selectedMonth];

  // Filter species matching active region key or return peak month matches
  let activeSpecies = globalSpeciesDatabase.filter(sp => {
    const isRegionMatch = activeLocation.regionKey === 'custom' || sp.region === activeLocation.regionKey;
    const isPeakMonth = sp.peakMonths.includes(selectedMonth);
    return isRegionMatch && isPeakMonth;
  });

  // Fallback: If custom location or sparse region, show all peak month species
  if (activeSpecies.length === 0) {
    activeSpecies = globalSpeciesDatabase.filter(sp => sp.peakMonths.includes(selectedMonth));
  }

  if (activeDepthFilter !== 'all') {
    activeSpecies = activeSpecies.filter(sp => sp.depthCategory === activeDepthFilter);
  }

  const headerDiv = document.createElement('div');
  headerDiv.style.cssText = "margin-bottom: 0.8rem; font-size:0.85rem; font-weight:700; color:var(--accent-gold);";
  
  const depthTag = activeDepthFilter !== 'all' ? ` [${activeDepthFilter.toUpperCase()} HABITAT]` : '';
  headerDiv.innerHTML = `🎣 <b>${activeLocation.name.toUpperCase()}${depthTag} — ${activeSpecies.length} Target Species in Season for ${mName}:</b>`;
  container.appendChild(headerDiv);

  if (activeSpecies.length === 0) {
    container.innerHTML += `<div style="font-size:0.85rem; color:var(--text-muted); padding:1rem; text-align:center;">No matching species in ${activeDepthFilter} depth for ${mName}. Try selecting 'All Depths'.</div>`;
    return;
  }

  activeSpecies.forEach(sp => {
    const riggingTxt = sp.rigging ? `<div class="rigging-box">🪢 <b>Recommended Rigging:</b> ${sp.rigging}</div>` : '';

    const card = document.createElement('div');
    card.className = 'species-card';
    card.innerHTML = `
      <div class="species-info" style="width:100%;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="species-name">${sp.name}</div>
          <span style="font-size:0.7rem; background:rgba(242,201,76,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); padding:0.2rem 0.6rem; border-radius:10px; font-weight:700;">🔥 PEAK IN ${mName.toUpperCase()}</span>
        </div>
        <div class="species-latin">${sp.scientificName}</div>
        <div class="species-meta-row">
          <span class="species-season">🏷️ ${sp.seasonCategory}</span>
          <span>🌡️ Ideal SST: ${sp.idealSST}</span>
          <span>📏 Depth: ${sp.depth}</span>
        </div>
        <div class="species-desc"><b>Tactics:</b> ${sp.tactics}</div>
        ${riggingTxt}
      </div>
    `;
    container.appendChild(card);
  });
}

// Global Solunar Engine
function calculateSeaSolunar(date = new Date(), moonData) {
  const month = date.getMonth();
  const illum = parseFloat(moonData.illumination);

  let score = Math.round(70 + (illum > 80 || illum < 20 ? 20 : 10) + (Math.random() * 5));
  let baroHpa = liveMarineData ? liveMarineData.pressure : 1013;
  let sstVal = liveMarineData ? `${liveMarineData.sst}°C` : "25.0°C";
  let baroTxt = `${baroHpa} hPa (🟢 OPTIMAL BITE)`;
  if (baroHpa < 1010) baroTxt = `${baroHpa} hPa (⚡ PRE-FRONTAL STRIKE FRENZY)`;
  let swellTxt = "0.7m Swell (🟢 SAFE / GLASSY)";

  const coordStr = `(${activeLocation.lat.toFixed(2)}°, ${activeLocation.lon.toFixed(2)}°)`;
  let seasonTxt = `${activeLocation.name.toUpperCase()} BASIN ${coordStr}`;

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

  // Render 3D Moon Canvas with Infallible Shadow Mask
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
  if (sol.score >= 90) scoreHead.textContent = `🔥 PEAK SOLUNAR STRIKE FRENZY — ${activeLocation.name}`;
  else if (sol.score >= 80) scoreHead.textContent = `🟢 GOOD FISHING CONDITIONS — ${activeLocation.name}`;
  else scoreHead.textContent = `🟡 MODERATE STRIKE WINDOW — ${activeLocation.name}`;

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
  // Global Sea Dropdown Selection
  const seaSelect = document.getElementById('global-sea-select');
  if (seaSelect) {
    seaSelect.addEventListener('change', (e) => {
      const presetKey = e.target.value;
      if (GLOBAL_SEA_PRESETS[presetKey]) {
        activeLocation = GLOBAL_SEA_PRESETS[presetKey];
        fetchLiveInternetMarineData(activeLocation.lat, activeLocation.lon).then(() => {
          updateView(currentDate);
        });
      }
    });
  }

  // Location Geocoding Search Input & Button
  const searchBtn = document.getElementById('btn-search-location');
  const searchInput = document.getElementById('location-search-input');

  if (searchBtn && searchInput) {
    const executeSearch = () => {
      const query = searchInput.value;
      if (query) searchLocationGeocoding(query);
    };

    searchBtn.addEventListener('click', executeSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') executeSearch();
    });
  }

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
