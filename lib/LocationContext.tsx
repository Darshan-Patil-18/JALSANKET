'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { COASTAL_INDIA, CoastalCity, findNearestCoastalCity, getAllCoastalCities } from './coastalIndia';

export interface LocationNoteData {
  type: 'detected_far' | 'detected_near' | 'generic_far' | 'generic_near';
  detectedCity: string;
  nearestCity: string;
  nearestState: string;
  distanceKm: number;
}

export interface ActiveLocation {
  state: string;
  city: string;
  lat: number;
  lng: number;
  source: 'manual' | 'geolocation';
  userRealCoords?: { lat: number; lng: number };
  userRealLocationName?: string | null;
  isLocating: boolean;
  locationNote?: string | null;
  locationNoteData?: LocationNoteData | null;
  error?: string | null;
}

interface LocationContextType {
  location: ActiveLocation;
  selectLocation: (stateName: string, cityName: string) => void;
  useMyLocation: () => Promise<void>;
  clearNote: () => void;
}

const DEFAULT_LOCATION: ActiveLocation = {
  state: 'Gujarat',
  city: 'Porbandar',
  lat: 21.6417,
  lng: 69.6293,
  source: 'manual',
  isLocating: false,
  locationNote: null,
  userRealLocationName: null,
};

const LocationContext = createContext<LocationContextType>({
  location: DEFAULT_LOCATION,
  selectLocation: () => {},
  useMyLocation: async () => {},
  clearNote: () => {},
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<ActiveLocation>(DEFAULT_LOCATION);

  // Load saved location on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jalsanket_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.state && parsed.city && parsed.lat && parsed.lng) {
          setLocation((prev) => ({
            ...prev,
            state: parsed.state,
            city: parsed.city,
            lat: parsed.lat,
            lng: parsed.lng,
            source: 'manual',
          }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const selectLocation = useCallback((stateName: string, cityName: string) => {
    const stateObj = COASTAL_INDIA.find((s) => s.state.toLowerCase() === stateName.toLowerCase());
    if (!stateObj) return;

    const cityObj = stateObj.cities.find((c) => c.name.toLowerCase() === cityName.toLowerCase()) || stateObj.cities[0];
    if (!cityObj) return;

    const newLoc: ActiveLocation = {
      state: stateObj.state,
      city: cityObj.name,
      lat: cityObj.lat,
      lng: cityObj.lng,
      source: 'manual',
      isLocating: false,
      locationNote: null,
      error: null,
      // Maintain user's live coordinates if previously geolocated so distance vectors stay visible!
      userRealCoords: location.userRealCoords,
    };

    setLocation(newLoc);

    try {
      localStorage.setItem(
        'jalsanket_location',
        JSON.stringify({ state: newLoc.state, city: newLoc.city, lat: newLoc.lat, lng: newLoc.lng })
      );
    } catch {
      // ignore
    }
  }, [location.userRealCoords]);

  const useMyLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        isLocating: false,
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, isLocating: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        try {
          // Free, keyless reverse geocoding via BigDataCloud with OpenStreetMap fallback
          let detectedCity = '';
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLat}&longitude=${userLng}&localityLanguage=en`
            );
            if (res.ok) {
              const data = await res.json();
              detectedCity = data.city || data.locality || data.principalSubdivision || '';
            }
          } catch {
            // fallback to nominatim
          }

          if (!detectedCity) {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json`,
                { headers: { 'Accept-Language': 'en' } }
              );
              if (res.ok) {
                const data = await res.json();
                detectedCity = data.address?.city || data.address?.town || data.address?.municipality || data.address?.village || data.address?.state_district || '';
              }
            } catch {
              // ignore
            }
          }

          // Match nearest coastal city from our coastal India dataset
          const { city: nearest, distanceKm } = findNearestCoastalCity(userLat, userLng);

          let note: string | null = null;
          let noteData: LocationNoteData | null = null;

          if (detectedCity) {
            if (distanceKm > 40) {
              note = `Detected ${detectedCity}. Weather & AQI are showing data for ${detectedCity}. Coastal tabs (Fishing, Tides, Hazards) use nearest marine hub (${nearest.name}, ${distanceKm} km).`;
              noteData = {
                type: 'detected_far',
                detectedCity,
                nearestCity: nearest.name,
                nearestState: nearest.state,
                distanceKm,
              };
            } else {
              note = `Detected ${detectedCity} (${distanceKm} km from ${nearest.name} coast). All tabs updated.`;
              noteData = {
                type: 'detected_near',
                detectedCity,
                nearestCity: nearest.name,
                nearestState: nearest.state,
                distanceKm,
              };
            }
          } else {
            if (distanceKm > 80) {
              note = `Showing nearest coastal data for your location (${distanceKm} km away in ${nearest.name}, ${nearest.state}).`;
              noteData = {
                type: 'generic_far',
                detectedCity: '',
                nearestCity: nearest.name,
                nearestState: nearest.state,
                distanceKm,
              };
            } else {
              note = `Located near ${nearest.name} (${distanceKm} km offshore/inland).`;
              noteData = {
                type: 'generic_near',
                detectedCity: '',
                nearestCity: nearest.name,
                nearestState: nearest.state,
                distanceKm,
              };
            }
          }

          const newLoc: ActiveLocation = {
            state: nearest.state,
            city: nearest.name,
            lat: nearest.lat,
            lng: nearest.lng,
            source: 'geolocation',
            userRealCoords: { lat: userLat, lng: userLng },
            userRealLocationName: detectedCity || null,
            isLocating: false,
            locationNote: note,
            locationNoteData: noteData,
            error: null,
          };

          setLocation(newLoc);

          try {
            localStorage.setItem(
              'jalsanket_location',
              JSON.stringify({ state: newLoc.state, city: newLoc.city, lat: newLoc.lat, lng: newLoc.lng })
            );
          } catch {
            // ignore
          }
        } catch (err) {
          console.error('Error in reverse geocoding:', err);
          setLocation((prev) => ({
            ...prev,
            isLocating: false,
            userRealCoords: { lat: userLat, lng: userLng },
            source: 'geolocation',
          }));
        }
      },
      (err) => {
        let msg = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location access denied. Using manual selection.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        setLocation((prev) => ({
          ...prev,
          isLocating: false,
          error: msg,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const clearNote = useCallback(() => {
    setLocation((prev) => ({ ...prev, locationNote: null, error: null }));
  }, []);

  return (
    <LocationContext.Provider value={{ location, selectLocation, useMyLocation, clearNote }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
