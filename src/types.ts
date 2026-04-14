// Shared contract between engine, IO adapters and UI.

export type Response = 'yes' | 'no' | 'sometimes' | 'unknown';

export type Phase =
  | 'idle'
  | 'asking'
  | 'guessing'
  | 'explaining'
  | 'reinforcing'
  | 'failed'
  | 'done';

export interface QuestionNode {
  id: string;
  type: 'question';
  text: string;
  concept: string;
  explanation: string;
  routes: {
    yes: string;
    no: string;
    sometimes?: string;
    unknown?: string;
  };
}

export interface AnswerNode {
  id: string;
  type: 'answer';
  animal: string;
  classification: string;
  confidenceQuestion: string;
  reasoning: string;
  misconceptionCorrection?: string;
  reinforcement: {
    question: string;
    fact: string;
    extraFact?: string;
  };
  funFacts?: string[];
  fallback?: string;
}

export type TreeNode = QuestionNode | AnswerNode;

export interface TreeData {
  root: string;
  nodes: Record<string, TreeNode>;
}

export interface PromptOption {
  value: string;
  label: string;
  synonyms: string[];
  hotkey?: string;
}

export interface Prompt {
  kind: 'question' | 'confirm' | 'explain' | 'reinforce' | 'failed';
  text: string;
  options: PromptOption[];
}

export interface EngineState {
  phase: Phase;
  prompt: Prompt | null;
  currentNode: TreeNode | null;
  guess: AnswerNode | null;
  canGoBack: boolean;
  questionCount: number;
  conceptsLearned: string[];
  classificationsSeen: string[];
}

export interface Engine {
  getState(): EngineState;
  subscribe(cb: (s: EngineState) => void): () => void;
  start(): void;
  respond(value: string): void;
  back(): void;
  reset(): void;
  requestExplanation(): string | null;
}

export interface OutputAdapter {
  speak(text: string): Promise<void>;
  cancel(): void;
  isSupported(): boolean;
}

export interface ListenOptions {
  timeoutMs?: number;
  onInterim?: (text: string) => void;
}

export interface InputAdapter {
  listen(
    options: PromptOption[],
    opts?: ListenOptions
  ): Promise<string | null>;
  cancel(): void;
  isSupported(): boolean;
}
