import { useState } from "react";
import { ChevronDownIcon, FileIcon } from "./icons";
import type { Source } from "../lib/api";

export function SourceCard({ source }: { source: Source }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-line bg-white">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-3 text-left">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><FileIcon className="h-4 w-4" /></div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-ink">{source.drug}</div>
          <div className="truncate text-[11px] text-slate-500">{source.condition || "Condition non précisée"}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-ink">{source.rating}/10</div>
          <div className="text-[10px] text-slate-400">{Math.round(source.score * 100)}% match</div>
        </div>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-line px-3 pb-3 pt-2 text-[11px] text-slate-500">Référence DrugLib <span className="font-semibold text-slate-700">[{source.id}]</span>. Le score indique la proximité de récupération RAG.</div>}
    </div>
  );
}