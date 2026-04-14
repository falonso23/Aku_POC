import type { OutputAdapter } from '../types';

export class VoiceOutput implements OutputAdapter {
  private current: SpeechSynthesisUtterance | null = null;

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private cachedVoice: SpeechSynthesisVoice | null = null;

  private pickVoice(): SpeechSynthesisVoice | null {
    if (this.cachedVoice) return this.cachedVoice;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const esVoices = voices.filter((v) =>
      v.lang.toLowerCase().startsWith('es')
    );
    if (esVoices.length === 0) {
      this.cachedVoice = voices[0] || null;
      return this.cachedVoice;
    }

    // Preferred premium/neural voices across platforms
    const preferredNames = [
      'Google español',
      'Google español de Estados Unidos',
      'Microsoft Elvira Online',
      'Microsoft Dalia Online',
      'Microsoft Helena Online',
      'Microsoft Sabina Online',
      'Microsoft Alvaro Online',
      'Microsoft Jorge Online',
      'Mónica',
      'Paulina',
      'Jorge',
      'Diego',
    ];
    for (const name of preferredNames) {
      const n = name.toLowerCase();
      const found = esVoices.find(
        (v) => v.name === name || v.name.toLowerCase().includes(n)
      );
      if (found) {
        this.cachedVoice = found;
        return found;
      }
    }

    // Heuristic: prefer voices that look neural/online/natural
    const neural = esVoices.find((v) =>
      /(neural|online|natural|enhanced|premium)/i.test(v.name)
    );
    if (neural) {
      this.cachedVoice = neural;
      return neural;
    }

    const esES = esVoices.find((v) => v.lang.toLowerCase() === 'es-es');
    this.cachedVoice = esES || esVoices[0] || null;
    return this.cachedVoice;
  }

  private waitForVoices(timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
      if (window.speechSynthesis.getVoices().length > 0) {
        resolve();
        return;
      }
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.speechSynthesis.removeEventListener(
          'voiceschanged',
          finish as EventListener
        );
        resolve();
      };
      window.speechSynthesis.addEventListener(
        'voiceschanged',
        finish as EventListener
      );
      setTimeout(finish, timeoutMs);
    });
  }

  async speak(text: string): Promise<void> {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();

    if (window.speechSynthesis.getVoices().length === 0) {
      await this.waitForVoices(500);
    }

    return new Promise<void>((resolve, reject) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-ES';
      utter.rate = 0.95;
      utter.pitch = 1.05;
      utter.volume = 1.0;
      const voice = this.pickVoice();
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      }
      utter.onend = () => {
        this.current = null;
        resolve();
      };
      utter.onerror = (e) => {
        this.current = null;
        // 'canceled'/'interrupted' happen on cancel(); treat as resolve
        if (e.error === 'canceled' || e.error === 'interrupted') {
          resolve();
        } else {
          reject(new Error(e.error || 'speech synthesis error'));
        }
      };
      this.current = utter;
      window.speechSynthesis.speak(utter);
    });
  }

  cancel(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.current = null;
  }
}
