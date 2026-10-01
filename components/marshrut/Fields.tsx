"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

import { num } from "@/lib/marshrut/format";

/**
 * The words in the sentence that can be changed.
 *
 * Two kinds. A choice opens a short list right above it (there is always
 * room above, because the sentence lives at the bottom of the screen). A
 * number can be dragged sideways like a slider, typed into, or stepped with
 * the arrow keys. Both are ordinary buttons underneath, so keyboards and
 * screen readers get the same thing a mouse does.
 */

export interface Option<T extends string> {
  id: T;
  label: string;
  meta?: ReactNode;
}

export function Choice<T extends string>({
  label,
  text,
  value,
  options,
  onChange,
  wide,
}: {
  /** What the field is, for the screen reader. */
  label: string;
  /** What to show in the sentence: it may differ from the option's own name. */
  text: string;
  value: T;
  options: () => Option<T>[];
  onChange: (id: T) => void;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Option<T>[]>([]);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();

  const show = useCallback(() => {
    const items = options();
    setList(items);
    setActive(Math.max(0, items.findIndex((o) => o.id === value)));
    setOpen(true);
  }, [options, value]);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const away = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const pick = (option: Option<T>) => {
    onChange(option.id);
    close();
  };

  const onKey = (event: React.KeyboardEvent) => {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        show();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((a) => Math.min(list.length - 1, a + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = list[active];
      if (option) pick(option);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <span ref={wrap} className="mr-fieldwrap" onKeyDown={onKey}>
      <button
        ref={button}
        type="button"
        className="mr-field"
        aria-label={`${label}: ${text}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => (open ? close(false) : show())}
      >
        {text}
      </button>
      {open && (
        <ul id={id} role="listbox" aria-label={label} className="mr-pop" data-wide={wide ? "true" : "false"}>
          {list.map((option, i) => (
            <li
              key={option.id}
              role="option"
              aria-selected={option.id === value}
              data-active={i === active}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(option)}
            >
              <span className="mr-pop-name">{option.label}</span>
              {option.meta && <span className="mr-pop-meta mr-num">{option.meta}</span>}
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

/** Two significant digits: 3 210 becomes 3 200, 12 700 becomes 13 000. */
function snap(value: number) {
  const step = Math.pow(10, Math.max(1, Math.floor(Math.log10(Math.max(1, value))) - 1));
  return Math.round(value / step) * step;
}

export function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const apply = useCallback(
    (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v)))),
    [max, min, onChange],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, start: value, moved: false };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.x;
    if (Math.abs(dx) > 3) d.moved = true;
    if (d.moved) apply(snap(d.start * Math.exp(dx * 0.0055)));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) {
      setDraft(String(value));
      setTyping(true);
    }
  };
  const onKey = (event: React.KeyboardEvent) => {
    const step = Math.pow(10, Math.max(1, Math.floor(Math.log10(value)) - 1));
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      apply(value + step);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      apply(value - step);
    } else if (event.key === "Enter") {
      event.preventDefault();
      setDraft(String(value));
      setTyping(true);
    }
  };

  useEffect(() => {
    if (typing) input.current?.select();
  }, [typing]);

  const commit = () => {
    const parsed = Number(draft.replace(/\s/g, "").replace(",", "."));
    if (Number.isFinite(parsed) && parsed > 0) apply(parsed);
    setTyping(false);
  };

  if (typing) {
    return (
      <input
        ref={input}
        className="mr-field mr-field-input"
        inputMode="numeric"
        aria-label={label}
        value={draft}
        size={Math.max(4, draft.length)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setTyping(false);
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className="mr-field mr-field-number mr-num"
      role="spinbutton"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      title="Потяните в сторону или нажмите, чтобы ввести"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={onKey}
    >
      {num(value)}
    </button>
  );
}
