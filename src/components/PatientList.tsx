import { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  ChevronRight,
  Phone,
  Calendar,
  CreditCard
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const MOCK_PATIENTS = [
  { id: 'RM-001', name: 'Budi Santoso', nik: '3201234567890001', birthDate: '1985-05-12', gender: 'Laki-laki', phone: '081234567890', insurance: 'BPJS', income: 'Rp 5.000.000 - Rp 10.000.000', hobbies: 'Berenang, Bersepeda' },
  { id: 'RM-002', name: 'Siti Aminah', nik: '3201234567890002', birthDate: '1992-11-24', gender: 'Perempuan', phone: '081234567891', insurance: 'Mandiri Inhealth', income: 'Rp 2.000.000 - Rp 5.000.000', hobbies: 'Membaca, Memasak' },
  { id: 'RM-003', name: 'Andi Wijaya', nik: '3201234567890003', birthDate: '1978-02-15', gender: 'Laki-laki', phone: '081234567892', insurance: 'Umum', income: '> Rp 10.000.000', hobbies: 'Golf, Traveling' },
  { id: 'RM-004', name: 'Dewi Lestari', nik: '3201234567890004', birthDate: '2005-08-30', gender: 'Perempuan', phone: '081234567893', insurance: 'BPJS', income: '< Rp 2.000.000', hobbies: 'Menari, Menyanyi' },
];

export const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Master Data Pasien</h1>
          <p className="text-navy/40 font-medium mt-1">Kelola identitas dan data sosial pasien.</p>
        </div>
        <button className="flex items-center justify-center gap-3 px-8 py-4 bg-navy text-pink rounded-2xl font-black hover:bg-navy-light shadow-xl shadow-navy/20 transition-all uppercase tracking-widest text-xs">
          <Plus size={20} />
          Tambah Pasien Baru
        </button>
      </header>

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
              {MOCK_PATIENTS.map((patient) => (
                <tr key={patient.id} className="hover:bg-pink-soft/30 transition-colors group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-navy text-pink flex items-center justify-center font-black text-lg shadow-lg shadow-navy/10 group-hover:scale-110 transition-transform">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-navy uppercase tracking-tight">{patient.name}</p>
                        <p className="text-[10px] text-pink font-black tracking-widest mt-0.5">{patient.id}</p>
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
            </tbody>
          </table>
        </div>

        <div className="p-8 bg-navy-50/30 border-t border-navy/5 flex items-center justify-between">
          <p className="text-xs text-navy/40 font-bold uppercase tracking-widest">Menampilkan 4 dari 1,284 pasien</p>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white border border-navy/5 rounded-xl text-[10px] font-black text-navy/20 cursor-not-allowed uppercase tracking-widest">Sebelumnya</button>
            <button className="px-6 py-3 bg-white border border-navy/5 rounded-xl text-[10px] font-black text-navy hover:border-pink hover:text-pink transition-all shadow-sm uppercase tracking-widest">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
};
