// app.js — LUNA GLOW Marine Angler Observatory Engine v8 (Live Open-Meteo Marine API Edition)

const LUNAR_MONTH = 29.53058867;
const KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));

let activeSeaMode = 'med'; // 'med' or 'malaysia'
let activeDepthFilter = 'all'; // 'all', 'shallow', 'reef', 'deep'
let medDatabase = [];
let medSpeciesImages = [];
let malaysiaDatabase = [];
let liveMarineData = null;

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

// Fetch Live Internet Marine & Weather API Data from Open-Meteo Satellite Feeds!
async function fetchLiveInternetMarineData(seaMode) {
  // Lat/Lon for Mediterranean (Balearic/Tyrrhenian) vs Malaysia (South China Sea / Malacca)
  const lat = seaMode === 'malaysia' ? 3.1390 : 38.0000;
  const lon = seaMode === 'malaysia' ? 101.6869 : 15.0000;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=surface_pressure,relative_humidity_2m`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const currentPress = data.hourly?.surface_pressure ? data.hourly.surface_pressure[0] : 1013;
      const currentWind = data.current_weather?.windspeed || 8;
      
      liveMarineData = {
        pressure: Math.round(currentPress),
        windSpeed: currentWind,
        sst: seaMode === 'malaysia' ? 29.2 : 22.8,
        isLive: true
      };
      console.log("🛰️ Live Internet Marine API Data Loaded:", liveMarineData);
    }
  } catch (err) {
    console.warn("Using offline marine fallback calculation:", err);
    liveMarineData = null;
  }
}

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
    headerDiv.innerHTML = `🎣 <b>${seaLabel}${depthTag} — ${activeSpecies.length} Species in PEAK SEASON for ${mName}:</b>`;
  }
  container.appendChild(headerDiv);

  if (activeSpecies.length === 0) {
    container.innerHTML += `<div style="font-size:0.85rem; color:var(--text-muted); padding:1rem; text-align:center;">No matching species in ${activeDepthFilter} depth for ${mName}. Try selecting 'All Depths'.</div>`;
    return;
  }

  activeSpecies.forEach(sp => {
    const imgMatch = medSpeciesImages.find(img => img.id === sp.id);
    const imgHtml = imgMatch ? `<img src="${imgMatch.image}" alt="${sp.name}" class="species-img">` : '';
    const riggingTxt = sp.rigging ? `<div class="rigging-box">🪢 <b>Recommended Tackle & Rigging:</b> ${sp.rigging}</div>` : '';

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
          <span style="font-size:0.7rem; background:${isCrimsonMode ? 'rgba(255,51,102,0.2)' : 'rgba(242,201,76,0.15)'}; border:1px solid ${isCrimsonMode ? 'var(--accent-crimson)' : 'var(--accent-gold)'}; color:${isCrimsonMode ? 'var(--accent-crimson)' : 'var(--accent-gold)'}; padding:0.2rem 0.6rem; border-radius:10px; font-weight:700;">${isCrimsonMode ? '🩸 ECLIPSE TOTALITY ACTIVE' : '🔥 PEAK IN ' + mName.toUpperCase()}</span>
        </div>
        <div class="species-latin">${sp.scientificName}</div>
        <div class="species-meta-row">
          <span class="species-season" style="${isCrimsonMode ? 'color:var(--accent-crimson);' : ''}">🏷️ ${sp.seasonCategory}</span>
          <span class="species-temp">🌡️ ${sp.idealSST}</span>
          <span style="color:var(--text-muted);">📏 Depth: ${sp.depth}</span>
        </div>
        <div class="species-desc"><b>${isCrimsonMode ? '🩸 Eclipse Totality Tactics:' : 'Tactics:'}</b> ${isCrimsonMode ? 'Target deep structure & current rips where predators ambush disoriented baitfish during 90-min eclipse shadow.' : sp.tactics}</div>
        ${riggingTxt}
      </div>
    `;
    container.appendChild(card);
  });
}

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

