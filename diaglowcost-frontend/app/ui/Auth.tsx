 "use client";
import {FormEvent,useState} from "react";
import {Activity,ArrowRight,BrainCircuit,CheckCircle2,Eye,EyeOff,LockKeyhole,ShieldCheck,Stethoscope} from "lucide-react";
const API=process.env.NEXT_PUBLIC_API_URL||"http://127.0.0.1:8000";
export default function Auth({onLogin,dark}:{onLogin:(t:string)=>void;dark:boolean}){
 const [mode,setMode]=useState<"login"|"register">("login"); const [name,setName]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [show,setShow]=useState(false);const [error,setError]=useState("");const [loading,setLoading]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setError("");setLoading(true);try{const r=await fetch(`${API}/api/v1/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mode==="login"?{email,password}:{name,email,password})});const d=await r.json();if(!r.ok)throw new Error(d.detail||"An error occurred");onLogin(d.access_token)}catch(err){setError(err instanceof Error?err.message:"Unable to connect")}finally{setLoading(false)}}
 return <main className="grid min-h-screen lg:grid-cols-[1.08fr_.92fr]">
  <section className="relative hidden overflow-hidden bg-[var(--surface)] lg:flex lg:flex-col lg:justify-between p-12 xl:p-16 border-r border-[var(--line)]">
   <div><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--primary)] text-white"><Stethoscope size={22}/></div><div className="font-bold tracking-tight">DiagLow-Cost — Clinical Assistant</div></div>
    <div className="mt-30 max-w-2xl flex align-center flex-col gap-6 p-12">
     <h1 className="text-[32px] font-bold leading-tight">A diagnostic support tool designed for frontline clinical practice.</h1>
     <p className="mt-6 text-[15px] leading-snug text-[var(--muted)]">Ask your assistant, review your conversation history, and get structured answers grounded in the integrated medical corpus.</p>
    </div>
   </div>
  </section>
  <section className="flex items-center justify-center p-6 sm:p-10"><div className="w-full max-w-md">
   <div className="mb-10 lg:hidden flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary)] text-white"><Stethoscope size={20}/></div><div className="font-bold">DiagLow-Cost — Clinical Assistant</div></div>
   <div className="mb-8"><h2 className="text-2xl font-semibold">{mode==="login"?"Welcome":"Create an account"}</h2><p className="mt-2 text-sm text-[var(--muted)]">{mode==="login"?"Sign in to access your clinical workspace.":"Create your professional account to get started."}</p></div>
   <form onSubmit={submit} className="space-y-4">{mode==="register"&&<Field label="Full name"><input value={name} onChange={e=>setName(e.target.value)} required minLength={2} className={input}/></Field>}<Field label="Email address"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className={input}/></Field><Field label="Password"><div className="relative"><input type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required minLength={mode==="register"?8:1} className={input+" pr-11"}/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></Field>
   {error&&<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
   <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] font-semibold text-white transition hover:bg-[var(--primary2)] disabled:opacity-60">{loading?"Signing in…":mode==="login"?"Sign in":"Create account"}{!loading&&<ArrowRight size={17}/>}</button></form>
   <div className="my-7 flex items-center gap-3 text-xs text-[var(--muted)]"><div className="h-px flex-1 bg-[var(--line)]"/><span>OR</span><div className="h-px flex-1 bg-[var(--line)]"/></div>
   <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("")}} className="w-full rounded-xl border border-[var(--line)] py-3 text-sm font-medium hover:bg-[var(--surface2)]">{mode==="login"?"Create an account":"I already have an account"}</button>
   <p className="mt-8 flex items-start gap-2 text-xs leading-5 text-[var(--muted)]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--primary)]"/>Responses are intended to support analysis and do not replace clinical judgment.</p>
  </div></section>
 </main>
}
const input="mt-2 h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-teal-500/10";
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block text-sm font-medium">{label}{children}</label>}
function Feature({icon,label}:{icon:React.ReactNode;label:string}){return <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface2)] p-4"><div className="mb-3 text-[var(--primary)]">{icon}</div><div className="text-sm font-medium">{label}</div></div>}
