import { ActivityIcon, DatabaseIcon, FileIcon, PlusIcon, SearchIcon, ShieldIcon, XIcon } from "./icons";

type Props = {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSearch: () => void;
  health?: { status: string; rag_ready: boolean; llm: string; database: string } | null;
};

export function Sidebar({ open, onClose, onNewChat, onSearch, health }: Props) {
  return (
    <>
      {open && <button aria-label="Fermer le menu" onClick={onClose} className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px] lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col border-r border-line bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-line px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white">
              <ActivityIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-ink">DiagLow-Cost</div>
              <div className="text-[11px] text-slate-500">Clinical RAG</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-paper lg:hidden"><XIcon /></button>
        </div>

        <div className="p-4">
          <button onClick={onNewChat} className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            <PlusIcon className="h-4 w-4" /> Nouvelle analyse
          </button>
        </div>

        <nav className="px-3">
          <button onClick={onSearch} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-paper">
            <SearchIcon className="h-[18px] w-[18px]" /> Recherche RAG
          </button>
          <div className="mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Système</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600"><DatabaseIcon className="h-[18px] w-[18px]" /> Corpus DrugLib</div>
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600"><FileIcon className="h-[18px] w-[18px]" /> Sources récupérées</div>
          </div>
        </nav>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink"><ShieldIcon className="h-4 w-4 text-teal-700" /> Cadre de sécurité</div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Outil d’exploration documentaire. Les réponses ne constituent pas une prescription autonome.</p>
          </div>
          <div className="mt-3 flex items-center gap-2 px-1 text-[11px] text-slate-400">
            <span className={`h-1.5 w-1.5 rounded-full ${health?.status === "ok" ? "bg-emerald-500" : "bg-amber-500"}`} />
            API {health?.status === "ok" ? "opérationnelle" : "à vérifier"}
          </div>
        </div>
      </aside>
    </>
  );
}