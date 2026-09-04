'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FishingZone } from '@/lib/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Map as MapIcon, Globe, Mountain } from 'lucide-react';

interface FishingMapProps {
  zone: FishingZone;
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
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  terrain: {
    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
};

export default function FishingMap({ zone }: FishingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('street');

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

      // Default OpenStreetMap keyless tile layer
      const tile = L.tileLayer(TILE_LAYERS.street.url, {
        maxZoom: TILE_LAYERS.street.maxZoom,
        attribution: TILE_LAYERS.street.attribution,
      }).addTo(map);

      currentTileLayerRef.current = tile;
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    map.setView([zone.lat, zone.lng], 10);

    // Clear old polygon and markers
    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
    }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Custom Icon for Shore Reference Point
    const shoreIcon = L.divIcon({
      className: 'custom-shore-pin',
      html: `
        <div style="background-color: #0284c7; border: 2px solid white; border-radius: 9999px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.5);">
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
        <div style="background-color: #06b6d4; border: 2px solid white; border-radius: 9999px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(6,182,212,0.7);">
          <div style="width: 6px; height: 6px; background-color: #083344; border-radius: 9999px;"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Draw Potential Fishing Zone Triangular Polygon
    const triangleCoords: [number, number][] = [
      zone.shorePoint,
      zone.zoneP1,
      zone.zoneP2,
    ];

    const polygon = L.polygon(triangleCoords, {
      color: '#06b6d4',
      weight: 3,
      opacity: 0.95,
      fillColor: '#0891b2',
      fillOpacity: 0.35,
      dashArray: '6, 6',
    }).addTo(map);

    polygonRef.current = polygon;

    // Add Markers with Distance Tooltips for each of the 3 points
    const m1 = L.marker(zone.shorePoint, { icon: shoreIcon })
      .bindTooltip(`<b>Coastal Anchor Point</b><br/>${zone.distances.p1}`, {
        permanent: true,
        direction: 'top',
        className: 'custom-leaflet-tooltip',
      })
      .addTo(map);

    const m2 = L.marker(zone.zoneP1, { icon: fishIcon })
      .bindTooltip(`<b>PFZ Sector Alpha</b><br/>${zone.distances.p2}`, {
        permanent: true,
        direction: 'bottom',
        className: 'custom-leaflet-tooltip',
      })
      .addTo(map);

    const m3 = L.marker(zone.zoneP2, { icon: fishIcon })
      .bindTooltip(`<b>PFZ Sector Beta</b><br/>${zone.distances.p3}`, {
        permanent: true,
        direction: 'right',
        className: 'custom-leaflet-tooltip',
      })
      .addTo(map);

    markersRef.current = [m1, m2, m3];

    // Fit map bounds gracefully
    map.fitBounds(polygon.getBounds(), { padding: [40, 40] });
  }, [zone]);

  // Handle Layer Switching without touching polygons/markers
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

    // Send new tile layer to back so polygon and markers remain on top
    newTile.bringToBack();
    currentTileLayerRef.current = newTile;
  };

  return (
    <div className="relative w-full h-80 md:h-[400px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
      <div ref={mapRef} className="w-full h-full z-10" />
      
      {/* Top-Right: Map Style Switcher (Keyless OSM / Esri Satellite / Terrain) */}
      <div className="absolute top-3 right-3 z-20 flex items-center p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/15 shadow-lg gap-1">
        <button
          onClick={() => handleSwitchLayer('street')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            activeLayer === 'street'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="OpenStreetMap Standard (Free, Keyless)"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Street</span>
        </button>

        <button
          onClick={() => handleSwitchLayer('satellite')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            activeLayer === 'satellite'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Esri World Imagery (Free, Keyless)"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Satellite</span>
        </button>

        <button
          onClick={() => handleSwitchLayer('terrain')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
            activeLayer === 'terrain'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="OpenTopoMap Terrain (Free, Keyless)"
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>Terrain</span>
        </button>
      </div>

      {/* Bottom-Left: Legend Tag */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-[11px] font-semibold text-cyan-300 shadow-xl flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>PFZ Vector Triangle (ISRO Ocean Colour Track)</span>
      </div>
    </div>
  );
}
