'use client';

import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import {
  Carpark, ParkingSession, User, UnitVehicle, DemeritRecord,
  SpotRental, SystemConfig, WhitelistEntry, Role, SessionType, SavedGuest,
} from '@/types';
import { useAppState, apiPost, apiDelete } from '@/lib/hooks/useAppState';

const FAV_STORAGE_KEY = 'mv_parking_favs';

interface AppContextType {
  currentUser: User | null;
  isAuthed: boolean;
  isLoading: boolean;
  refetch: () => void;
  logout: () => Promise<void>;

  config: SystemConfig;
  carparks: Carpark[];
  sessions: ParkingSession[];
  vehicles: UnitVehicle[];
  demerits: DemeritRecord[];
  rentals: SpotRental[];
  whitelist: WhitelistEntry[];
  savedGuests: SavedGuest[];
  notifications: any[];
  favourites: string[];

  bookSpot: (
    carparkId: string,
    spotNumber: string,
    vehiclePlate: string,
    durationHours: number,
    sessionType: SessionType,
    visitorName?: string,
    visitorPhone?: string,
    savedGuestId?: string
  ) => Promise<boolean>;
  releaseSpot: (sessionId: string) => Promise<void>;

  addSavedGuest: (guest: { name: string; plate: string; phone?: string; make_model_color?: string }) => Promise<void>;
  removeSavedGuest: (guestId: string) => Promise<void>;

  addVehicle: (plateNumber: string, makeModelColor: string) => Promise<void>;
  removeVehicle: (vehicleId: string) => Promise<void>;

  addWhitelistedUser: (email: string, name: string, unitNumber: string, phone: string, role: Role) => Promise<void>;
  removeWhitelistedUser: (whitelistId: string) => Promise<void>;

  issueDemerit: (
    unitNumber: string, vehiclePlate: string, spotNumber: string,
    violationType: DemeritRecord['violation_type'], description: string, demeritPoints: number
  ) => Promise<{ triggered_fine?: boolean; fine_amount?: number }>;

  bootRequest: (sessionId: string) => Promise<void>;

  rentOutSpot: (spotNumber: string, weeks: number, pricePerWeek: number) => Promise<void>;
  bookRentedSpot: (rentalId: string, plate: string) => Promise<void>;

  toggleFavourite: (spotNumber: string) => void;

  updateConfig: (partial: Partial<SystemConfig>) => Promise<void>;

  addNotificationLog: (title: string, message: string) => void;
  sendDirectAlert: (unitNumber: string, message: string, alertType: 'in_app' | 'sms' | 'call') => Promise<void>;

  parksInUse: number;
  parksInUseByResident: number;
  availableParksIfResidentStays: number;
  availableParksIfResidentMoves: number;
  longestResidentSessionToBoot: ParkingSession | null;

