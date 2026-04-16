import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  ChevronRight,
  Phone,
  Calendar,
  CreditCard,
  X,
  Save,
  RefreshCw,
  Stethoscope,
  RotateCcw,
  PenTool
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import SignaturePad from 'signature_pad';

export const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigPad = useRef<SignaturePad | null>(null);

  const [newPatient, setNewPatient] = useState({
    paymentMethod: 'Tunai',
    nik: '',
    name: '',
    gender: 'Laki-laki',
    birthPlace: '',
    birthDate: '',
    age: '',
    address: '',
    rt: '',
    rw: '',
    province: '',
    city: '',
    district: '',
    subDistrict: '',
    maritalStatus: 'Belum Menikah',
    education: 'SMA',
    occupation: '',
    phone: '',
    // Penanggung Jawab
    guardianRelation: 'Pasien Sendiri',
    guardianNik: '',
    guardianName: '',
    guardianGender: 'Laki-laki',
    guardianBirthDate: '',
    guardianAddress: '',
    guardianPhone: '',
    signature: ''
  });

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  useEffect(() => {
    if (newPatient.birthDate) {
      setNewPatient(prev => ({ ...prev, age: calculateAge(prev.birthDate) }));
    }
  }, [newPatient.birthDate]);

  useEffect(() => {
    if (newPatient.guardianRelation === 'Pasien Sendiri') {
      setNewPatient(prev => ({
        ...prev,
        guardianNik: prev.nik,
        guardianName: prev.name,
        guardianGender: prev.gender,
        guardianBirthDate: prev.birthDate,
        guardianAddress: `${prev.address}, RT ${prev.rt}/RW ${prev.rw}, ${prev.subDistrict}, ${prev.district}, ${prev.city}, ${prev.province}`,
        guardianPhone: prev.phone
      }));
    }
  }, [
    newPatient.guardianRelation, 
    newPatient.nik, 
    newPatient.name, 
    newPatient.gender, 
    newPatient.birthDate, 
    newPatient.address, 
    newPatient.rt, 
    newPatient.rw, 
    newPatient.province, 
    newPatient.city, 
    newPatient.district, 
    newPatient.subDistrict, 
    newPatient.phone
  ]);

  useEffect(() => {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isModalOpen && canvasRef.current) {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d")?.scale(ratio, ratio);
          
          sigPad.current = new SignaturePad(canvas, {
            backgroundColor: 'rgba(0,0,0,0)',
            penColor: '#0f172a'
          });
        }
      }, 300); // Wait for modal animation
      return () => clearTimeout(timer);
    } else {
      sigPad.current?.off();
      sigPad.current = null;
    }
  }, [isModalOpen]);

  const clearSignature = () => {
    sigPad.current?.clear();
    setNewPatient(prev => ({ ...prev, signature: '' }));
  };

  const saveSignature = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      setNewPatient(prev => ({ ...prev, signature: sigPad.current!.toDataURL() }));
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'patients'), {
        ...newPatient,
        createdAt: Timestamp.now()
      });
      setIsModalOpen(false);
      setNewPatient({
        paymentMethod: 'Tunai',
        nik: '',
        name: '',
        gender: 'Laki-laki',
        birthPlace: '',
        birthDate: '',
        age: '',
        address: '',
        rt: '',
        rw: '',
        province: '',
        city: '',
        district: '',
        subDistrict: '',
        maritalStatus: 'Belum Menikah',
        education: 'SMA',
        occupation: '',
        phone: '',
        guardianRelation: 'Pasien Sendiri',
        guardianNik: '',
        guardianName: '',
        guardianGender: 'Laki-laki',
        guardianBirthDate: '',
        guardianAddress: '',
        guardianPhone: '',
        signature: ''
      });
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Gagal menambahkan pasien. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nik?.includes(searchTerm) ||
    p.id?.includes(searchTerm)
  );

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Master Data Pasien</h1>
          <p className="text-navy/40 font-medium mt-1">SIGEMA KOPO : Sistem Kesehatan Gigi Masyarakat Kopo</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-navy text-gold rounded-2xl font-black hover:bg-navy-light shadow-2xl shadow-navy/40 transition-all uppercase tracking-widest text-xs border border-gold/20"
        >
          <Plus size={20} />
          Tambah Pasien Baru
        </button>
      </header>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <header className="p-8 bg-navy text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Tambah Pasien Baru</h2>
                  <p className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mt-1">Registrasi Master Data Pasien</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </header>

              <form onSubmit={handleAddPatient} className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                {/* Data Pasien */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-l-4 border-pink pl-4">
                    <h3 className="text-lg font-black text-navy uppercase tracking-tight">Identitas Pasien</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Cara Bayar</label>
                      <select 
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold appearance-none"
                        value={newPatient.paymentMethod}
                        onChange={e => setNewPatient({...newPatient, paymentMethod: e.target.value})}
                      >
                        <option>Tunai</option>
                        <option>BPJS</option>
                        <option>Gratis</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">NIK (16 Digit)</label>
                      <input 
                        type="text" required maxLength={16}
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold"
                        placeholder="3201..."
                        value={newPatient.nik}
                        onChange={e => setNewPatient({...newPatient, nik: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Nama Lengkap</label>
                      <input 
                        type="text" required
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold"
                        placeholder="Nama sesuai KTP"
                        value={newPatient.name}
                        onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Jenis Kelamin</label>
                      <select 
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold appearance-none"
                        value={newPatient.gender}
                        onChange={e => setNewPatient({...newPatient, gender: e.target.value})}
                      >
                        <option>Laki-laki</option>
                        <option>Perempuan</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Tempat Lahir</label>
                      <input 
                        type="text" required
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold"
                        placeholder="Kota Lahir"
                        value={newPatient.birthPlace}
                        onChange={e => setNewPatient({...newPatient, birthPlace: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Tanggal Lahir</label>
                        <input 
                          type="date" required
                          className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold"
                          value={newPatient.birthDate}
                          onChange={e => setNewPatient({...newPatient, birthDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Umur</label>
                        <input 
                          type="text" readOnly
                          className="w-full px-8 py-4 bg-navy-50/20 border-2 border-transparent rounded-2xl text-sm font-bold text-navy/40"
                          value={newPatient.age}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Alamat Lengkap</label>
                      <textarea 
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold min-h-[80px]"
                        placeholder="Nama Jalan, No Rumah, dll"
                        value={newPatient.address}
                        onChange={e => setNewPatient({...newPatient, address: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">RT</label>
                        <input type="text" className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold" value={newPatient.rt} onChange={e => setNewPatient({...newPatient, rt: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">RW</label>
                        <input type="text" className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold" value={newPatient.rw} onChange={e => setNewPatient({...newPatient, rw: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Provinsi</label>
                      <input type="text" className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold" value={newPatient.province} onChange={e => setNewPatient({...newPatient, province: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Kabupaten/Kota</label>
                      <input type="text" className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold" value={newPatient.city} onChange={e => setNewPatient({...newPatient, city: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Kecamatan</label>
                      <input type="text" className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold" value={newPatient.district} onChange={e => setNewPatient({...newPatient, district: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Kelurahan</label>
                      <input type="text" className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold" value={newPatient.subDistrict} onChange={e => setNewPatient({...newPatient, subDistrict: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Status Perkawinan</label>
                      <select 
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold appearance-none"
                        value={newPatient.maritalStatus}
                        onChange={e => setNewPatient({...newPatient, maritalStatus: e.target.value})}
                      >
                        <option>Belum Menikah</option>
                        <option>Menikah</option>
                        <option>Duda</option>
                        <option>Janda</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Pendidikan</label>
                      <select 
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold appearance-none"
                        value={newPatient.education}
                        onChange={e => setNewPatient({...newPatient, education: e.target.value})}
                      >
                        <option>Belum Sekolah</option>
                        <option>SD</option>
                        <option>SMP</option>
                        <option>SMA</option>
                        <option>Diploma</option>
                        <option>Sarjana</option>
                        <option>Pasca Sarjana</option>
                        <option>Doktoral</option>
                        <option>Tidak Tahu</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Pekerjaan</label>
                      <input type="text" className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold" value={newPatient.occupation} onChange={e => setNewPatient({...newPatient, occupation: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">No Telepon / HP</label>
                      <input type="tel" className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Penanggung Jawab */}
                <div className="space-y-8 pt-8 border-t-2 border-navy/5">
                  <div className="flex items-center gap-3 border-l-4 border-gold pl-4">
                    <h3 className="text-lg font-black text-navy uppercase tracking-tight">Penanggung Jawab Pasien</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Hubungan Dengan Pasien</label>
                      <select 
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold appearance-none"
                        value={newPatient.guardianRelation}
                        onChange={e => setNewPatient({...newPatient, guardianRelation: e.target.value})}
                      >
                        <option>Pasien Sendiri</option>
                        <option>Anggota Keluarga</option>
                        <option>Anak</option>
                        <option>Orang Tua</option>
                        <option>Ayah</option>
                        <option>Ibu</option>
                        <option>Suami</option>
                        <option>Istri</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">NIK Penanggung Jawab</label>
                      <input 
                        type="text" maxLength={16}
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold"
                        value={newPatient.guardianNik}
                        onChange={e => setNewPatient({...newPatient, guardianNik: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Nama Penanggung Jawab</label>
                      <input 
                        type="text"
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold"
                        value={newPatient.guardianName}
                        onChange={e => setNewPatient({...newPatient, guardianName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Jenis Kelamin</label>
                      <select 
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold appearance-none"
                        value={newPatient.guardianGender}
                        onChange={e => setNewPatient({...newPatient, guardianGender: e.target.value})}
                      >
                        <option>Laki-laki</option>
                        <option>Perempuan</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Tanggal Lahir</label>
                      <input 
                        type="date"
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold"
                        value={newPatient.guardianBirthDate}
                        onChange={e => setNewPatient({...newPatient, guardianBirthDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Alamat Penanggung Jawab</label>
                      <textarea 
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold min-h-[80px]"
                        value={newPatient.guardianAddress}
                        onChange={e => setNewPatient({...newPatient, guardianAddress: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">No Telp/HP</label>
                      <input 
                        type="tel"
                        className="w-full px-8 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold"
                        value={newPatient.guardianPhone}
                        onChange={e => setNewPatient({...newPatient, guardianPhone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                    <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest flex items-center gap-2">
                      <PenTool size={14} className="text-pink" /> Tanda Tangan Pasien / Wali
                    </label>
                    <button 
                      type="button"
                      onClick={clearSignature}
                      className="p-2 text-navy/30 hover:text-pink hover:bg-pink-soft rounded-xl transition-all"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                  <div className="bg-navy-50/30 border-2 border-dashed border-navy/10 rounded-3xl overflow-hidden relative group">
                    <canvas 
                      ref={canvasRef}
                      className="w-full h-40 cursor-crosshair"
                      onMouseUp={saveSignature}
                      onTouchEnd={saveSignature}
                    />
                    <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
                      <p className="text-[9px] text-navy/20 font-bold uppercase tracking-widest italic">Tanda tangan di atas</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-5 bg-navy text-gold rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    Simpan Data Pasien
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-10 py-5 bg-white border-2 border-navy/5 text-navy/40 rounded-2xl font-black hover:border-pink hover:text-pink transition-all uppercase tracking-widest text-xs"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-navy/5 flex flex-col md:flex-row gap-6 bg-navy-50/10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" size={20} />
            <input 
              type="text" 
              placeholder="Cari berdasarkan Nama, NIK, atau No. RM..." 
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-white text-navy/60 border-2 border-transparent hover:border-pink hover:text-pink rounded-2xl font-black transition-all shadow-sm uppercase tracking-widest text-xs">
            <Filter size={20} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-navy-50/50 text-navy/30 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-6">Pasien</th>
                <th className="px-8 py-6">Identitas & Sosial</th>
                <th className="px-8 py-6">Kontak</th>
                <th className="px-8 py-6">Asuransi</th>
                <th className="px-8 py-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-pink-soft/30 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-navy text-pink flex items-center justify-center font-black text-lg shadow-lg shadow-navy/10 group-hover:scale-110 transition-transform">
                        {patient.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-black text-navy uppercase tracking-tight">{patient.name}</p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/records?patientId=${patient.id}`);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy text-gold rounded-lg font-black hover:bg-navy-light transition-all uppercase tracking-widest text-[8px] border border-gold/20"
                          >
                            <Stethoscope size={12} />
                            Layani
                          </button>
                        </div>
                        <p className="text-[10px] text-pink font-black tracking-widest mt-0.5">{patient.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <p className="text-xs text-navy/60 font-bold flex items-center gap-2">
                        <CreditCard size={14} className="text-navy/20" /> {patient.nik}
                      </p>
                      <p className="text-xs text-navy/40 font-medium flex items-center gap-2">
                        <Calendar size={14} className="text-navy/20" /> {patient.birthDate}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[9px] font-black bg-navy-50 text-navy/40 px-2 py-1 rounded uppercase tracking-tighter">Income: {patient.income}</span>
                        <span className="text-[9px] font-black bg-pink-soft text-pink px-2 py-1 rounded uppercase tracking-tighter">Hobi: {patient.hobbies}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-navy/60 font-bold flex items-center gap-2">
                      <Phone size={14} className="text-navy/20" /> {patient.phone}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border",
                      patient.insurance === 'BPJS' 
                        ? "bg-pink-soft text-pink border-pink-soft" 
                        : "bg-navy-50 text-navy border-navy-50"
                    )}>
                      {patient.insurance}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-navy/20 hover:text-pink hover:bg-pink-soft rounded-xl transition-all">
                        <ChevronRight size={20} />
                      </button>
                      <button className="p-2 text-navy/20 hover:text-navy hover:bg-navy-50 rounded-xl transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Users size={64} />
                      <p className="text-sm font-black uppercase tracking-widest">Belum ada data pasien</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8 bg-navy-50/30 border-t border-navy/5 flex items-center justify-between">
          <p className="text-xs text-navy/40 font-bold uppercase tracking-widest">Menampilkan {filteredPatients.length} dari {patients.length} pasien</p>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white border border-navy/5 rounded-xl text-[10px] font-black text-navy/20 cursor-not-allowed uppercase tracking-widest">Sebelumnya</button>
            <button className="px-6 py-3 bg-white border border-navy/5 rounded-xl text-[10px] font-black text-navy hover:border-pink hover:text-pink transition-all shadow-sm uppercase tracking-widest">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
};
