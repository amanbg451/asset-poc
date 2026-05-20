"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";

interface Asset {
  id: number;
  asset_code: string;
  asset_name: string;
  status: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    problem: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        // Check authentication via cookie (not localStorage)
        const userRes = await fetch("/api/users/me");
        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const userData = await userRes.json();
        setUser(userData.data?.user || userData.user);

        // Fetch assets
        const assetsRes = await fetch("/api/assets");
        const assetsData = await assetsRes.json();

        // Handle both response formats
        const assetsList = assetsData.assets || assetsData.data?.assets || [];

        if (assetsList.length > 0) {
          setAssets(assetsList);

          const active = assetsList.filter(
            (a: Asset) => a.status === "Active",
          ).length;
          const inactive = assetsList.filter(
            (a: Asset) => a.status === "Inactive",
          ).length;
          const problem = assetsList.filter(
            (a: Asset) => a.status === "Under Maintenance",
          ).length;

          setStats({
            total: assetsList.length,
            active,
            inactive,
            problem,
          });
        }
      } catch (err) {
        console.error("Error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleLogout = async () => {
  localStorage.removeItem('token');
  await fetch('/api/auth/logout', { method: 'POST' });
  router.push('/login');
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with User Info and Logout */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Asset Management Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name || user?.email || "User"}!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 capitalize">
              Role: {user?.role || "employee"}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">TOTAL ASSETS</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
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
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">INACTIVE ASSETS</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.inactive}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">PROBLEM ASSETS</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.problem}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔧</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assets Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Assets
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Asset Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Asset Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No assets found. Click "Assets" in sidebar to add one.
                    </td>
                  </tr>
                ) : (
                  assets.slice(0, 5).map((asset) => (
                    <tr key={asset.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {asset.asset_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {asset.asset_name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            asset.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : asset.status === "Inactive"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
