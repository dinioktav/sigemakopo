import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { speakText, stopSpeech, isSpeechSynthesisSupported } from '../lib/speech';

interface TextToSpeechButtonProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  rate?: number;
}

export const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({
  text,
  size = 'sm',
  className = '',
  label,
  rate = 1.0
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(isSpeechSynthesisSupported());
    return () => {
      stopSpeech();
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!text || text.trim() === '') {
      return;
    }

    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      speakText(text, {
        rate,
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false)
      });
    }
  };

  if (!isSupported || !text || text.trim() === '') {
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
    <button
      type="button"
      onClick={handleToggle}
      title={isPlaying ? 'Hentikan pembacaan suara' : 'Dengarkan pembacaan teks ini (Text to Speech)'}
      className={`rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
        isPlaying 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse ring-2 ring-emerald-300' 
          : 'bg-navy-50/70 hover:bg-emerald-50 hover:text-emerald-700 text-navy/60 border border-navy/10'
      } ${sizeClasses} ${className}`}
    >
      {isPlaying ? (
        <>
          <VolumeX size={iconSizes} />
          {label && <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>}
        </>
      ) : (
        <>
          <Volume2 size={iconSizes} />
          {label && <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>}
        </>
      )}
    </button>
  );
};
