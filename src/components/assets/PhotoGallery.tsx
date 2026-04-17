// src/components/assets/PhotoGallery.tsx
'use client';

import { useState } from 'react';

interface PhotoGalleryProps {
  assetId: number;
  photos: string[];
  onPhotosUpdate: (photos: string[]) => void;
}

export default function PhotoGallery({ assetId, photos, onPhotosUpdate }: PhotoGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch(`/api/assets/${assetId}/upload-photo`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        onPhotosUpdate(data.photos);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (photoUrl: string) => {
    if (!confirm('Delete this photo?')) return;

    setDeleting(photoUrl);
    try {
      const res = await fetch(`/api/assets/${assetId}/delete-photo?url=${encodeURIComponent(photoUrl)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        onPhotosUpdate(data.photos);
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
        Asset Photos
      </h2>

      {/* Upload Button */}
      <div className="mb-6">
        <label className="inline-block cursor-pointer">
          <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {uploading ? 'Uploading...' : '+ Upload Photo'}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Max file size: 5MB. Formats: JPEG, PNG, WEBP
        </p>
      </div>

      {/* Photo Gallery Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          No photos uploaded yet. Click "Upload Photo" to add images.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`Asset photo ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <button
                onClick={() => handleDelete(photo)}
                disabled={deleting === photo}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600 disabled:opacity-50"
              >
                ×
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}