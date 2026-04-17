// src/app/assets/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

interface Asset {
  id: number;
  asset_code: string;
  asset_name: string;
  status: string;
  qr_url: string;
}

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAsset();
  }, []);

  const fetchAsset = async () => {
    try {
      const res = await fetch(`/api/assets/${params.id}`);
      const data = await res.json();
      if (data.asset) {
        setAsset(data.asset);
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/assets/${params.id}/qrcode/png`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${asset?.asset_code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (!asset) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Asset not found</h2>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#b9392c] to-[#8f2d22] text-white">
            <h1 className="text-2xl font-bold">{asset.asset_name}</h1>
            <p className="text-white/80 mt-1">Code: {asset.asset_code}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: QR Code */}
              <div className="flex flex-col items-center justify-center border-r border-gray-200">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/assets/${asset.id}/qrcode`}
                    alt={`QR Code for ${asset.asset_name}`}
                    className="w-64 h-64"
                  />
                </div>
                
                <button
                  onClick={downloadQRCode}
                  disabled={downloading}
                  className="mt-4 px-6 py-2 bg-[#b9392c] text-white rounded-lg hover:bg-[#8f2d22] transition disabled:opacity-50"
                >
                  {downloading ? 'Downloading...' : 'Download QR Code'}
                </button>
                
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Print this QR code and stick it on the asset.<br />
                  Scan with mobile app to tag this asset.
                </p>
              </div>

              {/* Right: Asset Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Asset Code</dt>
                    <dd className="text-gray-900 font-medium">{asset.asset_code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Asset Name</dt>
                    <dd className="text-gray-900 font-medium">{asset.asset_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        asset.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : asset.status === 'Tagged'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {asset.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">QR Code URL</dt>
                    <dd className="text-sm text-gray-500 break-all">{asset.qr_url || 'Not generated'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}