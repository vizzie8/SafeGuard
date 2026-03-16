/*  map.js — Leaflet Map & Safety Heatmap  */

const MapModule = (() => {
  let map = null;
  let zoneCircles = [];

  function init() {
    // Center on Pune, India
    map = L.map('map', {
      center: [18.5204, 73.8567],
      zoom: 14,
      zoomControl: false,
    });

    // OpenStreetMap standard tiles (most reliable, works on file:// too)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Force size recalculation immediately (fixes the black-map bug)
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 500);

    // Add zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Render safety zones
    renderZones();

    // Try geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 15);

        // Current location marker
        const userIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:16px;height:16px;
            background:radial-gradient(circle,#c026d3,#9333ea);
            border-radius:50%;
            border:2px solid white;
            box-shadow:0 0 12px #c026d3,0 0 0 6px rgba(192,38,211,0.2);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup('<div class="popup-name">📍 You are here</div>');
      }, () => {});
    }

    // Add emergency service markers
    renderEmergencyServices();
  }

  function renderZones() {
    zoneCircles.forEach(c => c.remove());
    zoneCircles = [];

    SAFETY_ZONES.forEach(zone => {
      const cfg = RISK_CONFIG[zone.risk];

      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        fillColor: cfg.color,
        fillOpacity: 0.45,
        color: cfg.color,
        weight: 3,
        opacity: 0.9,
      }).addTo(map);

      circle.bindPopup(`
        <div class="popup-name">${zone.name}</div>
        <div class="popup-area">📍 ${zone.area} Zone</div>
        <div class="popup-risk" style="color:${cfg.color}">
          ${'●'.repeat(zone.risk)}${'○'.repeat(5-zone.risk)} ${cfg.label}
        </div>
      `);

      // Pulse effect for danger zones
      if (zone.risk >= 4) {
        circle.on('mouseover', () => circle.setStyle({ fillOpacity: 0.5, weight: 3 }));
        circle.on('mouseout',  () => circle.setStyle({ fillOpacity: 0.28, weight: 2 }));
      }

      zoneCircles.push(circle);
    });
  }

  function renderEmergencyServices() {
    const icons = {
      police:   { emoji: '🚔', color: '#3b82f6' },
      hospital: { emoji: '🏥', color: '#10b981' },
      govt:     { emoji: '🏛️', color: '#f59e0b' },
    };

    EMERGENCY_SERVICES.forEach(svc => {
      const cfg = icons[svc.type] || { emoji: '📞', color: '#888' };

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          font-size:20px;
          width:32px;height:32px;
          display:flex;align-items:center;justify-content:center;
          background:rgba(0,0,0,0.7);
          border:1px solid ${cfg.color};
          border-radius:8px;
          backdrop-filter:blur(8px);
        ">${cfg.emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([svc.lat, svc.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div class="popup-name">${cfg.emoji} ${svc.name}</div>
          <div class="popup-area">📞 ${svc.phone}</div>
          <div class="popup-risk" style="color:${cfg.color};text-transform:uppercase;font-size:11px">${svc.type}</div>
        `);
    });
  }

  function invalidateSize() {
    if (map) {
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 300);
    }
  }

  return { init, invalidateSize };
})();
