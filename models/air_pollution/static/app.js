/**
 * India Air Quality Intelligence Dashboard
 * Frontend Application Logic
 */

// ===================== GLOBALS =====================
let forecastChart = null;
let leafletMap = null;
let leafletMarker = null;
let cityMarkers = [];
let currentData = null;
let currentChartKey = 'aqi';
let customLat = null;
let customLon = null;

// City coordinates for map markers
const CITY_COORDS = {
  "Delhi":         [28.6139, 77.2090],
  "Mumbai":        [19.0760, 72.8777],
  "Bengaluru":     [12.9716, 77.5946],
  "Chennai":       [13.0827, 80.2707],
  "Kolkata":       [22.5726, 88.3639],
  "Hyderabad":     [17.3850, 78.4867],
  "Ahmedabad":     [23.0225, 72.5714],
  "Pune":          [18.5204, 73.8567],
  "Jaipur":        [26.9124, 75.7873],
  "Lucknow":       [26.8467, 80.9462],
  "Kanpur":        [26.4499, 80.3319],
  "Patna":         [25.5941, 85.1376],
  "Chandigarh":    [30.7333, 76.7794],
  "Varanasi":      [25.3176, 82.9739],
  "Indore":        [22.7196, 75.8577],
  "Bhopal":        [23.2599, 77.4126],
  "Nagpur":        [21.1458, 79.0882],
  "Visakhapatnam": [17.6868, 83.2185],
  "Kochi":         [ 9.9312, 76.2673],
  "Guwahati":      [26.1445, 91.7362],
  "Dehradun":      [30.3165, 78.0322],
  "Surat":         [21.1702, 72.8311],
  "Agra":          [27.1767, 78.0081],
  "Noida":         [28.5355, 77.3910],
  "Gurugram":      [28.4595, 77.0266],
};

// ===================== MAP INIT =====================
function initMap() {
  leafletMap = L.map('indiaMap', {
    center: [22.5, 82.0],
    zoom: 4,
    zoomControl: true,
    attributionControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    subdomains: 'abcd'
  }).addTo(leafletMap);

  // City pulse markers
  Object.entries(CITY_COORDS).forEach(([city, [lat, lon]]) => {
    const marker = L.circleMarker([lat, lon], {
      radius: 5,
      fillColor: '#4F8EF7',
      color: 'rgba(79,142,247,0.4)',
      weight: 6,
      opacity: 0.9,
      fillOpacity: 0.9
    }).addTo(leafletMap);

    marker.bindTooltip(`<b style="font-family:Outfit,sans-serif">${city}</b>`, {
      className: 'custom-tooltip',
      permanent: false,
      direction: 'top',
      offset: [0, -8]
    });

    marker.on('click', () => {
      document.getElementById('citySelect').value = city;
      customLat = null;
      customLon = null;
      runForecast();
    });

    cityMarkers.push({ city, marker });
  });

  // Click anywhere on map
  leafletMap.on('click', (e) => {
    const { lat, lng } = e.latlng;
    customLat = parseFloat(lat.toFixed(4));
    customLon = parseFloat(lng.toFixed(4));
    document.getElementById('mapCoordsDisplay').textContent = `${customLat}°N, ${customLon}°E`;

    if (leafletMarker) leafletMap.removeLayer(leafletMarker);
    leafletMarker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: '#A78BFA',
      color: 'rgba(167,139,250,0.5)',
      weight: 10,
      opacity: 0.9,
      fillOpacity: 1
    }).addTo(leafletMap);

    runForecast();
  });
}

// ===================== UPDATE CITY MARKERS WITH AQI COLOR =====================
function updateMarkerColor(city, aqi) {
  const markerObj = cityMarkers.find(m => m.city === city);
  if (!markerObj) return;
  const color = aqiToColor(aqi);
  markerObj.marker.setStyle({
    fillColor: color,
    color: color + '55',
    weight: 6
  });
}

function aqiToColor(aqi) {
  if (aqi <= 50)  return '#10B981';
  if (aqi <= 100) return '#84CC16';
  if (aqi <= 200) return '#EAB308';
  if (aqi <= 300) return '#F97316';
  if (aqi <= 400) return '#EF4444';
  return '#7F1D1D';
}

