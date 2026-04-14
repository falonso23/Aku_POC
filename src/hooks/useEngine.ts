import { useEffect, useRef, useState } from 'react';
import { DeductionEngine } from '../engine/DeductionEngine';
import type { Engine, EngineState, TreeData } from '../types';

export function useEngine(tree: TreeData): { state: EngineState; engine: Engine } {
  const engineRef = useRef<Engine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = new DeductionEngine(tree);
  }
  const engine = engineRef.current;

  const [state, setState] = useState<EngineState>(() => engine.getState());

  useEffect(() => {
    const unsubscribe = engine.subscribe((s) => setState(s));
    setState(engine.getState());
    return () => {
      unsubscribe();
    };
  }, [engine]);

  return { state, engine };
}
