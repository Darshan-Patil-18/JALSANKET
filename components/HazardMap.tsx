'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HazardZone } from '@/lib/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Globe, Mountain, AlertOctagon } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useLocation } from '@/lib/LocationContext';
import { formatZoneNavigationText } from '@/lib/geoUtils';

interface HazardMapProps {
  zone: HazardZone;
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

export default function HazardMap({ zone }: HazardMapProps) {
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

    // Clear old layers
    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
    }
    if (navLineRef.current) {
      map.removeLayer(navLineRef.current);
      navLineRef.current = null;
    }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Custom Icon for Hazard Warning Node
    const hazardIcon = L.divIcon({
      className: 'custom-hazard-pin',
      html: `
        <div style="background-color: #ef4444; border: 2px solid white; border-radius: 9999px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(239,68,68,0.7);">
          <div style="width: 6px; height: 6px; background-color: white; border-radius: 9999px;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    const shoreIcon = L.divIcon({
      className: 'custom-shore-pin',
      html: `
        <div style="background-color: #f59e0b; border: 2px solid white; border-radius: 9999px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(245,158,11,0.6);">
          <div style="width: 8px; height: 8px; background-color: white; border-radius: 9999px;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
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

    // Shaded Hazard Polygon (Amber/Red striped style)
    const polygon = L.polygon(zone.polygon, {
      color: '#ef4444',
      weight: 3,
      opacity: 0.95,
      fillColor: '#dc2626',
      fillOpacity: 0.35,
      dashArray: '8, 8',
    }).addTo(map);

    polygonRef.current = polygon;

    // Localized distance strings
    const baseKey = zone.id.replace('-hazard', '');
    const d1 = t(`hz_${baseKey}_d1`) !== `hz_${baseKey}_d1` ? t(`hz_${baseKey}_d1`) : zone.distances.p1;
    const d2 = t(`hz_${baseKey}_d2`) !== `hz_${baseKey}_d2` ? t(`hz_${baseKey}_d2`) : zone.distances.p2;
    const d3 = t(`hz_${baseKey}_d3`) !== `hz_${baseKey}_d3` ? t(`hz_${baseKey}_d3`) : zone.distances.p3;

    // Add Markers with Distance Tooltips
    const m1 = L.marker(zone.shorePoint, { icon: shoreIcon })
      .bindTooltip(`<b>${t('map_anchor_coastal')}</b><br/>${formatNum(d1)}`, {
        permanent: true,
        direction: 'top',
        className: 'custom-leaflet-tooltip',
      })
      .addTo(map);

    const m2 = L.marker(zone.polygon[1], { icon: hazardIcon })
      .bindTooltip(`<b>${t('map_hazard_p1')}</b><br/>${formatNum(d2)}`, {
        permanent: true,
        direction: 'bottom',
        className: 'custom-leaflet-tooltip',
      })
      .addTo(map);

    const m3 = L.marker(zone.polygon[2], { icon: hazardIcon })
      .bindTooltip(`<b>${t('map_hazard_p2')}</b><br/>${formatNum(d3)}`, {
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

      // Draw dashed navigation line from user location to zone shore point
      const navLine = L.polyline([[userCoords.lat, userCoords.lng], zone.shorePoint], {
        color: '#dc2626',
        weight: 2.5,
        dashArray: '6, 6',
        opacity: 0.9,
      })
        .bindTooltip(`<b>${t('hazard_vector')}</b><br/>${nav.displayText}`, {
          sticky: true,
          className: 'custom-leaflet-tooltip',
        })
        .addTo(map);

      navLineRef.current = navLine;

      const bounds = L.latLngBounds([
        ...zone.polygon,
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

  const handleSwitchLayer = (type: MapLayerType) => {
    setActiveLayer(type);
    applyTileLayer(type, lang);
  };

  return (
    <div className="relative w-full h-[290px] sm:h-80 md:h-[400px] min-h-[290px] rounded-2xl overflow-hidden border border-rose-300/60 shadow-lg bg-sky-50">
      <div ref={mapRef} className="w-full h-full z-10" />

      {/* Map Style Switcher */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center p-0.5 sm:p-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md gap-0.5 sm:gap-1">
        <button
          onClick={() => handleSwitchLayer('street')}
          className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition ${
            activeLayer === 'street'
              ? 'bg-rose-600 text-white font-bold shadow-sm'
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
              ? 'bg-rose-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Esri Satellite"
        >
          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden xs:inline sm:inline">{t('map_layer_satellite')}</span>
        </button>

        <button
          onClick={() => handleSwitchLayer('terrain')}
          className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition ${
            activeLayer === 'terrain'
              ? 'bg-rose-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="OpenTopoMap Terrain"
        >
          <Mountain className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden xs:inline sm:inline">{t('map_layer_terrain')}</span>
        </button>
      </div>

      {/* Hazard Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-rose-300 text-[11px] font-semibold text-rose-700 shadow-md flex items-center gap-2">
        <AlertOctagon className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
        <span>{t('map_legend_hazard')}</span>
      </div>
    </div>
  );
}
