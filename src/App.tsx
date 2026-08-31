import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

// Auth Pages
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
import AuthLayout from '@/components/layouts/AuthLayout';

// Protected Route Component
import ProtectedRoute from '@/components/ProtectedRoute';

// Customer Pages
import CustomerLayout from '@/components/layouts/CustomerLayout';
const CustomerDashboard = lazy(() => import('@/pages/customer/Dashboard'));
const CustomerProducts = lazy(() => import('@/pages/customer/Products'));
const CustomerProductDetail = lazy(() => import('@/pages/customer/ProductDetail'));
const CustomerCart = lazy(() => import('@/pages/customer/Cart'));
const CustomerCheckout = lazy(() => import('@/pages/customer/Checkout'));
const CustomerOrders = lazy(() => import('@/pages/customer/Orders'));
const CustomerOrderDetail = lazy(() => import('@/pages/customer/OrderDetail'));
const CustomerProfile = lazy(() => import('@/pages/customer/Profile'));
const Storefront = lazy(() => import('@/pages/storefront/Storefront'));
const NotificationsPage = lazy(() => import('@/pages/Notifications'));

// Staff Pages
import StaffLayout from '@/components/layouts/StaffLayout';
const StaffDashboard = lazy(() => import('@/pages/staff/Dashboard'));
const StaffProducts = lazy(() => import('@/pages/staff/Products'));
const StaffOrders = lazy(() => import('@/pages/staff/Orders'));
const StaffInventory = lazy(() => import('@/pages/staff/Inventory'));

// Rider Pages
import RiderLayout from '@/components/layouts/RiderLayout';
const RiderDashboard = lazy(() => import('@/pages/rider/Dashboard'));
const RiderDeliveries = lazy(() => import('@/pages/rider/Deliveries'));

// Admin Pages
import AdminLayout from '@/components/layouts/AdminLayout';
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'));
const AdminSales = lazy(() => import('@/pages/admin/Sales'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminAuditLogs = lazy(() => import('@/pages/admin/AuditLogs'));

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
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Loading workspace…</div>}>
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
          <Route path="/customer/notifications" element={<NotificationsPage user={user} />} />
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
          <Route path="/staff/notifications" element={<NotificationsPage user={user} />} />
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
          <Route path="/rider/notifications" element={<NotificationsPage user={user} />} />
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
          <Route path="/admin/notifications" element={<NotificationsPage user={user} />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        </Route>

        {/* Redirect to appropriate dashboard based on role */}
        <Route path="/" element={<Storefront />} />
        <Route path="/products" element={<Storefront />} />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
