// Tipe data & default values standar Lampiran Kartu Askesgilut (Revisi 11-10-2022)

export interface AnamnesisData {
  chiefComplaint: {
    mainReason: string;
    additionalComplaint: string;
    painLocation: string;
    painDuration: string;
    painCharacteristics: string[];
  };
  medicalHistory: {
    isHealthy: boolean;
    healthComplaint: string;
    underDoctorCare: {
      had: boolean;
      details: string;
    };
    seriousIllness: string;
    bloodClotting: string;
    systemicDiseases: {
      heart: boolean;
      hypertension: boolean;
      diabetes: boolean;
      hepatitis: boolean;
      asthma: boolean;
      kidney: boolean;
      bloodClotting: boolean;
      gastritis: boolean;
      others: string;
    };
    allergies: {
      food: string;
      drugs: string;
      anesthesia: string;
      weather: string;
      others: string;
    };
    pregnancy: {
      isPregnant: boolean;
      trimester: string;
      isBreastfeeding: boolean;
    };
    others: string;
  };
  socialHistory?: string;
  dentalHistory: {
    reason: string;
    hadPreviousTreatment: boolean;
    lastVisit: string;
    previousTreatments: string[];
    previousComplications: { had: boolean; details: string };
    symptoms: string[];
    whatToKnow?: string[];
    xrayHistory?: { had: boolean; type: string };
    previousVisitOpinion?: string;
    oralHealthOpinion?: string;
    grindingHabits?: { had: boolean; biteGuard: boolean };
    appearanceConcerns?: string[];
    injuryHistory?: { had: boolean; details: string };
  };
  maintenance: {
    brushingFrequency: { day: number; week: number };
    brushingTimes: string[];
    brushingTechnique: string;
    toothbrushType: string;
    brushReplacement: string;
    tools: string[];
    toothpasteFeatures: string[];
    brushingTime: number;
    chewingSide: string;
    chewingReason: string;
    diet: {
      sweetSnacks: string;
      fibrousFruits: string;
      coffeeTeaSoda: string;
    };
    badHabits: string[];
    smokingCount: string;
  };
  snacks?: { name: string; frequency: string }[];
  beliefs?: {
    cavityRisk: string;
    preventionImportance: string;
    maintenanceConfidence: string;
    healthBelief: string;
  };
  pharmacological?: {
    currentMeds: { had: boolean; details: string; purpose: string };
    sideEffects: string;
    positiveEffect: string;
    dosageIssues: { had: boolean; details: string };
    regularConsumption: { had: boolean };
  };
}

export interface ClinicalData {
  vitalSigns: {
    bloodPressure: string;
    pulse: number;
    pulseRhythm: string;
    respiration: number;
    temperature: string;
    consciousness: string;
    weight: string;
    height: string;
  };
  extraOral: {
    faceSymmetry: string;
    faceSymmetryNote: string;
    faceProfile: string;
    skin: string;
    skinNote: string;
    neck?: string;
    vermilion?: string;
    lips: string;
    lipsNote: string;
    lymphNodes: {
      submandibularRight: { palpable: boolean; tender: boolean; consistency: string };
      submandibularLeft: { palpable: boolean; tender: boolean; consistency: string };
      submental: { palpable: boolean; tender: boolean };
      cervical: { palpable: boolean; tender: boolean };
    };
    salivaryGlands: {
      parotid: string;
      submandibular: string;
    };
    tmj: {
      clicking: boolean;
      clickingSide: string;
      pain: boolean;
      deviation: boolean;
      deviationSide: string;
      trismus: string;
    };
    parotid?: string;
    others: string;
  };
  intraOral: {
    labialMucosa: string;
    labialMucosaNote: string;
    buccalMucosa: string;
    buccalMucosaNote: string;
    labialVestibules?: string;
    vestibule: string;
    floorOfMouth: string;
    floorOfMouthNote: string;
    tongue: {
      dorsum: string;
      ventralLateral: string;
      mobility: string;
    };
    palate: {
      durum: string;
      molle: string;
    };
    pharynx: {
      tonsils: string;
      uvula: string;
      pharyngealWall: string;
    };
    gingiva: {
      color: string;
      contour: string;
      consistency: string;
      bop: boolean;
      surface: string;
    };
    frenulum: {
      labialisSuperior: string;
      labialisInferior: string;
      lingualis: string;
    };
    saliva: {
      quantity: string;
      consistency: string;
    };
    oralHygieneOverall: string;
    anomalies: string[];
    intraOralNotes: string;
    uvula?: string;
    tonsils?: string;
    pharyngealWall?: string;
    others: string;
  };
  ohis?: any;
}

