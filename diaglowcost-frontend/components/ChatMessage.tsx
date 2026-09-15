function formatInline(text: string) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((token, i) => {
    if (/^\*\*[^*]+\*\*$/.test(token)) {
      return <strong key={i} className="font-semibold text-ink">{token.slice(2, -2)}</strong>;
    }
    if (/^`[^`]+`$/.test(token)) {
      return <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">{token.slice(1, -1)}</code>;
    }
    return <span key={i}>{token}</span>;
  });
}

function formatAnswer(text: string) {
  // RAG references are implementation details: never expose [1], [2], … to the user.
  const clean = text
    .replace(/\[(?:\d+(?:\s*,\s*\d+)*)\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = clean.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="my-2 space-y-1.5 pl-5 list-disc marker:text-teal-600">
        {bullets.map((item, i) => <li key={i}>{formatInline(item)}</li>)}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) {
      flushBullets();
      return;
    }

    const heading = line.replace(/^#{1,3}\s+/, "");
    const isHeading = /^#{1,3}\s+/.test(line) || (/^\*\*[^*]+\*\*$/.test(line) && line.length < 90);
    const bullet = line.match(/^(?:[-•*]|\d+[.)])\s+(.*)$/);

    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }

    flushBullets();
    blocks.push(
      isHeading
        ? <h3 key={`h-${index}`} className="mt-4 mb-1 text-sm font-semibold leading-5 text-ink">{formatInline(heading)}</h3>
        : <p key={`p-${index}`} className="my-2 leading-6">{formatInline(line)}</p>
    );
  });
  flushBullets();

  return blocks.length ? blocks : <p className="leading-6">Aucune réponse exploitable n’a été générée.</p>;
}

export function ChatMessage({ role, content }: { role: "user" | "assistant"; content: string }) {
  const user = role === "user";
  return (
    <div className={`flex ${user ? "justify-end" : "justify-start"}`}>
      <div className={`${user ? "max-w-[88%] sm:max-w-[78%]" : "w-full max-w-3xl"}`}>
        <div className={`${user ? "rounded-2xl rounded-br-md bg-ink text-white" : "rounded-2xl border border-line bg-white text-slate-700"} px-4 py-3.5 shadow-card`}>
          <div className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${user ? "text-white/50" : "text-teal-700"}`}>{user ? "Vous" : "DiagLow-Cost"}</div>
          <div className={`text-[13px] ${user ? "whitespace-pre-wrap leading-6" : "leading-6"}`}>
            {user ? content : formatAnswer(content)}
          </div>
        </div>
      </div>
    </div>
  );
}
