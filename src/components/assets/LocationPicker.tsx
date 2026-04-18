// src/components/assets/LocationPicker.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

// Map click handler component
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ latitude, longitude, onLocationSelect }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : [20.5937, 78.9629] // Default to India center
  );
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Reverse geocoding: convert lat/lng to address using OpenStreetMap
  const reverseGeocode = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data.display_name) {
        const shortAddress = [data.address?.city, data.address?.state, data.address?.country]
          .filter(Boolean)
          .join(', ');
        setAddress(shortAddress || data.display_name);
        onLocationSelect(lat, lng, shortAddress || data.display_name);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPosition([latitude, longitude]);
        reverseGeocode(latitude, longitude);
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please check permissions.');
        setGettingLocation(false);
      }
    );
  };

  useEffect(() => {
    if (latitude && longitude) {
      reverseGeocode(latitude, longitude);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {gettingLocation ? 'Getting location...' : '📍 Use Current Location'}
        </button>
        <p className="text-sm text-gray-500 flex items-center">
          Or click anywhere on the map to select location
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ height: '400px', zIndex: 0 }}>
        <MapContainer
          center={position || [20.5937, 78.9629]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {position && (
            <Marker position={position}>
              <Popup>
                {address || `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {loading && (
        <div className="text-center text-gray-500">Getting address...</div>
      )}

      {address && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">📍 Location:</span> {address}
          </p>
          {position && (
            <p className="text-xs text-gray-400 mt-1">
              Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}