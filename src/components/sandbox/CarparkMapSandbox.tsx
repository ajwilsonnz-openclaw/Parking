'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Car,
  Crosshair,
  CheckCircle2,
  Clock,
  X,
  ArrowRight,
  Shield,
  RefreshCw,
  Loader2,
  Map,
  Moon,
  Layers
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

type MapTheme = 'google' | 'dark';
type ZoneFilter = 'front' | 'rear' | 'all';

export const CarparkMapSandbox: React.FC = () => {
  const { carparks, sessions, vehicles, bookSpot, refetch } = useApp();
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<any>(null);

  const [activeZone, setActiveZone] = useState<ZoneFilter>('front');
  const [mapTheme, setMapTheme] = useState<MapTheme>('google');
  const [selectedBay, setSelectedBay] = useState<SelectedBay | null>(null);
  const [plateNumber, setPlateNumber] = useState<string>('');
  const [visitorName, setVisitorName] = useState<string>('');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);

  // Set default plate from user's primary vehicle on mount
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const primary = vehicles.find((v) => v.is_primary) || vehicles[0];
      if (primary && !plateNumber) {
        setPlateNumber(primary.plate_number);
      }
    }
  }, [vehicles, plateNumber]);

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
          'available', '#16a34a', // Emerald/Forest green
          'occupied',  '#64748b', // Slate gray
          'reserved',  '#f59e0b', // Amber
          'selected',  '#0066ff', // Blue
          '#22c55e'
        ],
        'fill-opacity': 0.65,
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
        'line-width': 3.5,
      },
      filter: ['==', ['id'], ''],
    });

    // Bay Number Text Labels
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
        'text-halo-color': '#0f172a',
        'text-halo-width': 2,
      },
    });

    // Click Handler for Bays
    mapInstance.on('click', 'carparks-fill', (e: any) => {
      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];
      const props = feature.properties;

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(10); } catch {}
      }

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
      setBookingSuccess(false);

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
        center: [174.6963, -36.7292], // Focused on Front Entrance cluster
        zoom: 19.0,
        pitch: 0,
        bearing: 0,
        maxZoom: 22,
        minZoom: 16,
      });

      mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      mapInstance.on('load', async () => {
        if (isCancelled) return;

        // Fetch live GeoJSON from API
        const res = await fetch('/api/carparks/geojson');
        const geojson = await res.json();
        setGeoData(geojson);

        setupMapLayers(mapInstance, geojson);
        setIsMapLoading(false);
      });

      map.current = mapInstance;
    };

    initMap().catch((err) => {
      console.error('Error initializing map:', err);
      setIsMapLoading(false);
    });

    return () => {
      isCancelled = true;
      map.current?.remove?.();
    };
  }, []);

  // Handle Theme Toggle (Google Maps Roadmap vs Dark Map)
  const handleToggleTheme = (theme: MapTheme) => {
    setMapTheme(theme);
    if (!map.current || !geoData) return;

    map.current.setStyle(getMapStyle(theme));
    map.current.once('style.load', () => {
      setupMapLayers(map.current, geoData);
      if (selectedBay?.id) {
        map.current.setFilter('carparks-selected-outline', ['==', ['id'], selectedBay.id]);
      }
    });
  };

  // Focus camera by Zone (Front vs Rear vs All)
  const handleZoneSwitch = (zone: ZoneFilter) => {
    setActiveZone(zone);
    if (!map.current) return;

    if (zone === 'front') {
      map.current.flyTo({
        center: [174.6963, -36.7292],
        zoom: 19.2,
        pitch: 0,
        essential: true,
      });
    } else if (zone === 'rear') {
      map.current.flyTo({
        center: [174.6949, -36.7290],
        zoom: 19.2,
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

  const handleConfirmReservation = async () => {
    if (!selectedBay || !plateNumber.trim()) return;

    setIsSubmitting(true);
    try {
      const targetSpot = carparks.find(
        (c) =>
          c.spot_number.toUpperCase() === selectedBay.bayNumber.toUpperCase() ||
          c.spot_number.toUpperCase() === selectedBay.bayNumber.replace(/^([VR])-?0*(\d+)$/, '$1$2').toUpperCase() ||
          c.spot_number.toUpperCase() === selectedBay.bayNumber.replace(/^([VR])-?0*(\d+)$/, '$1-$2').toUpperCase()
      ) || carparks[0];

      const spotId = targetSpot?.id || `spot_${selectedBay.bayNumber.toLowerCase().replace('-', '')}`;
      const spotNum = targetSpot?.spot_number || selectedBay.bayNumber;

      await bookSpot(
        spotId,
        spotNum,
        plateNumber.trim().toUpperCase(),
        durationHours,
        'visitor',
        visitorName.trim() || undefined
      );

      setBookingSuccess(true);
      await refetch();
      await fetchGeoJSON();

      setTimeout(() => {
        setSelectedBay(null);
        setBookingSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to book parking spot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBays = geoData?.features?.length || 37;

  return (
    <div className="relative w-full h-[calc(100dvh-5.5rem)] bg-slate-950 overflow-hidden flex flex-col rounded-3xl border border-slate-800 shadow-2xl">
      {/* Loading Overlay */}
      {isMapLoading && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs font-bold text-slate-300">Loading Google Maps Roadmap...</p>
        </div>
      )}

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Zone Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/70 shadow-xl pointer-events-auto">
          <button
            onClick={() => handleZoneSwitch('front')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeZone === 'front'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Front Wing
          </button>
          <button
            onClick={() => handleZoneSwitch('rear')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeZone === 'rear'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Rear Wing
          </button>
          <button
            onClick={() => handleZoneSwitch('all')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeZone === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All
          </button>
        </div>

        {/* Quick Style & Refresh Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => handleToggleTheme(mapTheme === 'google' ? 'dark' : 'google')}
            className="px-3 h-10 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/70 text-slate-200 hover:text-white flex items-center gap-1.5 shadow-xl active:scale-95 transition-all text-xs font-bold"
            title="Toggle map style"
          >
            {mapTheme === 'google' ? (
              <>
                <Map className="w-4 h-4 text-emerald-400" />
                <span>Google Map</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark Map</span>
              </>
            )}
          </button>

          <button
            onClick={fetchGeoJSON}
            className="w-10 h-10 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/70 text-slate-200 hover:text-white flex items-center justify-center shadow-xl active:scale-95 transition-all"
            title="Refresh live status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Legend Badge Bar */}
      <div className="absolute top-16 left-3 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-slate-300 shadow-lg">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Occupied
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reserved
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainer} className="w-full flex-1" />

      {/* Selected Bay Bottom Sheet Modal */}
      {selectedBay && (
        <div className="absolute bottom-2 inset-x-3 sm:max-w-md sm:mx-auto z-40 animate-slide-up">
          <div className="card p-4 bg-slate-900/95 backdrop-blur-xl border-slate-700 text-white shadow-2xl space-y-3.5 rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                      {selectedBay.width_m || 2.3}m × {selectedBay.depth_m || 5.0}m
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

            {/* Occupied State Details */}
            {selectedBay.status === 'occupied' && (
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1 text-slate-300">
                <div className="flex justify-between font-bold text-white">
                  <span>Current Vehicle:</span>
                  <span className="font-mono text-amber-400">{selectedBay.sessionPlate || 'OCCUPIED'}</span>
                </div>
                {selectedBay.sessionVisitor && (
                  <div className="flex justify-between">
                    <span>Visitor:</span>
                    <span>{selectedBay.sessionVisitor}</span>
                  </div>
                )}
              </div>
            )}

            {/* Resident Notice */}
            {selectedBay.type === 'resident' && (
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-[11px] text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Assigned Resident Carpark. Reserved for designated resident.</span>
              </div>
            )}

            {/* Booking Form for Available Visitor Bay */}
            {selectedBay.type === 'visitor' && selectedBay.status === 'available' && (
              <div className="space-y-3">
                {/* Plate Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                      Vehicle Plate
                    </label>
                    {vehicles && vehicles.length > 0 && (
                      <span className="text-[10px] text-blue-400 font-bold">Quick Select</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    className="input w-full font-mono font-black text-sm uppercase bg-slate-950 border-slate-700 text-white"
                    placeholder="e.g. ABC123"
                  />

                  {/* Quick Select Buttons */}
                  {vehicles && vehicles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {vehicles.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setPlateNumber(v.plate_number)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all ${
                            plateNumber === v.plate_number
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {v.plate_number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Duration Pills */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 block mb-1">
                    Duration
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 4, 12, 24].map((hours) => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => setDurationHours(hours)}
                        className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                          durationHours === hours
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBay(null)}
                    className="w-1/3 btn-ghost py-2.5 text-xs font-bold text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReservation}
                    disabled={isSubmitting || !plateNumber.trim() || bookingSuccess}
                    className={`w-2/3 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
                      bookingSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-[0.98]'
                    } disabled:opacity-50`}
                  >
                    {isSubmitting ? (
                      <span>Confirming...</span>
                    ) : bookingSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Reserved!</span>
                      </>
                    ) : (
                      <>
                        <span>Book Bay {selectedBay.bayNumber}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
