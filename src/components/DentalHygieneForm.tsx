import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Activity, 
  ClipboardCheck, 
  FileText, 
  Smile, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Save,
  Plus,
  Sparkles,
  PenTool,
  RotateCcw,
  RefreshCw,
  Receipt,
  FileCheck,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Odontogram } from './Odontogram';
import { DENTAL_HYGIENE_DIAGNOSES } from '../constants/diagnoses';
import SignaturePad from 'signature_pad';
import { GoogleGenAI } from "@google/genai";

const STEPS = [
  { id: 'anamnesis', label: 'Anamnesis', icon: Stethoscope },
  { id: 'clinical', label: 'Pemeriksaan Klinis', icon: Activity },
  { id: 'odontogram', label: 'Odontogram', icon: Smile },
  { id: 'indices', label: 'Indeks Kesehatan', icon: ClipboardCheck },
  { id: 'diagnosis', label: 'Diagnosis DH', icon: AlertCircle },
  { id: 'consent', label: 'Informed Consent', icon: FileCheck },
  { id: 'soapie', label: 'SOAPIE & TTD', icon: PenTool },
  { id: 'billing', label: 'Billing', icon: Receipt },
];

export const DentalHygieneForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const sigPad = useRef<SignaturePad | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const [formData, setFormData] = useState({
    anamnesis: {
      keluhanUtama: '',
      riwayatPenyakitSekarang: '',
      riwayatPenyakitDahulu: '',
      riwayatAlergi: '',
      riwayatObat: '',
    },
    clinical: {
      ekstraOral: { limfe: '', tmj: '', wajah: '' },
      intraOral: { gingiva: '', mukosa: '', lidah: '', plak: '', kalkulus: '' },
    },
    indices: {
      dmft: { d: 0, m: 0, f: 0, total: 0 },
      ohis: { di: 0, ci: 0, total: 0 },
    },
    diagnosis: [] as string[],
    diagnosisDetails: {} as Record<string, { causes: string[], signs: string[] }>,
    consent: {
      agreed: false,
      witnessName: '',
      procedure: '',
    },
    soapie: {
      subjective: '',
      objective: '',
      assessment: '',
      planning: '',
      intervention: '',
      evaluation: '',
    },
    signature: '',
    billing: {
      items: [] as { name: string, price: number }[],
      total: 0,
    }
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleDiagnosisToggle = (id: string) => {
    const diag = DENTAL_HYGIENE_DIAGNOSES.find(d => d.id === id);
    if (!diag) return;

    setFormData(prev => {
      const isSelected = prev.diagnosis.includes(id);
      const newDiagnosis = isSelected 
        ? prev.diagnosis.filter(d => d !== id)
        : [...prev.diagnosis, id];
      
      const newDetails = { ...prev.diagnosisDetails };
      if (!isSelected) {
        newDetails[id] = { causes: [diag.causes[0]], signs: [diag.signs[0]] };
      } else {
        delete newDetails[id];
      }

      return { ...prev, diagnosis: newDiagnosis, diagnosisDetails: newDetails };
    });
  };

  const generateAIIntervention = async () => {
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const selectedDiags = formData.diagnosis.map(id => DENTAL_HYGIENE_DIAGNOSES.find(d => d.id === id)?.title).join(', ');
      
      const prompt = `Sebagai Terapis Gigi dan Mulut (TGM), buatkan rencana intervensi dental hygiene yang komprehensif untuk pasien dengan diagnosis: ${selectedDiags}. Berikan dalam poin-poin singkat dan praktis.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setFormData(prev => ({
        ...prev,
        soapie: { ...prev.soapie, intervention: response.text || '' }
      }));
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    if (canvasRef.current && currentStep === 6) {
      sigPad.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgba(0,0,0,0)',
        penColor: '#0f172a'
      });

      const handleResize = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d")?.scale(ratio, ratio);
          sigPad.current?.clear();
        }
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
        window.removeEventListener("resize", handleResize);
        sigPad.current?.off();
        sigPad.current = null;
      };
    }
  }, [currentStep]);

  const clearSignature = () => {
    sigPad.current?.clear();
    setFormData(prev => ({ ...prev, signature: '' }));
  };

  const saveSignature = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      setFormData(prev => ({ ...prev, signature: sigPad.current!.toDataURL('image/png') }));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekam Dental Hygiene</h1>
          <p className="text-gray-500">Input asuhan kesehatan gigi dan mulut individu.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-navy/5 rounded-xl text-sm font-bold text-navy/60 hover:bg-navy-50 transition-all">
            Simpan Draft
          </button>
          <button className="px-4 py-2 bg-navy rounded-xl text-sm font-bold text-pink hover:bg-navy-light shadow-lg shadow-navy/20 transition-all flex items-center gap-2 uppercase tracking-widest">
            <Save size={18} />
            Finalisasi Rekam
          </button>
        </div>
      </header>

      {/* Stepper */}
      <div className="mb-8 bg-white p-4 rounded-2xl border border-navy/5 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[800px]">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div 
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "flex flex-col items-center gap-2 cursor-pointer transition-all duration-300",
                  currentStep === i ? "scale-110" : "opacity-50 hover:opacity-100"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  currentStep === i ? "bg-pink text-white" : "bg-navy-50 text-navy/40"
                )}>
                  <step.icon size={20} />
                </div>
                <span className={cn("text-[10px] font-black uppercase tracking-widest", currentStep === i ? "text-pink" : "text-navy/30")}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-navy/5 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="glass-card rounded-3xl min-h-[500px] flex flex-col overflow-hidden">
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-navy border-l-4 border-pink pl-4 uppercase tracking-wider">Anamnesis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-navy/60 uppercase tracking-widest">Keluhan Utama</label>
                      <textarea 
                        className="w-full p-4 bg-navy-50 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm min-h-[100px] transition-all font-medium"
                        placeholder="Apa yang dirasakan pasien?"
                        value={formData.anamnesis.keluhanUtama}
                        onChange={e => setFormData({...formData, anamnesis: {...formData.anamnesis, keluhanUtama: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Riwayat Penyakit Sekarang</label>
                      <textarea 
                        className="w-full p-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-2xl text-sm min-h-[100px] transition-all"
                        placeholder="Detail keluhan saat ini..."
                        value={formData.anamnesis.riwayatPenyakitSekarang}
                        onChange={e => setFormData({...formData, anamnesis: {...formData.anamnesis, riwayatPenyakitSekarang: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Riwayat Penyakit Dahulu</label>
                      <input 
                        type="text"
                        className="w-full p-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-2xl text-sm transition-all"
                        placeholder="Diabetes, Hipertensi, dll"
                        value={formData.anamnesis.riwayatPenyakitDahulu}
                        onChange={e => setFormData({...formData, anamnesis: {...formData.anamnesis, riwayatPenyakitDahulu: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Riwayat Alergi</label>
                      <input 
                        type="text"
                        className="w-full p-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-2xl text-sm transition-all"
                        placeholder="Alergi obat atau makanan"
                        value={formData.anamnesis.riwayatAlergi}
                        onChange={e => setFormData({...formData, anamnesis: {...formData.anamnesis, riwayatAlergi: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Pemeriksaan Klinis</h3>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest">Ekstra Oral</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['Kelenjar Limfe', 'TMJ', 'Wajah'].map(field => (
                        <div key={field} className="space-y-2">
                          <label className="text-xs font-bold text-gray-500">{field}</label>
                          <input type="text" className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl text-sm transition-all" placeholder="Normal/Abnormal" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest">Intra Oral</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['Gingiva', 'Mukosa', 'Lidah', 'Plak', 'Kalkulus'].map(field => (
                        <div key={field} className="space-y-2">
                          <label className="text-xs font-bold text-gray-500">{field}</label>
                          <input type="text" className="w-full p-3 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-xl text-sm transition-all" placeholder="Keterangan..." />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Odontogram Interaktif</h3>
                  <Odontogram />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Indeks Kesehatan Gigi</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Activity size={20} /> DMF-T Index
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Decay (D)', key: 'd' },
                          { label: 'Missing (M)', key: 'm' },
                          { label: 'Filling (F)', key: 'f' },
                        ].map(item => (
                          <div key={item.key} className="space-y-2">
                            <label className="text-xs font-bold text-blue-700">{item.label}</label>
                            <input 
                              type="number" 
                              className="w-full p-3 bg-white border-transparent focus:border-blue-500 focus:ring-0 rounded-xl text-sm font-bold text-blue-900"
                              value={formData.indices.dmft[item.key as keyof typeof formData.indices.dmft]}
                              onChange={e => setFormData({
                                ...formData, 
                                indices: {
                                  ...formData.indices, 
                                  dmft: {...formData.indices.dmft, [item.key]: parseInt(e.target.value) || 0}
                                }
                              })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                      <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                        <ClipboardCheck size={20} /> OHI-S Index
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Debris Index (DI)', key: 'di' },
                          { label: 'Calculus Index (CI)', key: 'ci' },
                        ].map(item => (
                          <div key={item.key} className="space-y-2">
                            <label className="text-xs font-bold text-green-700">{item.label}</label>
                            <input 
                              type="number" 
                              step="0.1"
                              className="w-full p-3 bg-white border-transparent focus:border-green-500 focus:ring-0 rounded-xl text-sm font-bold text-green-900"
                              value={formData.indices.ohis[item.key as keyof typeof formData.indices.ohis]}
                              onChange={e => setFormData({
                                ...formData, 
                                indices: {
                                  ...formData.indices, 
                                  ohis: {...formData.indices.ohis, [item.key]: parseFloat(e.target.value) || 0}
                                }
                              })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Diagnosis & Analisis AI</h3>
                  <p className="text-sm text-gray-500 mb-4 italic">Verifikasi diagnosis, sebab, dan tanda gejala:</p>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {DENTAL_HYGIENE_DIAGNOSES.map((diag) => (
                      <div 
                        key={diag.id}
                        className={cn(
                          "p-6 rounded-3xl border-2 transition-all cursor-pointer group",
                          formData.diagnosis.includes(diag.id)
                            ? "bg-blue-50 border-blue-500 shadow-lg shadow-blue-50"
                            : "bg-white border-gray-100 hover:border-blue-200"
                        )}
                        onClick={() => handleDiagnosisToggle(diag.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-1",
                            formData.diagnosis.includes(diag.id) ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200"
                          )}>
                            {formData.diagnosis.includes(diag.id) && <Plus size={14} className="rotate-45" />}
                          </div>
                          <div className="flex-1">
                            <h4 className={cn("font-bold text-lg transition-colors", formData.diagnosis.includes(diag.id) ? "text-blue-900" : "text-gray-700")}>
                              {diag.title}
                            </h4>
                            
                            {formData.diagnosis.includes(diag.id) && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-6 space-y-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-blue-700 uppercase">Sebab (Etiologi)</label>
                                    <div className="space-y-2">
                                      {diag.causes.map((cause, idx) => (
                                        <label key={idx} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-all cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            className="rounded text-blue-600"
                                            checked={formData.diagnosisDetails[diag.id]?.causes.includes(cause)}
                                            onChange={() => {
                                              const current = formData.diagnosisDetails[diag.id]?.causes || [];
                                              const next = current.includes(cause) ? current.filter(c => c !== cause) : [...current, cause];
                                              setFormData({
                                                ...formData,
                                                diagnosisDetails: { ...formData.diagnosisDetails, [diag.id]: { ...formData.diagnosisDetails[diag.id], causes: next } }
                                              });
                                            }}
                                          />
                                          <span className="text-xs text-gray-600">{cause}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-blue-700 uppercase">Tanda & Gejala</label>
                                    <div className="space-y-2">
                                      {diag.signs.map((sign, idx) => (
                                        <label key={idx} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-all cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            className="rounded text-blue-600"
                                            checked={formData.diagnosisDetails[diag.id]?.signs.includes(sign)}
                                            onChange={() => {
                                              const current = formData.diagnosisDetails[diag.id]?.signs || [];
                                              const next = current.includes(sign) ? current.filter(s => s !== sign) : [...current, sign];
                                              setFormData({
                                                ...formData,
                                                diagnosisDetails: { ...formData.diagnosisDetails, [diag.id]: { ...formData.diagnosisDetails[diag.id], signs: next } }
                                              });
                                            }}
                                          />
                                          <span className="text-xs text-gray-600">{sign}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-navy-50/50 p-8 rounded-[2rem] border border-navy/5">
                    <h3 className="text-xl font-black text-navy uppercase tracking-tight mb-6 flex items-center gap-3">
                      <FileCheck className="text-pink" /> Persetujuan Tindakan Medis (Informed Consent)
                    </h3>
                    <div className="prose prose-sm max-w-none text-navy/70 mb-8 bg-white p-8 rounded-3xl border border-navy/5 shadow-sm">
                      <p className="font-black text-navy uppercase tracking-[0.2em] text-[10px] mb-6 border-b border-navy/5 pb-4">Pernyataan Pasien / Penanggung Jawab:</p>
                      <div className="space-y-4 font-medium leading-relaxed">
                        <p>Saya yang bertanda tangan di bawah ini, menyatakan telah menerima penjelasan lengkap mengenai:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Diagnosis dan tata cara tindakan medis yang akan dilakukan.</li>
                          <li>Tujuan tindakan medis yang dilakukan.</li>
                          <li>Risiko dan komplikasi yang mungkin terjadi.</li>
                          <li>Prognosis terhadap tindakan yang dilakukan.</li>
                        </ul>
                        <p className="mt-6">Dengan ini saya memberikan **PERSETUJUAN** untuk dilakukan tindakan asuhan kesehatan gigi dan mulut oleh Terapis Gigi dan Mulut (TGM) yang bertugas.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Nama Saksi / Keluarga</label>
                        <input 
                          type="text" 
                          className="w-full px-8 py-5 bg-white border-2 border-transparent focus:border-pink focus:ring-0 rounded-2xl text-sm transition-all font-bold shadow-sm"
                          placeholder="Masukkan nama saksi..."
                          value={formData.consent.witnessName}
                          onChange={e => setFormData(prev => ({ ...prev, consent: { ...prev.consent, witnessName: e.target.value } }))}
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, consent: { ...prev.consent, agreed: !prev.consent.agreed } }))}
                          className={cn(
                            "flex items-center justify-center gap-4 px-10 py-5 rounded-2xl font-black transition-all uppercase tracking-[0.2em] text-xs shadow-xl",
                            formData.consent.agreed 
                              ? "bg-navy text-pink shadow-navy/20" 
                              : "bg-white text-navy/20 border-2 border-navy/5 hover:border-pink hover:text-pink"
                          )}
                        >
                          <CheckCircle2 size={20} />
                          {formData.consent.agreed ? 'Persetujuan Diberikan' : 'Klik Untuk Menyetujui'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-l-4 border-pink pl-4">
                    <h3 className="text-xl font-black text-navy uppercase tracking-wider">SOAPIE & Tanda Tangan</h3>
                    <button 
                      onClick={generateAIIntervention}
                      disabled={isGeneratingAI || formData.diagnosis.length === 0}
                      className="flex items-center gap-2 px-6 py-3 bg-navy text-pink rounded-xl text-xs font-black hover:bg-navy-light disabled:opacity-50 transition-all shadow-xl shadow-navy/10 uppercase tracking-widest"
                    >
                      {isGeneratingAI ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                      AI Generate Intervensi TGM
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {['Subjective', 'Objective', 'Assessment', 'Planning', 'Intervention', 'Evaluation'].map((field) => (
                        <div key={field} className="space-y-2">
                          <label className="text-xs font-black text-navy/60 uppercase tracking-widest">{field}</label>
                          <textarea 
                            className="w-full p-4 bg-navy-50 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm min-h-[80px] transition-all font-medium"
                            placeholder={`Input ${field.toLowerCase()}...`}
                            value={formData.soapie[field.toLowerCase() as keyof typeof formData.soapie]}
                            onChange={e => setFormData({...formData, soapie: {...formData.soapie, [field.toLowerCase()]: e.target.value}})}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-pink-soft">
                        <div className="flex items-center justify-between mb-6">
                          <label className="text-xs font-black text-navy uppercase tracking-widest flex items-center gap-2">
                            <PenTool size={18} className="text-pink" /> Tanda Tangan TGM / Pasien
                          </label>
                          <button 
                            onClick={clearSignature}
                            className="p-2 text-navy/30 hover:text-pink hover:bg-pink-soft rounded-xl transition-all"
                          >
                            <RotateCcw size={18} />
                          </button>
                        </div>
                        <div className="bg-navy-50 rounded-2xl overflow-hidden border border-navy/5 shadow-inner">
                          <canvas 
                            ref={canvasRef}
                            className="w-full h-48 cursor-crosshair"
                            onMouseUp={saveSignature}
                            onTouchEnd={saveSignature}
                          />
                        </div>
                        <p className="text-[10px] text-navy/30 mt-4 text-center font-bold uppercase tracking-widest">Gunakan mouse atau layar sentuh</p>
                      </div>

                      <div className="bg-pink-soft/30 p-6 rounded-3xl border border-pink-soft">
                        <h4 className="font-black text-navy text-xs uppercase tracking-widest mb-4">Ringkasan Diagnosis</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.diagnosis.map(id => (
                            <span key={id} className="text-[10px] font-black bg-white text-pink px-3 py-1.5 rounded-full border border-pink-soft shadow-sm uppercase tracking-wider">
                              {DENTAL_HYGIENE_DIAGNOSES.find(d => d.id === id)?.title}
                            </span>
                          ))}
                          {formData.diagnosis.length === 0 && <p className="text-xs text-navy/30 font-bold italic">Belum ada diagnosis dipilih</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 7 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-navy-50/50 p-8 rounded-[2rem] border border-navy/5">
                    <h3 className="text-xl font-black text-navy uppercase tracking-tight mb-6 flex items-center gap-3">
                      <Receipt className="text-pink" /> Billing & Rincian Biaya
                    </h3>
                    <div className="bg-white rounded-3xl border border-navy/5 overflow-hidden shadow-xl shadow-navy/5">
                      <table className="w-full text-left">
                        <thead className="bg-navy text-pink text-[10px] uppercase tracking-[0.2em] font-black">
                          <tr>
                            <th className="px-8 py-6">Deskripsi Layanan</th>
                            <th className="px-8 py-6 text-right">Biaya (IDR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy/5">
                          {[
                            { name: 'Pemeriksaan Rutin & Konsultasi', price: 50000 },
                            { name: 'Scaling & Root Planing (Full Mouth)', price: 250000 },
                            { name: 'Topikal Aplikasi Fluor', price: 150000 },
                          ].map((item, i) => (
                            <tr key={i} className="hover:bg-navy-50/50 transition-colors">
                              <td className="px-8 py-6 text-sm font-bold text-navy uppercase tracking-tight">{item.name}</td>
                              <td className="px-8 py-6 text-sm font-black text-navy text-right tabular-nums">Rp {item.price.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-pink text-white">
                          <tr>
                            <td className="px-8 py-6 font-black uppercase tracking-[0.2em] text-xs">Total Tagihan Akhir</td>
                            <td className="px-8 py-6 text-right font-black text-2xl tracking-tighter tabular-nums">Rp 450.000</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="mt-10 flex flex-col md:flex-row justify-end gap-4">
                      <button className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-navy border-2 border-navy/5 hover:border-pink hover:text-pink rounded-2xl font-black transition-all shadow-sm uppercase tracking-widest text-xs">
                        <Printer size={20} /> Cetak Invoice
                      </button>
                      <button className="flex items-center justify-center gap-3 px-10 py-4 bg-navy text-pink rounded-2xl font-black hover:bg-navy-light shadow-2xl shadow-navy/20 transition-all uppercase tracking-widest text-xs">
                        Selesaikan & Simpan Transaksi
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-navy-50 border-t border-navy/5 flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-navy/40 hover:text-navy disabled:opacity-30 transition-all uppercase tracking-widest text-xs"
          >
            <ChevronLeft size={20} />
            Sebelumnya
          </button>
          
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentStep === i ? "w-8 bg-pink" : "bg-navy/10"
                )}
              />
            ))}
          </div>

          <button 
            onClick={nextStep}
            disabled={currentStep === STEPS.length - 1}
            className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-navy/5 rounded-xl font-black text-navy hover:border-pink hover:text-pink disabled:opacity-30 transition-all uppercase tracking-widest text-xs"
          >
            Selanjutnya
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
