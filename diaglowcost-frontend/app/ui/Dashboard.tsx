"use client";
import {useEffect,useState,useRef} from "react";
import {Activity,ChevronDown,Clock3,Menu,MessageSquare,MoreHorizontal,Plus,Search,Send,Settings,ShieldCheck,Stethoscope,Sun,Moon,Trash2,UserRound,X} from "lucide-react";

const API=process.env.NEXT_PUBLIC_API_URL||"http://127.0.0.1:8000";

type Session={id:string;title:string;created_at:string;updated_at:string};
type Msg={id:number;role:string;content:string;created_at:string};
type User={name:string;email:string;role:string};

export default function Dashboard({token,onLogout,dark,setDark}:{token:string;onLogout:()=>void;dark:boolean;setDark:(v:boolean)=>void}){
  const [sessions,setSessions]=useState<Session[]>([]);
  const [session,setSession]=useState<Session|null>(null);
  const [messages,setMessages]=useState<Msg[]>([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [mobile,setMobile]=useState(false);
  const [user,setUser]=useState<User|null>(null);
  const [searchOpen,setSearchOpen]=useState(false);
  const end=useRef<HTMLDivElement>(null);

  async function api(path:string,opt:RequestInit={}){
    const r=await fetch(API+path,{
      ...opt,
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`,
        ...(opt.headers||{})
      }
    });

    if(r.status===401){
      onLogout();
      throw Error("Session expired");
    }

    if(!r.ok)
      throw Error((await r.json()).detail||"Error");

    return r.status===204?null:r.json();
  }

  useEffect(()=>{
    (async()=>{
      try{
        const [u,s]=await Promise.all([
          api("/api/v1/auth/me"),
          api("/api/v1/sessions")
        ]);

        setUser(u);
        setSessions(s);

        if(s[0]) selectSession(s[0]);
      }catch{}
    })();
  },[]);

  useEffect(()=>{
    end.current?.scrollIntoView({behavior:"smooth"});
  },[messages,loading]);

  async function selectSession(s:Session){
    setSession(s);
    setMobile(false);

    try{
      setMessages(await api(`/api/v1/sessions/${s.id}/messages`));
    }catch{}
  }

  async function newChat(){
    try{
      const s=await api("/api/v1/sessions",{method:"POST"});
      setSessions(x=>[s,...x]);
      setSession(s);
      setMessages([]);
      setMobile(false);
    }catch{}
  }

  async function send(){
    if(!input.trim()||loading)return;

    if(!session){
      await newChat();
      return;
    }

    const text=input.trim();
    setInput("");

    setMessages(m=>[
      ...m,
      {
        id:Date.now(),
        role:"user",
        content:text,
        created_at:new Date().toISOString()
      }
    ]);

    setLoading(true);

    try{
      const d=await api("/api/v1/chat",{
        method:"POST",
        body:JSON.stringify({
          session_id:session.id,
          message:text,
          top_k:5
        })
      });

      setMessages(m=>[
        ...m,
        {
          id:Date.now()+1,
          role:"assistant",
          content:d.answer,
          created_at:new Date().toISOString()
        }
      ]);

      const ss=await api("/api/v1/sessions");
      setSessions(ss);
      setSession(ss.find((x:Session)=>x.id===session.id)||session);

    }catch(e){
      setMessages(m=>[
        ...m,
        {
          id:Date.now()+2,
          role:"assistant",
          content:"I could not process this request. Please check that the LLM service and RAG index are available.",
          created_at:new Date().toISOString()
        }
      ]);
    }finally{
      setLoading(false);
    }
  }

  async function remove(id:string){
    if(!confirm("Delete this conversation?"))return;

    await api(`/api/v1/sessions/${id}`,{
      method:"DELETE"
    });

    const rest=sessions.filter(s=>s.id!==id);
    setSessions(rest);

    if(session?.id===id){
      setSession(rest[0]||null);
      setMessages([]);

      if(rest[0])selectSession(rest[0]);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">

      <aside className={`${mobile?"fixed inset-y-0 left-0 z-40 w-[86%] shadow-2xl":"hidden"} lg:flex lg:relative lg:w-[290px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)]`}>

        <div className="flex h-[72px] items-center justify-between border-b border-[var(--line)] px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary)] text-white">
              <Stethoscope size={19}/>
            </div>

            <div>
              <div className="text-sm font-bold">DiagLow-Cost</div>
              <div className="text-[10px] text-[var(--muted)]">CLINICAL ASSISTANT</div>
            </div>
          </div>

          <button
            onClick={()=>setMobile(false)}
            className="lg:hidden text-[var(--muted)]"
          >
            <X/>
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={newChat}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-sm font-semibold text-white hover:bg-[var(--primary2)]"
          >
            <Plus size={17}/>
            New consultation
          </button>
        </div>

        <div className="px-3 pb-2">
          <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            <span>History</span>

            <button onClick={()=>setSearchOpen(!searchOpen)}>
              <Search size={15}/>
            </button>
          </div>

          {searchOpen&&(
            <input
              autoFocus
              placeholder="Search…"
              className="mb-2 h-9 w-full rounded-lg border border-[var(--line)] bg-[var(--surface2)] px-3 text-xs outline-none"
            />
          )}
        </div>

        <div className="scrollbar flex-1 overflow-y-auto px-2">
          {sessions.map(s=>(
            <div
              key={s.id}
              className={`group mb-1 flex items-center gap-2 rounded-xl px-3 py-3 text-sm ${
                session?.id===s.id
                  ?"bg-[var(--surface2)]"
                  :"hover:bg-[var(--surface2)]"
              }`}
            >
              <button
                onClick={()=>selectSession(s)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="truncate font-medium">
                  {s.title}
                </div>

                <div className="mt-1 text-[10px] text-[var(--muted)]">
                  {formatDate(s.updated_at)}
                </div>
              </button>

              <button
                onClick={()=>remove(s.id)}
                className="invisible rounded-md p-1 text-[var(--muted)] hover:text-red-500 group-hover:visible"
              >
                <Trash2 size={14}/>
              </button>
            </div>
          ))}

          {sessions.length===0&&(
            <div className="px-3 py-8 text-center text-xs text-[var(--muted)]">
              No consultations yet.
            </div>
          )}
        </div>

        <div className="border-t border-[var(--line)] p-3">
          <div className="flex items-center gap-3 rounded-xl bg-[var(--surface2)] p-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
              <UserRound size={17}/>
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">
                {user?.name||"User"}
              </div>

              <div className="truncate text-[10px] text-[var(--muted)]">
                {user?.email}
              </div>
            </div>

            <button
              title="Sign out"
              onClick={onLogout}
              className="text-[var(--muted)] hover:text-red-500"
            >
              <MoreHorizontal size={18}/>
            </button>
          </div>
        </div>
      </aside>

      {mobile&&(
        <div
          onClick={()=>setMobile(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">

        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6">

          <div className="flex min-w-0 items-center gap-3">

            <button
              onClick={()=>setMobile(true)}
              className="lg:hidden text-[var(--muted)]"
            >
              <Menu/>
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold sm:text-base">
                {session?.title||"Clinical consultation"}
              </h1>

              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>
                {loading?"Analyzing…":"Assistant ready"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">

            <div className="hidden items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)] sm:flex">
              <ShieldCheck size={14}/>
              <span>Secure session</span>
            </div>

            <button
              onClick={()=>setDark(!dark)}
              title="Change theme"
              className="grid h-10 w-10 place-items-center rounded-xl text-[var(--muted)] hover:bg-[var(--surface2)]"
            >
              {dark?<Sun size={18}/>:<Moon size={18}/>}
            </button>

          </div>
        </header>

        <div className="scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-7 sm:px-8 sm:py-10">

            {!messages.length&&!loading
              ?<Empty/>
              :(
                <div className="space-y-7">

                  {messages.map(m=>(
                    <Message key={`message-${m.id}`} m={m}/>
                  ))}

                  {loading&&(
                    <div className="flex gap-3">
                      <Avatar assistant/>

                      <div className="rounded-2xl rounded-tl-md border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                        <div className="flex gap-1">
                          <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)]"/>
                          <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:120ms]"/>
                          <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:240ms]"/>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={end}/>

                </div>
              )
            }

          </div>
        </div>

        <div className="border-t border-[var(--line)] bg-[var(--bg)] p-3 sm:p-5">
          <div className="mx-auto max-w-4xl">

            <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm focus-within:border-[var(--primary)]">

              <textarea
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{
                  if(e.key==="Enter"&&!e.shiftKey){
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Describe the clinical case or ask your question…"
                className="max-h-32 min-h-[56px] w-full resize-none bg-transparent px-4 py-4 pr-14 text-sm outline-none"
                disabled={loading}
              />

              <button
                onClick={send}
                disabled={!input.trim()||loading}
                className="absolute bottom-2.5 right-2.5 grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary)] text-white disabled:opacity-30"
              >
                <Send size={17}/>
              </button>

            </div>

            <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
              Responses are intended to support analysis and do not replace clinical judgment.
            </p>

          </div>
        </div>

      </main>
    </div>
  );
}

function Empty(){
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">

      <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
        <Stethoscope size={28}/>
      </div>

      <h2 className="text-[30px] font-bold leading-tight tracking-tight">
        A diagnostic support tool designed for real-world clinical practice.
      </h2>

      <p className="mt-3 max-w-2xl text-[25px] font-normal leading-relaxed text-[var(--muted)]">
        Ask your assistant, review your conversation history, and get structured answers grounded in the integrated medical corpus.
      </p>

    </div>
  );
}

function Avatar({assistant}:{assistant:boolean}){
  return (
    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
      assistant
        ?"bg-[var(--primary)] text-white"
        :"bg-[var(--surface2)] text-[var(--muted)]"
    }`}>
      {assistant
        ?<Stethoscope size={15}/>
        :<UserRound size={15}/>
      }
    </div>
  );
}

function Message({m}:{m:Msg}){
  const a=m.role==="assistant";

  return (
    <div className={`flex gap-3 ${a?"":"flex-row-reverse"}`}>

      <Avatar assistant={a}/>

      <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
        a
          ?"rounded-tl-md border border-[var(--line)] bg-[var(--surface)]"
          :"rounded-tr-md bg-[var(--user)]"
      }`}>

        <MarkdownContent content={m.content}/>

        <div className="mt-2 text-[9px] text-[var(--muted)]">
          {formatTime(m.created_at)}
        </div>

      </div>
    </div>
  );
}

function MarkdownContent({content}:{content:string}){

  const normalized=content
    .replace(/\\\*\\\*/g,"**")
    .replace(/\\\*/g,"*")
    .replace(/\\_/g,"_")
    .replace(/\\#/g,"#");

  const lines=normalized
    .replace(/\r\n?/g,"\n")
    .split("\n");

  const blocks:React.ReactNode[]=[];
  let list:string[]=[];
  let ordered=false;

  const flush=()=>{

    if(!list.length)return;

    const listId=`list-${blocks.length}-${list.join("-")}`;

    const items=list.map((x,i)=>(
      <li key={`${listId}-item-${i}`}>
        {inlineMarkdown(x)}
      </li>
    ));

    blocks.push(
      ordered
        ?<ol key={`${listId}-ordered`}>{items}</ol>
        :<ul key={`${listId}-unordered`}>{items}</ul>
    );

    list=[];
  };

  lines.forEach((line,i)=>{

    const t=line.trim();

    if(!t){
      flush();
      return;
    }

    if(/^\s*---+\s*$/.test(t)){
      flush();
      blocks.push(<hr key={`hr-${i}`}/>);
      return;
    }

    const h=t.match(/^(#{1,4})\s+(.+)$/);

    if(h){
      flush();

      const level=h[1].length;
      const content=inlineMarkdown(h[2]);

      if(level===1)
        blocks.push(<h1 key={`h1-${i}`}>{content}</h1>);
      else if(level===2)
        blocks.push(<h2 key={`h2-${i}`}>{content}</h2>);
      else if(level===3)
        blocks.push(<h3 key={`h3-${i}`}>{content}</h3>);
      else
        blocks.push(<h4 key={`h4-${i}`}>{content}</h4>);

      return;
    }

    const ol=t.match(/^\d+[.)]\s+(.+)$/);
    const ul=t.match(/^[-*•]\s+(.+)$/);

    if(ol||ul){

      if(!list.length)
        ordered=!!ol;

      list.push((ol||ul)![1]);

      return;
    }

    flush();

    blocks.push(
      <p key={`paragraph-${i}`}>
        {inlineMarkdown(t)}
      </p>
    );
  });

  flush();

  return <div className="prose-ai">{blocks}</div>;
}

function inlineMarkdown(text:string):React.ReactNode{

  const parts=text.split(
    /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/
  );

  return parts.map((part,i)=>{

    if(/^`[^`]+`$/.test(part))
      return (
        <code key={`code-${i}`}>
          {part.slice(1,-1)}
        </code>
      );

    if(/^\*\*[^*]+\*\*$/.test(part)||/^__[^_]+__$/.test(part))
      return (
        <strong key={`strong-${i}`}>
          {part.slice(2,-2)}
        </strong>
      );

    if(/^\*[^*]+\*$/.test(part)||/^_[^_]+_$/.test(part))
      return (
        <em key={`em-${i}`}>
          {part.slice(1,-1)}
        </em>
      );

    return (
      <span key={`text-${i}`}>
        {part}
      </span>
    );
  });
}

function formatTime(d:string){
  try{
    return new Date(d).toLocaleTimeString("en-US",{
      hour:"2-digit",
      minute:"2-digit"
    });
  }catch{
    return "";
  }
}

function formatDate(d:string){
  try{
    return new Date(d).toLocaleDateString("en-US",{
      day:"2-digit",
      month:"short"
    });
  }catch{
    return "";
  }
}