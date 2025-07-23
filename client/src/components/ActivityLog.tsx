import { useState, useEffect } from 'react';

interface ActivityEntry {
  id: string;
  message: string;
  deviceId?: string;
  deviceName?: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
}

interface ActivityLogProps {
  entries: ActivityEntry[];
  maxEntries?: number;
}

export function ActivityLog({ entries, maxEntries = 10 }: ActivityLogProps) {
  const [displayEntries, setDisplayEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    setDisplayEntries(entries.slice(0, maxEntries));
  }, [entries, maxEntries]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success';
      case 'error': return 'bg-error';
      case 'warning': return 'bg-warning';
      default: return 'bg-primary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const entryTime = new Date(timestamp);
    const diffMs = now.getTime() - entryTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return entryTime.toLocaleDateString();
  };

  const getDeviceAddress = (deviceId?: string) => {
    const deviceAddresses: Record<string, string> = {
      'solar': '192.168.1.100',
      'heatpump': '192.168.1.101',
      'charger': '192.168.1.102'
    };
    return deviceAddresses[deviceId || ''] || '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
            <p className="text-sm text-gray-500">Recent system events and alerts</p>
          </div>
          <button className="text-primary hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>
      </div>

      <div className="p-6">
        {displayEntries.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-list-alt text-gray-300 text-4xl mb-3" />
            <p className="text-gray-500">No activity yet</p>
            <p className="text-sm text-gray-400">System events will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayEntries.map((entry) => (
              <div key={entry.id} className="flex items-start space-x-4">
                <div className={`w-2 h-2 ${getTypeColor(entry.type)} rounded-full mt-2 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{entry.message}</p>
                    <span className="text-xs text-gray-500">{formatTimestamp(entry.timestamp)}</span>
                  </div>
                  {entry.deviceId && (
                    <p className="text-xs text-gray-500">
                      {entry.deviceName || entry.deviceId} • {getDeviceAddress(entry.deviceId)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
