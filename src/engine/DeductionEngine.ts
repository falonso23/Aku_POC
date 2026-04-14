import type {
  Engine,
  EngineState,
  TreeData,
  TreeNode,
  QuestionNode,
  AnswerNode,
  Prompt,
  PromptOption,
  Phase,
} from '../types';

const OPTION_YES: PromptOption = {
  value: 'yes',
  label: 'Sí',
  hotkey: '1',
  synonyms: ['sí', 'si', 'claro', 'obvio', 'afirmativo', 'correcto', 'dale'],
};
const OPTION_NO: PromptOption = {
  value: 'no',
  label: 'No',
  hotkey: '2',
  synonyms: ['no', 'nop', 'negativo', 'para nada'],
};
const OPTION_SOMETIMES: PromptOption = {
  value: 'sometimes',
  label: 'A veces',
  hotkey: '3',
  synonyms: ['a veces', 'depende', 'puede', 'aveces'],
};
const OPTION_UNKNOWN: PromptOption = {
  value: 'unknown',
  label: 'No sé',
  hotkey: '4',
  synonyms: ['no sé', 'no se', 'ni idea', 'no estoy seguro', 'no lo sé'],
};
const OPTION_NEXT: PromptOption = {
  value: 'next',
  label: 'Siguiente',
  hotkey: '1',
  synonyms: ['siguiente', 'continuar', 'ok', 'next'],
};
const OPTION_RESTART: PromptOption = {
  value: 'restart',
  label: 'Jugar de nuevo',
  hotkey: '1',
  synonyms: ['jugar de nuevo', 'reiniciar', 'otra vez', 'de nuevo', 'restart'],
};

export class DeductionEngine implements Engine {
  private tree: TreeData;
  private state: EngineState;
  private history: string[] = [];
  private listeners: Array<(s: EngineState) => void> = [];

  constructor(tree: TreeData) {
    this.tree = tree;
    this.state = {
      phase: 'idle',
      prompt: null,
      currentNode: null,
      guess: null,
      canGoBack: false,
      questionCount: 0,
      conceptsLearned: [],
      classificationsSeen: [],
    };
  }

  getState(): EngineState {
    return this.state;
  }

