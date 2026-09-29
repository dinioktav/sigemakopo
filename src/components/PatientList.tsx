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
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import SignaturePad from 'signature_pad';
import { 
  Eye, 
  Edit3, 
  Trash2,
  History
} from 'lucide-react';

export const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
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
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ensure unique IDs
      const uniqueData = Array.from(new Map(data.map(item => [item.id, item])).values());
      setPatients(uniqueData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'patients');
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
      if (editingPatientId) {
        await updateDoc(doc(db, 'patients', editingPatientId), {
          ...newPatient,
          updatedAt: Timestamp.now()
        });
      } else {
        const year = new Date().getFullYear();
        // Get patients registered in current year to determine next number
        const yearPatients = patients.filter(p => p.rmNumber && p.rmNumber.endsWith(`/${year}`));
        const count = yearPatients.length + 1;
        const rmNumber = `${count.toString().padStart(3, '0')}/${year}`;
        
        await addDoc(collection(db, 'patients'), {
          ...newPatient,
          rmNumber,
          createdAt: Timestamp.now()
        });
      }
      setIsModalOpen(false);
      setEditingPatientId(null);
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
      handleFirestoreError(error, OperationType.WRITE, 'patients');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: any) => {
    setEditingPatientId(patient.id);
    setNewPatient({
      paymentMethod: patient.paymentMethod || 'Tunai',
      nik: patient.nik || '',
      name: patient.name || '',
      gender: patient.gender || 'Laki-laki',
      birthPlace: patient.birthPlace || '',
      birthDate: patient.birthDate || '',
      age: patient.age || '',
      address: patient.address || '',
      rt: patient.rt || '',
      rw: patient.rw || '',
      province: patient.province || '',
      city: patient.city || '',
      district: patient.district || '',
      subDistrict: patient.subDistrict || '',
      maritalStatus: patient.maritalStatus || 'Belum Menikah',
      education: patient.education || 'SMA',
      occupation: patient.occupation || '',
      phone: patient.phone || '',
      guardianRelation: patient.guardianRelation || 'Pasien Sendiri',
      guardianNik: patient.guardianNik || '',
      guardianName: patient.guardianName || '',
      guardianGender: patient.guardianGender || 'Laki-laki',
      guardianBirthDate: patient.guardianBirthDate || '',
      guardianAddress: patient.guardianAddress || '',
      guardianPhone: patient.guardianPhone || '',
      signature: patient.signature || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setPatientToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'patients', patientToDelete));
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nik?.includes(searchTerm) ||
    p.rmNumber?.includes(searchTerm) ||
    p.id?.includes(searchTerm)
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <Users size={13} className="text-purple-600" />
              Master Pasien
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">Poli Gigi & Mulut</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold text-pink-600">SIGEMA KOPO</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Master Data Pasien</h1>
          <p className="text-xs text-slate-500 mt-0.5">UPTD Puskesmas Kopo · Registrasi & Manajemen Rekam Medis Poli Gigi</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
        >
          <Plus size={16} />
          Registrasi Pasien Baru
        </button>
      </header>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs" 
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-sm rounded-xl shadow-xl relative z-10 p-6 text-center border border-slate-200"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">Hapus Data Pasien?</h3>
              <p className="text-xs text-slate-500 mb-6">Data pasien dan riwayat pelayanan terkait akan dihapus secara permanen.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={loading}
                  className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Ya, Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Patient Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs" 
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
              <header className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold tracking-tight">{editingPatientId ? 'Edit Data Pasien' : 'Registrasi Pasien Baru'}</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">{editingPatientId ? 'Pembaruan data rekam medis pasien' : 'Input data demografi pasien poli gigi'}</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingPatientId(null); }} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </header>

              <form onSubmit={handleAddPatient} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
                {/* Data Pasien */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">1. Identitas Pasien</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">Cara Bayar / Asuransi</label>
                      <select 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg transition-all"
                        value={newPatient.paymentMethod}
                        onChange={e => setNewPatient({...newPatient, paymentMethod: e.target.value})}
                      >
                        <option>Tunai</option>
                        <option>BPJS</option>
                        <option>Gratis</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">NIK (16 Digit)</label>
                      <input 
                        type="text" required maxLength={16}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg font-mono transition-all"
                        placeholder="3201..."
                        value={newPatient.nik}
                        onChange={e => setNewPatient({...newPatient, nik: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">Nama Lengkap Pasien</label>
                      <input 
                        type="text" required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg transition-all"
                        placeholder="Nama sesuai KTP / KK"
                        value={newPatient.name}
                        onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">Jenis Kelamin</label>
                      <select 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg transition-all"
                        value={newPatient.gender}
                        onChange={e => setNewPatient({...newPatient, gender: e.target.value})}
                      >
                        <option>Laki-laki</option>
                        <option>Perempuan</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">Tempat Lahir</label>
                      <input 
                        type="text" required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg transition-all"
                        placeholder="Kota Lahir"
                        value={newPatient.birthPlace}
                        onChange={e => setNewPatient({...newPatient, birthPlace: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700">Tanggal Lahir</label>
                        <input 
                          type="date" required
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg transition-all"
                          value={newPatient.birthDate}
                          onChange={e => setNewPatient({...newPatient, birthDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700">Umur (Tahun)</label>
                        <input 
                          type="text" readOnly
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono"
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
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs tracking-wider transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Tampilkan</span>
            <select className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs font-mono">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span className="text-xs text-slate-500">data per halaman</span>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Cari NIK, Nama Pasien, atau No RM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-4 py-3.5 text-center w-12 text-slate-400">#</th>
                <th className="px-4 py-3.5 font-semibold">No. RM</th>
                <th className="px-5 py-3.5 font-semibold">Identitas Pasien</th>
                <th className="px-4 py-3.5 font-semibold">Penjamin</th>
                <th className="px-4 py-3.5 font-semibold">Kontak & Alamat</th>
                <th className="px-4 py-3.5 text-center font-semibold">Tindakan Klinis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPatients.map((patient, index) => (
                <tr key={patient.id} className="hover:bg-purple-50/30 transition-colors group">
                  <td className="px-4 py-3 text-center font-mono text-[11px] text-slate-400">{index + 1}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-semibold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                      {patient.rmNumber || '-'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">{patient.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono text-slate-600">NIK: {patient.nik || '-'}</span>
                        <span>•</span>
                        <span>{patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                        {patient.birthDate && (
                          <>
                            <span>•</span>
                            <span>{patient.birthDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase",
                      patient.paymentMethod === 'BPJS' 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-pink-50 text-pink-700 border border-pink-200"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", patient.paymentMethod === 'BPJS' ? "bg-emerald-500" : "bg-pink-500")} />
                      {patient.paymentMethod === 'BPJS' ? 'BPJS PBI/Non-PBI' : 'Umum / Mandiri'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p className="font-mono text-[11px] text-slate-700">{patient.phone || '-'}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{patient.address || 'Bandung'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/records?patientId=${patient.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-md text-xs font-medium shadow-2xs transition-all"
                      >
                        <Stethoscope size={13} />
                        <span>Pemeriksaan</span>
                      </button>
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                        <button 
                          onClick={() => handleEdit(patient)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Edit Pasien"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus Pasien"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                      <Users size={40} className="stroke-[1.5] text-slate-300 mb-1" />
                      <p className="text-sm font-semibold text-slate-600">Tidak ada data pasien yang cocok</p>
                      <p className="text-xs text-slate-400 max-w-sm">Periksa kembali kata kunci pencarian Anda atau tambahkan pasien baru ke dalam master data.</p>
                      <button
                        onClick={() => {
                          setEditingPatientId(null);
                          setIsModalOpen(true);
                        }}
                        className="mt-2 text-xs font-semibold text-purple-600 hover:text-pink-600 hover:underline"
                      >
                        + Daftarkan Pasien Baru
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-slate-500 font-medium">Menampilkan <span className="font-semibold text-slate-700 font-mono">{filteredPatients.length}</span> dari <span className="font-semibold text-slate-700 font-mono">{patients.length}</span> rekam pasien terdaftar</p>
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-400 text-xs font-medium cursor-not-allowed">Sebelumnya</button>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded font-semibold font-mono text-xs">1</span>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
};