// ===================== MAIN FORECAST FUNCTION =====================
async function runForecast() {
  setStatus('loading', 'Fetching atmospheric data and running AI forecast…');

  const btn = document.getElementById('predictBtn');
  const btnIcon = document.getElementById('btnIcon');
  const btnText = document.getElementById('btnText');
  btn.classList.add('loading');
  btnIcon.className = 'fa-solid fa-circle-notch spin';
  btnText.textContent = 'Forecasting…';

  const city = customLat === null ? document.getElementById('citySelect').value : null;
  const apiKey = document.getElementById('apiKeyInput').value.trim();

  const body = { api_key: apiKey || '' };
  if (customLat !== null && customLon !== null) {
    body.lat = customLat;
    body.lon = customLon;
  } else {
    body.city = city;
  }

  try {
    const res = await fetch('/api/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'API error');
    }

    currentData = await res.json();
    renderAll(currentData);
    setStatus('success', `Forecast ready for ${currentData.location.city} · Source: ${currentData.data_source}`);

    if (city) updateMarkerColor(city, currentData.current.cpcb_aqi);

  } catch (e) {
    setStatus('error', `Error: ${e.message}`);
  } finally {
    btn.classList.remove('loading');
    btnIcon.className = 'fa-solid fa-satellite-dish';
    btnText.textContent = 'Predict 24h';
  }
}

// ===================== RENDER ALL COMPONENTS =====================
function renderAll(data) {
  renderAqiGauge(data.current);
  renderSubIndices(data.current);
  renderStatCards(data);
  renderForecastChart(data.series, currentChartKey);
  renderForecastTable(data.hourly_forecast);
  renderHealthPanel(data.health_advisory);
  renderSourceBadge(data.data_source);
}

// ===================== AQI GAUGE =====================
function renderAqiGauge(current) {
  const aqi = current.cpcb_aqi;
  const color = current.color;
  const category = current.category;
  const prominent = current.prominent_pollutant_display;

  document.getElementById('aqiNumber').textContent = aqi;
  document.getElementById('aqiNumber').style.color = color;

  document.getElementById('aqiBadge').textContent = category;
  document.getElementById('aqiBadge').style.color = color;
  document.getElementById('aqiBadge').style.background = color + '22';

  document.getElementById('prominentPollutant').innerHTML =
    `<i class="fa-solid fa-triangle-exclamation" style="color:${color}"></i> ${prominent}`;

  // Ring fill animation
  const circumference = 427;
  const fraction = Math.min(aqi / 500, 1);
  const offset = circumference - fraction * circumference;
  const ring = document.getElementById('aqiRingFill');
  ring.style.stroke = color;
  ring.style.strokeDashoffset = offset;
}

// ===================== SUB-INDICES =====================
function renderSubIndices(current) {
  const sub = current.sub_indices || {};
  const concentrations = current.concentrations || {};
  const list = document.getElementById('subIndexList');

  const pollutants = [
    { key: 'pm2_5',  label: 'PM2.5', unit: 'µg/m³' },
    { key: 'pm10',   label: 'PM10',  unit: 'µg/m³' },
    { key: 'no2',    label: 'NO2',   unit: 'µg/m³' },
    { key: 'so2',    label: 'SO2',   unit: 'µg/m³' },
    { key: 'o3',     label: 'O3',    unit: 'µg/m³' },
    { key: 'co',     label: 'CO',    unit: 'µg/m³' },
    { key: 'nh3',    label: 'NH3',   unit: 'µg/m³' },
  ];

  list.innerHTML = pollutants.map(p => {
    const val = sub[p.key] || 0;
    const conc = concentrations[p.key] || 0;
    const pct = Math.min((val / 500) * 100, 100);
    const color = aqiToColor(val);
    return `
      <div class="sub-index-row">
        <span class="sub-index-name">${p.label}</span>
        <div class="sub-index-bar-wrap">
          <div class="sub-index-bar" style="width:${pct}%;background:${color};"></div>
        </div>
        <span class="sub-index-val" style="color:${color}">${Math.round(val)}</span>
      </div>`;
  }).join('');
}

