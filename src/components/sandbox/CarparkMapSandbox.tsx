'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Car,
  Layers,
  Crosshair,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  ArrowRight,
  Info,
  Shield,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { BookingModal } from '@/components/parking/BookingModal';

interface SelectedBay {
  id: string;
  bayNumber: string;
  type: string;
  status: string;
  width_m?: number;
  depth_m?: number;
  layout?: string;
  sessionPlate?: string;
  sessionVisitor?: string;
  sessionEnd?: string;
}

export const CarparkMapSandbox: React.FC = () => {
  const { carparks } = useApp();
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<any>(null);

  const [filterType, setFilterType] = useState<'all' | 'visitor' | 'resident'>('all');
  const [selectedBay, setSelectedBay] = useState<SelectedBay | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);

  const fetchGeoJSON = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/carparks/geojson');
      const data = await res.json();
      setGeoData(data);
      if (map.current && map.current.getSource('carparks-source')) {
        map.current.getSource('carparks-source').setData(data);
      }
    } catch (err) {
      console.error('Failed to load carparks GeoJSON:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadMapLibre = async () => {
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

      // 3. Initialize MapLibre GL instance with high-res Satellite raster tiles
      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'esri-satellite': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              ],
              tileSize: 256,
              attribution: 'Esri, Maxar, Earthstar Geographics',
            },
          },
          layers: [
            {
              id: 'esri-satellite-layer',
              type: 'raster',
              source: 'esri-satellite',
              minzoom: 0,
              maxzoom: 20,
            },
          ],
        },
        center: [174.6960, -36.7291], // Millennium Village site center
        zoom: 18.2,
        pitch: 0,
        bearing: 0,
        maxZoom: 21,
        minZoom: 15,
      });

      mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      mapInstance.on('load', async () => {
        if (isCancelled) return;

        // Fetch live GeoJSON from API
        const res = await fetch('/api/carparks/geojson');
        const geojson = await res.json();
        setGeoData(geojson);

        // Add GeoJSON Source
        mapInstance.addSource('carparks-source', {
          type: 'geojson',
          data: geojson,
        });

        // Dynamic Vector Polygon Fill Layer
        mapInstance.addLayer({
          id: 'carparks-fill',
          type: 'fill',
          source: 'carparks-source',
          paint: {
            'fill-color': [
              'match',
              ['get', 'status'],
              'available', '#22c55e', // Emerald green
              'occupied',  '#64748b', // Slate gray
              'reserved',  '#f59e0b', // Amber
              'selected',  '#0066ff', // Vibrant blue
              '#3b82f6'
            ],
            'fill-opacity': 0.75,
          },
        });

        // Crisp Border Lines
        mapInstance.addLayer({
          id: 'carparks-outline',
          type: 'line',
          source: 'carparks-source',
          paint: {
            'line-color': '#0f172a',
            'line-width': 2,
          },
        });

        // Selected Highlight Outline
        mapInstance.addLayer({
          id: 'carparks-selected-outline',
          type: 'line',
          source: 'carparks-source',
          paint: {
            'line-color': '#ffffff',
            'line-width': 3,
          },
          filter: ['==', ['id'], ''],
        });

        // Bay Number Text Labels Layer
        mapInstance.addLayer({
          id: 'carparks-label',
          type: 'symbol',
          source: 'carparks-source',
          layout: {
            'text-field': ['get', 'bay_number'],
            'text-size': 11,
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1.5,
          },
        });

        // Click Handler for Bays
        mapInstance.on('click', 'carparks-fill', (e: any) => {
          if (!e.features || e.features.length === 0) return;
          const feature = e.features[0];
          const props = feature.properties;

          setSelectedBay({
            id: feature.id as string,
            bayNumber: props?.bay_number,
            type: props?.type,
            status: props?.status,
            width_m: props?.width_m,
            depth_m: props?.depth_m,
            layout: props?.layout,
            sessionPlate: props?.session_plate,
            sessionVisitor: props?.session_visitor,
            sessionEnd: props?.session_end,
          });

          if (feature.id) {
            mapInstance.setFilter('carparks-selected-outline', ['==', ['id'], feature.id]);
          }
        });

        // Cursor states
        mapInstance.on('mouseenter', 'carparks-fill', () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });
        mapInstance.on('mouseleave', 'carparks-fill', () => {
          mapInstance.getCanvas().style.cursor = '';
        });

        setIsMapLoading(false);
      });

      map.current = mapInstance;
    };

    loadMapLibre().catch((err) => {
      console.error('Error initializing map:', err);
      setIsMapLoading(false);
    });

    return () => {
      isCancelled = true;
      map.current?.remove?.();
    };
  }, []);

  // Filter polygons when user clicks Visitor / Resident filter
  const handleFilter = (type: 'all' | 'visitor' | 'resident') => {
    setFilterType(type);
    if (!map.current || !map.current.getLayer('carparks-fill')) return;

    if (type === 'all') {
      map.current.setFilter('carparks-fill', null);
      map.current.setFilter('carparks-outline', null);
      map.current.setFilter('carparks-label', null);
    } else {
      const filterExpr = ['==', ['get', 'type'], type];
      map.current.setFilter('carparks-fill', filterExpr);
      map.current.setFilter('carparks-outline', filterExpr);
      map.current.setFilter('carparks-label', filterExpr);
    }
  };

  const handleRecenter = () => {
    map.current?.flyTo({
      center: [174.6960, -36.7291],
      zoom: 18.2,
      pitch: 0,
      bearing: 0,
      essential: true,
    });
  };

  const matchedCarpark = carparks.find(
    (c) =>
      c.spot_number.toUpperCase() === (selectedBay?.bayNumber || '').toUpperCase().replace('-', '') ||
      c.spot_number.toUpperCase() === (selectedBay?.bayNumber || '').toUpperCase()
  ) || carparks[0];

  const totalFeatures = geoData?.features?.length || 37;
  const visitorCount = geoData?.features?.filter((f: any) => f.properties?.type === 'visitor').length || 15;
  const residentCount = geoData?.features?.filter((f: any) => f.properties?.type === 'resident').length || 22;

  return (
    <div className="relative w-full h-[calc(100dvh-5.5rem)] bg-slate-950 overflow-hidden flex flex-col">
      {/* Loading Spinner */}
      {isMapLoading && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs font-bold text-slate-300">Loading Satellite Carpark Map...</p>
        </div>
      )}

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/60 shadow-xl pointer-events-auto">
          <button
            onClick={() => handleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All ({totalFeatures})
          </button>
          <button
            onClick={() => handleFilter('visitor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'visitor'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Visitor ({visitorCount})
          </button>
          <button
            onClick={() => handleFilter('resident')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterType === 'resident'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Resident ({residentCount})
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={fetchGeoJSON}
            className="w-10 h-10 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white flex items-center justify-center shadow-xl active:scale-95 transition-all"
            title="Refresh live status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={handleRecenter}
            className="w-10 h-10 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white flex items-center justify-center shadow-xl active:scale-95 transition-all"
            title="Recenter map"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend Badge Bar */}
      <div className="absolute top-16 left-3 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-slate-300 shadow-lg">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Occupied
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Reserved
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainer} className="w-full flex-1" />

      {/* Selected Bay Bottom Sheet */}
      {selectedBay && (
        <div className="absolute bottom-2 inset-x-3 sm:max-w-md sm:mx-auto z-40 animate-slide-up">
          <div className="card p-4 bg-slate-900/95 backdrop-blur-xl border-slate-700 text-white shadow-2xl space-y-3 rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-sm">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-tight">
                    Bay {selectedBay.bayNumber}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedBay.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {selectedBay.width_m}m × {selectedBay.depth_m}m ({selectedBay.layout?.replace('_', ' ')})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`chip text-xs font-bold py-1 px-2.5 rounded-full flex items-center gap-1 ${
                    selectedBay.status === 'available'
                      ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                      : selectedBay.status === 'reserved'
                      ? 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                      : 'bg-slate-800 border border-slate-600 text-slate-300'
                  }`}
                >
                  {selectedBay.status === 'available' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  {selectedBay.status === 'occupied' && <Clock className="w-3 h-3 text-slate-400" />}
                  {selectedBay.status.toUpperCase()}
                </span>
                <button
                  onClick={() => {
                    setSelectedBay(null);
                    map.current?.setFilter?.('carparks-selected-outline', ['==', ['id'], '']);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Live Session Info if Occupied */}
            {selectedBay.status === 'occupied' && selectedBay.sessionPlate && (
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1 text-slate-300">
                <div className="flex justify-between font-bold text-white">
                  <span>Current Vehicle:</span>
                  <span className="font-mono text-amber-400">{selectedBay.sessionPlate}</span>
                </div>
                {selectedBay.sessionVisitor && (
                  <div className="flex justify-between">
                    <span>Visitor:</span>
                    <span>{selectedBay.sessionVisitor}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action CTA */}
            {selectedBay.status === 'available' && selectedBay.type === 'visitor' ? (
              <button
                onClick={() => setShowBookingModal(true)}
                className="btn-primary w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 rounded-2xl active:scale-[0.98] transition-all"
              >
                <span>Book Bay {selectedBay.bayNumber}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : selectedBay.type === 'resident' ? (
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-[11px] text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Dedicated Resident Carpark. Assigned to private tenant / owner.</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-[11px] text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Bay is currently occupied. Check back once session finishes.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal Bridge */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        spot={matchedCarpark}
      />
    </div>
  );
};
