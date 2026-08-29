import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight, Box, CheckCircle2, CircleDollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/auth';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ data: orders }, { count: orderCount }, { count: productCount }, { count: customerCount }] = await Promise.all([
          supabase.from('orders').select('total').eq('status', 'DELIVERED'),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CUSTOMER'),
        ]);
        setStats({ totalRevenue: (orders || []).reduce((sum, order) => sum + Number(order.total), 0), totalOrders: orderCount || 0, totalProducts: productCount || 0, totalCustomers: customerCount || 0 });
      } catch (error) { console.error('Error fetching stats:', error); }
      finally { setIsLoading(false); }
    };
    void fetchStats();
  }, []);

  const metrics = [
    { label: 'Total revenue', value: formatCurrency(stats.totalRevenue), icon: CircleDollarSign, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total orders', value: stats.totalOrders, icon: Package, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Active products', value: stats.totalProducts, icon: Box, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Customers', value: stats.totalCustomers, icon: Users, tone: 'bg-amber-50 text-amber-600' },
  ];

  if (isLoading) return <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading dashboard">{[1, 2, 3, 4].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-200" />)}</div>;

  return <div className="mx-auto max-w-7xl space-y-8">
    <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-blue-600">Store overview</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Good morning, Admin.</h2><p className="mt-2 text-slate-500">Here’s what’s happening across your store today.</p></div><Link to="/admin/analytics" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">View analytics <ArrowUpRight size={17} aria-hidden="true" /></Link></section>
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Store metrics">{metrics.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={19} aria-hidden="true" /></span></div><p className="mt-6 text-3xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><ArrowUpRight size={13} aria-hidden="true" /> Updated just now</p></div>)}</section>
    <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-bold text-slate-950">Operations overview</h3><p className="mt-1 text-sm text-slate-500">Shortcuts to the areas that need your attention.</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Live workspace</span></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><QuickLink href="/admin/products" icon={<ShoppingBag size={18} aria-hidden="true" />} title="Manage products" text="Update catalog and stock." tone="blue" /><QuickLink href="/admin/orders" icon={<Package size={18} aria-hidden="true" />} title="Review orders" text="Track customer fulfilment." tone="violet" /><QuickLink href="/admin/users" icon={<Users size={18} aria-hidden="true" />} title="Manage users" text="Review account access." tone="amber" /></div></div>
      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-400"><Activity size={19} aria-hidden="true" /></span><div><h3 className="font-bold">System status</h3><p className="text-xs text-slate-400">Core services</p></div></div><div className="mt-7 space-y-4 text-sm"><Status label="Database connected" /><Status label="Authentication active" /><Status label="All services operational" /></div><Link to="/admin/analytics" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300">Open system analytics <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </section>
  </div>;
}

function QuickLink({ href, icon, title, text, tone }: { href: string; icon: React.ReactNode; title: string; text: string; tone: 'blue' | 'violet' | 'amber' }) { const colors = { blue: 'bg-blue-50 text-blue-600', violet: 'bg-violet-50 text-violet-600', amber: 'bg-amber-50 text-amber-600' }; return <Link to={href} className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors[tone]}`}>{icon}</span><p className="mt-4 font-semibold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></Link>; }
function Status({ label }: { label: string }) { return <p className="flex items-center gap-3 text-slate-200"><CheckCircle2 size={17} className="text-emerald-400" aria-hidden="true" /> {label}</p>; }
