import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  X,
  Save,
  RefreshCw,
  Phone,
  CreditCard,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';

export const Appointments = ({ userData }: { userData: any }) => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // New Appointment Form State
  const [patientStatus, setPatientStatus] = useState<'Baru' | 'Lama'>('Lama');
  const [formData, setFormData] = useState({
    plannedDate: '',
    nik: '',
    name: '',
    birthPlace: '',
    birthDate: '',
    gender: 'Laki-laki',
    phoneWA: '',
    patientId: '', // For old patient
    procedure: 'Pemeriksaan Umum'
  });

  useEffect(() => {
    const qA = query(collection(db, 'appointments'), orderBy('plannedDate', 'asc'));
    const unsubscribeA = onSnapshot(qA, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qP = query(collection(db, 'patients'), orderBy('name', 'asc'));
    const unsubscribeP = onSnapshot(qP, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeA();
      unsubscribeP();
    };
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        patientStatus,
        status: 'Pending',
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'appointments'), dataToSave);
      setIsModalOpen(false);
      // Reset form
      setFormData({
        plannedDate: '',
        nik: '',
        name: '',
        birthPlace: '',
        birthDate: '',
        gender: 'Laki-laki',
        phoneWA: '',
        patientId: '',
        procedure: 'Pemeriksaan Umum'
      });
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Gagal membuat reservasi.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const isAdminView = userData.role !== 'Pasien';
    const matchesSearch = apt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        apt.patientId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (isAdminView) return matchesSearch;
    // For patients, only show their own (matched by name or later by UID if linked)
    return matchesSearch && (apt.name === userData.fullName);
  });

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-navy tracking-tight uppercase">Perjanjian Reservasi</h1>
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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-navy text-pink rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={20} />
            Reservasi Baru
          </button>
        </div>
      </header>

      {/* Reservation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <header className="p-8 bg-navy text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Reservasi Baru</h2>
                  <p className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mt-1">Jadwalkan Kunjungan Kesehatan Gigi</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </header>

              <form onSubmit={handleCreateAppointment} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Tanggal Rencana */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Tanggal Rencana Kunjungan</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20" size={18} />
                    <input 
                      type="date" required
                      className="w-full pl-14 pr-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold"
                      value={formData.plannedDate}
                      onChange={e => setFormData({...formData, plannedDate: e.target.value})}
                    />
                  </div>
                </div>

                {/* Status Pasien */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Status Pasien</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setPatientStatus('Lama')}
                      className={cn(
                        "py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2",
                        patientStatus === 'Lama' ? "bg-navy text-gold border-gold" : "bg-navy-50 text-navy/40 border-transparent hover:border-navy/10"
                      )}
                    >
                      Pasien Lama
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPatientStatus('Baru')}
                      className={cn(
                        "py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2",
                        patientStatus === 'Baru' ? "bg-navy text-gold border-gold" : "bg-navy-50 text-navy/40 border-transparent hover:border-navy/10"
                      )}
                    >
                      Pasien Baru
                    </button>
                  </div>
                </div>

                {patientStatus === 'Baru' ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">NIK</label>
                      <input 
                        type="text" required maxLength={16}
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold"
                        value={formData.nik}
                        onChange={e => setFormData({...formData, nik: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Nama Lengkap</label>
                      <input 
                        type="text" required
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Tempat Lahir</label>
                        <input 
                          type="text" required
                          className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold"
                          value={formData.birthPlace}
                          onChange={e => setFormData({...formData, birthPlace: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Tanggal Lahir</label>
                        <input 
                          type="date" required
                          className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold"
                          value={formData.birthDate}
                          onChange={e => setFormData({...formData, birthDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Jenis Kelamin</label>
                      <select 
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold appearance-none"
                        value={formData.gender}
                        onChange={e => setFormData({...formData, gender: e.target.value})}
                      >
                        <option>Laki-laki</option>
                        <option>Perempuan</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">No WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20" size={18} />
                        <input 
                          type="tel" required
                          className="w-full pl-14 pr-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold"
                          placeholder="0812..."
                          value={formData.phoneWA}
                          onChange={e => setFormData({...formData, phoneWA: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Pilih Pasien (No RM / Nama / TTL)</label>
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20" size={18} />
                        <select 
                          required
                          className="w-full pl-14 pr-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold appearance-none transition-all"
                          value={formData.patientId}
                          onChange={e => {
                            const p = patients.find(x => x.id === e.target.value);
                            setFormData({
                              ...formData, 
                              patientId: e.target.value,
                              name: p?.name || '',
                              phoneWA: p?.phone || formData.phoneWA
                            });
                          }}
                        >
                          <option value="">-- Cari Pasien --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.rmNumber || 'No RM'} | {p.name} | {p.birthPlace}, {p.birthDate}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">No WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20" size={18} />
                        <input 
                          type="tel" required
                          className="w-full pl-14 pr-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold"
                          placeholder="0812..."
                          value={formData.phoneWA}
                          onChange={e => setFormData({...formData, phoneWA: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-5 bg-navy text-gold rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    Buat Reservasi
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-10 py-5 bg-white border-2 border-navy/5 text-navy/40 rounded-2xl font-black hover:border-pink hover:text-pink transition-all uppercase tracking-widest text-xs"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Mini - Filter & Stats */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-[2rem]">
            <h3 className="text-xs font-black text-navy uppercase tracking-[0.2em] mb-6">Status Hari Ini</h3>
            <div className="space-y-4">
              {[
                { label: 'Terkonfirmasi', count: 0, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Menunggu', count: 0, color: 'text-pink', bg: 'bg-pink-soft' },
                { label: 'Dibatalkan', count: 0, color: 'text-navy/40', bg: 'bg-navy-50' },
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
            <p className="text-4xl font-black tracking-tighter text-pink">00</p>
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
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="p-8 hover:bg-pink-soft/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-navy-50 rounded-2xl flex flex-col items-center justify-center border border-navy/5 group-hover:bg-white transition-colors">
                      <span className="text-lg font-black text-navy leading-none">
                        {apt.plannedDate ? new Date(apt.plannedDate).getDate() : '--'}
                      </span>
                      <span className="text-[8px] font-black text-navy/30 uppercase tracking-widest mt-1">
                        {apt.plannedDate ? new Date(apt.plannedDate).toLocaleString('default', { month: 'short' }) : '---'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-sm font-black text-navy uppercase tracking-tight">{apt.name}</h4>
                        <span className={cn(
                          "text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest",
                          apt.status === 'Confirmed' ? "bg-green-50 text-green-600" : 
                          apt.status === 'Pending' ? "bg-pink-soft text-pink" : "bg-navy-50 text-navy/40"
                        )}>
                          {apt.status}
                        </span>
                        <span className="text-[10px] font-bold text-navy/20">#{apt.patientStatus}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-navy/40">
                          <AlertCircle size={12} className="text-pink" />
                          {apt.procedure}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-navy/40">
                          <Phone size={12} className="text-navy/20" />
                          {apt.phoneWA}
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
