import type { InputAdapter, ListenOptions, PromptOption } from '../types';
import { matchOption } from './synonyms';

type SRConstructor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((ev: any) => void) | null;
  onerror: ((ev: unknown) => void) | null;
  onend: (() => void) | null;
  onnomatch: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

function getCtor(): SRConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as
    | SRConstructor
    | null;
}

export class VoiceInput implements InputAdapter {
  private active: SpeechRecognitionLike | null = null;

  isSupported(): boolean {
    return getCtor() !== null;
  }

  listen(
    options: PromptOption[],
    opts: ListenOptions = {}
  ): Promise<string | null> {
    const Ctor = getCtor();
    if (!Ctor) return Promise.resolve(null);

    const timeoutMs = opts.timeoutMs ?? 6000;
    const onInterim = opts.onInterim;

    return new Promise<string | null>((resolve) => {
      const rec = new Ctor();
      rec.lang = 'es-ES';
      try {
        rec.interimResults = true;
      } catch {
        /* some browsers may throw on unsupported property */
      }
      rec.maxAlternatives = 3;
      rec.continuous = false;

      this.active = rec;
      let settled = false;
      const finish = (value: string | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try {
          rec.abort();
        } catch {
          /* noop */
        }
        if (this.active === rec) this.active = null;
        resolve(value);
      };

      const timer = setTimeout(() => finish(null), timeoutMs);

      rec.onresult = (ev: any) => {
        if (settled) return;
        const results = ev.results;
        if (!results) return;

        const startIdx = typeof ev.resultIndex === 'number' ? ev.resultIndex : 0;
        let interimAccum = '';

        for (let i = startIdx; i < results.length; i++) {
          const res = results[i];
          if (!res) continue;
          for (let j = 0; j < res.length; j++) {
            const alt = res[j];
            if (!alt) continue;
            const match = matchOption(alt.transcript, options);
            if (match) return finish(match);
          }
          const first = res[0];
          if (first && first.transcript) interimAccum += first.transcript;
        }

        if (onInterim && this.active === rec && interimAccum) {
          onInterim(interimAccum);
        }
      };
      rec.onnomatch = () => finish(null);
      rec.onerror = () => finish(null);
      rec.onend = () => finish(null);

      try {
        rec.start();
      } catch {
        // Some browsers throw InvalidStateError if start is called twice
        finish(null);
      }
    });
  }

  cancel(): void {
    if (!this.active) return;
    try {
      this.active.abort();
    } catch {
      /* noop */
    }
    this.active = null;
  }
}
