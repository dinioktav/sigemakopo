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

export const Security = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  const activityLogs: any[] = [];

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
          <div className="bg-navy p-8 rounded-[2.5rem] text-white shadow-2xl shadow-navy/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">Skor Keamanan Akun</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-6xl font-black tracking-tighter text-pink">0</span>
                <span className="text-xl font-black opacity-40 mb-2">/100</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                <div className="w-[0%] h-full bg-pink"></div>
              </div>
              <p className="text-[10px] font-bold opacity-60 leading-relaxed">Akun Anda sangat aman. Aktifkan 2FA untuk mencapai skor maksimal.</p>
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
