import React from 'react';
import type { Engine, EngineState } from '../types';

interface Props {
  state: EngineState;
  engine: Engine;
}

export function DoneView({ state, engine }: Props) {
  const guess = state.guess;
  const extraFact = guess?.reinforcement.extraFact;
  const funFacts = guess?.funFacts ?? [];
  const classifications = state.classificationsSeen;
  const concepts = state.conceptsLearned;

  return (
    <section className="view view-done">
      <h2 className="hero">🎉 ¡Lo adiviné!</h2>
      {state.prompt?.text && <p className="fact">{state.prompt.text}</p>}

      {extraFact && <p className="fact">¿Sabías además que... {extraFact}</p>}

      {funFacts.length > 0 && (
        <div>
          <h3 className="learned-section">Más curiosidades</h3>
          <ul className="fun-facts">
            {funFacts.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

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

      <button className="btn btn-primary btn-big" onClick={() => engine.reset()}>
        Jugar de nuevo
      </button>
    </section>
  );
}