  subscribe(cb: (s: EngineState) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  start(): void {
    const root = this.tree.nodes[this.tree.root];
    if (!root || root.type !== 'question') {
      this.setState({ phase: 'failed', prompt: this.failedPrompt(), currentNode: null });
      return;
    }
    this.history = [];
    this.setState({
      phase: 'asking',
      currentNode: root,
      prompt: this.questionPrompt(root),
      guess: null,
      canGoBack: false,
      questionCount: 1,
      conceptsLearned: [],
      classificationsSeen: [],
    });
  }

  respond(value: string): void {
    switch (this.state.phase) {
      case 'asking':
        this.handleAsking(value);
        break;
      case 'guessing':
        this.handleGuessing(value);
        break;
      case 'explaining':
        this.handleExplaining(value);
        break;
      case 'reinforcing':
        this.handleReinforcing(value);
        break;
      case 'done':
      case 'failed':
        if (value === 'restart') this.reset();
        break;
      default:
        break;
    }
  }

  back(): void {
    if (!this.canGoBack()) return;
    if (this.state.phase === 'guessing') {
      const prevId = this.history.pop();
      if (!prevId) return;
      const prev = this.tree.nodes[prevId];
      if (!prev || prev.type !== 'question') return;
      const { conceptsLearned, classificationsSeen } = this.recomputeLearned();
      this.setState({
        phase: 'asking',
        currentNode: prev,
        prompt: this.questionPrompt(prev),
        guess: null,
        canGoBack: this.history.length > 0,
        questionCount: Math.max(1, this.state.questionCount - 1),
        conceptsLearned,
        classificationsSeen,
      });
      return;
    }
    if (this.state.phase === 'asking') {
      const prevId = this.history.pop();
      if (!prevId) return;
      const prev = this.tree.nodes[prevId];
      if (!prev || prev.type !== 'question') return;
      const { conceptsLearned, classificationsSeen } = this.recomputeLearned();
      this.setState({
        phase: 'asking',
        currentNode: prev,
        prompt: this.questionPrompt(prev),
        canGoBack: this.history.length > 0,
        questionCount: Math.max(1, this.state.questionCount - 1),
        conceptsLearned,
        classificationsSeen,
      });
    }
  }

  reset(): void {
    this.history = [];
    this.setState({
      phase: 'idle',
      prompt: null,
      currentNode: null,
      guess: null,
      canGoBack: false,
      questionCount: 0,
      conceptsLearned: [],
      classificationsSeen: [],
    });
  }

  requestExplanation(): string | null {
    const node = this.state.currentNode;
    if (!node || node.type !== 'question') return null;
    return node.explanation;
  }

  private canGoBack(): boolean {
    return (
      (this.state.phase === 'asking' || this.state.phase === 'guessing') &&
      this.history.length > 0
    );
  }

  private handleAsking(value: string): void {
    const current = this.state.currentNode;
    if (!current || current.type !== 'question') return;
    const routeKey = this.resolveRouteKey(current, value);
    const nextId = current.routes[routeKey];
    if (!nextId) return;
    const next: TreeNode | undefined = this.tree.nodes[nextId];
    if (!next) return;

    this.history.push(current.id);

    const conceptsLearned = this.pushUnique(this.state.conceptsLearned, current.concept);

    if (next.type === 'question') {
      this.setState({
        phase: 'asking',
        currentNode: next,
        prompt: this.questionPrompt(next),
        canGoBack: true,
        questionCount: this.state.questionCount + 1,
        conceptsLearned,
      });
    } else {
      const classificationsSeen = this.pushUnique(
        this.state.classificationsSeen,
        next.classification
      );
      this.setState({
        phase: 'guessing',
        currentNode: next,
        guess: next,
        prompt: this.confirmPrompt(next),
        canGoBack: true,
        conceptsLearned,
        classificationsSeen,
      });
    }
  }

  private handleGuessing(value: string): void {
    const guess = this.state.guess;
    if (!guess) return;
    if (value === 'yes') {
      this.setState({
        phase: 'explaining',
        prompt: this.explainPrompt(guess),
        canGoBack: false,
      });
      return;
    }
    if (value === 'no') {
      if (guess.fallback) {
        const fb = this.tree.nodes[guess.fallback];
        if (fb && fb.type === 'question') {
          this.history.push(guess.id);
          this.setState({
            phase: 'asking',
            currentNode: fb,
            prompt: this.questionPrompt(fb),
            guess: null,
            canGoBack: true,
            questionCount: this.state.questionCount + 1,
          });
          return;
        }
        if (fb && fb.type === 'answer') {
          const classificationsSeen = this.pushUnique(
            this.state.classificationsSeen,
            fb.classification
          );
          this.setState({
            phase: 'guessing',
            currentNode: fb,
            guess: fb,
            prompt: this.confirmPrompt(fb),
            canGoBack: true,
            classificationsSeen,
          });
          return;
        }
      }
      this.setState({
        phase: 'failed',
        prompt: this.failedPrompt(),
        currentNode: null,
        guess: null,
        canGoBack: false,
      });
    }
  }

  private handleExplaining(value: string): void {
    if (value !== 'next') return;
    const guess = this.state.guess;
    if (!guess) return;
    this.setState({
      phase: 'reinforcing',
      prompt: this.reinforcePrompt(guess),
      canGoBack: false,
    });
  }

  private handleReinforcing(_value: string): void {
    const guess = this.state.guess;
    if (!guess) return;
    this.setState({
      phase: 'done',
      prompt: this.donePrompt(guess),
      canGoBack: false,
    });
  }

  private resolveRouteKey(node: QuestionNode, value: string): 'yes' | 'no' | 'sometimes' | 'unknown' {
    if (value === 'yes' || value === 'no') return value;
    if (value === 'sometimes') return node.routes.sometimes ? 'sometimes' : 'no';
    if (value === 'unknown') return node.routes.unknown ? 'unknown' : 'no';
    return 'no';
  }

  private questionPrompt(node: QuestionNode): Prompt {
    const options: PromptOption[] = [OPTION_YES, OPTION_NO];
    if (node.routes.sometimes) options.push(OPTION_SOMETIMES);
    options.push(OPTION_UNKNOWN);
    return { kind: 'question', text: node.text, options };
  }

  private confirmPrompt(node: AnswerNode): Prompt {
    return {
      kind: 'confirm',
      text: `Creo que es un ${node.animal}. ¿Acerté?`,
      options: [OPTION_YES, OPTION_NO],
    };
  }

  private explainPrompt(node: AnswerNode): Prompt {
    const parts = [`¡${node.animal}! ${node.reasoning}`];
    if (node.misconceptionCorrection) parts.push(node.misconceptionCorrection);
    return {
      kind: 'explain',
      text: parts.join(' '),
      options: [OPTION_NEXT],
    };
  }

  private reinforcePrompt(node: AnswerNode): Prompt {
    return {
      kind: 'reinforce',
      text: node.reinforcement.question,
      options: [OPTION_YES, OPTION_NO],
    };
  }

  private donePrompt(node: AnswerNode): Prompt {
    return {
      kind: 'reinforce',
      text: node.reinforcement.fact,
      options: [OPTION_RESTART],
    };
  }

  private failedPrompt(): Prompt {
    return {
      kind: 'failed',
      text: 'No pude adivinar tu animal. ¿Querés intentar de nuevo?',
      options: [OPTION_RESTART],
    };
  }

  private pushUnique(arr: string[], value: string): string[] {
    if (!value || arr.includes(value)) return arr;
    return [...arr, value];
  }

  private recomputeLearned(): { conceptsLearned: string[]; classificationsSeen: string[] } {
    const conceptsLearned: string[] = [];
    const classificationsSeen: string[] = [];
    for (const id of this.history) {
      const node = this.tree.nodes[id];
      if (!node) continue;
      if (node.type === 'question' && node.concept && !conceptsLearned.includes(node.concept)) {
        conceptsLearned.push(node.concept);
      }
      if (
        node.type === 'answer' &&
        node.classification &&
        !classificationsSeen.includes(node.classification)
      ) {
        classificationsSeen.push(node.classification);
      }
    }
    return { conceptsLearned, classificationsSeen };
  }

  private setState(patch: Partial<EngineState>): void {
    this.state = { ...this.state, ...patch };
    if (patch.currentNode !== undefined || patch.phase !== undefined) {
      this.state.canGoBack = this.canGoBack();
    }
    for (const l of this.listeners) l(this.state);
  }
}
