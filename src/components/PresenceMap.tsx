import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for Leaflet default icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface PresenceMapProps {
  onLocationUpdate?: (lat: number, lng: number) => void;
  officeLocations?: { name: string, coords: [number, number] }[];
  geofenceRadius?: number; // in meters
}

export default function PresenceMap({ 
  onLocationUpdate, 
  officeLocations = [], 
  geofenceRadius = 100 
}: PresenceMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser ini');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        onLocationUpdate?.(latitude, longitude);
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [onLocationUpdate]);

  if (error) return <div className="card" style={{ color: 'var(--danger)' }}>Error: {error}</div>;
  if (!position) return <div className="card" style={{ textAlign: 'center', padding: '60px' }}> <p style={{ fontWeight: 800 }}>Mencari Lokasi GPS...</p> </div>;

  return (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={false}
        style={{ height: 'var(--map-h)', width: '100%' }} // CRITICAL FIX: Height must be explicit
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>Lokasi Anda Sekarang</Popup>
        </Marker>
        
        {officeLocations.map((office, idx) => (
          <div key={idx}>
            <Marker position={office.coords}>
              <Popup>Kantor Cabang: {office.name}</Popup>
            </Marker>
            <Circle 
              center={office.coords} 
              radius={geofenceRadius} 
              pathOptions={{ color: 'var(--p)', fillColor: 'var(--p)', fillOpacity: 0.2 }} 
            />
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
