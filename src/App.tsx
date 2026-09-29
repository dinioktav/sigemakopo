import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Calendar, 
  BarChart3, 
  ShieldCheck, 
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Home,
  ChevronRight,
  Activity,
  TrendingUp,
  AlertTriangle,
  Receipt,
  FileCheck,
  Video,
  RefreshCw,
  Camera,
  User,
  Briefcase,
  Save,
  Download,
  Mic
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Login } from './components/Login';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, getDocs, deleteDoc, where } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';

// Components
import { PatientList } from './components/PatientList';
import { DentalHygieneForm } from './components/DentalHygieneForm';
import { Billing } from './components/Billing';
import { InformedConsent } from './components/InformedConsent';
import { Appointments } from './components/Appointments';
import { Security } from './components/Security';
import { DentalEducation } from './components/DentalEducation';
import { UserManagement } from './components/UserManagement';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';

const MOCK_CHART_DATA: any[] = [];

const MOCK_PIE_DATA: any[] = [];

const PERMISSIONS: Record<string, string[]> = {
  'Super Admin': ['dashboard', 'patients', 'records', 'informed-consent', 'billing', 'education', 'appointments', 'reports', 'security', 'settings'],
  'Administrasi Umum': ['dashboard', 'patients', 'billing', 'appointments', 'reports'],
  'Terapis Gigi dan Mulut': ['dashboard', 'patients', 'records', 'informed-consent', 'billing', 'education', 'appointments', 'reports'],
  'Dosen Pembimbing': ['dashboard', 'patients', 'records', 'informed-consent', 'billing', 'education', 'appointments', 'reports'],
  'Pasien': ['appointments', 'education'],
};

