import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Prompt, TreeData } from './types';
import { validateTree } from './engine/validator';
import { VoiceOutput } from './io/VoiceOutput';
import { VoiceInput } from './io/VoiceInput';
import { useEngine } from './hooks/useEngine';
import animalsTreeRaw from './data/animals.tree.json';
import { StartView } from './ui/StartView';
import { QuestionView } from './ui/QuestionView';
import { GuessView } from './ui/GuessView';
import { ExplanationView } from './ui/ExplanationView';
import { ReinforcementView } from './ui/ReinforcementView';
import { DoneView } from './ui/DoneView';
import { FailedView } from './ui/FailedView';

const animalsTree = animalsTreeRaw as unknown as TreeData;

export function App() {
  const validation = useMemo(() => validateTree(animalsTree), []);

  if (!validation.ok) {
    return (
      <main className="app app-error">
        <h1>Aku</h1>
        <h2>Error de datos</h2>
        <p>El árbol de animales tiene errores:</p>
        <ul>
          {validation.errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      </main>
    );
  }

  return <AkuApp />;
}

function AkuApp() {
  const voiceOutRef = useRef<VoiceOutput | null>(null);
  const voiceInRef = useRef<VoiceInput | null>(null);
  if (voiceOutRef.current === null) voiceOutRef.current = new VoiceOutput();
  if (voiceInRef.current === null) voiceInRef.current = new VoiceInput();
  const voiceOut = voiceOutRef.current;
  const voiceIn = voiceInRef.current;

  const { state, engine } = useEngine(animalsTree);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => voiceIn.isSupported());
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');

  const lastPromptRef = useRef<Prompt | null>(null);

  useEffect(() => {
    setExplanationText(null);
    setInterimText('');
  }, [state.prompt, state.phase]);

  useEffect(() => {
    return () => {
      setInterimText('');
    };
  }, []);

  useEffect(() => {
    const prompt = state.prompt;
    if (!prompt) return;
    if (state.phase === 'idle') return;
    if (lastPromptRef.current === prompt) return;
    lastPromptRef.current = prompt;

    let cancelled = false;

    const run = async () => {
      try {
        setIsSpeaking(true);
        await voiceOut.speak(prompt.text);
      } catch {
        /* swallow */
      } finally {
        if (!cancelled) setIsSpeaking(false);
      }
      if (cancelled) return;

      if (state.phase === 'done' || state.phase === 'failed') return;
      if (prompt.options.length === 0) return;

      if (!voiceEnabled || !voiceIn.isSupported()) return;

      try {
        setInterimText('');
        setIsListening(true);
        const value = await voiceIn.listen(prompt.options, {
          onInterim: (t) => {
            if (!cancelled) setInterimText(t);
          },
        });
        if (cancelled) return;
        if (value) engine.respond(value);
      } catch {
        /* swallow */
      } finally {
        if (!cancelled) {
          setIsListening(false);
          setInterimText('');
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      voiceOut.cancel();
      voiceIn.cancel();
      setIsSpeaking(false);
      setIsListening(false);
      setInterimText('');
    };
  }, [state.prompt, state.phase, voiceEnabled, engine, voiceOut, voiceIn]);

  const handleStart = () => {
    engine.start();
  };

  const handleToggleVoice = () => {
    setVoiceEnabled((v) => {
      if (v) {
        voiceIn.cancel();
        setIsListening(false);
        setInterimText('');
      }
      return !v;
    });
  };

  const handleExplain = () => {
    const text = engine.requestExplanation();
    if (text) {
      setExplanationText(text);
      voiceOut.cancel();
      voiceOut.speak(text).catch(() => {});
    }
  };

  const handleBack = () => {
    engine.back();
  };

  const renderView = () => {
    switch (state.phase) {
      case 'idle':
        return (
          <StartView
            onStart={handleStart}
            voiceEnabled={voiceEnabled}
            onToggleVoice={handleToggleVoice}
            voiceSupported={voiceIn.isSupported()}
          />
        );
      case 'asking':
        return (
          <QuestionView
            state={state}
            engine={engine}
            isSpeaking={isSpeaking}
            isListening={isListening}
            onExplain={handleExplain}
            explanationText={explanationText}
            interimText={interimText}
          />
        );
      case 'guessing':
        return (
          <GuessView
            state={state}
            engine={engine}
            isSpeaking={isSpeaking}
            isListening={isListening}
            interimText={interimText}
          />
        );
      case 'explaining':
        return (
          <ExplanationView
            state={state}
            engine={engine}
            isSpeaking={isSpeaking}
            isListening={isListening}
            interimText={interimText}
          />
        );
      case 'reinforcing':
        return (
          <ReinforcementView
            state={state}
            engine={engine}
            isSpeaking={isSpeaking}
            isListening={isListening}
            interimText={interimText}
          />
        );
      case 'done':
        return <DoneView state={state} engine={engine} />;
      case 'failed':
        return <FailedView state={state} engine={engine} />;
      default:
        return null;
    }
  };

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">Aku</h1>
        <div className="header-right">
          {state.phase !== 'idle' && (
            <span className="counter" aria-label="Preguntas">
              #{state.questionCount}
            </span>
          )}
          {voiceIn.isSupported() && (
            <button
              className="btn btn-icon"
              onClick={handleToggleVoice}
              aria-label={voiceEnabled ? 'Apagar micrófono' : 'Encender micrófono'}
              aria-pressed={voiceEnabled}
            >
              {voiceEnabled ? '🎤' : '🔇'}
            </button>
          )}
        </div>
      </header>

      {state.canGoBack && state.phase !== 'idle' && state.phase !== 'done' && (
        <button className="btn btn-ghost btn-back" onClick={handleBack}>
          ← Atrás
        </button>
      )}

      <div className="view-container">{renderView()}</div>
    </main>
  );
}