// ===================== STAT CARDS =====================
function renderStatCards(data) {
  const s = data.forecast_summary;
  document.getElementById('peakAqi').textContent = s.peak_aqi;
  document.getElementById('peakAqi').style.color = aqiToColor(s.peak_aqi);
  document.getElementById('peakHour').textContent = `At ${s.peak_hour}`;
  document.getElementById('avgAqi').textContent = s.avg_24h_aqi;
  document.getElementById('avgAqi').style.color = aqiToColor(s.avg_24h_aqi);

  const trajEl = document.getElementById('trajValue');
  trajEl.textContent = s.trajectory;
  if (s.trajectory === 'Deteriorating') {
    trajEl.style.color = '#EF4444';
    trajEl.innerHTML = '<i class="fa-solid fa-arrow-trend-up"></i> ' + s.trajectory;
  } else if (s.trajectory === 'Improving') {
    trajEl.style.color = '#10B981';
    trajEl.innerHTML = '<i class="fa-solid fa-arrow-trend-down"></i> ' + s.trajectory;
  } else {
    trajEl.style.color = '#22D3EE';
    trajEl.innerHTML = '<i class="fa-solid fa-minus"></i> ' + s.trajectory;
  }

  const pollutantDisplay = {
    pm2_5: 'PM2.5 dominant',
    pm10:  'PM10 dominant',
    no2:   'NO2 dominant',
    so2:   'SO2 dominant',
    co:    'CO dominant',
    o3:    'O3 dominant',
    nh3:   'NH3 dominant'
  };
  document.getElementById('trajPollutant').textContent = pollutantDisplay[s.prominent_pollutant] || s.prominent_pollutant;
}

// ===================== FORECAST CHART =====================
const CHART_CONFIG = {
  aqi:   { label: 'Predicted CPCB AQI',     color: '#4F8EF7', unit: '' },
  pm2_5: { label: 'PM2.5 (µg/m³)',           color: '#A78BFA', unit: ' µg/m³' },
  pm10:  { label: 'PM10 (µg/m³)',            color: '#F59E0B', unit: ' µg/m³' },
  no2:   { label: 'NO2 (µg/m³)',             color: '#22D3EE', unit: ' µg/m³' },
};

function switchChart(key) {
  currentChartKey = key;
  // Update toggle button styles
  ['aqi', 'pm2_5', 'pm10', 'no2'].forEach(k => {
    const btn = document.getElementById(`chartToggle${k.replace('_', '').replace('2', '2').charAt(0).toUpperCase() + k.replace('_', '').replace('2', '2').slice(1)}`);
  });
  document.getElementById('chartToggleAqi').style.background   = key === 'aqi'   ? 'var(--accent-soft)' : 'transparent';
  document.getElementById('chartToggleAqi').style.borderColor  = key === 'aqi'   ? 'var(--accent)'      : 'var(--border)';
  document.getElementById('chartToggleAqi').style.color        = key === 'aqi'   ? 'var(--accent)'      : 'var(--text-muted)';
  document.getElementById('chartTogglePm25').style.background  = key === 'pm2_5' ? 'rgba(167,139,250,0.15)' : 'transparent';
  document.getElementById('chartTogglePm25').style.borderColor = key === 'pm2_5' ? '#A78BFA'            : 'var(--border)';
  document.getElementById('chartTogglePm25').style.color       = key === 'pm2_5' ? '#A78BFA'            : 'var(--text-muted)';
  document.getElementById('chartTogglePm10').style.background  = key === 'pm10'  ? 'rgba(245,158,11,0.15)' : 'transparent';
  document.getElementById('chartTogglePm10').style.borderColor = key === 'pm10'  ? '#F59E0B'            : 'var(--border)';
  document.getElementById('chartTogglePm10').style.color       = key === 'pm10'  ? '#F59E0B'            : 'var(--text-muted)';
  document.getElementById('chartToggleNo2').style.background   = key === 'no2'   ? 'rgba(34,211,238,0.15)' : 'transparent';
  document.getElementById('chartToggleNo2').style.borderColor  = key === 'no2'   ? '#22D3EE'            : 'var(--border)';
  document.getElementById('chartToggleNo2').style.color        = key === 'no2'   ? '#22D3EE'            : 'var(--text-muted)';

  if (currentData) renderForecastChart(currentData.series, key);
}

function renderForecastChart(series, key = 'aqi') {
  const cfg = CHART_CONFIG[key];
  const data = series[key] || series.aqi;
  const labels = series.labels;
  const ctx = document.getElementById('forecastChart').getContext('2d');

  // CPCB threshold bands
  const thresholdAnnotations = key === 'aqi' ? [50, 100, 200, 300, 400] : [];

  if (forecastChart) forecastChart.destroy();

  forecastChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: cfg.label,
        data,
        borderColor: cfg.color,
        backgroundColor: cfg.color + '18',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: cfg.color,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 700, easing: 'easeInOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(5,10,20,0.92)',
          borderColor: cfg.color + '44',
          borderWidth: 1,
          titleColor: '#E8F0FF',
          bodyColor: '#7A90B8',
          padding: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw.toFixed(1)}${cfg.unit}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(79,142,247,0.06)' },
          ticks: { color: '#7A90B8', font: { size: 10 }, maxTicksLimit: 12 }
        },
        y: {
          grid: { color: 'rgba(79,142,247,0.06)' },
          ticks: { color: '#7A90B8', font: { size: 10 } },
          min: 0
        }
      }
    }
  });
}

