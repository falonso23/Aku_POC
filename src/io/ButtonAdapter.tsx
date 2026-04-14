import { useEffect } from 'react';
import type { PromptOption } from '../types';

interface Props {
  options: PromptOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function ButtonAdapter({ options, onSelect, disabled }: Props) {
  useEffect(() => {
    if (disabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      const opt = options.find((o) => o.hotkey && o.hotkey === e.key);
      if (opt) {
        e.preventDefault();
        onSelect(opt.value);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [options, onSelect, disabled]);

  return (
    <div className="btn-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`btn btn-option btn-${opt.value}`}
          data-value={opt.value}
          aria-keyshortcuts={opt.hotkey}
          disabled={disabled}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
