import React, { useState } from 'react';
import type { Engine, EngineState } from '../types';

interface Props {
  state: EngineState;
  engine: Engine;
}

export function FailedView({ state, engine }: Props) {
  const [animal, setAnimal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    engine.reset();
  };

  const classifications = state.classificationsSeen;
  const concepts = state.conceptsLearned;

  return (
    <section className="view view-failed">
      <h2 className="hero">No lo adiviné 🤔</h2>
      <p className="sub">{state.prompt?.text || '¿En qué animal estabas pensando?'}</p>

      {(classifications.length > 0 || concepts.length > 0) && (
        <div className="learned">
          <h3 className="learned-section">Lo que aprendiste</h3>
          {classifications.length > 0 && (
            <div>
              <p className="sub">Clases de animales que viste:</p>
              <div className="chip-row">
                {classifications.map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {concepts.length > 0 && (
            <div>
              <p className="sub">Conceptos que tocamos:</p>
              <div className="chip-row">
                {concepts.map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="failed-form">
        <input
          type="text"
          className="text-input"
          placeholder="Escribí el animal…"
          value={animal}
          onChange={(e) => setAnimal(e.target.value)}
          aria-label="Animal que pensaste"
        />
        <button type="submit" className="btn btn-primary btn-big">
          Jugar de nuevo
        </button>
      </form>
    </section>
  );
}
