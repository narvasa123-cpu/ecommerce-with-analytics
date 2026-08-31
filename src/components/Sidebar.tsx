import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import type { NavItem } from '@/types';

interface SidebarProps { navItems: NavItem[]; logo: string; logoAlt: string; }

export default function Sidebar({ navItems, logo, logoAlt }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = (href: string) => href.split('/').filter(Boolean).length === 1 ? location.pathname === href : location.pathname === href || location.pathname.startsWith(`${href}/`);

  return <>
    <button aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg lg:hidden" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X size={22} /> : <Menu size={22} />}</button>
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-950 text-white transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="border-b border-white/10 px-6 py-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500"><ShoppingBag size={19} aria-hidden="true" /></div><div><h1 className="font-bold tracking-tight">{logo}</h1><p className="text-xs text-slate-400">{logoAlt}</p></div></div></div>
      <nav className="mt-8 space-y-1.5 px-4" aria-label="Primary navigation">{navItems.map((item) => <Link key={item.href} to={item.href} onClick={() => setIsOpen(false)} aria-current={isActive(item.href) ? 'page' : undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors ${isActive(item.href) ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>{item.icon}<span>{item.label}</span></Link>)}</nav>
    </aside>
    {isOpen && <div aria-hidden="true" className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />}
  </>;
}