export const DEFAULT_ANAMNESIS: AnamnesisData = {
  chiefComplaint: {
    mainReason: '',
    additionalComplaint: '',
    painLocation: '',
    painDuration: '',
    painCharacteristics: [],
  },
  medicalHistory: {
    isHealthy: true,
    healthComplaint: '',
    underDoctorCare: {
      had: false,
      details: '',
    },
    seriousIllness: '',
    bloodClotting: '',
    systemicDiseases: {
      heart: false,
      hypertension: false,
      diabetes: false,
      hepatitis: false,
      asthma: false,
      kidney: false,
      bloodClotting: false,
      gastritis: false,
      others: '',
    },
    allergies: {
      food: '',
      drugs: '',
      anesthesia: '',
      weather: '',
      others: '',
    },
    pregnancy: {
      isPregnant: false,
      trimester: '',
      isBreastfeeding: false,
    },
    others: '',
  },
  socialHistory: '',
  dentalHistory: {
    reason: '',
    hadPreviousTreatment: false,
    lastVisit: '',
    previousTreatments: [],
    previousComplications: { had: false, details: '' },
    symptoms: [],
    whatToKnow: [],
    xrayHistory: { had: false, type: '' },
    previousVisitOpinion: '',
    oralHealthOpinion: '',
    grindingHabits: { had: false, biteGuard: false },
    appearanceConcerns: [],
    injuryHistory: { had: false, details: '' },
  },
  maintenance: {
    brushingFrequency: { day: 2, week: 14 },
    brushingTimes: ['Pagi saat mandi', 'Malam sebelum tidur'],
    brushingTechnique: 'Kombinasi / Memutar',
    toothbrushType: 'Bulu Lembut (Soft)',
    brushReplacement: '1-3 Bulan sekali',
    tools: ['Sikat Gigi Manual'],
    toothpasteFeatures: ['Mengandung Fluoride'],
    brushingTime: 2,
    chewingSide: 'Dua sisi seimbang',
    chewingReason: '',
    diet: {
      sweetSnacks: 'Kadang-kadang',
      fibrousFruits: 'Kadang-kadang',
      coffeeTeaSoda: 'Kadang-kadang',
    },
    badHabits: ['Tidak ada'],
    smokingCount: '',
  },
  snacks: [],
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
  },
};

export const DEFAULT_CLINICAL: ClinicalData = {
  vitalSigns: {
    bloodPressure: '120/80',
    pulse: 80,
    pulseRhythm: 'Teratur',
    respiration: 18,
    temperature: '36.5',
    consciousness: 'Compos Mentis',
    weight: '',
    height: '',
  },
  extraOral: {
    faceSymmetry: 'Simetris',
    faceSymmetryNote: '',
    faceProfile: 'Lurus',
    skin: 'Normal',
    skinNote: '',
    neck: 'Normal',
    vermilion: 'Normal',
    lips: 'Normal',
    lipsNote: '',
    lymphNodes: {
      submandibularRight: { palpable: false, tender: false, consistency: 'Normal' },
      submandibularLeft: { palpable: false, tender: false, consistency: 'Normal' },
      submental: { palpable: false, tender: false },
      cervical: { palpable: false, tender: false },
    },
    salivaryGlands: {
      parotid: 'Normal',
      submandibular: 'Normal',
    },
    tmj: {
      clicking: false,
      clickingSide: 'Tidak Ada',
      pain: false,
      deviation: false,
      deviationSide: 'Tidak Ada',
      trismus: 'Normal (≥ 3 jari)',
    },
    parotid: 'Normal',
    others: '',
  },
  intraOral: {
    labialMucosa: 'Normal',
    labialMucosaNote: '',
    buccalMucosa: 'Normal',
    buccalMucosaNote: '',
    labialVestibules: 'Normal',
    vestibule: 'Normal / Dalam',
    floorOfMouth: 'Normal',
    floorOfMouthNote: '',
    tongue: {
      dorsum: 'Normal',
      ventralLateral: 'Normal',
      mobility: 'Normal (Bebas)',
    },
    palate: {
      durum: 'Normal',
      molle: 'Normal',
    },
    pharynx: {
      tonsils: 'Normal (T0/T1)',
      uvula: 'Normal (Simetris)',
      pharyngealWall: 'Normal',
    },
    gingiva: {
      color: 'Coral Pink / Merah Muda (Normal)',
      contour: 'Scalloped / Runcing (Normal)',
      consistency: 'Kenyal / Firm (Normal)',
      bop: false,
      surface: 'Stippling (Normal)',
    },
    frenulum: {
      labialisSuperior: 'Normal',
      labialisInferior: 'Normal',
      lingualis: 'Normal',
    },
    saliva: {
      quantity: 'Normal',
      consistency: 'Encer (Serous)',
    },
    oralHygieneOverall: 'Sedang',
    anomalies: ['Tidak Ada Kelainan'],
    intraOralNotes: '',
    uvula: 'Normal',
    tonsils: 'Normal',
    pharyngealWall: 'Normal',
    others: '',
  },
};
