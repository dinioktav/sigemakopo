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
      const patientData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientData);
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
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-navy tracking-tight uppercase">Master Data Pasien</h1>
          <p className="text-navy/40 font-medium mt-1">SIGEMA KOPO : Sistem Kesehatan Gigi Masyarakat Kopo</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-navy text-gold rounded-2xl font-bold hover:bg-navy-light shadow-2xl shadow-navy/40 transition-all uppercase tracking-widest text-xs border border-gold/20"
        >
          <Plus size={20} />
          Tambah Pasien Baru
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
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm" 
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-danger rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h3 className="text-xl font-black text-navy uppercase tracking-tight mb-2">Hapus Pasien?</h3>
              <p className="text-navy/60 text-sm font-medium mb-8">Data yang sudah dihapus tidak dapat dikembalikan lagi.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="py-4 bg-gray-100 text-navy/60 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={loading}
                  className="py-4 bg-danger text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Ya, Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <h2 className="text-2xl font-bold uppercase tracking-tighter">{editingPatientId ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}</h2>
                  <p className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mt-1">{editingPatientId ? 'Pembaruan Master Data Pasien' : 'Registrasi Master Data Pasien'}</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingPatientId(null); }} className="p-2 hover:bg-white/10 rounded-xl transition-all">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Show</span>
            <select className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-sm font-semibold text-gray-700">entries</span>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari NIK, Nama, atau No RM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider font-bold border-b border-gray-200">
                <th className="px-6 py-4 border-r border-gray-200 text-center w-12">#</th>
                <th className="px-6 py-4 border-r border-gray-200">No RM</th>
                <th className="px-6 py-4 border-r border-gray-200">Pasien</th>
                <th className="px-8 py-4 border-r border-gray-200">Asuransi</th>
                <th className="px-6 py-4 border-r border-gray-200">Kontak</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient, index) => (
                <tr key={patient.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 border-r border-gray-100">{index + 1}</td>
                  <td className="px-6 py-4 border-r border-gray-100">
                    <p className="text-[10px] font-bold text-primary tracking-tight">{patient.rmNumber || '-'}</p>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-100">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-800">{patient.name}</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{patient.nik}</span>
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">{patient.birthPlace}, {patient.birthDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-100">
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider text-white",
                      patient.paymentMethod === 'BPJS' ? "bg-success" : "bg-primary"
                    )}>
                      {patient.paymentMethod === 'BPJS' ? 'BPJS' : 'Umum'}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-100">
                    <p className="text-[10px] text-gray-600 font-bold">{patient.phone || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/records?patientId=${patient.id}`)}
                        className="px-3 py-1.5 bg-primary text-white rounded text-[10px] font-bold hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-sm shadow-primary/10 uppercase tracking-wider"
                      >
                        <Stethoscope size={12} />
                        Layani
                      </button>
                      <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                        <button 
                          onClick={() => handleEdit(patient)}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition-all"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient.id)}
                          className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-tight">Showing {filteredPatients.length} of {patients.length} entries</p>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-400 cursor-not-allowed uppercase tracking-wider transition-all">Previous</button>
            <button className="px-4 py-1.5 bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-700 hover:bg-gray-50 hover:border-primary hover:text-primary transition-all shadow-sm uppercase tracking-wider">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
