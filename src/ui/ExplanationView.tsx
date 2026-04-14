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

export function ExplanationView({ state, engine, isSpeaking, isListening, interimText }: Props) {
  const guess = state.guess;
  const prompt = state.prompt;

  return (
    <section className="view view-explain">
      <div className="chips">
        {isSpeaking && <span className="chip chip-speak">🔊 Hablando</span>}
        {isListening && <span className="chip chip-listen">🎤 Escuchando</span>}
      </div>
      {isListening && interimText && (
        <div className="transcript" aria-live="polite">
          "{interimText}"
        </div>
      )}
      {guess && (
        <>
          <h2 className="hero">{guess.animal}</h2>
          <p className="reasoning">{guess.reasoning}</p>
          {guess.misconceptionCorrection && (
            <p className="misconception">💡 {guess.misconceptionCorrection}</p>
          )}
        </>
      )}
      {prompt && prompt.options.length > 0 ? (
        <ButtonAdapter
          options={prompt.options}
          onSelect={(v) => engine.respond(v)}
          disabled={isSpeaking}
        />
      ) : (
        <button
          className="btn btn-primary"
          onClick={() => engine.respond('next')}
          disabled={isSpeaking}
        >
          Siguiente
        </button>
      )}
    </section>
  );
}
