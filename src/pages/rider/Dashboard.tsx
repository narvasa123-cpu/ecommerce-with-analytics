import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Delivery } from '@/types';
import { formatDate } from '@/lib/auth';

export default function RiderDashboard() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [completedDeliveries, setCompletedDeliveries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from('deliveries')
          .select('*')
          .eq('rider_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setDeliveries(data || []);
        setTotalDeliveries(data?.length || 0);
        setCompletedDeliveries(data?.filter((d) => d.status === 'DELIVERED').length || 0);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveries();
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
        <h1 className="text-3xl font-bold text-gray-900">Rider Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Deliveries</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalDeliveries}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{completedDeliveries}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {totalDeliveries - completedDeliveries}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Deliveries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    #{delivery.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(delivery.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {delivery.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
