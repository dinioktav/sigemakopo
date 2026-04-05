import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LoginProps {
  onLogin: (userData: { role: string, fullName: string }) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Terapis Gigi dan Mulut');
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setCaptchaInput('');
    setError('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== captchaText) {
      setError('Captcha tidak sesuai');
      generateCaptcha();
      return;
    }
    
    if (isRegistering) {
      alert('Akun berhasil dibuat! Silakan login.');
      setIsRegistering(false);
      generateCaptcha();
    } else {
      onLogin({ 
        role, 
        fullName: fullName || (username ? username.charAt(0).toUpperCase() + username.slice(1) : 'User') 
      });
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden dental-pattern">
      {/* Background Abstract Shapes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink/10 rounded-full blur-[150px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-light/5 rounded-full blur-[150px] -z-10"></div>
      
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 relative z-10">
        <div className="p-12 bg-gradient-to-br from-pink-soft/50 to-white border-b border-pink-soft/30 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-light/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-navy/5 rounded-full blur-3xl"></div>
          
          <div className="w-24 h-24 bg-navy rounded-[2rem] flex items-center justify-center text-pink font-black text-5xl mx-auto mb-8 shadow-2xl shadow-navy/40 relative z-10 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            S
          </div>
          <h1 className="text-4xl font-black text-navy tracking-tighter relative z-10 uppercase">siGemaKopo</h1>
          <p className="text-xs text-navy-light/40 mt-3 font-black relative z-10 uppercase tracking-[0.3em]">
            {isRegistering ? 'Pendaftaran Akun Baru' : 'Professional Dental Care'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          {isRegistering && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-black text-navy/70 uppercase tracking-wider">Nama Lengkap</label>
              <input 
                type="text" 
                required
                className="w-full p-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium"
                placeholder="Masukkan nama lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-navy/70 uppercase tracking-wider">Username</label>
            <input 
              type="text" 
              required
              className="w-full p-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-navy/70 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isRegistering && (
            <div className="space-y-2">
              <label className="text-xs font-black text-navy/70 uppercase tracking-wider">Pilih Role</label>
              <select 
                className="w-full p-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium appearance-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Admin</option>
                <option>Dokter Gigi</option>
                <option>Terapis Gigi dan Mulut</option>
                <option>Petugas Administrasi</option>
              </select>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-xs font-black text-navy/70 uppercase tracking-wider">Verifikasi Keamanan</label>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-navy p-4 rounded-2xl flex items-center justify-center select-none shadow-inner">
                <span className="text-2xl font-black text-pink-light tracking-[0.5em] italic opacity-90 line-through decoration-pink">
                  {captchaText}
                </span>
              </div>
              <button 
                type="button"
                onClick={generateCaptcha}
                className="p-4 bg-pink-soft text-pink rounded-2xl hover:bg-pink-200 transition-all shadow-sm"
              >
                <RefreshCw size={24} />
              </button>
            </div>
            <input 
              type="text" 
              required
              className={cn(
                "w-full p-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all text-center font-black tracking-widest",
                error && "border-pink bg-pink-soft/50"
              )}
              placeholder="Ketik kode di atas"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
            />
            {error && <p className="text-[10px] text-pink font-black text-center uppercase tracking-tighter">{error}</p>}
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-navy text-white rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            {isRegistering ? <UserPlus size={18} className="text-pink" /> : <LogIn size={18} className="text-pink" />}
            {isRegistering ? 'Daftar Sekarang' : 'Masuk ke Sistem'}
          </button>

          <div className="pt-4 flex flex-col items-center gap-4">
            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                generateCaptcha();
              }}
              className="text-xs font-black text-navy/60 hover:text-pink transition-colors flex items-center gap-2 uppercase tracking-wider"
            >
              {isRegistering ? (
                <>
                  <ArrowLeft size={14} />
                  Sudah punya akun? Login
                </>
              ) : (
                <>
                  Belum punya akun? Buat Akun
                  <UserPlus size={14} />
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-navy/30 font-bold uppercase tracking-widest">
              <ShieldCheck size={12} />
              <span>Terintegrasi dengan SATUSEHAT</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
