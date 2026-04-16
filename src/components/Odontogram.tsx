import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ToothStatus = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

const TOOTH_STATUSES = [
  { s: 'A', t: '0' as ToothStatus, label: 'Sehat', color: 'bg-white border-gray-400' },
  { s: 'B', t: '1' as ToothStatus, label: 'Gigi Berlubang/Karies', color: 'bg-red-500 border-red-700' },
  { s: 'C', t: '2' as ToothStatus, label: 'Tumpatan dengan karies', color: 'bg-blue-500 border-blue-700' },
  { s: 'D', t: '3' as ToothStatus, label: 'Tumpatan tanpa karies', color: 'bg-green-500 border-green-700' },
  { s: 'E', t: '4' as ToothStatus, label: 'Gigi dicabut karena karies', color: 'bg-gray-400 border-gray-600' },
  { s: '-', t: '5' as ToothStatus, label: 'Gigi dicabut karena sebab lain', color: 'bg-gray-200 border-gray-400' },
  { s: 'F', t: '6' as ToothStatus, label: 'Fissure Sealant', color: 'bg-yellow-400 border-yellow-600' },
  { s: 'G', t: '7' as ToothStatus, label: 'Protesa cekat/mahkota cekat/implan/veneer', color: 'bg-purple-500 border-purple-700' },
  { s: '-', t: '8' as ToothStatus, label: 'Gigi tidak tumbuh', color: 'bg-gray-100 border-gray-300 opacity-30' },
  { s: '-', t: '9' as ToothStatus, label: 'Lain-lain', color: 'bg-orange-400 border-orange-600' },
];

interface ToothProps {
  number: number;
  status: ToothStatus;
  onClick: (number: number, event: React.MouseEvent) => void;
  isPrimary?: boolean;
}

const Tooth: React.FC<ToothProps> = ({ number, status, onClick, isPrimary }) => {
  const statusColors: Record<ToothStatus, string> = {
    '0': 'fill-white stroke-gray-400',
    '1': 'fill-red-500 stroke-red-700',
    '2': 'fill-blue-500 stroke-blue-700',
    '3': 'fill-green-500 stroke-green-700',
    '4': 'fill-gray-400 stroke-gray-600',
    '5': 'fill-gray-200 stroke-gray-400',
    '6': 'fill-yellow-400 stroke-yellow-600',
    '7': 'fill-purple-500 stroke-purple-700',
    '8': 'fill-gray-100 stroke-gray-300 opacity-30',
    '9': 'fill-orange-400 stroke-orange-600',
  };

  return (
    <div 
      onClick={(e) => onClick(number, e)}
      className="flex flex-col items-center cursor-pointer group relative"
    >
      <span className={cn("text-[10px] font-bold mb-1 group-hover:text-blue-600", isPrimary ? "text-blue-500" : "text-gray-500")}>
        {number}
      </span>
      <svg width="30" height="40" viewBox="0 0 30 40" className="transition-transform group-hover:scale-110">
        <path 
          d="M5 10 Q5 5 15 5 Q25 5 25 10 L25 30 Q25 35 15 35 Q5 35 5 30 Z" 
          className={cn("transition-colors duration-200", statusColors[status])}
          strokeWidth="2"
        />
        {/* Visual indicators for different statuses */}
        {status === '1' && <circle cx="15" cy="20" r="4" fill="white" opacity="0.5" />}
        {status === '2' && <rect x="10" y="15" width="10" height="10" fill="white" opacity="0.3" />}
        {status === '4' && <line x1="8" y1="15" x2="22" y2="25" stroke="white" strokeWidth="2" />}
      </svg>
    </div>
  );
};

interface OdontogramProps {
  value?: Record<number, ToothStatus>;
  onChange?: (data: Record<number, ToothStatus>) => void;
}

