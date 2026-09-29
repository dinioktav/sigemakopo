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
  Mic,
  Award,
  CheckCircle2,
  HeartPulse,
  Stethoscope,
  Smile,
  BookOpen,
  Sparkles,
  Layers,
  Filter,
  Check,
  Info,
  ListFilter,
  CheckSquare,
  ArrowRight,
  ShieldAlert,
  FileText
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
  Line,
  Legend
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
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100" title={`DMF-T: ${dmft}`}>
                            D:{dmft}
                          </span>
                          {(() => {
                            const ohisCat = record.indices?.ohis?.category || (ohis <= 1.2 ? 'Baik' : ohis <= 3.0 ? 'Sedang' : 'Buruk');
                            const badgeColor = ohis <= 1.2 
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                              : ohis <= 3.0 
                                ? 'text-amber-700 bg-amber-50 border-amber-200' 
                                : 'text-rose-700 bg-rose-50 border-rose-200';
                            return (
                              <span className={cn("px-1.5 py-0.5 rounded border flex items-center gap-1 font-semibold", badgeColor)} title={`OHI-S: ${ohis} (Kriteria: ${ohisCat})`}>
                                O:{ohis} <span className="text-[9px] font-sans font-bold uppercase">{ohisCat}</span>
                              </span>
                            );
                          })()}
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
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'diagnosis' | 'interventions' | 'monthly'>('overview');
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
      const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
      setRecords(uniqueData);
      
      // Calculate 6 Months Trend for Askesgilut
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
          month: d.getMonth() + 1,
          year: d.getFullYear(),
          name: d.toLocaleString('id-ID', { month: 'short' }),
          dmft: 0,
          ohis: 0,
          preventive: 0,
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
          
          // Check preventive actions (scaling, DHE, TAF, sealant)
          const items = r.billing?.items || [];
          const hasPrev = items.some((item: any) => 
            /skeling|scaling|fluor|dhe|penyuluhan|sealant/i.test(item.name || '')
          );
          if (hasPrev) monthData.preventive++;
          
          monthData.count++;
        }
      });

      setChartData(last6Months.map(m => ({
        ...m,
        dmft: m.count > 0 ? parseFloat((m.dmft / m.count).toFixed(2)) : 0,
        ohis: m.count > 0 ? parseFloat((m.ohis / m.count).toFixed(2)) : 0,
        preventiveRate: m.count > 0 ? Math.round((m.preventive / m.count) * 100) : 0
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

  // Compute Asuhan Kesehatan Gigi dan Mulut (Askesgilut) Metrics
  const askesgilutStats = React.useMemo(() => {
    const total = records.length || 1;
    let ohisBaik = 0;
    let ohisSedang = 0;
    let ohisBuruk = 0;
    let sumOhis = 0;
    let sumDi = 0;
    let sumCi = 0;

    let sumD = 0;
    let sumM = 0;
    let sumF = 0;
    let sumDeft = 0;
    let cariesFree = 0;

    const diagnosesMap: Record<string, number> = {};
    const interventionsMap: Record<string, number> = {
      'Skeling / Scaling Gigi': 0,
      'Dental Health Education (DHE)': 0,
      'Topikal Aplikasi Fluor (TAF)': 0,
      'Fissure Sealant': 0,
      'Penambalan Gigi (ART/GIC)': 0,
      'Pencabutan Gigi Sulung': 0,
      'Rujukan Spesialis': 0
    };

    let completedAskes = 0;
    let controlledVisits = 0;

    records.forEach((r: any) => {
      // 1. OHI-S & Kriteria
      const ohisVal = typeof r.indices?.ohis?.total === 'number' ? r.indices.ohis.total : 0;
      const diVal = typeof r.indices?.ohis?.di === 'number' ? r.indices.ohis.di : 0;
      const ciVal = typeof r.indices?.ohis?.ci === 'number' ? r.indices.ohis.ci : 0;

      sumOhis += ohisVal;
      sumDi += diVal;
      sumCi += ciVal;

      if (ohisVal <= 1.2) ohisBaik++;
      else if (ohisVal <= 3.0) ohisSedang++;
      else ohisBuruk++;

      // 2. DMF-T & def-t
      const d = r.indices?.dmft?.d || 0;
      const m = r.indices?.dmft?.m || 0;
      const f = r.indices?.dmft?.f || 0;
      const totalDmft = r.indices?.dmft?.total || (d + m + f);
      sumD += d;
      sumM += m;
      sumF += f;
      if (totalDmft === 0) cariesFree++;

      const deftVal = r.indices?.deft?.total || 0;
      sumDeft += deftVal;

      // 3. Human Needs Diagnosis
      r.askesgilut?.diagnoses?.forEach((diag: any) => {
        if (diag.kebutuhan && diag.kebutuhan.trim()) {
          const k = diag.kebutuhan.trim();
          diagnosesMap[k] = (diagnosesMap[k] || 0) + 1;
        }
      });

      // 4. Intervensi Tindakan
      const billingItems = r.billing?.items || [];
      const planInterventions = r.askesgilut?.planning?.interventions || [];
      const soapieIntervention = r.soapie?.intervention || '';

      const allInterventionText = [
        ...billingItems.map((b: any) => b.name || ''),
        ...planInterventions,
        soapieIntervention
      ].join(' ').toLowerCase();

      if (/skeling|scaling|karang/i.test(allInterventionText)) interventionsMap['Skeling / Scaling Gigi']++;
      if (/dhe|penyuluhan|edukasi|sikat gigi/i.test(allInterventionText)) interventionsMap['Dental Health Education (DHE)']++;
      if (/fluor|taf/i.test(allInterventionText)) interventionsMap['Topikal Aplikasi Fluor (TAF)']++;
      if (/sealant|fisur/i.test(allInterventionText)) interventionsMap['Fissure Sealant']++;
      if (/tumpat|tambal|gic|art/i.test(allInterventionText)) interventionsMap['Penambalan Gigi (ART/GIC)']++;
      if (/cabut|ekstraksi|sulung/i.test(allInterventionText)) interventionsMap['Pencabutan Gigi Sulung']++;
      if (/rujuk|rujukan/i.test(allInterventionText)) interventionsMap['Rujukan Spesialis']++;

      // 5. Evaluasi Asuhan
      if (r.status === 'final') completedAskes++;
      if (r.askesgilut?.nextVisit || /kontrol|kunjungan ulang/i.test(r.askesgilut?.recommendations || '')) {
        controlledVisits++;
      }
    });

    const avgOhis = parseFloat((sumOhis / total).toFixed(2));
    const avgDi = parseFloat((sumDi / total).toFixed(2));
    const avgCi = parseFloat((sumCi / total).toFixed(2));
    const avgDmft = parseFloat(((sumD + sumM + sumF) / total).toFixed(2));
    const careIndex = (sumD + sumM + sumF) > 0 ? Math.round((sumF / (sumD + sumM + sumF)) * 100) : 0;
    const cariesFreePct = Math.round((cariesFree / total) * 100);

    const totalPrevActions = interventionsMap['Skeling / Scaling Gigi'] + 
                             interventionsMap['Dental Health Education (DHE)'] + 
                             interventionsMap['Topikal Aplikasi Fluor (TAF)'] + 
                             interventionsMap['Fissure Sealant'];
    const totalCurativeActions = interventionsMap['Penambalan Gigi (ART/GIC)'] + 
                                interventionsMap['Pencabutan Gigi Sulung'];
    const totalAllActions = totalPrevActions + totalCurativeActions || 1;
    const prevRatio = Math.round((totalPrevActions / totalAllActions) * 100);

    // OHI-S Distribution Pie
    const ohisPie = [
      { name: 'Baik (0.0 - 1.2)', value: ohisBaik, count: ohisBaik, pct: Math.round((ohisBaik / total) * 100), color: '#10b981' },
      { name: 'Sedang (1.3 - 3.0)', value: ohisSedang, count: ohisSedang, pct: Math.round((ohisSedang / total) * 100), color: '#f59e0b' },
      { name: 'Buruk (3.1 - 6.0)', value: ohisBuruk, count: ohisBuruk, pct: Math.round((ohisBuruk / total) * 100), color: '#f43f5e' }
    ];

    // Diagnoses Bar List
    const humanNeedsList = Object.entries(diagnosesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Interventions Bar List
    const interventionsList = Object.entries(interventionsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      ohisBaik,
      ohisSedang,
      ohisBuruk,
      avgOhis,
      avgDi,
      avgCi,
      ohisPie,
      sumD,
      sumM,
      sumF,
      sumDeft,
      avgDmft,
      careIndex,
      cariesFreePct,
      humanNeedsList,
      interventionsList,
      prevRatio,
      completedAskes,
      controlledVisits
    };
  }, [records]);

  const formatAssessment = (r: any) => {
    const lines = [];
    if (r.anamnesis) {
      lines.push(`[ANAMNESIS] Medis: ${r.anamnesis.medicalHistory?.isHealthy ? 'Sehat' : 'Ada Riwayat'}, Keluhan: ${r.anamnesis.dentalHistory?.reason || '-'}`);
    }
    if (r.indices) {
      const ohisVal = r.indices.ohis?.total || 0;
      const ohisCat = r.indices.ohis?.category || (ohisVal <= 1.2 ? 'Baik' : ohisVal <= 3.0 ? 'Sedang' : 'Buruk');
      lines.push(`[PENGKAJIAN] DMF-T: ${r.indices.dmft?.total || 0} (D:${r.indices.dmft?.d||0} M:${r.indices.dmft?.m||0} F:${r.indices.dmft?.f||0}) | OHI-S: ${ohisVal} (Kriteria: ${ohisCat})`);
    }
    if (r.askesgilut?.diagnoses?.length > 0) {
      const diag = r.askesgilut.diagnoses.map((d: any) => d.kebutuhan).filter(Boolean).join(', ');
      lines.push(`[DIAGNOSIS ASKESGILUT] ${diag || '-'}`);
    }
    if (r.billing?.items?.length > 0) {
      const items = r.billing.items.map((i: any) => i.name).join(', ');
      lines.push(`[TINDAKAN] ${items}`);
    }
    if (r.soapie?.evaluation || r.askesgilut?.planning?.evaluativeStatement?.length > 0) {
      const ev = r.soapie?.evaluation || r.askesgilut.planning.evaluativeStatement[0] || 'Tujuan Asuhan Tercapai';
      lines.push(`[EVALUASI] ${ev}`);
    }
    return lines.join(' | ');
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Anda adalah pakar Epidemiologi Kesehatan Gigi dan Mulut serta Dosen Pembimbing Asuhan Kesehatan Gigi dan Mulut (Askesgilut) PERMENKES RI No. 20/2016 di UPTD Puskesmas Kopo.
Analisis data agregat asuhan kesehatan gigi dan mulut berikut:
- Jumlah Pasien Askesgilut: ${records.length}
- Status Higiene Mulut OHI-S Populasi: Rerata ${askesgilutStats.avgOhis} (DI-S: ${askesgilutStats.avgDi}, CI-S: ${askesgilutStats.avgCi})
  * Kategori Baik: ${askesgilutStats.ohisBaik} pasien (${Math.round((askesgilutStats.ohisBaik/askesgilutStats.total)*100)}%)
  * Kategori Sedang: ${askesgilutStats.ohisSedang} pasien (${Math.round((askesgilutStats.ohisSedang/askesgilutStats.total)*100)}%)
  * Kategori Buruk: ${askesgilutStats.ohisBuruk} pasien (${Math.round((askesgilutStats.ohisBuruk/askesgilutStats.total)*100)}%)
- Indeks Karies DMF-T Populasi: Rerata ${askesgilutStats.avgDmft}
  * D (Karies Aktif): ${askesgilutStats.sumD}, M (Gigi Hilang): ${askesgilutStats.sumM}, F (Gigi Ditumpat): ${askesgilutStats.sumF}
  * Care Index: ${askesgilutStats.careIndex}%, Bebas Karies: ${askesgilutStats.cariesFreePct}%
- Rasio Tindakan Preventif-Promotif vs Kuratif: ${askesgilutStats.prevRatio}% Preventif
- Diagnosis Human Needs Terbanyak: ${askesgilutStats.humanNeedsList.slice(0, 3).map(h => `${h.name} (${h.count} kasus)`).join(', ') || 'Integritas Jaringan Mukosa & Keutuhan Gigi'}

Berikan:
1. Ringkasan Eksekutif Epidemiologi Askesgilut (Status kesehatan gigi masyarakat Kopo)
2. Analisis Kritis 5 Tahap Askesgilut (Pengkajian, Diagnosis Human Needs, Perencanaan, Tindakan, Evaluasi)
3. Rekomendasi Program Prioritas Promotif & Preventif Puskesmas Kopo (UKGS Sekolah, Posyandu, Pelayanan Poli Gigi).
Gunakan gaya bahasa profesional medis, terstruktur dengan subjudul markdown, ringkas, tajam, dan aplikatif.`,
      });
      setAiAnalysis(response.text || "Gagal mendapatkan analisis asuhan.");
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiAnalysis("Terjadi kendala saat menghubungkan ke mesin AI analisis asuhan. Silakan coba kembali sesaat lagi.");
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

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Laporan Statistik Pelayanan Asuhan Kesehatan Gigi dan Mulut (Askesgilut)', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`UPTD Puskesmas Kopo · Periode: ${selectedMonth}/${selectedYear} · Standar Asuhan Permenkes No. 20/2016`, 14, 25);

    const tableData = filtered.map((r, index) => {
      const p = patients.find(pat => pat.id === r.patientId);
      const ohisVal = r.indices?.ohis?.total || 0;
      const ohisCat = r.indices?.ohis?.category || (ohisVal <= 1.2 ? 'Baik' : ohisVal <= 3.0 ? 'Sedang' : 'Buruk');
      const dmft = r.indices?.dmft?.total || 0;
      const diag = r.askesgilut?.diagnoses?.map((d: any) => d.kebutuhan).filter(Boolean).join(', ') || '-';
      const actions = r.billing?.items?.map((i: any) => i.name).join(', ') || r.soapie?.intervention || '-';
      const evalStatus = r.status === 'final' ? 'Tercapai (Final)' : 'Dalam Proses';

      return [
        index + 1,
        p?.rmNumber || r.patientId,
        r.visitDate || '-',
        p?.name || 'Anonim',
        `${ohisVal} (${ohisCat})`,
        `D:${r.indices?.dmft?.d||0} M:${r.indices?.dmft?.m||0} F:${r.indices?.dmft?.f||0} (Tot:${dmft})`,
        diag,
        actions,
        evalStatus
      ];
    });

    autoTable(doc, {
      startY: 32,
      head: [['No', 'No RM', 'Tanggal', 'Nama Pasien', 'OHI-S & Kriteria', 'Indeks DMF-T', 'Diagnosis Askesgilut', 'Tindakan Intervensi', 'Evaluasi']],
      body: tableData,
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        6: { cellWidth: 50 },
        7: { cellWidth: 50 },
      }
    });

    doc.save(`Laporan_Askesgilut_Kopo_${selectedMonth}_${selectedYear}.pdf`);
  };

  const exportExcel = () => {
    const filtered = records.filter(r => {
      const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.visitDate);
      return (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
    });

    const worksheet = XLSX.utils.json_to_sheet(filtered.map((r, index) => {
      const p = patients.find(pat => pat.id === r.patientId);
      const ohisVal = r.indices?.ohis?.total || 0;
      const ohisCat = r.indices?.ohis?.category || (ohisVal <= 1.2 ? 'Baik' : ohisVal <= 3.0 ? 'Sedang' : 'Buruk');

      return {
        'No': index + 1,
        'No RM': p?.rmNumber || r.patientId,
        'Tanggal Pelayanan': r.visitDate,
        'Nama Pasien': p?.name || 'Anonim',
        'Usia': p?.age ? `${p.age} th` : '-',
        'Jenis Kelamin': p?.gender || '-',
        'Riwayat Medis': r.anamnesis?.medicalHistory?.isHealthy ? 'Sehat' : 'Ada Riwayat',
        'Keluhan Gigi': r.anamnesis?.dentalHistory?.reason || '-',
        'Indeks Debris (DI-S)': r.indices?.ohis?.di || 0,
        'Indeks Kalkulus (CI-S)': r.indices?.ohis?.ci || 0,
        'Total OHI-S': ohisVal,
        'Kriteria OHI-S': ohisCat,
        'DMF-T (D)': r.indices?.dmft?.d || 0,
        'DMF-T (M)': r.indices?.dmft?.m || 0,
        'DMF-T (F)': r.indices?.dmft?.f || 0,
        'Total DMF-T': r.indices?.dmft?.total || 0,
        'def-t (Gigi Sulung)': r.indices?.deft?.total || 0,
        'Diagnosis Askesgilut (Human Needs)': r.askesgilut?.diagnoses?.map((d: any) => d.kebutuhan).join('; ') || '-',
        'Tindakan Intervensi': r.billing?.items?.map((i: any) => i.name).join(', ') || r.soapie?.intervention || '-',
        'Status Evaluasi': r.status === 'final' ? 'Selesai / Tercapai' : 'Draf Pelayanan',
        'Total Biaya': r.billing?.total || 0
      };
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Askesgilut');
    XLSX.writeFile(workbook, `Laporan_Askesgilut_${selectedMonth}_${selectedYear}.xlsx`);
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner Askesgilut */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-purple-100/50 via-pink-50/30 to-transparent pointer-events-none"></div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white shadow-xs">
              <Award size={11} className="text-pink-400" /> SIGEMA KOPO
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
              <Stethoscope size={11} className="text-purple-600" /> Standar Askesgilut PERMENKES No. 20/2016
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">UPTD Puskesmas Kopo</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Statistik & Laporan Asuhan Kesehatan Gigi dan Mulut (Askesgilut)
          </h1>
          <p className="text-xs text-slate-500 max-w-3xl">
            Sistem analisis agregat 5 pilar asuhan: Pengkajian Indeks Klinis (OHI-S & DMF-T), Diagnosis 8 Kebutuhan Manusia, Perencanaan, Tindakan Promotif-Preventif, serta Evaluasi Hasil Asuhan.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button 
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/25 transition-all disabled:opacity-50 active:scale-95"
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={15} /> : <Sparkles size={15} className="text-pink-200" />}
            {isAnalyzing ? 'Menganalisis Askesgilut...' : 'Telaah Askesgilut AI'}
          </button>
        </div>
      </header>

      {/* 5 Process of Care Interactive Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: '1. Ringkasan Siklus Askesgilut', icon: Layers, desc: '5 Pilar Asuhan' },
          { id: 'assessment', label: '2. Pengkajian (OHI-S & DMF-T)', icon: ClipboardList, desc: 'Indeks Klinis' },
          { id: 'diagnosis', label: '3. Diagnosis Kebutuhan Manusia', icon: HeartPulse, desc: '8 Human Needs' },
          { id: 'interventions', label: '4. Tindakan & Evaluasi Asuhan', icon: Stethoscope, desc: 'Intervensi & Outcome' },
          { id: 'monthly', label: '5. Rekap Bulanan & Ekspor', icon: FileText, desc: 'Cetak PDF / Excel' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-xs shadow-purple-600/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50/30"
              )}
            >
              <Icon size={14} className={isActive ? "text-white" : "text-purple-600"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* AI Analysis Result Box */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-purple-50/70 via-white to-pink-50/50 p-6 rounded-2xl border border-purple-200/80 shadow-xs relative">
          <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-2xs">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Telaah Klinis & Rekomendasi Askesgilut AI</h3>
                <p className="text-[11px] text-slate-500">Analisis komprehensif epidemiologi pelayanan asuhan gigi Puskesmas Kopo</p>
              </div>
            </div>
            <button 
              onClick={() => setAiAnalysis(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 rounded-md hover:bg-purple-100/50"
            >
              Tutup
            </button>
          </div>
          <div className="prose prose-sm max-w-none text-slate-700 text-xs leading-relaxed custom-scrollbar max-h-80 overflow-y-auto space-y-2">
            {aiAnalysis.split('\n').map((line, i) => (
              <p key={i} className="mb-1">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW (RINGKASAN SIKLUS ASKESGILUT) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 5 Process of Care KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              {
                step: '1. Pengkajian',
                title: 'Rata-rata OHI-S',
                value: askesgilutStats.avgOhis.toString(),
                sub: `Baik: ${askesgilutStats.ohisBaik} | Sedang: ${askesgilutStats.ohisSedang} | Buruk: ${askesgilutStats.ohisBuruk}`,
                badge: askesgilutStats.avgOhis <= 1.2 ? 'Baik' : askesgilutStats.avgOhis <= 3.0 ? 'Sedang' : 'Buruk',
                badgeColor: askesgilutStats.avgOhis <= 1.2 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : askesgilutStats.avgOhis <= 3.0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200',
                icon: ClipboardList
              },
              {
                step: '1. Karies',
                title: 'Rerata DMF-T',
                value: askesgilutStats.avgDmft.toString(),
                sub: `D:${askesgilutStats.sumD} · M:${askesgilutStats.sumM} · F:${askesgilutStats.sumF}`,
                badge: `Care: ${askesgilutStats.careIndex}%`,
                badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
                icon: Award
              },
              {
                step: '2. Diagnosis',
                title: 'Human Needs',
                value: askesgilutStats.humanNeedsList.reduce((sum, h) => sum + h.count, 0).toString(),
                sub: `${askesgilutStats.humanNeedsList.length} kategori kebutuhan teridentifikasi`,
                badge: '8 Model',
                badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
                icon: HeartPulse
              },
              {
                step: '4. Intervensi',
                title: 'Rasio Preventif',
                value: `${askesgilutStats.prevRatio}%`,
                sub: `Utamakan Scaling, DHE, TAF & Sealant`,
                badge: 'Puskesmas',
                badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                icon: Stethoscope
              },
              {
                step: '5. Evaluasi',
                title: 'Keberhasilan Asuhan',
                value: `${Math.round(((askesgilutStats.ohisBaik + askesgilutStats.ohisSedang) / askesgilutStats.total) * 100)}%`,
                sub: `${askesgilutStats.completedAskes} rekam asuhan terselesaikan final`,
                badge: 'Tercapai',
                badgeColor: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200',
                icon: CheckCircle2
              },
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">{kpi.step}</span>
                      <span className={cn("text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border", kpi.badgeColor)}>
                        {kpi.badge}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{kpi.title}</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-mono">{kpi.value}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100 line-clamp-1">{kpi.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Interactive Flow Chart of Askesgilut Process */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers size={16} className="text-purple-600" />
                  Alur Siklus Asuhan Kesehatan Gigi dan Mulut (Dental Hygiene Process of Care)
                </h2>
                <p className="text-xs text-slate-500">Kerangka kerja klinis berstandar PERMENKES RI No. 20/2016 di Poli Gigi Puskesmas Kopo</p>
              </div>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 w-fit">
                Total Pasien Terkaji: {records.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {[
                {
                  step: 'Tahap 1',
                  name: 'Pengkajian',
                  sub: 'Assessment',
                  color: 'from-purple-600 to-indigo-600',
                  items: ['Anamnesis Riwayat Medis', `OHI-S (Rata ${askesgilutStats.avgOhis})`, `DMF-T (Rata ${askesgilutStats.avgDmft})`, 'Plaque Control Record (PCR)']
                },
                {
                  step: 'Tahap 2',
                  name: 'Diagnosis',
                  sub: 'Human Needs',
                  color: 'from-indigo-600 to-purple-600',
                  items: ['8 Kebutuhan Manusia', 'Etiologi Masalah Plak/Karies', 'Tanda & Gejala Klinis', `${askesgilutStats.humanNeedsList.length} Variasi Diagnosis`]
                },
                {
                  step: 'Tahap 3',
                  name: 'Perencanaan',
                  sub: 'Planning',
                  color: 'from-purple-600 to-pink-600',
                  items: ['Client-Centered Goals', 'Rencana Promotif DHE', 'Rencana Preventif Scaling', 'Informed Consent Pasien']
                },
                {
                  step: 'Tahap 4',
                  name: 'Implementasi',
                  sub: 'Intervention',
                  color: 'from-pink-600 to-rose-600',
                  items: ['Scaling Supra/Subgingiva', 'Instruksi Sikat Gigi Roll/Bass', 'Topikal Fluor (TAF)', 'Restorasi ART & Tumpatan GIC']
                },
                {
                  step: 'Tahap 5',
                  name: 'Evaluasi',
                  sub: 'Evaluation',
                  color: 'from-rose-600 to-emerald-600',
                  items: [`Penurunan Skor OHI-S`, `Care Index: ${askesgilutStats.careIndex}%`, `${askesgilutStats.completedAskes} Selesai Final`, 'Penjadwalan Kunjungan Ulang']
                },
              ].map((stage, i) => (
                <div key={i} className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between hover:bg-purple-50/30 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{stage.step}</span>
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{stage.name}</h3>
                    <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider mb-3">{stage.sub}</p>
                    <ul className="space-y-1.5">
                      {stage.items.map((it, idx) => (
                        <li key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <Check size={11} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tren 6 Bulan Askesgilut & Sebaran Human Needs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Tren Indikator Kesehatan Gigi 6 Bulan Terakhir</h3>
                  <p className="text-xs text-slate-500">Perkembangan rerata DMF-T (Karies) vs OHI-S (Higiene Mulut) vs Rasio Tindakan Preventif</p>
                </div>
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span className="text-slate-600 font-medium">DMF-T</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                    <span className="text-slate-600 font-medium">OHI-S</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600 font-medium">% Preventif</span>
                  </div>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="dmft" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: '#7c3aed', strokeWidth: 1.5, stroke: '#fff' }} activeDot={{ r: 6 }} name="DMF-T" />
                    <Line type="monotone" dataKey="ohis" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4, fill: '#ec4899', strokeWidth: 1.5, stroke: '#fff' }} activeDot={{ r: 6 }} name="OHI-S" />
                    <Line type="monotone" dataKey="preventiveRate" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#10b981' }} name="% Tindakan Preventif" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Target Puskesmas:</span>
                  <span>OHI-S &le; 1.2 (Baik) · DMF-T &le; 3.0 · Preventif &gt; 70%</span>
                </div>
                <div className="font-mono font-semibold text-purple-700">Periode Evaluasi Terkini</div>
              </div>
            </div>

            {/* Quick Human Needs Mini Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Diagnosis Kebutuhan Terbanyak</h3>
                  <p className="text-xs text-slate-500">Human Needs Model (Askesgilut)</p>
                </div>

                <div className="space-y-3">
                  {askesgilutStats.humanNeedsList.slice(0, 5).map((diag, i) => {
                    const pct = Math.round((diag.count / (askesgilutStats.humanNeedsList.reduce((s, h) => s + h.count, 0) || 1)) * 100);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 truncate max-w-[200px]" title={diag.name}>
                            {diag.name}
                          </span>
                          <span className="font-mono font-bold text-purple-700 shrink-0">{diag.count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-pink-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, pct * 1.5)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {askesgilutStats.humanNeedsList.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-6 text-center">Belum ada diagnosis asuhan yang tercatat.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button 
                  onClick={() => setActiveTab('diagnosis')}
                  className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  Lihat Analisis 8 Kebutuhan Lengkap <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENGKAJIAN (OHI-S & DMF-T KRITERIA) */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OHI-S Distribution Donut Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Distribusi Kriteria OHI-S Populasi (WHO)</h3>
                  <p className="text-xs text-slate-500">Tingkat Kebersihan Gigi & Mulut (Debris + Calculus)</p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  Rerata: {askesgilutStats.avgOhis}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={askesgilutStats.ohisPie}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {askesgilutStats.ohisPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2.5">
                  {askesgilutStats.ohisPie.map((entry, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                          <span className="text-xs font-bold text-slate-800">{entry.name}</span>
                        </div>
                        <span className="font-mono font-bold text-xs" style={{ color: entry.color }}>
                          {entry.pct}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 pl-5">
                        {entry.count} dari {askesgilutStats.total} pasien terkaji
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-indices Breakdown */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Rata-rata Debris Index (DI-S)</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5 font-mono">{askesgilutStats.avgDi}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Endapan lunak / plak makanan</p>
                </div>
                <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100">
                  <p className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">Rata-rata Calculus Index (CI-S)</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5 font-mono">{askesgilutStats.avgCi}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Endapan keras / karang gigi</p>
                </div>
              </div>
            </div>

            {/* DMF-T & def-t Breakdown Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Komposisi Pengkajian Karies (DMF-T & def-t)</h3>
                    <p className="text-xs text-slate-500">Evaluasi Gigi Berlubang (D), Hilang (M), dan Ditumpat (F)</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Bebas Karies: {askesgilutStats.cariesFreePct}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-rose-700 uppercase">D (Decayed)</p>
                    <p className="text-2xl font-black text-rose-700 mt-1 font-mono">{askesgilutStats.sumD}</p>
                    <p className="text-[9px] text-rose-600 font-medium">Karies Aktif</p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-amber-700 uppercase">M (Missing)</p>
                    <p className="text-2xl font-black text-amber-700 mt-1 font-mono">{askesgilutStats.sumM}</p>
                    <p className="text-[9px] text-amber-600 font-medium">Gigi Dicabut</p>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">F (Filled)</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{askesgilutStats.sumF}</p>
                    <p className="text-[9px] text-emerald-600 font-medium">Sudah Ditumpat</p>
                  </div>
                </div>

                {/* Progress bar of D M F composition */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Rasio Komposisi Karies:</span>
                    <span className="font-mono text-slate-500 font-medium">Total Elemen: {askesgilutStats.sumD + askesgilutStats.sumM + askesgilutStats.sumF} gigi</span>
                  </div>
                  {(() => {
                    const tot = (askesgilutStats.sumD + askesgilutStats.sumM + askesgilutStats.sumF) || 1;
                    const dPct = Math.round((askesgilutStats.sumD / tot) * 100);
                    const mPct = Math.round((askesgilutStats.sumM / tot) * 100);
                    const fPct = 100 - dPct - mPct;
                    return (
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                        <div style={{ width: `${dPct}%` }} className="bg-rose-500 h-full" title={`D: ${dPct}%`}></div>
                        <div style={{ width: `${mPct}%` }} className="bg-amber-400 h-full" title={`M: ${mPct}%`}></div>
                        <div style={{ width: `${Math.max(0, fPct)}%` }} className="bg-emerald-500 h-full" title={`F: ${fPct}%`}></div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Care Index (Tingkat Penanganan Restorasi):</span>
                  <span className="font-mono font-bold text-purple-700 text-sm">{askesgilutStats.careIndex}%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Persentase gigi berlubang yang telah mendapatkan perawatan tumpatan definitif (Target Puskesmas: &gt; 50%).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNOSIS (8 KEBUTUHAN MANUSIA / HUMAN NEEDS MODEL) */}
      {activeTab === 'diagnosis' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <HeartPulse size={16} className="text-pink-600" />
                  Sebaran Diagnosis Askesgilut Berdasarkan 8 Kebutuhan Manusia (Human Needs Model)
                </h3>
                <p className="text-xs text-slate-500">Standar nomenklatur asuhan kesehatan gigi dan mulut nasional</p>
              </div>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                Total Diagnosis Tercatat: {askesgilutStats.humanNeedsList.reduce((s, h) => s + h.count, 0)} Kasus
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Bar representation of all 8 needs */}
              <div className="space-y-3.5">
                {[
                  {
                    need: 'Integritas Jaringan Kulit & Mukosa Mulut',
                    desc: 'Gingivitis, perdarahan saat sikat gigi, karang gigi supra/subgingiva, poket periodontal',
                    color: '#7c3aed'
                  },
                  {
                    need: 'Keutuhan & Fungsi Biologis Gigi',
                    desc: 'Karies gigi aktif (email/dentin), kehilangan gigi, abrasi gigi, atrisi',
                    color: '#ec4899'
                  },
                  {
                    need: 'Tanggung Jawab atas Kesehatan Gigi Sendiri',
                    desc: 'Kebiasaan menyikat gigi yang kurang tepat, waktu sikat gigi tidak sesuai, penumpukan debris',
                    color: '#0f172a'
                  },
                  {
                    need: 'Bebas dari Rasa Nyeri/Sakit pada Leher & Kepala',
                    desc: 'Nyeri spontan gigi, ngilu pada rangsang dingin/manis, nyeri tekan gingiva',
                    color: '#f43f5e'
                  },
                  {
                    need: 'Perlindungan dari Risiko Kesehatan',
                    desc: 'Riwayat penyakit sistemik (diabetes, hipertensi, asma), alergi obat/bahan dental',
                    color: '#f59e0b'
                  },
                  {
                    need: 'Bebas dari Kecemasan & Stres Dental',
                    desc: 'Rasa takut terhadap instrumen dental, kecemasan terhadap tindakan scaling/tumpat',
                    color: '#06b6d4'
                  },
                  {
                    need: 'Konsep Diri & Citra Wajah/Gigi',
                    desc: 'Keluhan estetika karena perubahan warna gigi (stain nikotin/kopi), gigi berjejal',
                    color: '#8b5cf6'
                  },
                  {
                    need: 'Pemahaman Konseptual & Pemecahan Masalah',
                    desc: 'Kurangnya informasi tentang proses terjadinya karies dan penyakit periodontal',
                    color: '#10b981'
                  },
                ].map((item, idx) => {
                  const match = askesgilutStats.humanNeedsList.find(h => 
                    h.name.toLowerCase().includes(item.need.toLowerCase().substring(0, 15))
                  );
                  const count = match ? match.count : 0;
                  const totalCount = askesgilutStats.humanNeedsList.reduce((s, h) => s + h.count, 0) || 1;
                  const pct = Math.round((count / totalCount) * 100);

                  return (
                    <div key={idx} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 hover:border-purple-200 transition-colors">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                          {item.need}
                        </span>
                        <span className="font-mono font-bold text-purple-700">{count} kasus ({pct}%)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-1.5">{item.desc}</p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, Math.max(count > 0 ? 5 : 0, pct * 2))}%`, backgroundColor: item.color }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Clinical Diagnostic Guide */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50/60 to-pink-50/40 p-5 rounded-xl border border-purple-200/80">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info size={14} className="text-purple-600" /> Prinsip Diagnosis Askesgilut (PES Format)
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Diagnosis asuhan kesehatan gigi dirumuskan dalam format <span className="font-bold text-purple-800">PES</span>:
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-purple-700 shrink-0">P (Problem):</span>
                      <span>Kebutuhan manusia yang belum terpenuhi (Unmet Human Needs)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-purple-700 shrink-0">E (Etiology):</span>
                      <span>Penyebab spesifik seperti penumpukan plak, kalkulus supra/subgingiva, konsumsi sukrosa berlebih</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-purple-700 shrink-0">S (Signs & Symptoms):</span>
                      <span>Tanda klinis objektif seperti skor OHI-S &gt; 1.2, gingiva bengkak kemerahan, perdarahan BOP</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Integrasi dengan Rencana Perawatan (Planning)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Setiap diagnosis kebutuhan manusia secara langsung memandu penetapan <span className="font-semibold text-slate-700">Client-Centered Goals</span> dan intervensi promotif/preventif yang disepakati melalui Informed Consent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TINDAKAN & EVALUASI ASUHAN */}
      {activeTab === 'interventions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interventions Frequency Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Rekapitulasi Tindakan Pelayanan Askesgilut</h3>
                  <p className="text-xs text-slate-500">Frekuensi intervensi klinis preventif, promotif, dan kuratif</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {askesgilutStats.prevRatio}% Preventif
                </span>
              </div>

              <div className="space-y-3">
                {askesgilutStats.interventionsList.map((item, idx) => {
                  const maxCount = Math.max(...askesgilutStats.interventionsList.map(i => i.count), 1);
                  const barWidth = Math.round((item.count / maxCount) * 100);
                  const isPreventive = /skeling|dhe|fluor|sealant/i.test(item.name);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span className={cn("w-2 h-2 rounded-full", isPreventive ? "bg-emerald-500" : "bg-purple-600")}></span>
                          {item.name}
                        </span>
                        <span className="font-mono font-bold text-slate-700">{item.count} tindakan</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", isPreventive ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-purple-600 to-pink-500")} 
                          style={{ width: `${Math.max(5, barWidth)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Promotif / Preventif</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600"></span> Kuratif Sederhana</span>
                </div>
              </div>
            </div>

            {/* Evaluation & Outcome Metrics */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Evaluasi Keberhasilan Askesgilut</h3>
                    <p className="text-xs text-slate-500">Hasil luaran klinis asuhan gigi dan kepatuhan kontrol</p>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Outcome Based
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">Higiene Membaik (Baik/Sedang)</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                      {Math.round(((askesgilutStats.ohisBaik + askesgilutStats.ohisSedang) / askesgilutStats.total) * 100)}%
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium mt-0.5">{askesgilutStats.ohisBaik + askesgilutStats.ohisSedang} pasien mencapai standar</p>
                  </div>

                  <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl">
                    <p className="text-[10px] font-bold text-purple-700 uppercase">Rekam Asuhan Selesai (Final)</p>
                    <p className="text-2xl font-black text-purple-700 mt-1 font-mono">
                      {askesgilutStats.completedAskes}
                    </p>
                    <p className="text-[10px] text-purple-600 font-medium mt-0.5">dari {askesgilutStats.total} total kunjungan</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs border border-slate-100">
                    <span className="text-slate-600 font-medium">Jadwal Kontrol Ulang Terjadwal:</span>
                    <span className="font-mono font-bold text-slate-800">{askesgilutStats.controlledVisits} pasien</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs border border-slate-100">
                    <span className="text-slate-600 font-medium">Indikator Pasien Bebas Karies (Caries Free):</span>
                    <span className="font-mono font-bold text-emerald-600">{askesgilutStats.cariesFreePct}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 bg-purple-50/40 p-3 rounded-xl border border-purple-100">
                <p className="text-[11px] text-purple-900 leading-relaxed">
                  <span className="font-bold">Standar Evaluasi:</span> Evaluasi dilakukan setelah tindakan dengan mengukur ulang indeks kebersihan mulut (OHI-S / PCR) dan memastikan tercapainya kemandirian pemeliharaan kesehatan gigi pasien di rumah.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REKAP BULANAN & EKSPOR (MONTHLY & EXPORT) */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          {/* Monthly Report Controls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <ClipboardList className="text-purple-600" size={18} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Filter & Ekspor Rekapitulasi Askesgilut Bulanan</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5 w-full">
                <label className="text-xs font-medium text-slate-700">Pilih Bulan Pelayanan</label>
                <select 
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-xs font-medium transition-all"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-xs font-medium transition-all"
                >
                  {[2024, 2025, 2026, 2027].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2.5 w-full md:w-auto">
                <button 
                  onClick={exportPDF}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                >
                  <Download size={15} /> Cetak PDF Askesgilut
                </button>
                <button 
                  onClick={exportExcel}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                >
                  <TrendingUp size={15} /> Ekspor Excel Askesgilut
                </button>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Pratinjau Data Askesgilut Terperinci</h2>
                <p className="text-xs text-slate-500">Rekap data periode {selectedMonth}/{selectedYear} UPTD Puskesmas Kopo</p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500">
                {records.filter(r => {
                  const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.visitDate);
                  return (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
                }).length} pasien pada periode ini
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="px-5 py-3 w-12 text-center">No</th>
                    <th className="px-5 py-3">No RM</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Nama Pasien</th>
                    <th className="px-5 py-3">OHI-S & Kriteria</th>
                    <th className="px-5 py-3">DMF-T</th>
                    <th className="px-5 py-3">Ringkasan Pengkajian & Diagnosis Askesgilut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.filter(r => {
                    const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.visitDate);
                    return (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
                  }).map((record, i) => {
                    const p = patients.find(pat => pat.id === record.patientId);
                    const ohisVal = record.indices?.ohis?.total || 0;
                    const ohisCat = record.indices?.ohis?.category || (ohisVal <= 1.2 ? 'Baik' : ohisVal <= 3.0 ? 'Sedang' : 'Buruk');
                    const badgeColor = ohisVal <= 1.2 
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                      : ohisVal <= 3.0 
                        ? 'text-amber-700 bg-amber-50 border-amber-200' 
                        : 'text-rose-700 bg-rose-50 border-rose-200';

                    return (
                      <tr key={record.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="px-5 py-3 text-center text-slate-400 font-mono">{i + 1}</td>
                        <td className="px-5 py-3 font-mono font-medium text-slate-800">
                          {p?.rmNumber || 'N/A'}
                        </td>
                        <td className="px-5 py-3 text-slate-600 font-medium">{record.visitDate || '-'}</td>
                        <td className="px-5 py-3 font-semibold text-slate-900">{p?.name || 'Anonim'}</td>
                        <td className="px-5 py-3">
                          <span className={cn("px-2 py-0.5 rounded text-[11px] font-bold border inline-flex items-center gap-1", badgeColor)}>
                            <span>{ohisVal}</span>
                            <span className="text-[9px] uppercase font-sans">({ohisCat})</span>
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono font-medium text-purple-700">
                          {record.indices?.dmft?.total || 0}
                        </td>
                        <td className="px-5 py-3 text-slate-600 max-w-md">
                          {formatAssessment(record)}
                        </td>
                      </tr>
                    );
                  })}
                  {records.filter(r => {
                    const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.visitDate);
                    return (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        Belum ada data kunjungan asuhan gigi pada periode {selectedMonth}/{selectedYear}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
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
