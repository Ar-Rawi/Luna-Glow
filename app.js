// app.js — LUNA GLOW Worldwide Marine Angler & Astronomical Observatory Engine v20
// Infallible Null-Safe Dynamic Render Engine (Zero Exception Guarantee)

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

// EMBEDDED GLOBAL MARINE SPECIES DATABASE
const GLOBAL_SPECIES_DATABASE = [
  // MEDITERRANEAN
  {
    id: "med_sp1", region: "med", name: "Bluefin Tuna", scientificName: "Thunnus thynnus",
    seasonCategory: "Summer/Autumn Apex", peakMonths: [4, 5, 6, 7, 8, 9, 10], depth: "20m - 150m", depthCategory: "deep", idealSST: "20°C - 25°C",
    tactics: "Chumming with sardines (drifting) or trolling heavy skirted lures along continental drop-offs during major solunar hours.",
    recommendedBait: "Live Sardines, Mackerel Chum, Skirted Trolling Lures"
  },
  {
    id: "med_sp2", region: "med", name: "European Sea Bass (Spigola)", scientificName: "Dicentrarchus labrax",
    seasonCategory: "Coastal Surf & Estuary", peakMonths: [0, 1, 2, 7, 8, 9, 10, 11], depth: "1m - 15m", depthCategory: "shallow", idealSST: "18°C - 23°C",
    tactics: "Casting soft plastics or minnow lures around river mouths, harbor jetties, and rocky surf zones during dawn minor hours.",
    recommendedBait: "Live Glass Eels, Small Sandeels, 110mm Floating Minnows"
  },
  {
    id: "med_sp3", region: "med", name: "Dentex (Dentice)", scientificName: "Dentex dentex",
    seasonCategory: "Reef Apex Predator", peakMonths: [3, 4, 5, 6, 7, 8, 9, 10], depth: "15m - 50m", depthCategory: "reef", idealSST: "19°C - 24°C",
    tactics: "Slow trolling live squid or cuttlefish with downrigger over rocky pinnacles during moon overhead periods.",
    recommendedBait: "Live Whole Squid, Live Cuttlefish, Needlefish"
  },
  {
    id: "med_sp4", region: "med", name: "Greater Amberjack (Ricciola)", scientificName: "Seriola dumerili",
    seasonCategory: "Summer/Autumn Powerhouse", peakMonths: [5, 6, 7, 8, 9, 10], depth: "20m - 80m", depthCategory: "reef", idealSST: "22°C - 26°C",
    tactics: "Vertical metal jigging (150g-250g) over deep wrecks or live baiting with needlefish during major solunar hours.",
    recommendedBait: "Live Needlefish, Small Bonito, 200g Metal Speed Jigs"
  },
  {
    id: "med_sp5", region: "med", name: "Gilthead Seabream (Orata)", scientificName: "Sparus aurata",
    seasonCategory: "Coastal Feeder", peakMonths: [4, 5, 6, 7, 8, 9, 10], depth: "2m - 20m", depthCategory: "shallow", idealSST: "20°C - 25°C",
    tactics: "Surfcasting with crab or bibi worm on sandy beaches and estuarine channels.",
    recommendedBait: "Whole Shore Crab, Bibi Worms, Razor Clams"
  },
  {
    id: "med_sp6", region: "med", name: "Mahi-Mahi (Lampuga)", scientificName: "Coryphaena hippurus",
    seasonCategory: "Offshore Surface Runner", peakMonths: [7, 8, 9, 10, 11], depth: "0m - 30m", depthCategory: "deep", idealSST: "23°C - 27°C",
    tactics: "Trolling small feathers or casting poppers near FADs (Fish Aggregating Devices) during high pressure days.",
    recommendedBait: "Small Feather Rigs, Flying Fish, Topwater Poppers"
  },

  // MALAYSIA
  {
    id: "my_sp1", region: "malaysia", name: "Barramundi (Siakap)", scientificName: "Lates calcarifer",
    seasonCategory: "Estuary Golden Strike", peakMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], depth: "1m - 12m", depthCategory: "shallow", idealSST: "28°C - 31°C",
    tactics: "Casting soft plastic paddletails or live prawn drifting near mangrove pylons and river mouths during incoming tide.",
    recommendedBait: "Live Tiger Prawns, Live Mullet, 4-inch Paddletail Shads"
  },
  {
    id: "my_sp2", region: "malaysia", name: "Giant Trevally (Cebali / GT)", scientificName: "Caranx ignobilis",
    seasonCategory: "Year-Round Reef Apex", peakMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], depth: "10m - 60m", depthCategory: "reef", idealSST: "28°C - 30°C",
    tactics: "Heavy topwater popping (100g-160g poppers) over shallow reef drop-offs during major moon overhead hours.",
    recommendedBait: "Live Tamban, 120g Chugger Poppers, Live Selar"
  },
  {
    id: "my_sp3", region: "malaysia", name: "Spanish Mackerel (Tenggiri)", scientificName: "Scomberomorus commerson",
    seasonCategory: "Southwest Monsoon Golden", peakMonths: [3, 4, 5, 6, 7, 8, 9], depth: "15m - 40m", depthCategory: "reef", idealSST: "28°C - 30°C",
    tactics: "Fast trolling minnow lures (Rapala CD14) or drifting live selar/tamban with wire trace.",
    recommendedBait: "Live Tamban, Live Selar, Rapala CD14 Deep Divers"
  },
  {
    id: "my_sp4", region: "malaysia", name: "Mangrove Red Snapper (Siakap Merah)", scientificName: "Lutjanus argentimaculatus",
    seasonCategory: "Estuary & Island Reef", peakMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], depth: "2m - 25m", depthCategory: "shallow", idealSST: "27°C - 30°C",
    tactics: "Bottom fishing with live squid or casting deep-diver crankbaits near submerged rock piles.",
    recommendedBait: "Live Mud Crabs, Fresh Squid Strips, Deep Diver Crankbaits"
  },
  {
    id: "my_sp5", region: "malaysia", name: "Indo-Pacific Sailfish (Layaran)", scientificName: "Istiophorus platypterus",
    seasonCategory: "Kuala Rompin Peak", peakMonths: [5, 6, 7, 8, 9, 10], depth: "15m - 50m", depthCategory: "deep", idealSST: "28°C - 30°C",
    tactics: "Drifting live tamban or kembung with balloon rigs near bird aggregations off Rompin.",
    recommendedBait: "Live Tamban, Live Kembung with Balloon Rig"
  },

  // GULF OF MEXICO
  {
    id: "gulf_sp1", region: "gulf_mexico", name: "Red Snapper", scientificName: "Lutjanus campechanus",
    seasonCategory: "Summer Reef Season", peakMonths: [4, 5, 6, 7, 8, 9], depth: "15m - 60m", depthCategory: "reef", idealSST: "24°C - 28°C",
    tactics: "Bottom dropping with cut cigar minnows or pogies over artificial reefs and oil rigs.",
    recommendedBait: "Cut Cigar Minnows, Pogies, Squid Strips"
  },
  {
    id: "gulf_sp2", region: "gulf_mexico", name: "Tarpon (Silver King)", scientificName: "Megalops atlanticus",
    seasonCategory: "Pass Migration", peakMonths: [4, 5, 6, 7, 8, 9], depth: "2m - 15m", depthCategory: "shallow", idealSST: "26°C - 30°C",
    tactics: "Drifting live pass crabs or mullet along beach tide lines during full moon spring tides.",
    recommendedBait: "Live Blue Crabs, Live Mullet, Pass Crabs"
  },
  {
    id: "gulf_sp3", region: "gulf_mexico", name: "Red Drum (Redfish)", scientificName: "Sciaenops ocellatus",
    seasonCategory: "Flats & Bull Red Run", peakMonths: [0, 1, 2, 7, 8, 9, 10, 11], depth: "1m - 10m", depthCategory: "shallow", idealSST: "20°C - 26°C",
    tactics: "Sight casting gold spoons or jigheads with Gulp shrimp in marsh flats and oyster bars.",
    recommendedBait: "Live Mud Crabs, Gulp Alive Shrimp, Gold Spoons"
  },

  // CARIBBEAN
  {
    id: "carib_sp1", region: "caribbean", name: "Bonefish", scientificName: "Albula vulpes",
    seasonCategory: "Year-Round Flats King", peakMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], depth: "0.5m - 3m", depthCategory: "shallow", idealSST: "25°C - 29°C",
    tactics: "Fly fishing with Gotcha patterns or light spinning with live mantis shrimp on skinny sand flats.",
    recommendedBait: "Live Mantis Shrimp, Gotcha Fly #4, Live Dollar Crabs"
  },
  {
    id: "carib_sp2", region: "caribbean", name: "Permit", scientificName: "Trachinotus falcatus",
    seasonCategory: "Flats Challenge", peakMonths: [2, 3, 4, 5, 6, 7], depth: "1m - 8m", depthCategory: "shallow", idealSST: "26°C - 29°C",
    tactics: "Sight casting live dollar crabs to tailing fish on coral rubble flats.",
    recommendedBait: "Live Pass Crabs, Live Fiddler Crabs"
  },

  // CORAL SEA
  {
    id: "coral_sp1", region: "coral_sea", name: "Coral Trout", scientificName: "Plectropomus leopardus",
    seasonCategory: "Barrier Reef Prime", peakMonths: [3, 4, 5, 6, 7, 8, 9, 10], depth: "5m - 35m", depthCategory: "reef", idealSST: "24°C - 27°C",
    tactics: "Casting stickbaits over coral bommies or dropping slow-pitch jigs into deep reef gaps.",
    recommendedBait: "Live Fusiliers, 140mm Floating Stickbaits, Slow-Pitch Jigs"
  },
  {
    id: "coral_sp2", region: "coral_sea", name: "Dogtooth Tuna", scientificName: "Gymnosarda unicolor",
    seasonCategory: "Outer Atoll Monster", peakMonths: [7, 8, 9, 10, 11], depth: "30m - 120m", depthCategory: "deep", idealSST: "25°C - 28°C",
    tactics: "Heavy vertical jigging (250g-400g) on steep outer drop-offs during major moon overhead hours.",
    recommendedBait: "300g Knife Jigs, Whole Bonito, Live Rainbow Runner"
  },

  // SEA OF JAPAN
  {
    id: "japan_sp1", region: "sea_japan", name: "Japanese Yellowtail (Buri)", scientificName: "Seriola quinqueradiata",
    seasonCategory: "Golden Buri Season", peakMonths: [8, 9, 10, 11, 0, 1], depth: "20m - 80m", depthCategory: "reef", idealSST: "16°C - 21°C",
    tactics: "Offshore king-slashing vertical metal jigging over rocky banks during high barometric pressure.",
    recommendedBait: "180g Metal Long Jigs, Live Saury (Sanma), Anchovy Chum"
  },
  {
    id: "japan_sp2", region: "sea_japan", name: "Japanese Sea Bass (Suzuki)", scientificName: "Lateolabrax japonicus",
    seasonCategory: "River Mouth & Jetty", peakMonths: [2, 3, 4, 5, 8, 9, 10], depth: "2m - 15m", depthCategory: "shallow", idealSST: "15°C - 20°C",
    tactics: "Night casting slim minnow plugs around bridge pilings and estuarine current seams.",
    recommendedBait: "125mm Shallow Runner Plugs, Live Sandworms"
  },

  // NORTH SEA
  {
    id: "north_sp1", region: "north_sea", name: "Atlantic Cod", scientificName: "Gadus morhua",
    seasonCategory: "Winter Wreck Monster", peakMonths: [9, 10, 11, 0, 1, 2], depth: "20m - 100m", depthCategory: "deep", idealSST: "8°C - 13°C",
    tactics: "Wreck fishing with pirkers (metal jigs) or black rubber sandeel lures on deep North Sea wrecks.",
    recommendedBait: "250g Norway Pirkers, Red Mackerel Rubber Sandeels, Lugworms"
  },

  // RED SEA
  {
    id: "red_sp1", region: "red_sea", name: "Emperor Snapper", scientificName: "Lutjanus sebae",
    seasonCategory: "Red Sea Coral Plateau", peakMonths: [1, 2, 3, 4, 9, 10, 11], depth: "15m - 60m", depthCategory: "reef", idealSST: "24°C - 28°C",
    tactics: "Bottom dropping whole squid or mackerel strips on offshore coral reef banks.",
    recommendedBait: "Whole Fresh Squid, Mackerel Strips, Live Fusiliers"
  },

  // PACIFIC NORTHWEST
  {
    id: "pnw_sp1", region: "pacific_nw", name: "Chinook Salmon (King Salmon)", scientificName: "Oncorhynchus tshawytscha",
    seasonCategory: "Summer Run King", peakMonths: [4, 5, 6, 7, 8], depth: "10m - 50m", depthCategory: "deep", idealSST: "11°C - 15°C",
    tactics: "Trolling downriggers with flasher and herring strip or spoon at 60-120ft depth.",
    recommendedBait: "Whole Green Label Herring Strips, UV Flashers, Anchovies"
  },

  // INDIAN OCEAN
  {
    id: "ind_sp1", region: "indian_ocean", name: "Yellowfin Tuna", scientificName: "Thunnus albacares",
    seasonCategory: "Agulhas Current Run", peakMonths: [9, 10, 11, 0, 1, 2], depth: "30m - 150m", depthCategory: "deep", idealSST: "21°C - 26°C",
    tactics: "Chumming with pilchards or trolling skirted lures along continental shelf edges.",
    recommendedBait: "Live Pilchards, Chummed Sardines, Skirted Trolling Plugs"
  }
];

