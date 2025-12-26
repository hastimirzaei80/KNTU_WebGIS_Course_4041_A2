# 🌍 WebGIS Assignment 2 - Interactive Map Application

## 📋 Project Overview
Interactive web mapping application with geocoding search and weather data integration using OpenLayers library. Built for WebGIS Course Assignment 2.

## ✨ Features
### 🗺️ Map Features
- Interactive OpenLayers map
- Multiple base layers (OSM, CartoDB)
- Real-time coordinate display
- Marker system with animations

### 🔍 Search & Geocoding
- Address search using LocationIQ API
- Real-time geocoding conversion
- Automatic map centering

### 🌤️ Weather Integration
- Real-time weather via OpenWeatherMap
- Click-to-get-weather functionality
- Complete weather metrics display

### 📱 User Interface
- Responsive Bootstrap 5 design
- Mobile-friendly layout
- Clean, modern interface

## 🛠️ Technologies Used
### Frontend Stack
| Technology | Purpose | Version |
|------------|---------|---------|
| OpenLayers | Mapping | v6.15.1 |
| Bootstrap | UI Framework | v5.3.0 |
| JavaScript | Logic | ES6+ |
| Fetch API | HTTP Requests | - |

### APIs Integrated
| API | Purpose | Key |
|-----|---------|-----|
| LocationIQ | Geocoding | `pk.a05a2a206bdbbeee36d4e7d50caa01e2` |
| OpenWeatherMap | Weather | `4f43c790958b3fb1edbbae26fae4ee78` |

## 🚀 Quick Start
### Installation
1. Download `index.html`
2. Open in any modern browser
3. No additional setup needed

### Run Locally
```bash
# Python server
python -m http.server 8000


webgis-assignment-2/
├── index.html              # Main application
├── README.md               # Documentation
├── screenshots/            # Screenshots
│   ├── main-interface.png
│   ├── weather-display.png
│   └── mobile-view.png
└── documentation/          # Additional docs


const map = new ol.Map({
    target: 'map',
    layers: [osmLayer, markerLayer],
    view: new ol.View({
        center: ol.proj.fromLonLat([-0.09, 51.505]),
        zoom: 10
    })
});



async function geocodeLocation(searchTerm) {
    const url = `https://us1.locationiq.com/v1/search.php?key=${API_KEY}&q=${searchTerm}`;
    const response = await fetch(url);
    const data = await response.json();
    return { lat: data[0].lat, lon: data[0].lon };
}


# Node.js server
npx serve .
