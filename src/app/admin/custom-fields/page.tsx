// src/app/admin/custom-fields/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

interface CustomField {
  id: number;
  field_key: string;
  field_label: string;
  field_type: string;
  field_options: string | null;
  section: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
}

const fieldTypes = [
  { value: 'text', label: 'Text (Short Answer)' },
  { value: 'textarea', label: 'Textarea (Long Answer)' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown Select' },
  { value: 'checkbox', label: 'Checkbox (Yes/No)' },
  { value: 'url', label: 'URL / Link' },
];

const sections = [
  'General',
  'Warranty & Insurance',
  'Supplier Information',
  'Technical Specifications',
  'Maintenance',
  'Assignment Details',
  'Condition',
  'Documentation',
  'Additional Notes',
  'Client Specific',
  'Compliance',
  'IT Information',
];

export default function CustomFieldsAdminPage() {
  const router = useRouter();
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [formData, setFormData] = useState({
    field_label: '',
    field_type: 'text',
    field_options: '',
    section: 'General',
    is_required: false,
  });

  useEffect(() => {
    checkAuth();
    fetchFields();
  }, []);

  const checkAuth = async () => {
    const res = await fetch('/api/users/me');
    const data = await res.json();
    const user = data.data?.user || data.user;
    if (!res.ok || user?.role !== 'admin') {
      router.push('/login');
    }
  };

  const fetchFields = async () => {
    try {
      const res = await fetch('/api/admin/custom-fields');
      const data = await res.json();
      if (data.fields) {
        setFields(data.fields);
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = '/api/admin/custom-fields';
    const method = editingField ? 'PUT' : 'POST';
    
    const payload = editingField 
      ? { id: editingField.id, ...formData }
      : formData;
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setShowModal(false);
        setEditingField(null);
        setFormData({
          field_label: '',
          field_type: 'text',
          field_options: '',
          section: 'General',
          is_required: false,
        });
        fetchFields();
        alert(editingField ? 'Field updated successfully!' : 'Field created successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save field');
      }
    } catch (error) {
      console.error('Error saving field:', error);
      alert('Connection failed');
    }
  };

  const handleDelete = async (id: number, label: string) => {
    if (!confirm(`Delete field "${label}"? This will remove data for all assets.`)) return;
    
    try {
      const res = await fetch(`/api/admin/custom-fields?id=${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchFields();
        alert('Field deleted successfully');
      } else {
        alert('Failed to delete field');
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Connection failed');
    }
  };

  const handleEdit = (field: CustomField) => {
    setEditingField(field);
    setFormData({
      field_label: field.field_label,
      field_type: field.field_type,
      field_options: field.field_options || '',
      section: field.section || 'General',
      is_required: field.is_required,
    });
    setShowModal(true);
  };

  const toggleActive = async (field: CustomField) => {
    try {
      const res = await fetch('/api/admin/custom-fields', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: field.id,
          field_label: field.field_label,
          field_type: field.field_type,
          field_options: field.field_options,
          section: field.section,
          is_required: field.is_required,
          is_active: !field.is_active,
        }),
      });
      
      if (res.ok) {
        fetchFields();
      }
    } catch (error) {
      console.error('Error toggling field:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading custom fields...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Fields Manager</h1>
            <p className="text-gray-600 mt-1">Add, edit, or remove custom fields for assets</p>
          </div>
          <button
            onClick={() => {
              setEditingField(null);
              setFormData({
                field_label: '',
                field_type: 'text',
                field_options: '',
                section: 'General',
                is_required: false,
              });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Custom Field
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Label</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No custom fields defined. Click "Add Custom Field" to create one.
                    </td>
                  </tr>
                ) : (
                  fields.map((field) => (
                    <tr key={field.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {field.field_label}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {field.field_key}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {fieldTypes.find(t => t.value === field.field_type)?.label || field.field_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {field.section || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {field.is_required ? (
                          <span className="text-red-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(field)}
                          className={`px-2 py-1 text-xs rounded-full transition ${
                            field.is_active 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {field.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-3">
                        <button
                          onClick={() => handleEdit(field)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(field.id, field.field_label)}
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800">💡 How to Use Custom Fields</h3>
          <p className="text-sm text-blue-700 mt-1">
            Custom fields you create here will automatically appear in the Asset Add/Edit form.
            You can add, edit, or delete fields at any time without changing code.
          </p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-full max-w-lg shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingField ? 'Edit Custom Field' : 'Add New Custom Field'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Field Label *</label>
                <input
                  type="text"
                  required
                  value={formData.field_label}
                  onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
                  placeholder="e.g., Warranty Expiry Date"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">This is what users will see on the form</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Field Type *</label>
                <select
                  required
                  value={formData.field_type}
                  onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {fieldTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              {formData.field_type === 'dropdown' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dropdown Options</label>
                  <input
                    type="text"
                    value={formData.field_options}
                    onChange={(e) => setFormData({ ...formData, field_options: e.target.value })}
                    placeholder="Option 1, Option 2, Option 3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate options with commas</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Which section should this field appear in?</p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={formData.is_required}
                  onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_required" className="ml-2 block text-sm text-gray-700">
                  Required field (users must fill this)
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
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
                  {editingField ? 'Update Field' : 'Add Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}