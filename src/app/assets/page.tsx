'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

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
  const [formData, setFormData] = useState({
    asset_code: '',
    asset_name: '',
    category_id: '',
    status: 'Active',
    purchase_date: '',
    purchase_amount: '',
    description: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingAsset 
      ? `/api/assets/${editingAsset.id}`
      : '/api/assets';
    
    const method = editingAsset ? 'PUT' : 'POST';
    
    const payload = {
      asset_code: formData.asset_code,
      asset_name: formData.asset_name,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      status: formData.status,
      purchase_date: formData.purchase_date,
      purchase_amount: formData.purchase_amount ? parseFloat(formData.purchase_amount) : null,
      description: formData.description,
    };
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setShowModal(false);
        setEditingAsset(null);
        setFormData({
          asset_code: '',
          asset_name: '',
          category_id: '',
          status: 'Active',
          purchase_date: '',
          purchase_amount: '',
          description: '',
        });
        fetchAssets();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save asset');
      }
    } catch (error) {
      console.error('Error saving asset:', error);
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

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      asset_code: asset.asset_code,
      asset_name: asset.asset_name,
      category_id: asset.category_id?.toString() || '',
      status: asset.status,
      purchase_date: asset.purchase_date?.split('T')[0] || '',
      purchase_amount: asset.purchase_amount?.toString() || '',
      description: asset.description || '',
    });
    setShowModal(true);
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
              setFormData({
                asset_code: '',
                asset_name: '',
                category_id: '',
                status: 'Active',
                purchase_date: '',
                purchase_amount: '',
                description: '',
              });
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Amount</th>
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
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {asset.purchase_amount ? `$${asset.purchase_amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(asset)}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asset Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.asset_code}
                    onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.asset_name}
                    onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchase_amount}
                    onChange={(e) => setFormData({ ...formData, purchase_amount: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingAsset ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
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