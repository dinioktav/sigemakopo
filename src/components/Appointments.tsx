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
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
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
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    const qP = query(collection(db, 'patients'), orderBy('name', 'asc'));
    const unsubscribeP = onSnapshot(qP, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patients');
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
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <CalendarIcon size={13} className="text-purple-600" />
              Jadwal & Reservasi
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">Poli Gigi & Mulut</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold text-pink-600">SIGEMA KOPO</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Perjanjian & Reservasi Pasien</h1>
          <p className="text-xs text-slate-500">UPTD Puskesmas Kopo · Manajemen Antrean Kunjungan & Registrasi Online</p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-slate-100 p-0.5 rounded-lg flex border border-slate-200">
            <button 
              onClick={() => setView('list')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                view === 'list' ? "bg-white text-purple-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Daftar List
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                view === 'calendar' ? "bg-white text-purple-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Kalender
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <Plus size={15} />
            <span>Reservasi Baru</span>
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
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
              <header className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Formulir Reservasi Kunjungan Baru</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Penjadwalan Kunjungan Pemeriksaan Poli Gigi UPTD Puskesmas Kopo</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                  <X size={20} />
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

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                    <span>Simpan Jadwal Reservasi</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Mini - Filter & Stats */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Status Antrean Hari Ini</h3>
            <div className="space-y-2">
              {[
                { label: 'Terkonfirmasi', count: appointments.filter(a => a.status === 'Confirmed').length, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
                { label: 'Menunggu Konfirmasi', count: appointments.filter(a => a.status === 'Pending').length, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
                { label: 'Dibatalkan', count: appointments.filter(a => a.status === 'Cancelled').length, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
              ].map((stat, i) => (
                <div key={i} className={cn("p-2.5 rounded-lg border flex items-center justify-between", stat.bg)}>
                  <span className={cn("text-xs font-medium", stat.color)}>{stat.label}</span>
                  <span className={cn("text-sm font-bold font-mono", stat.color)}>{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0c1222] p-5 rounded-xl text-white shadow-xs border border-purple-900/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kuota Poli Gigi</span>
              <span className="text-[10px] font-mono bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded font-bold">Hari Ini</span>
            </div>
            <p className="text-2xl font-bold font-mono text-white">20 <span className="text-xs font-normal text-slate-400">/ hari</span></p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Sistem membatasi kuota kunjungan untuk menjamin sterilisasi alat klinis antar pasien.</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/70">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input 
                  type="text" 
                  placeholder="Cari nama pasien atau prosedur..." 
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-2xs"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="text-slate-400">Total Reservasi:</span>
                <span className="font-bold font-mono text-slate-800">{filteredAppointments.length}</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="p-4 hover:bg-sky-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-lg flex flex-col items-center justify-center shrink-0">
                      <span className="text-base font-bold font-mono text-slate-800 leading-none">
                        {apt.plannedDate ? new Date(apt.plannedDate).getDate() : '--'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5 font-mono">
                        {apt.plannedDate ? new Date(apt.plannedDate).toLocaleString('id-ID', { month: 'short' }) : '---'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xs font-bold text-slate-900">{apt.name}</h4>
                        <span className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider",
                          apt.status === 'Confirmed' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : 
                          apt.status === 'Pending' ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                        )}>
                          {apt.status === 'Confirmed' ? 'Terkonfirmasi' : apt.status === 'Pending' ? 'Menunggu' : apt.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">#{apt.patientStatus}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1 text-slate-600">
                          <AlertCircle size={12} className="text-sky-600" />
                          <span>{apt.procedure || 'Pemeriksaan Gigi'}</span>
                        </div>
                        {apt.phoneWA && (
                          <div className="flex items-center gap-1 font-mono text-slate-500">
                            <Phone size={12} className="text-slate-400" />
                            <span>{apt.phoneWA}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                      {apt.plannedDate}
                    </span>
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors">
                      Detail
                    </button>
                    <button className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors">
                      Check-in Poli
                    </button>
                  </div>
                </div>
              ))}

              {filteredAppointments.length === 0 && (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <CalendarIcon size={36} className="mx-auto stroke-[1.5] text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Belum ada reservasi terjadwal</p>
                  <p className="text-[11px] text-slate-400">Klik "Reservasi Baru" untuk menambahkan perjanjian pasien.</p>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
              <p className="text-[11px] text-slate-400 font-mono">Poli Pelayanan Kesehatan Gigi & Mulut · UPTD Puskesmas Kopo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
