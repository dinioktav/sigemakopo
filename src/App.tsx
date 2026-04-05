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
  Activity,
  TrendingUp,
  AlertTriangle,
  Receipt,
  FileCheck,
  Video
} from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Login } from './components/Login';
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

const MOCK_CHART_DATA = [
  { name: 'Jan', dmft: 4.5, ohis: 1.2 },
  { name: 'Feb', dmft: 4.2, ohis: 1.1 },
  { name: 'Mar', dmft: 4.0, ohis: 1.0 },
  { name: 'Apr', dmft: 3.8, ohis: 0.9 },
  { name: 'May', dmft: 3.5, ohis: 0.8 },
];

const MOCK_PIE_DATA = [
  { name: 'Karies', value: 45, color: '#EF4444' },
  { name: 'Gingivitis', value: 25, color: '#F59E0B' },
  { name: 'Periodontitis', value: 15, color: '#8B5CF6' },
  { name: 'Sehat', value: 15, color: '#10B981' },
];

const Dashboard = () => (
  <div className="p-8">
    <header className="mb-10">
      <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Dashboard siGemaKopo</h1>
      <p className="text-navy/40 font-medium mt-1">Ringkasan operasional asuhan kesehatan gigi hari ini.</p>
    </header>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
      {[
        { label: 'Total Pasien', value: '1,284', icon: Users, color: 'bg-navy' },
        { label: 'Kunjungan Hari Ini', value: '24', icon: Calendar, color: 'bg-pink' },
        { label: 'Billing Pending', value: 'Rp 4.2M', icon: Receipt, color: 'bg-navy-light' },
        { label: 'Consent Signed', value: '98%', icon: FileCheck, color: 'bg-pink-light' },
      ].map((stat, i) => (
        <div key={i} className="glass-card p-8 rounded-[2.5rem] flex items-center gap-6 group hover:scale-[1.02] transition-all duration-300">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", stat.color)}>
            <stat.icon size={28} />
          </div>
          <div>
            <p className="text-xs text-navy/30 font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-navy tracking-tighter">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-navy uppercase tracking-widest text-xs">Tren Kesehatan Gigi Populasi</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-navy"></div>
              <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">DMF-T</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink"></div>
              <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest">OHI-S</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)', padding: '16px' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="dmft" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar dataKey="ohis" fill="#db2777" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass-card p-8 rounded-[2.5rem]">
        <h3 className="font-black text-navy uppercase tracking-widest text-xs mb-8">Prevalensi Penyakit</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MOCK_PIE_DATA}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
              >
                {MOCK_PIE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)', padding: '16px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 space-y-3">
          {MOCK_PIE_DATA.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] font-black text-navy/60 uppercase tracking-widest">{item.name}</span>
              </div>
              <span className="text-xs font-black text-navy">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Reports = () => (
  <div className="p-8">
    <header className="mb-10">
      <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Pelaporan Agregat</h1>
      <p className="text-navy/40 font-medium mt-1">Analisis data kesehatan gigi dan mulut populasi.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
      {[
        { label: 'Rata-rata OHI-S', value: '1.2', status: 'Baik', color: 'text-pink', bg: 'bg-pink-soft' },
        { label: 'Rata-rata DMF-T', value: '4.2', status: 'Sedang', color: 'text-navy', bg: 'bg-navy-50' },
        { label: 'Cakupan Pelayanan', value: '85%', status: 'Meningkat', color: 'text-pink-light', bg: 'bg-pink-soft/50' },
      ].map((item, i) => (
        <div key={i} className="glass-card p-8 rounded-[2.5rem]">
          <p className="text-xs text-navy/30 font-black uppercase tracking-widest mb-2">{item.label}</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-navy tracking-tighter">{item.value}</p>
            <span className={cn("text-[10px] font-black px-3 py-1 rounded-full mb-1 uppercase tracking-widest", item.bg, item.color)}>
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>

    <div className="glass-card p-10 rounded-[3rem]">
      <h3 className="font-black text-navy uppercase tracking-widest text-sm mb-10">Laporan Epidemiologi (WHO Standard)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MOCK_CHART_DATA}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)', padding: '16px' }}
            />
            <Line type="monotone" dataKey="dmft" stroke="#0f172a" strokeWidth={4} dot={{ r: 6, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="ohis" stroke="#db2777" strokeWidth={4} dot={{ r: 6, fill: '#db2777', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link 
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-pink text-white shadow-lg shadow-pink/20" 
        : "text-navy/60 hover:bg-pink-soft hover:text-pink"
    )}
  >
    <Icon size={20} className={cn(active ? "text-white" : "group-hover:text-pink")} />
    <span className="font-medium">{label}</span>
  </Link>
);

const SettingsPage = () => (
  <div className="p-8">
    <header className="mb-10">
      <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Pengaturan Sistem</h1>
      <p className="text-navy/40 font-medium mt-1">Konfigurasi klinik dan preferensi aplikasi.</p>
    </header>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-card p-10 rounded-[3rem]">
        <h3 className="text-xl font-black text-navy uppercase tracking-tight mb-8">Profil Klinik</h3>
        <div className="space-y-6">
          {[
            { label: 'Nama Klinik', value: 'siGemaKopo Dental Care' },
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
    </div>
  </div>
);

const Layout = ({ children, userData, onLogout }: { children: React.ReactNode, userData: { role: string, fullName: string }, onLogout: () => void }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-navy-50 flex dental-pattern">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-2xl border-r border-navy/5 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 shadow-2xl shadow-navy/5",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-pink font-black text-2xl shadow-xl shadow-navy/20 transform -rotate-6">
              S
            </div>
            <div>
              <h2 className="text-xl font-black text-navy tracking-tighter uppercase leading-none">siGemaKopo</h2>
              <p className="text-[8px] font-black text-pink uppercase tracking-[0.3em] mt-1">Dental Care</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.2em] mb-4 ml-4">Menu Utama</p>
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
            <SidebarItem to="/patients" icon={Users} label="Data Pasien" active={location.pathname.startsWith('/patients')} />
            <SidebarItem to="/records" icon={ClipboardList} label="Rekam Dental" active={location.pathname.startsWith('/records')} />
            <SidebarItem to="/informed-consent" icon={FileCheck} label="Informed Consent" active={location.pathname === '/informed-consent'} />
            <SidebarItem to="/billing" icon={Receipt} label="Billing" active={location.pathname === '/billing'} />
            <SidebarItem to="/education" icon={Video} label="Edukasi Gigi" active={location.pathname === '/education'} />
            <SidebarItem to="/appointments" icon={Calendar} label="Jadwal" active={location.pathname === '/appointments'} />
            <SidebarItem to="/reports" icon={BarChart3} label="Pelaporan" active={location.pathname === '/reports'} />
            <SidebarItem to="/security" icon={ShieldCheck} label="Keamanan" active={location.pathname === '/security'} />
          </nav>

          <div className="pt-6 border-t border-navy/5 space-y-2">
            <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.2em] mb-4 ml-4">Sistem</p>
            <SidebarItem to="/settings" icon={Settings} label="Pengaturan" active={location.pathname === '/settings'} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy/5 rounded-full blur-[120px] -z-10"></div>
        
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-navy/5 flex items-center justify-between px-6 sticky top-0 z-40">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-navy/60 hover:bg-navy-50 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" size={18} />
              <input 
                type="text" 
                placeholder="Cari pasien atau rekam medis..." 
                className="w-full pl-10 pr-4 py-2 bg-navy-50 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-xl text-sm transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-navy/40 hover:bg-navy-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-navy/5 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-navy leading-none">{userData.fullName}</p>
                <p className="text-[10px] font-bold text-pink mt-1 uppercase tracking-wider">{userData.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="w-10 h-10 rounded-full bg-pink-soft border-2 border-white shadow-sm overflow-hidden hover:opacity-80 transition-all"
                >
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.fullName}`} alt="User" referrerPolicy="no-referrer" />
                </button>
                <button 
                  onClick={onLogout}
                  className="p-2 text-navy/20 hover:text-pink transition-all bg-white rounded-lg border border-navy/5 shadow-sm"
                  title="Keluar"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/patients" element={<PatientList />} />
                <Route path="/records" element={<DentalHygieneForm />} />
                <Route path="/informed-consent" element={<InformedConsent />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/education" element={<DentalEducation />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/security" element={<Security />} />
                <Route path="/settings" element={<SettingsPage />} />
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
  const [userData, setUserData] = useState({ role: '', fullName: '' });

  if (!isAuthenticated) {
    return <Login onLogin={(data) => {
      setIsAuthenticated(true);
      setUserData(data);
    }} />;
  }

  return (
    <Router>
      <Layout userData={userData} onLogout={() => setIsAuthenticated(false)}>
        <div />
      </Layout>
    </Router>
  );
}
