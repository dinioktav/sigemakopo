import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Smartphone, 
  History, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export const Security = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  const activityLogs = [
    { id: 1, action: 'Login Berhasil', device: 'Chrome on Windows', time: '2 menit yang lalu', status: 'Success' },
    { id: 2, action: 'Perubahan Password', device: 'Chrome on Windows', time: '1 jam yang lalu', status: 'Success' },
    { id: 3, action: 'Gagal Login', device: 'Unknown Device', time: '3 jam yang lalu', status: 'Warning' },
  ];

  return (
    <div className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-navy tracking-tight uppercase">Pusat Keamanan</h1>
        <p className="text-navy/40 font-medium mt-1">Kelola privasi, keamanan akun, dan log aktivitas sistem.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Change Password */}
          <div className="glass-card p-8 rounded-[2.5rem]">
            <h3 className="text-xl font-black text-navy uppercase tracking-tight mb-6 flex items-center gap-3">
              <Lock className="text-pink" /> Perbarui Kata Sandi
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full px-6 py-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium"
                    placeholder="••••••••"
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/20 hover:text-navy transition-all"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    className="w-full px-6 py-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Konfirmasi Kata Sandi</label>
                  <input 
                    type="password" 
                    className="w-full px-6 py-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button className="w-full py-4 bg-navy text-pink rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all uppercase tracking-widest text-xs">
                Simpan Perubahan Password
              </button>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="glass-card rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-navy/5 bg-navy-50/10 flex items-center justify-between">
              <h3 className="text-xl font-black text-navy uppercase tracking-tight flex items-center gap-3">
                <History className="text-pink" /> Log Aktivitas Terakhir
              </h3>
              <button className="text-[10px] font-black text-pink hover:underline uppercase tracking-widest">Lihat Semua</button>
            </div>
            <div className="divide-y divide-navy/5">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-6 flex items-center justify-between hover:bg-navy-50/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      log.status === 'Success' ? "bg-green-50 text-green-600" : "bg-pink-soft text-pink"
                    )}>
                      {log.status === 'Success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-navy uppercase tracking-tight">{log.action}</p>
                      <p className="text-[10px] text-navy/40 font-bold mt-0.5">{log.device}</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-navy/20 uppercase tracking-widest">{log.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Security Status */}
        <div className="space-y-8">
          {/* Security Score */}
          <div className="bg-navy-dark p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink/20 rounded-full blur-[80px] -z-0 group-hover:bg-pink/30 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="text-pink shrink-0" size={32} />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-80">Skor Keamanan Sistem</h3>
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-7xl font-black tracking-tighter text-white">85</span>
                <span className="text-2xl font-black text-pink">/100</span>
              </div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-8">Status: Sangat Aman</p>
              
              <div className="space-y-4">
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-pink to-pink-light shadow-[0_0_20px_rgba(219,39,119,0.5)]"
                  ></motion.div>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                  <span>Lemah</span>
                  <span>Kuat</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2FA Toggle */}
          <div className="glass-card p-8 rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Smartphone className="text-pink" size={24} />
                <h4 className="text-xs font-black text-navy uppercase tracking-widest">Autentikasi 2 Faktor</h4>
              </div>
              <button 
                onClick={() => setTwoFactor(!twoFactor)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  twoFactor ? "bg-navy" : "bg-navy-50"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full transition-all",
                  twoFactor ? "right-1 bg-pink" : "left-1 bg-navy/20"
                )}></div>
              </button>
            </div>
            <p className="text-[10px] text-navy/40 font-medium leading-relaxed">Tambahkan lapisan keamanan ekstra dengan kode verifikasi yang dikirim ke perangkat seluler Anda.</p>
          </div>

          {/* Sessions */}
          <div className="bg-pink-soft/30 p-8 rounded-[2.5rem] border border-pink/10">
            <h4 className="text-xs font-black text-navy uppercase tracking-widest mb-6">Sesi Aktif</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-navy uppercase tracking-tight">Sesi Saat Ini</p>
                  <p className="text-[9px] text-pink font-bold">Aktif Sekarang</p>
                </div>
                <button className="p-2 text-navy/20 hover:text-pink transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
