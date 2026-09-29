import React, { useState } from 'react';
import { 
  Stethoscope, 
  Activity, 
  Smile, 
  AlertCircle, 
  FileText, 
  Printer, 
  CheckSquare, 
  Square, 
  Heart, 
  ShieldAlert, 
  Sparkles,
  Info,
  Clock,
  Mic,
  Volume2,
  Calendar,
  User,
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { AnamnesisData } from '../constants/lampiranTypes';
import { VoiceInputButton } from './VoiceInputButton';
import { TextToSpeechButton } from './TextToSpeechButton';
import { cn } from '../lib/utils';

interface AnamnesisLampiranSectionProps {
  data: AnamnesisData;
  onChange: (updated: AnamnesisData) => void;
  patient?: any;
  visitDate?: string;
  onOpenVoiceModal?: () => void;
}

export const AnamnesisLampiranSection: React.FC<AnamnesisLampiranSectionProps> = ({
  data,
  onChange,
  patient,
  visitDate = new Date().toISOString().split('T')[0],
  onOpenVoiceModal
}) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'lampiran'>('interactive');

  const updateChiefComplaint = (field: keyof AnamnesisData['chiefComplaint'], value: any) => {
    const updated = {
      ...data,
      chiefComplaint: {
        ...data.chiefComplaint,
        [field]: value
      }
    };
    if (field === 'mainReason') {
      updated.dentalHistory = {
        ...data.dentalHistory,
        reason: value
      };
    }
    onChange(updated);
  };

  const updateMedicalHistory = (field: keyof AnamnesisData['medicalHistory'], value: any) => {
    onChange({
      ...data,
      medicalHistory: {
        ...data.medicalHistory,
        [field]: value
      }
    });
  };

  const updateSystemic = (disease: keyof AnamnesisData['medicalHistory']['systemicDiseases'], val: boolean) => {
    onChange({
      ...data,
      medicalHistory: {
        ...data.medicalHistory,
        systemicDiseases: {
          ...data.medicalHistory.systemicDiseases,
          [disease]: val
        }
      }
    });
  };

  const updateDentalHistory = (field: keyof AnamnesisData['dentalHistory'], value: any) => {
    const updated = {
      ...data,
      dentalHistory: {
        ...data.dentalHistory,
        [field]: value
      }
    };
    if (field === 'reason') {
      updated.chiefComplaint = {
        ...data.chiefComplaint,
        mainReason: value
      };
    }
    onChange(updated);
  };

  const updateMaintenance = (field: keyof AnamnesisData['maintenance'], value: any) => {
    onChange({
      ...data,
      maintenance: {
        ...data.maintenance,
        [field]: value
      }
    });
  };

  const toggleArrayItem = (list: string[], item: string): string[] => {
    if (list.includes(item)) {
      return list.filter(x => x !== item);
    }
    return [...list, item];
  };

  const handlePrintLampiran = () => {
    window.print();
  };

  const painCharacteristicOptions = [
    'Berdenyut (Throbbing)',
    'Ngilu Tajam (Sharp)',
    'Linu Rangsangan Dingin/Panas',
    'Linu Rangsangan Manis/Asam',
    'Sakit Saat Mengunyah/Menggigit',
    'Spontan Tanpa Rangsangan',
    'Terus-menerus (Menetap)',
    'Hilang Timbul (Intermiten)',
  ];

  const oralSymptomsOptions = [
    'Gusi Mudah Berdarah Saat Menyikat',
    'Gigi Goyang / Longgar',
    'Bau Mulut (Halitosis)',
    'Gigi Linu / Hipersensitif',
    'Sakit Saat Mengunyah',
    'Makanan Sering Terselip di Sela Gigi',
    'Sariawan Berulang (Stomatitis)',
    'Gusi Bengkak / Bernanah (Abses)',
  ];

  const previousTreatmentsOptions = [
    'Pencabutan Gigi (Ekstraksi)',
    'Penambalan Gigi (Restorasi)',
    'Pembersihan Karang Gigi (Scaling)',
    'Perawatan Saluran Akar / Syaraf Gigi',
    'Pembuatan Gigi Tiruan (Gigi Palsu)',
    'Perawatan Kawat Gigi (Ortodontik)',
  ];

  const hygieneToolsOptions = [
    'Sikat Gigi Manual',
    'Sikat Gigi Elektrik',
    'Dental Floss (Benang Gigi)',
    'Sikat Interdental',
    'Obat Kumur (Mouthwash)',
    'Pembersih Lidah (Tongue Scraper)',
    'Tusuk Gigi (Toothpick)',
  ];

  const badHabitsOptions = [
    'Merokok',
    'Mengunyah Sirih / Tembakau',
    'Bruxisme (Mengerot Gigi Saat Tidur)',
    'Clenching (Mengepalkan Rahang Saat Cemas)',
    'Menggigit Kuku / Bibir / Pipi',
    'Menggigit Benda Keras (Pulpen, Jarum)',
    'Menghisap Ibu Jari (Thumb Sucking)',
    'Bernapas Lewat Mulut (Mouth Breathing)',
    'Menjulurkan Lidah (Tongue Thrusting)',
    'Tidak Ada Kebiasaan Buruk',
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar Switcher between Interactive Mode & Lampiran Sheet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-navy via-navy-light to-navy p-5 rounded-3xl text-white shadow-lg no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Stethoscope className="text-gold" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                Format Resmi
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight">I. Pengkajian Anamnesis (Askesgilut)</h3>
            </div>
            <p className="text-xs text-white/70 mt-0.5">Sesuai Lampiran Kartu Asuhan Kesehatan Gigi dan Mulut</p>
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
            onClick={handlePrintLampiran}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white text-white hover:text-navy rounded-xl text-xs font-black transition-all uppercase tracking-wider border border-white/20"
            title="Cetak Format Lampiran Ini"
          >
            <Printer size={14} />
            <span className="hidden md:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. INTERACTIVE EDITING MODE                                     */}
      {/* ============================================================== */}
      {viewMode === 'interactive' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Sub A: Keluhan Utama & Perjalanan Penyakit */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-navy/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-navy/5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-pink-soft text-pink flex items-center justify-center font-black text-sm">A</span>
                <div>
                  <h4 className="text-sm font-black text-navy uppercase tracking-wider">Keluhan Utama & Keluhan Tambahan</h4>
                  <p className="text-[11px] text-navy/40 font-bold">Alasan kedatangan, rasa sakit, lokasi & perjalanan keluhan</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Keluhan Utama */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-navy/70 uppercase tracking-wider flex items-center gap-1.5">
                    Keluhan Utama (Chief Complaint) *
                  </label>
                  <div className="flex items-center gap-1">
                    <VoiceInputButton 
                      currentValue={data.chiefComplaint?.mainReason || data.dentalHistory?.reason || ''} 
                      onTranscript={(t) => updateChiefComplaint('mainReason', t)}
                      size="sm"
                    />
                    <TextToSpeechButton text={data.chiefComplaint?.mainReason || data.dentalHistory?.reason || ''} size="sm" />
                  </div>
                </div>
                <textarea
                  rows={2}
                  className="w-full px-4 py-3 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink rounded-2xl text-xs font-bold transition-all"
                  placeholder="Contoh: Sakit gigi geraham kanan bawah berdenyut sejak 3 hari lalu..."
                  value={data.chiefComplaint?.mainReason || data.dentalHistory?.reason || ''}
                  onChange={(e) => updateChiefComplaint('mainReason', e.target.value)}
                />
              </div>

              {/* Keluhan Tambahan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-navy/70 uppercase tracking-wider flex items-center gap-1.5">
                    Keluhan Tambahan
                  </label>
                  <div className="flex items-center gap-1">
                    <VoiceInputButton 
                      currentValue={data.chiefComplaint?.additionalComplaint || ''} 
                      onTranscript={(t) => updateChiefComplaint('additionalComplaint', t)}
                      size="sm"
                    />
                    <TextToSpeechButton text={data.chiefComplaint?.additionalComplaint || ''} size="sm" />
                  </div>
                </div>
                <textarea
                  rows={2}
                  className="w-full px-4 py-3 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink rounded-2xl text-xs font-bold transition-all"
                  placeholder="Contoh: Gusi sering berdarah saat sikat gigi, bau mulut..."
                  value={data.chiefComplaint?.additionalComplaint || ''}
                  onChange={(e) => updateChiefComplaint('additionalComplaint', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-navy/50 uppercase tracking-wider">Lokasi / Regio Sakit</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink rounded-xl text-xs font-bold"
                  placeholder="Contoh: Rahang bawah kanan, gigi 46..."
                  value={data.chiefComplaint?.painLocation || ''}
                  onChange={(e) => updateChiefComplaint('painLocation', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-navy/50 uppercase tracking-wider">Durasi / Sejak Kapan</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink rounded-xl text-xs font-bold"
                  placeholder="Contoh: 3 hari lalu, 1 minggu, kadang-kadang..."
                  value={data.chiefComplaint?.painDuration || ''}
                  onChange={(e) => updateChiefComplaint('painDuration', e.target.value)}
                />
              </div>
            </div>

            {/* Sifat Rasa Sakit */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-black text-navy/60 uppercase tracking-wider block">
                Sifat Rasa Sakit (Karakteristik Nyeri)
              </label>
              <div className="flex flex-wrap gap-2">
                {painCharacteristicOptions.map((item) => {
                  const selected = (data.chiefComplaint?.painCharacteristics || []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        const current = data.chiefComplaint?.painCharacteristics || [];
                        updateChiefComplaint('painCharacteristics', toggleArrayItem(current, item));
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                        selected
                          ? "bg-navy text-gold border-navy shadow-sm"
                          : "bg-navy-50 text-navy/60 border-navy/5 hover:border-pink hover:text-pink"
                      )}
                    >
                      {selected ? '✓ ' : '+ '} {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gejala Rongga Mulut */}
            <div className="space-y-2 pt-2 border-t border-navy/5">
              <label className="text-[11px] font-black text-navy/60 uppercase tracking-wider block">
                Gejala Lain yang Sering Dirasakan Pasien
              </label>
              <div className="flex flex-wrap gap-2">
                {oralSymptomsOptions.map((symptom) => {
                  const selected = (data.dentalHistory?.symptoms || []).includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => {
                        const current = data.dentalHistory?.symptoms || [];
                        updateDentalHistory('symptoms', toggleArrayItem(current, symptom));
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                        selected
                          ? "bg-pink text-white border-pink shadow-sm"
                          : "bg-navy-50 text-navy/60 border-navy/5 hover:border-pink hover:text-pink"
                      )}
                    >
                      {selected ? '✓ ' : '+ '} {symptom}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sub B: Riwayat Kesehatan Umum */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-navy/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-navy/5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-pink-soft text-pink flex items-center justify-center font-black text-sm">B</span>
                <div>
                  <h4 className="text-sm font-black text-navy uppercase tracking-wider">Riwayat Kesehatan Umum (Medical History)</h4>
                  <p className="text-[11px] text-navy/40 font-bold">Pemeriksaan kondisi sistemik, riwayat alergi, dan kehamilan</p>
                </div>
              </div>
            </div>

            {/* Keadaan Sehat & Perawatan Dokter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-navy-50/50 border border-navy/5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-navy uppercase">Keadaan Kesehatan Saat Ini</p>
                  <p className="text-[10px] text-navy/40 font-bold">Apakah pasien merasa sehat saat ini?</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-navy/5">
                  <button
                    type="button"
                    onClick={() => updateMedicalHistory('isHealthy', true)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black transition-all",
                      data.medicalHistory?.isHealthy ? "bg-navy text-gold shadow-sm" : "text-navy/40 hover:text-navy"
                    )}
                  >
                    SEHAT
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMedicalHistory('isHealthy', false)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black transition-all",
                      !data.medicalHistory?.isHealthy ? "bg-pink text-white shadow-sm" : "text-navy/40 hover:text-navy"
                    )}
                  >
                    ADA KELUHAN
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-navy-50/50 border border-navy/5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-navy uppercase">Perawatan Dokter / Obat Rutin</p>
                  <p className="text-[10px] text-navy/40 font-bold">Sedang dirawat / minum obat rutin?</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-navy/5">
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...data,
                        medicalHistory: {
                          ...data.medicalHistory,
                          underDoctorCare: {
                            ...data.medicalHistory.underDoctorCare,
                            had: false
                          }
                        }
                      });
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black transition-all",
                      !data.medicalHistory?.underDoctorCare?.had ? "bg-navy text-gold shadow-sm" : "text-navy/40 hover:text-navy"
                    )}
                  >
                    TIDAK
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...data,
                        medicalHistory: {
                          ...data.medicalHistory,
                          underDoctorCare: {
                            ...data.medicalHistory.underDoctorCare,
                            had: true
                          }
                        }
                      });
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black transition-all",
                      data.medicalHistory?.underDoctorCare?.had ? "bg-pink text-white shadow-sm" : "text-navy/40 hover:text-navy"
                    )}
                  >
                    YA
                  </button>
                </div>
              </div>
            </div>

            {/* If under doctor care, input details */}
            {data.medicalHistory?.underDoctorCare?.had && (
              <div className="p-4 bg-pink-soft/30 rounded-2xl border border-pink/20 space-y-2">
                <label className="text-[11px] font-black text-pink uppercase tracking-wider">
                  Rincian Penyakit & Nama Obat yang Dikonsumsi
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 bg-white rounded-xl text-xs font-bold border border-pink/20"
                    placeholder="Contoh: Amlodipine 5mg untuk darah tinggi, Metformin..."
                    value={data.medicalHistory?.underDoctorCare?.details || ''}
                    onChange={(e) => {
                      onChange({
                        ...data,
                        medicalHistory: {
                          ...data.medicalHistory,
                          underDoctorCare: {
                            ...data.medicalHistory.underDoctorCare,
                            details: e.target.value
                          }
                        }
                      });
                    }}
                  />
                  <VoiceInputButton 
                    currentValue={data.medicalHistory?.underDoctorCare?.details || ''} 
                    onTranscript={(t) => {
                      onChange({
                        ...data,
                        medicalHistory: {
                          ...data.medicalHistory,
                          underDoctorCare: {
                            ...data.medicalHistory.underDoctorCare,
                            details: t
                          }
                        }
                      });
                    }}
                    size="sm"
                  />
                </div>
              </div>
            )}

            {/* Checklist Penyakit Sistemik Sesuai Format Lampiran Resmi */}
            <div className="space-y-3">
              <label className="text-xs font-black text-navy/70 uppercase tracking-wider flex items-center gap-2">
                <Heart size={14} className="text-pink" />
                Penyakit Sistemik (Checklist Standar Askesgilut)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { key: 'heart', label: 'Penyakit Jantung' },
                  { key: 'hypertension', label: 'Hipertensi (Darah Tinggi)' },
                  { key: 'diabetes', label: 'Diabetes Melitus' },
                  { key: 'hepatitis', label: 'Hepatitis / Sakit Kuning' },
                  { key: 'asthma', label: 'Asma / Paru-paru' },
                  { key: 'kidney', label: 'Gangguan Ginjal' },
                  { key: 'bloodClotting', label: 'Pembekuan Darah Lama' },
                  { key: 'gastritis', label: 'Maag / Gangguan Lambung' },
                ].map(({ key, label }) => {
                  const hasDisease = !!(data.medicalHistory?.systemicDiseases as any)?.[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateSystemic(key as any, !hasDisease)}
                      className={cn(
                        "p-3 rounded-2xl text-left border transition-all flex items-start gap-2.5",
                        hasDisease 
                          ? "bg-red-50 border-red-200 text-red-700 shadow-sm" 
                          : "bg-navy-50/50 border-navy/5 text-navy/70 hover:border-pink/40"
                      )}
                    >
                      <div className="mt-0.5">
                        {hasDisease ? (
                          <CheckSquare size={16} className="text-red-600" />
                        ) : (
                          <Square size={16} className="text-navy/20" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="text-[10px] font-black text-navy/40 uppercase tracking-wider">Penyakit Sistemik Lainnya / Catatan Tambahan</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 bg-navy-50/50 rounded-xl text-xs font-bold border border-navy/5"
                    placeholder="Contoh: Riwayat TBC, tiroid, epilepsi, pasca operasi, dll..."
                    value={data.medicalHistory?.systemicDiseases?.others || data.medicalHistory?.seriousIllness || ''}
                    onChange={(e) => {
                      onChange({
                        ...data,
                        medicalHistory: {
                          ...data.medicalHistory,
                          seriousIllness: e.target.value,
                          systemicDiseases: {
                            ...data.medicalHistory.systemicDiseases,
                            others: e.target.value
                          }
                        }
                      });
                    }}
                  />
                  <VoiceInputButton 
                    currentValue={data.medicalHistory?.systemicDiseases?.others || data.medicalHistory?.seriousIllness || ''} 
                    onTranscript={(t) => {
                      onChange({
                        ...data,
                        medicalHistory: {
                          ...data.medicalHistory,
                          seriousIllness: t,
                          systemicDiseases: {
                            ...data.medicalHistory.systemicDiseases,
                            others: t
                          }
                        }
                      });
                    }}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Riwayat Alergi */}
            <div className="space-y-3 pt-2 border-t border-navy/5">
              <label className="text-xs font-black text-navy/70 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert size={14} className="text-pink" />
                Riwayat Alergi (Checklist & Keterangan)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'drugs', label: 'Alergi Obat (Antibiotik/Analgetik)' },
                  { key: 'food', label: 'Alergi Makanan (Seafood/Telur)' },
                  { key: 'anesthesia', label: 'Alergi Zat Anestesi Lokal' },
                  { key: 'weather', label: 'Alergi Cuaca / Debu / Lainnya' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1.5 p-3 rounded-2xl bg-navy-50/40 border border-navy/5">
                    <span className="text-[10px] font-black text-navy/50 uppercase tracking-tight">{label}</span>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white rounded-lg text-xs font-bold border border-navy/10"
                      placeholder="Sebutkan jika ada..."
                      value={(data.medicalHistory?.allergies as any)?.[key] || ''}
                      onChange={(e) => {
                        onChange({
                          ...data,
                          medicalHistory: {
                            ...data.medicalHistory,
                            allergies: {
                              ...data.medicalHistory.allergies,
                              [key]: e.target.value
                            }
                          }
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Khusus Pasien Wanita: Kehamilan & Menyusui */}
            <div className="p-4 rounded-2xl bg-navy-50/30 border border-navy/5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black text-navy uppercase">Khusus Pasien Wanita</p>
                <p className="text-[10px] text-navy/40 font-bold">Informasi kehamilan & masa menyusui</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-navy/5">
                  <input
                    type="checkbox"
                    checked={data.medicalHistory?.pregnancy?.isPregnant || false}
                    onChange={(e) => {
                      onChange({
                        ...data,
                        medicalHistory: {
                          ...data.medicalHistory,
                          pregnancy: {
                            ...data.medicalHistory.pregnancy,
                            isPregnant: e.target.checked
                          }
                        }
                      });
                    }}
                    className="rounded text-pink focus:ring-pink"
                  />
                  <span className="text-xs font-bold text-navy">Sedang Hamil</span>
                </label>

                {data.medicalHistory?.pregnancy?.isPregnant && (
                  <select
                    className="px-3 py-2 bg-white rounded-xl text-xs font-bold border border-navy/5"
                    value={data.medicalHistory?.pregnancy?.trimester || 'Trimester I'}
                    onChange={(e) => {
                      onChange({
                        ...data,
                        medicalHistory: {
                          ...data.medicalHistory,
                          pregnancy: {
                            ...data.medicalHistory.pregnancy,
                            trimester: e.target.value
                          }
                        }
                      });
                    }}
                  >
                    <option value="Trimester I">Trimester I</option>
                    <option value="Trimester II">Trimester II</option>
                    <option value="Trimester III">Trimester III</option>
                  </select>
                )}

                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-navy/5">
                  <input
                    type="checkbox"
                    checked={data.medicalHistory?.pregnancy?.isBreastfeeding || false}
                    onChange={(e) => {
                      onChange({
                        ...data,
                        medicalHistory: {
                          ...data.medicalHistory,
                          pregnancy: {
                            ...data.medicalHistory.pregnancy,
                            isBreastfeeding: e.target.checked
                          }
                        }
                      });
                    }}
                    className="rounded text-pink focus:ring-pink"
                  />
                  <span className="text-xs font-bold text-navy">Sedang Menyusui</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sub C: Riwayat Kesehatan Gigi */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-navy/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-navy/5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-pink-soft text-pink flex items-center justify-center font-black text-sm">C</span>
                <div>
                  <h4 className="text-sm font-black text-navy uppercase tracking-wider">Riwayat Kesehatan Gigi & Pengalaman Perawatan</h4>
                  <p className="text-[11px] text-navy/40 font-bold">Kunjungan sebelumnya, tindakan terdahulu, dan komplikasi perawatan</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-navy-50/50 border border-navy/5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-navy uppercase">Pernah Dirawat Gigi Sebelumnya?</p>
                  <p className="text-[10px] text-navy/40 font-bold">Riwayat kunjungan klinik / terapis gigi</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-navy/5">
                  <button
                    type="button"
                    onClick={() => updateDentalHistory('hadPreviousTreatment', true)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black transition-all",
                      data.dentalHistory?.hadPreviousTreatment ? "bg-navy text-gold shadow-sm" : "text-navy/40 hover:text-navy"
                    )}
                  >
                    PERNAH
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDentalHistory('hadPreviousTreatment', false)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black transition-all",
                      !data.dentalHistory?.hadPreviousTreatment ? "bg-navy text-gold shadow-sm" : "text-navy/40 hover:text-navy"
                    )}
                  >
                    BELUM
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-navy/50 uppercase tracking-wider">Terakhir Kali Periksa Gigi</label>
                <select
                  className="w-full px-4 py-2.5 bg-navy-50/50 rounded-xl text-xs font-bold border border-navy/5"
                  value={data.dentalHistory?.lastVisit || ''}
                  onChange={(e) => updateDentalHistory('lastVisit', e.target.value)}
                >
                  <option value="">-- Pilih Jangka Waktu --</option>
                  <option value="Kurang dari 6 bulan lalu">&lt; 6 Bulan yang lalu</option>
                  <option value="6 sampai 12 bulan lalu">6 - 12 Bulan yang lalu</option>
                  <option value="Lebih dari 1 tahun lalu">&gt; 1 Tahun yang lalu</option>
                  <option value="Belum pernah periksa">Belum pernah periksa sebelumnya</option>
                </select>
              </div>
            </div>

            {/* Perawatan Gigi yang Pernah Dijalani */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-navy/60 uppercase tracking-wider block">
                Perawatan Gigi yang Pernah Diterima Sebelumnya
              </label>
              <div className="flex flex-wrap gap-2">
                {previousTreatmentsOptions.map((item) => {
                  const selected = (data.dentalHistory?.previousTreatments || []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        const current = data.dentalHistory?.previousTreatments || [];
                        updateDentalHistory('previousTreatments', toggleArrayItem(current, item));
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                        selected
                          ? "bg-navy text-gold border-navy shadow-sm"
                          : "bg-navy-50 text-navy/60 border-navy/5 hover:border-pink hover:text-pink"
                      )}
                    >
                      {selected ? '✓ ' : '+ '} {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Riwayat Komplikasi Lalu */}
            <div className="p-4 rounded-2xl bg-navy-50/30 border border-navy/5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-navy/70 uppercase tracking-wider">
                  Riwayat Komplikasi / Masalah Saat/Setelah Perawatan Gigi Lalu
                </label>
                <div className="flex bg-white p-0.5 rounded-lg border border-navy/5">
                  <button
                    type="button"
                    onClick={() => {
                      updateDentalHistory('previousComplications', { had: false, details: '' });
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded text-[10px] font-black transition-all",
                      !data.dentalHistory?.previousComplications?.had ? "bg-navy text-gold" : "text-navy/40"
                    )}
                  >
                    TIDAK ADA
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateDentalHistory('previousComplications', { ...data.dentalHistory?.previousComplications, had: true });
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded text-[10px] font-black transition-all",
                      data.dentalHistory?.previousComplications?.had ? "bg-red-500 text-white" : "text-navy/40"
                    )}
                  >
                    ADA
                  </button>
                </div>
              </div>

              {data.dentalHistory?.previousComplications?.had && (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 bg-white rounded-xl text-xs font-bold border border-red-200"
                    placeholder="Contoh: Pingsan saat anestesi, pendarahan lama setelah cabut gigi, syok..."
                    value={data.dentalHistory?.previousComplications?.details || ''}
                    onChange={(e) => updateDentalHistory('previousComplications', { had: true, details: e.target.value })}
                  />
                  <VoiceInputButton 
                    currentValue={data.dentalHistory?.previousComplications?.details || ''} 
                    onTranscript={(t) => updateDentalHistory('previousComplications', { had: true, details: t })}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sub D: Perilaku & Pemeliharaan Kesehatan Gigi Mulut */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-navy/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-navy/5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-pink-soft text-pink flex items-center justify-center font-black text-sm">D</span>
                <div>
                  <h4 className="text-sm font-black text-navy uppercase tracking-wider">Perilaku Pemeliharaan Kesehatan Gigi & Mulut</h4>
                  <p className="text-[11px] text-navy/40 font-bold">Kebiasaan menyikat gigi, alat bantu, pola makan, dan bad oral habits</p>
                </div>
              </div>
            </div>

            {/* 1. Menyikat Gigi: Frekuensi, Waktu, Cara, Jenis Bulu */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-2">
                <label className="text-[11px] font-black text-navy/60 uppercase tracking-wider block">Frekuensi Menyikat Gigi</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="w-20 px-3 py-2 bg-white border border-navy/10 rounded-xl text-sm font-black text-center"
                    value={data.maintenance?.brushingFrequency?.day || 2}
                    onChange={(e) => {
                      const dayVal = parseInt(e.target.value) || 0;
                      updateMaintenance('brushingFrequency', { day: dayVal, week: dayVal * 7 });
                    }}
                  />
                  <span className="text-xs font-bold text-navy/60">kali / hari</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-2">
                <label className="text-[11px] font-black text-navy/60 uppercase tracking-wider block">Teknik / Gerakan Menyikat</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-navy/10 rounded-xl text-xs font-bold"
                  value={data.maintenance?.brushingTechnique || 'Kombinasi / Memutar'}
                  onChange={(e) => updateMaintenance('brushingTechnique', e.target.value)}
                >
                  <option value="Kombinasi / Memutar (Roll / Bass)">Kombinasi / Memutar (Roll/Bass)</option>
                  <option value="Vertikal (Merah ke Putih)">Vertikal (Merah ke Putih)</option>
                  <option value="Horizontal (Maju Mundur)">Horizontal (Maju Mundur)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-navy-50/50 border border-navy/5 space-y-2">
                <label className="text-[11px] font-black text-navy/60 uppercase tracking-wider block">Jenis Bulu Sikat Gigi</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-navy/10 rounded-xl text-xs font-bold"
                  value={data.maintenance?.toothbrushType || 'Bulu Lembut (Soft)'}
                  onChange={(e) => updateMaintenance('toothbrushType', e.target.value)}
                >
                  <option value="Bulu Lembut (Soft)">Bulu Halus / Lembut (Soft)</option>
                  <option value="Bulu Sedang (Medium)">Bulu Sedang (Medium)</option>
                  <option value="Bulu Keras (Hard)">Bulu Keras (Hard)</option>
                </select>
              </div>
            </div>

            {/* Waktu Menyikat Gigi */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-navy/60 uppercase tracking-wider block">
                Waktu Menyikat Gigi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  'Pagi saat mandi',
                  'Setelah sarapan / makan pagi',
                  'Sore saat mandi',
                  'Malam sebelum tidur',
                ].map((time) => {
                  const selected = (data.maintenance?.brushingTimes || []).includes(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        const current = data.maintenance?.brushingTimes || [];
                        updateMaintenance('brushingTimes', toggleArrayItem(current, time));
                      }}
                      className={cn(
                        "p-2.5 rounded-xl text-xs font-bold text-left border transition-all flex items-center gap-2",
                        selected
                          ? "bg-navy text-gold border-navy shadow-sm"
                          : "bg-navy-50 text-navy/60 border-navy/5 hover:border-pink hover:text-pink"
                      )}
                    >
                      {selected ? <CheckCircle2 size={14} className="text-gold" /> : <Square size={14} className="opacity-30" />}
                      <span className="text-[11px]">{time}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alat Bantu Pembersih Gigi */}
            <div className="space-y-2 pt-2 border-t border-navy/5">
              <label className="text-[11px] font-black text-navy/60 uppercase tracking-wider block">
                Alat Bantu Pembersih Gigi & Rongga Mulut yang Digunakan
              </label>
              <div className="flex flex-wrap gap-2">
                {hygieneToolsOptions.map((tool) => {
                  const selected = (data.maintenance?.tools || []).includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => {
                        const current = data.maintenance?.tools || [];
                        updateMaintenance('tools', toggleArrayItem(current, tool));
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                        selected
                          ? "bg-pink text-white border-pink shadow-sm"
                          : "bg-navy-50 text-navy/60 border-navy/5 hover:border-pink hover:text-pink"
                      )}
                    >
                      {selected ? '✓ ' : '+ '} {tool}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pola Mengunyah & Diet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-navy/5">
              <div className="p-4 rounded-2xl bg-navy-50/40 border border-navy/5 space-y-2">
                <label className="text-[11px] font-black text-navy/70 uppercase tracking-wider block">Kebiasaan Mengunyah</label>
                <div className="flex gap-2">
                  {['Dua sisi seimbang', 'Kanan saja', 'Kiri saja'].map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => updateMaintenance('chewingSide', side)}
                      className={cn(
                        "flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center",
                        data.maintenance?.chewingSide === side
                          ? "bg-navy text-gold border-navy shadow-sm"
                          : "bg-white text-navy/50 border-navy/5 hover:border-pink"
                      )}
                    >
                      {side}
                    </button>
                  ))}
                </div>
                {data.maintenance?.chewingSide !== 'Dua sisi seimbang' && (
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 bg-white rounded-lg text-xs font-bold border border-navy/10 mt-2"
                    placeholder="Alasan hanya 1 sisi (misal: gigi berlubang di sisi kanan, gigi hilang)..."
                    value={data.maintenance?.chewingReason || ''}
                    onChange={(e) => updateMaintenance('chewingReason', e.target.value)}
                  />
                )}
              </div>

              <div className="p-4 rounded-2xl bg-navy-50/40 border border-navy/5 space-y-3">
                <label className="text-[11px] font-black text-navy/70 uppercase tracking-wider block">Kebiasaan Konsumsi Makanan / Minuman</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-navy/50">Makanan Manis & Melekat:</span>
                    <select
                      className="w-full mt-1 px-2.5 py-1.5 bg-white rounded-lg text-xs font-bold border border-navy/10"
                      value={data.maintenance?.diet?.sweetSnacks || 'Kadang-kadang'}
                      onChange={(e) => {
                        onChange({
                          ...data,
                          maintenance: {
                            ...data.maintenance,
                            diet: {
                              ...data.maintenance.diet,
                              sweetSnacks: e.target.value
                            }
                          }
                        });
                      }}
                    >
                      <option value="Sering (Tiap Hari)">Sering (Tiap Hari)</option>
                      <option value="Kadang-kadang">Kadang-kadang</option>
                      <option value="Jarang">Jarang</option>
                      <option value="Tidak Pernah">Tidak Pernah</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-navy/50">Buah & Sayur Berserat:</span>
                    <select
                      className="w-full mt-1 px-2.5 py-1.5 bg-white rounded-lg text-xs font-bold border border-navy/10"
                      value={data.maintenance?.diet?.fibrousFruits || 'Kadang-kadang'}
                      onChange={(e) => {
                        onChange({
                          ...data,
                          maintenance: {
                            ...data.maintenance,
                            diet: {
                              ...data.maintenance.diet,
                              fibrousFruits: e.target.value
                            }
                          }
                        });
                      }}
                    >
                      <option value="Sering (Tiap Hari)">Sering (Tiap Hari)</option>
                      <option value="Kadang-kadang">Kadang-kadang</option>
                      <option value="Jarang">Jarang</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Kebiasaan Buruk Terkait Kesehatan Gigi */}
            <div className="space-y-2 pt-2 border-t border-navy/5">
              <label className="text-[11px] font-black text-navy/60 uppercase tracking-wider block">
                Kebiasaan Buruk (Bad Oral Habits)
              </label>
              <div className="flex flex-wrap gap-2">
                {badHabitsOptions.map((habit) => {
                  const selected = (data.maintenance?.badHabits || []).includes(habit);
                  return (
                    <button
                      key={habit}
                      type="button"
                      onClick={() => {
                        const current = data.maintenance?.badHabits || [];
                        if (habit === 'Tidak Ada Kebiasaan Buruk') {
                          updateMaintenance('badHabits', ['Tidak Ada Kebiasaan Buruk']);
                        } else {
                          const filtered = current.filter(h => h !== 'Tidak Ada Kebiasaan Buruk');
                          updateMaintenance('badHabits', toggleArrayItem(filtered, habit));
                        }
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                        selected
                          ? "bg-navy text-gold border-navy shadow-sm"
                          : "bg-navy-50 text-navy/60 border-navy/5 hover:border-pink hover:text-pink"
                      )}
                    >
                      {selected ? '✓ ' : '+ '} {habit}
                    </button>
                  );
                })}
              </div>

              {(data.maintenance?.badHabits || []).includes('Merokok') && (
                <div className="flex items-center gap-2 pt-2 max-w-xs">
                  <span className="text-[10px] font-bold text-navy/60">Jumlah Konsumsi Rokok:</span>
                  <input
                    type="text"
                    className="w-24 px-3 py-1.5 bg-navy-50 border rounded-lg text-xs font-bold text-center"
                    placeholder="... batang"
                    value={data.maintenance?.smokingCount || ''}
                    onChange={(e) => updateMaintenance('smokingCount', e.target.value)}
                  />
                  <span className="text-[10px] font-bold text-navy/40">/ hari</span>
                </div>
              )}
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
                  Lampiran I: Formulir Pengkajian / Anamnesis Pasien (Revisi 11-10-2022)
                </p>
              </div>

              <div className="border-2 border-navy/20 bg-white p-3 rounded-2xl text-[11px] font-bold space-y-1 min-w-[200px]">
                <div className="flex justify-between">
                  <span className="text-navy/50">No. Rekam Medis:</span>
                  <span className="font-black text-navy">{patient?.rmNumber || 'RM-XXXX'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy/50">Tgl Kunjungan:</span>
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
                <span className="text-[9px] uppercase tracking-wider text-navy/40 block">NIK / No. Identitas</span>
                <span className="font-mono text-navy">{patient?.nik || '-'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-navy/10">
                <span className="text-[9px] uppercase tracking-wider text-navy/40 block">Usia / Jenis Kelamin</span>
                <span className="text-navy">{patient?.age || '-'} Tahun / {patient?.gender || '-'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-navy/10">
                <span className="text-[9px] uppercase tracking-wider text-navy/40 block">Metode Pembayaran</span>
                <span className="text-navy">{patient?.paymentMethod || 'Umum'}</span>
              </div>
            </div>
          </div>

          {/* Lampiran Table Sheet Content */}
          <div className="p-6 sm:p-8 space-y-6 text-navy print:p-4 text-xs">
            
            {/* Bagian A. Keluhan Utama & Riwayat Perjalanan Penyakit */}
            <div className="border border-navy/30 rounded-2xl overflow-hidden">
              <div className="bg-navy-50 px-4 py-2.5 border-b border-navy/30 font-black text-xs uppercase tracking-wider flex items-center justify-between">
                <span>A. KELUHAN UTAMA & KELUHAN TAMBAHAN</span>
                <span className="text-[10px] text-navy/50 font-normal">Chief Complaint</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-navy/10">
                    <td className="w-48 px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      1. Keluhan Utama
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {data.chiefComplaint?.mainReason || data.dentalHistory?.reason || <span className="italic text-navy/30">Tidak ada keluhan utama</span>}
                    </td>
                  </tr>
                  <tr className="border-b border-navy/10">
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      2. Keluhan Tambahan
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {data.chiefComplaint?.additionalComplaint || <span className="italic text-navy/30">Tidak ada keluhan tambahan</span>}
                    </td>
                  </tr>
                  <tr className="border-b border-navy/10">
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      3. Lokasi & Durasi Keluhan
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Regio: <strong>{data.chiefComplaint?.painLocation || '-'}</strong> | Durasi/Sejak: <strong>{data.chiefComplaint?.painDuration || '-'}</strong>
                    </td>
                  </tr>
                  <tr className="border-b border-navy/10">
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      4. Sifat Rasa Sakit
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {(data.chiefComplaint?.painCharacteristics || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {data.chiefComplaint.painCharacteristics.map((pc, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-navy-50 border border-navy/10 text-[11px] font-bold">
                              [✓] {pc}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-navy/30">- Tidak ada catatan sifat sakit -</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      5. Gejala Rongga Mulut
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {(data.dentalHistory?.symptoms || []).length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {data.dentalHistory.symptoms.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-pink-soft text-pink border border-pink/20 text-[11px] font-bold">
                              [✓] {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-navy/30">- Tidak ada keluhan gejala khusus -</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bagian B. Riwayat Kesehatan Umum */}
            <div className="border border-navy/30 rounded-2xl overflow-hidden">
              <div className="bg-navy-50 px-4 py-2.5 border-b border-navy/30 font-black text-xs uppercase tracking-wider flex items-center justify-between">
                <span>B. RIWAYAT KESEHATAN UMUM (MEDICAL HISTORY)</span>
                <span className="text-[10px] text-navy/50 font-normal">Systemic & General Health</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-navy/10">
                    <td className="w-48 px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      1. Keadaan Kesehatan
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Pasien menyatakan dalam keadaan: <strong>{data.medicalHistory?.isHealthy ? 'SEHAT' : 'ADA KELUHAN'}</strong>
                      {data.medicalHistory?.healthComplaint && ` (${data.medicalHistory.healthComplaint})`}
                    </td>
                  </tr>
                  <tr className="border-b border-navy/10">
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      2. Perawatan Dokter & Obat
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {data.medicalHistory?.underDoctorCare?.had ? (
                        <span className="text-red-600 font-bold">
                          [✓] Sedang dalam perawatan dokter / minum obat: {data.medicalHistory.underDoctorCare.details || 'Ada rincian obat'}
                        </span>
                      ) : (
                        <span>[✓] Tidak sedang dalam perawatan dokter atau konsumsi obat rutin</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-navy/10">
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      3. Checklist Penyakit Sistemik
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { key: 'heart', label: 'Penyakit Jantung' },
                          { key: 'hypertension', label: 'Hipertensi' },
                          { key: 'diabetes', label: 'Diabetes Melitus' },
                          { key: 'hepatitis', label: 'Hepatitis' },
                          { key: 'asthma', label: 'Asma / Paru-paru' },
                          { key: 'kidney', label: 'Gangguan Ginjal' },
                          { key: 'bloodClotting', label: 'Kelainan Darah' },
                          { key: 'gastritis', label: 'Maag / Lambung' },
                        ].map(({ key, label }) => {
                          const val = (data.medicalHistory?.systemicDiseases as any)?.[key];
                          return (
                            <span key={key} className={cn("text-[11px] font-bold", val ? "text-red-600" : "text-navy/60")}>
                              [{val ? '✓' : '-'}] {label}
                            </span>
                          );
                        })}
                      </div>
                      {(data.medicalHistory?.systemicDiseases?.others || data.medicalHistory?.seriousIllness) && (
                        <p className="mt-2 text-[11px] text-navy/70 border-t border-navy/5 pt-1">
                          Catatan penyakit lain: <strong>{data.medicalHistory?.systemicDiseases?.others || data.medicalHistory?.seriousIllness}</strong>
                        </p>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-navy/10">
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      4. Riwayat Alergi
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div>Obat: <strong>{data.medicalHistory?.allergies?.drugs || 'Tidak Ada'}</strong></div>
                        <div>Makanan: <strong>{data.medicalHistory?.allergies?.food || 'Tidak Ada'}</strong></div>
                        <div>Anestesi: <strong>{data.medicalHistory?.allergies?.anesthesia || 'Tidak Ada'}</strong></div>
                        <div>Cuaca/Lain: <strong>{data.medicalHistory?.allergies?.weather || 'Tidak Ada'}</strong></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      5. Khusus Wanita
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Hamil: <strong>{data.medicalHistory?.pregnancy?.isPregnant ? `YA (${data.medicalHistory.pregnancy.trimester || 'Trimester I'})` : 'TIDAK'}</strong> | 
                      Menyusui: <strong>{data.medicalHistory?.pregnancy?.isBreastfeeding ? 'YA' : 'TIDAK'}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bagian C. Riwayat Kesehatan Gigi */}
            <div className="border border-navy/30 rounded-2xl overflow-hidden">
              <div className="bg-navy-50 px-4 py-2.5 border-b border-navy/30 font-black text-xs uppercase tracking-wider flex items-center justify-between">
                <span>C. RIWAYAT KESEHATAN GIGI (DENTAL HISTORY)</span>
                <span className="text-[10px] text-navy/50 font-normal">Past Dental Treatments</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-navy/10">
                    <td className="w-48 px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      1. Pengalaman Periksa Gigi
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Pernah dirawat gigi: <strong>{data.dentalHistory?.hadPreviousTreatment ? 'PERNAH' : 'BELUM PERNAH'}</strong> | 
                      Terakhir kali periksa: <strong>{data.dentalHistory?.lastVisit || 'Belum pernah'}</strong>
                    </td>
                  </tr>
                  <tr className="border-b border-navy/10">
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      2. Tindakan yang Pernah Dilakukan
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {(data.dentalHistory?.previousTreatments || []).length > 0 ? (
                        <span>[✓] {data.dentalHistory.previousTreatments.join(', ')}</span>
                      ) : (
                        <span className="italic text-navy/30">- Belum ada riwayat tindakan gigi -</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      3. Riwayat Komplikasi Gigi
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {data.dentalHistory?.previousComplications?.had ? (
                        <span className="text-red-600 font-bold">
                          [✓] Ada riwayat komplikasi: {data.dentalHistory.previousComplications.details}
                        </span>
                      ) : (
                        <span>[✓] Tidak ada riwayat komplikasi saat atau setelah perawatan gigi terdahulu</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bagian D. Perilaku Pemeliharaan Kesehatan Gigi */}
            <div className="border border-navy/30 rounded-2xl overflow-hidden">
              <div className="bg-navy-50 px-4 py-2.5 border-b border-navy/30 font-black text-xs uppercase tracking-wider flex items-center justify-between">
                <span>D. RIWAYAT PERILAKU PEMELIHARAAN KESEHATAN GIGI & MULUT</span>
                <span className="text-[10px] text-navy/50 font-normal">Oral Health Behaviors</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-navy/10">
                    <td className="w-48 px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      1. Menyikat Gigi
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      <div>Frekuensi: <strong>{data.maintenance?.brushingFrequency?.day || 2} kali sehari</strong></div>
                      <div className="mt-1">
                        Waktu menyikat: <strong>{(data.maintenance?.brushingTimes || []).join(', ') || 'Pagi & malam'}</strong>
                      </div>
                      <div className="mt-1">
                        Teknik menyikat: <strong>{data.maintenance?.brushingTechnique || 'Kombinasi / memutar'}</strong> | 
                        Bulu sikat: <strong>{data.maintenance?.toothbrushType || 'Bulu Halus'}</strong>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-navy/10">
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      2. Alat Bantu & Pasta Gigi
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Alat bantu pembersih: <strong>{(data.maintenance?.tools || []).join(', ') || 'Sikat Gigi Manual'}</strong>
                    </td>
                  </tr>
                  <tr className="border-b border-navy/10">
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      3. Pola Mengunyah & Diet
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Mengunyah: <strong>{data.maintenance?.chewingSide || 'Dua sisi seimbang'}</strong> 
                      {data.maintenance?.chewingReason ? ` (${data.maintenance.chewingReason})` : ''} | 
                      Makanan manis: <strong>{data.maintenance?.diet?.sweetSnacks || 'Kadang-kadang'}</strong> | 
                      Buah berserat: <strong>{data.maintenance?.diet?.fibrousFruits || 'Kadang-kadang'}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 bg-navy-50/30 font-bold text-navy/70 border-r border-navy/10">
                      4. Kebiasaan Buruk (Bad Habits)
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {(data.maintenance?.badHabits || []).length > 0 ? (
                        <span>
                          [✓] {data.maintenance.badHabits.join(', ')}
                          {data.maintenance.badHabits.includes('Merokok') && data.maintenance.smokingCount && ` (${data.maintenance.smokingCount} btg/hari)`}
                        </span>
                      ) : (
                        <span>[✓] Tidak ada kebiasaan buruk</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Signature Footer for Lampiran */}
            <div className="pt-6 mt-6 border-t-2 border-dashed border-navy/20 flex flex-col sm:flex-row justify-between items-center text-xs">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <p className="text-[10px] text-navy/50 font-bold uppercase tracking-wider">Catatan Petugas Pengkaji:</p>
                <p className="font-semibold text-navy/80">Data anamnesis telah diverifikasi bersama pasien/keluarga.</p>
              </div>

              <div className="text-center min-w-[200px]">
                <p className="text-[11px] font-bold text-navy/60">Terapis Gigi dan Mulut (TGM)</p>
                <div className="h-16 my-1 flex items-center justify-center italic text-navy/30 text-xs">
                  ( Tanda Tangan Digital Tersimpan )
                </div>
                <p className="font-black text-navy border-t border-navy/20 pt-1 uppercase">Pemeriksa Askesgilut</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
