import React, { useState } from 'react';
import { cn } from '@/src/lib/utils';

type ToothStatus = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

interface ToothProps {
  number: number;
  status: ToothStatus;
  onClick: (number: number) => void;
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
      onClick={() => onClick(number)}
      className="flex flex-col items-center cursor-pointer group"
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

export const Odontogram = () => {
  const [toothData, setToothData] = useState<Record<number, ToothStatus>>({});

  const handleToothClick = (number: number) => {
    const statuses: ToothStatus[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const currentStatus = toothData[number] || '0';
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    setToothData({ ...toothData, [number]: statuses[nextIndex] });
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
    <div className="glass-card p-6 rounded-2xl overflow-x-auto">
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
          <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider">Legenda Status Gigi (Standar Kemenkes)</h4>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2 border-r border-gray-100">Gigi Sulung</th>
                  <th className="px-4 py-2 border-r border-gray-100">Gigi Tetap</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { s: 'A', t: '0', label: 'Sehat', color: 'bg-white border-gray-400' },
                  { s: 'B', t: '1', label: 'Gigi Berlubang/Karies', color: 'bg-red-500 border-red-700' },
                  { s: 'C', t: '2', label: 'Tumpatan dengan karies', color: 'bg-blue-500 border-blue-700' },
                  { s: 'D', t: '3', label: 'Tumpatan tanpa karies', color: 'bg-green-500 border-green-700' },
                  { s: 'E', t: '4', label: 'Gigi dicabut karena karies', color: 'bg-gray-400 border-gray-600' },
                  { s: '-', t: '5', label: 'Gigi dicabut karena sebab lain', color: 'bg-gray-200 border-gray-400' },
                  { s: 'F', t: '6', label: 'Fissure Sealant', color: 'bg-yellow-400 border-yellow-600' },
                  { s: 'G', t: '7', label: 'Protesa cekat/mahkota cekat/implan/veneer', color: 'bg-purple-500 border-purple-700' },
                  { s: '-', t: '8', label: 'Gigi tidak tumbuh', color: 'bg-gray-100 border-gray-300 opacity-30' },
                  { s: '-', t: '9', label: 'Lain-lain', color: 'bg-orange-400 border-orange-600' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 border-r border-gray-100 font-bold text-blue-600">{item.s}</td>
                    <td className="px-4 py-2 border-r border-gray-100 font-bold text-gray-900">{item.t}</td>
                    <td className="px-4 py-2 flex items-center gap-3">
                      <div className={cn("w-3 h-3 border rounded-sm", item.color)}></div>
                      <span className="font-medium text-gray-700">{item.label}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[10px] text-gray-400 italic text-center">* Klik pada ikon gigi untuk mengubah status secara berurutan.</p>
        </div>
      </div>
    </div>
  );
};
