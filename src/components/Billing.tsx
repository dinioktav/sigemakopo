import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  MoreVertical,
  Plus,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [billings, setBillings] = useState<any[]>([]);
  const [patients, setPatients] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch patients map for better lookup
    const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
      const pMap: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        pMap[doc.id] = doc.data();
      });
      setPatients(pMap);
    });

    // Fetch dental records for billing
    const q = query(collection(db, 'dental_records'), orderBy('createdAt', 'desc'));
    const unsubBilling = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBillings(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'dental_records');
      setLoading(false);
    });

    return () => {
      unsubPatients();
      unsubBilling();
    };
  }, []);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
      await updateDoc(doc(db, 'dental_records', id), {
        'billing.status': newStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'dental_records');
    }
  };

  const filteredBillings = billings.filter(bill => {
    const patientName = patients[bill.patientId]?.name?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    return patientName.includes(searchLower) || bill.id.toLowerCase().includes(searchLower);
  });

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-navy tracking-tight uppercase">Manajemen Billing & Kasir</h1>
          <p className="text-navy/40 font-medium mt-1">SIGEMA KOPO : Sistem Kesehatan Gigi Masyarakat Kopo</p>
        </div>
        <div className="flex bg-navy-50 p-2 rounded-2xl gap-4">
          <div className="bg-white px-6 py-2 rounded-xl shadow-sm border border-navy/5">
            <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest">Total Pendapatan</p>
            <p className="text-sm font-black text-navy">
              Rp {billings.filter(b => b.billing?.status === 'Paid').reduce((acc, curr) => acc + (curr.billing?.total || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
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
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="text-pink animate-spin" size={48} />
              <p className="text-sm font-black text-navy/40 uppercase tracking-widest">Memuat data billing...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-navy-50/50 text-navy/30 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-8 py-6">Rincian Transaksi</th>
                  <th className="px-8 py-6">Pasien</th>
                  <th className="px-8 py-6">Layanan</th>
                  <th className="px-8 py-6">Total Tagihan</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/5">
                {filteredBillings.map((bill) => (
                  <tr key={bill.id} className="hover:bg-navy-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-navy uppercase tracking-widest">INV-{bill.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] text-navy/30 font-bold mt-1">
                        {bill.createdAt?.toDate ? bill.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : bill.visitDate}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-navy uppercase tracking-tight">{patients[bill.patientId]?.name || 'Memuat...'}</p>
                      {patients[bill.patientId]?.paymentMethod === 'BPJS' && (
                        <span className="text-[8px] font-black text-pink bg-pink-soft px-2 py-0.5 rounded uppercase tracking-tighter">Pasien BPJS</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {bill.billing?.items?.map((item: any, i: number) => (
                          <span key={i} className="text-[9px] font-black bg-navy-50 text-navy/40 px-2 py-1 rounded uppercase tracking-tighter">{item.name}</span>
                        )) || <span className="text-[9px] font-bold text-navy/20 italic">Tidak ada layanan</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-navy tracking-tighter tabular-nums">Rp {(bill.billing?.total || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleUpdateStatus(bill.id, bill.billing?.status)}
                        className={cn(
                          "text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 w-fit transition-all hover:scale-105",
                          bill.billing?.status === 'Paid' 
                            ? "bg-green-50 text-green-600" 
                            : "bg-pink-soft text-pink"
                        )}
                      >
                        {bill.billing?.status === 'Paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {bill.billing?.status === 'Paid' ? 'Lunas' : 'Belum Bayar'}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="p-2 text-navy/20 hover:text-pink hover:bg-pink-soft rounded-xl transition-all"
                          title="Cetak Kuitansi"
                          onClick={() => window.print()}
                        >
                          <Printer size={18} />
                        </button>
                        <button className="p-2 text-navy/20 hover:text-navy hover:bg-navy-50 rounded-xl transition-all" title="Download Data">
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBillings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Receipt size={64} />
                        <p className="text-sm font-black uppercase tracking-widest">Tidak ada data transaksi ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
