import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { isSpeechRecognitionSupported, playAudioCue } from '../lib/speech';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  currentValue?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  lang?: string;
  appendMode?: boolean; // If true, appends to currentValue with a space
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  currentValue = '',
  size = 'sm',
  className = '',
  lang = 'id-ID',
  appendMode = true
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const baseValueRef = useRef<string>('');

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const startListening = () => {
    if (!isSupported) {
      alert('Fitur pengenalan suara tidak didukung oleh browser ini. Gunakan Google Chrome atau Edge.');
      return;
    }

    baseValueRef.current = currentValue;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorNotice(null);
        playAudioCue('start');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        const trimmed = transcript.trim();
        if (trimmed) {
          if (appendMode && baseValueRef.current) {
            onTranscript(`${baseValueRef.current} ${trimmed}`);
          } else {
            onTranscript(trimmed);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setErrorNotice('Izin mikrofon belum aktif');
        } else if (event.error !== 'no-speech') {
          setErrorNotice('Gagal mendeteksi suara');
        }
        playAudioCue('error');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        playAudioCue('stop');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  }[size];

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  }[size];

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? 'Klik untuk berhenti merekam suara' : 'Bicara sekarang (Dikte Suara Otomatis)'}
        className={`rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
          isListening 
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse ring-2 ring-rose-300' 
            : 'bg-navy-50/70 hover:bg-pink/15 text-navy/60 hover:text-pink border border-navy/10'
        } ${sizeClasses} ${className}`}
      >
        {isListening ? (
          <>
            <Mic size={iconSizes} className="animate-bounce" />
            {size !== 'sm' && <span className="text-[11px] font-black uppercase tracking-wider">Mendengarkan...</span>}
          </>
        ) : (
          <Mic size={iconSizes} />
        )}
      </button>

      {errorNotice && (
        <span className="absolute -top-7 left-0 whitespace-nowrap bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-50">
          {errorNotice}
        </span>
      )}
    </div>
  );
};
