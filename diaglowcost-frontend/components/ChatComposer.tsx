import { useEffect, useRef } from "react";
import { ArrowUpIcon } from "./icons";

export function ChatComposer({ value, setValue, onSubmit, disabled }: { value: string; setValue: (v: string) => void; onSubmit: () => void; disabled: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "0px";
    ref.current.style.height = `${Math.min(ref.current.scrollHeight, 150)}px`;
  }, [value]);

  return (
    <div className="border-t border-line bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-paper p-2 shadow-card focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
            rows={1}
            disabled={disabled}
            placeholder="Décrivez la situation ou votre question…"
            className="max-h-[150px] min-h-[42px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[13px] leading-5 text-ink outline-none placeholder:text-slate-400 disabled:opacity-60"
          />
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            aria-label="Envoyer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <ArrowUpIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-400">Les réponses sont générées à partir du corpus RAG disponible. Vérifiez les informations avant toute décision clinique.</p>
      </div>
    </div>
  );
}