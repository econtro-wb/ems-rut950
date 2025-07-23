interface Device {
  id: string;
  name: string;
  address: string;
  port: number;
  isOnline: boolean;
  lastSeen?: string;
}

interface DeviceStatusProps {
  devices: Device[];
  mqttConnected: boolean;
}

export function DeviceStatus({ devices, mqttConnected }: DeviceStatusProps) {
  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return '--';
    
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
        <p className="text-sm text-gray-500">Modbus TCP & MQTT connectivity</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${device.isOnline ? 'bg-success' : 'bg-error'}`} />
                <div>
                  <p className="font-medium text-gray-900">{device.name}</p>
                  <p className="text-sm text-gray-500">{device.address}:{device.port}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${device.isOnline ? 'text-success' : 'text-error'}`}>
                  {device.isOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-xs text-gray-500">{formatLastSeen(device.lastSeen)}</p>
              </div>
            </div>
          ))}

          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <i className="fas fa-broadcast-tower text-primary" />
                <div>
                  <p className="font-medium text-gray-900">MQTT Broker</p>
                  <p className="text-sm text-gray-500">mqtt://localhost:1883</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${mqttConnected ? 'text-success' : 'text-error'}`}>
                  {mqttConnected ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-xs text-gray-500">
                  {mqttConnected ? '3 topics subscribed' : 'Connection failed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
