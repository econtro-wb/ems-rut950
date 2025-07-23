import { useState, useEffect } from 'react';
import { PowerGauge } from '@/components/PowerGauge';
import { DeviceStatus } from '@/components/DeviceStatus';
import { SystemControls } from '@/components/SystemControls';
import { ActivityLog } from '@/components/ActivityLog';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { isConnected, deviceData, systemStatus, sendCommand } = useWebSocket();
  const { toast } = useToast();
  
  const [totalPower, setTotalPower] = useState(0);
  const [dailyEnergy, setDailyEnergy] = useState(15.7);
  const [activeDevices, setActiveDevices] = useState(0);
  const [efficiency, setEfficiency] = useState(94.2);
  const [activityEntries, setActivityEntries] = useState<any[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Calculate derived values from device data
  useEffect(() => {
    if (deviceData.length > 0) {
      const total = deviceData.reduce((sum, device) => sum + device.power, 0);
      setTotalPower(total);
      
      const online = deviceData.filter(device => device.isOnline).length;
      setActiveDevices(online);

      // Add activity entries for significant power changes
      deviceData.forEach(device => {
        if (device.power > 0 && device.isOnline) {
          const entry = {
            id: `${device.deviceId}-${Date.now()}`,
            message: `${getDeviceName(device.deviceId)} power: ${device.power.toFixed(1)} kW`,
            deviceId: device.deviceId,
            deviceName: getDeviceName(device.deviceId),
            type: 'info' as const,
            timestamp: new Date().toISOString()
          };
          
          setActivityEntries(prev => {
            const exists = prev.some(e => e.deviceId === device.deviceId && 
              Math.abs(new Date(e.timestamp).getTime() - new Date().getTime()) < 10000);
            return exists ? prev : [entry, ...prev.slice(0, 9)];
          });
        }
      });
    }
  }, [deviceData]);

  // PWA install handler
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const getDeviceName = (deviceId: string) => {
    const names: Record<string, string> = {
      'solar': 'Solar Inverter',
      'heatpump': 'Heat Pump',
      'charger': 'EV Charger'
    };
    return names[deviceId] || deviceId;
  };

  const getDeviceData = (deviceId: string) => {
    return deviceData.find(d => d.deviceId === deviceId) || {
      deviceId,
      power: 0,
      isOnline: false,
      timestamp: new Date().toISOString()
    };
  };

  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "App Installed",
          description: "Energy Dashboard has been installed successfully!"
        });
      }
      
      setDeferredPrompt(null);
    }
  };

  const handleCommand = (deviceId: string, command: string, value?: any) => {
    sendCommand(deviceId, command, value);
    
    const entry = {
      id: `cmd-${Date.now()}`,
      message: `Command sent: ${command} to ${getDeviceName(deviceId)}`,
      deviceId,
      deviceName: getDeviceName(deviceId),
      type: 'info' as const,
      timestamp: new Date().toISOString()
    };
    
    setActivityEntries(prev => [entry, ...prev.slice(0, 9)]);
    
    toast({
      title: "Command Sent",
      description: `${command} command sent to ${getDeviceName(deviceId)}`
    });
  };

  const solarData = getDeviceData('solar');
  const heatPumpData = getDeviceData('heatpump');
  const chargerData = getDeviceData('charger');

  const devices = [
    {
      id: 'solar',
      name: 'Solar Inverter',
      address: '192.168.1.100',
      port: 502,
      isOnline: solarData.isOnline,
      lastSeen: solarData.timestamp
    },
    {
      id: 'heatpump',
      name: 'Heat Pump',
      address: '192.168.1.101',
      port: 502,
      isOnline: heatPumpData.isOnline,
      lastSeen: heatPumpData.timestamp
    },
    {
      id: 'charger',
      name: 'EV Charger',
      address: '192.168.1.102',
      port: 502,
      isOnline: chargerData.isOnline,
      lastSeen: chargerData.timestamp
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <i className="fas fa-bolt text-primary text-2xl" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Energy Management</h1>
                <p className="text-sm text-gray-500">Teltonika RUT950 Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-error'}`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {deferredPrompt && (
                <button
                  onClick={handlePWAInstall}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-download mr-2" />
                  Install App
                </button>
              )}

              <button className="text-gray-500 hover:text-gray-700 transition-colors p-2">
                <i className="fas fa-cog text-lg" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Power</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPower.toFixed(1)} kW</p>
                  <p className="text-sm text-success">Real-time monitoring</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bolt text-primary text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Energy Today</p>
                  <p className="text-2xl font-bold text-gray-900">{dailyEnergy} kWh</p>
                  <p className="text-sm text-success">Estimated total</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-solar-panel text-secondary text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Devices</p>
                  <p className="text-2xl font-bold text-gray-900">{activeDevices}/3</p>
                  <p className="text-sm text-success">
                    {activeDevices === 3 ? 'All systems online' : `${3 - activeDevices} offline`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-success text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-gray-900">{efficiency}%</p>
                  <p className="text-sm text-success">Optimal performance</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-accent text-xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-Time Gauges */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-Time Power Monitoring</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PowerGauge
              value={solarData.power}
              maxValue={2.5}
              unit="kW"
              color="hsl(129, 49%, 48%)"
              title="Solar PV"
              isOnline={solarData.isOnline}
              additionalData={[
                { label: 'Voltage', value: `${solarData.voltage?.toFixed(1) || '0.0'} V` },
                { label: 'Current', value: `${solarData.current?.toFixed(1) || '0.0'} A` }
              ]}
              onControl={() => handleCommand('solar', 'configure')}
              controlLabel="Configure PV"
            />

            <PowerGauge
              value={heatPumpData.power}
              maxValue={1.2}
              unit="kW"
              color="hsl(207, 73%, 45%)"
              title="Heat Pump"
              isOnline={heatPumpData.isOnline}
              additionalData={[
                { label: 'Temperature', value: `${heatPumpData.temperature?.toFixed(1) || '0.0'}°C` },
                { label: 'COP', value: '4.2' }
              ]}
              onControl={() => handleCommand('heatpump', 'toggle')}
              controlLabel="Toggle Pump"
            />

            <PowerGauge
              value={chargerData.power}
              maxValue={3.0}
              unit="kW"
              color="hsl(25, 100%, 50%)"
              title="EV Charger"
              isOnline={chargerData.isOnline}
              additionalData={[
                { label: 'Status', value: chargerData.isOnline ? 'Ready' : 'Disconnected' },
                { label: 'Session', value: '-- kWh' }
              ]}
              onControl={() => handleCommand('charger', 'start_charging')}
              controlLabel="Start Charging"
            />
          </div>
        </section>

        {/* Controls and Status */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SystemControls
              onCommand={handleCommand}
              autoMode={systemStatus.autoMode || false}
              gridExport={systemStatus.gridExport || false}
            />

            <DeviceStatus
              devices={devices}
              mqttConnected={systemStatus.mqttConnected || false}
            />
          </div>
        </section>

        {/* Activity Log */}
        <ActivityLog entries={activityEntries} />
      </main>

      {/* Offline Notification */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="fas fa-wifi-slash text-error" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">App is offline</h4>
              <p className="text-sm text-gray-600">
                Connection lost. Retrying automatically...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
