import React, { useState } from 'react';
import { 
  Activity, 
  Smile, 
  AlertCircle, 
  FileText, 
  Printer, 
  CheckSquare, 
  Square, 
  Sparkles,
  Info,
  Clock,
  Mic,
  Volume2,
  Calendar,
  User,
  Heart,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ClinicalData } from '../constants/lampiranTypes';
import { VoiceInputButton } from './VoiceInputButton';
import { TextToSpeechButton } from './TextToSpeechButton';
import { cn } from '../lib/utils';

interface ClinicalLampiranSectionProps {
  data: ClinicalData;
  onChange: (updated: ClinicalData) => void;
  patient?: any;
  visitDate?: string;
  onOpenVoiceModal?: () => void;
}

export const ClinicalLampiranSection: React.FC<ClinicalLampiranSectionProps> = ({
  data,
  onChange,
  patient,
  visitDate = new Date().toISOString().split('T')[0],
  onOpenVoiceModal
}) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'lampiran'>('interactive');

  const updateVital = (field: keyof ClinicalData['vitalSigns'], val: any) => {
    onChange({
      ...data,
      vitalSigns: {
        ...data.vitalSigns,
        [field]: val
      }
    });
  };

  const updateExtraOral = (field: keyof ClinicalData['extraOral'], val: any) => {
    onChange({
      ...data,
      extraOral: {
        ...data.extraOral,
        [field]: val
      }
    });
  };

  const updateIntraOral = (field: keyof ClinicalData['intraOral'], val: any) => {
    onChange({
      ...data,
      intraOral: {
        ...data.intraOral,
        [field]: val
      }
    });
  };

  const toggleAnomaly = (anomaly: string) => {
    const current = data.intraOral?.anomalies || [];
    let updated: string[];
    if (anomaly === 'Tidak Ada Kelainan') {
      updated = ['Tidak Ada Kelainan'];
    } else {
      const filtered = current.filter(a => a !== 'Tidak Ada Kelainan');
      if (filtered.includes(anomaly)) {
        updated = filtered.filter(a => a !== anomaly);
      } else {
        updated = [...filtered, anomaly];
      }
      if (updated.length === 0) {
        updated = ['Tidak Ada Kelainan'];
      }
    }
    updateIntraOral('anomalies', updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const anomalyOptions = [
    'Gigi Berjejal (Crowding)',
    'Diastema (Renggang Sentral/Multipel)',
    'Gigi Protrusif (Tonggos/Maju)',
    'Crossbite (Gigitan Silang Anterior/Posterior)',
    'Deep Bite (Gigitan Dalam)',
    'Open Bite (Gigitan Terbuka)',
    'Agenesis (Benih Gigi Tidak Ada)',
    'Persistensi Gigi Susu',
    'Atrisi / Abrasi / Erosi / Abfraksi',
    'Gigi Impaksi / Miring',
    'Tidak Ada Kelainan',
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-navy via-navy-light to-navy p-5 rounded-3xl text-white shadow-lg no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Activity className="text-gold" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                Format Resmi
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight">II. Pemeriksaan Klinis (Askesgilut)</h3>
            </div>
            <p className="text-xs text-white/70 mt-0.5">Tanda Vital, Pemeriksaan Ekstra Oral & Intra Oral Lengkap</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenVoiceModal && (
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="flex items-center gap-2 px-3 py-2 bg-pink/20 hover:bg-pink text-pink-200 hover:text-white rounded-xl text-xs font-black transition-all border border-pink/30 uppercase tracking-wider"
              title="Bicara untuk mengisi rekam medis"
            >
              <Mic size={14} className="animate-pulse" />
              <span>Dikte Suara</span>
            </button>
          )}

          <div className="bg-white/10 p-1 rounded-2xl flex items-center border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('interactive')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all uppercase tracking-wider",
                viewMode === 'interactive' 
                  ? "bg-white text-navy shadow-md" 
                  : "text-white/70 hover:text-white"
              )}
            >
              Formulir Input
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lampiran')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all uppercase tracking-wider flex items-center gap-1.5",
                viewMode === 'lampiran' 
                  ? "bg-gold text-navy shadow-md" 
                  : "text-white/70 hover:text-white"
              )}
            >
              <FileText size={13} />
              Format Lampiran Cetak
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white text-white hover:text-navy rounded-xl text-xs font-black transition-all uppercase tracking-wider border border-white/20"
            title="Cetak Format Lampiran Ini"
          >
            <Printer size={14} />
            <span className="hidden md:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. INTERACTIVE FORM MODE                                        */}
      {/* ============================================================== */}
      {viewMode === 'interactive' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Sub A: Tanda-Tanda Vital & Keadaan Umum */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-navy/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-navy/5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-pink-soft text-pink flex items-center justify-center font-black text-sm">A</span>
                <div>
                  <h4 className="text-sm font-black text-navy uppercase tracking-wider">Tanda-Tanda Vital & Keadaan Umum</h4>
                  <p className="text-[11px] text-navy/40 font-bold">Tekanan darah, nadi, pernapasan, suhu tubuh, dan kesadaran</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5">
                <label className="text-[10px] font-black text-navy/50 uppercase tracking-wider">Tekanan Darah (TD)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white rounded-xl text-xs font-black text-navy border border-navy/10"
                    placeholder="120/80"
                    value={data.vitalSigns?.bloodPressure || ''}
                    onChange={(e) => updateVital('bloodPressure', e.target.value)}
                  />
                  <span className="text-[10px] font-bold text-navy/40">mmHg</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5">
                <label className="text-[10px] font-black text-navy/50 uppercase tracking-wider">Denyut Nadi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white rounded-xl text-xs font-black text-navy border border-navy/10"
                    placeholder="80"
                    value={data.vitalSigns?.pulse || ''}
                    onChange={(e) => updateVital('pulse', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-[10px] font-bold text-navy/40">x/mnt</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5">
                <label className="text-[10px] font-black text-navy/50 uppercase tracking-wider">Irama Nadi</label>
                <select
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/10"
                  value={data.vitalSigns?.pulseRhythm || 'Teratur'}
                  onChange={(e) => updateVital('pulseRhythm', e.target.value)}
                >
                  <option value="Teratur">Teratur (Regular)</option>
                  <option value="Tidak Teratur">Tidak Teratur (Irregular)</option>
                </select>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5">
                <label className="text-[10px] font-black text-navy/50 uppercase tracking-wider">Pernapasan (RR)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white rounded-xl text-xs font-black text-navy border border-navy/10"
                    placeholder="18"
                    value={data.vitalSigns?.respiration || ''}
                    onChange={(e) => updateVital('respiration', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-[10px] font-bold text-navy/40">x/mnt</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5">
                <label className="text-[10px] font-black text-navy/50 uppercase tracking-wider">Suhu Tubuh</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white rounded-xl text-xs font-black text-navy border border-navy/10"
                    placeholder="36.5"
                    value={data.vitalSigns?.temperature || ''}
                    onChange={(e) => updateVital('temperature', e.target.value)}
                  />
                  <span className="text-[10px] font-bold text-navy/40">°C</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5">
                <label className="text-[10px] font-black text-navy/50 uppercase tracking-wider">Tingkat Kesadaran</label>
                <select
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/10"
                  value={data.vitalSigns?.consciousness || 'Compos Mentis'}
                  onChange={(e) => updateVital('consciousness', e.target.value)}
                >
                  <option value="Compos Mentis">Compos Mentis (Sadar Penuh)</option>
                  <option value="Apatis">Apatis (Acuh Tak Acuh)</option>
                  <option value="Somnolen">Somnolen (Mengantuk)</option>
                  <option value="Sopor">Sopor</option>
                  <option value="Koma">Koma</option>
                </select>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5">
                <label className="text-[10px] font-black text-navy/50 uppercase tracking-wider">Berat Badan (BB)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white rounded-xl text-xs font-black text-navy border border-navy/10"
                    placeholder="60"
                    value={data.vitalSigns?.weight || ''}
                    onChange={(e) => updateVital('weight', e.target.value)}
                  />
                  <span className="text-[10px] font-bold text-navy/40">kg</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5">
                <label className="text-[10px] font-black text-navy/50 uppercase tracking-wider">Tinggi Badan (TB)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white rounded-xl text-xs font-black text-navy border border-navy/10"
                    placeholder="165"
                    value={data.vitalSigns?.height || ''}
                    onChange={(e) => updateVital('height', e.target.value)}
                  />
                  <span className="text-[10px] font-bold text-navy/40">cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub B: Pemeriksaan Ekstra Oral */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-navy/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-navy/5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-pink-soft text-pink flex items-center justify-center font-black text-sm">B</span>
                <div>
                  <h4 className="text-sm font-black text-navy uppercase tracking-wider">Pemeriksaan Fisik Ekstra Oral</h4>
                  <p className="text-[11px] text-navy/40 font-bold">Wajah, profil muka, bibir, kelenjar limfe, kelenjar saliva, dan TMJ</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Muka / Wajah */}
              <div className="p-4 rounded-2xl bg-navy-50/40 border border-navy/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-navy uppercase tracking-wider">1. Bentuk Muka / Wajah</label>
                  <div className="flex bg-white p-0.5 rounded-lg border border-navy/5">
                    <button
                      type="button"
                      onClick={() => updateExtraOral('faceSymmetry', 'Simetris')}
                      className={cn(
                        "px-3 py-1 rounded text-xs font-black transition-all",
                        data.extraOral?.faceSymmetry === 'Simetris' ? "bg-navy text-gold shadow-sm" : "text-navy/40"
                      )}
                    >
                      SIMETRIS
                    </button>
                    <button
                      type="button"
                      onClick={() => updateExtraOral('faceSymmetry', 'Asimetris')}
                      className={cn(
                        "px-3 py-1 rounded text-xs font-black transition-all",
                        data.extraOral?.faceSymmetry === 'Asimetris' ? "bg-pink text-white shadow-sm" : "text-navy/40"
                      )}
                    >
                      ASIMETRIS
                    </button>
                  </div>
                </div>

                {data.extraOral?.faceSymmetry === 'Asimetris' && (
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-pink/30"
                    placeholder="Sebutkan penyebab asimetris (misal: pembengkakan pipi kanan, trauma)..."
                    value={data.extraOral?.faceSymmetryNote || ''}
                    onChange={(e) => updateExtraOral('faceSymmetryNote', e.target.value)}
                  />
                )}

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[10px] font-bold text-navy/50">Profil Muka:</span>
                  <div className="flex gap-1.5 flex-1">
                    {['Lurus', 'Cembung', 'Cekung'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => updateExtraOral('faceProfile', p)}
                        className={cn(
                          "flex-1 py-1 px-2 rounded-lg text-xs font-bold border text-center transition-all",
                          data.extraOral?.faceProfile === p ? "bg-navy text-gold border-navy" : "bg-white text-navy/40 border-navy/5"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Kulit & Bibir */}
              <div className="p-4 rounded-2xl bg-navy-50/40 border border-navy/5 space-y-3">
                <label className="text-xs font-black text-navy uppercase tracking-wider block">2. Kulit Wajah & Bibir (Vermilion)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-navy/50 block mb-1">Kulit Wajah & Leher:</span>
                    <select
                      className="w-full px-3 py-1.5 bg-white rounded-xl text-xs font-bold border border-navy/10"
                      value={data.extraOral?.skin || 'Normal'}
                      onChange={(e) => updateExtraOral('skin', e.target.value)}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Ada Lesi / Fistula">Ada Lesi / Fistula</option>
                      <option value="Sikatriks (Parut)">Sikatriks (Parut)</option>
                      <option value="Edema / Pembengkakan">Edema / Pembengkakan</option>
                      <option value="Eritema / Ruam">Eritema / Ruam</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-navy/50 block mb-1">Bibir (Vermilion):</span>
                    <select
                      className="w-full px-3 py-1.5 bg-white rounded-xl text-xs font-bold border border-navy/10"
                      value={data.extraOral?.lips || 'Normal'}
                      onChange={(e) => updateExtraOral('lips', e.target.value)}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Kering / Cheilitis">Kering / Cheilitis</option>
                      <option value="Pecah-pecah">Pecah-pecah</option>
                      <option value="Labioschisis (Sumbing)">Labioschisis (Sumbing)</option>
                      <option value="Sariawan / Herpes">Sariawan / Herpes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Kelenjar Getah Bening & Saliva */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 rounded-2xl bg-navy-50/40 border border-navy/5 space-y-3">
                <label className="text-xs font-black text-navy uppercase tracking-wider block">
                  3. Kelenjar Getah Bening / Limfe (Palpasi)
                </label>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-navy/5">
                    <span className="font-bold text-navy/70">Submandibula Kanan:</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...data,
                            extraOral: {
                              ...data.extraOral,
                              lymphNodes: {
                                ...data.extraOral.lymphNodes,
                                submandibularRight: { ...data.extraOral.lymphNodes.submandibularRight, palpable: false }
                              }
                            }
                          });
                        }}
                        className={cn("px-2 py-0.5 rounded text-[11px] font-bold", !data.extraOral?.lymphNodes?.submandibularRight?.palpable ? "bg-navy text-gold" : "bg-navy-50 text-navy/40")}
                      >
                        Tidak Teraba
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...data,
                            extraOral: {
                              ...data.extraOral,
                              lymphNodes: {
                                ...data.extraOral.lymphNodes,
                                submandibularRight: { ...data.extraOral.lymphNodes.submandibularRight, palpable: true }
                              }
                            }
                          });
                        }}
                        className={cn("px-2 py-0.5 rounded text-[11px] font-bold", data.extraOral?.lymphNodes?.submandibularRight?.palpable ? "bg-red-500 text-white" : "bg-navy-50 text-navy/40")}
                      >
                        Teraba
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-navy/5">
                    <span className="font-bold text-navy/70">Submandibula Kiri:</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...data,
                            extraOral: {
                              ...data.extraOral,
                              lymphNodes: {
                                ...data.extraOral.lymphNodes,
                                submandibularLeft: { ...data.extraOral.lymphNodes.submandibularLeft, palpable: false }
                              }
                            }
                          });
                        }}
                        className={cn("px-2 py-0.5 rounded text-[11px] font-bold", !data.extraOral?.lymphNodes?.submandibularLeft?.palpable ? "bg-navy text-gold" : "bg-navy-50 text-navy/40")}
                      >
                        Tidak Teraba
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...data,
                            extraOral: {
                              ...data.extraOral,
                              lymphNodes: {
                                ...data.extraOral.lymphNodes,
                                submandibularLeft: { ...data.extraOral.lymphNodes.submandibularLeft, palpable: true }
                              }
                            }
                          });
                        }}
                        className={cn("px-2 py-0.5 rounded text-[11px] font-bold", data.extraOral?.lymphNodes?.submandibularLeft?.palpable ? "bg-red-500 text-white" : "bg-navy-50 text-navy/40")}
                      >
                        Teraba
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Sendi Temporomandibular (TMJ) */}
              <div className="p-4 rounded-2xl bg-navy-50/40 border border-navy/5 space-y-3">
                <label className="text-xs font-black text-navy uppercase tracking-wider block">
                  4. Sendi Rahang / TMJ (Temporomandibular Joint)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white border border-navy/5">
                    <span className="text-[10px] font-bold text-navy/50 block">Clicking / Bunyi:</span>
                    <div className="flex gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...data,
                            extraOral: {
                              ...data.extraOral,
                              tmj: { ...data.extraOral.tmj, clicking: false }
                            }
                          });
                        }}
                        className={cn("flex-1 py-1 rounded text-[10px] font-bold", !data.extraOral?.tmj?.clicking ? "bg-navy text-gold" : "bg-navy-50 text-navy/40")}
                      >
                        Tidak
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onChange({
                            ...data,
                            extraOral: {
                              ...data.extraOral,
                              tmj: { ...data.extraOral.tmj, clicking: true }
                            }
                          });
                        }}
                        className={cn("flex-1 py-1 rounded text-[10px] font-bold", data.extraOral?.tmj?.clicking ? "bg-red-500 text-white" : "bg-navy-50 text-navy/40")}
                      >
                        Ada
                      </button>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-navy/5">
                    <span className="text-[10px] font-bold text-navy/50 block">Keterbatasan (Trismus):</span>
                    <select
                      className="w-full mt-1 px-2 py-1 bg-white rounded text-[11px] font-bold border border-navy/10"
                      value={data.extraOral?.tmj?.trismus || 'Normal (≥ 3 jari)'}
                      onChange={(e) => {
                        onChange({
                          ...data,
                          extraOral: {
                            ...data.extraOral,
                            tmj: { ...data.extraOral.tmj, trismus: e.target.value }
                          }
                        });
                      }}
                    >
                      <option value="Normal (≥ 3 jari)">Normal (≥ 3 jari)</option>
                      <option value="Terbatas (< 3 jari)">Terbatas (&lt; 3 jari)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub C: Pemeriksaan Fisik Intra Oral */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-navy/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-navy/5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-pink-soft text-pink flex items-center justify-center font-black text-sm">C</span>
                <div>
                  <h4 className="text-sm font-black text-navy uppercase tracking-wider">Pemeriksaan Fisik Intra Oral</h4>
                  <p className="text-[11px] text-navy/40 font-bold">Jaringan lunak, mukosa, lidah, palatum, faring/tonsil, gusi, dan kelainan gigi</p>
                </div>
              </div>
            </div>

            {/* Grid Evaluasi Jaringan Lunak Rongga Mulut */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Mukosa Labial */}
              <div className="p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-1.5">
                <label className="text-[11px] font-black text-navy/70 uppercase">Mukosa Labial (Bibir)</label>
                <select
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/10"
                  value={data.intraOral?.labialMucosa || 'Normal'}
                  onChange={(e) => updateIntraOral('labialMucosa', e.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Stomatitis (Sariawan)">Stomatitis (Sariawan)</option>
                  <option value="Ulkus">Ulkus</option>
                  <option value="Pembengkakan">Pembengkakan</option>
                  <option value="Kelainan Lain">Kelainan Lain</option>
                </select>
              </div>

              {/* Mukosa Bukal */}
              <div className="p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-1.5">
                <label className="text-[11px] font-black text-navy/70 uppercase">Mukosa Bukal (Pipi)</label>
                <select
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/10"
                  value={data.intraOral?.buccalMucosa || 'Normal'}
                  onChange={(e) => updateIntraOral('buccalMucosa', e.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Linea Alba Buccalis">Linea Alba Buccalis</option>
                  <option value="Cheek Biting">Cheek Biting</option>
                  <option value="Leukoplakia">Leukoplakia</option>
                  <option value="Ulkus / Sariawan">Ulkus / Sariawan</option>
                </select>
              </div>

              {/* Vestibulum */}
              <div className="p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-1.5">
                <label className="text-[11px] font-black text-navy/70 uppercase">Vestibulum (Labial & Bukal)</label>
                <select
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/10"
                  value={data.intraOral?.vestibule || 'Normal / Dalam'}
                  onChange={(e) => updateIntraOral('vestibule', e.target.value)}
                >
                  <option value="Normal / Dalam">Normal / Dalam</option>
                  <option value="Dangkal">Dangkal</option>
                  <option value="Radang / Fistel">Radang / Fistel</option>
                </select>
              </div>

              {/* Dasar Mulut */}
              <div className="p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-1.5">
                <label className="text-[11px] font-black text-navy/70 uppercase">Dasar Mulut (Floor of Mouth)</label>
                <select
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/10"
                  value={data.intraOral?.floorOfMouth || 'Normal'}
                  onChange={(e) => updateIntraOral('floorOfMouth', e.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Torus Mandibularis">Torus Mandibularis</option>
                  <option value="Ranula / Mucocele">Ranula / Mucocele</option>
                  <option value="Kelainan Lain">Kelainan Lain</option>
                </select>
              </div>

              {/* Lidah Dorsum */}
              <div className="p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-1.5">
                <label className="text-[11px] font-black text-navy/70 uppercase">Lidah (Dorsum & Papil)</label>
                <select
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/10"
                  value={data.intraOral?.tongue?.dorsum || 'Normal'}
                  onChange={(e) => {
                    onChange({
                      ...data,
                      intraOral: {
                        ...data.intraOral,
                        tongue: { ...data.intraOral.tongue, dorsum: e.target.value }
                      }
                    });
                  }}
                >
                  <option value="Normal">Normal</option>
                  <option value="Coated Tongue (Kotor/Putih)">Coated Tongue (Kotor/Putih)</option>
                  <option value="Fissured Tongue">Fissured Tongue</option>
                  <option value="Geographic Tongue">Geographic Tongue</option>
                  <option value="Atrofi Papil">Atrofi Papil</option>
                </select>
              </div>

              {/* Pergerakan Lidah / Frenulum Lingualis */}
              <div className="p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-1.5">
                <label className="text-[11px] font-black text-navy/70 uppercase">Pergerakan Lidah (Mobilitas)</label>
                <select
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/10"
                  value={data.intraOral?.tongue?.mobility || 'Normal (Bebas)'}
                  onChange={(e) => {
                    onChange({
                      ...data,
                      intraOral: {
                        ...data.intraOral,
                        tongue: { ...data.intraOral.tongue, mobility: e.target.value }
                      }
                    });
                  }}
                >
                  <option value="Normal (Bebas)">Normal (Bebas Bergerak)</option>
                  <option value="Terbatas (Ankyloglossia / Tongue Tie)">Terbatas (Ankyloglossia / Tongue Tie)</option>
                </select>
              </div>

              {/* Palatum Durum */}
              <div className="p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-1.5">
                <label className="text-[11px] font-black text-navy/70 uppercase">Palatum Durum (Keras)</label>
                <select
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/10"
                  value={data.intraOral?.palate?.durum || 'Normal'}
                  onChange={(e) => {
                    onChange({
                      ...data,
                      intraOral: {
                        ...data.intraOral,
                        palate: { ...data.intraOral.palate, durum: e.target.value }
                      }
                    });
                  }}
                >
                  <option value="Normal">Normal</option>
                  <option value="Torus Palatinus Kecil">Torus Palatinus Kecil</option>
                  <option value="Torus Palatinus Sedang">Torus Palatinus Sedang</option>
                  <option value="Torus Palatinus Besar">Torus Palatinus Besar</option>
                  <option value="Ulkus / Lesi">Ulkus / Lesi</option>
                </select>
              </div>

              {/* Palatum Molle & Faring */}
              <div className="p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-1.5">
                <label className="text-[11px] font-black text-navy/70 uppercase">Palatum Molle (Lunak)</label>
                <select
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/10"
                  value={data.intraOral?.palate?.molle || 'Normal'}
                  onChange={(e) => {
                    onChange({
                      ...data,
                      intraOral: {
                        ...data.intraOral,
                        palate: { ...data.intraOral.palate, molle: e.target.value }
                      }
                    });
                  }}
                >
                  <option value="Normal">Normal</option>
                  <option value="Kemerahan / Inflamasi">Kemerahan / Inflamasi</option>
                  <option value="Bifida">Bifida</option>
                </select>
              </div>

              {/* Tonsil & Uvula */}
              <div className="p-3.5 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-1.5">
                <label className="text-[11px] font-black text-navy/70 uppercase">Tonsil & Faring</label>
                <select
                  className="w-full px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/10"
                  value={data.intraOral?.pharynx?.tonsils || 'Normal (T0/T1)'}
                  onChange={(e) => {
                    onChange({
                      ...data,
                      intraOral: {
                        ...data.intraOral,
                        pharynx: { ...data.intraOral.pharynx, tonsils: e.target.value }
                      }
                    });
                  }}
                >
                  <option value="Normal (T0/T1)">Normal (T0/T1)</option>
                  <option value="Hipertrofi Membesar (T2)">Hipertrofi (T2)</option>
                  <option value="Hipertrofi Berat (T3/T4)">Hipertrofi Berat (T3/T4)</option>
                  <option value="Kemerahan / Eksudat">Kemerahan / Eksudat</option>
                </select>
              </div>
            </div>

            {/* Evaluasi Khusus Gingiva (Gusi) */}
            <div className="p-5 rounded-3xl bg-pink-soft/20 border border-pink/20 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-2">
                  <Smile size={16} className="text-pink" />
                  Pemeriksaan Kondisi Gingiva (Gusi)
                </h5>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-pink/20">
                  <input
                    type="checkbox"
                    checked={data.intraOral?.gingiva?.bop || false}
                    onChange={(e) => {
                      onChange({
                        ...data,
                        intraOral: {
                          ...data.intraOral,
                          gingiva: { ...data.intraOral.gingiva, bop: e.target.checked }
                        }
                      });
                    }}
                    className="rounded text-pink focus:ring-pink"
                  />
                  <span className="text-xs font-black text-pink">Pendarahan Saat Disentuh / Probing (BOP)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-navy/50 block mb-1">Warna Gingiva:</span>
                  <select
                    className="w-full px-3 py-2 bg-white rounded-xl font-bold border border-navy/10"
                    value={data.intraOral?.gingiva?.color || 'Coral Pink / Merah Muda (Normal)'}
                    onChange={(e) => {
                      onChange({
                        ...data,
                        intraOral: {
                          ...data.intraOral,
                          gingiva: { ...data.intraOral.gingiva, color: e.target.value }
                        }
                      });
                    }}
                  >
                    <option value="Coral Pink / Merah Muda (Normal)">Coral Pink / Merah Muda (Normal)</option>
                    <option value="Merah Menyala (Akut)">Merah Menyala (Inflamasi Akut)</option>
                    <option value="Merah Keunguan (Kronis)">Merah Keunguan (Kronis)</option>
                    <option value="Pucat">Pucat (Anemis)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-navy/50 block mb-1">Kontur / Bentuk Tepian:</span>
                  <select
                    className="w-full px-3 py-2 bg-white rounded-xl font-bold border border-navy/10"
                    value={data.intraOral?.gingiva?.contour || 'Scalloped / Runcing (Normal)'}
                    onChange={(e) => {
                      onChange({
                        ...data,
                        intraOral: {
                          ...data.intraOral,
                          gingiva: { ...data.intraOral.gingiva, contour: e.target.value }
                        }
                      });
                    }}
                  >
                    <option value="Scalloped / Runcing (Normal)">Scalloped / Runcing (Normal)</option>
                    <option value="Membulat / Membesar (Hyperplasia)">Membulat / Membesar (Hyperplasia)</option>
                    <option value="Resesi Gingiva (Penurunan Gusi)">Resesi Gingiva (Penurunan Gusi)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-navy/50 block mb-1">Konsistensi:</span>
                  <select
                    className="w-full px-3 py-2 bg-white rounded-xl font-bold border border-navy/10"
                    value={data.intraOral?.gingiva?.consistency || 'Kenyal / Firm (Normal)'}
                    onChange={(e) => {
                      onChange({
                        ...data,
                        intraOral: {
                          ...data.intraOral,
                          gingiva: { ...data.intraOral.gingiva, consistency: e.target.value }
                        }
                      });
                    }}
                  >
                    <option value="Kenyal / Firm (Normal)">Kenyal / Firm (Normal)</option>
                    <option value="Lunak / Flabby (Edema)">Lunak / Flabby (Edema)</option>
                    <option value="Fibrotik">Fibrotik (Keras Menetap)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Saliva & Kebersihan Rongga Mulut */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-navy-50/40 border border-navy/5 space-y-2">
                <label className="text-[11px] font-black text-navy/70 uppercase">Saliva (Kuantitas & Konsistensi)</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="px-3 py-1.5 bg-white rounded-xl text-xs font-bold border border-navy/10"
                    value={data.intraOral?.saliva?.quantity || 'Normal'}
                    onChange={(e) => {
                      onChange({
                        ...data,
                        intraOral: {
                          ...data.intraOral,
                          saliva: { ...data.intraOral.saliva, quantity: e.target.value }
                        }
                      });
                    }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Sedikit (Xerostomia)">Sedikit (Xerostomia)</option>
                    <option value="Banyak (Hipersalivasi)">Banyak (Hipersalivasi)</option>
                  </select>

                  <select
                    className="px-3 py-1.5 bg-white rounded-xl text-xs font-bold border border-navy/10"
                    value={data.intraOral?.saliva?.consistency || 'Encer (Serous)'}
                    onChange={(e) => {
                      onChange({
                        ...data,
                        intraOral: {
                          ...data.intraOral,
                          saliva: { ...data.intraOral.saliva, consistency: e.target.value }
                        }
                      });
                    }}
                  >
                    <option value="Encer (Serous)">Encer (Serous)</option>
                    <option value="Kental (Mucous)">Kental (Mucous)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-navy-50/40 border border-navy/5 space-y-2">
                <label className="text-[11px] font-black text-navy/70 uppercase">Status Kebersihan Rongga Mulut</label>
                <div className="flex gap-2">
                  {['Baik', 'Sedang', 'Buruk'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateIntraOral('oralHygieneOverall', status)}
                      className={cn(
                        "flex-1 py-1.5 rounded-xl text-xs font-black transition-all border text-center",
                        data.intraOral?.oralHygieneOverall === status 
                          ? status === 'Baik' ? "bg-green-600 text-white" : status === 'Sedang' ? "bg-amber-500 text-white" : "bg-red-600 text-white"
                          : "bg-white text-navy/50 border-navy/5"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checklist Anomali / Kelainan Bentuk Gigi */}
            <div className="space-y-2 pt-2 border-t border-navy/5">
              <label className="text-[11px] font-black text-navy/60 uppercase tracking-wider block">
                Kelainan Posisi / Anomali Bentuk Gigi
              </label>
              <div className="flex flex-wrap gap-2">
                {anomalyOptions.map((anom) => {
                  const selected = (data.intraOral?.anomalies || []).includes(anom);
                  return (
                    <button
                      key={anom}
                      type="button"
                      onClick={() => toggleAnomaly(anom)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                        selected
                          ? "bg-navy text-gold border-navy shadow-sm"
                          : "bg-navy-50 text-navy/60 border-navy/5 hover:border-pink hover:text-pink"
                      )}
                    >
                      {selected ? '✓ ' : '+ '} {anom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catatan Klinis Intra Oral Tambahan */}
            <div className="space-y-2 pt-2 border-t border-navy/5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-navy/60 uppercase tracking-wider">
                  Catatan Klinis Tambahan Intra Oral
                </label>
                <div className="flex items-center gap-1">
                  <VoiceInputButton 
                    currentValue={data.intraOral?.intraOralNotes || ''} 
                    onTranscript={(t) => updateIntraOral('intraOralNotes', t)}
                    size="sm"
                  />
                  <TextToSpeechButton text={data.intraOral?.intraOralNotes || ''} size="sm" />
                </div>
              </div>
              <textarea
                rows={2}
                className="w-full px-4 py-2.5 bg-navy-50/50 rounded-2xl text-xs font-bold border border-navy/10"
                placeholder="Catatan temuan khusus rongga mulut (misal: gigi karies dalam, sisa akar, kalkulus subgingiva regio anterior)..."
                value={data.intraOral?.intraOralNotes || ''}
                onChange={(e) => updateIntraOral('intraOralNotes', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. OFFICIAL LAMPIRAN SHEET VIEW (Format Siap Cetak Askesgilut) */}
      {/* ============================================================== */}
      {(viewMode === 'lampiran' || true) && (
        <div className={cn(
          "bg-white rounded-3xl border-2 border-navy/20 shadow-xl overflow-hidden print:border-none print:shadow-none print:p-0",
          viewMode === 'interactive' ? "hidden print:block" : "block"
        )}>
          {/* Header Kop Lampiran Resmi */}
          <div className="border-b-2 border-navy p-6 sm:p-8 bg-gradient-to-b from-navy-50/80 to-white text-navy print:p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-navy/20 pb-4">
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-navy/50">
                  PELAYANAN ASUHAN KESEHATAN GIGI DAN MULUT
                </p>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-navy">
                  KARTU ASUHAN KESEHATAN GIGI DAN MULUT (ASKESGILUT)
                </h2>
                <p className="text-xs font-bold text-pink mt-0.5">
                  Lampiran II: Formulir Pemeriksaan Klinis (Ekstra & Intra Oral) - Revisi 11-10-2022
                </p>
              </div>

              <div className="border-2 border-navy/20 bg-white p-3 rounded-2xl text-[11px] font-bold space-y-1 min-w-[200px]">
                <div className="flex justify-between">
                  <span className="text-navy/50">No. Rekam Medis:</span>
                  <span className="font-black text-navy">{patient?.rmNumber || 'RM-XXXX'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/50">Tgl Pemeriksaan:</span>
                  <span className="font-black text-navy">{visitDate}</span>
                </div>
              </div>
            </div>

            {/* Identitas Pasien Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-bold">
              <div className="bg-white p-2.5 rounded-xl border border-navy/10">
                <span className="text-[9px] uppercase tracking-wider text-navy/40 block">Nama Pasien</span>
                <span className="font-black text-navy text-sm">{patient?.name || '-'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-navy/10">
                <span className="text-[9px] uppercase tracking-wider text-navy/40 block">NIK</span>
                <span className="font-mono text-navy">{patient?.nik || '-'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-navy/10">
                <span className="text-[9px] uppercase tracking-wider text-navy/40 block">Usia / Gender</span>
                <span className="text-navy">{patient?.age || '-'} Thn / {patient?.gender || '-'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-navy/10">
                <span className="text-[9px] uppercase tracking-wider text-navy/40 block">Jaminan / Pembayaran</span>
                <span className="text-navy">{patient?.paymentMethod || 'Umum'}</span>
              </div>
            </div>
          </div>

          {/* Lampiran Clinical Table Sheet Content */}
          <div className="p-6 sm:p-8 space-y-6 text-navy print:p-4 text-xs">
            
            {/* Bagian A. Tanda-Tanda Vital */}
            <div className="border border-navy/30 rounded-2xl overflow-hidden">
              <div className="bg-navy-50 px-4 py-2.5 border-b border-navy/30 font-black text-xs uppercase tracking-wider flex items-center justify-between">
                <span>A. TANDA-TANDA VITAL & KEADAAN UMUM</span>
                <span className="text-[10px] text-navy/50 font-normal">Vital Signs</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-navy/10 font-semibold">
                <div className="p-3">
                  <span className="text-[10px] font-bold text-navy/50 block">Tekanan Darah:</span>
                  <span className="text-sm font-black">{data.vitalSigns?.bloodPressure || '-'} mmHg</span>
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-bold text-navy/50 block">Denyut Nadi:</span>
                  <span className="text-sm font-black">{data.vitalSigns?.pulse || '-'} x/menit ({data.vitalSigns?.pulseRhythm || 'Teratur'})</span>
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-bold text-navy/50 block">Pernapasan:</span>
                  <span className="text-sm font-black">{data.vitalSigns?.respiration || '-'} x/menit</span>
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-bold text-navy/50 block">Suhu Tubuh:</span>
                  <span className="text-sm font-black">{data.vitalSigns?.temperature || '-'} °C</span>
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-bold text-navy/50 block">Kesadaran:</span>
                  <span className="font-bold">{data.vitalSigns?.consciousness || 'Compos Mentis'}</span>
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-bold text-navy/50 block">Berat / Tinggi Badan:</span>
                  <span className="font-bold">{data.vitalSigns?.weight ? `${data.vitalSigns.weight} kg` : '-'} / {data.vitalSigns?.height ? `${data.vitalSigns.height} cm` : '-'}</span>
                </div>
                <div className="p-3 col-span-2">
                  <span className="text-[10px] font-bold text-navy/50 block">Status Fisik Umum:</span>
                  <span className="font-bold text-green-700">Dalam Batas Normal</span>
                </div>
              </div>
            </div>

            {/* Bagian B. Pemeriksaan Ekstra Oral */}
            <div className="border border-navy/30 rounded-2xl overflow-hidden">
              <div className="bg-navy-50 px-4 py-2.5 border-b border-navy/30 font-black text-xs uppercase tracking-wider flex items-center justify-between">
                <span>B. PEMERIKSAAN FISIK EKSTRA ORAL</span>
                <span className="text-[10px] text-navy/50 font-normal">Extra Oral Examination</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy-50/50 border-b border-navy/20 text-[10px] uppercase font-black text-navy/60">
                    <th className="px-4 py-2 w-12 text-center">No</th>
                    <th className="px-4 py-2 w-48">Bagian / Organ</th>
                    <th className="px-4 py-2 w-44">Kondisi Klinis</th>
                    <th className="px-4 py-2">Keterangan / Hasil Pemeriksaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/10 font-semibold">
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">1</td>
                    <td className="px-4 py-2.5 font-bold">Muka / Wajah</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("px-2 py-0.5 rounded font-black text-[11px]", data.extraOral?.faceSymmetry === 'Simetris' ? "bg-green-50 text-green-700" : "bg-pink-soft text-pink")}>
                        {data.extraOral?.faceSymmetry || 'Simetris'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      Profil Muka: <strong>{data.extraOral?.faceProfile || 'Lurus'}</strong>
                      {data.extraOral?.faceSymmetryNote ? ` (${data.extraOral.faceSymmetryNote})` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">2</td>
                    <td className="px-4 py-2.5 font-bold">Kulit Wajah & Leher</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("px-2 py-0.5 rounded font-black text-[11px]", data.extraOral?.skin === 'Normal' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                        {data.extraOral?.skin || 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {data.extraOral?.skin === 'Normal' ? 'Tidak ada lesi, eritema, edema, maupun fistula' : data.extraOral?.skin}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">3</td>
                    <td className="px-4 py-2.5 font-bold">Bibir (Vermilion Border)</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("px-2 py-0.5 rounded font-black text-[11px]", data.extraOral?.lips === 'Normal' ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
                        {data.extraOral?.lips || 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {data.extraOral?.lips === 'Normal' ? 'Bibir lembap, tidak ada pecah-pecah atau sariawan' : data.extraOral?.lips}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">4</td>
                    <td className="px-4 py-2.5 font-bold">Kelenjar Getah Bening</td>
                    <td className="px-4 py-2.5">
                      Submandibula Ka/Ki
                    </td>
                    <td className="px-4 py-2.5">
                      Kanan: <strong>{data.extraOral?.lymphNodes?.submandibularRight?.palpable ? 'Teraba (Abnormal)' : 'Tidak Teraba (Normal)'}</strong> | 
                      Kiri: <strong>{data.extraOral?.lymphNodes?.submandibularLeft?.palpable ? 'Teraba (Abnormal)' : 'Tidak Teraba (Normal)'}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">5</td>
                    <td className="px-4 py-2.5 font-bold">Kelenjar Saliva (Parotis)</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-black text-[11px]">
                        {data.extraOral?.salivaryGlands?.parotid || 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      Tidak ada pembengkakan atau nyeri tekan pada kelenjar parotis
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">6</td>
                    <td className="px-4 py-2.5 font-bold">Sendi Rahang (TMJ)</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("px-2 py-0.5 rounded font-black text-[11px]", !data.extraOral?.tmj?.clicking ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                        Clicking: {data.extraOral?.tmj?.clicking ? 'Ada' : 'Tidak Ada'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      Keterbatasan Buka Mulut (Trismus): <strong>{data.extraOral?.tmj?.trismus || 'Normal (≥ 3 jari)'}</strong> | 
                      Nyeri TMJ: <strong>{data.extraOral?.tmj?.pain ? 'Ada Nyeri' : 'Tidak Nyeri'}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bagian C. Pemeriksaan Intra Oral */}
            <div className="border border-navy/30 rounded-2xl overflow-hidden">
              <div className="bg-navy-50 px-4 py-2.5 border-b border-navy/30 font-black text-xs uppercase tracking-wider flex items-center justify-between">
                <span>C. PEMERIKSAAN FISIK INTRA ORAL (JARINGAN LUNAK & RONGGA MULUT)</span>
                <span className="text-[10px] text-navy/50 font-normal">Intra Oral Examination</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy-50/50 border-b border-navy/20 text-[10px] uppercase font-black text-navy/60">
                    <th className="px-4 py-2 w-12 text-center">No</th>
                    <th className="px-4 py-2 w-48">Bagian Rongga Mulut</th>
                    <th className="px-4 py-2 w-44">Status Klinis</th>
                    <th className="px-4 py-2">Keterangan / Deskripsi Temuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/10 font-semibold">
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">1</td>
                    <td className="px-4 py-2.5 font-bold">Mukosa Labial</td>
                    <td className="px-4 py-2.5 font-bold">{data.intraOral?.labialMucosa || 'Normal'}</td>
                    <td className="px-4 py-2.5 text-navy/70">Warna merah muda, licin, tidak ada ulserasi maupun benjolan</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">2</td>
                    <td className="px-4 py-2.5 font-bold">Mukosa Bukal (Pipi)</td>
                    <td className="px-4 py-2.5 font-bold">{data.intraOral?.buccalMucosa || 'Normal'}</td>
                    <td className="px-4 py-2.5 text-navy/70">Muara duktus stensen paten, tidak ada lesi putih atau kemerahan</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">3</td>
                    <td className="px-4 py-2.5 font-bold">Vestibulum</td>
                    <td className="px-4 py-2.5 font-bold">{data.intraOral?.vestibule || 'Normal / Dalam'}</td>
                    <td className="px-4 py-2.5 text-navy/70">Kedalaman forniks cukup, tidak ada fistula atau abses</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">4</td>
                    <td className="px-4 py-2.5 font-bold">Dasar Mulut (Floor)</td>
                    <td className="px-4 py-2.5 font-bold">{data.intraOral?.floorOfMouth || 'Normal'}</td>
                    <td className="px-4 py-2.5 text-navy/70">Kelenjar sublingual normal, tidak teraba torus mandibularis</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">5</td>
                    <td className="px-4 py-2.5 font-bold">Lidah (Tongue)</td>
                    <td className="px-4 py-2.5 font-bold">{data.intraOral?.tongue?.dorsum || 'Normal'}</td>
                    <td className="px-4 py-2.5 text-navy/70">
                      Mobilitas: <strong>{data.intraOral?.tongue?.mobility || 'Normal (Bebas)'}</strong> | Tidak ada deviasi
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">6</td>
                    <td className="px-4 py-2.5 font-bold">Palatum Durum & Molle</td>
                    <td className="px-4 py-2.5 font-bold">{data.intraOral?.palate?.durum || 'Normal'}</td>
                    <td className="px-4 py-2.5 text-navy/70">Rugae palatina normal, tidak ada torus palatinus besar</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">7</td>
                    <td className="px-4 py-2.5 font-bold">Tonsil, Uvula & Faring</td>
                    <td className="px-4 py-2.5 font-bold">{data.intraOral?.pharynx?.tonsils || 'Normal (T0/T1)'}</td>
                    <td className="px-4 py-2.5 text-navy/70">Uvula simetris di medial, dinding faring tidak hiperemis</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">8</td>
                    <td className="px-4 py-2.5 font-bold">Gingiva (Gusi)</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("px-2 py-0.5 rounded font-black text-[11px]", data.intraOral?.gingiva?.bop ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
                        BOP: {data.intraOral?.gingiva?.bop ? 'ADA' : 'TIDAK'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      Warna: <strong>{data.intraOral?.gingiva?.color || 'Coral Pink'}</strong> | 
                      Bentuk: <strong>{data.intraOral?.gingiva?.contour || 'Scalloped'}</strong> | 
                      Konsistensi: <strong>{data.intraOral?.gingiva?.consistency || 'Kenyal (Firm)'}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">9</td>
                    <td className="px-4 py-2.5 font-bold">Saliva & Oral Hygiene</td>
                    <td className="px-4 py-2.5 font-bold">Status: {data.intraOral?.oralHygieneOverall || 'Sedang'}</td>
                    <td className="px-4 py-2.5">
                      Saliva Kuantitas: <strong>{data.intraOral?.saliva?.quantity || 'Normal'}</strong> | 
                      Konsistensi: <strong>{data.intraOral?.saliva?.consistency || 'Encer'}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-center text-navy/40">10</td>
                    <td className="px-4 py-2.5 font-bold">Anomali / Posisi Gigi</td>
                    <td className="px-4 py-2.5" colSpan={2}>
                      {(data.intraOral?.anomalies || []).length > 0 ? (
                        <span>[✓] {data.intraOral.anomalies.join(', ')}</span>
                      ) : (
                        <span>[✓] Tidak ada kelainan bentuk atau posisi gigi</span>
                      )}
                    </td>
                  </tr>
                  {data.intraOral?.intraOralNotes && (
                    <tr>
                      <td className="px-4 py-2.5 text-center text-navy/40">11</td>
                      <td className="px-4 py-2.5 font-bold">Catatan Klinis Khusus</td>
                      <td className="px-4 py-2.5" colSpan={2}>
                        {data.intraOral.intraOralNotes}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Signature Footer for Lampiran */}
            <div className="pt-6 mt-6 border-t-2 border-dashed border-navy/20 flex flex-col sm:flex-row justify-between items-center text-xs">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <p className="text-[10px] text-navy/50 font-bold uppercase tracking-wider">Hasil Pemeriksaan Klinis:</p>
                <p className="font-semibold text-navy/80">Disahkan oleh Terapis Gigi dan Mulut penanggung jawab pelayanan.</p>
              </div>

              <div className="text-center min-w-[200px]">
                <p className="text-[11px] font-bold text-navy/60">Terapis Gigi dan Mulut (TGM)</p>
                <div className="h-16 my-1 flex items-center justify-center italic text-navy/30 text-xs">
                  ( Tanda Tangan Digital Pemeriksa )
                </div>
                <p className="font-black text-navy border-t border-navy/20 pt-1 uppercase">Pemeriksa Klinis</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
