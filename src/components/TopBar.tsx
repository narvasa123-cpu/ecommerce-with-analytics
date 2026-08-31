import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';

interface TopBarProps { user: Profile | null; }

export default function TopBar({ user }: TopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const { unreadCount } = useNotifications(user?.id);
  const pageName = location.pathname.split('/').filter(Boolean).pop() || 'dashboard';
  const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };

  return <header className="flex min-h-[82px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Admin workspace</p><h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950">{pageTitle}</h1></div>
    <div className="flex items-center gap-2 sm:gap-4">
      <button aria-label={`${unreadCount} unread notifications`} className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><Bell size={19} aria-hidden="true" />{unreadCount > 0 && <span className="absolute right-2.5 top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>
      <div className="relative"><button aria-expanded={showDropdown} onClick={() => setShowDropdown(!showDropdown)} className="flex min-h-11 items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">{user?.full_name?.charAt(0) || 'A'}</div><span className="hidden text-sm font-semibold text-slate-700 sm:block">{user?.full_name || 'Administrator'}</span><ChevronDown size={16} className="text-slate-400" aria-hidden="true" /></button>
        {showDropdown && <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"><div className="border-b border-slate-100 p-4"><p className="font-semibold text-slate-900">{user?.full_name || 'Administrator'}</p><p className="mt-1 text-sm text-slate-500">{user?.email || 'Account profile'}</p><p className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{user?.role || 'ADMIN'}</p></div><button onClick={() => navigate('/admin/users')} className="flex min-h-11 w-full items-center gap-2 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><User size={17} aria-hidden="true" /><span>Manage users</span></button><button onClick={handleLogout} className="flex min-h-11 w-full items-center gap-2 border-t border-slate-100 px-4 text-sm font-medium text-red-600 hover:bg-red-50"><LogOut size={17} aria-hidden="true" /><span>Sign out</span></button></div>}
      </div>
    </div>
  </header>;
}