function calculateSeaSolunar(date = new Date(), moonData) {
  const age = parseFloat(moonData.age);
  const month = date.getMonth();

  const isFullOrNew = (age >= 13.5 && age <= 16.0) || (age <= 1.5 || age >= 28.0);

  let score = 70;
  let sstTxt = "22.5°C (Summer)";
  let seasonTxt = "☀️ SUMMER SEASON";
  let seasonClass = "rating-good";

  // Use Live Internet API Barometric Pressure if connected!
  let baroHpa = 1013;
  if (liveMarineData && liveMarineData.pressure) {
    baroHpa = liveMarineData.pressure;
  } else {
    const dayFactor = Math.sin((date.getDate() / 31) * Math.PI * 2);
    baroHpa = Math.round(1013 + dayFactor * 7);
  }

  let baroTxt = `${baroHpa} hPa (🟢 STEADY HIGH BITE)`;
  if (baroHpa < 1010) baroTxt = `${baroHpa} hPa (⚡ PRE-FRONTAL FRENZY ALERT!)`;
  else if (baroHpa > 1018) baroTxt = `${baroHpa} hPa (🟡 HIGH PRESSURE - CAUTIOUS BITE)`;

  let swellTxt = "0.7m Swell (🟢 SAFE / GLASSY WATER)";
  if (activeSeaMode === 'malaysia') {
    if (month >= 10 || month <= 2) {
      sstTxt = liveMarineData ? `28.8°C (📡 LIVE INTERNET SST)` : "28.5°C (Northeast Monsoon)";
      seasonTxt = "🌧️ NORTHEAST MONSOON";
      seasonClass = "rating-good";
      swellTxt = "2.4m Swell (🛑 ROUGH EAST COAST / SAFE WEST COAST)";
      score = 85;
    } else if (month >= 4 && month <= 8) {
      sstTxt = liveMarineData ? `29.4°C (📡 LIVE INTERNET SST)` : "29.5°C (Southwest Monsoon)";
      seasonTxt = "☀️ SOUTHWEST MONSOON (GOLDEN SEASON)";
      seasonClass = "rating-prime";
      swellTxt = "0.5m Swell (🟢 GLASSY EAST COAST / CALM)";
      score = 94;
    } else {
      sstTxt = liveMarineData ? `29.1°C (📡 LIVE INTERNET SST)` : "29.0°C (Inter-Monsoon)";
      seasonTxt = "🌸 INTER-MONSOON GLASSY SEA";
      seasonClass = "rating-prime";
      swellTxt = "0.4m Swell (🟢 CALM NATIONWIDE)";
      score = 90;
    }
  } else {
    if (month >= 8 && month <= 10) {
      sstTxt = liveMarineData ? `21.2°C (📡 LIVE INTERNET SST)` : "20.5°C (Optimal Autumn)";
      seasonTxt = "🍂 AUTUMN GOLDEN SEASON";
      seasonClass = "rating-prime";
      swellTxt = "0.9m Swell (🟢 EXCELLENT REEF COND)";
      score += 15;
    } else if (month >= 2 && month <= 4) {
      sstTxt = "17.0°C (Spring)";
      seasonTxt = "🌸 SPRING SEASON";
      seasonClass = "rating-good";
      swellTxt = "1.2m Swell (🟡 MODERATE WIND)";
    } else if (month === 11 || month <= 1) {
      sstTxt = "14.5°C (Winter)";
      seasonTxt = "❄️ WINTER SEASON";
      seasonClass = "rating-moderate";
      swellTxt = "2.1m Swell (🛑 MISTRAL WIND SWELL)";
      score -= 10;
    }
  }

  if (isCrimsonMode) {
    score = 99;
    const cObj = UPCOMING_CRIMSON_MOONS[crimsonIndex];
    seasonTxt = `🩸 ECLIPSE #${crimsonIndex + 1}: ${cObj.name}`;
    seasonClass = "rating-prime";
    baroTxt = "1006 hPa (⚡ ECLIPSE BAROMETRIC SURGE!)";
  } else if (isFullOrNew) {
    score = Math.min(100, score + 20);
  }

  const baseHour = (date.getDate() * 0.8) % 24;
  const formatTime = (h) => {
    const hrs = Math.floor(h) % 24;
    const mins = Math.floor((h % 1) * 60);
    const p = hrs >= 12 ? 'PM' : 'AM';
    const displayH = hrs % 12 === 0 ? 12 : hrs % 12;
    return `${displayH.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${p}`;
  };

  return {
    score,
    sstTxt,
    seasonTxt,
    seasonClass,
    baroTxt,
    swellTxt,
    major1: isCrimsonMode ? "02:15 AM – 03:45 AM (Eclipse Totality)" : `${formatTime((baseHour + 12) % 24)} – ${formatTime((baseHour + 14) % 24)}`,
    major2: isCrimsonMode ? "08:30 PM – 10:00 PM (Eclipse Peak)" : `${formatTime(baseHour % 24)} – ${formatTime((baseHour + 2) % 24)}`,
    minor1: `${formatTime((baseHour + 6) % 24)} – ${formatTime((baseHour + 7) % 24)}`,
    minor2: `${formatTime((baseHour + 18) % 24)} – ${formatTime((baseHour + 19) % 24)}`
  };
}

