import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  CornerDownLeft, 
  RotateCcw,
  AudioWaveform as Waveform
} from 'lucide-react';
import { isSpeechRecognitionSupported, isSpeechSynthesisSupported, speakText, stopSpeech, playAudioCue } from '../lib/speech';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText?: (text: string, targetField?: string) => void;
}

const TARGET_FIELDS = [
  { id: 'keluhan', label: 'Keluhan / Alasan Kunjungan' },
  { id: 'riwayat', label: 'Riwayat Kesehatan' },
  { id: 'diagnosa_penyebab', label: 'Diagnosa: Penyebab' },
  { id: 'diagnosa_gejala', label: 'Diagnosa: Gejala' },
  { id: 'tujuan', label: 'Rencana: Tujuan Klien' },
  { id: 'intervensi', label: 'Rencana: Intervensi' },
  { id: 'evaluasi', label: 'Evaluasi Askesgilut' },
  { id: 'rekomendasi', label: 'Rekomendasi / Kontrol' }
];

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onInsertText
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string>('keluhan');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopSpeech();
      setIsListening(false);
      setIsPlayingTTS(false);
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Pengenalan suara (Speech to Text) tidak didukung pada browser ini. Harap gunakan Google Chrome atau Edge.');
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onstart = () => {
        setIsListening(true);
        playAudioCue('start');
      };

      recognition.onresult = (event: any) => {
        let full = '';
        for (let i = 0; i < event.results.length; i++) {
          full += event.results[i][0].transcript;
        }
        setTranscript(full.trim());
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error:', event);
        playAudioCue('error');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        playAudioCue('stop');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleToggleTTS = () => {
    if (!transcript) return;
    if (isPlayingTTS) {
      stopSpeech();
      setIsPlayingTTS(false);
    } else {
      speakText(transcript, {
        onStart: () => setIsPlayingTTS(true),
        onEnd: () => setIsPlayingTTS(false),
        onError: () => setIsPlayingTTS(false)
      });
    }
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (!transcript) return;
    if (onInsertText) {
      onInsertText(transcript, selectedTarget);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-navy/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-navy/10 flex items-center justify-between bg-navy-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-2xl shadow-md shadow-purple-500/20">
              <Mic size={20} className={isListening ? 'animate-bounce' : ''} />
            </div>
            <div>
              <h3 className="text-base font-black text-navy uppercase tracking-wide">
                Dikte Suara & Asisten Bicara
              </h3>
              <p className="text-xs text-navy/50 font-medium">
                Bicara langsung ke mikrofon untuk mengisi data sistem SIGEMA
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-navy/40 hover:text-navy hover:bg-navy/5 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Visualizer and Dictation Trigger */}
          <div className="bg-navy-50/70 p-6 rounded-2xl border border-navy/5 text-center flex flex-col items-center justify-center space-y-4">
            <button
              type="button"
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200 shadow-rose-500/40' 
                  : 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-purple-500/30 hover:scale-105'
              }`}
            >
              {isListening ? <Mic size={34} className="animate-bounce" /> : <Mic size={34} />}
            </button>

            <div className="text-center">
              <p className="text-sm font-black text-navy uppercase tracking-wider">
                {isListening ? 'Sedang Mendengarkan Suara Anda...' : 'Klik Mikrofon Untuk Mulai Bicara'}
              </p>
              <p className="text-xs text-navy/50 mt-0.5">
                Bahasa Indonesia (id-ID) • Dikte medis & keluhan pasien
              </p>
            </div>

            {isListening && (
              <div className="flex items-center justify-center gap-1.5 h-6">
                <span className="w-1.5 h-3 bg-pink rounded-full animate-pulse"></span>
                <span className="w-1.5 h-6 bg-pink rounded-full animate-pulse delay-75"></span>
                <span className="w-1.5 h-4 bg-pink rounded-full animate-pulse delay-150"></span>
                <span className="w-1.5 h-7 bg-pink rounded-full animate-pulse delay-100"></span>
                <span className="w-1.5 h-3 bg-pink rounded-full animate-pulse delay-200"></span>
              </div>
            )}
          </div>

          {/* Transcribed text display & edit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-navy/50 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={13} className="text-pink" />
                Hasil Transkripsi Suara (Dapat diedit)
              </label>
              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="text-xs text-navy/40 hover:text-danger flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <textarea
              className="w-full p-4 bg-white border-2 border-navy/10 focus:border-pink focus:ring-0 rounded-2xl text-sm font-medium text-navy min-h-[110px] resize-y shadow-inner leading-relaxed"
              placeholder="Contoh: Pasien mengeluhkan gigi geraham kanan bawah ngilu saat minum es, sudah berlangsung selama tiga hari..."
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
            />
          </div>

          {/* Text to speech preview button */}
          <div className="flex items-center justify-between gap-3 bg-navy-50/50 p-3 rounded-2xl border border-navy/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleTTS}
                disabled={!transcript}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  isPlayingTTS
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : 'bg-white text-navy hover:bg-emerald-50 hover:text-emerald-700 border border-navy/10 disabled:opacity-40'
                }`}
              >
                {isPlayingTTS ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isPlayingTTS ? 'Stop Suara' : 'Dengarkan (TTS)'}</span>
              </button>
              <span className="text-[11px] text-navy/40 font-medium">Uji suara hasil rekaman</span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!transcript}
              className="px-3 py-1.5 bg-white text-navy/60 hover:text-navy border border-navy/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
          </div>

          {/* Destination Target Selector (if onInsertText provided) */}
          {onInsertText && (
            <div className="space-y-2 pt-2 border-t border-navy/10">
              <label className="text-[11px] font-black text-navy/50 uppercase tracking-widest block">
                Pilih Kolom Tujuan Masuk ke Sistem:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TARGET_FIELDS.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedTarget(f.id)}
                    className={`px-3 py-2 text-left rounded-xl text-xs font-bold transition-all border ${
                      selectedTarget === f.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-white text-navy/70 border-navy/10 hover:border-pink/40 hover:bg-pink/5'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-navy/10 bg-navy-50/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-navy/60 hover:text-navy text-xs uppercase tracking-wider"
          >
            Tutup
          </button>

          {onInsertText && (
            <button
              type="button"
              onClick={handleInsert}
              disabled={!transcript}
              className="px-6 py-2.5 bg-pink hover:bg-pink-dark text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-pink/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CornerDownLeft size={14} />
              <span>Masuk ke Kolom Form</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
