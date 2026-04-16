'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Asset {
  id: number;
  asset_code: string;
  asset_name: string;
  category_id: number | null;
  category?: Category;
  status: string;
  purchase_date: string;
  purchase_amount: number;
  assigned_to: number | null;  // ← Add this line
  assigned_date: string;
  expected_return: string;
  assigned_notes: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function MyAssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pendingReturn: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Check authentication and get user
        const userRes = await fetch('/api/users/me');
        if (!userRes.ok) {
          router.push('/login');
          return;
        }
        
        const userData = await userRes.json();
        const currentUser = userData.data?.user || userData.user;
        setUser(currentUser);

        // Fetch all assets (backend will filter by user role)
        const assetsRes = await fetch('/api/assets');
        const assetsData = await assetsRes.json();
        const allAssets = assetsData.assets || [];
        
        // Filter assets assigned to current user
        const myAssets = allAssets.filter(
          (asset: Asset) => asset.assigned_to === currentUser.id
        );
        
        setAssets(myAssets);
        
        // Calculate stats
        const active = myAssets.filter((a: Asset) => a.status === 'Active').length;
        const pendingReturn = myAssets.filter((a: Asset) => a.expected_return).length;
        
        setStats({
          total: myAssets.length,
          active,
          pendingReturn,
        });
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading your assets...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assets</h1>
          <p className="text-gray-600 mt-1">
            Assets assigned to {user?.name || user?.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">TOTAL ASSIGNED</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ACTIVE ASSETS</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">PENDING RETURN</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingReturn}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Assigned Assets</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No assets assigned to you yet.
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{asset.asset_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{asset.asset_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {asset.category?.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          asset.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : asset.status === 'Inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(asset.assigned_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {asset.expected_return ? formatDate(asset.expected_return) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box for Employees */}
        {user?.role === 'employee' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Need to return an asset?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Contact your manager or admin to request asset return or transfer.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}