'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FishingZone } from '@/lib/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Globe, Mountain } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useLocation } from '@/lib/LocationContext';
import { formatZoneNavigationText } from '@/lib/geoUtils';

interface FishingMapProps {
  zone: FishingZone;
}

type MapLayerType = 'street' | 'satellite' | 'terrain';

const getTileLayers = (lang: string): Record<MapLayerType, { url: string; attribution: string; maxZoom: number }> => ({
  street: {
    url: `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=${lang}`,
    attribution: '&copy; Google Maps / OpenStreetMap',
    maxZoom: 20,
  },
  satellite: {
    url: `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=${lang}`,
    attribution: '&copy; Google Satellite Imagery',
    maxZoom: 20,
  },
  terrain: {
    url: `https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&hl=${lang}`,
    attribution: '&copy; Google Terrain',
    maxZoom: 20,
  },
});

export default function FishingMap({ zone }: FishingMapProps) {
  const { lang, t, formatNum } = useLanguage();
  const { location } = useLocation();
  const userCoords = location.userRealCoords;

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const currentTileLayersRef = useRef<L.TileLayer[]>([]);
  const polygonRef = useRef<L.Polygon | null>(null);
  const navLineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('street');

  const applyTileLayer = (type: MapLayerType, mapLang: string) => {
    if (!leafletMapRef.current) return;
    const tileConfig = getTileLayers(mapLang)[type];
    currentTileLayersRef.current.forEach((layer) => {
      leafletMapRef.current?.removeLayer(layer);
    });
    currentTileLayersRef.current = [];

    const baseTile = L.tileLayer(tileConfig.url, {
      maxZoom: tileConfig.maxZoom,
      attribution: tileConfig.attribution,
    }).addTo(leafletMapRef.current);
    baseTile.bringToBack();
    currentTileLayersRef.current = [baseTile];
  };

  // Sync map tiles whenever active layer or language changes
  useEffect(() => {
    applyTileLayer(activeLayer, lang);
  }, [activeLayer, lang]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [zone.lat, zone.lng],
        zoom: 10,
        zoomControl: true,
        attributionControl: false,
      });

      const initialTiles = getTileLayers(lang).street;
      const tile = L.tileLayer(initialTiles.url, {
        maxZoom: initialTiles.maxZoom,
        attribution: initialTiles.attribution,
      }).addTo(map);

      currentTileLayersRef.current = [tile];
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    map.setView([zone.lat, zone.lng], 10);

    // Invalidate size shortly after render to guarantee Leaflet tiles fill container on mobile
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    // Clear old polygon, lines, and markers
    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
    }
    if (navLineRef.current) {
      map.removeLayer(navLineRef.current);
      navLineRef.current = null;
    }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Custom Icon for Shore Reference Point
    const shoreIcon = L.divIcon({
      className: 'custom-shore-pin',
      html: `
        <div style="background-color: #0284c7; border: 2px solid white; border-radius: 9999px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.4);">
          <div style="width: 8px; height: 8px; background-color: white; border-radius: 9999px;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    // Custom Icon for Offshore Fishing Coordinates
    const fishIcon = L.divIcon({
      className: 'custom-fish-pin',
      html: `
        <div style="background-color: #06b6d4; border: 2px solid white; border-radius: 9999px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(6,182,212,0.6);">
          <div style="width: 6px; height: 6px; background-color: #083344; border-radius: 9999px;"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Custom Google-style Pulsing Blue Dot Icon for User Position
    const userLocationIcon = L.divIcon({
      className: 'custom-user-dot',
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background-color: rgba(2, 132, 199, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 9999px; background-color: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(2, 132, 199, 0.8);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Draw Potential Fishing Zone Triangular Polygon
    const triangleCoords: [number, number][] = [
      zone.shorePoint,
      zone.zoneP1,
      zone.zoneP2,
    ];

    const polygon = L.polygon(triangleCoords, {
      color: '#0891b2',
      weight: 3,
      opacity: 0.95,
      fillColor: '#06b6d4',
      fillOpacity: 0.35,
      dashArray: '6, 6',
    }).addTo(map);

    polygonRef.current = polygon;

    // Localized distance strings
    const baseKey = zone.id;
    const d1 = t(`fz_${baseKey}_d1`) !== `fz_${baseKey}_d1` ? t(`fz_${baseKey}_d1`) : zone.distances.p1;
    const d2 = t(`fz_${baseKey}_d2`) !== `fz_${baseKey}_d2` ? t(`fz_${baseKey}_d2`) : zone.distances.p2;
    const d3 = t(`fz_${baseKey}_d3`) !== `fz_${baseKey}_d3` ? t(`fz_${baseKey}_d3`) : zone.distances.p3;

    // Add Markers with Distance Tooltips
    const m1 = L.marker(zone.shorePoint, { icon: shoreIcon })
      .bindTooltip(`<b>${t('map_anchor_coastal')}</b><br/>${formatNum(d1)}`, {
        permanent: true,
        direction: 'top',
        className: 'custom-leaflet-tooltip',
      })
      .addTo(map);

    const m2 = L.marker(zone.zoneP1, { icon: fishIcon })
      .bindTooltip(`<b>${t('map_pelagic_edge')}</b><br/>${formatNum(d2)}`, {
        permanent: true,
        direction: 'bottom',
        className: 'custom-leaflet-tooltip',
      })
      .addTo(map);

    const m3 = L.marker(zone.zoneP2, { icon: fishIcon })
      .bindTooltip(`<b>${t('map_upwelling_vector')}</b><br/>${formatNum(d3)}`, {
        permanent: true,
        direction: 'right',
        className: 'custom-leaflet-tooltip',
      })
      .addTo(map);

    const allMarkers = [m1, m2, m3];

    // If user's live coordinates are available, draw blinking dot and navigation line
    if (userCoords && userCoords.lat && userCoords.lng) {
      const nav = formatZoneNavigationText(
        userCoords.lat,
        userCoords.lng,
        zone.shorePoint[0],
        zone.shorePoint[1],
        lang,
        formatNum
      );

      const uMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userLocationIcon })
        .bindTooltip(`<b>${t('your_location')}</b><br/>${nav.displayText}`, {
          direction: 'top',
          className: 'custom-leaflet-tooltip font-semibold',
        })
        .addTo(map);

      allMarkers.push(uMarker);

      // Draw dashed navigation line from user location to zone anchor point
      const navLine = L.polyline([[userCoords.lat, userCoords.lng], zone.shorePoint], {
        color: '#0284c7',
        weight: 2.5,
        dashArray: '6, 6',
        opacity: 0.9,
      })
        .bindTooltip(`<b>${t('navigation_vector')}</b><br/>${nav.displayText}`, {
          sticky: true,
          className: 'custom-leaflet-tooltip',
        })
        .addTo(map);

      navLineRef.current = navLine;

      // Fit bounds to enclose both user location and the zone
      const bounds = L.latLngBounds([
        ...triangleCoords,
        [userCoords.lat, userCoords.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.fitBounds(polygon.getBounds(), { padding: [40, 40] });
    }

    markersRef.current = allMarkers;

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [zone, t, formatNum, userCoords, lang]);

  // Handle Layer Switching without touching polygons/markers
  const handleSwitchLayer = (type: MapLayerType) => {
    setActiveLayer(type);
    applyTileLayer(type, lang);
  };

  return (
    <div className="relative w-full h-[290px] sm:h-80 md:h-[400px] min-h-[290px] rounded-2xl overflow-hidden border border-cyan-300/60 shadow-lg bg-sky-50">
      <div ref={mapRef} className="w-full h-full z-10" />
      
      {/* Top-Right: Map Style Switcher */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center p-0.5 sm:p-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md gap-0.5 sm:gap-1">
        <button
          onClick={() => handleSwitchLayer('street')}
          className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition ${
            activeLayer === 'street'
              ? 'bg-cyan-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="OpenStreetMap Standard"
        >
          <MapIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden xs:inline sm:inline">{t('map_layer_street')}</span>
        </button>

        <button
          onClick={() => handleSwitchLayer('satellite')}
          className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition ${
            activeLayer === 'satellite'
              ? 'bg-cyan-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Esri World Imagery"
        >
          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden xs:inline sm:inline">{t('map_layer_satellite')}</span>
        </button>

        <button
          onClick={() => handleSwitchLayer('terrain')}
          className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition ${
            activeLayer === 'terrain'
              ? 'bg-cyan-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="OpenTopoMap Terrain"
        >
          <Mountain className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden xs:inline sm:inline">{t('map_layer_terrain')}</span>
        </button>
      </div>

      {/* Bottom-Left: Legend Tag */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-300 text-[11px] font-semibold text-cyan-800 shadow-md flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
        <span>{t('map_legend_fishing')}</span>
      </div>
    </div>
  );
}
