import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import AuthLayout from '@/components/layouts/AuthLayout';

// Protected Route Component
import ProtectedRoute from '@/components/ProtectedRoute';

// Customer Pages
import CustomerLayout from '@/components/layouts/CustomerLayout';
import CustomerDashboard from '@/pages/customer/Dashboard';
import CustomerProducts from '@/pages/customer/Products';
import CustomerProductDetail from '@/pages/customer/ProductDetail';
import CustomerCart from '@/pages/customer/Cart';
import CustomerCheckout from '@/pages/customer/Checkout';
import CustomerOrders from '@/pages/customer/Orders';
import CustomerOrderDetail from '@/pages/customer/OrderDetail';
import CustomerProfile from '@/pages/customer/Profile';
import Storefront from '@/pages/storefront/Storefront';

// Staff Pages
import StaffLayout from '@/components/layouts/StaffLayout';
import StaffDashboard from '@/pages/staff/Dashboard';
import StaffProducts from '@/pages/staff/Products';
import StaffOrders from '@/pages/staff/Orders';
import StaffInventory from '@/pages/staff/Inventory';

// Rider Pages
import RiderLayout from '@/components/layouts/RiderLayout';
import RiderDashboard from '@/pages/rider/Dashboard';
import RiderDeliveries from '@/pages/rider/Deliveries';

// Admin Pages
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminAnalytics from '@/pages/admin/Analytics';
import AdminSales from '@/pages/admin/Sales';
import AdminProducts from '@/pages/admin/Products';
import AdminOrders from '@/pages/admin/Orders';
import AdminUsers from '@/pages/admin/Users';

function App() {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
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
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(profile as Profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Customer Routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['CUSTOMER']}
              userRole={user?.role}
            >
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/customer/products" element={<CustomerProducts />} />
          <Route path="/customer/products/:id" element={<CustomerProductDetail />} />
          <Route path="/customer/cart" element={<CustomerCart />} />
          <Route path="/customer/checkout" element={<CustomerCheckout />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/orders/:id" element={<CustomerOrderDetail />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
        </Route>

        {/* Staff Routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['STAFF', 'ADMIN']}
              userRole={user?.role}
            >
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/products" element={<StaffProducts />} />
          <Route path="/staff/orders" element={<StaffOrders />} />
          <Route path="/staff/inventory" element={<StaffInventory />} />
        </Route>

        {/* Rider Routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['RIDER']}
              userRole={user?.role}
            >
              <RiderLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/rider" element={<RiderDashboard />} />
          <Route path="/rider/deliveries" element={<RiderDeliveries />} />
        </Route>

        {/* Admin Routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['ADMIN']}
              userRole={user?.role}
            >
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/sales" element={<AdminSales />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/inventory" element={<StaffInventory />} />
        </Route>

        {/* Redirect to appropriate dashboard based on role */}
        <Route path="/" element={<Storefront />} />
        <Route path="/products" element={<Storefront />} />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
