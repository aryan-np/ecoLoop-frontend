import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import recycleAPI from '../api/recycle';
import donationAPI from '../api/donation';
import { getErrorMessage } from '../utils/errorHandler';

if (L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

const parseCoordinate = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return n;
};

const haversineMeters = (from, to) => {
  if (!from || !to) return null;
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRadians(to[0] - from[0]);
  const dLng = toRadians(to[1] - from[1]);
  const lat1 = toRadians(from[0]);
  const lat2 = toRadians(to[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

const formatETA = (seconds) => {
  if (seconds === null || seconds === undefined) return '—';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
};

const formatSpeed = (speedMs) => {
  if (speedMs === null || speedMs === undefined || Number.isNaN(speedMs)) return '—';
  const kmh = speedMs * 3.6;
  return `${kmh.toFixed(1)} km/h`;
};

const formatHeading = (heading) => {
  if (heading === null || heading === undefined || Number.isNaN(heading)) return '—';
  const value = Math.round(heading);
  return `${value}°`;
};

const formatManeuver = (type, modifier) => {
  const normalizedType = (type || 'continue').replace(/_/g, ' ');
  const normalizedModifier = (modifier || '').replace(/_/g, ' ');

  if (normalizedType === 'arrive') {
    return 'Arrive at destination';
  }

  if (normalizedType === 'depart') {
    return normalizedModifier ? `Head ${normalizedModifier}` : 'Head forward';
  }

  if (normalizedType === 'roundabout') {
    return 'Enter the roundabout';
  }

  if (normalizedType === 'new name') {
    return 'Continue on the same road';
  }

  if (normalizedModifier) {
    return `${normalizedType} ${normalizedModifier}`;
  }

  return normalizedType;
};

const buildStepInstruction = (step, index) => {
  const maneuverText = formatManeuver(step?.maneuver?.type, step?.maneuver?.modifier);
  const roadName = step?.name ? ` onto ${step.name}` : '';

  if (step?.maneuver?.type === 'arrive') {
    return maneuverText;
  }

  return `Step ${index + 1}: In ${formatDistance(step?.distance || 0)}, ${maneuverText}${roadName}`;
};

const distanceToRouteMeters = (position, routeCoordinates) => {
  if (!position || !routeCoordinates?.length) return null;

  let nearest = null;
  for (const coordinate of routeCoordinates) {
    const distance = haversineMeters(position, coordinate);
    if (distance === null) continue;
    if (nearest === null || distance < nearest) {
      nearest = distance;
    }
  }

  return nearest;
};

const createMarkerIcon = ({ background, border, text }) =>
  L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:9999px;background:${background};border:2px solid ${border};color:#ffffff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);">${text}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

const startMarkerIcon = createMarkerIcon({
  background: '#2563eb',
  border: '#1d4ed8',
  text: 'S',
});

const destinationMarkerIcon = createMarkerIcon({
  background: '#dc2626',
  border: '#b91c1c',
  text: 'D',
});

function MapController({ points, currentPosition, followUser, onUserDrag, recenterTick }) {
  const map = useMap();
  const hasInitializedViewRef = useRef(false);

  useMapEvents({
    dragstart: () => {
      if (onUserDrag) {
        onUserDrag();
      }
    },
  });

  useEffect(() => {
    if (!points || points.length === 0) return;
    const valid = points.filter((p) => Array.isArray(p) && p.length === 2);
    if (valid.length === 0) return;

    if (hasInitializedViewRef.current) return;

    if (currentPosition) {
      map.setView(currentPosition, 17, { animate: false });
      hasInitializedViewRef.current = true;
      return;
    }

    const bounds = L.latLngBounds(valid);
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
    hasInitializedViewRef.current = true;
  }, [map, points, currentPosition]);

  useEffect(() => {
    if (!followUser || !currentPosition) return;
    const zoom = Math.max(map.getZoom(), 17);
    map.flyTo(currentPosition, zoom, { animate: true, duration: 0.8 });
  }, [map, currentPosition, followUser]);

  useEffect(() => {
    if (!recenterTick || !currentPosition) return;
    map.flyTo(currentPosition, 17, { animate: true, duration: 0.9 });
  }, [map, currentPosition, recenterTick]);

  return null;
}

async function fetchOSRMRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok || !json?.routes?.length) {
    throw new Error('Unable to calculate route');
  }

  const route = json.routes[0];
  const coordinates = route.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];
  const steps =
    route.legs?.flatMap((leg) =>
      (leg.steps || []).map((step, index) => ({
        distance: step.distance,
        duration: step.duration,
        location: step?.maneuver?.location ? [step.maneuver.location[1], step.maneuver.location[0]] : null,
        instruction: buildStepInstruction(step, index),
      }))
    ) || [];

  return {
    coordinates,
    distance: route.distance,
    duration: route.duration,
    steps,
  };
}

