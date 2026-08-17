'use client';

import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import {
  Carpark, ParkingSession, User, UnitVehicle, DemeritRecord,
  SpotRental, SystemConfig, WhitelistEntry, Role, SessionType, SavedGuest, Section, Site,
} from '@/types';
import { useAppState, apiPost, apiDelete } from '@/lib/hooks/useAppState';

const FAV_STORAGE_KEY = 'mv_parking_favs';
const SESSIONS_STORAGE_KEY = 'mv_parking_local_sessions';
const GUESTS_STORAGE_KEY = 'mv_parking_local_guests';
const WHITELIST_STORAGE_KEY = 'mv_parking_local_whitelist';

const CANONICAL_CARPARKS: Carpark[] = Array.from({ length: 23 }, (_, i) => {
  const spotNum = 23 - i; // 23 down to 1
  const num = spotNum.toString().padStart(2, '0');
  const sectionId = spotNum >= 21 ? 'sec_entrance' : spotNum >= 15 ? 'sec_units_8_13' : spotNum >= 4 ? 'sec_units_1_7' : 'sec_back';
  const sectionName = spotNum >= 21 ? 'Entrance' : spotNum >= 15 ? 'Units 8–13' : spotNum >= 4 ? 'Units 1–7' : 'Back of Complex';
  return {
    id: `cp_v${num}`,
    site_id: 'site_mv',
    section_id: sectionId,
    section: sectionName,
    spot_number: `V${num}`,
    status: 'available',
    is_rentable_private: false,
  };
});

interface AppContextType {
  currentUser: User | null;
  isAuthed: boolean;
  isLoading: boolean;
  refetch: () => void;
  logout: () => Promise<void>;

  config: SystemConfig;
  site: Site | null;
  sections: Section[];
  carparks: Carpark[];
  sessions: ParkingSession[];
  vehicles: UnitVehicle[];
  demerits: DemeritRecord[];
  rentals: SpotRental[];
  whitelist: WhitelistEntry[];
  units: any[];
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

  addWhitelistedUser: (email: string, name: string, unitNumber: string, phone: string, role: Role, assignedParks?: number) => Promise<void>;
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

  // Local optimistic sessions — persisted in localStorage
  const [localSessions, setLocalSessions] = useState<ParkingSession[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Local optimistic saved guests — persisted in localStorage
  const [localSavedGuests, setLocalSavedGuests] = useState<SavedGuest[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(GUESTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Local optimistic whitelist — persisted in localStorage
  const [localWhitelist, setLocalWhitelist] = useState<WhitelistEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(WHITELIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(localSessions)); } catch {}
  }, [localSessions]);