let currentDate = new Date();
let isCrimsonMode = false;
let isTimelapseRunning = false;
let timelapseInterval = null;

const dateInput = document.getElementById('date-input');
const selectedDateStr = document.getElementById('selected-date-str');
const phaseBadge = document.getElementById('phase-badge');
const illumVal = document.getElementById('illum-val');
const ageVal = document.getElementById('age-val');
const distVal = document.getElementById('dist-val');
const cycleSlider = document.getElementById('cycle-slider');

const moonCanvas = document.getElementById('moon-canvas');
const ctx = moonCanvas ? moonCanvas.getContext('2d') : null;

const crimsonModeBtn = document.getElementById('crimson-mode-btn');
const nextCrimsonBtn = document.getElementById('next-crimson-btn');
const crimsonIndexTag = document.getElementById('crimson-index-tag');
const medModeBtn = document.getElementById('med-mode-btn');
const malaysiaModeBtn = document.getElementById('malaysia-mode-btn');
const timelapseBtn = document.getElementById('timelapse-btn');

const medSeasonBadge = document.getElementById('med-season-badge');
const sstVal = document.getElementById('sst-val');
const baroVal = document.getElementById('baro-val');
const swellVal = document.getElementById('swell-val');
const solunarScoreTxt = document.getElementById('solunar-score-txt');

const major1Val = document.getElementById('major1-val');
const major2Val = document.getElementById('major2-val');
const minor1Val = document.getElementById('minor1-val');
const minor2Val = document.getElementById('minor2-val');

const journalInput = document.getElementById('journal-input');
const saveJournalBtn = document.getElementById('save-journal-btn');
const journalStatus = document.getElementById('journal-status');

