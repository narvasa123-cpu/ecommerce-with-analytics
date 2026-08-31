import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Package, User, Home, Heart } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { supabase } from '@/lib/supabase';
import type { Profile, NavItem } from '@/types';

export default function CustomerLayout() {
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
    { href: '/customer', label: 'Dashboard', icon: <Home size={20} /> },
    {
      href: '/customer/products',
      label: 'Products',
      icon: <ShoppingBag size={20} />,
    },
    { href: '/customer/cart', label: 'Cart', icon: <ShoppingCart size={20} /> },
    { href: '/customer/wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
    { href: '/customer/orders', label: 'Orders', icon: <Package size={20} /> },
    { href: '/customer/profile', label: 'Profile', icon: <User size={20} /> },
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
      <Sidebar navItems={navItems} logo="E-Commerce" logoAlt="Customer Portal" />

      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar user={user} />

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
