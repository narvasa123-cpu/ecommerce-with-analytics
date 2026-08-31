import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Home,
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Box,
  Bell,
  ClipboardList,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { supabase } from '@/lib/supabase';
import type { Profile, NavItem } from '@/types';

export default function AdminLayout() {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          setUser(profile as Profile);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: <Home size={20} /> },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: <BarChart3 size={20} />,
    },
    { href: '/admin/sales', label: 'Sales', icon: <TrendingUp size={20} /> },
    {
      href: '/admin/products',
      label: 'Products',
      icon: <ShoppingBag size={20} />,
    },
    { href: '/admin/orders', label: 'Orders', icon: <Package size={20} /> },
    { href: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { href: '/admin/inventory', label: 'Inventory', icon: <Box size={20} /> },
    { href: '/admin/notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { href: '/admin/audit-logs', label: 'Audit logs', icon: <ClipboardList size={20} /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar navItems={navItems} logo="E-Commerce" logoAlt="Admin Portal" />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
        <TopBar user={user} />

        <main id="main-content" className="flex-1 overflow-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