const ProfilePage = ({ userData, setUserData }: { userData: any, setUserData: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    ...userData,
    jenisTenaga: userData.jenisTenaga || userData.role
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          fullName: formData.fullName,
          jenisTenaga: formData.jenisTenaga,
          photoURL: formData.photoURL,
          role: userData.role, // Keep system role unchanged
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        setUserData(formData);
        setIsEditing(false);
        alert("Profil tenaga medis berhasil diperbarui!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Profil Tenaga Medis</h1>
        <p className="text-xs text-slate-500 mt-0.5">Identitas profesional dan kredensial praktisi UPTD Puskesmas Kopo.</p>
      </header>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="relative group shrink-0">
              <div className="w-32 h-32 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-xs relative">
                <img 
                  src={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.fullName}`} 
                  alt="Profile" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <label className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center cursor-pointer transition-opacity">
                    <Camera className="text-white mb-1" size={20} />
                    <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Ubah Foto</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, photoURL: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nama Lengkap & Gelar</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-sm transition-all font-medium disabled:opacity-75 disabled:bg-slate-100/60" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Jenis Tenaga Medis</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      disabled={!isEditing}
                      value={formData.jenisTenaga}
                      onChange={(e) => setFormData({ ...formData, jenisTenaga: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-sm transition-all font-medium disabled:opacity-75 disabled:bg-slate-100/60 appearance-none"
                    >
                      <option value="Administrasi Umum">Administrasi Umum</option>
                      <option value="Terapis Gigi dan Mulut">Terapis Gigi dan Mulut</option>
                      <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                      <option value="Pasien">Pasien</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Hak Akses Sistem</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-purple-700">{userData.role}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] text-slate-500">Dikelola oleh Super Administrator</span>
                  </div>
                </div>
                <ShieldCheck className="text-pink-600" size={20} />
              </div>

              <div className="pt-2 flex gap-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 shadow-sm transition-all text-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                      Simpan Perubahan
                    </button>
                    <button 
                      onClick={() => {
                        setFormData(userData);
                        setIsEditing(false);
                      }}
                      disabled={isSaving}
                      className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-all text-xs disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-[#0c1222] text-white rounded-lg font-semibold hover:bg-purple-950 shadow-sm transition-all text-xs"
                  >
                    Edit Profil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    visitsToday: 0,
    pendingBilling: 0,
    activeQueue: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [patientsMap, setPatientsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [queueSearch, setQueueSearch] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    // Patients Stats & Mapping
    const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
      const total = snapshot.size;
      const pMap: Record<string, any> = {};
      snapshot.docs.forEach(d => {
        pMap[d.id] = { id: d.id, ...d.data() };
      });
      setPatientsMap(pMap);
      setStats(prev => ({ ...prev, totalPatients: total }));
    });

    // Records Stats
    const unsubRecords = onSnapshot(collection(db, 'dental_records'), (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const visitsToday = records.filter((r: any) => r.visitDate === today).length;
      
      const pendingSum = records.reduce((sum: number, r: any) => {
        if (r.status === 'draft') return sum + (r.billing?.total || 0);
        return sum;
      }, 0);

      setStats(prev => ({ 
        ...prev, 
        visitsToday, 
        pendingBilling: pendingSum,
        activeQueue: records.filter((r: any) => r.status === 'draft').length
      }));

      // Sort recent records (today's or newest first)
      const sortedRecords = [...records].sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.visitDate || 0).getTime();
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.visitDate || 0).getTime();
        return dateB - dateA;
      }).slice(0, 8);

      setRecentRecords(sortedRecords);

      // Chart Data (Last 6 Months)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
          month: d.getMonth() + 1,
          year: d.getFullYear(),
          name: d.toLocaleString('id-ID', { month: 'short' }),
          dmft: 0,
          ohis: 0,
          count: 0
        };
      }).reverse();

      records.forEach((r: any) => {
        const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.visitDate);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const monthData = last6Months.find(m => m.month === month && m.year === year);
        if (monthData) {
          monthData.dmft += r.indices?.dmft?.total || 0;
          monthData.ohis += r.indices?.ohis?.total || 0;
          monthData.count++;
        }
      });

      setChartData(last6Months.map(m => ({
        ...m,
        dmft: m.count > 0 ? parseFloat((m.dmft / m.count).toFixed(2)) : 0,
        ohis: m.count > 0 ? parseFloat((m.ohis / m.count).toFixed(2)) : 0
      })));

      // Pie Data (Diagnosis Categories)
      const categories: Record<string, number> = {};
      let totalItems = 0;
      records.forEach((r: any) => {
        r.askesgilut?.diagnoses?.forEach((d: any) => {
          if (d.kebutuhan) {
            categories[d.kebutuhan] = (categories[d.kebutuhan] || 0) + 1;
            totalItems++;
          }
        });
      });

      const pieColors = ['#7c3aed', '#ec4899', '#0c1222', '#a78bfa', '#f472b6'];
      const pie = Object.entries(categories)
        .map(([name, value], i) => ({
          name,
          value: parseFloat(((value / (totalItems || 1)) * 100).toFixed(1)),
          color: pieColors[i % pieColors.length]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setPieData(pie);
      setLoading(false);
    });

    return () => {
      unsubPatients();
      unsubRecords();
    };
  }, []);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-purple-600" size={36} />
      </div>
    );
  }

  // Filter queue records
  const filteredQueue = recentRecords.filter((r: any) => {
    if (!queueSearch) return true;
    const p = patientsMap[r.patientId];
    const search = queueSearch.toLowerCase();
    return (
      p?.name?.toLowerCase().includes(search) ||
      p?.rmNumber?.toLowerCase().includes(search) ||
      r.id.toLowerCase().includes(search)
    );
  });

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Clinical Shift Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-purple-50/60 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
              Shift Aktif: Pelayanan Rawat Jalan Poli Gigi
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Dashboard Pelayanan Asuhan Kesehatan Gigi & Mulut
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            UPTD Puskesmas Kopo · <span className="font-medium text-slate-700">{currentDateFormatted}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link 
            to="/patients" 
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold transition-all shadow-2xs"
          >
            <Users size={14} className="text-purple-600" />
            + Pasien Baru
          </Link>
          <Link 
            to="/records" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-purple-600/20"
          >
            <Plus size={14} />
            Mulai Asuhan Pasien
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pasien Terdaftar', value: stats.totalPatients.toLocaleString('id-ID'), icon: Users, subtext: 'Rekam Medis Aktif', theme: 'purple' },
          { label: 'Kunjungan Hari Ini', value: stats.visitsToday.toString(), icon: Calendar, subtext: 'Pasien Rawat Jalan', theme: 'pink' },
          { label: 'Dalam Antrean / Draft', value: stats.activeQueue.toString(), icon: Activity, subtext: 'Memerlukan Tindakan', theme: 'navy' },
          { label: 'Billing Pending / Kasir', value: `Rp ${stats.pendingBilling.toLocaleString('id-ID')}`, icon: Receipt, subtext: 'Estimasi Pelayanan', theme: 'gradient' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1 font-mono tabular-nums">{stat.value}</p>
              </div>
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                stat.theme === 'purple' ? "bg-purple-50 text-purple-600 border border-purple-200" :
                stat.theme === 'pink' ? "bg-pink-50 text-pink-600 border border-pink-200" :
                stat.theme === 'navy' ? "bg-slate-900 text-white" :
                "bg-gradient-to-tr from-purple-100 to-pink-100 text-purple-800 border border-purple-200"
              )}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span>{stat.subtext}</span>
              <span className={cn(
                "font-semibold",
                stat.theme === 'pink' ? "text-pink-600" : "text-purple-600"
              )}>Terkini</span>
            </p>
          </div>
        ))}
      </div>

      {/* Epidemiological Trend & Human Needs Model Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Epidemiological WHO Index Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Tren Indikator Epidemiologi (Rerata WHO)</h2>
              <p className="text-xs text-slate-500">Evaluasi 6 bulan terakhir: DMF-T (Karies Gigi) & OHI-S (Kebersihan Mulut)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-purple-600"></span>
                <span className="text-slate-600 font-medium">DMF-T</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-pink-500"></span>
                <span className="text-slate-600 font-medium">OHI-S</span>
              </div>
            </div>
          </div>

          <div className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', fontSize: '12px' }}
                  cursor={{ fill: '#faf5ff' }}
                />
                <Bar dataKey="dmft" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={22} name="DMF-T" />
                <Bar dataKey="ohis" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={22} name="OHI-S" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Reference Guideline Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">Tolok Ukur WHO: </span>
              <span>OHI-S Baik (0.0 - 1.2) · Sedang (1.3 - 3.0) · Buruk (3.1 - 6.0)</span>
            </div>
            <div className="text-purple-600 font-medium">Target puskesmas: DMF-T $\le 3$</div>
          </div>
        </div>

        {/* Right: Human Needs Model / Dental Hygiene Diagnosis Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Sebaran Diagnosis Asuhan Gigi</h2>
              <p className="text-xs text-slate-500">Berdasarkan 8 Kebutuhan Manusia (Human Needs Model)</p>
            </div>

            {pieData.length > 0 ? (
              <>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={58}
                        outerRadius={78}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-purple-50/50 transition-colors">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-600 truncate font-medium max-w-[170px]">{item.name}</span>
                      </div>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-center text-slate-400 text-xs italic">
                Belum ada data diagnosis askesgilut yang tercatat.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Patient Queue / Pelayanan & Antrean Terkini */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Antrean & Riwayat Pelayanan Terkini</h2>
            <p className="text-xs text-slate-500">Daftar pemeriksaan pasien rawat jalan hari ini di Poli Gigi.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Cari pasien / No RM..."
              value={queueSearch}
              onChange={(e) => setQueueSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <th className="px-5 py-3 w-12 text-center">No</th>
                <th className="px-5 py-3">No RM</th>
                <th className="px-5 py-3">Nama Pasien</th>
                <th className="px-5 py-3">Tanggal Kunjungan</th>
                <th className="px-5 py-3">Indeks DMF-T / OHI-S</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.length > 0 ? (
                filteredQueue.map((record: any, index: number) => {
                  const patient = patientsMap[record.patientId];
                  const isFinal = record.status === 'final';
                  const dmft = record.indices?.dmft?.total || 0;
                  const ohis = record.indices?.ohis?.total || 0;
                  
                  return (
                    <tr key={record.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-5 py-3.5 text-center text-slate-400 font-mono">{index + 1}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-medium text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {patient?.rmNumber || 'RM-BARU'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{patient?.name || 'Anonim'}</p>
                        <p className="text-[11px] text-slate-400">{patient?.gender || '-'} · {patient?.age ? `${patient.age} th` : '-'}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-600">{record.visitDate || '-'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">D:{dmft}</span>
                          <span className="text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100">O:{ohis}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border",
                          isFinal 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-pink-50 text-pink-700 border-pink-200"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", isFinal ? "bg-emerald-500" : "bg-pink-500")}></span>
                          {isFinal ? 'Selesai' : 'Draf Aktif'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link 
                          to={`/records?patientId=${patient?.id || record.patientId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-200 rounded-md text-[11px] font-semibold transition-colors"
                        >
                          Buka Rekam
                          <ChevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada data pemeriksaan yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Reports = () => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const unsubRecords = onSnapshot(query(collection(db, 'dental_records'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ensure unique IDs
      const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
      setRecords(uniqueData);
      
      // Calculate Chart Data for Reports
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
          month: d.getMonth() + 1,
          year: d.getFullYear(),
          name: d.toLocaleString('id-ID', { month: 'short' }),
          dmft: 0,
          ohis: 0,
          count: 0
        };
      }).reverse();

      uniqueData.forEach((r: any) => {
        const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.visitDate);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const monthData = last6Months.find(m => m.month === month && m.year === year);
        if (monthData) {
          monthData.dmft += r.indices?.dmft?.total || 0;
          monthData.ohis += r.indices?.ohis?.total || 0;
          monthData.count++;
        }
      });

      setChartData(last6Months.map(m => ({
        ...m,
        dmft: m.count > 0 ? parseFloat((m.dmft / m.count).toFixed(2)) : 0,
        ohis: m.count > 0 ? parseFloat((m.ohis / m.count).toFixed(2)) : 0
      })));
    });

    const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
      setPatients(uniqueData);
      setLoading(false);
    });

    return () => {
      unsubRecords();
      unsubPatients();
    };
  }, []);

  const formatAssessment = (r: any) => {
    const lines = [];
    if (r.anamnesis) {
      lines.push(`[ANAMNESIS] Medis: ${r.anamnesis.medicalHistory?.isHealthy ? 'Sehat' : 'Ada Riwayat'}, Keluhan: ${r.anamnesis.dentalHistory?.reason || '-'}`);
    }
    if (r.indices) {
      lines.push(`[INDEKS] DMF-T: ${r.indices.dmft?.total || 0}, OHI-S: ${r.indices.ohis?.total || 0}`);
    }
    if (r.askesgilut?.diagnoses) {
      const diag = r.askesgilut.diagnoses.map((d: any) => d.kebutuhan).filter(Boolean).join(', ');
      lines.push(`[DIAGNOSIS] ${diag || '-'}`);
    }
    if (r.askesgilut?.planning?.goals) {
      lines.push(`[PERENCANAAN] Tujuan: ${r.askesgilut.planning.goals[0] || '-'}`);
    }
    return lines.join(' | ');
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const dmftAvg = records.reduce((sum, r) => sum + (r.indices?.dmft?.total || 0), 0) / (records.length || 1);
      const ohisAvg = records.reduce((sum, r) => sum + (r.indices?.ohis?.total || 0), 0) / (records.length || 1);
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analisis data kesehatan gigi berikut untuk populasi:
        Jumlah Pasien: ${records.length}
        Rata-rata DMF-T: ${dmftAvg.toFixed(2)}
        Rata-rata OHI-S: ${ohisAvg.toFixed(2)}
        
        Berikan ringkasan eksekutif, tren kesehatan, dan rekomendasi tindakan preventif dalam format markdown yang profesional dan mudah dibaca.`,
      });
      setAiAnalysis(response.text || "Gagal mendapatkan analisis.");
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiAnalysis("Terjadi kesalahan saat melakukan analisis AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const filtered = records.filter(r => {
      const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.visitDate);
      return (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
    });

    doc.setFontSize(18);
    doc.text('Laporan Bulanan Detail Pelayanan Gigi', 14, 22);
    doc.setFontSize(11);
    doc.text(`Periode: ${selectedMonth}/${selectedYear} | SIGEMA KOPO`, 14, 30);

    const tableData = filtered.map((r, index) => {
      const p = patients.find(pat => pat.id === r.patientId);
      return [
        index + 1,
        p?.rmNumber || r.patientId,
        r.visitDate,
        p?.name || 'Anonim',
        formatAssessment(r)
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [['No', 'No RM', 'Tanggal', 'Nama Pasien', 'Isi Seluruh Pengkajian']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        4: { cellWidth: 100 }
      }
    });

    doc.save(`Laporan_Lengkap_${selectedMonth}_${selectedYear}.pdf`);
  };

  const exportExcel = () => {
    const filtered = records.filter(r => {
      const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.visitDate);
      return (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
    });

    const worksheet = XLSX.utils.json_to_sheet(filtered.map((r, index) => {
      const p = patients.find(pat => pat.id === r.patientId);
      return {
        'No': index + 1,
        'No RM': p?.rmNumber || r.patientId,
        'Tanggal Berobat': r.visitDate,
        'Nama Pasien': p?.name || 'Anonim',
        'Riwayat Medis': r.anamnesis?.medicalHistory?.isHealthy ? 'Sehat' : 'Bermasalah',
        'Keluhan Utama': r.anamnesis?.anamnesis?.reason || '-',
        'Indeks DMF-T': r.indices?.dmft?.total || 0,
        'Indeks OHI-S': r.indices?.ohis?.total || 0,
        'Diagnosis': r.askesgilut?.diagnoses?.map((d: any) => d.kebutuhan).join(', ') || '-',
        'Rencana Perawatan': r.planning?.clientCenteredGoals || '-',
        'Total Billing': r.billing?.total || 0
      };
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resitasi');
    XLSX.writeFile(workbook, `Laporan_Bulanan_Lengkap_${selectedMonth}_${selectedYear}.xlsx`);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-pink" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Statistik & Laporan Epidemiologi</h1>
          <p className="text-xs text-slate-500 mt-0.5">Analisis agregat status kesehatan gigi dan mulut populasi UPTD Puskesmas Kopo.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-sky-600/20 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={15} /> : <Activity size={15} />}
            {isAnalyzing ? 'Menganalisis Data...' : 'Analisis Epidemiologi AI'}
          </button>
        </div>
      </header>

      {/* Monthly Report Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <ClipboardList className="text-sky-600" size={18} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Filter & Ekspor Laporan Bulanan</h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-xs font-medium text-slate-700">Pilih Bulan Pelayanan</label>
            <select 
              value={selectedMonth}
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg text-xs font-medium transition-all"
            >
              {Array.from({length: 12}).map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('id-ID', {month: 'long'})}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-xs font-medium text-slate-700">Pilih Tahun</label>
            <select 
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg text-xs font-medium transition-all"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2.5 w-full md:w-auto">
            <button 
              onClick={exportPDF}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
            >
              <Download size={15} /> Cetak PDF
            </button>
            <button 
              onClick={exportExcel}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
            >
              <TrendingUp size={15} /> Ekspor Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Rekam Medis Keseluruhan', value: records.length.toLocaleString('id-ID'), badge: 'Kumulatif' },
          { label: 'Kunjungan Bulan Terpilih', value: records.filter(r => (r.createdAt?.toDate ? r.createdAt.toDate().getMonth() : new Date(r.visitDate).getMonth()) === (selectedMonth - 1)).length.toString(), badge: 'Bulan Ini' },
          { label: 'Total Billing & Kasir', value: `Rp ${records.reduce((acc, r) => acc + (r.billing?.total || 0), 0).toLocaleString('id-ID')}`, badge: 'Pendapatan' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                {item.badge}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight mt-2 font-mono tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts & AI Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Tren Indikator Kesehatan Gigi (WHO)</h2>
              <p className="text-xs text-slate-500">DMF-T (Karies Gigi) vs OHI-S (Indeks Higiene Mulut)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-900"></span>
                <span className="text-slate-600 font-medium">DMF-T</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-600"></span>
                <span className="text-slate-600 font-medium">OHI-S</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="dmft" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 4, fill: '#0f172a', strokeWidth: 1.5, stroke: '#fff' }} activeDot={{ r: 6 }} name="DMF-T" />
                <Line type="monotone" dataKey="ohis" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4, fill: '#0284c7', strokeWidth: 1.5, stroke: '#fff' }} activeDot={{ r: 6 }} name="OHI-S" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Activity className="text-sky-600" size={18} />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Telaah Klinis & Rekomendasi AI</h2>
          </div>
          {aiAnalysis ? (
            <div className="prose prose-sm max-w-none text-slate-700 font-normal leading-relaxed overflow-y-auto max-h-72 custom-scrollbar text-xs">
              {aiAnalysis.split('\n').map((line, i) => (
                <p key={i} className="mb-1.5">{line}</p>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Activity size={32} className="text-slate-300 mb-2" />
              <p className="text-xs font-medium">Klik tombol &quot;Analisis Epidemiologi AI&quot; di atas untuk menghasilkan telaah otomatis berbasis data populasi.</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Pratinjau Data Kunjungan Terperinci</h2>
          <p className="text-xs text-slate-500">Rekap data periode {selectedMonth}/{selectedYear}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <th className="px-5 py-3 w-12 text-center">No</th>
                <th className="px-5 py-3">No RM</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Nama Pasien</th>
                <th className="px-5 py-3">Ringkasan Pengkajian & Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.filter(r => {
                const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.visitDate);
                return (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
              }).map((record, i) => {
                const p = patients.find(pat => pat.id === record.patientId);
                return (
                  <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 text-center text-slate-400 font-mono">{i + 1}</td>
                    <td className="px-5 py-3 font-mono font-medium text-slate-800">
                      {p?.rmNumber || 'N/A'}
                    </td>
                    <td className="px-5 py-3 text-slate-600 font-medium">{record.visitDate}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{p?.name || 'Anonim'}</td>
                    <td className="px-5 py-3 text-slate-600 max-w-md">
                      {formatAssessment(record)}
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    Belum ada data kunjungan pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ to, icon: Icon, label, active, permission, userRole, isCollapsed }: { to: string, icon: any, label: string, active: boolean, permission: string, userRole: string, isCollapsed?: boolean }) => {
  const hasPermission = PERMISSIONS[userRole]?.includes(permission);
  
  if (!hasPermission) return null;

  return (
    <Link 
      to={to}
      title={isCollapsed ? label : ""}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group relative whitespace-nowrap overflow-hidden text-xs font-medium",
        active 
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-xs shadow-purple-900/30" 
          : "text-slate-400 hover:bg-slate-900/80 hover:text-white",
        isCollapsed && "justify-center px-0"
      )}
    >
      <Icon size={16} className={cn("shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-pink-300")} />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

const SettingsPage = ({ userRole }: { userRole: string }) => (
  <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
    <header className="border-b border-slate-200 pb-4">
      <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pengaturan Sistem & Puskesmas</h1>
      <p className="text-xs text-slate-500 mt-0.5">Konfigurasi operasional klinik, preferensi sistem, dan hak akses.</p>
    </header>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-4 pb-2 border-b border-slate-100">Profil Fasilitas Pelayanan Kesehatan</h2>
        <div className="space-y-4">
          {[
            { label: 'Nama Faskes / Puskesmas', value: 'UPTD Puskesmas Kopo' },
            { label: 'Unit Pelayanan', value: 'Poli Kesehatan Gigi dan Mulut' },
            { label: 'Alamat Faskes', value: 'Jl. Kopo No. 123, Kota Bandung' },
            { label: 'Nomor Kontak Layanan', value: '022-1234567' },
          ].map((field, i) => (
            <div key={i} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">{field.label}</label>
              <input type="text" defaultValue={field.value} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg text-sm transition-all font-medium" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-4 pb-2 border-b border-slate-100">Preferensi Sistem & Standar</h2>
          <div className="space-y-4">
            {[
              { label: 'Standar Asuhan Gigi', value: 'Standar Kemenkes RI & WHO Human Needs Model' },
              { label: 'Zona Waktu Operasional', value: 'WIB (UTC+7)' },
            ].map((field, i) => (
              <div key={i} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">{field.label}</label>
                <input type="text" readOnly defaultValue={field.value} className="w-full px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-lg text-xs transition-all font-medium text-slate-600" />
              </div>
            ))}
          </div>
        </div>

        {userRole === 'Super Admin' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Manajemen Pengguna & Staf</h2>
              <ShieldCheck className="text-sky-600" size={18} />
            </div>
            <UserManagement />
          </div>
        )}
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children, permission, userRole }: { children: React.ReactNode, permission: string, userRole: string }) => {
  const hasPermission = PERMISSIONS[userRole]?.includes(permission);
  if (!hasPermission) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4 border border-red-100">
          <ShieldCheck size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">Akses Modul Terbatas</h2>
        <p className="text-xs text-slate-500 max-w-sm">Akun Anda dengan peran &apos;{userRole}&apos; tidak memiliki izin untuk membuka modul ini. Silakan hubungi Super Admin untuk penyesuaian hak akses.</p>
      </div>
    );
  }
  return <>{children}</>;
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400 px-6 md:px-8 py-2.5 bg-white border-b border-slate-200/80">
      <Link to="/" className="hover:text-purple-600 transition-colors flex items-center gap-1 text-slate-500">
        <Home size={13} />
        <span>Poli Gigi</span>
      </Link>
      <ChevronRight size={12} className="text-slate-300" />
      {pathnames.length === 0 ? (
        <span className="font-semibold text-purple-900">Dashboard</span>
      ) : (
        pathnames.map((name, index) => {
          const isLast = index === pathnames.length - 1;
          const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
          return (
            <React.Fragment key={name}>
              {index > 0 && <ChevronRight size={12} className="text-slate-300" />}
              <span className={cn(isLast ? "font-semibold text-purple-900" : "text-slate-500")}>{displayName}</span>
            </React.Fragment>
          );
        })
      )}
    </div>
  );
};

const Layout = ({ children, userData, setUserData, onLogout }: { children: React.ReactNode, userData: { role: string, fullName: string, photoURL: string, jenisTenaga: string }, setUserData: any, onLogout: () => void }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isGlobalVoiceOpen, setIsGlobalVoiceOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on navigation for mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex relative overflow-x-hidden font-sans">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && !isSidebarCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-[#060913]/60 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-[#080d1a] border-r border-slate-800/90 transition-all duration-200 transform lg:translate-x-0 lg:static lg:inset-0 flex flex-col shrink-0",
        isSidebarCollapsed ? "w-18" : "w-60",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-3">
          {/* Brand Logo Header */}
          <div className={cn("flex items-center mb-6 px-2 py-3 border-b border-slate-800/80 relative", isSidebarCollapsed ? "justify-center" : "gap-3")}>
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-md shadow-purple-900/30 shrink-0">
              S
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <h2 className="text-xs font-bold text-white tracking-tight leading-tight truncate">SIGEMA KOPO</h2>
                <p className="text-[10px] text-pink-400/90 mt-0.5 truncate font-medium">Poli Gigi & Mulut</p>
              </div>
            )}
            
            {/* Desktop Collapse Toggle */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-900 border border-slate-700 rounded-full hidden lg:flex items-center justify-center text-slate-400 hover:text-white transition-all z-10"
              title={isSidebarCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
            >
              <ChevronRight size={11} className={cn("transition-transform", !isSidebarCollapsed && "rotate-180")} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
            {!isSidebarCollapsed && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 mt-2">Utama</p>}
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} permission="dashboard" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            
            <div className="py-1"></div>
            {!isSidebarCollapsed && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 mt-2">Pelayanan Klinis</p>}
            <SidebarItem to="/patients" icon={Users} label="Data Pasien" active={location.pathname.startsWith('/patients')} permission="patients" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <SidebarItem to="/records" icon={ClipboardList} label="Pelayanan Gigi" active={location.pathname.startsWith('/records')} permission="records" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <SidebarItem to="/informed-consent" icon={FileCheck} label="Informed Consent" active={location.pathname === '/informed-consent'} permission="informed-consent" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <SidebarItem to="/billing" icon={Receipt} label="Kasir & Billing" active={location.pathname === '/billing'} permission="billing" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            
            <div className="py-1"></div>
            {!isSidebarCollapsed && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 mt-2">Laporan & Jadwal</p>}
            <SidebarItem to="/reports" icon={BarChart3} label="Statistik & Laporan" active={location.pathname === '/reports'} permission="reports" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <SidebarItem to="/appointments" icon={Calendar} label="Jadwal Reservasi" active={location.pathname === '/appointments'} permission="appointments" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <SidebarItem to="/education" icon={Video} label="Edukasi Pasien" active={location.pathname === '/education'} permission="education" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
          </nav>

          {/* Bottom Settings & User Card */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1">
            <SidebarItem to="/settings" icon={Settings} label="Pengaturan" active={location.pathname === '/settings'} permission="settings" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <SidebarItem to="/security" icon={ShieldCheck} label="Keamanan" active={location.pathname === '/security'} permission="security" userRole={userData.role} isCollapsed={isSidebarCollapsed} />

            {/* Clinician Duty Card */}
            {!isSidebarCollapsed && (
              <div className="mt-3 p-2.5 rounded-lg bg-[#0e1628] border border-purple-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-md bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/20">
                    {userData.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate leading-tight">{userData.fullName}</p>
                    <p className="text-[10px] text-pink-400 truncate">{userData.role}</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout} 
                  title="Keluar" 
                  className="p-1 text-slate-400 hover:text-pink-400 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-14 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-40">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-sm mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Cari pasien atau No RM... (Ctrl+K)" 
                className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-xs font-medium transition-all"
              />
            </div>
          </div>

          {/* Top Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Global Voice Assistant Button */}
            <button 
              type="button"
              onClick={() => setIsGlobalVoiceOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition-all border border-purple-200 active:scale-95 group"
              title="Bicara ke Sistem (Dikte Suara & Text to Speech)"
            >
              <Mic size={14} className="group-hover:animate-pulse text-pink-600" />
              <span className="hidden sm:inline">Dikte Medis</span>
            </button>

            {/* Notification Bell */}
            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5"></div>

            {/* Clinician Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-purple-200 overflow-hidden flex items-center justify-center shrink-0">
                  <img 
                    src={userData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName}`} 
                    alt="User" 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{userData.fullName}</p>
                  <p className="text-[10px] text-purple-600 font-medium leading-tight">{userData.role}</p>
                </div>
              </button>
              
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    className="absolute right-0 top-11 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 text-xs"
                  >
                    <div className="p-3 border-b border-slate-100 mb-1">
                      <p className="font-semibold text-slate-900 truncate">{userData.fullName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{userData.role}</p>
                    </div>
                    
                    <div className="space-y-0.5">
                      <Link 
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors font-medium"
                      >
                        <User size={14} className="text-slate-400" />
                        Profil Tenaga Medis
                      </Link>
                      <Link 
                        to="/settings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors font-medium"
                      >
                        <Settings size={14} className="text-slate-400" />
                        Pengaturan Sistem
                      </Link>
                    </div>
                    
                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      >
                        <LogOut size={14} />
                        Keluar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <Breadcrumbs />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <Routes>
                <Route path="/" element={<ProtectedRoute permission="dashboard" userRole={userData.role}><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProfilePage userData={userData} setUserData={setUserData} />} />
                <Route path="/patients" element={<ProtectedRoute permission="patients" userRole={userData.role}><PatientList /></ProtectedRoute>} />
                <Route path="/records" element={<ProtectedRoute permission="records" userRole={userData.role}><DentalHygieneForm /></ProtectedRoute>} />
                <Route path="/informed-consent" element={<ProtectedRoute permission="informed-consent" userRole={userData.role}><InformedConsent /></ProtectedRoute>} />
                <Route path="/billing" element={<ProtectedRoute permission="billing" userRole={userData.role}><Billing /></ProtectedRoute>} />
                <Route path="/education" element={<ProtectedRoute permission="education" userRole={userData.role}><DentalEducation /></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute permission="appointments" userRole={userData.role}><Appointments userData={userData} /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute permission="reports" userRole={userData.role}><Reports /></ProtectedRoute>} />
                <Route path="/security" element={<ProtectedRoute permission="security" userRole={userData.role}><Security /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute permission="settings" userRole={userData.role}><SettingsPage userRole={userData.role} /></ProtectedRoute>} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Voice Assistant & Dictation Modal */}
      <VoiceAssistantModal 
        isOpen={isGlobalVoiceOpen} 
        onClose={() => setIsGlobalVoiceOpen(false)} 
      />
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState({ 
    role: 'Administrasi Umum', 
    fullName: 'Dini Nur Oktaviani', 
    photoURL: '',
    jenisTenaga: 'Administrasi Umum',
    isApproved: true
  });
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let userRole = 'Pasien';
        let jenisTenaga = 'Pasien';
        let isApproved = true;
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            userRole = userDoc.data().role;
            jenisTenaga = userDoc.data().jenisTenaga || userRole;
            isApproved = userDoc.data().isApproved ?? true;
          } else if (user.email?.toLowerCase() === 'nuroktav.do@gmail.com') {
            userRole = 'Super Admin';
            jenisTenaga = 'Super Admin';
            isApproved = true;
            // Auto-save owner profile
            await setDoc(doc(db, 'users', user.uid), {
              fullName: user.displayName || 'Owner',
              role: 'Super Admin',
              jenisTenaga: 'Super Admin',
              email: user.email,
              isApproved: true,
              createdAt: new Date().toISOString()
            });
          }
          
          // Cleanup Novianto's data if admin (empty them)
          if (userRole === 'Super Admin') {
            const cleanupNovianto = async () => {
              // Delete Patients named Novianto
              const patientsQuery = query(collection(db, 'patients'), where('name', '==', 'Novianto'));
              const patientsSnapshot = await getDocs(patientsQuery);
              for (const patientDoc of patientsSnapshot.docs) {
                // Delete all records for this patient
                const recordsQuery = query(collection(db, 'dental_records'), where('patientId', '==', patientDoc.id));
                const recordsSnapshot = await getDocs(recordsQuery);
                for (const d of recordsSnapshot.docs) {
                  await deleteDoc(doc(db, 'dental_records', d.id));
                }
                // Delete the patient themselves
                await deleteDoc(doc(db, 'patients', patientDoc.id));
              }
            };
            cleanupNovianto();
          }
        } catch (error) {
          console.error("Error in Auth State Transition:", error);
        }

        setIsAuthenticated(true);
        setUserData({
          role: userRole,
          fullName: user.displayName || 'User',
          photoURL: user.photoURL || '',
          jenisTenaga: jenisTenaga,
          isApproved: isApproved
        });
      } else {
        setIsAuthenticated(false);
        setUserData({ role: '', fullName: '', photoURL: '', jenisTenaga: '', isApproved: false });
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center clinical-pattern text-slate-300">
        <RefreshCw className="text-sky-500 animate-spin mb-3" size={36} />
        <p className="text-xs font-medium tracking-wider uppercase text-slate-400">Memuat Sistem Rekam Medis...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={(data) => {
      setIsAuthenticated(true);
      setUserData(data);
    }} />;
  }

  if (!userData.isApproved) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 clinical-pattern">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 text-center border border-slate-200">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Menunggu Verifikasi Kredensial</h1>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">Akun tenaga medis Anda sedang ditinjau oleh Super Administrator UPTD Puskesmas Kopo. Anda akan mendapatkan akses penuh setelah verifikasi selesai.</p>
          <button 
            onClick={handleLogout}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-xs"
          >
            <LogOut size={14} />
            Keluar dari Sistem
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout userData={userData} setUserData={setUserData} onLogout={handleLogout}>
        <div />
      </Layout>
    </Router>
  );
}
