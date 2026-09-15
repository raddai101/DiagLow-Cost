 "use client";
import {useEffect,useState} from "react";
import {Activity,ArrowRight,BrainCircuit,CheckCircle2,Eye,LockKeyhole,Moon,ShieldCheck,Sun,Stethoscope,Wifi} from "lucide-react";
import Auth from "./ui/Auth";
import Dashboard from "./ui/Dashboard";

export default function Home(){
 const [token,setToken]=useState<string|null>(null); const [dark,setDark]=useState(false); const [ready,setReady]=useState(false);
 useEffect(()=>{setToken(localStorage.getItem("diag_token"));setDark(localStorage.getItem("diag_theme")==="dark");setReady(true)},[]);
 useEffect(()=>{document.documentElement.classList.toggle("dark",dark);localStorage.setItem("diag_theme",dark?"dark":"light")},[dark]);
 if(!ready)return null;
 if(!token)return <div className="min-h-screen bg-[var(--bg)]"><TopTheme dark={dark} setDark={setDark}/><Auth onLogin={t=>{localStorage.setItem("diag_token",t);setToken(t)}} dark={dark}/></div>;
 return <Dashboard token={token} onLogout={()=>{localStorage.removeItem("diag_token");setToken(null)}} dark={dark} setDark={setDark}/>;
}
function TopTheme({dark,setDark}:{dark:boolean;setDark:(v:boolean)=>void}){return <header className="absolute right-4 top-4 z-10"><button aria-label="Change theme" onClick={()=>setDark(!dark)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] shadow-sm hover:text-[var(--text)]">{dark?<Sun size={18}/>:<Moon size={18}/>}</button></header>}
