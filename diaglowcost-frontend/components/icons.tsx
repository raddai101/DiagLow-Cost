import React from "react";

type IconProps = { className?: string };

const base = "w-5 h-5";

export function ActivityIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2.2-6 4.1 12 2.2-6H21" /></svg>;
}
export function PlusIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>;
}
export function SendIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m4 4 16 8-16 8 3-8-3-8Z" /><path strokeLinecap="round" d="M7 12h13" /></svg>;
}
export function SearchIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5" /><path strokeLinecap="round" d="m16 16 5 5" /></svg>;
}
export function ChevronDownIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>;
}
export function FileIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l4 4v14H7z" /><path strokeLinecap="round" d="M14 3v5h4M10 13h5M10 17h5" /></svg>;
}
export function DatabaseIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v7c0 1.66 3.13 3 7 3s7-1.34 7-3V5M5 12v7c0 1.66 3.13 3 7 3s7-1.34 7-3v-7" /></svg>;
}
export function ClockIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8.5" /><path strokeLinecap="round" d="M12 7v5l3 2" /></svg>;
}
export function ShieldIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" /></svg>;
}
export function MenuIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" /></svg>;
}
export function XIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /></svg>;
}
export function ArrowUpIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" d="M12 19V5M6 11l6-6 6 6" /></svg>;
}
export function InfoIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8.5" /><path strokeLinecap="round" d="M12 10.5v5M12 7.5h.01" /></svg>;
}
export function RefreshIcon({ className = base }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20 11a8 8 0 0 0-14.7-4L4 9M4 9V4M4 9h5M4 13a8 8 0 0 0 14.7 4L20 15M20 15v5M20 15h-5" /></svg>;
}