// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    GEOCODING_API_KEY: 'pk.a05a2a206bdbbeee36d4e7d50caa01e2',
    WEATHER_API_KEY: '4f43c790958b3fb1edbbae26fae4ee78'
};

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================
let map;
let markerLayer;
let markers = [];

// ============================================================================
// INITIALIZE MAP (OpenLayers 7.3.0)
// ============================================================================
function initMap() {
    console.log('Initializing map...');
    
    try {
        // ایجاد لایه مارکر
        const markerSource = new ol.source.Vector();
        markerLayer = new ol.layer.Vector({
            source: markerSource,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({ color: 'red' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                })
            })
        });
        
        // ایجاد لایه‌های پایه
        const osmLayer = new ol.layer.Tile({
            source: new ol.source.OSM(),
            visible: true
        });
        
        const cartoLayer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
            }),
            visible: false
        });
        
        // ایجاد ویو
        const view = new ol.View({
            center: ol.proj.fromLonLat([51.505, -0.09]), // لندن
            zoom: 10
        });
        
        // ایجاد نقشه
        map = new ol.Map({
            target: 'map',
            layers: [osmLayer, cartoLayer, markerLayer],
            view: view,
            controls: ol.control.defaults({
                attributionOptions: {
                    collapsible: true
                }
            }).extend([
                new ol.control.ScaleLine(),
                new ol.control.ZoomSlider(),
                new ol.control.FullScreen()
            ])
        });
        
        // کلیک روی نقشه
        map.on('click', handleMapClick);
        
        // آپدیت زوم
        map.getView().on('change:resolution', function() {
            const zoom = Math.round(this.getZoom());
            document.getElementById('zoom-level').textContent = zoom;
        });
        
        // نمایش مختصات ماوس
        map.on('pointermove', function(evt) {
            if (evt.dragging) return;
            const coord = ol.proj.toLonLat(evt.coordinate);
            document.getElementById('coordinates').textContent = 
                coord[1].toFixed(4) + ', ' + coord[0].toFixed(4);
        });
        
        console.log('Map initialized successfully!');
        updateStatus('Map ready', 'success');
        
    } catch (error) {
        console.error('Map init error:', error);
        alert('Error initializing map. Check console for details.');
    }
}

// ============================================================================
// GEOCODING
// ============================================================================
async function geocodeLocation(searchTerm) {
    try {
        updateStatus('Searching...', 'info');
        
        const url = `https://us1.locationiq.com/v1/search.php?key=${CONFIG.GEOCODING_API_KEY}&q=${encodeURIComponent(searchTerm)}&format=json&limit=1`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Geocoding failed');
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            throw new Error('Location not found');
        }
        
        const location = data[0];
        const lon = parseFloat(location.lon);
        const lat = parseFloat(location.lat);
        
        // اضافه کردن مارکر
        addMarker([lon, lat], searchTerm);
        
        // گرفتن آب‌وهوا
        await fetchWeatherData(lat, lon);
        
        updateStatus('Location found', 'success');
        
        return [lon, lat];
        
    } catch (error) {
        console.error('Geocoding error:', error);
        alert('Error: ' + error.message);
        updateStatus('Search failed', 'error');
        return null;
    }
}

// ============================================================================
// WEATHER
// ============================================================================
async function fetchWeatherData(lat, lon) {
    try {
        updateStatus('Getting weather...', 'info');
        
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Weather data failed');
        }
        
        const data = await response.json();
        
        // نمایش اطلاعات
        displayWeather(data);
        
        // آپدیت مختصات
        document.getElementById('current-lat').textContent = lat.toFixed(4);
        document.getElementById('current-lon').textContent = lon.toFixed(4);
        document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
        
        updateStatus('Weather loaded', 'success');
        
    } catch (error) {
        console.error('Weather error:', error);
        displayError('Failed to get weather data');
        updateStatus('Weather failed', 'error');
    }
}

