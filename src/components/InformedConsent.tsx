import React, { useState, useRef } from 'react';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Plus,
  PenTool,
  X,
  RotateCcw,
  Save
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import SignaturePad from 'signature_pad';
import { useEffect } from 'react';

const MOCK_CONSENTS: any[] = [];

export const InformedConsent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [procedure, setProcedure] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigPad = useRef<SignaturePad | null>(null);

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
      }, 300);
      return () => clearTimeout(timer);
    } else {
      sigPad.current?.off();
      sigPad.current = null;
    }
  }, [isModalOpen]);

  const clearSignature = () => {
    sigPad.current?.clear();
  };

  const saveConsent = () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      alert('Silakan berikan tanda tangan terlebih dahulu.');
      return;
    }
    // In a real app, we would save the signature data URL and other info to Firestore
    const signatureData = sigPad.current.toDataURL();
    console.log('Saving consent for:', patientName, 'Procedure:', procedure);
    console.log('Signature Data:', signatureData);
    
    alert('Informed Consent berhasil disimpan!');
    setIsModalOpen(false);
    setPatientName('');
    setProcedure('');
  };

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Informed Consent</h1>
          <p className="text-navy/40 font-medium mt-1">SIGEMA KOPO : Sistem Kesehatan Gigi Masyarakat Kopo</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-navy text-gold rounded-2xl font-black hover:bg-navy-light shadow-2xl shadow-navy/40 transition-all uppercase tracking-widest text-xs border border-gold/20"
        >
          <Plus size={20} />
          Buat Persetujuan Baru
        </button>
      </header>

      {/* Modal Buat Persetujuan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-navy text-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Form Informed Consent</h2>
                <p className="text-pink text-[10px] font-bold uppercase tracking-widest mt-1">Persetujuan Tindakan Medis</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-navy/70 uppercase tracking-wider">Nama Pasien</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium"
                    placeholder="Masukkan nama pasien"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-navy/70 uppercase tracking-wider">Tindakan Medis</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-navy-50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-medium"
                    placeholder="Contoh: Pencabutan Gigi"
                    value={procedure}
                    onChange={(e) => setProcedure(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-navy/70 uppercase tracking-wider">Tanda Tangan Pasien / Wali</label>
                  <button 
                    onClick={clearSignature}
                    className="flex items-center gap-2 text-[10px] font-black text-pink hover:text-pink-dark uppercase tracking-widest transition-colors"
                  >
                    <RotateCcw size={14} /> Bersihkan
                  </button>
                </div>
                <div className="border-2 border-dashed border-navy/10 rounded-[2rem] bg-navy-50/50 overflow-hidden">
                  <canvas 
                    ref={canvasRef}
                    className="w-full h-48 cursor-crosshair"
                  />
                </div>
                <p className="text-[10px] text-navy/40 text-center font-medium italic">
                  Dengan menandatangani di atas, pasien/wali menyatakan setuju atas tindakan medis yang akan dilakukan.
                </p>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-navy-50 text-navy/60 rounded-2xl font-black hover:bg-navy-100 transition-all uppercase tracking-widest text-xs"
                >
                  Batal
                </button>
                <button 
                  onClick={saveConsent}
                  className="flex-1 py-5 bg-navy text-white rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  <Save size={18} className="text-pink" />
                  Simpan & TTD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-navy/5 flex flex-col md:flex-row gap-6 bg-navy-50/10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" size={20} />
            <input 
              type="text" 
              placeholder="Cari persetujuan atau nama pasien..." 
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
                <th className="px-8 py-6">ID Persetujuan</th>
                <th className="px-8 py-6">Pasien</th>
                <th className="px-8 py-6">Tindakan</th>
                <th className="px-8 py-6">Waktu TTD</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {MOCK_CONSENTS.map((consent) => (
                <tr key={consent.id} className="hover:bg-pink-soft/30 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-navy uppercase tracking-widest">{consent.id}</p>
                    <p className="text-[10px] text-navy/30 font-bold mt-1">{consent.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-navy uppercase tracking-tight">{consent.patient}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-navy/60 uppercase tracking-widest">{consent.procedure}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-navy/40">{consent.signedAt}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 w-fit",
                      consent.status === 'Signed' 
                        ? "bg-green-50 text-green-600" 
                        : "bg-pink-soft text-pink"
                    )}>
                      {consent.status === 'Signed' ? <FileCheck size={12} /> : <Clock size={12} />}
                      {consent.status === 'Signed' ? 'Ditandatangani' : 'Menunggu'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-navy/20 hover:text-pink hover:bg-pink-soft rounded-xl transition-all">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-navy/20 hover:text-navy hover:bg-navy-50 rounded-xl transition-all">
                        <Download size={18} />
                      </button>
                      {consent.status === 'Pending' && (
                        <button className="p-2 text-pink hover:bg-pink-soft rounded-xl transition-all">
                          <PenTool size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
