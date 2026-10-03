import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_CAMPUS_LOCATIONS } from '../utils/storage';
import {
  X,
  MapPin,
  Navigation,
  CheckCircle,
  Bell,
  Building2,
  Compass,
  Sparkles
} from 'lucide-react';

interface LocationReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationReminderModal: React.FC<LocationReminderModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    userCoords,
    refreshUserLocation,
    triggerLocationReminder,
    triggerPushNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<'hotspots' | 'settings'>('hotspots');
  const [lastSimulatedLocation, setLastSimulatedLocation] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateArrival = (locName: string) => {
    triggerLocationReminder(locName);
    setLastSimulatedLocation(locName);
    setTimeout(() => setLastSimulatedLocation(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                Pengingat Berbasis Lokasi Kampus
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Geofence Alert & Deadline Push Notification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {lastSimulatedLocation && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                Notifikasi push berbasis lokasi untuk <strong>{lastSimulatedLocation}</strong> berhasil dipicu! Periksa lonceng notifikasi di atas.
              </span>
            </div>
          )}

          {/* Current GPS Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Navigation className="w-4 h-4 text-indigo-500 animate-pulse" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Status GPS & Sensor Perangkat
                </p>
                <p className="text-[11px] text-slate-400">
                  {userCoords
                    ? `Lat: ${userCoords.lat.toFixed(4)}, Lng: ${userCoords.lng.toFixed(4)} (Zona Kampus)`
                    : 'Mendeteksi koordinat lokasi saat ini...'}
                </p>
              </div>
            </div>
            <button
              onClick={refreshUserLocation}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              Perbarui GPS
            </button>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            Sistem secara otomatis memberikan notifikasi pengingat tugas yang mendesak ketika mahasiswa tiba di fasilitas kampus tertentu (Lab, Perpustakaan, atau Ruang Kuliah) untuk memacu pengerjaan tugas bersama.
          </p>

          {/* Hotspots Simulation */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Titik Fasilitas Kampus Terdaftar (Geofence):
            </h4>

            <div className="space-y-2">
              {DEFAULT_CAMPUS_LOCATIONS.map(loc => (
                <div
                  key={loc.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 transition-all flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {loc.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {loc.description}
                    </p>
                    <span className="inline-block mt-1 text-[10px] text-slate-400 font-mono">
                      Radius Pemantauan: {loc.radiusMeters} meter
                    </span>
                  </div>

                  <button
                    onClick={() => handleSimulateArrival(loc.name)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shrink-0 shadow-sm"
                    title="Simulasikan kehadiran Anda di lokasi ini"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Uji Masuk Lokasi</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Push Notification Permission */}
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-[11px] text-blue-900 dark:text-blue-200">
                Izin Web Push Notification Browser
              </span>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'Notification' in window) {
                  Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                      triggerPushNotification('SIM-Tugas Aktif!', 'Notifikasi push browser Anda telah aktif.');
                    }
                  });
                }
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Aktifkan
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