export const Odontogram: React.FC<OdontogramProps> = ({ value = {}, onChange }) => {
  const [activeTooth, setActiveTooth] = useState<{ number: number, x: number, y: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toothData = value;
  const setToothData = (newData: Record<number, ToothStatus>) => {
    if (onChange) onChange(newData);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveTooth(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToothClick = (number: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const container = event.currentTarget.closest('.odontogram-container');
    const containerRect = container?.getBoundingClientRect();

    if (containerRect) {
      setActiveTooth({ 
        number, 
        x: rect.left - containerRect.left, 
        y: rect.top - containerRect.top + rect.height
      });
    }
  };

  const setStatus = (status: ToothStatus) => {
    if (activeTooth) {
      setToothData({ ...toothData, [activeTooth.number]: status });
      setActiveTooth(null);
    }
  };

  // FDI Tooth Numbering - Permanent
  const upperRightPerm = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeftPerm = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerRightPerm = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerLeftPerm = [31, 32, 33, 34, 35, 36, 37, 38];

  // FDI Tooth Numbering - Primary (Sulung)
  const upperRightPrim = [55, 54, 53, 52, 51];
  const upperLeftPrim = [61, 62, 63, 64, 65];
  const lowerRightPrim = [85, 84, 83, 82, 81];
  const lowerLeftPrim = [71, 72, 73, 74, 75];

  return (
    <div className="glass-card p-6 rounded-2xl overflow-x-auto relative odontogram-container">
      <AnimatePresence>
        {activeTooth && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-[100] bg-white border border-navy/10 rounded-2xl shadow-2xl p-4 w-64 max-h-[300px] overflow-y-auto custom-scrollbar"
            style={{ 
              left: Math.max(10, Math.min(activeTooth.x - 110, 1000)), // 1000 is a safe max width for absolute
              top: activeTooth.y + 10 
            }}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-navy/5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-gold rounded-full"></div>
                <span className="text-xs font-black text-navy uppercase tracking-widest">Gigi {activeTooth.number}</span>
              </div>
              <button onClick={() => setActiveTooth(null)} className="p-1 hover:bg-navy-50 rounded-lg text-navy/30 hover:text-pink transition-all">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {TOOTH_STATUSES.map((item) => (
                <button
                  key={item.t}
                  onClick={() => setStatus(item.t)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left group",
                    toothData[activeTooth.number] === item.t ? "bg-navy text-white" : "hover:bg-navy-50"
                  )}
                >
                  <div className={cn("w-3 h-3 border rounded-sm shrink-0", item.color)}></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tighter leading-none mb-1">{item.label}</span>
                    <span className="text-[8px] opacity-50 uppercase tracking-widest">Kode: {item.t}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-w-[800px] space-y-8">
        {/* Permanent Upper */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Gigi Tetap (Atas)</p>
          <div className="flex justify-between border-b border-gray-50 pb-4">
            <div className="flex gap-2">
              {upperRightPerm.map(n => <Tooth key={n} number={n} status={toothData[n] || '0'} onClick={handleToothClick} />)}
            </div>
            <div className="flex gap-2">
              {upperLeftPerm.map(n => <Tooth key={n} number={n} status={toothData[n] || '0'} onClick={handleToothClick} />)}
            </div>
          </div>
        </div>

        {/* Primary Teeth (Sulung) */}
        <div className="bg-blue-50/30 p-4 rounded-2xl space-y-4">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest text-center">Gigi Sulung</p>
          <div className="flex justify-center gap-12">
            <div className="flex gap-2">
              {upperRightPrim.map(n => <Tooth key={n} number={n} status={toothData[n] || '0'} onClick={handleToothClick} isPrimary />)}
            </div>
            <div className="flex gap-2">
              {upperLeftPrim.map(n => <Tooth key={n} number={n} status={toothData[n] || '0'} onClick={handleToothClick} isPrimary />)}
            </div>
          </div>
          <div className="flex justify-center gap-12">
            <div className="flex gap-2">
              {lowerRightPrim.map(n => <Tooth key={n} number={n} status={toothData[n] || '0'} onClick={handleToothClick} isPrimary />)}
            </div>
            <div className="flex gap-2">
              {lowerLeftPrim.map(n => <Tooth key={n} number={n} status={toothData[n] || '0'} onClick={handleToothClick} isPrimary />)}
            </div>
          </div>
        </div>

        {/* Permanent Lower */}
        <div className="space-y-2">
          <div className="flex justify-between border-t border-gray-50 pt-4">
            <div className="flex gap-2">
              {lowerRightPerm.map(n => <Tooth key={n} number={n} status={toothData[n] || '0'} onClick={handleToothClick} />)}
            </div>
            <div className="flex gap-2">
              {lowerLeftPerm.map(n => <Tooth key={n} number={n} status={toothData[n] || '0'} onClick={handleToothClick} />)}
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Gigi Tetap (Bawah)</p>
        </div>

        {/* Legend */}
        <div className="mt-8 border-t border-gray-100 pt-6">
          <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider text-center">Legenda Status Gigi (Standar Kemenkes)</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TOOTH_STATUSES.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-navy-50/50 rounded-xl border border-transparent hover:border-gold/20 transition-all">
                <div className={cn("w-4 h-4 border rounded-sm shrink-0 shadow-sm", item.color)}></div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-navy uppercase tracking-tighter leading-tight">{item.label}</span>
                  <span className="text-[8px] text-navy/40 uppercase font-bold tracking-widest">Kode: {item.t}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[10px] text-navy/30 font-bold uppercase tracking-[0.2em] text-center">* Klik pada ikon gigi untuk memilih status dari menu dropdown.</p>
        </div>
      </div>
    </div>
  );
};
