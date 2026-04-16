'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Assets', href: '/assets', icon: '📦' },
  { name: 'Master Data', href: '/master-data', icon: '📋' },
  { name: 'User Management', href: '/users', icon: '👥' },
  { name: 'Tagged Asset', href: '/tagged-assets', icon: '🏷️' },
  { name: 'Asset Map', href: '/asset-map', icon: '🗺️' },
  { name: 'Maintenance', href: '/maintenance', icon: '🔧' },
  { name: 'Audit List', href: '/audit-list', icon: '📝' },
  { name: 'Asset Report', href: '/asset-report', icon: '📄' },
  { name: 'Asset Locations', href: '/locations', icon: '📍' },
  { name: 'Departments', href: '/departments', icon: '🏢' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Asset Management</h1>
        <p className="text-xs text-gray-400 mt-1">Enterprise System</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Menu</p>
        </div>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2 mx-2 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-bold">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-400">admin@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}