function displayWeather(data) {
    const html = `
        <div class="weather-card">
            <div class="weather-icon-large">
                ${getWeatherIcon(data.weather[0].main)}
            </div>
            <div class="temperature-display">
                ${Math.round(data.main.temp)}°C
            </div>
            <div class="text-center mb-3">
                ${data.weather[0].description}
                <div class="small">${data.name}</div>
            </div>
            
            <div class="weather-details">
                <div class="detail-item">
                    <div class="detail-label">Feels Like</div>
                    <div class="detail-value">${Math.round(data.main.feels_like)}°C</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Humidity</div>
                    <div class="detail-value">${data.main.humidity}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Pressure</div>
                    <div class="detail-value">${data.main.pressure} hPa</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Wind</div>
                    <div class="detail-value">${data.wind.speed} m/s</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('weather-info').innerHTML = html;
}

function displayError(message) {
    document.getElementById('weather-info').innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
        </div>
    `;
}

function getWeatherIcon(condition) {
    const cond = condition.toLowerCase();
    if (cond.includes('clear')) return '☀️';
    if (cond.includes('cloud')) return '☁️';
    if (cond.includes('rain')) return '🌧️';
    if (cond.includes('snow')) return '❄️';
    return '🌈';
}

// ============================================================================
// MARKERS
// ============================================================================
function addMarker(coords, title) {
    // حذف مارکرهای قدیمی
    markerLayer.getSource().clear();
    
    // ایجاد مارکر جدید
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coords))
    });
    
    marker.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({ color: 'red' }),
            stroke: new ol.style.Stroke({ color: 'white', width: 2 })
        })
    }));
    
    markerLayer.getSource().addFeature(marker);
    
    // مرکز کردن نقشه
    map.getView().animate({
        center: ol.proj.fromLonLat(coords),
        zoom: 12,
        duration: 1000
    });
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================
async function handleMapClick(event) {
    const coords = ol.proj.toLonLat(event.coordinate);
    const [lon, lat] = coords;
    
    // آپدیت مختصات
    document.getElementById('coordinates').textContent = 
        lat.toFixed(4) + ', ' + lon.toFixed(4);
    
    // اضافه کردن مارکر
    addMarker([lon, lat], 'Clicked point');
    
    // گرفتن آب‌وهوا
    await fetchWeatherData(lat, lon);
}

function handleSearch() {
    const input = document.getElementById('search-input');
    const term = input.value.trim();
    
    if (!term) {
        alert('Please enter a location');
        return;
    }
    
    geocodeLocation(term);
    input.value = '';
}

function handleGeolocation() {
    if (!navigator.geolocation) {
        alert('Geolocation not supported');
        return;
    }
    
    updateStatus('Getting your location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            
            addMarker([lon, lat], 'My Location');
            fetchWeatherData(lat, lon);
            updateStatus('Location found', 'success');
        },
        (error) => {
            alert('Error: ' + error.message);
            updateStatus('Location failed', 'error');
        }
    );
}

// ============================================================================
// UTILITIES
// ============================================================================
function updateStatus(message, type) {
    const el = document.getElementById('api-status');
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    el.innerHTML = `<i class="fas fa-${icon} me-2"></i> ${message}`;
    el.className = type === 'success' ? 'text-success' : 
                   type === 'error' ? 'text-danger' : 'text-info';
}

// ============================================================================
// INITIALIZATION
// ============================================================================
function initApp() {
    console.log('Starting app...');
    
    try {
        // تنظیم event listeners
        document.getElementById('search-btn').addEventListener('click', handleSearch);
        document.getElementById('search-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleSearch();
        });
        document.getElementById('geolocation-btn').addEventListener('click', handleGeolocation);
        document.getElementById('reset-view').addEventListener('click', function() {
            map.getView().setCenter(ol.proj.fromLonLat([51.505, -0.09]));
            map.getView().setZoom(10);
            markerLayer.getSource().clear();
            updateStatus('View reset', 'info');
        });
        document.getElementById('clear-markers').addEventListener('click', function() {
            markerLayer.getSource().clear();
            updateStatus('Markers cleared', 'info');
        });
        document.getElementById('base-layer').addEventListener('change', function(e) {
            const layers = map.getLayers().getArray();
            layers[0].setVisible(e.target.value === 'osm');
            layers[1].setVisible(e.target.value === 'carto');
        });
        
        // راه‌اندازی نقشه
        initMap();
        
        console.log('App initialized!');
        
    } catch (error) {
        console.error('App init error:', error);
        alert('Failed to initialize app');
    }
}

// شروع برنامه
document.addEventListener('DOMContentLoaded', initApp);