async function completeNGOWithProofFallback(requestId, file, notes) {
  const formData = new FormData();
  formData.append('photo_proof', file);
  if (notes) {
    formData.append('notes', notes);
  }
  return donationAPI.completeNGOAcceptedRequest(requestId, formData);
}

export default function NavigatePickup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isNGO = location.pathname.startsWith('/ngo/');
  const roleLabel = isNGO ? 'NGO' : 'Recycler';
  const backPath = isNGO ? '/ngo/accepted-donations' : '/recycler/pickup-schedule';
  const completeRedirect = isNGO ? '/ngo/completed-donations' : '/recycler/completed-pickups';
  const accentClasses = isNGO
    ? {
        button: 'bg-purple-600 hover:bg-purple-700',
        focus: 'focus:ring-purple-500',
        tag: 'bg-purple-100 text-purple-700 border-purple-200',
      }
    : {
        button: 'bg-teal-600 hover:bg-teal-700',
        focus: 'focus:ring-teal-500',
        tag: 'bg-teal-100 text-teal-700 border-teal-200',
      };

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [routeError, setRouteError] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [offRouteDistance, setOffRouteDistance] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [locationStats, setLocationStats] = useState({
    accuracy: null,
    speed: null,
    heading: null,
  });
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [followUser, setFollowUser] = useState(true);
  const [recenterTick, setRecenterTick] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofNotes, setProofNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const watchIdRef = useRef(null);
  const lastSpokenStepRef = useRef(-1);

  useEffect(() => {
    let mounted = true;

    const loadRequest = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = isNGO
          ? await donationAPI.getNGOAcceptedRequestDetail(id)
          : await recycleAPI.getAcceptedRequestDetail(id);

        if (!mounted) return;
        setRequest(data);
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err, 'Unable to load accepted pickup details'));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRequest();

    return () => {
      mounted = false;
    };
  }, [id, isNGO]);

  useEffect(() => {
    if (!navigationStarted) {
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const next = [position.coords.latitude, position.coords.longitude];

        setLocationStats({
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
        });

        setCurrentPosition((prev) => {
          if (!prev) return next;
          const moved = haversineMeters(prev, next);
          if (moved !== null && moved < 2) {
            return prev;
          }
          return next;
        });

        setLocationError(null);
      },
      (err) => {
        setLocationError(err.message || 'Unable to access current location');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [navigationStarted]);

  const pickupPosition = useMemo(() => {
    const lat = parseCoordinate(request?.latitude);
    const lng = parseCoordinate(request?.longitude);
    if (lat === null || lng === null) return null;
    return [lat, lng];
  }, [request]);

  useEffect(() => {
    let mounted = true;

    const updateRoute = async () => {
      if (!navigationStarted) return;
      if (!currentPosition || !pickupPosition) return;

      try {
        setRouteError(null);
        const route = await fetchOSRMRoute(currentPosition, pickupPosition);
        if (!mounted) return;
        setRouteCoordinates(route.coordinates);
        setRouteDistance(route.distance);
        setRouteDuration(route.duration);
        setRouteSteps(route.steps || []);
        setCurrentStepIndex((prev) => {
          const maxIndex = Math.max((route.steps || []).length - 1, 0);
          return Math.min(prev, maxIndex);
        });
      } catch (err) {
        if (!mounted) return;
        setRouteError('Route unavailable right now. Showing destination only.');
        setRouteCoordinates([]);
        setRouteDistance(haversineMeters(currentPosition, pickupPosition));
        setRouteDuration(null);
        setRouteSteps([]);
        setCurrentStepIndex(0);
      }
    };

    updateRoute();

    return () => {
      mounted = false;
    };
  }, [currentPosition, pickupPosition, navigationStarted]);

  const estimatedDistance = routeDistance ?? (currentPosition && pickupPosition ? haversineMeters(currentPosition, pickupPosition) : null);
  const etaText = formatETA(routeDuration);
  const currentStep = routeSteps[currentStepIndex] || null;
  const nextStep = routeSteps[currentStepIndex + 1] || null;
  const remainingSteps = routeSteps.length > 0 ? Math.max(routeSteps.length - currentStepIndex - 1, 0) : 0;
  const isOffRoute = offRouteDistance !== null && offRouteDistance > 60;

  const pickupDate = request?.recycler_offers?.[0]?.pickup_date || request?.ngo_offers?.[0]?.pickup_date;

  const startNavigation = () => {
    setShowStartModal(false);
    setNavigationStarted(true);
    setFollowUser(true);
  };

  const onUserDragMap = () => {
    setFollowUser(false);
  };

  const recenterMap = () => {
    setFollowUser(true);
    setRecenterTick((prev) => prev + 1);
  };

  useEffect(() => {
    if (!navigationStarted || !currentPosition || routeSteps.length === 0) {
      return;
    }

    let nearestIndex = 0;
    let nearestDistance = null;

    routeSteps.forEach((step, index) => {
      if (!step.location) return;
      const distance = haversineMeters(currentPosition, step.location);
      if (distance === null) return;
      if (nearestDistance === null || distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setCurrentStepIndex((prev) => (nearestIndex < prev ? prev : nearestIndex));
  }, [navigationStarted, currentPosition, routeSteps]);

  useEffect(() => {
    if (!navigationStarted || !currentPosition || routeCoordinates.length === 0) {
      setOffRouteDistance(null);
      return;
    }

    const nearest = distanceToRouteMeters(currentPosition, routeCoordinates);
    setOffRouteDistance(nearest);
  }, [navigationStarted, currentPosition, routeCoordinates]);

  useEffect(() => {
    if (!navigationStarted || !voiceEnabled || !currentStep?.instruction) {
      return;
    }

    if (currentStepIndex === lastSpokenStepRef.current) {
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentStep.instruction);
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    lastSpokenStepRef.current = currentStepIndex;
  }, [navigationStarted, voiceEnabled, currentStep, currentStepIndex]);

  useEffect(
    () => () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    },
    []
  );

  const submitCompletion = async () => {
    try {
      setSubmitting(true);
      setStatusMessage('');

      if (isNGO) {
        if (!proofFile) {
          setStatusMessage('Photo proof is required for NGO completion');
          setSubmitting(false);
          return;
        }
        await completeNGOWithProofFallback(id, proofFile, proofNotes);
      } else {
        await recycleAPI.completeAcceptedRequest(id, {});
      }

      navigate(completeRedirect);
    } catch (err) {
      setStatusMessage(getErrorMessage(err, 'Failed to complete pickup'));
    } finally {
      setSubmitting(false);
    }
  };

  const onConfirmComplete = async () => {
    setShowConfirmModal(false);

    if (isNGO) {
      setShowProofModal(true);
      return;
    }

    await submitCompletion();
  };

  if (!loading && (error || !request)) {
    return (
      <div className="bg-gray-50 p-6 min-h-full">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {error || 'Accepted request not found'}
        </div>
      </div>
    );
  }

  const mapPoints = [currentPosition, pickupPosition, ...(routeCoordinates || [])].filter(Boolean);

  return (
    <div className={`bg-gray-50 p-4 md:p-6 ${navigationStarted ? 'h-[calc(100vh-4.5rem)] overflow-hidden' : 'min-h-full'} space-y-4`}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Accepted Requests
        </button>
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${accentClasses.tag}`}>
          {roleLabel} Navigation
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h1 className="text-2xl font-bold text-gray-900">Navigate Pickup</h1>
        <p className="text-gray-600 mt-1">Live route from your current location to pickup destination</p>
      </div>

      {!navigationStarted ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Start Pickup</h2>
          <p className="text-sm text-gray-600 mt-2">
            Confirm that you have started pickup. Navigation and live GPS tracking will begin after confirmation.
          </p>
          <div className="mt-4 rounded-lg border border-gray-200 p-4 bg-gray-50">
            {loading ? (
              <p className="text-sm text-gray-600">Preparing pickup details...</p>
            ) : (
              <>
                <p className="text-sm text-gray-700 font-medium">Request #{request?.id || '—'}</p>
                <p className="text-sm text-gray-600 mt-1">{request?.user_details?.full_name || 'Unknown requester'}</p>
                <p className="text-sm text-gray-600">{request?.pickup_address || 'Address unavailable'}</p>
                <p className="text-xs text-gray-500 mt-1">Pickup Time: {pickupDate ? new Date(pickupDate).toLocaleString() : 'Not scheduled'}</p>
              </>
            )}
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setShowStartModal(true)}
              disabled={loading || !pickupPosition}
              className={`px-6 py-2.5 text-white rounded-lg font-semibold transition ${accentClasses.button} ${accentClasses.focus} focus:outline-none focus:ring-2 disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              Start Pickup
            </button>
          </div>
          {!loading && !pickupPosition && (
            <p className="text-sm text-red-600 mt-3">Pickup coordinates are missing. Navigation cannot be started for this request.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-stretch h-[calc(100vh-13.2rem)]">
          <div className="xl:col-span-4 bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-600">Live map updates as you move</p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  North Up
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${followUser ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {followUser ? 'Following You' : 'Manual View'}
                </span>
                <button
                  type="button"
                  onClick={recenterMap}
                  className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Recenter
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceEnabled((value) => !value)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${voiceEnabled ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  Voice {voiceEnabled ? 'On' : 'Off'}
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-41px)] w-full">
              {pickupPosition ? (
                <MapContainer
                  center={pickupPosition}
                  zoom={17}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {currentPosition && (
                    <Marker position={currentPosition} icon={startMarkerIcon}>
                      <Popup>Start: Your current location</Popup>
                    </Marker>
                  )}
                  <Marker position={pickupPosition} icon={destinationMarkerIcon}>
                    <Popup>Destination: Pickup location</Popup>
                  </Marker>

                  {routeCoordinates.length > 0 && (
                    <Polyline positions={routeCoordinates} pathOptions={{ color: isNGO ? '#7c3aed' : '#0d9488', weight: 5 }} />
                  )}

                  <MapController
                    points={mapPoints}
                    currentPosition={currentPosition}
                    followUser={followUser}
                    onUserDrag={onUserDragMap}
                    recenterTick={recenterTick}
                  />
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600">Pickup coordinates are not available for this request.</div>
              )}
            </div>
          </div>

          <div className="xl:col-span-1 bg-white rounded-xl border border-gray-200 p-3 flex flex-col h-full gap-2">
            <div className="space-y-2">
              <div>
              <h2 className="text-lg font-semibold text-gray-900">Pickup Info</h2>
              <p className="text-xs text-gray-500 mt-1">Request #{request?.id || '—'}</p>
              <p className="text-sm text-gray-900 font-semibold mt-2">{request?.user_details?.full_name || 'Unknown requester'}</p>
              <p className="text-sm text-gray-700 mt-1">{request?.pickup_address || 'Address unavailable'}</p>
              <p className="text-xs text-gray-500 mt-1">{request?.user_details?.email || '—'} • {request?.user_details?.phone_number || '—'}</p>
              <p className="text-xs text-gray-500 mt-1">Pickup: {pickupDate ? new Date(pickupDate).toLocaleString() : 'Not scheduled'}</p>
            </div>

            <div className={`rounded-lg border p-2.5 ${isOffRoute ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <p className="text-[11px] text-gray-600">Route Status</p>
              <p className={`text-sm font-semibold ${isOffRoute ? 'text-amber-700' : 'text-emerald-700'}`}>
                {isOffRoute ? 'Off route detected — rerouting' : 'On route'}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">Deviation: {offRouteDistance !== null ? formatDistance(offRouteDistance) : '—'}</p>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="border border-gray-200 rounded-lg p-2.5">
                <p className="text-[11px] text-gray-500">Distance</p>
                <p className="text-sm font-bold text-gray-900">{formatDistance(estimatedDistance)}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-2.5">
                <p className="text-[11px] text-gray-500">ETA</p>
                <p className="text-sm font-bold text-gray-900">{etaText}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-2.5">
                <p className="text-[11px] text-gray-500">Speed</p>
                <p className="text-sm font-bold text-gray-900">{formatSpeed(locationStats.speed)}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-2.5">
                <p className="text-[11px] text-gray-500">Heading</p>
                <p className="text-sm font-bold text-gray-900">{formatHeading(locationStats.heading)}</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-2.5">
              <p className="text-[11px] text-gray-500">Navigation Step</p>
              <p className="text-xs font-semibold text-gray-900 mt-0.5 line-clamp-2">{currentStep?.instruction || 'Waiting for route steps...'}</p>
              <p className="text-[11px] text-gray-600 mt-1 line-clamp-1">Next: {nextStep?.instruction || 'No upcoming step yet'}</p>
              <p className="text-[11px] text-gray-500 mt-1">Remaining: {remainingSteps}</p>
            </div>
            </div>

            <div className="mt-auto space-y-2">
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={submitting}
                className={`w-full px-4 py-2 text-sm text-white rounded-lg font-semibold transition ${accentClasses.button} ${accentClasses.focus} focus:outline-none focus:ring-2 disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {submitting ? 'Completing...' : 'Complete Pickup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {(locationError || routeError || statusMessage) && (
        <div className={navigationStarted ? 'fixed bottom-4 right-4 z-40 space-y-2 w-[320px] max-w-[calc(100vw-2rem)]' : 'space-y-2'}>
          {locationError && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">{locationError}</div>}
          {routeError && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">{routeError}</div>}
          {statusMessage && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{statusMessage}</div>}
        </div>
      )}

      {showStartModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900">Start Pickup Navigation</h3>
            <p className="text-gray-600 mt-2">Have you started pickup and want to begin live navigation now?</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowStartModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Not Yet
              </button>
              <button
                onClick={startNavigation}
                className={`px-4 py-2 text-white rounded-lg ${accentClasses.button}`}
              >
                Yes, Start
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900">Complete Pickup</h3>
            <p className="text-gray-600 mt-2">Are you sure this pickup has been completed successfully?</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmComplete}
                className={`px-4 py-2 text-white rounded-lg ${accentClasses.button}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showProofModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-gray-900">Upload Photo Proof</h3>
            <p className="text-gray-600 mt-2">Upload at least one photo proof before marking this NGO pickup as complete.</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo Proof *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  placeholder="Add any completion notes"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowProofModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitCompletion}
                disabled={submitting}
                className={`px-4 py-2 text-white rounded-lg ${accentClasses.button} disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {submitting ? 'Uploading...' : 'Upload & Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
