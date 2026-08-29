import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Home, Package, ShoppingBag, Box, User } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { supabase } from '@/lib/supabase';
import type { Profile, NavItem } from '@/types';

export default function StaffLayout() {
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
    { href: '/staff', label: 'Dashboard', icon: <Home size={20} /> },
    { href: '/staff/orders', label: 'Orders', icon: <Package size={20} /> },
    {
      href: '/staff/products',
      label: 'Products',
      icon: <ShoppingBag size={20} />,
    },
    {
      href: '/staff/inventory',
      label: 'Inventory',
      icon: <Box size={20} />,
    },
    { href: '/staff/profile', label: 'Profile', icon: <User size={20} /> },
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} logo="E-Commerce" logoAlt="Staff Portal" />

      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar user={user} />

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