  useEffect(() => {
    try { localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(localSavedGuests)); } catch {}
  }, [localSavedGuests]);

  useEffect(() => {
    try { localStorage.setItem(WHITELIST_STORAGE_KEY, JSON.stringify(localWhitelist)); } catch {}
  }, [localWhitelist]);

  // Demo mode via ?demo=1
  const [demoUser, setDemoUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.search.includes('demo=1') ||
      sessionStorage.getItem('mvp-demo') === '1'
    );
  });

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
    if (data?.user) return data.user;
    if (isDemoMode) {
      return (
        demoUser || {
          id: 'usr-aj',
          email: 'ajwilsonnz@gmail.com',
          name: 'Adam Wilson',
          unit_number: 'Unit 5',
          phone: '+64 21 000 0000',
          role: 'admin',
          assigned_parks: 1,
          created_at: new Date().toISOString(),
        }
      );
    }
    return null;
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
      total_visitor_parks: 23,
      spot_prefix: 'V',
      area_divisions: [],
    };
  }, [data?.config]);

  // Merge server & local sessions
  const sessions: ParkingSession[] = useMemo(() => {
    const serverSessions = data?.sessions || [];
    const map = new Map<string, ParkingSession>();
    serverSessions.forEach((s: any) => map.set(s.id, s));
    localSessions.forEach((s: any) => map.set(s.id, s));

    const nowMs = Date.now();
    return Array.from(map.values()).filter((s) => {
      const endMs = new Date(s.expected_end_time).getTime();
      return s.is_active && endMs > nowMs && !s.end_time;
    });
  }, [data?.sessions, localSessions]);

  // Merge server & local saved guests
  const savedGuests: SavedGuest[] = useMemo(() => {
    const serverGuests = data?.savedGuests || [];
    const map = new Map<string, SavedGuest>();
    serverGuests.forEach((g: any) => map.set(g.id || g.plate, g));
    localSavedGuests.forEach((g: any) => map.set(g.id || g.plate, g));
    return Array.from(map.values());
  }, [data?.savedGuests, localSavedGuests]);

  // Dynamic carpark status calculation
  const carparks: Carpark[] = useMemo(() => {
    const baseParks = (data?.carparks && data.carparks.length >= 23 ? data.carparks : CANONICAL_CARPARKS) as Carpark[];
    const activeSpotMap = new Map<string, ParkingSession>();
    sessions.forEach((s) => {
      if (s.is_active) {
        if (s.spot_id) activeSpotMap.set(s.spot_id, s);
        if (s.spot_number) activeSpotMap.set(s.spot_number, s);
      }
    });
    return baseParks.map((cp) => ({
      ...cp,
      status: (activeSpotMap.has(cp.id) || activeSpotMap.has(cp.spot_number) ? 'occupied' : 'available') as 'occupied' | 'available',
    }));
  }, [data?.carparks, sessions]);

  const vehicles = data?.vehicles || [];
  const demerits = data?.demerits || [];
  const rentals = data?.rentals || [];

  // Merge server & local whitelist
  const whitelist: WhitelistEntry[] = useMemo(() => {
    const serverWl = data?.whitelist || [];
    const map = new Map<string, WhitelistEntry>();
    serverWl.forEach((w: any) => map.set(w.id || w.email, w));
    localWhitelist.forEach((w: any) => map.set(w.id || w.email, w));
    return Array.from(map.values());
  }, [data?.whitelist, localWhitelist]);

  const units = data?.units || [];
  const notifications = data?.notifications || [];

  // Occupancy metrics
  const activeSessions = sessions.filter((s: any) => s.is_active);
  const parksInUse = activeSessions.length;
  const residentExcessSessions = activeSessions.filter((s: any) => s.session_type === 'resident_excess');
  const parksInUseByResident = residentExcessSessions.length;
  const totalVisitorParks = config.total_visitor_parks || 23;
  const availableParksIfResidentStays = Math.max(0, totalVisitorParks - parksInUse);
  const availableParksIfResidentMoves = Math.max(0, totalVisitorParks - (parksInUse - parksInUseByResident));
  const longestResidentSessionToBoot = residentExcessSessions.length > 0
    ? [...residentExcessSessions].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]
    : null;

  // ─── API mutations with Optimistic Local Updates ───
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
    const newSessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const startTime = new Date();
    const expectedEndTime = new Date(startTime.getTime() + durationHours * 3600 * 1000);

    const optimisticSession: ParkingSession = {
      id: newSessionId,
      carpark_id: carparkId,
      spot_id: carparkId,
      spot_number: spotNumber,
      user_id: currentUser?.id || 'usr-demo',
      created_by_user_id: currentUser?.id || 'usr-demo',
      unit_number: currentUser?.unit_number || 'Unit 4',
      vehicle_plate: vehiclePlate,
      session_type: sessionType,
      start_time: startTime.toISOString(),
      expected_end_time: expectedEndTime.toISOString(),
      is_active: true,
      boot_requested: false,
      visitor_name: visitorName,
      visitor_phone: visitorPhone,
      saved_guest_id: savedGuestId,
    };

    setLocalSessions((prev) => [optimisticSession, ...prev.filter((s) => s.spot_number !== spotNumber && s.spot_id !== carparkId)]);

    try {
      await apiPost('/api/sessions', {
        carparkId, spotNumber, vehiclePlate, durationHours, sessionType, visitorName, visitorPhone, savedGuestId,
      });
      invalidate();
      return true;
    } catch (e: any) {
      console.warn('Book spot API sync notice:', e?.message);
      return true;
    }
  }, [currentUser, invalidate]);

  const releaseSpot = useCallback(async (sessionId: string) => {
    setLocalSessions((prev) => prev.filter((s) => s.id !== sessionId));
    try {
      await apiPost(`/api/sessions/${sessionId}/release`, {});
      invalidate();
    } catch (e: any) { console.error(e); }
  }, [invalidate]);

  const addSavedGuest = useCallback(async (guest: { name: string; plate: string; phone?: string; make_model_color?: string }) => {
    const newGuest: SavedGuest = {
      id: `sg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: currentUser?.id || 'usr-demo',
      name: guest.name,
      plate: guest.plate,
      phone: guest.phone,
      make_model_color: guest.make_model_color,
      created_at: new Date().toISOString(),
    };
    setLocalSavedGuests((prev) => [newGuest, ...prev.filter((g) => g.plate !== guest.plate)]);

    try {
      await apiPost('/api/me/saved-guests', guest);
      invalidate();
    } catch (e: any) {
      console.warn('Add saved guest API sync notice:', e?.message);
    }
  }, [currentUser, invalidate]);

  const removeSavedGuest = useCallback(async (guestId: string) => {
    setLocalSavedGuests((prev) => prev.filter((g) => g.id !== guestId));
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

  const addWhitelistedUser = useCallback(async (email: string, name: string, unitNumber: string, phone: string, role: Role, assignedParks: number = 1) => {
    const newEntry: WhitelistEntry = {
      id: `wl-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim() || email.split('@')[0],
      unit_number: unitNumber.trim(),
      phone: phone.trim() || '',
      role,
      assigned_parks: assignedParks,
      added_at: new Date().toISOString(),
    };
    setLocalWhitelist((prev) => [...prev.filter((w) => w.email.toLowerCase() !== newEntry.email.toLowerCase()), newEntry]);

    try {
      await apiPost('/api/admin/whitelist', { email, name, unit_number: unitNumber, phone, role, assigned_parks: assignedParks });
      invalidate();
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }, [invalidate]);

  const removeWhitelistedUser = useCallback(async (whitelistId: string) => {
    setLocalWhitelist((prev) => prev.filter((w) => w.id !== whitelistId));
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
        unit_number: unitNumber,
        vehicle_plate: vehiclePlate,
        spot_number: spotNumber,
        violation_type: violationType,
        description,
        demerit_points: demeritPoints,
      });
      invalidate();
      return res;
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }, [invalidate]);

  const bootRequest = useCallback(async (sessionId: string) => {
    try {
      await apiPost('/api/mgmt/boot-request', { sessionId });
      invalidate();
    } catch (e: any) { console.error(e); }
  }, [invalidate]);

  const rentOutSpot = useCallback(async (spotNumber: string, weeks: number, pricePerWeek: number) => {
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

  const addNotificationLog = useCallback((_title: string, _message: string) => {}, []);
  const sendDirectAlert = useCallback(async (_unitNumber: string, _message: string, _alertType: 'in_app' | 'sms' | 'call') => Promise.resolve(), []);

  const logout = useCallback(async () => {
    try {
      setDemoUser(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('mvp-demo');
        localStorage.removeItem(SESSIONS_STORAGE_KEY);
        localStorage.removeItem(GUESTS_STORAGE_KEY);
      }
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
    site: data?.site || null,
    sections: data?.sections || [],
    carparks,
    sessions,
    vehicles,
    demerits,
    rentals,
    whitelist,
    units,
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
