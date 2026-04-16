import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Mail, 
  Clock,
  ShieldAlert,
  Search,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        isApproved: true,
        approvedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error approving user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error("Error rejecting user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        jenisTenaga: newRole
      });
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ? true : 
                         filter === 'pending' ? !u.isApproved : u.isApproved;
    
    // Don't show Super Admin in the list to prevent self-modification
    return matchesSearch && matchesFilter && u.role !== 'Super Admin';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="text-pink animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex bg-navy-50 p-1 rounded-2xl w-fit">
          {[
            { id: 'pending', label: 'Menunggu' },
            { id: 'approved', label: 'Disetujui' },
            { id: 'all', label: 'Semua' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id as any)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === t.id ? "bg-navy text-white shadow-lg" : "text-navy/40 hover:text-navy"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" size={16} />
          <input 
            type="text" 
            placeholder="Cari pengguna..."
            className="w-full pl-12 pr-4 py-3 bg-navy-50 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-xs font-bold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredUsers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center bg-navy-50/50 rounded-[2rem] border-2 border-dashed border-navy/10"
            >
              <User className="mx-auto text-navy/10 mb-4" size={48} />
              <p className="text-navy/40 font-black uppercase tracking-widest text-xs">Tidak ada pengguna ditemukan</p>
            </motion.div>
          ) : (
            filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-[2rem] border border-navy/5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center text-navy shadow-inner overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-navy uppercase tracking-tight">{user.fullName}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-navy/40">
                        <Mail size={12} />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={12} className="text-gold" />
                        <select 
                          value={user.role}
                          disabled={actionLoading === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-transparent border-none p-0 text-[10px] font-bold text-gold uppercase tracking-wider focus:ring-0 cursor-pointer hover:text-pink transition-colors disabled:opacity-50"
                        >
                          <option value="Administrasi Umum">Administrasi Umum</option>
                          <option value="Terapis Gigi dan Mulut">Terapis Gigi dan Mulut</option>
                          <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                          <option value="Pasien">Pasien</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!user.isApproved ? (
                    <>
                      <button 
                        onClick={() => handleApprove(user.id)}
                        disabled={actionLoading === user.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                      >
                        {actionLoading === user.id ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Setujui
                      </button>
                      <button 
                        onClick={() => handleReject(user.id)}
                        disabled={actionLoading === user.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-pink-soft text-pink rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-pink hover:text-white transition-all disabled:opacity-50"
                      >
                        {actionLoading === user.id ? <RefreshCw className="animate-spin" size={16} /> : <XCircle size={16} />}
                        Tolak
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-green-50 text-green-600 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={14} />
                        Aktif
                      </div>
                      <button 
                        onClick={() => handleReject(user.id)}
                        disabled={actionLoading === user.id}
                        className="p-3 text-navy/20 hover:text-pink transition-colors disabled:opacity-50"
                        title="Hapus Pengguna"
                      >
                        {actionLoading === user.id ? <RefreshCw className="animate-spin" size={18} /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