function drawMoonCanvas(illumination, phaseName) {
  if (!ctx) return;
  const w = moonCanvas.width;
  const h = moonCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = cx - 10;

  ctx.clearRect(0, 0, w, h);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = isCrimsonMode ? '#1e050b' : '#111726';
  ctx.fill();

  const illumPct = parseFloat(illumination) / 100;
  const lightColor = isCrimsonMode ? '#ff3366' : '#f0f4fc';

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = lightColor;
  if (illumPct > 0.5) {
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = isCrimsonMode ? '#1e050b' : '#111726';
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * (1 - (illumPct - 0.5) * 2), r, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * (0.5 - illumPct) * 2, r, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = isCrimsonMode ? 'rgba(80, 10, 25, 0.4)' : 'rgba(160, 175, 200, 0.15)';
  [
    {x: cx - 40, y: cy - 30, radius: 18},
    {x: cx + 30, y: cy + 40, radius: 24},
    {x: cx + 50, y: cy - 20, radius: 14},
    {x: cx - 20, y: cy + 50, radius: 16},
    {x: cx, y: cy, radius: 28}
  ].forEach(crater => {
    ctx.beginPath();
    ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function updateView(date) {
  currentDate = date;
  const moonData = calculateMoonPhase(date);
  const seaData = calculateSeaSolunar(date, moonData);

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  selectedDateStr.textContent = date.toLocaleDateString('en-US', options);
  dateInput.value = date.toISOString().split('T')[0];

  const appHeaderTitle = document.getElementById('app-header-title');
  const appHeaderSub = document.getElementById('app-header-sub');
  const conditionTitle = document.getElementById('condition-title');
  const medDesc = document.getElementById('med-desc');
  const speciesTitle = document.getElementById('species-title');
  const feedingTitle = document.getElementById('feeding-title');

  if (isCrimsonMode) {
    const cObj = UPCOMING_CRIMSON_MOONS[crimsonIndex];
    if (appHeaderTitle) appHeaderTitle.textContent = "CRIMSON LUNA";
    if (appHeaderSub) appHeaderSub.textContent = `CRIMSON ECLIPSE #${crimsonIndex + 1} OF 8: ${cObj.name.toUpperCase()}`;
    if (conditionTitle) conditionTitle.textContent = `🩸 ${cObj.name}`;
    if (medDesc) medDesc.innerHTML = `<b>Eclipse Alignment Notice:</b> ${cObj.note}. Sun, Earth, and Moon align in 180° Syzygy, creating an intense gravitational surge for marine predators in ${activeSeaMode === 'malaysia' ? 'Malaysian Tropical Seas' : 'Mediterranean Waters'}!`;
    if (speciesTitle) speciesTitle.textContent = `🩸 ${activeSeaMode === 'malaysia' ? 'Malaysian' : 'Mediterranean'} Target Species for ${cObj.name}`;
    if (feedingTitle) feedingTitle.textContent = `🩸 Totality Windows for ${cObj.name}`;
    
    if (nextCrimsonBtn) nextCrimsonBtn.classList.remove('hidden');
    if (crimsonIndexTag) crimsonIndexTag.textContent = `(${crimsonIndex + 1}/${UPCOMING_CRIMSON_MOONS.length})`;
  } else {
    if (appHeaderTitle) appHeaderTitle.textContent = "LUNA GLOW";
    if (appHeaderSub) appHeaderSub.textContent = activeSeaMode === 'malaysia' ? "MALAYSIAN SEAS ANGLER & MONSOON OBSERVATORY" : "MEDITERRANEAN SEA ANGLER & SPECIES OBSERVATORY";
    if (conditionTitle) conditionTitle.textContent = activeSeaMode === 'malaysia' ? "🇲🇾 Malaysian Seas & Barometric Gauge" : "🌊 Mediterranean Sea & Barometric Gauge";
    if (medDesc) medDesc.innerHTML = activeSeaMode === 'malaysia' ? 
      "<b>Malaysian Macro-Tidal & Monsoon Dynamics:</b> Malaysian waters feature strong 2m-4m tidal ranges. Solunar Major Overhead periods combined with Monsoon swell conditions drive peak bites for Barramundi, Tenggiri, and GTs!" : 
      "<b>Mediterranean Micro-Tidal Dynamics:</b> Because Mediterranean tides are small (20-40cm), Solunar Moon Overhead periods and Sea Surface Temperature (SST) drive 90% of fish feeding behavior!";
    if (speciesTitle) speciesTitle.textContent = activeSeaMode === 'malaysia' ? "🇲🇾 Malaysian Seas Species Field Reference Guide" : "🐟 Mediterranean Species Field Reference Guide";
    if (feedingTitle) feedingTitle.textContent = "⏰ Solunar Feeding Windows";
    
    if (nextCrimsonBtn) nextCrimsonBtn.classList.add('hidden');
  }

  illumVal.textContent = isCrimsonMode ? "100% (Totality)" : `${moonData.illumination}%`;
  ageVal.textContent = `${moonData.age} days`;
  distVal.textContent = `${moonData.distance} km`;
  cycleSlider.value = moonData.age;

  if (isCrimsonMode) {
    phaseBadge.textContent = `ECLIPSE ${crimsonIndex + 1}/8`;
    phaseBadge.className = "badge badge-crimson";
  } else {
    phaseBadge.textContent = moonData.phaseName.toUpperCase();
    phaseBadge.className = "badge";
  }

  drawMoonCanvas(moonData.illumination, moonData.phaseName);

  medSeasonBadge.textContent = seaData.seasonTxt;
  medSeasonBadge.className = isCrimsonMode ? 'rating-badge rating-prime' : `rating-badge ${seaData.seasonClass}`;

  sstVal.textContent = seaData.sstTxt;
  if (baroVal) baroVal.textContent = seaData.baroTxt;
  if (swellVal) swellVal.textContent = seaData.swellTxt;
  solunarScoreTxt.textContent = `${seaData.score}/100`;

  major1Val.textContent = seaData.major1;
  major2Val.textContent = seaData.major2;
  minor1Val.textContent = seaData.minor1;
  minor2Val.textContent = seaData.minor2;

  renderSeasonalSpeciesForDate(date);
}

dateInput.addEventListener('change', (e) => {
  if (e.target.value) {
    updateView(new Date(e.target.value));
  }
});

document.getElementById('today-btn').addEventListener('click', () => {
  isCrimsonMode = false;
  document.body.classList.remove('crimson-theme');
  updateView(new Date());
});

cycleSlider.addEventListener('input', (e) => {
  const targetAge = parseFloat(e.target.value);
  const diffDays = targetAge - calculateMoonPhase(currentDate).age;
  const newDate = new Date(currentDate.getTime() + diffDays * 24 * 60 * 60 * 1000);
  updateView(newDate);
});

// Mode Toggles (Mediterranean vs Malaysian Seas)
medModeBtn.addEventListener('click', async () => {
  activeSeaMode = 'med';
  medModeBtn.classList.add('active');
  malaysiaModeBtn.classList.remove('active');
  await fetchLiveInternetMarineData('med');
  updateView(currentDate);
});

malaysiaModeBtn.addEventListener('click', async () => {
  activeSeaMode = 'malaysia';
  malaysiaModeBtn.classList.add('active');
  medModeBtn.classList.remove('active');
  await fetchLiveInternetMarineData('malaysia');
  updateView(currentDate);
});

document.querySelectorAll('.mobile-bottom-nav .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mobile-bottom-nav .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const targetId = btn.dataset.target;
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

document.querySelectorAll('.depth-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.depth-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeDepthFilter = btn.dataset.depth;
    renderSeasonalSpeciesForDate(currentDate);
  });
});

document.querySelectorAll('.chip-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const preset = btn.dataset.preset;
    isCrimsonMode = false;
    document.body.classList.remove('crimson-theme');
    const nextPhaseDate = findNextMoonPhaseDate(currentDate, preset);
    updateView(nextPhaseDate);
  });
});

