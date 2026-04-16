import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
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
  Printer,
  X,
  Users,
  Calendar
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Odontogram } from './Odontogram';
import SignaturePad from 'signature_pad';
import { GoogleGenAI } from "@google/genai";
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ASKESGILUT_DIAGNOSES } from '../constants/askesgilut';

const STEPS = [
  { id: 'anamnesis', label: 'Anamnesis', icon: Stethoscope },
  { id: 'clinical', label: 'Pemeriksaan Klinis', icon: Activity },
  { id: 'odontogram', label: 'Odontogram', icon: Smile },
  { id: 'indices', label: 'Indeks Kesehatan Gigi', icon: ClipboardCheck },
  { id: 'consent', label: 'Informed Consent', icon: FileCheck },
  { id: 'askesgilut', label: 'Askesgilut & TTD', icon: PenTool },
  { id: 'billing', label: 'Billing', icon: Receipt },
];

export const DentalHygieneForm = () => {
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const [currentStep, setCurrentStep] = useState(0);
  const sigPad = useRef<SignaturePad | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const patientCanvasRef = useRef<HTMLCanvasElement>(null);
  const patientSigPad = useRef<SignaturePad | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [newBillingItem, setNewBillingItem] = useState({ name: '', price: '' });
  
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    patientId: '',
    visitNumber: 1,
    visitDate: new Date().toISOString().split('T')[0],
    anamnesis: {
      medicalHistory: {
        isHealthy: true,
        seriousIllness: '',
        bloodClotting: '',
        allergies: {
          food: '',
          drugs: '',
          anesthesia: '',
          weather: '',
        },
        others: '',
      },
      socialHistory: '',
      dentalHistory: {
        reason: '',
        whatToKnow: [] as string[],
        xrayHistory: { had: false, type: '' },
        previousComplications: { had: false, details: '' },
        previousVisitOpinion: '',
        oralHealthOpinion: '',
        symptoms: [] as string[],
        grindingHabits: { had: false, biteGuard: false },
        appearanceConcerns: [] as string[],
        injuryHistory: { had: false, details: '' },
        previousTreatments: [] as string[],
      },
      maintenance: {
        tools: [] as string[],
        toothpasteFeatures: [] as string[],
        brushingTime: 0,
        brushingFrequency: { day: 0, week: 0 },
      },
      snacks: [] as { name: string, frequency: string }[],
      beliefs: {
        cavityRisk: '',
        preventionImportance: '',
        maintenanceConfidence: '',
        healthBelief: '',
      },
      pharmacological: {
        currentMeds: { had: false, details: '', purpose: '' },
        sideEffects: '',
        positiveEffect: '',
        dosageIssues: { had: false, details: '' },
        regularConsumption: { had: false },
      }
    },
    clinical: {
      vitalSigns: {
        bloodPressure: '',
        pulse: 0,
        respiration: 0,
      },
      extraOral: {
        skin: 'Normal',
        neck: 'Normal',
        vermilion: 'Normal',
        parotid: 'Normal',
        lymphNodes: 'Normal',
        tmj: 'Normal',
        others: '',
      },
      intraOral: {
        labialMucosa: 'Normal',
        labialVestibules: 'Normal',
        gingiva: 'Normal',
        tongue: 'Normal',
        floorOfMouth: 'Normal',
        palate: 'Normal',
        uvula: 'Normal',
        tonsils: 'Normal',
        pharyngealWall: 'Normal',
        others: '',
      },
      ohis: {
        debrisIndex: {
          u1: 0, u2: 0, u3: 0,
          l1: 0, l2: 0, l3: 0,
          total: 0,
          category: '',
        },
        calculusIndex: {
          u1: 0, u2: 0, u3: 0,
          l1: 0, l2: 0, l3: 0,
          total: 0,
          category: '',
        },
        total: 0,
        category: '',
      }
    },
    odontogram: {
      teeth: {} as Record<string, string>,
    },
    indices: {
      dmft: { d: 0, m: 0, f: 0, total: 0 },
      deft: { d: 0, e: 0, f: 0, total: 0 },
      ohis: {
        debris: [0, 0, 0, 0, 0, 0], // 16, 11, 26, 36, 31, 46
        calculus: [0, 0, 0, 0, 0, 0],
        di: 0,
        ci: 0,
        total: 0,
        category: ''
      },
      pcr: {
        score: 0,
        category: ''
      },
      periodontal: {
        bleeding: [] as string[],
        attachmentLoss: [] as string[],
        pocket: [] as string[],
        extrinsicStains: [] as string[],
        calculusScore: [] as number[],
      },
      plaqueControl: {
        kunjungan1: {
          teeth: [] as string[],
          score: 0,
          category: '',
        }
      }
    },
    askesgilut: {
      categories: {} as Record<string, string[]>,
      diagnoses: [
        { kebutuhan: '', penyebab: '', tandaGejala: '' }
      ],
      planning: {
        goals: '',
        interventions: '',
        evaluativeStatement: '',
      },
      nextVisit: '',
      recommendations: '',
    },
    consent: {
      agreed: false,
      witnessName: '',
      procedure: '',
      patientSignature: '',
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
      isBPJS: false,
    }
  });

  useEffect(() => {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientsData);
      
      // Handle patientId from URL after patients are loaded
      if (patientIdParam) {
        setSelectedPatientId(patientIdParam);
      }
    });
    return () => unsubscribe();
  }, [patientIdParam]);

  useEffect(() => {
    if (selectedPatientId) {
      setFormData(prev => ({ ...prev, patientId: selectedPatientId }));
    }
  }, [selectedPatientId]);

  const handleSaveProgress = async () => {
    if (!selectedPatientId) {
      alert("Silakan pilih pasien terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const recordData = {
        ...formData,
        patientId: selectedPatientId,
        updatedAt: Timestamp.now(),
      };

      // We use addDoc for now, but ideally we should update if it already exists for this visit
      // For simplicity and following user request "klik simpan pada setiap bagian", we'll just add/save
      await addDoc(collection(db, 'dental_records'), recordData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving progress:", error);
      alert("Gagal menyimpan progress. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const addDiagnosis = () => {
    setFormData(prev => ({
      ...prev,
      askesgilut: {
        ...prev.askesgilut,
        diagnoses: [...prev.askesgilut.diagnoses, { kebutuhan: '', penyebab: '', tandaGejala: '' }]
      }
    }));
  };

  const removeDiagnosis = (index: number) => {
    setFormData(prev => ({
      ...prev,
      askesgilut: {
        ...prev.askesgilut,
        diagnoses: prev.askesgilut.diagnoses.filter((_, i) => i !== index)
      }
    }));
  };

  useEffect(() => {
    const total = formData.billing.isBPJS 
      ? 0 
      : formData.billing.items.reduce((sum, item) => sum + item.price, 0);
      
    if (total !== formData.billing.total) {
      setFormData(prev => ({
        ...prev,
        billing: { ...prev.billing, total }
      }));
    }
  }, [formData.billing.items, formData.billing.isBPJS]);

  const addBillingItem = () => {
    if (!newBillingItem.name) return;
    
    const selectedPatient = patients.find(p => p.id === selectedPatientId);
    const isBPJS = formData.billing.isBPJS || selectedPatient?.paymentMethod === 'BPJS';
    
    const price = isBPJS ? 0 : (parseInt(newBillingItem.price) || 0);
    
    setFormData(prev => ({
      ...prev,
      billing: {
        ...prev.billing,
        items: [...prev.billing.items, { name: newBillingItem.name, price }]
      }
    }));
    setNewBillingItem({ name: '', price: '' });
  };

  const toggleBPJS = (checked: boolean) => {
    setFormData(prev => {
      const newItems = checked 
        ? prev.billing.items.map(item => ({ ...item, price: 0 }))
        : prev.billing.items;
        
      return {
        ...prev,
        billing: {
          ...prev.billing,
          isBPJS: checked,
          items: newItems
        }
      };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const removeBillingItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      billing: {
        ...prev.billing,
        items: prev.billing.items.filter((_, i) => i !== index)
      }
    }));
  };

  const generateAIIntervention = async () => {
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const selectedDiags = formData.askesgilut.diagnoses.map(d => d.kebutuhan).filter(k => k).join(', ');
      
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

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      alert("Silakan pilih pasien terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      const recordData = {
        ...formData,
        patientId: selectedPatientId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'dental_records'), recordData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Optionally redirect or reset form
    } catch (error) {
      console.error("Error saving dental record:", error);
      alert("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const teeth = formData.odontogram.teeth;
    let d = 0, m = 0, f = 0;
    let sd = 0, se = 0, sf = 0;

    Object.entries(teeth).forEach(([numStr, status]) => {
      const num = parseInt(numStr);
      const isPrimary = (num >= 51 && num <= 85);
      
      if (isPrimary) {
        if (status === '1' || status === '2') sd++;
        if (status === '4') se++;
        if (status === '3') sf++;
      } else {
        if (status === '1' || status === '2') d++;
        if (status === '4') m++;
        if (status === '3') f++;
      }
    });

    setFormData(prev => ({
      ...prev,
      indices: {
        ...prev.indices,
        dmft: { d, m, f, total: d + m + f },
        deft: { d: sd, e: se, f: sf, total: sd + se + sf }
      }
    }));
  }, [formData.odontogram.teeth]);

  useEffect(() => {
    const initializePads = () => {
      // TGM Pad (Step 5)
      if (currentStep === 5 && canvasRef.current && !sigPad.current) {
        const canvas = canvasRef.current;
        if (canvas.offsetWidth > 0) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d")?.scale(ratio, ratio);
          sigPad.current = new SignaturePad(canvas, {
            backgroundColor: 'rgba(0,0,0,0)',
            penColor: '#0f172a'
          });
          // Restore if exists in formData
          if (formData.signature) {
            sigPad.current.fromDataURL(formData.signature);
          }
        }
      }

      // Patient Pad (Step 4)
      if (currentStep === 4 && patientCanvasRef.current && !patientSigPad.current) {
        const canvas = patientCanvasRef.current;
        if (canvas.offsetWidth > 0) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d")?.scale(ratio, ratio);
          patientSigPad.current = new SignaturePad(canvas, {
            backgroundColor: 'rgba(0,0,0,0)',
            penColor: '#0f172a'
          });
          // Restore if exists in formData
          if (formData.consent.patientSignature) {
            patientSigPad.current.fromDataURL(formData.consent.patientSignature);
          }
        }
      }
    };

    const timer = setInterval(initializePads, 200);
    
    return () => {
      clearInterval(timer);
      if (currentStep !== 5 && sigPad.current) {
        sigPad.current.off();
        sigPad.current = null;
      }
      if (currentStep !== 4 && patientSigPad.current) {
        patientSigPad.current.off();
        patientSigPad.current = null;
      }
    };
  }, [currentStep, formData.signature, formData.consent.patientSignature]);

  const clearSignature = () => {
    sigPad.current?.clear();
    setFormData(prev => ({ ...prev, signature: '' }));
  };

  const clearPatientSignature = () => {
    patientSigPad.current?.clear();
    setFormData(prev => ({ ...prev, consent: { ...prev.consent, patientSignature: '' } }));
  };

  const saveSignature = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      setFormData(prev => ({ ...prev, signature: sigPad.current!.toDataURL('image/png') }));
    }
  };

  const savePatientSignature = () => {
    if (patientSigPad.current && !patientSigPad.current.isEmpty()) {
      setFormData(prev => ({ ...prev, consent: { ...prev.consent, patientSignature: patientSigPad.current!.toDataURL('image/png') } }));
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-gold rounded-full"></div>
            <h1 className="text-4xl font-bold text-navy tracking-tighter uppercase">Rekam Dental Hygiene</h1>
          </div>
          <p className="text-navy/40 font-black uppercase tracking-[0.3em] text-[10px] ml-5">Sistem Kesehatan Gigi Masyarakat Kopo</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSaveProgress}
            disabled={isSaving}
            className="px-8 py-4 bg-white border-2 border-navy/5 rounded-2xl text-xs font-black text-navy/40 hover:border-pink hover:text-pink transition-all uppercase tracking-widest shadow-sm flex items-center gap-2"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
            {saveSuccess ? 'Tersimpan' : 'Simpan Draft'}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-8 py-4 bg-navy rounded-2xl text-xs font-black text-gold hover:bg-navy-light shadow-2xl shadow-navy/40 transition-all flex items-center gap-3 uppercase tracking-widest border border-gold/20"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            Finalisasi Rekam
          </button>
        </div>
      </header>

      {/* Patient Selection & Visit Info */}
      <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
        <div className="bg-white p-6 rounded-3xl border-2 border-navy/5 shadow-sm space-y-3">
          <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest flex items-center gap-2">
            <Users size={14} className="text-pink" /> Pilih Pasien
          </label>
          <select 
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full px-4 py-3 bg-navy-50 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold transition-all appearance-none"
          >
            <option value="">-- Pilih Pasien --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.rmNumber || 'No RM'} - {p.name} ({p.nik})</option>
            ))}
          </select>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border-2 border-navy/5 shadow-sm space-y-3">
          <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-pink" /> Tanggal Kunjungan
          </label>
          <input 
            type="date"
            value={formData.visitDate}
            onChange={(e) => setFormData({...formData, visitDate: e.target.value})}
            className="w-full px-4 py-3 bg-navy-50 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold transition-all"
          />
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-navy/5 shadow-sm space-y-3">
          <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-pink" /> Kunjungan Ke
          </label>
          <input 
            type="number"
            value={formData.visitNumber}
            onChange={(e) => setFormData({...formData, visitNumber: parseInt(e.target.value) || 1})}
            className="w-full px-4 py-3 bg-navy-50 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold transition-all"
          />
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-16 relative px-4">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-navy/5 -translate-y-1/2 rounded-full"></div>
        <div className="flex justify-between relative z-10">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(i)}
              className="flex flex-col items-center group transition-all duration-500"
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 relative overflow-hidden",
                currentStep === i 
                  ? "bg-navy text-gold border-gold shadow-2xl shadow-navy/40 scale-110 rotate-3" 
                  : i < currentStep 
                    ? "bg-gold text-white border-gold shadow-lg shadow-gold/20" 
                    : "bg-white text-navy/20 border-navy/5 group-hover:border-pink group-hover:text-pink"
              )}>
                {i < currentStep ? <CheckCircle2 size={24} /> : <step.icon size={24} />}
                {currentStep === i && (
                  <motion.div 
                    layoutId="stepper-glow"
                    className="absolute inset-0 bg-gold/10 animate-pulse"
                  />
                )}
              </div>
              <span className={cn(
                "mt-5 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 max-w-[80px] text-center leading-tight",
                currentStep === i ? "text-navy opacity-100 translate-y-0" : "text-navy/40 opacity-100 translate-y-0"
              )}>
                {step.label}
              </span>
            </button>
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
                <div className="space-y-10 custom-scrollbar max-h-[60vh] overflow-y-auto pr-4">
                  <div className="flex items-center gap-3 border-l-4 border-pink pl-4 mb-6">
                    <h3 className="text-xl font-black text-navy uppercase tracking-wider">Anamnesis Komprehensif</h3>
                  </div>

                  {/* Riwayat Kesehatan Umum */}
                  <div className="space-y-6 bg-navy-50/30 p-6 rounded-3xl border border-navy/5">
                    <h4 className="text-xs font-black text-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Activity size={14} className="text-pink" /> Riwayat Kesehatan Umum
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-navy/5">
                        <span className="text-sm font-bold text-navy flex-1">Apakah Anda merasa sehat saat ini?</span>
                        <div className="flex bg-navy-50 p-1 rounded-xl">
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, anamnesis: {...formData.anamnesis, medicalHistory: {...formData.anamnesis.medicalHistory, isHealthy: true}}})}
                            className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", formData.anamnesis.medicalHistory.isHealthy ? "bg-navy text-gold shadow-lg" : "text-navy/40")}
                          >YA</button>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, anamnesis: {...formData.anamnesis, medicalHistory: {...formData.anamnesis.medicalHistory, isHealthy: false}}})}
                            className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", !formData.anamnesis.medicalHistory.isHealthy ? "bg-pink text-white shadow-lg" : "text-navy/40")}
                          >TIDAK</button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Penyakit Serius / Operasi</label>
                        <input 
                          type="text"
                          className="w-full px-6 py-3 bg-white border-2 border-transparent focus:border-pink focus:ring-0 rounded-xl text-sm font-bold"
                          placeholder="Sebutkan jika ada..."
                          value={formData.anamnesis.medicalHistory.seriousIllness}
                          onChange={e => setFormData({...formData, anamnesis: {...formData.anamnesis, medicalHistory: {...formData.anamnesis.medicalHistory, seriousIllness: e.target.value}}})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Riwayat Alergi</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['food', 'drugs', 'anesthesia', 'weather'].map((type) => (
                            <div key={type} className="space-y-1">
                              <span className="text-[9px] font-black text-navy/30 uppercase tracking-tighter ml-2">{type === 'food' ? 'Makanan' : type === 'drugs' ? 'Obat' : type === 'anesthesia' ? 'Anestesi' : 'Cuaca'}</span>
                              <input 
                                type="text"
                                className="w-full px-4 py-2 bg-white border border-navy/5 rounded-xl text-xs font-bold"
                                value={formData.anamnesis.medicalHistory.allergies[type as keyof typeof formData.anamnesis.medicalHistory.allergies]}
                                onChange={e => setFormData({...formData, anamnesis: {...formData.anamnesis, medicalHistory: {...formData.anamnesis.medicalHistory, allergies: {...formData.anamnesis.medicalHistory.allergies, [type]: e.target.value}}}})}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Pembekuan Darah / Lainnya</label>
                        <textarea 
                          className="w-full px-6 py-3 bg-white border-2 border-transparent focus:border-pink focus:ring-0 rounded-xl text-sm font-bold min-h-[80px]"
                          value={formData.anamnesis.medicalHistory.others}
                          onChange={e => setFormData({...formData, anamnesis: {...formData.anamnesis, medicalHistory: {...formData.anamnesis.medicalHistory, others: e.target.value}}})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Riwayat Kesehatan Gigi */}
                  <div className="space-y-6 bg-navy-50/30 p-6 rounded-3xl border border-navy/5">
                    <h4 className="text-xs font-black text-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Smile size={14} className="text-pink" /> Riwayat Kesehatan Gigi
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Alasan Kunjungan</label>
                        <textarea 
                          className="w-full px-6 py-3 bg-white border-2 border-transparent focus:border-pink focus:ring-0 rounded-xl text-sm font-bold min-h-[60px]"
                          placeholder="Apa yang ingin dicapai hari ini?"
                          value={formData.anamnesis.dentalHistory.reason}
                          onChange={e => setFormData({...formData, anamnesis: {...formData.anamnesis, dentalHistory: {...formData.anamnesis.dentalHistory, reason: e.target.value}}})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Gejala yang Dirasakan</label>
                        <div className="flex flex-wrap gap-2">
                          {['Gusi Berdarah', 'Gigi Goyang', 'Bau Mulut', 'Gigi Sensitif', 'Sakit Saat Mengunyah'].map(symptom => (
                            <button
                              key={symptom}
                              type="button"
                              onClick={() => {
                                const current = formData.anamnesis.dentalHistory.symptoms;
                                const next = current.includes(symptom) ? current.filter(s => s !== symptom) : [...current, symptom];
                                setFormData({...formData, anamnesis: {...formData.anamnesis, dentalHistory: {...formData.anamnesis.dentalHistory, symptoms: next}}});
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-[10px] font-black transition-all border",
                                formData.anamnesis.dentalHistory.symptoms.includes(symptom)
                                  ? "bg-navy text-gold border-navy"
                                  : "bg-white text-navy/40 border-navy/5 hover:border-pink hover:text-pink"
                              )}
                            >{symptom}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pemeliharaan Kesehatan Gigi */}
                  <div className="space-y-6 bg-navy-50/30 p-6 rounded-3xl border border-navy/5">
                    <h4 className="text-xs font-black text-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                      <ClipboardCheck size={14} className="text-pink" /> Pemeliharaan & Kebiasaan
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Alat yang Digunakan</label>
                        <div className="space-y-2">
                          {['Sikat Gigi Manual', 'Sikat Gigi Elektrik', 'Dental Floss', 'Sikat Interdental', 'Obat Kumur'].map(tool => (
                            <label key={tool} className="flex items-center gap-2 cursor-pointer group">
                              <input 
                                type="checkbox"
                                className="rounded text-pink focus:ring-pink"
                                checked={formData.anamnesis.maintenance.tools.includes(tool)}
                                onChange={() => {
                                  const current = formData.anamnesis.maintenance.tools;
                                  const next = current.includes(tool) ? current.filter(t => t !== tool) : [...current, tool];
                                  setFormData({...formData, anamnesis: {...formData.anamnesis, maintenance: {...formData.anamnesis.maintenance, tools: next}}});
                                }}
                              />
                              <span className="text-xs font-bold text-navy/60 group-hover:text-navy transition-colors">{tool}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Frekuensi Sikat Gigi</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="number"
                              className="w-16 px-3 py-2 bg-white border border-navy/5 rounded-xl text-sm font-bold"
                              value={formData.anamnesis.maintenance.brushingFrequency.day}
                              onChange={e => setFormData({...formData, anamnesis: {...formData.anamnesis, maintenance: {...formData.anamnesis.maintenance, brushingFrequency: {...formData.anamnesis.maintenance.brushingFrequency, day: parseInt(e.target.value) || 0}}}})}
                            />
                            <span className="text-xs font-bold text-navy/40">kali / hari</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Lama Menyikat (Menit)</label>
                          <input 
                            type="range" min="0" max="10" step="1"
                            className="w-full accent-pink"
                            value={formData.anamnesis.maintenance.brushingTime}
                            onChange={e => setFormData({...formData, anamnesis: {...formData.anamnesis, maintenance: {...formData.anamnesis.maintenance, brushingTime: parseInt(e.target.value)}}})}
                          />
                          <div className="text-center text-xs font-black text-pink">{formData.anamnesis.maintenance.brushingTime} Menit</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Konsumsi Camilan Manis</label>
                        <select 
                          className="w-full px-4 py-3 bg-white border border-navy/5 rounded-xl text-xs font-bold appearance-none"
                          onChange={(e) => {
                            if (e.target.value) {
                              const [name, freq] = e.target.value.split('|');
                              setFormData({...formData, anamnesis: {...formData.anamnesis, snacks: [...formData.anamnesis.snacks, { name, frequency: freq }]}});
                            }
                          }}
                        >
                          <option value="">Tambah Kebiasaan Makan...</option>
                          <option value="Cokelat|Sering">Cokelat (Sering)</option>
                          <option value="Permen|Sering">Permen (Sering)</option>
                          <option value="Minuman Manis|Sering">Minuman Manis (Sering)</option>
                          <option value="Kue/Biskuit|Kadang">Kue/Biskuit (Kadang)</option>
                        </select>
                        <div className="mt-3 space-y-2">
                          {formData.anamnesis.snacks.map((snack, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-navy/5">
                              <span className="text-[10px] font-bold text-navy">{snack.name} ({snack.frequency})</span>
                              <button 
                                onClick={() => setFormData({...formData, anamnesis: {...formData.anamnesis, snacks: formData.anamnesis.snacks.filter((_, idx) => idx !== i)}})}
                                className="text-pink hover:scale-110 transition-transform"
                              ><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-10 custom-scrollbar max-h-[60vh] overflow-y-auto pr-4">
                  <div className="flex items-center gap-3 border-l-4 border-pink pl-4 mb-6">
                    <h3 className="text-xl font-black text-navy uppercase tracking-wider">Pemeriksaan Klinis</h3>
                  </div>

                  {/* Vital Signs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-navy-50/30 p-6 rounded-3xl border border-navy/5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Tekanan Darah (mmHg)</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-3 bg-white border-2 border-transparent focus:border-pink focus:ring-0 rounded-xl text-sm font-bold"
                        placeholder="120/80"
                        value={formData.clinical.vitalSigns.bloodPressure}
                        onChange={e => setFormData({...formData, clinical: {...formData.clinical, vitalSigns: {...formData.clinical.vitalSigns, bloodPressure: e.target.value}}})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Nadi (bpm)</label>
                      <input 
                        type="number"
                        className="w-full px-6 py-3 bg-white border-2 border-transparent focus:border-pink focus:ring-0 rounded-xl text-sm font-bold"
                        value={formData.clinical.vitalSigns.pulse}
                        onChange={e => setFormData({...formData, clinical: {...formData.clinical, vitalSigns: {...formData.clinical.vitalSigns, pulse: parseInt(e.target.value) || 0}}})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Pernapasan (rpm)</label>
                      <input 
                        type="number"
                        className="w-full px-6 py-3 bg-white border-2 border-transparent focus:border-pink focus:ring-0 rounded-xl text-sm font-bold"
                        value={formData.clinical.vitalSigns.respiration}
                        onChange={e => setFormData({...formData, clinical: {...formData.clinical, vitalSigns: {...formData.clinical.vitalSigns, respiration: parseInt(e.target.value) || 0}}})}
                      />
                    </div>
                  </div>

                  {/* Extra Oral */}
                  <div className="space-y-6 bg-navy-50/30 p-6 rounded-3xl border border-navy/5">
                    <h4 className="text-xs font-black text-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Activity size={14} className="text-pink" /> Pemeriksaan Ekstra Oral
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Object.keys(formData.clinical.extraOral).filter(k => k !== 'others').map((key) => (
                        <div key={key} className="space-y-2">
                          <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                          <select 
                            className="w-full px-4 py-2 bg-white border border-navy/5 rounded-xl text-xs font-bold appearance-none"
                            value={formData.clinical.extraOral[key as keyof typeof formData.clinical.extraOral]}
                            onChange={e => setFormData({...formData, clinical: {...formData.clinical, extraOral: {...formData.clinical.extraOral, [key]: e.target.value}}})}
                          >
                            <option>Normal</option>
                            <option>Abnormal</option>
                            <option>Tidak Diperiksa</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intra Oral */}
                  <div className="space-y-6 bg-navy-50/30 p-6 rounded-3xl border border-navy/5">
                    <h4 className="text-xs font-black text-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Smile size={14} className="text-pink" /> Pemeriksaan Intra Oral
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Object.keys(formData.clinical.intraOral).filter(k => k !== 'others').map((key) => (
                        <div key={key} className="space-y-2">
                          <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                          <select 
                            className="w-full px-4 py-2 bg-white border border-navy/5 rounded-xl text-xs font-bold appearance-none"
                            value={formData.clinical.intraOral[key as keyof typeof formData.clinical.intraOral]}
                            onChange={e => setFormData({...formData, clinical: {...formData.clinical, intraOral: {...formData.clinical.intraOral, [key]: e.target.value}}})}
                          >
                            <option>Normal</option>
                            <option>Abnormal</option>
                            <option>Tidak Diperiksa</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4">Odontogram Interaktif</h3>
                  <Odontogram 
                    value={formData.odontogram.teeth as any} 
                    onChange={(teeth) => setFormData({ ...formData, odontogram: { teeth: teeth as any } })} 
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-10 custom-scrollbar max-h-[60vh] overflow-y-auto pr-4">
                  <div className="flex items-center gap-3 border-l-4 border-pink pl-4 mb-6">
                    <h3 className="text-xl font-black text-navy uppercase tracking-wider">Indeks Kesehatan Gigi</h3>
                  </div>

                  {/* DMF-T & def-t (Auto-calculated) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-navy-50/30 p-6 rounded-3xl border border-navy/5 space-y-4">
                      <h4 className="text-xs font-black text-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ClipboardCheck size={14} className="text-pink" /> Indeks DMF-T (Gigi Tetap)
                      </h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded-xl text-center">
                          <p className="text-[10px] font-black text-navy/30 uppercase">D</p>
                          <p className="text-xl font-black text-navy">{formData.indices.dmft.d}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl text-center">
                          <p className="text-[10px] font-black text-navy/30 uppercase">M</p>
                          <p className="text-xl font-black text-navy">{formData.indices.dmft.m}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl text-center">
                          <p className="text-[10px] font-black text-navy/30 uppercase">F</p>
                          <p className="text-xl font-black text-navy">{formData.indices.dmft.f}</p>
                        </div>
                        <div className="bg-pink text-white p-3 rounded-xl text-center">
                          <p className="text-[10px] font-black uppercase opacity-60">Total</p>
                          <p className="text-xl font-black">{formData.indices.dmft.total}</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-navy/30 italic font-medium">* Otomatis terisi dari data Odontogram</p>
                    </div>

                    <div className="bg-blue-50/30 p-6 rounded-3xl border border-blue-100 space-y-4">
                      <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ClipboardCheck size={14} className="text-blue-400" /> Indeks def-t (Gigi Sulung)
                      </h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded-xl text-center">
                          <p className="text-[10px] font-black text-navy/30 uppercase">d</p>
                          <p className="text-xl font-black text-navy">{formData.indices.deft.d}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl text-center">
                          <p className="text-[10px] font-black text-navy/30 uppercase">e</p>
                          <p className="text-xl font-black text-navy">{formData.indices.deft.e}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl text-center">
                          <p className="text-[10px] font-black text-navy/30 uppercase">f</p>
                          <p className="text-xl font-black text-navy">{formData.indices.deft.f}</p>
                        </div>
                        <div className="bg-blue-500 text-white p-3 rounded-xl text-center">
                          <p className="text-[10px] font-black uppercase opacity-60">Total</p>
                          <p className="text-xl font-black">{formData.indices.deft.total}</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-navy/30 italic font-medium">* Otomatis terisi dari data Odontogram</p>
                    </div>
                  </div>

                  {/* OHI-S (DI & CI) */}
                  <div className="bg-navy-50/30 p-6 rounded-3xl border border-navy/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity size={14} className="text-pink" /> Indeks OHI-S (DI & CI)
                      </h4>
                      <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white border border-navy/5 rounded-xl text-[10px] font-black text-navy uppercase">DI: {formData.indices.ohis.di.toFixed(2)}</div>
                        <div className="px-4 py-2 bg-white border border-navy/5 rounded-xl text-[10px] font-black text-navy uppercase">CI: {formData.indices.ohis.ci.toFixed(2)}</div>
                        <div className="px-4 py-2 bg-navy text-gold rounded-xl text-xs font-black">OHI-S: {formData.indices.ohis.total.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Debris Index */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-navy/30 uppercase tracking-widest text-center">Debris Index (DI)</p>
                        <div className="grid grid-cols-3 gap-3">
                          {[16, 11, 26, 46, 31, 36].map((tooth, idx) => (
                            <div key={tooth} className="space-y-1">
                              <label className="text-[9px] font-bold text-navy/40 block text-center">{tooth}</label>
                              <select 
                                className="w-full p-2 bg-white border border-navy/5 rounded-lg text-xs font-bold text-center appearance-none"
                                value={formData.indices.ohis.debris[idx]}
                                onChange={e => {
                                  const newDebris = [...formData.indices.ohis.debris];
                                  newDebris[idx] = parseInt(e.target.value);
                                  const di = newDebris.reduce((a, b) => a + b, 0) / 6;
                                  const total = di + formData.indices.ohis.ci;
                                  setFormData({
                                    ...formData,
                                    indices: {
                                      ...formData.indices,
                                      ohis: { ...formData.indices.ohis, debris: newDebris, di, total }
                                    }
                                  });
                                }}
                              >
                                {[0, 1, 2, 3].map(v => <option key={v} value={v}>{v}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Calculus Index */}
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-navy/30 uppercase tracking-widest text-center">Calculus Index (CI)</p>
                        <div className="grid grid-cols-3 gap-3">
                          {[16, 11, 26, 46, 31, 36].map((tooth, idx) => (
                            <div key={tooth} className="space-y-1">
                              <label className="text-[9px] font-bold text-navy/40 block text-center">{tooth}</label>
                              <select 
                                className="w-full p-2 bg-white border border-navy/5 rounded-lg text-xs font-bold text-center appearance-none"
                                value={formData.indices.ohis.calculus[idx]}
                                onChange={e => {
                                  const newCalculus = [...formData.indices.ohis.calculus];
                                  newCalculus[idx] = parseInt(e.target.value);
                                  const ci = newCalculus.reduce((a, b) => a + b, 0) / 6;
                                  const total = formData.indices.ohis.di + ci;
                                  setFormData({
                                    ...formData,
                                    indices: {
                                      ...formData.indices,
                                      ohis: { ...formData.indices.ohis, calculus: newCalculus, ci, total }
                                    }
                                  });
                                }}
                              >
                                {[0, 1, 2, 3].map(v => <option key={v} value={v}>{v}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plak Control Record (PCR) */}
                  <div className="space-y-6 bg-navy-50/30 p-6 rounded-3xl border border-navy/5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ClipboardCheck size={14} className="text-pink" /> Plak Control Record (PCR)
                      </h4>
                      <div className="px-4 py-2 bg-navy text-gold rounded-xl text-xs font-black">
                        Skor: {formData.indices.pcr.score}%
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-navy/5">
                      <p className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-4">Visualisasi Plak (Klik pada gigi yang terdapat plak)</p>
                      <div className="grid grid-cols-8 md:grid-cols-16 gap-2">
                        {Array.from({length: 32}).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              const tooth = (i + 1).toString();
                              const current = formData.indices.plaqueControl.kunjungan1.teeth;
                              const next = current.includes(tooth) ? current.filter(t => t !== tooth) : [...current, tooth];
                              const newScore = Math.round((next.length / 32) * 100);
                              setFormData({
                                ...formData, 
                                indices: {
                                  ...formData.indices, 
                                  pcr: { ...formData.indices.pcr, score: newScore },
                                  plaqueControl: {
                                    ...formData.indices.plaqueControl, 
                                    kunjungan1: { ...formData.indices.plaqueControl.kunjungan1, teeth: next, score: newScore }
                                  }
                                }
                              });
                            }}
                            className={cn(
                              "w-full aspect-square rounded-md border text-[8px] font-black flex items-center justify-center transition-all",
                              formData.indices.plaqueControl.kunjungan1.teeth.includes((i + 1).toString())
                                ? "bg-pink text-white border-pink shadow-lg scale-110"
                                : "bg-navy-50 text-navy/20 border-navy/5 hover:border-pink/30"
                            )}
                          >{i + 1}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                      <div className="flex flex-col justify-center space-y-4">
                        <div className="p-6 bg-white rounded-2xl border border-navy/5 shadow-sm">
                          <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest block mb-2">Interpretasi PCI</span>
                          <div className={cn(
                            "text-lg font-black uppercase tracking-tight",
                            formData.indices.plaqueControl.kunjungan1.score <= 10 ? "text-green-500" : 
                            formData.indices.plaqueControl.kunjungan1.score <= 20 ? "text-gold" : "text-pink"
                          )}>
                            {formData.indices.plaqueControl.kunjungan1.score <= 10 ? 'Sangat Baik' : 
                             formData.indices.plaqueControl.kunjungan1.score <= 20 ? 'Baik' : 'Perlu Peningkatan'}
                          </div>
                          <p className="text-[10px] text-navy/40 mt-2 leading-relaxed">Target skor PCI adalah ≤ 10% untuk kesehatan jaringan periodontal yang optimal.</p>
                        </div>
                      </div>
                    </div>
              )}

              {currentStep === 4 && (
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
                      <div className="space-y-6">
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

                      <div className="space-y-4">
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-pink-soft">
                          <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-black text-navy uppercase tracking-widest flex items-center gap-2">
                              <PenTool size={18} className="text-pink" /> Tanda Tangan Pasien
                            </label>
                            <button 
                              onClick={clearPatientSignature}
                              className="p-2 text-navy/30 hover:text-pink hover:bg-pink-soft rounded-xl transition-all"
                            >
                              <RotateCcw size={18} />
                            </button>
                          </div>
                          <div className="bg-navy-50 rounded-2xl overflow-hidden border border-navy/5 shadow-inner">
                            <canvas 
                              ref={patientCanvasRef}
                              className="w-full h-40 cursor-crosshair touch-none"
                              onMouseUp={savePatientSignature}
                              onTouchEnd={savePatientSignature}
                            />
                          </div>
                          <p className="text-[10px] text-navy/30 mt-3 text-center font-bold uppercase tracking-widest italic">Tanda tangan pasien / wali di atas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-10 custom-scrollbar max-h-[70vh] overflow-y-auto pr-4">
                  <div className="flex items-center justify-between border-l-4 border-pink pl-4">
                    <h3 className="text-xl font-black text-navy uppercase tracking-wider">Diagnosis, Perencanaan, Implementasi dan Evaluasi Askesgilut</h3>
                    <button 
                      onClick={generateAIIntervention}
                      disabled={isGeneratingAI || formData.askesgilut.diagnoses.every(d => !d.kebutuhan)}
                      className="flex items-center gap-2 px-6 py-3 bg-navy text-pink rounded-xl text-xs font-black hover:bg-navy-light disabled:opacity-50 transition-all shadow-xl shadow-navy/10 uppercase tracking-widest"
                    >
                      {isGeneratingAI ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                      AI Generate Askesgilut
                    </button>
                  </div>

                  {/* 8 Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ASKESGILUT_DIAGNOSES.map((diag) => (
                      <div key={diag.id} className="space-y-4 bg-navy-50/30 p-6 rounded-3xl border border-navy/5">
                        <div className="space-y-1">
                          <label className="text-xs font-black text-navy uppercase tracking-tight block">{diag.title}</label>
                          <p className="text-[10px] text-navy/40 font-medium leading-relaxed italic">{diag.statement}</p>
                        </div>
                        <div className="space-y-2">
                          {diag.indicators.map((indicator, idx) => (
                            <label key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-navy/5 hover:border-pink/30 transition-all cursor-pointer group">
                              <input 
                                type="checkbox"
                                className="mt-1 rounded text-pink focus:ring-pink"
                                checked={(formData.askesgilut.categories[diag.id] || []).includes(indicator)}
                                onChange={() => {
                                  const current = formData.askesgilut.categories[diag.id] || [];
                                  const next = current.includes(indicator) 
                                    ? current.filter(i => i !== indicator) 
                                    : [...current, indicator];
                                  setFormData({
                                    ...formData,
                                    askesgilut: {
                                      ...formData.askesgilut,
                                      categories: { ...formData.askesgilut.categories, [diag.id]: next }
                                    }
                                  });
                                }}
                              />
                              <span className="text-xs font-bold text-navy/60 group-hover:text-navy transition-colors leading-relaxed">
                                {indicator}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Diagnosis Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-navy/40 uppercase tracking-[0.2em] flex items-center gap-2">
                        <AlertCircle size={14} className="text-pink" /> Diagnosis Askesgilut (Dental Hygiene Diagnosis)
                      </h4>
                      <button 
                        onClick={addDiagnosis}
                        className="flex items-center gap-2 px-4 py-2 bg-navy text-gold rounded-xl text-[10px] font-black hover:bg-navy-light transition-all uppercase tracking-widest"
                      >
                        <Plus size={14} /> Tambah Diagnosa
                      </button>
                    </div>

                    <div className="space-y-6">
                      {formData.askesgilut.diagnoses.map((diag, index) => (
                        <div key={index} className="bg-navy-50/50 p-6 rounded-3xl border border-navy/5 space-y-6 relative group">
                          {index > 0 && (
                            <button 
                              onClick={() => removeDiagnosis(index)}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-white text-pink rounded-full shadow-lg flex items-center justify-center hover:bg-pink hover:text-white transition-all border border-navy/5 opacity-0 group-hover:opacity-100"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-navy/60 uppercase tracking-widest ml-2">Kebutuhan yang tidak terpenuhi</label>
                              <select 
                                className="w-full p-4 bg-white border-transparent focus:border-pink focus:ring-0 rounded-xl text-sm transition-all font-medium appearance-none"
                                value={diag.kebutuhan}
                                onChange={e => {
                                  const newDiags = [...formData.askesgilut.diagnoses];
                                  newDiags[index].kebutuhan = e.target.value;
                                  setFormData({...formData, askesgilut: {...formData.askesgilut, diagnoses: newDiags}});
                                }}
                              >
                                <option value="">Pilih Kebutuhan...</option>
                                {ASKESGILUT_DIAGNOSES.map(d => (
                                  <option key={d.id} value={d.statement}>{d.statement}</option>
                                ))}
                                <option value="Lainnya">Lainnya (Tulis Manual)</option>
                              </select>
                              {diag.kebutuhan === 'Lainnya' && (
                                <textarea 
                                  className="w-full p-4 mt-2 bg-white border-transparent focus:border-pink focus:ring-0 rounded-xl text-sm min-h-[80px] transition-all font-medium"
                                  placeholder="Tulis diagnosa lainnya..."
                                  onChange={e => {
                                    const newDiags = [...formData.askesgilut.diagnoses];
                                    newDiags[index].kebutuhan = e.target.value;
                                    setFormData({...formData, askesgilut: {...formData.askesgilut, diagnoses: newDiags}});
                                  }}
                                />
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-navy/60 uppercase tracking-widest ml-2">Penyebab</label>
                              <textarea 
                                className="w-full p-4 bg-white border-transparent focus:border-pink focus:ring-0 rounded-xl text-sm min-h-[100px] transition-all font-medium"
                                value={diag.penyebab}
                                onChange={e => {
                                  const newDiags = [...formData.askesgilut.diagnoses];
                                  newDiags[index].penyebab = e.target.value;
                                  setFormData({...formData, askesgilut: {...formData.askesgilut, diagnoses: newDiags}});
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-navy/60 uppercase tracking-widest ml-2">Tanda-tanda dan gejala</label>
                              <textarea 
                                className="w-full p-4 bg-white border-transparent focus:border-pink focus:ring-0 rounded-xl text-sm min-h-[100px] transition-all font-medium"
                                value={diag.tandaGejala}
                                onChange={e => {
                                  const newDiags = [...formData.askesgilut.diagnoses];
                                  newDiags[index].tandaGejala = e.target.value;
                                  setFormData({...formData, askesgilut: {...formData.askesgilut, diagnoses: newDiags}});
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Planning Table */}
                  <div className="bg-white rounded-3xl border border-navy/5 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-navy/5">
                      <div className="p-6 space-y-3">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest block">Tujuan Berpusat Pada Klien</label>
                        <textarea 
                          className="w-full p-4 bg-navy-50 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-xl text-sm min-h-[150px] transition-all font-medium"
                          value={formData.askesgilut.planning.goals}
                          onChange={e => setFormData({...formData, askesgilut: {...formData.askesgilut, planning: {...formData.askesgilut.planning, goals: e.target.value}}})}
                        />
                      </div>
                      <div className="p-6 space-y-3">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest block">Intervensi Askesgilut</label>
                        <textarea 
                          className="w-full p-4 bg-navy-50 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-xl text-sm min-h-[150px] transition-all font-medium"
                          value={formData.askesgilut.planning.interventions}
                          onChange={e => setFormData({...formData, askesgilut: {...formData.askesgilut, planning: {...formData.askesgilut.planning, interventions: e.target.value}}})}
                        />
                      </div>
                      <div className="p-6 space-y-3">
                        <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest block">Pernyataan Evaluativ</label>
                        <textarea 
                          className="w-full p-4 bg-navy-50 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-xl text-sm min-h-[150px] transition-all font-medium"
                          value={formData.askesgilut.planning.evaluativeStatement}
                          onChange={e => setFormData({...formData, askesgilut: {...formData.askesgilut, planning: {...formData.askesgilut.planning, evaluativeStatement: e.target.value}}})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recommendations & Follow-up */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Jadwal Kunjungan Berikutnya</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-4 bg-white border-2 border-navy/5 focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold"
                        placeholder="Contoh: 6 bulan lagi..."
                        value={formData.askesgilut.nextVisit}
                        onChange={e => setFormData({...formData, askesgilut: {...formData.askesgilut, nextVisit: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-2">Rekomendasi Perawatan Selanjutnya</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-4 bg-white border-2 border-navy/5 focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold"
                        value={formData.askesgilut.recommendations}
                        onChange={e => setFormData({...formData, askesgilut: {...formData.askesgilut, recommendations: e.target.value}})}
                      />
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-pink-soft">
                      <div className="flex items-center justify-between mb-6">
                        <label className="text-xs font-black text-navy uppercase tracking-widest flex items-center gap-2">
                          <PenTool size={18} className="text-pink" /> Tanda Tangan TGM
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
                          className="w-full h-48 cursor-crosshair touch-none"
                          onMouseUp={saveSignature}
                          onTouchEnd={saveSignature}
                        />
                      </div>
                      <p className="text-[10px] text-navy/30 mt-4 text-center font-bold uppercase tracking-widest">Tanda tangan Terapis Gigi & Mulut</p>
                    </div>

                    <div className="bg-pink-soft/30 p-8 rounded-[2rem] border border-pink-soft flex flex-col justify-center">
                      <h4 className="font-black text-navy text-xs uppercase tracking-widest mb-4">Ringkasan Diagnosis</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.askesgilut.diagnoses.map((d, idx) => d.kebutuhan && (
                          <span key={idx} className="text-[10px] font-black bg-white text-pink px-3 py-1.5 rounded-full border border-pink-soft shadow-sm uppercase tracking-wider">
                            {d.kebutuhan}
                          </span>
                        ))}
                        {formData.askesgilut.diagnoses.every(d => !d.kebutuhan) && <p className="text-xs text-navy/30 font-bold italic">Belum ada diagnosis dipilih</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 6 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-navy-50/50 p-8 rounded-[2rem] border border-navy/5 billing-card">
                    <h3 className="text-xl font-black text-navy uppercase tracking-tight mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Receipt className="text-pink" /> Billing & Rincian Biaya
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <span className="text-[10px] font-black text-navy/40 group-hover:text-pink transition-colors uppercase tracking-widest">Cover BPJS?</span>
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={formData.billing.isBPJS}
                            onChange={(e) => toggleBPJS(e.target.checked)}
                          />
                          <div className="w-12 h-6 bg-navy/10 rounded-full peer peer-checked:bg-pink transition-all duration-300"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-all duration-300 shadow-sm"></div>
                        </div>
                      </label>
                    </h3>

                    {/* Add Item Form */}
                    <div className="bg-white p-6 rounded-3xl border border-navy/5 shadow-sm mb-8">
                      <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Nama Tindakan / Layanan</label>
                          <input 
                            type="text"
                            className="w-full px-6 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold transition-all"
                            placeholder="Contoh: Scaling, Tambal Gigi..."
                            value={newBillingItem.name}
                            onChange={e => setNewBillingItem({...newBillingItem, name: e.target.value})}
                          />
                        </div>
                        <div className="w-full md:w-48 space-y-2">
                          <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Biaya (IDR)</label>
                          <input 
                            type="number"
                            className="w-full px-6 py-4 bg-navy-50/50 border-2 border-transparent focus:bg-white focus:border-pink focus:ring-0 rounded-2xl text-sm font-bold transition-all"
                            placeholder="0"
                            value={newBillingItem.price}
                            onChange={e => setNewBillingItem({...newBillingItem, price: e.target.value})}
                            disabled={patients.find(p => p.id === selectedPatientId)?.paymentMethod === 'BPJS'}
                          />
                        </div>
                        <button 
                          onClick={addBillingItem}
                          className="px-8 py-4 bg-navy text-gold rounded-2xl font-black hover:bg-navy-light transition-all uppercase tracking-widest text-xs h-[56px]"
                        >
                          Tambah
                        </button>
                      </div>
                      { (formData.billing.isBPJS || patients.find(p => p.id === selectedPatientId)?.paymentMethod === 'BPJS') && (
                        <p className="text-[10px] text-pink font-bold uppercase tracking-widest mt-3 ml-4 italic">* Pasien BPJS: Biaya otomatis Rp 0</p>
                      )}
                    </div>

                    <div className="bg-white rounded-3xl border border-navy/5 overflow-hidden shadow-xl shadow-navy/5">
                      <table className="w-full text-left">
                        <thead className="bg-navy text-pink text-[10px] uppercase tracking-[0.2em] font-black">
                          <tr>
                            <th className="px-8 py-6">Deskripsi Layanan</th>
                            <th className="px-8 py-6 text-right">Biaya (IDR)</th>
                            <th className="px-8 py-6 text-center w-20">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy/5">
                          {formData.billing.items.map((item, i) => (
                            <tr key={i} className="hover:bg-navy-50/50 transition-colors group">
                              <td className="px-8 py-6 text-sm font-bold text-navy uppercase tracking-tight">{item.name}</td>
                              <td className="px-8 py-6 text-sm font-black text-navy text-right tabular-nums">Rp {item.price.toLocaleString()}</td>
                              <td className="px-8 py-6 text-center">
                                <button 
                                  onClick={() => removeBillingItem(i)}
                                  className="p-2 text-navy/20 hover:text-pink hover:bg-pink-soft rounded-xl transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {formData.billing.items.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-8 py-12 text-center text-navy/30 font-bold italic">Belum ada item layanan dipilih</td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-pink text-white">
                          <tr>
                            <td className="px-8 py-6 font-black uppercase tracking-[0.2em] text-xs">
                              Total Tagihan Akhir
                              {(formData.billing.isBPJS || patients.find(p => p.id === selectedPatientId)?.paymentMethod === 'BPJS') && (
                                <span className="ml-3 px-2 py-1 bg-white text-pink rounded text-[8px] font-black">BPJS COVERED</span>
                              )}
                            </td>
                            <td className="px-8 py-6 text-right font-black text-2xl tracking-tighter tabular-nums">Rp {formData.billing.total.toLocaleString()}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="mt-10 flex flex-col md:flex-row justify-end gap-4">
                      <button 
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-navy border-2 border-navy/5 hover:border-pink hover:text-pink rounded-2xl font-black transition-all shadow-sm uppercase tracking-widest text-xs"
                      >
                        <Printer size={20} /> Cetak Invoice
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-3 px-10 py-4 bg-navy text-pink rounded-2xl font-black hover:bg-navy-light shadow-2xl shadow-navy/20 disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
                      >
                        {isSaving ? (
                          <RefreshCw className="animate-spin" size={20} />
                        ) : saveSuccess ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Save size={20} />
                        )}
                        {saveSuccess ? 'Berhasil Disimpan!' : 'Selesaikan & Simpan Transaksi'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-navy-50 border-t border-navy/5 flex items-center justify-between no-print">
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

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSaveProgress}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-navy/5 rounded-xl font-black text-navy/40 hover:text-pink hover:border-pink transition-all uppercase tracking-widest text-xs"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              {saveSuccess ? 'Tersimpan' : 'Simpan Progress'}
            </button>
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
    </div>
  );
};
