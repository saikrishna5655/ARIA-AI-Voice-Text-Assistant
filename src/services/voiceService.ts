import { VoiceRecognitionState } from '../types';

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private isAlwaysListening = false;
  private onResultCallback?: (transcript: string) => void;
  private onStateChangeCallback?: (state: VoiceRecognitionState) => void;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notifyStateChange();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Restart if in always listening mode
        if (this.isAlwaysListening) {
          setTimeout(() => {
            if (this.isAlwaysListening && this.recognition) {
              try {
                this.recognition.start();
              } catch (error) {
                console.log('Recognition restart failed:', error);
              }
            }
          }, 100);
        }
        this.notifyStateChange();
      };

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript.trim() && this.onResultCallback) {
          this.onResultCallback(finalTranscript.trim());
        }

        this.notifyStateChange();
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
          this.isListening = false;
        }
        this.notifyStateChange(event.error);
      };
    }
  }

  private notifyStateChange() {
    this.notifyStateChange();
  }

  private notifyStateChange(error?: string) {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isListening: this.isListening,
        isSupported: !!this.recognition,
        transcript: '',
        confidence: 0,
        isAlwaysListening: this.isAlwaysListening,
        error
      });
    }
  }

  startListening(onResult: (transcript: string) => void, onStateChange?: (state: VoiceRecognitionState) => void, alwaysListening = false) {
    if (!this.recognition) return false;

    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;
    this.isAlwaysListening = alwaysListening;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }

  stopListening() {
    this.isAlwaysListening = false;
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  speak(text: string, options: { rate?: number; pitch?: number; volume?: number } = {}) {
    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Use a more natural voice if available
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.name.includes('Samantha') ||
      voice.name.includes('Karen')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    this.synthesis.cancel();
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  getIsAlwaysListening(): boolean {
    return this.isAlwaysListening;
  }
}

export default VoiceService;