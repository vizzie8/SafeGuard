import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';

const SAFETY_POINTS: [number, number, number][] = [
  // lat, lng, intensity
  [18.5204, 73.8567, 1.0], 
  [18.5214, 73.8557, 0.8],
  [18.5194, 73.8577, 0.9],
  [18.5144, 73.8477, 0.5],
  [18.5314, 73.8446, 0.2],
  [18.5089, 73.8650, 0.9],
  // Generating a cluster for high-risk visual impact
  [18.5200, 73.8560, 0.7],
  [18.5208, 73.8570, 0.6],
  [18.5210, 73.8565, 0.8]
];

const HeatLayer = () => {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore - leaflet.heat adds heatLayer to L
    const heat = L.heatLayer(SAFETY_POINTS, {
      radius: 35,
      blur: 25,
      maxZoom: 15,
      gradient: { 0.4: 'yellow', 0.6: 'orange', 1.0: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map]);

  return null;
};

const Heatmap = () => {
  const center: [number, number] = [18.5204, 73.8567];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        className="w-full h-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <HeatLayer />
      </MapContainer>
    </div>
  );
};

export default Heatmap;
