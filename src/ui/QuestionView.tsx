import React from 'react';
import type { Engine, EngineState } from '../types';
import { ButtonAdapter } from '../io/ButtonAdapter';

interface Props {
  state: EngineState;
  engine: Engine;
  isSpeaking: boolean;
  isListening: boolean;
  onExplain: () => void;
  explanationText: string | null;
  interimText?: string;
}

export function QuestionView({
  state,
  engine,
  isSpeaking,
  isListening,
  onExplain,
  explanationText,
  interimText,
}: Props) {
  const prompt = state.prompt;
  if (!prompt) return null;

  return (
    <section className="view view-question">
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
      <button className="btn btn-link" onClick={onExplain}>
        ¿Por qué esta pregunta?
      </button>
      {explanationText && <p className="explanation-inline">{explanationText}</p>}
    </section>
  );
}
