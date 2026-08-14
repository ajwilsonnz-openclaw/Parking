'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Map,
  Moon,
  Crosshair,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2
} from 'lucide-react';

type MapTheme = 'google' | 'dark';
type ZoneFilter = 'front' | 'rear' | 'all';

export default function FullscreenCarparkMapPage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<any>(null);

  const [activeZone, setActiveZone] = useState<ZoneFilter>('front');
  const [mapTheme, setMapTheme] = useState<MapTheme>('google');
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [hideUI, setHideUI] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);

  const getMapStyle = (theme: MapTheme) => {
    if (theme === 'google') {
      return {
        version: 8,
        sources: {
          'google-roadmap': {
            type: 'raster',
            tiles: [
              'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
              'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
              'https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
              'https://mt3.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            ],
            tileSize: 256,
            attribution: '© Google Maps',
          },
        },
        layers: [
          {
            id: 'google-roadmap-layer',
            type: 'raster',
            source: 'google-roadmap',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      };
    } else {
      return {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '© CartoDB, © OpenStreetMap',
          },
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      };
    }
  };

  const setupMapLayers = (mapInstance: any, data: any) => {
    if (mapInstance.getSource('carparks-source')) {
      mapInstance.getSource('carparks-source').setData(data);
      return;
    }

    mapInstance.addSource('carparks-source', {
      type: 'geojson',
      data,
    });

    // Vector Fill Layer
    mapInstance.addLayer({
      id: 'carparks-fill',
      type: 'fill',
      source: 'carparks-source',
      paint: {
        'fill-color': [
          'match',
          ['get', 'status'],
          'available', '#16a34a', // Emerald/Green
          'occupied',  '#64748b', // Slate gray
          'reserved',  '#f59e0b', // Amber
          '#22c55e'
        ],
        'fill-opacity': 0.7,
      },
    });

    // Border Outline
    mapInstance.addLayer({
      id: 'carparks-outline',
      type: 'line',
      source: 'carparks-source',
      paint: {
        'line-color': '#0f172a',
        'line-width': 2,
      },
    });

    // Bay Number Labels
    mapInstance.addLayer({
      id: 'carparks-label',
      type: 'symbol',
      source: 'carparks-source',
      layout: {
        'text-field': ['get', 'bay_number'],
        'text-size': 12,
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#0f172a',
        'text-halo-width': 2,
      },
    });
  };

  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      // 1. Inject CSS if not present
      if (!document.getElementById('maplibre-css')) {
        const link = document.createElement('link');
        link.id = 'maplibre-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
        document.head.appendChild(link);
      }

      // 2. Inject JS if not present
      if (!(window as any).maplibregl) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.getElementById('maplibre-js') as HTMLScriptElement;
          if (existing) {
            existing.addEventListener('load', () => resolve());
            return;
          }
          const script = document.createElement('script');
          script.id = 'maplibre-js';
          script.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load maplibre-gl'));
          document.body.appendChild(script);
        });
      }

      if (isCancelled || !mapContainer.current) return;
      const maplibregl = (window as any).maplibregl;

      // 3. Initialize Map with Google Maps Roadmap style
      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: getMapStyle('google'),
        center: [174.6963, -36.7292],
        zoom: 19.0,
        pitch: 0,
        bearing: 0,
        maxZoom: 22,
        minZoom: 15,
      });

      mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      mapInstance.on('load', async () => {
        if (isCancelled) return;

        const res = await fetch('/api/carparks/geojson');
        const geojson = await res.json();
        setGeoData(geojson);

        setupMapLayers(mapInstance, geojson);
        setIsMapLoading(false);
      });

      map.current = mapInstance;
    };

    initMap().catch((err) => {
      console.error('Error initializing fullscreen map:', err);
      setIsMapLoading(false);
    });

    return () => {
      isCancelled = true;
      map.current?.remove?.();
    };
  }, []);

  const handleToggleTheme = (theme: MapTheme) => {
    setMapTheme(theme);
    if (!map.current || !geoData) return;

    map.current.setStyle(getMapStyle(theme));
    map.current.once('style.load', () => {
      setupMapLayers(map.current, geoData);
    });
  };

  const handleZoneSwitch = (zone: ZoneFilter) => {
    setActiveZone(zone);
    if (!map.current) return;

    if (zone === 'front') {
      map.current.flyTo({
        center: [174.6963, -36.7292],
        zoom: 19.3,
        pitch: 0,
        essential: true,
      });
    } else if (zone === 'rear') {
      map.current.flyTo({
        center: [174.6949, -36.7290],
        zoom: 19.3,
        pitch: 0,
        essential: true,
      });
    } else {
      map.current.flyTo({
        center: [174.6958, -36.7291],
        zoom: 18.2,
        pitch: 0,
        essential: true,
      });
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Loading Overlay */}
      {isMapLoading && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-bold text-slate-300">Loading Fullscreen Google Map...</p>
        </div>
      )}

      {/* Floating Screenshot Controls (Can be hidden) */}
      {!hideUI && (
        <div className="absolute top-4 left-4 z-40 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl">
          {/* Zone Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleZoneSwitch('front')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeZone === 'front' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Front Wing
            </button>
            <button
              onClick={() => handleZoneSwitch('rear')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeZone === 'rear' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rear Wing
            </button>
            <button
              onClick={() => handleZoneSwitch('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeZone === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Site
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => handleToggleTheme(mapTheme === 'google' ? 'dark' : 'google')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            {mapTheme === 'google' ? (
              <>
                <Map className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Map</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dark Map</span>
              </>
            )}
          </button>

          {/* Hide UI for Screenshot Button */}
          <button
            onClick={() => setHideUI(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Hide all UI for clean screenshot"
          >
            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            <span>Hide UI</span>
          </button>
        </div>
      )}

      {/* Floating Restore UI Button (When UI is hidden) */}
      {hideUI && (
        <button
          onClick={() => setHideUI(false)}
          className="absolute top-4 left-4 z-40 px-3 py-2 rounded-xl bg-slate-900/90 text-white text-xs font-bold border border-slate-700 shadow-xl flex items-center gap-1.5 hover:bg-slate-800 transition-all"
        >
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>Show UI</span>
        </button>
      )}

      {/* Fullscreen Map Canvas */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