// ===================== FORECAST TABLE =====================
function renderForecastTable(hourly) {
  const tbody = document.getElementById('forecastTableBody');
  tbody.innerHTML = hourly.map(h => {
    const color = h.color || aqiToColor(h.cpcb_aqi);
    return `<tr>
      <td>${h.label}</td>
      <td><span class="aqi-pill" style="background:${color}22;color:${color};">${h.cpcb_aqi}</span></td>
      <td style="color:${color};font-family:'Outfit',sans-serif;font-size:11px;">${h.category}</td>
      <td>${h.pm2_5.toFixed(1)}</td>
      <td>${h.pm10.toFixed(1)}</td>
      <td>${h.no2.toFixed(1)}</td>
      <td>${h.so2.toFixed(1)}</td>
      <td>${h.o3.toFixed(1)}</td>
    </tr>`;
  }).join('');
}

// ===================== HEALTH PANEL =====================
function renderHealthPanel(advisory) {
  const panel = document.getElementById('healthPanel');
  const color = advisory.color;
  const actionItemsHtml = (advisory.action_items || []).map(a =>
    `<div class="action-item"><i class="fa-solid fa-circle-exclamation"></i>${a}</div>`
  ).join('');

  const personasHtml = (advisory.personas || []).map(p => {
    const statusClass = p.status === 'Safe' ? 'status-safe' : (p.status.includes('Prohibited') || p.status.includes('Indoors') ? 'status-danger' : 'status-caution');
    return `
      <div class="persona-card">
        <div class="persona-header">
          <div class="persona-icon"><i class="fa-solid ${p.icon}"></i></div>
          <div class="persona-role">${p.role}</div>
        </div>
        <span class="persona-status ${statusClass}">${p.status}</span>
        <p class="persona-advice">${p.advice}</p>
      </div>`;
  }).join('');

  // Show mask pill in header
  const maskPill = document.getElementById('maskPill');
  maskPill.style.display = 'inline-flex';
  document.getElementById('maskText').textContent = advisory.mask_recommendation;

  panel.innerHTML = `
    <div class="grap-badge" style="background:${color}18;color:${color};border:1px solid ${color}44;">
      <i class="fa-solid fa-shield-halved"></i>${advisory.grap_stage}
    </div>
    <p class="health-advice-text">${advisory.general_advice}</p>
    <div class="persona-grid">${personasHtml}</div>
    <div style="margin-top:14px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);font-weight:600;margin-bottom:8px;">
        <i class="fa-solid fa-list-check" style="color:var(--accent);margin-right:6px;"></i>Recommended Actions
      </div>
      <div class="action-list">${actionItemsHtml}</div>
    </div>`;
}

// ===================== SOURCE BADGE =====================
function renderSourceBadge(source) {
  const icons = {
    'OpenWeatherMap': 'fa-cloud-sun',
    'Open-Meteo': 'fa-satellite',
    'Indian Geo-Spatial': 'fa-database',
  };
  const icon = Object.keys(icons).find(k => source.includes(k)) || 'fa-database';
  document.getElementById('aqiSourceBadge').innerHTML =
    `<i class="fa-solid ${icons[icon] || 'fa-database'}" style="margin-right:4px;"></i>${source.split(' (')[0]}`;
}

// ===================== STATUS BAR =====================
function setStatus(type, message) {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const time = document.getElementById('statusTime');

  dot.className = 'status-dot';
  if (type === 'loading') dot.classList.add('active');
  else if (type === 'success') { dot.style.background = '#10B981'; dot.style.boxShadow = '0 0 6px #10B981'; }
  else if (type === 'error') { dot.style.background = '#EF4444'; dot.style.boxShadow = '0 0 6px #EF4444'; }

  text.textContent = message;
  time.textContent = new Date().toLocaleTimeString('en-IN');
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  // Trigger initial forecast on load
  setTimeout(() => runForecast(), 600);
});
