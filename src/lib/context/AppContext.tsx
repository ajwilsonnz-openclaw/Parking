'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Carpark,
  ParkingSession,
  User,
  UnitVehicle,
  DemeritRecord,
  SpotRental,
  SystemConfig,
  WhitelistEntry,
  Role,
  SessionType,
  SavedGuest,
} from '@/types';
import {
  INITIAL_CONFIG,
  INITIAL_USERS,
  INITIAL_VEHICLES,
  INITIAL_CARPARKS,
  INITIAL_SESSIONS,
  INITIAL_DEMERITS,
  INITIAL_SPOT_RENTALS,
  INITIAL_WHITELIST,
} from '@/lib/mockData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: Role) => void;
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;
  carparks: Carpark[];
  sessions: ParkingSession[];
  vehicles: UnitVehicle[];
  demerits: DemeritRecord[];
  rentals: SpotRental[];
  whitelist: WhitelistEntry[];
  favourites: string[];
  toggleFavourite: (spotNumber: string) => void;
  bookSpot: (
    spotId: string,
    spotNumber: string,
    vehiclePlate: string,
    durationHours: number,
    sessionType: SessionType,
    visitorName?: string,
    visitorPhone?: string
  ) => boolean;
  releaseSpot: (sessionId: string) => void;
  rentOutSpot: (spotNumber: string, availableWeeks: number, pricePerWeek: number) => void;
  bookRentedSpot: (rentalId: string, renterPlate: string) => void;
  issueDemerit: (
    unitNumber: string,
    vehiclePlate: string,
    spotNumber: string,
    violationType: DemeritRecord['violation_type'],
    description: string,
    demeritPoints: number
  ) => void;
  addWhitelistedUser: (email: string, name: string, unitNumber: string, phone: string, role: Role) => void;
  savedGuests: SavedGuest[];
  addSavedGuest: (guest: Omit<SavedGuest, 'id' | 'user_id' | 'created_at'>) => void;
  removeSavedGuest: (guestId: string) => void;
  // Computed Occupancy metrics
  parksInUse: number;
  parksInUseByResident: number;
  availableParksIfResidentStays: number;
  availableParksIfResidentMoves: number;
  longestResidentSessionToBoot: ParkingSession | null;
  sendDirectAlert: (unitNumber: string, message: string, alertType: 'in_app' | 'sms' | 'call') => void;
  notificationLog: { id: string; title: string; message: string; timestamp: string }[];
  addNotificationLog: (title: string, message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_CARPARKS);
  const [sessions, setSessions] = useState<ParkingSession[]>(INITIAL_SESSIONS);
  const [vehicles, setVehicles] = useState<UnitVehicle[]>(INITIAL_VEHICLES);
  const [demerits, setDemerits] = useState<DemeritRecord[]>(INITIAL_DEMERITS);
  const [rentals, setRentals] = useState<SpotRental[]>(INITIAL_SPOT_RENTALS);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>(INITIAL_WHITELIST);
  const [savedGuests, setSavedGuests] = useState<SavedGuest[]>([
    {
      id: 'sg-1',
      user_id: 'usr-1',
      name: 'Mark Taylor',
      phone: '+64 21 555 9911',
      plate: 'MTT123',
      make_model_color: 'White Toyota Camry',
      created_at: new Date().toISOString(),
    },
  ]);
  const [favourites, setFavourites] = useState<string[]>(['V-01', 'V-04']);
  const [notificationLog, setNotificationLog] = useState<{ id: string; title: string; message: string; timestamp: string }[]>([
    { id: 'notif-1', title: 'Welcome to MV Parking', message: 'Your PWA is active and configured for Millennium Village.', timestamp: new Date().toISOString() }
  ]);

  useEffect(() => {
    const savedFavs = localStorage.getItem('mv_parking_favs');
    if (savedFavs) {
      try { setFavourites(JSON.parse(savedFavs)); } catch (e) {}
    }
  }, []);

  const toggleFavourite = (spotNumber: string) => {
    setFavourites((prev) => {
      const next = prev.includes(spotNumber) ? prev.filter((s) => s !== spotNumber) : [...prev, spotNumber];
      localStorage.setItem('mv_parking_favs', JSON.stringify(next));
      return next;
    });
  };

  const switchRole = (role: Role) => {
    const found = INITIAL_USERS.find((u) => u.role === role) || {
      id: `usr-${role}`,
      email: `${role}@millennium.com`,
      name: `${role.toUpperCase()} User`,
      unit_number: role === 'user' ? 'Unit 402' : 'Management Office',
      phone: '+64 21 555 0100',
      role,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    setCurrentUser(found);
    addNotificationLog('Role Switched', `Now operating under ${role.toUpperCase()} access privileges.`);
  };

  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      // Regenerate visitor carparks if total_visitor_parks or spot_prefix changed
      if (newConfig.total_visitor_parks !== undefined || newConfig.spot_prefix !== undefined || newConfig.area_divisions !== undefined) {
        const total = updated.total_visitor_parks;
        const prefix = updated.spot_prefix || 'V-';
        const areas = updated.area_divisions.length > 0 ? updated.area_divisions : ['Ground Floor', 'Basement Level 1'];

        const newParks: Carpark[] = Array.from({ length: total }, (_, i) => {
          const num = (i + 1).toString().padStart(2, '0');
          const areaIndex = Math.floor((i / total) * areas.length);
          const section = areas[areaIndex] || areas[0];
          return {
            id: `spot-${num}`,
            spot_number: `${prefix}${num}`,
            section,
            status: (i === 2 || i === 4 || i === 7 ? 'occupied' : 'available') as Carpark['status'],
            is_rentable_private: false,
            is_favourite: i === 0 || i === 3,
          };
        });
        setCarparks(newParks);
      }
      return updated;
    });
    addNotificationLog('Admin Setting Updated', 'System configuration updated successfully.');
  };

  const addNotificationLog = (title: string, message: string) => {
    setNotificationLog((prev) => [
      { id: Date.now().toString(), title, message, timestamp: new Date().toISOString() },
      ...prev.slice(0, 19),
    ]);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body: message, icon: '/icons/icon-192.png' });
      } catch (e) {}
    }
  };

  // Occupancy metrics calculations
  const activeVisitorSessions = sessions.filter((s) => s.is_active);
  const parksInUse = activeVisitorSessions.length;
  const residentExcessSessions = activeVisitorSessions.filter((s) => s.session_type === 'resident_excess');
  const parksInUseByResident = residentExcessSessions.length;

  const totalVisitorParks = config.total_visitor_parks;
  const availableParksIfResidentStays = Math.max(0, totalVisitorParks - parksInUse);
  const availableParksIfResidentMoves = Math.max(0, totalVisitorParks - (parksInUse - parksInUseByResident));

  const longestResidentSessionToBoot =
    residentExcessSessions.length > 0
      ? [...residentExcessSessions].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        )[0]
      : null;

  const bookSpot = (
    spotId: string,
    spotNumber: string,
    vehiclePlate: string,
    durationHours: number,
    sessionType: SessionType,
    visitorName?: string,
    visitorPhone?: string
  ): boolean => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationHours * 3600 * 1000);

    const newSession: ParkingSession = {
      id: `sess-${Date.now()}`,
      spot_id: spotId,
      spot_number: spotNumber,
      unit_number: currentUser?.unit_number || 'Unit 402',
      vehicle_plate: vehiclePlate,
      session_type: sessionType,
      start_time: startTime.toISOString(),
      expected_end_time: endTime.toISOString(),
      is_active: true,
      created_by_user_id: currentUser?.id || 'usr-1',
      visitor_name: visitorName,
      visitor_phone: visitorPhone,
    };

    setSessions((prev) => [newSession, ...prev]);

    setCarparks((prev) =>
      prev.map((spot) => (spot.id === spotId ? { ...spot, status: 'occupied' } : spot))
    );

    addNotificationLog(
      'Carpark Booked!',
      `Spot ${spotNumber} booked for plate ${vehiclePlate} (${sessionType.toUpperCase()}) for ${durationHours}h.`
    );
    return true;
  };

  const releaseSpot = (sessionId: string) => {
    const targetSession = sessions.find((s) => s.id === sessionId);
    if (!targetSession) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, is_active: false, end_time: new Date().toISOString() } : s
      )
    );

    setCarparks((prev) =>
      prev.map((spot) =>
        spot.id === targetSession.spot_id ? { ...spot, status: 'available' } : spot
      )
    );

    addNotificationLog('Spot Released', `Session for ${targetSession.spot_number} has been completed.`);
  };

  const rentOutSpot = (spotNumber: string, availableWeeks: number, pricePerWeek: number) => {
    const now = new Date();
    const until = new Date(now.getTime() + availableWeeks * 7 * 24 * 3600 * 1000);

    const newRental: SpotRental = {
      id: `rent-${Date.now()}`,
      owner_unit_number: currentUser?.unit_number || 'Unit 402',
      spot_number: spotNumber,
      available_from: now.toISOString(),
      available_until: until.toISOString(),
      price_per_week: Math.min(pricePerWeek, config.max_weekly_rental_price),
      is_free: pricePerWeek === 0,
      status: 'listed',
    };

    setRentals((prev) => [newRental, ...prev]);
    addNotificationLog(
      'Spot Listed for Rent',
      `${spotNumber} listed for rent at ${pricePerWeek === 0 ? 'FREE' : `$${pricePerWeek}/wk`}.`
    );
  };

  const bookRentedSpot = (rentalId: string, renterPlate: string) => {
    setRentals((prev) =>
      prev.map((r) =>
        r.id === rentalId
          ? {
              ...r,
              status: 'booked',
              renter_unit_number: currentUser?.unit_number || 'Unit 402',
              renter_plate: renterPlate,
            }
          : r
      )
    );
    addNotificationLog('Spot Rented', `Successfully reserved rented spot for plate ${renterPlate}.`);
  };

  const issueDemerit = (
    unitNumber: string,
    vehiclePlate: string,
    spotNumber: string,
    violationType: DemeritRecord['violation_type'],
    description: string,
    demeritPoints: number
  ) => {
    const existingUnitDemerits = demerits.filter((d) => d.unit_number === unitNumber);
    const totalPoints = existingUnitDemerits.reduce((sum, d) => sum + d.demerit_points, 0) + demeritPoints;

    const fineAmount = totalPoints >= config.demerit_fine_threshold ? config.demerit_fine_amount : 0;

    const newDemerit: DemeritRecord = {
      id: `dem-${Date.now()}`,
      unit_number: unitNumber,
      vehicle_plate: vehiclePlate,
      spot_number: spotNumber,
      violation_type: violationType,
      description,
      demerit_points: demeritPoints,
      fine_amount: fineAmount,
      status: 'issued',
      created_at: new Date().toISOString(),
    };

    setDemerits((prev) => [newDemerit, ...prev]);
    addNotificationLog(
      'Demerit Notice Issued',
      `${unitNumber} issued ${demeritPoints} pts for ${violationType.toUpperCase()}.${
        fineAmount > 0 ? ` $${fineAmount} BodyCorp fine triggered!` : ''
      }`
    );
  };

  const addWhitelistedUser = (
    email: string,
    name: string,
    unitNumber: string,
    phone: string,
    role: Role
  ) => {
    const newEntry: WhitelistEntry = {
      id: `w-${Date.now()}`,
      email,
      name,
      unit_number: unitNumber,
      phone,
      role,
      added_at: new Date().toISOString(),
    };

    setWhitelist((prev) => [newEntry, ...prev]);
    addNotificationLog('User Whitelisted', `${email} (${unitNumber}) added with ${role.toUpperCase()} role.`);
  };

  const addSavedGuest = (guest: Omit<SavedGuest, 'id' | 'user_id' | 'created_at'>) => {
    const newGuest: SavedGuest = {
      id: `sg-${Date.now()}`,
      user_id: currentUser?.id || 'usr-1',
      ...guest,
      created_at: new Date().toISOString(),
    };
    setSavedGuests((prev) => [newGuest, ...prev]);
    addNotificationLog('Regular visitor saved', `${guest.name} added to your regular visitors.`);
  };

  const removeSavedGuest = (guestId: string) => {
    setSavedGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const sendDirectAlert = (unitNumber: string, message: string, alertType: 'in_app' | 'sms' | 'call') => {
    addNotificationLog(`Direct Alert to ${unitNumber}`, `[${alertType.toUpperCase()}] ${message}`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        config,
        updateConfig,
        carparks,
        sessions,
        vehicles,
        demerits,
        rentals,
        whitelist,
        savedGuests,
        addSavedGuest,
        removeSavedGuest,
        favourites,
        toggleFavourite,
        bookSpot,
        releaseSpot,
        rentOutSpot,
        bookRentedSpot,
        issueDemerit,
        addWhitelistedUser,
        parksInUse,
        parksInUseByResident,
        availableParksIfResidentStays,
        availableParksIfResidentMoves,
        longestResidentSessionToBoot,
        sendDirectAlert,
        notificationLog,
        addNotificationLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
