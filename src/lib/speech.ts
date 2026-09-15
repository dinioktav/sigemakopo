// Utility for Web Speech Recognition (Speech-to-Text) and Speech Synthesis (Text-to-Speech)

export interface SpeechRecognitionHookOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

// Audio cue sound using Web Audio API
export const playAudioCue = (type: 'start' | 'stop' | 'error') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'start') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'stop') {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      osc.frequency.setValueAtTime(280, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // AudioContext may fail if blocked by policy
  }
};

export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

// Text-To-Speech (Membacakan teks bahasa Indonesia)
export const speakText = (
  text: string, 
  options: {
    lang?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
) => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported');
    options.onError?.('Fitur Text-to-Speech tidak didukung di peramban ini.');
    return;
  }

  window.speechSynthesis.cancel();

  if (!text || text.trim() === '') {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || 'id-ID';
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;

  // Try to find Indonesian voice
  const voices = window.speechSynthesis.getVoices();
  const indonesianVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id'));
  if (indonesianVoice) {
    utterance.voice = indonesianVoice;
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    options.onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

// Speech Recognition Instance Creator
export class SpeechToTextController {
  private recognition: any = null;
  public isListening: boolean = false;
  private lang: string = 'id-ID';
  private onResultCallback?: (text: string, isFinal: boolean) => void;
  private onErrorCallback?: (err: string) => void;
  private onEndCallback?: () => void;
  private onStartCallback?: () => void;

  constructor(lang: string = 'id-ID') {
    this.lang = lang;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;

      this.recognition.onstart = () => {
        this.isListening = true;
        playAudioCue('start');
        this.onStartCallback?.();
      };

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText && this.onResultCallback) {
          this.onResultCallback(currentText, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        let message = 'Terjadi kesalahan pada mikrofon';
        if (event.error === 'not-allowed') {
          message = 'Izin mikrofon ditolak. Mohon aktifkan izin mikrofon di browser.';
        } else if (event.error === 'no-speech') {
          message = 'Tidak ada suara yang terdeteksi.';
        } else if (event.error === 'network') {
          message = 'Kendala jaringan untuk pengenalan suara.';
        }
        playAudioCue('error');
        this.onErrorCallback?.(message);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        playAudioCue('stop');
        this.onEndCallback?.();
      };
    }
  }

  public setCallbacks(callbacks: {
    onStart?: () => void;
    onResult?: (text: string, isFinal: boolean) => void;
    onError?: (err: string) => void;
    onEnd?: () => void;
  }) {
    this.onStartCallback = callbacks.onStart;
    this.onResultCallback = callbacks.onResult;
    this.onErrorCallback = callbacks.onError;
    this.onEndCallback = callbacks.onEnd;
  }

  public start() {
    if (!this.recognition) {
      this.onErrorCallback?.('Speech recognition tidak didukung di browser ini.');
      return;
    }
    try {
      this.recognition.start();
    } catch {
      // If already started, ignore
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }
}
