import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const MOCK_APPOINTMENTS = [
  { id: 1, patient: 'Budi Santoso', time: '09:00', date: '2026-04-02', procedure: 'Scaling & Polishing', status: 'Confirmed', doctor: 'Drg. Ahmad' },
  { id: 2, patient: 'Siti Aminah', time: '10:30', date: '2026-04-02', procedure: 'Tumpatan Komposit', status: 'Pending', doctor: 'Drg. Ahmad' },
  { id: 3, patient: 'Andi Wijaya', time: '13:00', date: '2026-04-02', procedure: 'Konsultasi Rutin', status: 'Confirmed', doctor: 'Drg. Ahmad' },
  { id: 4, patient: 'Dewi Lestari', time: '15:00', date: '2026-04-02', procedure: 'Pencabutan Gigi', status: 'Cancelled', doctor: 'Drg. Ahmad' },
];

export const Appointments = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Perjanjian Reservasi</h1>
          <p className="text-navy/40 font-medium mt-1">Kelola jadwal kunjungan dan reservasi pasien.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-navy-50 p-1 rounded-xl flex">
            <button 
              onClick={() => setView('list')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                view === 'list' ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy"
              )}
            >
              List
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                view === 'calendar' ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy"
              )}
            >
              Kalender
            </button>
          </div>
          <button className="flex items-center justify-center gap-3 px-8 py-4 bg-navy text-pink rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all uppercase tracking-widest text-xs">
            <Plus size={20} />
            Reservasi Baru
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Mini - Filter & Stats */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-[2rem]">
            <h3 className="text-xs font-black text-navy uppercase tracking-[0.2em] mb-6">Status Hari Ini</h3>
            <div className="space-y-4">
              {[
                { label: 'Terkonfirmasi', count: 12, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Menunggu', count: 5, color: 'text-pink', bg: 'bg-pink-soft' },
                { label: 'Dibatalkan', count: 2, color: 'text-navy/40', bg: 'bg-navy-50' },
              ].map((stat, i) => (
                <div key={i} className={cn("p-4 rounded-2xl flex items-center justify-between", stat.bg)}>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", stat.color)}>{stat.label}</span>
                  <span className={cn("text-lg font-black", stat.color)}>{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-navy p-8 rounded-[2rem] text-white shadow-xl shadow-navy/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink/20 rounded-full blur-3xl"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Slot Tersedia</h3>
            <p className="text-4xl font-black tracking-tighter text-pink">08</p>
            <p className="text-[10px] font-bold opacity-40 mt-4 leading-relaxed">Sisa slot reservasi untuk sesi sore hari ini.</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-navy/5 flex flex-col md:flex-row gap-6 bg-navy-50/10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" size={20} />
                <input 
                  type="text" 
                  placeholder="Cari nama pasien atau dokter..." 
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium shadow-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm">
                <button className="p-3 text-navy/40 hover:text-pink transition-all"><ChevronLeft size={20} /></button>
                <span className="text-xs font-black text-navy uppercase tracking-widest">Kamis, 2 April 2026</span>
                <button className="p-3 text-navy/40 hover:text-pink transition-all"><ChevronRight size={20} /></button>
              </div>
            </div>

            <div className="divide-y divide-navy/5">
              {MOCK_APPOINTMENTS.map((apt) => (
                <div key={apt.id} className="p-8 hover:bg-pink-soft/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-navy-50 rounded-2xl flex flex-col items-center justify-center border border-navy/5 group-hover:bg-white transition-colors">
                      <span className="text-lg font-black text-navy leading-none">{apt.time}</span>
                      <span className="text-[8px] font-black text-navy/30 uppercase tracking-widest mt-1">WIB</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-sm font-black text-navy uppercase tracking-tight">{apt.patient}</h4>
                        <span className={cn(
                          "text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
                          apt.status === 'Confirmed' ? "bg-green-50 text-green-600" : 
                          apt.status === 'Pending' ? "bg-pink-soft text-pink" : "bg-navy-50 text-navy/40"
                        )}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-navy/40">
                          <AlertCircle size={12} className="text-pink" />
                          {apt.procedure}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-navy/40">
                          <User size={12} className="text-navy/20" />
                          {apt.doctor}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="px-6 py-3 bg-white border-2 border-navy/5 hover:border-pink hover:text-pink rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                      Detail
                    </button>
                    <button className="px-6 py-3 bg-navy text-pink rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-navy-light transition-all shadow-lg shadow-navy/10">
                      Check-in
                    </button>
                    <button className="p-3 text-navy/20 hover:text-navy transition-all">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-8 bg-navy-50/30 text-center">
              <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.3em]">Akhir dari jadwal hari ini</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
