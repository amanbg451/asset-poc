'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

interface Location {
  id: number;
  name: string;
  company: string;
  created_at: string;
  updated_at: string;
}

export default function LocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: 'LeadTech',
  });

  useEffect(() => {
    checkAuth();
    fetchLocations();
  }, []);

  const checkAuth = async () => {
    const res = await fetch('/api/users/me');
    if (!res.ok) {
      router.push('/login');
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      if (data.locations) {
        setLocations(data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingLocation 
      ? `/api/locations/${editingLocation.id}`
      : '/api/locations';
    
    const method = editingLocation ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setShowModal(false);
        setEditingLocation(null);
        setFormData({ name: '', company: 'LeadTech' });
        fetchLocations();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save location');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Connection failed');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete location "${name}"?`)) return;
    
    try {
      const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLocations();
      } else {
        alert('Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Connection failed');
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      company: location.company || 'LeadTech',
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading locations...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Asset Locations</h1>
            <p className="text-gray-600 mt-1">Manage all asset locations</p>
          </div>
          <button
            onClick={() => {
              setEditingLocation(null);
              setFormData({ name: '', company: 'LeadTech' });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + New Location
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No locations found. Click "New Location" to create one.
                    </td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{location.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{location.company || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(location.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-3">
                        <button
                          onClick={() => handleEdit(location)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(location.id, location.name)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingLocation ? 'Edit Location' : 'New Asset Location'}
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
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Gurugram, Delhi, Mumbai"
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
                  {editingLocation ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}