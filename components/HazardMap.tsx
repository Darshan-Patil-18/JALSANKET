'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HazardZone } from '@/lib/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Globe, Mountain, AlertOctagon } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface HazardMapProps {
  zone: HazardZone;
}

type MapLayerType = 'street' | 'satellite' | 'terrain';

const TILE_LAYERS: Record<MapLayerType, { url: string; attribution: string; maxZoom: number }> = {
  street: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18,
  },
  terrain: {
    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap, SRTM | Style: OpenTopoMap',
    maxZoom: 17,
  },
};

export default function HazardMap({ zone }: HazardMapProps) {
  const { t, formatNum } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('street');

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [zone.lat, zone.lng],
        zoom: 10,
        zoomControl: true,
        attributionControl: false,
      });

      const tile = L.tileLayer(TILE_LAYERS.street.url, {
        maxZoom: TILE_LAYERS.street.maxZoom,
        attribution: TILE_LAYERS.street.attribution,
      }).addTo(map);

      currentTileLayerRef.current = tile;
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    map.setView([zone.lat, zone.lng], 10);

    // Clear old layers
    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
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

    // Add Markers with Distance Tooltips
    const m1 = L.marker(zone.shorePoint, { icon: shoreIcon })
      .bindTooltip(`<b>${t('map_anchor_coastal')}</b><br/>${formatNum(zone.distances.p1)}`, {
        permanent: true,
        direction: 'top',
        className: 'custom-leaflet-tooltip',
      })
      .addTo(map);

    const m2 = L.marker(zone.polygon[1], { icon: hazardIcon })
      .bindTooltip(`<b>${t('map_hazard_p1')}</b><br/>${formatNum(zone.distances.p2)}`, {
        permanent: true,
        direction: 'bottom',
        className: 'custom-leaflet-tooltip',
      })
      .addTo(map);

    const m3 = L.marker(zone.polygon[2], { icon: hazardIcon })
      .bindTooltip(`<b>${t('map_hazard_p2')}</b><br/>${formatNum(zone.distances.p3)}`, {
        permanent: true,
        direction: 'right',
        className: 'custom-leaflet-tooltip',
      })
      .addTo(map);

    markersRef.current = [m1, m2, m3];

    map.fitBounds(polygon.getBounds(), { padding: [40, 40] });
  }, [zone, t, formatNum]);

  const handleSwitchLayer = (type: MapLayerType) => {
    if (!leafletMapRef.current) return;
    setActiveLayer(type);

    if (currentTileLayerRef.current) {
      leafletMapRef.current.removeLayer(currentTileLayerRef.current);
    }

    const cfg = TILE_LAYERS[type];
    const newTile = L.tileLayer(cfg.url, {
      maxZoom: cfg.maxZoom,
      attribution: cfg.attribution,
    }).addTo(leafletMapRef.current);

    newTile.bringToBack();
    currentTileLayerRef.current = newTile;
  };

  return (
    <div className="relative w-full h-80 md:h-[400px] rounded-2xl overflow-hidden border border-rose-300/60 shadow-lg bg-sky-50">
      <div ref={mapRef} className="w-full h-full z-10" />

      {/* Map Style Switcher */}
      <div className="absolute top-3 right-3 z-20 flex items-center p-1 rounded-xl bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-md gap-1">
        <button
          onClick={() => handleSwitchLayer('street')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            activeLayer === 'street'
              ? 'bg-rose-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="OpenStreetMap Standard"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>{t('map_layer_street')}</span>
        </button>

        <button
          onClick={() => handleSwitchLayer('satellite')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            activeLayer === 'satellite'
              ? 'bg-rose-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Esri Satellite"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t('map_layer_satellite')}</span>
        </button>

        <button
          onClick={() => handleSwitchLayer('terrain')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            activeLayer === 'terrain'
              ? 'bg-rose-600 text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="OpenTopoMap Terrain"
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>{t('map_layer_terrain')}</span>
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