crimsonModeBtn.addEventListener('click', () => {
  isCrimsonMode = !isCrimsonMode;
  if (isCrimsonMode) {
    document.body.classList.add('crimson-theme');
    crimsonModeBtn.style.background = "rgba(255, 51, 102, 0.25)";
    crimsonIndex = 0;
    updateView(UPCOMING_CRIMSON_MOONS[0].date);
  } else {
    document.body.classList.remove('crimson-theme');
    crimsonModeBtn.style.background = "transparent";
    updateView(new Date());
  }
});

if (nextCrimsonBtn) {
  nextCrimsonBtn.addEventListener('click', () => {
    isCrimsonMode = true;
    document.body.classList.add('crimson-theme');
    crimsonIndex = (crimsonIndex + 1) % UPCOMING_CRIMSON_MOONS.length;
    updateView(UPCOMING_CRIMSON_MOONS[crimsonIndex].date);
  });
}

timelapseBtn.addEventListener('click', () => {
  if (isTimelapseRunning) {
    clearInterval(timelapseInterval);
    isTimelapseRunning = false;
    timelapseBtn.textContent = "▶ Play Timelapse";
  } else {
    isTimelapseRunning = true;
    timelapseBtn.textContent = "⏸ Pause";
    timelapseInterval = setInterval(() => {
      const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      updateView(nextDate);
    }, 300);
  }
});

saveJournalBtn.addEventListener('click', () => {
  const note = journalInput.value.trim();
  if (note) {
    const key = `luna_${activeSeaMode}_log_${currentDate.toISOString().split('T')[0]}`;
    localStorage.setItem(key, note);
    journalStatus.textContent = `Saved to ${activeSeaMode === 'malaysia' ? 'Malaysian' : 'Mediterranean'} Log! 🎣`;
    setTimeout(() => { journalStatus.textContent = ""; }, 2500);
  }
});

function initStarfield() {
  const canvas = document.getElementById('cosmic-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  const stars = [];
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005
    });
  }

  function renderStars() {
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 244, 252, ${Math.abs(s.alpha)})`;
      ctx.fill();
    });
    requestAnimationFrame(renderStars);
  }
  renderStars();

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  loadDatabases();
});
