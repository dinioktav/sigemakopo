import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, LogIn, UserPlus, ArrowLeft, Mail, Key } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { auth, googleProvider, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail,
  updateProfile
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
          setMessage('Pendaftaran berhasil! Akun Anda memerlukan persetujuan Super Admin sebelum dapat digunakan.');
        } else {
          setMessage('Akun berhasil dibuat! Silakan login.');
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
      <div className="min-h-screen bg-[#090d1a] flex items-center justify-center p-6 relative overflow-hidden clinical-pattern">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden relative z-10">
          <div className="p-8 bg-gradient-to-b from-purple-50/50 to-white border-b border-slate-100 text-center">
            <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-md shadow-purple-600/25">
              S
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pemulihan Kata Sandi</h1>
            <p className="text-xs text-slate-500 mt-1">Masukkan email kedinasan untuk menerima tautan pemulihan.</p>
          </div>

          <form onSubmit={handleForgotPassword} className="p-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Akun Medis</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input 
                  type="email" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-sm transition-all"
                  placeholder="nama@puskesmaskopo.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
                {message}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Mail size={16} />}
              Kirim Tautan Pemulihan
            </button>

            <button 
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="w-full text-xs font-medium text-slate-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-1.5 pt-2"
            >
              <ArrowLeft size={14} />
              Kembali ke Halaman Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d1a] flex flex-col justify-center items-center p-6 relative overflow-hidden clinical-pattern">
      {/* Background Soft Glows in Purple & Pink */}
      <div className="absolute top-1/4 -left-20 w-[600px] h-[500px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-[600px] h-[500px] bg-pink-600/15 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-10 right-1/4 w-[300px] h-[300px] bg-indigo-900/25 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Main Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden relative z-10">
        
        {/* Institutional Branding Header */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-purple-50/50 via-slate-50/20 to-white border-b border-slate-100 text-center">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white font-bold text-2xl shadow-lg shadow-purple-900/30 mb-3.5">
            S
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">SIGEMA KOPO</h1>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Rekam Medis Gigi & Mulut
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
              UPTD Kopo
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <span>UPTD Puskesmas Kopo</span>
            <span aria-hidden="true">·</span>
            <span>Standar Kemenkes RI</span>
          </div>
        </div>

        {/* Tab Switcher: Masuk vs Registrasi */}
        <div className="px-8 pt-6 pb-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); generateCaptcha(); }}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-md transition-all",
                !isRegistering 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs" 
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Masuk Sistem
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); generateCaptcha(); }}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-md transition-all",
                isRegistering 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs" 
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Daftar Nakes / Akun
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
          {isRegistering && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-medium text-slate-700">Nama Lengkap & Gelar</label>
              <input 
                type="text" 
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-sm transition-all"
                placeholder="cth: drg. Ahmad Fauzi / Nita, A.Md.Kes"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Email Akun Medis</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-sm transition-all"
                placeholder="nama@puskesmaskopo.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">Kata Sandi</label>
              {!isRegistering && (
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-[11px] font-medium text-purple-600 hover:text-pink-600 transition-colors"
                >
                  Lupa Kata Sandi?
                </button>
              )}
            </div>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="password" 
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-medium text-slate-700">Jabatan / Profesi</label>
              <select 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-sm transition-all"
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

          {/* Captcha Security */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Verifikasi Keamanan</span>
              <span className="text-[11px] text-purple-600 font-mono">Kode Akses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 h-12 rounded-lg flex items-center justify-center select-none shadow-xs border border-purple-900/30">
                <span className="text-xl font-bold font-mono tracking-[0.4em] text-pink-400 select-none">
                  {captchaText}
                </span>
              </div>
              <button 
                type="button" 
                onClick={generateCaptcha}
                className="h-12 w-12 flex items-center justify-center bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 border border-slate-200 rounded-lg transition-colors"
                title="Ganti Kode Keamanan"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="relative">
              <input 
                type="text" 
                required
                autoComplete="off"
                className={cn(
                  "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-lg text-sm font-mono tracking-widest uppercase transition-all",
                  error && "border-red-300 bg-red-50/50"
                )}
                placeholder="Ketik kode di atas"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
              />
              {captchaInput && captchaInput.toUpperCase() === captchaText && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                  <ShieldCheck size={18} />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
              {message}
            </div>
          )}

          <div className="pt-2 space-y-2.5">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : isRegistering ? (
                <>
                  <UserPlus size={16} />
                  Daftarkan Akun
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Masuk ke Sistem
                </>
              )}
            </button>

            {!isRegistering && (
              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 bg-white text-slate-700 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                Masuk dengan Akun Google
              </button>
            )}
          </div>

          {/* Footer Trust Markers */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-purple-600" />
            <span>Kemenkes RI · Enkripsi Standar Medis SATUSEHAT</span>
          </div>
        </form>
      </div>

      {/* Institutional Legal Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400">
        <p>© 2026 UPTD Puskesmas Kopo. Seluruh hak cipta dilindungi.</p>
      </footer>
    </div>
  );
};
