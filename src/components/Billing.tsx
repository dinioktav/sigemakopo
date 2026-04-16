import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Plus
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const MOCK_BILLING: any[] = [];

export const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Manajemen Billing</h1>
          <p className="text-navy/40 font-medium mt-1">SIGEMA KOPO : Sistem Kesehatan Gigi Masyarakat Kopo</p>
        </div>
        <button className="flex items-center justify-center gap-3 px-8 py-4 bg-navy text-gold rounded-2xl font-black hover:bg-navy-light shadow-2xl shadow-navy/40 transition-all uppercase tracking-widest text-xs border border-gold/20">
          <Plus size={20} />
          Buat Invoice Baru
        </button>
      </header>

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-navy/5 flex flex-col md:flex-row gap-6 bg-navy-50/10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" size={20} />
            <input 
              type="text" 
              placeholder="Cari invoice atau nama pasien..." 
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
                <th className="px-8 py-6">No. Invoice</th>
                <th className="px-8 py-6">Pasien</th>
                <th className="px-8 py-6">Layanan</th>
                <th className="px-8 py-6">Total Tagihan</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {MOCK_BILLING.map((bill) => (
                <tr key={bill.id} className="hover:bg-pink-soft/30 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-navy uppercase tracking-widest">{bill.id}</p>
                    <p className="text-[10px] text-navy/30 font-bold mt-1">{bill.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-navy uppercase tracking-tight">{bill.patient}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1">
                      {bill.items.map((item, i) => (
                        <span key={i} className="text-[9px] font-black bg-navy-50 text-navy/40 px-2 py-1 rounded uppercase tracking-tighter">{item}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-navy tracking-tighter">{bill.amount}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 w-fit",
                      bill.status === 'Paid' 
                        ? "bg-green-50 text-green-600" 
                        : "bg-pink-soft text-pink"
                    )}>
                      {bill.status === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {bill.status === 'Paid' ? 'Lunas' : 'Belum Bayar'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-navy/20 hover:text-pink hover:bg-pink-soft rounded-xl transition-all">
                        <Printer size={18} />
                      </button>
                      <button className="p-2 text-navy/20 hover:text-navy hover:bg-navy-50 rounded-xl transition-all">
                        <Download size={18} />
                      </button>
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
