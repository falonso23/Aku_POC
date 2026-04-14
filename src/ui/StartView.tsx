import React from 'react';

interface Props {
  onStart: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  voiceSupported: boolean;
}

export function StartView({ onStart, voiceEnabled, onToggleVoice, voiceSupported }: Props) {
  return (
    <section className="view view-start">
      <h2 className="hero">Pensá en un animal y yo trataré de adivinarlo.</h2>
      <p className="sub">Voy a hacerte preguntas. Respondé con tu voz o con los botones.</p>
      <button className="btn btn-primary btn-big" onClick={onStart}>
        Empezar
      </button>
      {voiceSupported && (
        <button className="btn btn-ghost" onClick={onToggleVoice}>
          {voiceEnabled ? 'Voz activada 🎤' : 'Voz desactivada 🔇'}
        </button>
      )}
    </section>
  );
}
