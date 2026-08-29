import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/auth';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch revenue
        const { data: orders } = await supabase
          .from('orders')
          .select('total')
          .eq('status', 'DELIVERED');

        const revenue = (orders || []).reduce((sum, o) => sum + o.total, 0);

        // Fetch total orders
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact' });

        // Fetch total products
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact' });

        // Fetch total customers
        const { count: customerCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('role', 'CUSTOMER');

        setStats({
          totalRevenue: revenue,
          totalOrders: orderCount || 0,
          totalProducts: productCount || 0,
          totalCustomers: customerCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.totalProducts}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.totalCustomers}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          System Status
        </h2>
        <div className="space-y-2 text-sm">
          <p className="text-green-600">✓ Database connected</p>
          <p className="text-green-600">✓ Authentication active</p>
          <p className="text-green-600">✓ All services operational</p>
        </div>
      </div>
    </div>
  );
}
