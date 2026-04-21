"use client";
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';

// Fix Leaflet's default icon path issues with Webpack/Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function Map({ problems = [], center = [34.1986, 72.0404], zoom = 13 }) {
  const router = useRouter();
  
  const Markers = useMemo(() => {
    return problems.map((problem) => (
      problem.coordinates && (
        <Marker key={problem.id} position={problem.coordinates}>
          <Popup>
            <div style={{ minWidth: '180px' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600 }}>{problem.title}</h4>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748B' }}>{problem.location}</p>
              <button 
                onClick={() => router.push(`/project/${problem.id}`)}
                style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', width: '100%' }}
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      )
    ));
  }, [problems, router]);

  return (
    <div style={{ height: '320px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative', zIndex: 10 }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        {Markers}
      </MapContainer>
    </div>
  );
}
