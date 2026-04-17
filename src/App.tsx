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
  Download
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Login } from './components/Login';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
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
        alert("Profil berhasil diperbarui!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-navy tracking-tight uppercase">Profil Saya</h1>
        <p className="text-navy/40 font-medium mt-1">Kelola informasi pribadi dan identitas profesional Anda.</p>
      </header>

      <div className="max-w-4xl">
        <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="relative group">
              <div className="w-48 h-48 rounded-[3rem] bg-navy overflow-hidden border-4 border-white shadow-2xl relative">
                <img 
                  src={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.fullName}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-navy/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                  <Camera className="text-gold mb-2" size={32} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Ganti Foto</span>
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
              </div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-navy shadow-xl border-4 border-white">
                <User size={20} />
              </div>
            </div>

            <div className="flex-1 space-y-8 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20" size={18} />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-14 pr-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold disabled:opacity-60" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Jenis Tenaga (Informasi)</label>
                  <div className="relative">
                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20" size={18} />
                    <select 
                      disabled={!isEditing}
                      value={formData.jenisTenaga}
                      onChange={(e) => setFormData({ ...formData, jenisTenaga: e.target.value })}
                      className="w-full pl-14 pr-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold disabled:opacity-60 appearance-none"
                    >
                      <option value="Administrasi Umum">Administrasi Umum</option>
                      <option value="Terapis Gigi dan Mulut">Terapis Gigi dan Mulut</option>
                      <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                      <option value="Pasien">Pasien</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-navy-50/30 rounded-3xl border border-navy/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest">System Role (Read Only)</p>
                    <p className="text-sm font-black text-navy uppercase tracking-tight mt-1">{userData.role}</p>
                  </div>
                  <ShieldCheck className="text-gold" size={24} />
                </div>
                <p className="text-[9px] text-navy/30 font-bold uppercase tracking-widest mt-4 italic">* Role sistem menentukan hak akses Anda dan hanya dapat diubah oleh Administrator.</p>
              </div>

              <div className="pt-6 flex gap-4">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-10 py-4 bg-navy text-gold rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all uppercase tracking-widest text-xs disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                      Simpan Perubahan
                    </button>
                    <button 
                      onClick={() => {
                        setFormData(userData);
                        setIsEditing(false);
                      }}
                      disabled={isSaving}
                      className="px-10 py-4 bg-white border-2 border-navy/5 text-navy/40 rounded-2xl font-black hover:border-pink hover:text-pink transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-10 py-4 bg-navy text-gold rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all uppercase tracking-widest text-xs"
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

const Dashboard = () => (
  <div className="p-8 space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Total Pasien', value: '0', icon: Users, color: 'bg-primary' },
        { label: 'Kunjungan Hari Ini', value: '0', icon: Calendar, color: 'bg-primary' },
        { label: 'Billing Pending', value: 'Rp 0', icon: Receipt, color: 'bg-danger' },
        { label: 'Antrean Aktif', value: '0', icon: Activity, color: 'bg-success' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-primary/30 transition-all group">
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110", stat.color)}>
            <stat.icon size={22} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-700 uppercase tracking-widest text-[11px]">Tren Pelayanan & Kesehatan Gigi</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/20 border-2 border-primary"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DMF-T</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/10 border-2 border-primary/50"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OHI-S</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="dmft" fill="#db2777" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="ohis" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-700 uppercase tracking-widest text-[11px] mb-8 pb-4 border-b border-gray-50">Sebaran Kasus Pasien</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MOCK_PIE_DATA}
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {MOCK_PIE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 space-y-3">
          {MOCK_PIE_DATA.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.name}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Reports = () => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const q = query(collection(db, 'dental_records'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecords(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analisis data kesehatan gigi berikut untuk populasi:
        Data DMF-T: ${JSON.stringify(MOCK_CHART_DATA.map(d => ({ bulan: d.name, dmft: d.dmft })))}
        Data OHI-S: ${JSON.stringify(MOCK_CHART_DATA.map(d => ({ bulan: d.name, ohis: d.ohis })))}
        Prevalensi Penyakit: ${JSON.stringify(MOCK_PIE_DATA)}
        
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
    const doc = new jsPDF();
    const filtered = records.filter(r => {
      const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.visitDate);
      return (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
    });

    doc.setFontSize(18);
    doc.text('Laporan Bulanan Pelayanan Gigi', 14, 22);
    doc.setFontSize(11);
    doc.text(`Periode: ${selectedMonth}/${selectedYear}`, 14, 30);
    doc.text(`SIGEMA KOPO - UPTD Puskesmas Kopo`, 14, 38);

    const tableData = filtered.map(r => [
      r.visitDate,
      r.patientId, // In real case, join with patient name
      r.askesgilut?.diagnoses?.map((d: any) => d.kebutuhan).join(', ') || '-',
      `Rp ${(r.billing?.total || 0).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Tanggal', 'ID Pasien', 'Layanan/Diagnosis', 'Billing']],
      body: tableData,
    });

    doc.save(`Laporan_Bulanan_${selectedMonth}_${selectedYear}.pdf`);
  };

  const exportExcel = () => {
    const filtered = records.filter(r => {
      const date = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.visitDate);
      return (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
    });

    const worksheet = XLSX.utils.json_to_sheet(filtered.map(r => ({
      'Tanggal': r.visitDate,
      'ID Pasien': r.patientId,
      'Layanan': r.askesgilut?.diagnoses?.map((d: any) => d.kebutuhan).join(', ') || '-',
      'Total Billing': r.billing?.total || 0,
      'Status Bayar': r.billing?.status || 'Pending'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
    XLSX.writeFile(workbook, `Laporan_Bulanan_${selectedMonth}_${selectedYear}.xlsx`);
  };

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-navy tracking-tight uppercase">Statistik & Laporan</h1>
          <p className="text-navy/40 font-medium mt-1">Analisis data kesehatan gigi dan mulut populasi.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-pink text-white rounded-2xl font-bold hover:bg-pink-dark shadow-xl shadow-pink/20 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={20} /> : <Activity size={20} />}
            {isAnalyzing ? 'Menganalisis...' : 'Analisis AI'}
          </button>
        </div>
      </header>

      {/* Monthly Report Controls */}
      <div className="glass-card p-10 rounded-[3rem] mb-10 bg-navy text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink/20 rounded-full blur-[80px] -z-0"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <ClipboardList className="text-pink" size={24} />
            <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-80">Export Laporan Bulanan</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Pilih Bulan</label>
              <select 
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-6 py-4 bg-white/10 border-2 border-transparent focus:bg-white focus:text-navy focus:border-pink rounded-2xl text-sm font-bold transition-all appearance-none"
              >
                {Array.from({length: 12}).map((_, i) => (
                  <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('id-ID', {month: 'long'})}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Pilih Tahun</label>
              <select 
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-6 py-4 bg-white/10 border-2 border-transparent focus:bg-white focus:text-navy focus:border-pink rounded-2xl text-sm font-bold transition-all appearance-none"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={exportPDF}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-pink text-white rounded-2xl font-black hover:bg-pink-dark transition-all uppercase tracking-widest text-[10px]"
              >
                <Download size={18} /> Export PDF
              </button>
              <button 
                onClick={exportExcel}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-2xl font-black hover:bg-green-600 transition-all uppercase tracking-widest text-[10px]"
              >
                <TrendingUp size={18} /> Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {[
          { label: 'Total Rekam Medis', value: records.length, status: 'Total', color: 'text-pink', bg: 'bg-pink-soft' },
          { label: 'Bulan Ini', value: records.filter(r => (r.createdAt?.toDate ? r.createdAt.toDate().getMonth() : new Date(r.visitDate).getMonth()) === new Date().getMonth()).length, status: 'Aktif', color: 'text-navy', bg: 'bg-navy-50' },
          { label: 'Total Billing', value: `Rp ${records.reduce((acc, r) => acc + (r.billing?.total || 0), 0).toLocaleString()}`, status: 'Pendapatan', color: 'text-pink-light', bg: 'bg-pink-soft/50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-navy/5 shadow-sm">
            <p className="text-[10px] text-navy/30 font-bold uppercase tracking-widest mb-2">{item.label}</p>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-navy tracking-tighter">{item.value}</p>
              <span className={cn("text-[9px] font-bold px-3 py-1 rounded-full mb-1 uppercase tracking-widest", item.bg, item.color)}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-10 rounded-[3rem] border border-navy/5 shadow-sm">
          <h3 className="font-bold text-navy uppercase tracking-widest text-[11px] mb-10">Laporan Epidemiologi (WHO Standard)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)', padding: '16px' }}
                />
                <Line type="monotone" dataKey="dmft" stroke="#1e293b" strokeWidth={3} dot={{ r: 5, fill: '#1e293b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="ohis" stroke="#db2777" strokeWidth={3} dot={{ r: 5, fill: '#db2777', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <AnimatePresence>
          {aiAnalysis && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-10 rounded-[3rem] border border-pink/10 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pink rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Activity size={18} />
                </div>
                <h3 className="font-bold text-navy uppercase tracking-widest text-[11px]">Hasil Analisis AI</h3>
              </div>
              <div className="prose prose-sm prose-navy max-w-none text-navy/70 font-medium leading-relaxed">
                {aiAnalysis.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
        "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative whitespace-nowrap overflow-hidden",
        active 
          ? "bg-primary text-white shadow-md shadow-primary/20" 
          : "text-white/60 hover:bg-white/5 hover:text-white",
        isCollapsed && "justify-center px-0"
      )}
    >
      <Icon size={18} className={cn("transition-colors shrink-0", active ? "text-white" : "text-white/40 group-hover:text-white")} />
      {!isCollapsed && <span className={cn("text-sm font-medium transition-all")}>{label}</span>}
    </Link>
  );
};

const SettingsPage = ({ userRole }: { userRole: string }) => (
  <div className="p-8">
    <header className="mb-10">
      <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Pengaturan Sistem</h1>
      <p className="text-navy/40 font-medium mt-1">Konfigurasi klinik dan preferensi aplikasi.</p>
    </header>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card p-10 rounded-[3rem]">
        <h3 className="text-xl font-black text-navy uppercase tracking-tight mb-8">Profil Klinik</h3>
        <div className="space-y-6">
          {[
            { label: 'Nama Klinik', value: 'SIGEMA KOPO' },
            { label: 'Tagline', value: 'Sistem Kesehatan Gigi Masyarakat Kopo' },
            { label: 'Alamat', value: 'Jl. Kopo No. 123, Bandung' },
            { label: 'Telepon', value: '022-1234567' },
          ].map((field, i) => (
            <div key={i} className="space-y-2">
              <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">{field.label}</label>
              <input type="text" defaultValue={field.value} className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass-card p-10 rounded-[3rem]">
          <h3 className="text-xl font-black text-navy uppercase tracking-tight mb-8">Preferensi Sistem</h3>
          <div className="space-y-6">
            {[
              { label: 'Bahasa', value: 'Bahasa Indonesia' },
              { label: 'Zona Waktu', value: 'WIB (UTC+7)' },
            ].map((field, i) => (
              <div key={i} className="space-y-2">
                <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">{field.label}</label>
                <select className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold appearance-none">
                  <option>{field.value}</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {userRole === 'Super Admin' && (
          <div className="glass-card p-10 rounded-[3rem] border-2 border-gold/20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-navy uppercase tracking-tight">Manajemen Pengguna</h3>
              <ShieldCheck className="text-gold" size={24} />
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-pink-soft text-pink rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-pink/10">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-black text-navy uppercase tracking-tighter mb-2">Akses Terbatas</h2>
        <p className="text-navy/40 font-medium max-w-md">Maaf, akun Anda tidak memiliki izin untuk mengakses modul ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.</p>
      </div>
    );
  }
  return <>{children}</>;
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-8 py-3 bg-white border-b border-gray-100 mb-6 shadow-sm">
      <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5 translate-y-[-0.5px]">
        <Home size={12} className="text-gray-300" />
      </Link>
      <ChevronRight size={10} className="text-gray-300" />
      {pathnames.length === 0 ? (
        <span className="text-primary">Dashboard</span>
      ) : (
        pathnames.map((name, index) => {
          const isLast = index === pathnames.length - 1;
          const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
          return (
            <React.Fragment key={name}>
              {index > 0 && <ChevronRight size={10} className="text-gray-300" />}
              <span className={cn(isLast ? "text-primary" : "text-gray-400")}>{displayName}</span>
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
  const location = useLocation();

  // Close sidebar on navigation for mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex relative overflow-x-hidden">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && !isSidebarCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-navy-dark/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-navy-dark border-r border-white/5 transition-all duration-300 transform lg:translate-x-0 lg:static lg:inset-0 shadow-xl flex flex-col",
        isSidebarCollapsed ? "w-20" : "w-64",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-4">
          <div className={cn("flex items-center mb-8 px-2 py-4 border-b border-white/5 relative", isSidebarCollapsed ? "justify-center" : "gap-3")}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
              S
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <h2 className="text-xs font-bold text-white tracking-tight leading-tight truncate">Sistem Informasi Kesehatan Gigi Masyarakat</h2>
                <p className="text-[9px] font-medium text-white/40 uppercase tracking-wider mt-0.5 truncate">UPTD Puskesmas Kopo</p>
              </div>
            )}
            
            {/* Desktop Collapse Toggle */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute -right-7 top-1/2 -translate-y-1/2 w-6 h-6 bg-navy-dark border border-white/5 rounded-full hidden lg:flex items-center justify-center text-white/40 hover:text-white transition-all z-10"
            >
              <ChevronRight size={12} className={cn("transition-transform", !isSidebarCollapsed && "rotate-180")} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} permission="dashboard" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <div className="py-2"></div>
            {!isSidebarCollapsed && <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 px-4">Master Data</p>}
            <SidebarItem to="/patients" icon={Users} label="Data Pasien" active={location.pathname.startsWith('/patients')} permission="patients" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            
            <div className="py-2"></div>
            {!isSidebarCollapsed && <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 px-4">Transaksi</p>}
            <SidebarItem to="/records" icon={ClipboardList} label="Pelayanan" active={location.pathname.startsWith('/records')} permission="records" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <SidebarItem to="/informed-consent" icon={FileCheck} label="Informed Consent" active={location.pathname === '/informed-consent'} permission="informed-consent" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <SidebarItem to="/billing" icon={Receipt} label="Billing & Kasir" active={location.pathname === '/billing'} permission="billing" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            
            <div className="py-2"></div>
            {!isSidebarCollapsed && <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 px-4">Pelaporan</p>}
            <SidebarItem to="/reports" icon={BarChart3} label="Statistik & Laporan" active={location.pathname === '/reports'} permission="reports" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <SidebarItem to="/education" icon={Video} label="Materi Edukasi" active={location.pathname === '/education'} permission="education" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <SidebarItem to="/appointments" icon={Calendar} label="Jadwal Reservasi" active={location.pathname === '/appointments'} permission="appointments" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
          </nav>

          <div className="pt-4 border-t border-white/5 space-y-1">
            <SidebarItem to="/settings" icon={Settings} label="Pengaturan" active={location.pathname === '/settings'} permission="settings" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
            <SidebarItem to="/security" icon={ShieldCheck} label="Keamanan" active={location.pathname === '/security'} permission="security" userRole={userData.role} isCollapsed={isSidebarCollapsed} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari pasien atau layanan..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg text-sm transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <div className="flex items-center gap-3 relative mr-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-800 leading-none">{userData.fullName}</p>
                <p className="text-[9px] font-bold text-primary mt-0.5 uppercase tracking-wider">{userData.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 shadow-sm overflow-hidden hover:border-primary transition-all flex items-center justify-center p-0.5"
                >
                  <img 
                    src={userData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName}`} 
                    alt="User" 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-cover rounded-md"
                  />
                </button>
                
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-14 w-64 bg-white border border-navy/10 rounded-3xl shadow-2xl p-6 z-50"
                    >
                      <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-20 h-20 rounded-3xl bg-navy-50 p-1 mb-4">
                          <img 
                            src={userData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName}`} 
                            alt="User" 
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        </div>
                        <h4 className="text-sm font-black text-navy uppercase tracking-tight">{userData.fullName}</h4>
                        <p className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mt-1">{userData.role}</p>
                      </div>
                      
                      <div className="space-y-1 mb-6">
                        <Link 
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-navy-50 text-navy/60 hover:text-navy transition-all text-xs font-black uppercase tracking-widest"
                        >
                          <Settings size={16} className="text-gold" />
                          Profil Saya
                        </Link>
                        <Link 
                          to="/security"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-navy-50 text-navy/60 hover:text-navy transition-all text-xs font-black uppercase tracking-widest"
                        >
                          <ShieldCheck size={16} className="text-gold" />
                          Keamanan
                        </Link>
                      </div>
                      
                      <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-pink-soft text-pink rounded-2xl hover:bg-pink hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                      >
                        <LogOut size={16} />
                        Keluar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
              transition={{ duration: 0.15 }}
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
        } catch (error) {
          console.error("Error fetching user role:", error);
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
      <div className="min-h-screen bg-navy flex items-center justify-center dental-pattern">
        <RefreshCw className="text-pink animate-spin" size={48} />
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
      <div className="min-h-screen bg-navy flex items-center justify-center p-6 dental-pattern">
        <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[3rem] shadow-2xl p-12 text-center border border-white/20">
          <div className="w-24 h-24 bg-navy-50 text-gold rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <ShieldCheck size={48} />
          </div>
          <h1 className="text-3xl font-black text-navy uppercase tracking-tighter mb-4">Menunggu Persetujuan</h1>
          <p className="text-navy/60 font-medium mb-8">Akun Anda sedang ditinjau oleh Super Admin. Anda akan mendapatkan akses penuh setelah akun Anda disetujui.</p>
          <button 
            onClick={handleLogout}
            className="w-full py-5 bg-navy text-white rounded-2xl font-black hover:bg-navy-light shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            <LogOut size={18} />
            Keluar
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
