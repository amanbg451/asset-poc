// src/components/audit/AuditHistory.tsx
'use client';

import { useEffect, useState } from 'react';

interface AuditLog {
  id: number;
  action: string;
  field_name: string;
  old_value: string;
  new_value: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

interface AuditHistoryProps {
  assetId: number;
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  ASSIGN: 'bg-purple-100 text-purple-800',
  UNASSIGN: 'bg-orange-100 text-orange-800',
  PHOTO_ADD: 'bg-teal-100 text-teal-800',
  PHOTO_DELETE: 'bg-rose-100 text-rose-800',
  VIDEO_ADD: 'bg-teal-100 text-teal-800',
  VIDEO_DELETE: 'bg-rose-100 text-rose-800',
};

const actionIcons: Record<string, string> = {
  CREATE: '➕',
  UPDATE: '✏️',
  DELETE: '🗑️',
  ASSIGN: '👤',
  UNASSIGN: '🚫',
  PHOTO_ADD: '📷',
  PHOTO_DELETE: '❌📷',
  VIDEO_ADD: '🎥',
  VIDEO_DELETE: '❌🎥',
};

export default function AuditHistory({ assetId }: AuditHistoryProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, [assetId]);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`/api/audit?assetId=${assetId}`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionDisplay = (log: AuditLog) => {
    if (log.action === 'UPDATE') {
      return `${log.action} ${log.field_name}`;
    }
    return log.action;
  };

  const getChangeDisplay = (log: AuditLog) => {
    if (log.action === 'UPDATE') {
      return `${log.old_value || 'empty'} → ${log.new_value || 'empty'}`;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">Loading history...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">No activity recorded for this asset yet.</div>
      </div>
    );
  }

  const displayedLogs = expanded ? logs : logs.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          📋 Activity History
          <span className="text-sm text-gray-500 font-normal">({logs.length} records)</span>
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {displayedLogs.map((log) => (
          <div key={log.id} className="px-6 py-4 hover:bg-gray-50 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{actionIcons[log.action] || '📝'}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${actionColors[log.action] || 'bg-gray-100 text-gray-800'}`}>
                      {getActionDisplay(log)}
                    </span>
                    {log.action === 'UPDATE' && (
                      <span className="text-sm text-gray-600">
                        {getChangeDisplay(log)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    By {log.user?.name || log.user?.email || 'System'} • {formatDate(log.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {logs.length > 5 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {expanded ? 'Show less' : `Show all ${logs.length} activities`}
          </button>
        </div>
      )}
    </div>
  );
}