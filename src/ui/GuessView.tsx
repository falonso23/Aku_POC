import React from 'react';
import type { Engine, EngineState } from '../types';
import { ButtonAdapter } from '../io/ButtonAdapter';

interface Props {
  state: EngineState;
  engine: Engine;
  isSpeaking: boolean;
  isListening: boolean;
  interimText?: string;
}

export function GuessView({ state, engine, isSpeaking, isListening, interimText }: Props) {
  const prompt = state.prompt;
  if (!prompt) return null;

  return (
    <section className="view view-guess">
      <div className="chips">
        {isSpeaking && <span className="chip chip-speak">🔊 Hablando</span>}
        {isListening && <span className="chip chip-listen">🎤 Escuchando</span>}
      </div>
      {isListening && interimText && (
        <div className="transcript" aria-live="polite">
          "{interimText}"
        </div>
      )}
      <h2 className="question">{prompt.text}</h2>
      <ButtonAdapter
        options={prompt.options}
        onSelect={(v) => engine.respond(v)}
        disabled={isSpeaking}
      />
    </section>
  );
}
