'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import AssetForm from '@/components/assets/AssetForm';

interface Category {
  id: number;
  name: string;
  code: string;
  icon: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
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
  assigned_to: number | null;
  assignedUser?: User;
  assigned_date?: string;
  expected_return?: string;
  assigned_notes?: string;
  description: string;
  // New fields
  installation_date?: string;
  tagged_status?: string;
  commissioning_date?: string;
  country?: string;
  state?: string;
  city?: string;
  serial_no?: string;
  model?: string;
  make?: string;
  manufacturer?: string;
  client_id?: string;
  department_id?: number | null;
  location_id?: number | null;
  depreciation_period?: number;
  asset_cost?: number;
  useful_life?: number;
  current_asset_value?: number;
  salvage_value?: number;
  depreciation?: string;
  photos?: string;
  videos?: string;
}

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assignFormData, setAssignFormData] = useState({
    userId: '',
    assigned_date: new Date().toISOString().split('T')[0],
    expected_return: '',
    notes: '',
  });

  useEffect(() => {
    async function checkAuthAndFetch() {
      try {
        const checkAuth = await fetch('/api/users/me');
        if (!checkAuth.ok) {
          router.push('/login');
          return;
        }
        await Promise.all([fetchAssets(), fetchCategories(), fetchUsers()]);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      }
    }

    checkAuthAndFetch();
  }, [router]);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      if (data.assets) {
        setAssets(data.assets);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users/list');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    try {
      const res = await fetch(`/api/assets/${selectedAsset.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(assignFormData.userId),
          assigned_date: assignFormData.assigned_date,
          expected_return: assignFormData.expected_return || null,
          notes: assignFormData.notes,
        }),
      });

      if (res.ok) {
        setShowAssignModal(false);
        setSelectedAsset(null);
        setAssignFormData({
          userId: '',
          assigned_date: new Date().toISOString().split('T')[0],
          expected_return: '',
          notes: '',
        });
        fetchAssets();
        alert('Asset assigned successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to assign asset');
      }
    } catch (error) {
      console.error('Error assigning asset:', error);
      alert('Connection failed');
    }
  };

  const handleUnassign = async (asset: Asset) => {
    if (!confirm(`Unassign "${asset.asset_name}" from ${asset.assignedUser?.name || 'user'}?`)) return;

    try {
      const res = await fetch(`/api/assets/${asset.id}/unassign`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchAssets();
        alert('Asset unassigned successfully!');
      } else {
        alert('Failed to unassign asset');
      }
    } catch (error) {
      console.error('Error unassigning asset:', error);
      alert('Connection failed');
    }
  };

  const handleCreateAsset = async (formData: any) => {
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchAssets();
        alert('Asset created successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create asset');
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Connection failed');
    }
  };

  const handleUpdateAsset = async (formData: any) => {
    if (!editingAsset) return;
    
    try {
      const res = await fetch(`/api/assets/${editingAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setShowModal(false);
        setEditingAsset(null);
        fetchAssets();
        alert('Asset updated successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update asset');
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      alert('Connection failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchAssets();
      } else {
        alert('Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Connection failed');
    }
  };

  const openAssignModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssignFormData({
      userId: asset.assigned_to?.toString() || '',
      assigned_date: new Date().toISOString().split('T')[0],
      expected_return: '',
      notes: '',
    });
    setShowAssignModal(true);
  };

  const prepareInitialData = (asset: Asset | null) => {
    if (!asset) return undefined;
    return {
      asset_code: asset.asset_code,
      asset_name: asset.asset_name,
      installation_date: asset.installation_date?.split('T')[0] || '',
      tagged_status: asset.tagged_status || 'Not Tagged',
      commissioning_date: asset.commissioning_date?.split('T')[0] || '',
      country: asset.country || 'India',
      state: asset.state || '',
      city: asset.city || '',
      serial_no: asset.serial_no || '',
      model: asset.model || '',
      make: asset.make || '',
      manufacturer: asset.manufacturer || '',
      client_id: asset.client_id || '',
      category_id: asset.category_id?.toString() || '',
      department_id: asset.department_id?.toString() || '',
      location_id: asset.location_id?.toString() || '',
      status: asset.status,
      depreciation_period: asset.depreciation_period?.toString() || '',
      asset_cost: asset.asset_cost?.toString() || '',
      useful_life: asset.useful_life?.toString() || '',
      purchase_date: asset.purchase_date?.split('T')[0] || '',
      current_asset_value: asset.current_asset_value?.toString() || '',
      salvage_value: asset.salvage_value?.toString() || '',
      depreciation: asset.depreciation || '',
      photos: asset.photos || '',
      videos: asset.videos || '',
      description: asset.description || '',
    };
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading assets...</div>
        </div>
      </MainLayout>
    );
  }

  const getCategoryName = (asset: Asset) => {
    if (asset.category) return asset.category.name;
    if (asset.category_id) {
      const cat = categories.find(c => c.id === asset.category_id);
      return cat?.name || '-';
    }
    return '-';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
            <p className="text-gray-600 mt-1">Manage all your company assets</p>
          </div>
          <button
            onClick={() => {
              setEditingAsset(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Asset
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No assets found. Click "Add Asset" to create one.
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{asset.asset_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{asset.asset_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{asset.serial_no || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {getCategoryName(asset)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {asset.assignedUser ? (
                          <div>
                            <span className="font-medium">{asset.assignedUser.name}</span>
                            <br />
                            <span className="text-xs text-gray-500">{asset.assignedUser.email}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
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
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        {asset.assignedUser ? (
                          <button
                            onClick={() => handleUnassign(asset)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Unassign
                          </button>
                        ) : (
                          <button
                            onClick={() => openAssignModal(asset)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Assign
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal with AssetForm */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAsset(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <AssetForm
              initialData={prepareInitialData(editingAsset)}
              onSubmit={editingAsset ? handleUpdateAsset : handleCreateAsset}
              onCancel={() => {
                setShowModal(false);
                setEditingAsset(null);
              }}
              isEditing={!!editingAsset}
            />
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedAsset && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Assign Asset: {selectedAsset.asset_name}
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAssign}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assign To *</label>
                  <select
                    required
                    value={assignFormData.userId}
                    onChange={(e) => setAssignFormData({ ...assignFormData, userId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assignment Date</label>
                  <input
                    type="date"
                    value={assignFormData.assigned_date}
                    onChange={(e) => setAssignFormData({ ...assignFormData, assigned_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Return Date</label>
                  <input
                    type="date"
                    value={assignFormData.expected_return}
                    onChange={(e) => setAssignFormData({ ...assignFormData, expected_return: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    rows={3}
                    value={assignFormData.notes}
                    onChange={(e) => setAssignFormData({ ...assignFormData, notes: e.target.value })}
                    placeholder="Optional notes about this assignment"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Assign Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}