  setCurrentUser: (user: User | null) => void;
  switchRole: (role: Role) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading, refetch: invalidate } = useAppState();

  // Favourites — persisted in localStorage
  const [favourites, setFavourites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(FAV_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Demo mode via ?demo=1
  const [demoUser, setDemoUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlDemo = window.location.search.includes('demo=1');
    if (urlDemo) {
      sessionStorage.setItem('mvp-demo', '1');
      setIsDemoMode(true);
    } else {
      setIsDemoMode(sessionStorage.getItem('mvp-demo') === '1');
    }
  }, []);

  const currentUser: User | null = useMemo(() => {
    if (isDemoMode && demoUser) return demoUser;
    return data?.user || null;
  }, [data?.user, isDemoMode, demoUser]);

  const config: SystemConfig = useMemo(() => {
    if (data?.config) return data.config;
    return {
      max_visitor_hours: 24,
      max_resident_excess_hours: 12,
      max_weekly_rental_price: 50.0,
      complex_name: 'Millennium Village',
      complex_address: '548 Albany Highway, Albany',
      demerit_fine_threshold: 3,
      demerit_fine_amount: 50,
      tow_agency_name: 'Citywide Towing & Recovery',
      tow_agency_phone: '+64 9 555 8697',
      total_visitor_parks: 20,
      spot_prefix: 'V',
      area_divisions: [],
    };
  }, [data?.config]);

  const carparks = data?.carparks || [];
  const sessions = data?.sessions || [];
  const vehicles = data?.vehicles || [];
  const demerits = data?.demerits || [];
  const rentals = data?.rentals || [];
  const whitelist = data?.whitelist || [];
  const savedGuests = data?.savedGuests || [];
  const notifications = data?.notifications || [];

  // Occupancy
  const activeSessions = sessions.filter((s: any) => s.is_active);
  const parksInUse = activeSessions.length;
  const residentExcessSessions = activeSessions.filter((s: any) => s.session_type === 'resident_excess');
  const parksInUseByResident = residentExcessSessions.length;
  const totalVisitorParks = config.total_visitor_parks;
  const availableParksIfResidentStays = Math.max(0, totalVisitorParks - parksInUse);
  const availableParksIfResidentMoves = Math.max(0, totalVisitorParks - (parksInUse - parksInUseByResident));
  const longestResidentSessionToBoot = residentExcessSessions.length > 0
    ? [...residentExcessSessions].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]
    : null;

  // ─── API mutations ───────────────────────────
  const bookSpot = useCallback(async (
    carparkId: string,
    spotNumber: string,
    vehiclePlate: string,
    durationHours: number,
    sessionType: SessionType,
    visitorName?: string,
    visitorPhone?: string,
    savedGuestId?: string
  ) => {
    try {
      await apiPost('/api/sessions', {
        carparkId, spotNumber, vehiclePlate, durationHours, sessionType, visitorName, visitorPhone, savedGuestId,
      });
      invalidate();
      return true;
    } catch (e: any) {
      console.error('Book spot failed:', e);
      return false;
    }
  }, [invalidate]);

  const releaseSpot = useCallback(async (sessionId: string) => {
    try {
      await apiPost(`/api/sessions/${sessionId}/release`, {});
      invalidate();
    } catch (e: any) { console.error(e); }
  }, [invalidate]);

  const addSavedGuest = useCallback(async (guest: { name: string; plate: string; phone?: string; make_model_color?: string }) => {
    try {
      await apiPost('/api/me/saved-guests', guest);
      invalidate();
    } catch (e: any) { console.error(e); }
  }, [invalidate]);

  const removeSavedGuest = useCallback(async (guestId: string) => {
    try {
      await apiDelete(`/api/me/saved-guests?id=${encodeURIComponent(guestId)}`);
      invalidate();
    } catch (e: any) { console.error(e); }
  }, [invalidate]);

  const addVehicle = useCallback(async (plateNumber: string, makeModelColor: string) => {
    try {
      await apiPost('/api/me/vehicles', { plate_number: plateNumber, make_model_color: makeModelColor });
      invalidate();
    } catch (e: any) {
      alert(e?.message || 'Failed to register vehicle');
    }
  }, [invalidate]);

  const removeVehicle = useCallback(async (vehicleId: string) => {
    try {
      await apiDelete(`/api/me/vehicles?id=${encodeURIComponent(vehicleId)}`);
      invalidate();
    } catch (e: any) { console.error(e); }
  }, [invalidate]);

  const addWhitelistedUser = useCallback(async (email: string, name: string, unitNumber: string, phone: string, role: Role) => {
    try {
      await apiPost('/api/admin/whitelist', { email, name, unit_number: unitNumber, phone, role });
      invalidate();
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }, [invalidate]);

  const removeWhitelistedUser = useCallback(async (whitelistId: string) => {
    try {
      await apiDelete(`/api/admin/whitelist?id=${encodeURIComponent(whitelistId)}`);
      invalidate();
    } catch (e: any) { console.error(e); }
  }, [invalidate]);

  const issueDemerit = useCallback(async (
    unitNumber: string,
    vehiclePlate: string,
    spotNumber: string,
    violationType: DemeritRecord['violation_type'],
    description: string,
    demeritPoints: number
  ) => {
    try {
      const res = await apiPost<{ triggered_fine?: boolean; fine_amount?: number }>('/api/mgmt/demerits', {
        unit_number: unitNumber, vehicle_plate: vehiclePlate, spot_number: spotNumber,
        violation_type: violationType, description, demerit_points: demeritPoints,
      });
      invalidate();
      return res;
    } catch (e: any) {
      console.error(e);
      return {};
    }
  }, [invalidate]);

  const bootRequest = useCallback(async (sessionId: string) => {
    try {
      await apiPost('/api/mgmt/boot-request', { sessionId });
      invalidate();
    } catch (e: any) { console.error(e); }
  }, [invalidate]);

  const rentOutSpot = useCallback(async (spotNumber: string, weeks: number, pricePerWeek: number) => {
    // Will be wired to a real API in Phase 5
    console.log('rentOutSpot called:', spotNumber, weeks, pricePerWeek);
  }, []);

  const bookRentedSpot = useCallback(async (rentalId: string, plate: string) => {
    console.log('bookRentedSpot called:', rentalId, plate);
  }, []);

  const toggleFavourite = useCallback((spotNumber: string) => {
    setFavourites((prev) => {
      const next = prev.includes(spotNumber) ? prev.filter((s) => s !== spotNumber) : [...prev, spotNumber];
      try { localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const updateConfig = useCallback(async (partial: Partial<SystemConfig>) => {
    try {
      await apiPost('/api/admin/config', partial);
      invalidate();
    } catch (e: any) { console.error(e); }
  }, [invalidate]);

  const addNotificationLog = useCallback((_title: string, _message: string) => {
    // Server-side persists; no local notifications until Phase 5 wires the full loop
  }, []);

  const sendDirectAlert = useCallback(async (_unitNumber: string, _message: string, _alertType: 'in_app' | 'sms' | 'call') => {
    // Server-side in Phase 5
    return Promise.resolve();
  }, []);

  const logout = useCallback(async () => {
    try {
      setDemoUser(null);
      if (typeof window !== 'undefined') sessionStorage.removeItem('mvp-demo');
      invalidate();
      window.location.href = '/';
    } catch (e: any) { console.error(e); }
  }, [invalidate]);

  const setCurrentUser = useCallback((user: User | null) => {
    if (isDemoMode) setDemoUser(user);
  }, [isDemoMode]);

  const switchRole = useCallback((role: Role) => {
    if (!isDemoMode || !data?.user) return;
    const base = data.user;
    const newUser: User = {
      ...base,
      role,
      unit_number: role === 'user' ? 'Unit 12' : role === 'management' ? 'Body Corp Office' : 'Body Corp HQ',
    };
    setDemoUser(newUser);
  }, [isDemoMode, data?.user]);

  const value: AppContextType = {
    currentUser,
    isAuthed: !!currentUser,
    isLoading,
    refetch: invalidate,
    logout,
    config,
    carparks,
    sessions,
    vehicles,
    demerits,
    rentals,
    whitelist,
    savedGuests,
    notifications,
    favourites,
    bookSpot,
    releaseSpot,
    addSavedGuest,
    removeSavedGuest,
    addVehicle,
    removeVehicle,
    addWhitelistedUser,
    removeWhitelistedUser,
    issueDemerit,
    bootRequest,
    rentOutSpot,
    bookRentedSpot,
    toggleFavourite,
    updateConfig,
    addNotificationLog,
    sendDirectAlert,
    parksInUse,
    parksInUseByResident,
    availableParksIfResidentStays,
    availableParksIfResidentMoves,
    longestResidentSessionToBoot,
    setCurrentUser,
    switchRole,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
