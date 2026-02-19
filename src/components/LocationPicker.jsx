import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Toast from './Toast';

// Fix for default marker icon issue in React-Leaflet
if (L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Component to handle map clicks and center updates
function LocationMarker({ position, setPosition, center }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      // Convert LatLng object to array [lat, lng]
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  // Pan to center when it changes
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ latitude, longitude, onLocationChange }) {
  // Default to Kathmandu, Nepal
  const defaultCenter = [27.7172, 85.3240];
  const [position, setPosition] = useState(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [center, setCenter] = useState(null);
  const [searching, setSearching] = useState(false);
  const [toast, setToast] = useState(null);

  // Update parent component when position changes
  useEffect(() => {
    if (position && onLocationChange) {
      onLocationChange(position[0], position[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setSearching(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const lat = location.coords.latitude;
          const lng = location.coords.longitude;
          const newPosition = [lat, lng];
          setPosition(newPosition);
          setCenter(newPosition);
          setSearching(false);
          setToast({ type: 'success', message: 'Location detected successfully!', key: Date.now() });
        },
        (error) => {
          console.error('Error getting location:', error);
          setSearching(false);
          let errorMessage = 'Unable to get your location. Please click on the map to set your location.';
          if (error.code === 1) {
            errorMessage = 'Location permission denied. Please click on the map to set your location.';
          } else if (error.code === 2) {
            errorMessage = 'Location unavailable. Please click on the map to set your location.';
          } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please click on the map to set your location.';
          }
          setToast({ type: 'error', message: errorMessage, key: Date.now() });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setSearching(false);
      setToast({ type: 'error', message: 'Geolocation is not supported by your browser. Please click on the map to set your location.', key: Date.now() });
    }
  }, []);

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm">
        <MapContainer
          center={latitude && longitude ? [latitude, longitude] : defaultCenter}
          zoom={13}
          style={{ height: '300px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} center={center} />
        </MapContainer>

        {/* Use Current Location Button - Overlay */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={searching}
          className="absolute top-3 right-3 z-[1000] bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-md border border-gray-300 flex items-center gap-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searching ? (
            <>
              <svg className="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Finding...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>Use My Location</span>
            </>
          )}
        </button>
      </div>

      {/* Instructions and Coordinates */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-gray-700 font-medium">
              {position ? 'Location selected!' : 'Click on the map to select your location'}
            </p>
            {position && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </p>
            )}
            {!position && (
              <p className="text-xs text-gray-500 mt-1">
                Or click "Use My Location" to auto-detect
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Toast for notifications */}
      {toast && <Toast type={toast.type} message={toast.message} key={toast.key} />}
    </div>
  );
}
