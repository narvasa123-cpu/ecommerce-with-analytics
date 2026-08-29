import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/30 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-xl font-bold">E</div><div><p className="font-semibold tracking-tight">E-Commerce</p><p className="text-xs text-slate-400">Operations platform</p></div></div>
            <div className="mt-24 max-w-sm"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Welcome back</p><h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">Run your store with clarity.</h1><p className="mt-5 text-base leading-7 text-slate-400">Manage products, orders, inventory, and performance from one calm, focused workspace.</p></div>
          </div>
          <div className="relative grid grid-cols-3 gap-3 text-sm"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-lg font-semibold">24/7</p><p className="mt-1 text-slate-400">Visibility</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-lg font-semibold">Live</p><p className="mt-1 text-slate-400">Analytics</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-lg font-semibold">Secure</p><p className="mt-1 text-slate-400">Access</p></div></div>
        </aside>
        <main className="flex items-center bg-slate-50 px-5 py-10 sm:px-12 lg:px-16"><div className="w-full max-w-md"><div className="mb-8 lg:hidden"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">E</div><div><p className="font-semibold text-slate-900">E-Commerce</p><p className="text-xs text-slate-500">Operations platform</p></div></div></div><Outlet /></div></main>
      </div>
    </div>
  );
}
