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
  RefreshCw,
  Trash2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus draf rekam medis ini? Data akan hilang secara permanen.")) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'dental_records', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'dental_records');
    }
  };

  const filteredBillings = billings.filter(bill => {
    const patientName = patients[bill.patientId]?.name?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    return patientName.includes(searchLower) || bill.id.toLowerCase().includes(searchLower);
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <Receipt size={13} className="text-purple-600" />
              Kasir & Pembayaran
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">Poli Gigi & Mulut</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold text-pink-600">SIGEMA KOPO</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Manajemen Billing & Kasir Pelayanan</h1>
          <p className="text-xs text-slate-500">UPTD Puskesmas Kopo · Rekapitulasi Biaya Tindakan Medis & Pasien BPJS</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-xs border border-purple-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-100 to-pink-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Receipt size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Billing Terkumpul</p>
              <p className="text-sm font-bold text-purple-950 font-mono">
                Rp {billings.filter(b => b.billing?.status === 'Paid').reduce((acc, curr) => acc + (curr.billing?.total || 0), 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/70">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Cari No. Invoice atau nama pasien..." 
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-2xs"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Total Transaksi: <strong className="font-mono text-purple-900">{filteredBillings.length}</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="text-purple-600 animate-spin" size={32} />
              <p className="text-xs font-semibold text-slate-600">Memuat data billing & transaksi...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="px-4 py-3.5 font-semibold">No. Invoice & Tanggal</th>
                  <th className="px-5 py-3.5 font-semibold">Pasien</th>
                  <th className="px-4 py-3.5 font-semibold">Tindakan / Item Layanan</th>
                  <th className="px-4 py-3.5 font-semibold">Total Tagihan</th>
                  <th className="px-4 py-3.5 font-semibold">Status Bayar</th>
                  <th className="px-4 py-3.5 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBillings.map((bill) => (
                  <tr key={bill.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-slate-800 block text-[11px]">
                        INV-{bill.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        {bill.createdAt?.toDate ? bill.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : bill.visitDate}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{patients[bill.patientId]?.name || 'Pasien Rawat Jalan'}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn(
                          "text-[10px] font-semibold px-2 py-0.2 rounded font-mono",
                          patients[bill.patientId]?.paymentMethod === 'BPJS' ? "bg-emerald-100 text-emerald-800" : "bg-pink-100 text-pink-800 border border-pink-200"
                        )}>
                          {patients[bill.patientId]?.paymentMethod === 'BPJS' ? 'BPJS PBI/Mandiri' : 'Pasien Mandiri'}
                        </span>
                        {patients[bill.patientId]?.rmNumber && (
                          <span className="text-[10px] text-slate-400 font-mono">RM: {patients[bill.patientId].rmNumber}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {bill.billing?.items?.map((item: any, i: number) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/60 font-medium">
                            {item.name}
                          </span>
                        )) || <span className="text-[11px] text-slate-400 italic">Pemeriksaan rutin</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-mono font-bold text-slate-900 text-xs">
                        Rp {(bill.billing?.total || 0).toLocaleString('id-ID')}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <button 
                        onClick={() => handleUpdateStatus(bill.id, bill.billing?.status)}
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors",
                          bill.billing?.status === 'Paid' 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" 
                            : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        )}
                        title="Klik untuk ubah status pembayaran"
                      >
                        {bill.billing?.status === 'Paid' ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Clock size={13} className="text-amber-600" />}
                        <span>{bill.billing?.status === 'Paid' ? 'Lunas' : 'Belum Bayar'}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Cetak Kuitansi"
                          onClick={() => window.print()}
                        >
                          <Printer size={15} />
                        </button>
                        {bill.status === 'draft' && (
                          <button 
                            onClick={() => handleDelete(bill.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" 
                            title="Hapus Rekam Draf"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBillings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <Receipt size={36} className="stroke-[1.5] text-slate-300" />
                        <p className="text-xs font-semibold text-slate-600">Tidak ada catatan transaksi billing ditemukan</p>
                        <p className="text-[11px] text-slate-400">Tagihan akan otomatis terbuat saat pemeriksaan pasien difinalisasi.</p>
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
