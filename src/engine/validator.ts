import type { TreeData, TreeNode, QuestionNode, AnswerNode } from '../types';

export function validateTree(data: TreeData): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const { root, nodes } = data;

  if (!nodes[root]) {
    errors.push(`Root node "${root}" not found in nodes`);
    return { ok: false, errors };
  }

  for (const [id, node] of Object.entries(nodes)) {
    if (node.id !== id) {
      errors.push(`Node "${id}" has mismatched internal id "${node.id}"`);
    }

    if (node.type === 'question') {
      const q = node as QuestionNode;
      if (!q.routes || typeof q.routes.yes !== 'string' || typeof q.routes.no !== 'string') {
        errors.push(`Question "${id}" must have at least yes and no routes`);
      }
      if (q.routes) {
        for (const [key, target] of Object.entries(q.routes)) {
          if (target && !nodes[target]) {
            errors.push(`Question "${id}" route "${key}" points to missing node "${target}"`);
          }
        }
      }
    } else if (node.type === 'answer') {
      const a = node as AnswerNode;
      if (!a.animal || !a.animal.trim()) errors.push(`Answer "${id}" missing animal`);
      if (!a.reasoning || !a.reasoning.trim()) errors.push(`Answer "${id}" missing reasoning`);
      if (!a.reinforcement || !a.reinforcement.question || !a.reinforcement.question.trim()) {
        errors.push(`Answer "${id}" missing reinforcement.question`);
      }
      if (!a.reinforcement || !a.reinforcement.fact || !a.reinforcement.fact.trim()) {
        errors.push(`Answer "${id}" missing reinforcement.fact`);
      }
      if (a.fallback && !nodes[a.fallback]) {
        errors.push(`Answer "${id}" fallback points to missing node "${a.fallback}"`);
      }
    }
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color: Record<string, number> = {};
  for (const id of Object.keys(nodes)) color[id] = WHITE;

  const visit = (id: string, path: string[]): void => {
    const node: TreeNode | undefined = nodes[id];
    if (!node) return;
    if (color[id] === GRAY) {
      errors.push(`Cycle detected: ${[...path, id].join(' -> ')}`);
      return;
    }
    if (color[id] === BLACK) return;
    color[id] = GRAY;
    if (node.type === 'question') {
      for (const target of Object.values(node.routes)) {
        if (target) visit(target, [...path, id]);
      }
    }
    color[id] = BLACK;
  };

  visit(root, []);

  return { ok: errors.length === 0, errors };
}
