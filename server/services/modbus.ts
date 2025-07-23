import * as Modbus from 'jsmodbus';
import * as net from 'net';
import { EventEmitter } from 'events';

export interface ModbusDevice {
  id: string;
  name: string;
  address: string;
  port: number;
  type: 'solar' | 'heatpump' | 'charger';
  registers: {
    power: number;
    voltage?: number;
    current?: number;
    temperature?: number;
  };
}

export interface DeviceData {
  deviceId: string;
  power: number;
  voltage?: number;
  current?: number;
  temperature?: number;
  timestamp: Date;
  isOnline: boolean;
}

export class ModbusService extends EventEmitter {
  private devices: Map<string, ModbusDevice> = new Map();
  private clients: Map<string, any> = new Map();
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeDevices();
  }

  private initializeDevices() {
    const defaultDevices: ModbusDevice[] = [
      {
        id: 'solar',
        name: 'Solar Inverter',
        address: process.env.SOLAR_INVERTER_IP || '192.168.1.100',
        port: parseInt(process.env.SOLAR_INVERTER_PORT || '502'),
        type: 'solar',
        registers: { power: 40083, voltage: 40085, current: 40087 }
      },
      {
        id: 'heatpump',
        name: 'Heat Pump',
        address: process.env.HEATPUMP_IP || '192.168.1.101',
        port: parseInt(process.env.HEATPUMP_PORT || '502'),
        type: 'heatpump',
        registers: { power: 1001, temperature: 1003 }
      },
      {
        id: 'charger',
        name: 'EV Charger',
        address: process.env.CHARGER_IP || '192.168.1.102',
        port: parseInt(process.env.CHARGER_PORT || '502'),
        type: 'charger',
        registers: { power: 5001, voltage: 5003, current: 5005 }
      }
    ];

    defaultDevices.forEach(device => {
      this.devices.set(device.id, device);
      this.connectDevice(device);
    });
  }

  private connectDevice(device: ModbusDevice) {
    try {
      const socket = new net.Socket();
      const client = new Modbus.client.TCP(socket, 1);

      socket.connect({
        host: device.address,
        port: device.port
      });

      socket.on('connect', () => {
        console.log(`Connected to ${device.name} at ${device.address}:${device.port}`);
        this.clients.set(device.id, client);
        this.emit('deviceConnected', device.id);
      });

      socket.on('error', (err) => {
        console.error(`Connection error for ${device.name}:`, err.message);
        this.emit('deviceDisconnected', device.id, err);
      });

      socket.on('close', () => {
        console.log(`Connection closed for ${device.name}`);
        this.clients.delete(device.id);
        this.emit('deviceDisconnected', device.id);
      });

    } catch (error) {
      console.error(`Failed to connect to ${device.name}:`, error);
      this.emit('deviceDisconnected', device.id, error);
    }
  }

  async readDeviceData(deviceId: string): Promise<DeviceData | null> {
    const device = this.devices.get(deviceId);
    const client = this.clients.get(deviceId);

    if (!device || !client) {
      return null;
    }

    try {
      const data: DeviceData = {
        deviceId,
        power: 0,
        timestamp: new Date(),
        isOnline: true
      };

      // Read power register
      const powerResult = await client.readHoldingRegisters(device.registers.power, 1);
      data.power = powerResult.response.body.values[0] / 100; // Convert to kW

      // Read additional registers based on device type
      if (device.registers.voltage) {
        const voltageResult = await client.readHoldingRegisters(device.registers.voltage, 1);
        data.voltage = voltageResult.response.body.values[0] / 10;
      }

      if (device.registers.current) {
        const currentResult = await client.readHoldingRegisters(device.registers.current, 1);
        data.current = currentResult.response.body.values[0] / 100;
      }

      if (device.registers.temperature) {
        const tempResult = await client.readHoldingRegisters(device.registers.temperature, 1);
        data.temperature = tempResult.response.body.values[0] / 10;
      }

      return data;

    } catch (error) {
      console.error(`Error reading data from ${device.name}:`, error);
      return {
        deviceId,
        power: 0,
        timestamp: new Date(),
        isOnline: false
      };
    }
  }

  async readAllDevices(): Promise<DeviceData[]> {
    const promises = Array.from(this.devices.keys()).map(deviceId => 
      this.readDeviceData(deviceId)
    );

    const results = await Promise.allSettled(promises);
    return results
      .filter((result): result is PromiseFulfilledResult<DeviceData> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  startPolling(intervalMs: number = 2000) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      try {
        const data = await this.readAllDevices();
        this.emit('dataUpdate', data);
      } catch (error) {
        console.error('Error during polling:', error);
      }
    }, intervalMs);
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getDevices(): ModbusDevice[] {
    return Array.from(this.devices.values());
  }

  disconnect() {
    this.stopPolling();
    this.clients.forEach((client, deviceId) => {
      try {
        client.socket.destroy();
      } catch (error) {
        console.error(`Error disconnecting ${deviceId}:`, error);
      }
    });
    this.clients.clear();
  }
}
