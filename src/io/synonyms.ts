import type { PromptOption } from '../types';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsWhole(haystack: string, needle: string): boolean {
  if (!needle) return false;
  const re = new RegExp(`(^|\\s)${escapeRegex(needle)}($|\\s)`);
  return re.test(haystack);
}

export function matchOption(
  transcript: string,
  options: PromptOption[]
): string | null {
  const norm = normalize(transcript);
  if (!norm) return null;

  let bestValue: string | null = null;
  let bestLen = 0;

  for (const opt of options) {
    const candidates = [opt.value, opt.label, ...opt.synonyms]
      .map(normalize)
      .filter(Boolean);

    for (const c of candidates) {
      if (containsWhole(norm, c) && c.length > bestLen) {
        bestLen = c.length;
        bestValue = opt.value;
      }
    }
  }

  return bestValue;
}
