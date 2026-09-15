"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type Health, type Message, type RagStats, type Source } from "../lib/api";
import { ActivityIcon, DatabaseIcon, InfoIcon, MenuIcon, RefreshIcon, SearchIcon, ShieldIcon, XIcon } from "../components/icons";
import { Sidebar } from "../components/Sidebar";
import { ChatMessage } from "../components/ChatMessage";
import { ChatComposer } from "../components/ChatComposer";
import { SourceCard } from "../components/SourceCard";

type SearchResult = { query: string; sources: Source[] };

export default function Home() {
  const [sidebar, setSidebar] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");
  const [health, setHealth] = useState<Health | null>(null);
  const [stats, setStats] = useState<RagStats | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const loadSystem = useCallback(async () => {
    try {
      const [h, s] = await Promise.all([api.health(), api.ragStats()]);
      setHealth(h); setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de joindre le backend.");
    }
  }, []);

  const startSession = useCallback(async () => {
    setBooting(true);
    setError("");
    try {
      const created = await api.createSession();
      setSessionId(created.id);
      setMessages([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Création de session impossible.");
    } finally { setBooting(false); }
  }, []);

  useEffect(() => {
    Promise.all([loadSystem(), startSession()]).catch(() => {});
  }, [loadSystem, startSession]);

  const newChat = async () => {
    await startSession();
    setSearchOpen(false);
    setSidebar(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy || !sessionId) return;
    setError("");
    setInput("");
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: text, created_at: new Date().toISOString() }]);
    setBusy(true);
    try {
      const result = await api.chat(sessionId, text);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: result.answer, created_at: new Date().toISOString() }]);
      await loadSystem();
    } catch (e) {
      setError(e instanceof Error ? e.message : "La réponse n'a pas pu être générée.");
    } finally { setBusy(false); }
  };


  const runSearch = async () => {
    const q = searchQuery.trim();
    if (!q || searchBusy) return;
    setSearchBusy(true); setError("");
    try { setSearchResult(await api.search(q)); }
    catch (e) { setError(e instanceof Error ? e.message : "Recherche impossible."); }
    finally { setSearchBusy(false); }
  };

  const hasConversation = messages.length > 0;

  return (
    <main className="flex h-[100dvh] overflow-hidden bg-paper">
      <Sidebar open={sidebar} onClose={() => setSidebar(false)} onNewChat={newChat} onSearch={() => { setSearchOpen(true); setSidebar(false); }} health={health} />

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white/90 px-3 backdrop-blur sm:px-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebar(true)} aria-label="Ouvrir le menu" className="rounded-xl p-2 text-slate-600 hover:bg-paper lg:hidden"><MenuIcon /></button>
            <div>
              <div className="text-sm font-semibold text-ink">Assistant clinique</div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${health?.status === "ok" ? "bg-emerald-500" : "bg-amber-500"}`} />
                {health?.rag_ready ? "RAG prêt" : "RAG non initialisé"}
              </div>
            </div>
          </div>
          <button onClick={loadSystem} className="rounded-xl p-2 text-slate-500 hover:bg-paper" aria-label="Actualiser l'état"><RefreshIcon /></button>
        </header>

        {error && (
          <div className="mx-3 mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 sm:mx-5">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" /><span className="flex-1">{error}</span>
            <button onClick={() => setError("")}><XIcon className="h-4 w-4" /></button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          {!hasConversation ? (
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 pb-8 pt-10 sm:px-6 sm:pt-16">
              <div className="max-w-2xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-teal-700">
                  <ActivityIcon className="h-3.5 w-3.5" /> RAG · DrugLib
                </div>
                <h1 className="text-balance text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-5xl">Explorer les données médicamenteuses avec contexte.</h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Posez une question en langage naturel. Le système recherche les éléments pertinents du corpus d’entraînement DrugLib avant de générer sa réponse.</p>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["Corpus RAG", stats ? `${stats.documents.toLocaleString("fr-FR")} documents` : "—", DatabaseIcon],
                  ["Modèle local", health?.llm || "—", ActivityIcon],
                  ["Base", health?.database === "ok" ? "PostgreSQL connecté" : "À vérifier", ShieldIcon],
                ].map(([title, value, Icon]) => {
                  const C = Icon as typeof DatabaseIcon;
                  return <div key={String(title)} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                    <C className="h-5 w-5 text-teal-700" />
                    <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</div>
                    <div className="mt-1 truncate text-sm font-semibold text-ink">{String(value)}</div>
                  </div>;
                })}
              </div>

              <div className="mt-auto pt-12">
                <ChatComposer value={input} setValue={setInput} onSubmit={send} disabled={booting || busy || !sessionId} />
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 px-3 py-6 sm:px-5 sm:py-8">
              {messages.map((m, index) => (
                <ChatMessage key={m.id} role={m.role} content={m.content} />
              ))}
              {busy && <div className="flex items-center gap-2 text-xs text-slate-400"><span className="flex gap-1"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500 [animation-delay:150ms]" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500 [animation-delay:300ms]" /></span> Analyse du contexte…</div>}
            </div>
          )}
        </div>

        {hasConversation && <ChatComposer value={input} setValue={setInput} onSubmit={send} disabled={busy || !sessionId} />}
      </section>

      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/25 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">
          <div className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-soft sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div><div className="text-sm font-semibold text-ink">Recherche RAG</div><div className="text-[11px] text-slate-400">Recherche directe dans ChromaDB</div></div>
              <button onClick={() => setSearchOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-paper"><XIcon /></button>
            </div>
            <div className="border-b border-line p-4">
              <div className="flex gap-2 rounded-xl border border-line bg-paper p-2 focus-within:border-teal-500">
                <SearchIcon className="ml-2 mt-2 h-4 w-4 shrink-0 text-slate-400" />
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && runSearch()} placeholder="Ex. enalapril insuffisance cardiaque" className="min-w-0 flex-1 bg-transparent px-1 py-2 text-xs outline-none" />
                <button onClick={runSearch} disabled={searchBusy || !searchQuery.trim()} className="rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400">{searchBusy ? "…" : "Chercher"}</button>
              </div>
            </div>
            <div className="overflow-y-auto p-4">
              {!searchResult ? <div className="py-10 text-center text-xs text-slate-400">Saisissez une requête pour afficher les sources les plus proches.</div> :
                searchResult.sources.length ? <div className="space-y-2">{searchResult.sources.map(s => <SourceCard key={`${s.id}-${s.drug}`} source={s} />)}</div> :
                <div className="py-10 text-center text-xs text-slate-400">Aucune source trouvée.</div>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}