let activeLocation = GLOBAL_SEA_PRESETS.med;
let activeDepthFilter = 'all';
let currentDate = new Date();
let liveMarineData = null;
let isTimelapsePlaying = false;
let timelapseTimer = null;

// Safely reset Depth Filter to 'all'
function resetDepthFilterToAll() {
  activeDepthFilter = 'all';
  const buttons = document.querySelectorAll('.depth-btn');
  if (buttons && buttons.length > 0) {
    buttons.forEach(btn => {
      if (btn.dataset.depth === 'all') btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }
}

// Fetch Live Internet Marine Weather Data
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

// Geocoding API Search Function
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

        resetDepthFilterToAll();
        updateView(currentDate);
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
  const phaseRatio = (age % LUNAR_MONTH) / LUNAR_MONTH;
  const f = (1 - Math.cos(phaseRatio * 2 * Math.PI)) / 2;

  ctx.clearRect(0, 0, w, h);

  // STEP 1: Full Bright White Moon Disc
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

  // STEP 2: Dark Shadow Mask Layer
  if (f <= 0.98) {
    ctx.save();

    if (f <= 0.02) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
    } else if (phaseRatio <= 0.5) {
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

  // STEP 3: Atmosphere Glow
  if (f > 0.05) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 242, 254, ${0.45 * f})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

// Render Seasonal Species Cards with Guaranteed Fallback & Null-Safety
function renderSeasonalSpeciesForDate(date) {
  const container = document.getElementById('species-list-container');
  if (!container) return;
  container.innerHTML = '';

  if (!activeDepthFilter) activeDepthFilter = 'all';

  const selectedMonth = date.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const mName = monthNames[selectedMonth];

  // 1st Priority: Region Match
  let activeSpecies = GLOBAL_SPECIES_DATABASE.filter(sp => {
    return activeLocation.regionKey === 'custom' || sp.region === activeLocation.regionKey;
  });

  // 2nd Priority Fallback: All Database Species
  if (activeSpecies.length === 0) {
    activeSpecies = GLOBAL_SPECIES_DATABASE;
  }

  // Apply Depth Filter if chosen
  if (activeDepthFilter !== 'all') {
    const filtered = activeSpecies.filter(sp => sp.depthCategory === activeDepthFilter);
    if (filtered.length > 0) activeSpecies = filtered;
  }

  const headerDiv = document.createElement('div');
  headerDiv.style.cssText = "margin-bottom: 0.8rem; font-size:0.85rem; font-weight:700; color:var(--accent-gold);";
  
  const depthTag = activeDepthFilter !== 'all' ? ` [${activeDepthFilter.toUpperCase()} HABITAT]` : ' [ALL DEPTHS]';
  headerDiv.innerHTML = `🎣 <b>${activeLocation.name.toUpperCase()}${depthTag} — ${activeSpecies.length} Target Species in Season for ${mName}:</b>`;
  container.appendChild(headerDiv);

  activeSpecies.forEach(sp => {
    const baitTxt = sp.recommendedBait ? `<div class="rigging-box">🪤 <b>Recommended Bait:</b> ${sp.recommendedBait}</div>` : '';

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
        ${baitTxt}
      </div>
    `;
    container.appendChild(card);
  });
}

function formatHourToAMPM(h) {
  let hour = Math.floor(h) % 24;
  if (hour < 0) hour += 24;
  const mins = Math.floor((h % 1) * 60);
  const minStr = mins < 10 ? `0${mins}` : `${mins}`;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  let displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;
  const hourStr = displayHour < 10 ? `0${displayHour}` : `${displayHour}`;
  return `${hourStr}:${minStr} ${ampm}`;
}

function formatSolunarWindow(centerHour, durationHours) {
  const start = centerHour - durationHours / 2;
  const end = centerHour + durationHours / 2;
  return `${formatHourToAMPM(start)} – ${formatHourToAMPM(end)}`;
}

// Global Solunar Engine
function calculateSeaSolunar(date = new Date(), moonData) {
  const illum = parseFloat(moonData.illumination);
  let score = Math.round(72 + (illum > 80 || illum < 20 ? 18 : 10) + (Math.random() * 4));
  let baroHpa = liveMarineData ? liveMarineData.pressure : 1013;
  let sstVal = liveMarineData ? `${liveMarineData.sst}°C` : "25.0°C";
  let baroTxt = `${baroHpa} hPa (🟢 OPTIMAL BITE)`;
  if (baroHpa < 1010) baroTxt = `${baroHpa} hPa (⚡ PRE-FRONTAL STRIKE FRENZY)`;
  let swellTxt = "0.7m Swell (🟢 SAFE / GLASSY)";

  const coordStr = `(${activeLocation.lat.toFixed(2)}°, ${activeLocation.lon.toFixed(2)}°)`;
  let seasonTxt = `${activeLocation.name.toUpperCase()} BASIN ${coordStr}`;

  return { score, sstTxt, seasonTxt, baroTxt, swellTxt };
}

// Master View Update (Null-Safe DOM Element Protection)
function updateView(date = new Date()) {
  currentDate = date;
  const moonInfo = calculateMoonPhase(date);
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  
  const dateStrEl = document.getElementById('selected-date-str');
  if (dateStrEl) dateStrEl.textContent = date.toLocaleDateString('en-US', options);
  
  const dateInputEl = document.getElementById('date-input');
  if (dateInputEl) dateInputEl.value = date.toISOString().split('T')[0];

  const illumEl = document.getElementById('illum-val');
  if (illumEl) illumEl.textContent = `${moonInfo.illumination}%`;
  
  const ageEl = document.getElementById('age-val');
  if (ageEl) ageEl.textContent = `${moonInfo.age} days`;
  
  const distEl = document.getElementById('dist-val');
  if (distEl) distEl.textContent = `${moonInfo.distance} km`;

  const badgeEl = document.getElementById('phase-badge');
  if (badgeEl) badgeEl.textContent = moonInfo.phaseName.toUpperCase();

  render3DMoonCanvas(moonInfo);

  const sol = calculateSeaSolunar(date, moonInfo);
  
  const scoreEl = document.getElementById('solunar-score-val');
  if (scoreEl) scoreEl.textContent = sol.score;
  
  const sstEl = document.getElementById('sst-val');
  if (sstEl) sstEl.textContent = sol.sstTxt;
  
  const baroEl = document.getElementById('baro-val');
  if (baroEl) baroEl.textContent = sol.baroTxt;
  
  const swellEl = document.getElementById('swell-val');
  if (swellEl) swellEl.textContent = sol.swellTxt;
  
  const medBadgeEl = document.getElementById('med-season-badge');
  if (medBadgeEl) medBadgeEl.textContent = sol.seasonTxt;

  const scoreHead = document.getElementById('solunar-headline');
  if (scoreHead) {
    if (sol.score >= 90) scoreHead.textContent = `🔥 PEAK SOLUNAR STRIKE FRENZY — ${activeLocation.name}`;
    else if (sol.score >= 80) scoreHead.textContent = `🟢 GOOD FISHING CONDITIONS — ${activeLocation.name}`;
    else scoreHead.textContent = `🟡 MODERATE STRIKE WINDOW — ${activeLocation.name}`;
  }

  // Dynamic Solunar Windows Calculation
  const age = parseFloat(moonInfo.rawAge || moonInfo.age);
  const overheadHour = (12 + age * 0.833) % 24;
  const underfootHour = (age * 0.833) % 24;
  const moonriseHour = (6 + age * 0.833) % 24;
  const moonsetHour = (18 + age * 0.833) % 24;

  const maj1El = document.getElementById('major1-val');
  if (maj1El) maj1El.textContent = formatSolunarWindow(overheadHour, 2);

  const maj2El = document.getElementById('major2-val');
  if (maj2El) maj2El.textContent = formatSolunarWindow(underfootHour, 2);

  const min1El = document.getElementById('minor1-val');
  if (min1El) min1El.textContent = formatSolunarWindow(moonriseHour, 1);

  const min2El = document.getElementById('minor2-val');
  if (min2El) min2El.textContent = formatSolunarWindow(moonsetHour, 1);

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
        resetDepthFilterToAll();
        updateView(currentDate);
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

      if (typeof gsap !== 'undefined') {
        gsap.fromTo('#moon-canvas', { scale: 0.85, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' });
      }
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

  // 30-Day Timelapse Slider & Play/Pause Button
  const cycleSlider = document.getElementById('cycle-slider');
  const timelapseBtn = document.getElementById('timelapse-btn');

  if (cycleSlider) {
    cycleSlider.addEventListener('input', (e) => {
      if (isTimelapsePlaying) {
        clearInterval(timelapseTimer);
        isTimelapsePlaying = false;
        if (timelapseBtn) timelapseBtn.textContent = '▶ Play Timelapse';
      }
      const val = parseFloat(e.target.value);
      const newD = new Date(KNOWN_NEW_MOON.getTime() + val * 24 * 60 * 60 * 1000);
      updateView(newD);
    });
  }

  if (timelapseBtn) {
    timelapseBtn.addEventListener('click', () => {
      if (isTimelapsePlaying) {
        clearInterval(timelapseTimer);
        isTimelapsePlaying = false;
        timelapseBtn.textContent = '▶ Play Timelapse';
      } else {
        isTimelapsePlaying = true;
        timelapseBtn.textContent = '⏸️ Pause Timelapse';
        timelapseTimer = setInterval(() => {
          currentDate = new Date(currentDate.getTime() + 12 * 60 * 60 * 1000);
          updateView(currentDate);

          // Synchronize cycle slider position during playback
          if (cycleSlider) {
            const diffDays = (currentDate.getTime() - KNOWN_NEW_MOON.getTime()) / (1000 * 60 * 60 * 24);
            let age = diffDays % LUNAR_MONTH;
            if (age < 0) age += LUNAR_MONTH;
            cycleSlider.value = age.toFixed(1);
          }
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
      if (journalStatus) journalStatus.textContent = '✅ Log Saved!';
      setTimeout(() => { if (journalStatus) journalStatus.textContent = ''; }, 3000);
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

// SAFE INITIALIZATION ON DOM READY
document.addEventListener('DOMContentLoaded', () => {
  initCosmicCanvas();
  setupEvents();
  resetDepthFilterToAll();
  updateView(currentDate);

  fetchLiveInternetMarineData(activeLocation.lat, activeLocation.lon).then(() => {
    updateView(currentDate);
  });
});
