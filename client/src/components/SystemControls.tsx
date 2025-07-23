import { useState } from 'react';

interface SystemControlsProps {
  onCommand: (deviceId: string, command: string, value?: any) => void;
  autoMode: boolean;
  gridExport: boolean;
}

export function SystemControls({ onCommand, autoMode, gridExport }: SystemControlsProps) {
  const [localAutoMode, setLocalAutoMode] = useState(autoMode);
  const [localGridExport, setLocalGridExport] = useState(gridExport);

  const handleEmergencyStop = () => {
    if (confirm('Are you sure you want to trigger emergency stop? This will halt all operations.')) {
      onCommand('system', 'emergency_stop', true);
    }
  };

  const handleAutoModeToggle = () => {
    const newValue = !localAutoMode;
    setLocalAutoMode(newValue);
    onCommand('system', 'auto_mode', newValue);
  };

  const handleGridExportToggle = () => {
    const newValue = !localGridExport;
    setLocalGridExport(newValue);
    onCommand('system', 'grid_export', newValue);
  };

  const handleHeatPumpControl = (action: 'start' | 'stop') => {
    onCommand('heatpump', action);
  };

  const handleChargerControl = () => {
    onCommand('charger', 'start_charging');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">System Controls</h3>
        <p className="text-sm text-gray-500">Manage device operations via MQTT</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {/* Emergency Stop */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <h4 className="font-medium text-red-900">Emergency Stop</h4>
              <p className="text-sm text-red-700">Immediately halt all operations</p>
            </div>
            <button
              onClick={handleEmergencyStop}
              className="bg-error text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <i className="fas fa-exclamation-triangle mr-2" />
              STOP
            </button>
          </div>

          {/* Auto Mode */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h4 className="font-medium text-blue-900">Auto Mode</h4>
              <p className="text-sm text-blue-700">Optimize energy usage automatically</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={localAutoMode}
                onChange={handleAutoModeToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Grid Export */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <h4 className="font-medium text-green-900">Grid Export</h4>
              <p className="text-sm text-green-700">Export excess energy to grid</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={localGridExport}
                onChange={handleGridExportToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>

          {/* Device Controls */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-3">Device Controls</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleHeatPumpControl('start')}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <i className="fas fa-play mr-2" />
                Start Heat Pump
              </button>
              <button
                onClick={() => handleHeatPumpControl('stop')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                <i className="fas fa-stop mr-2" />
                Stop Heat Pump
              </button>
            </div>
            <button
              onClick={handleChargerControl}
              className="mt-2 w-full bg-accent text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              <i className="fas fa-car mr-2" />
              Start EV Charging
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
