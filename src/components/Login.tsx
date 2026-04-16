import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, LogIn, UserPlus, ArrowLeft, Mail, Key, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { auth, googleProvider, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface LoginProps {
  onLogin: (userData: { role: string, fullName: string, photoURL: string, jenisTenaga: string, isApproved: boolean }) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('Dini Nur Oktaviani');
  const [role, setRole] = useState('Administrasi Umum');
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      let userRole = 'Pasien';
      
      if (userDoc.exists()) {
        userRole = userDoc.data().role;
      } else {
        // Save default role for new Google users
        const isOwner = result.user.email?.toLowerCase() === 'nuroktav.do@gmail.com';
        userRole = isOwner ? 'Super Admin' : 'Pasien';
        await setDoc(doc(db, 'users', result.user.uid), {
          fullName: result.user.displayName || 'User',
          role: userRole,
          jenisTenaga: userRole,
          email: result.user.email,
          isApproved: true, // New Google users default to Pasien (auto-approved) or Super Admin
          updatedAt: new Date().toISOString()
        });
      }

      onLogin({ 
        role: userRole,
        fullName: result.user.displayName || 'User',
        photoURL: result.user.photoURL || '',
        jenisTenaga: userDoc.exists() ? (userDoc.data().jenisTenaga || userRole) : userRole,
        isApproved: userDoc.exists() ? (userDoc.data().isApproved ?? true) : true
      });
    } catch (err: any) {
      setError('Gagal masuk dengan Google: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInAnonymously(auth);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      let userRole = 'Pasien';
      
      if (userDoc.exists()) {
        userRole = userDoc.data().role;
      } else {
        // Save default role for new anonymous users
        await setDoc(doc(db, 'users', result.user.uid), {
          fullName: 'Anonymous User',
          role: userRole,
          jenisTenaga: userRole,
          email: 'anonymous@system',
          isApproved: true,
          updatedAt: new Date().toISOString()
        });
      }

      onLogin({ 
        role: userRole,
        fullName: 'Anonymous User',
        photoURL: '',
        jenisTenaga: userDoc.exists() ? (userDoc.data().jenisTenaga || userRole) : userRole,
        isApproved: true
      });
    } catch (err: any) {
      setError('Gagal masuk secara anonim: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Masukkan email Anda');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Email pemulihan kata sandi telah dikirim!');
    } catch (err: any) {
      setError('Gagal mengirim email: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== captchaText) {
      setError('Captcha tidak sesuai');
      generateCaptcha();
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: fullName });
        
        const needsApproval = ['Administrasi Umum', 'Terapis Gigi dan Mulut', 'Dosen Pembimbing'].includes(role);
        
        // Save role to Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
          fullName,
          role,
          jenisTenaga: role, // Default jenisTenaga to the selected role
          email,
          isApproved: !needsApproval,
          createdAt: new Date().toISOString()
        });
        
        if (needsApproval) {
          alert('Pendaftaran berhasil! Akun Anda memerlukan persetujuan Super Admin sebelum dapat digunakan.');
        } else {
          alert('Akun berhasil dibuat! Silakan login.');
        }
        setIsRegistering(false);
        generateCaptcha();
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        const userRole = userDoc.exists() ? userDoc.data().role : role;
        const isApproved = userDoc.exists() ? (userDoc.data().isApproved ?? true) : true;

        onLogin({ 
          role: userRole, 
          fullName: result.user.displayName || 'User',
          photoURL: result.user.photoURL || '',
          jenisTenaga: userDoc.exists() ? (userDoc.data().jenisTenaga || userRole) : userRole,
          isApproved: isApproved
        });
      }
    } catch (err: any) {
      setError('Gagal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden dental-pattern">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink/10 rounded-full blur-[150px] -z-10 animate-pulse"></div>
        <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 relative z-10">
          <div className="p-12 bg-gradient-to-br from-pink-soft/50 to-white border-b border-pink-soft/30 text-center">
            <div className="w-24 h-24 bg-navy rounded-[2rem] flex items-center justify-center text-pink font-black text-5xl mx-auto mb-8 shadow-2xl shadow-navy/40 transform -rotate-6">
              S
            </div>
            <h1 className="text-4xl font-black text-navy tracking-tighter uppercase">Lupa Password</h1>
            <p className="text-xs text-navy-light/40 mt-3 font-black uppercase tracking-[0.3em]">Pulihkan Akses Anda</p>
          </div>

          <form onSubmit={handleForgotPassword} className="p-12 space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-navy/70 uppercase tracking-wider">Email Terdaftar</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" size={18} />
                <input 
                  type="email" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-[10px] text-pink font-black text-center uppercase tracking-tighter">{error}</p>}
            {message && <p className="text-[10px] text-green-600 font-black text-center uppercase tracking-tighter">{message}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-navy text-white rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Mail size={18} className="text-pink" />}
              Kirim Link Pemulihan
            </button>

            <button 
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="w-full text-xs font-black text-navy/60 hover:text-pink transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <ArrowLeft size={14} />
              Kembali ke Login
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-black text-navy tracking-tighter relative z-10 uppercase">SIGEMA KOPO</h1>
          <p className="text-xs text-navy-light/40 mt-3 font-black relative z-10 uppercase tracking-[0.3em]">
            {isRegistering ? 'Pendaftaran Akun Baru' : 'SIGEMA KOPO : Sistem Kesehatan Gigi Masyarakat Kopo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-6">
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
            <label className="text-xs font-black text-navy/70 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium"
              placeholder="email@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {isRegistering && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-black text-navy/70 uppercase tracking-wider">Pilih Tenaga / Role</label>
              <select 
                className="w-full p-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium appearance-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Administrasi Umum">Administrasi Umum</option>
                <option value="Terapis Gigi dan Mulut">Terapis Gigi dan Mulut</option>
                <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                <option value="Pasien">Pasien</option>
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
          </div>

          {error && <p className="text-[10px] text-pink font-black text-center uppercase tracking-tighter">{error}</p>}

          <div className="space-y-3">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-navy text-white rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : (isRegistering ? <UserPlus size={18} className="text-pink" /> : <LogIn size={18} className="text-pink" />)}
              {isRegistering ? 'Daftar Sekarang' : 'Masuk ke Sistem'}
            </button>

            {isRegistering && (
              <button 
                type="button"
                onClick={handleAnonymousLogin}
                disabled={loading}
                className="w-full py-5 bg-white text-navy border-2 border-navy/10 rounded-2xl font-black hover:bg-navy-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
              >
                <User size={18} className="text-pink" />
                Daftar Tanpa Akun (Anonim)
              </button>
            )}

            {!isRegistering && (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="py-5 bg-white text-navy border-2 border-navy/10 rounded-2xl font-black hover:bg-navy-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                  Google
                </button>
                <button 
                  type="button"
                  onClick={handleAnonymousLogin}
                  disabled={loading}
                  className="py-5 bg-navy-50 text-navy border-2 border-navy/10 rounded-2xl font-black hover:bg-navy-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] disabled:opacity-50"
                >
                  <User size={16} className="text-pink" />
                  Anonim
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2">
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

              {!isRegistering && (
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-[10px] font-black text-pink hover:text-pink-dark transition-colors uppercase tracking-widest flex items-center gap-2"
                >
                  <Key size={12} />
                  Lupa Kata Sandi?
                </button>
              )}
            </div>
            
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
