import type { Express } from "express";
import { createServer, type Server } from "http";
import { ModbusService } from "./services/modbus";
import { MqttService } from "./services/mqtt";
import { WebSocketService } from "./services/websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  const modbusService = new ModbusService();
  const mqttService = new MqttService();

  // Start Modbus polling
  modbusService.startPolling(2000);

  // API Routes
  app.get('/api/devices', async (req, res) => {
    try {
      const devices = modbusService.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get devices' });
    }
  });

  app.get('/api/data', async (req, res) => {
    try {
      const data = await modbusService.readAllDevices();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read device data' });
    }
  });

  app.post('/api/command', async (req, res) => {
    try {
      const { deviceId, command, value } = req.body;
      
      if (!deviceId || !command) {
        return res.status(400).json({ error: 'deviceId and command are required' });
      }

      const success = await mqttService.publishCommand({ deviceId, command, value });
      
      if (success) {
        res.json({ success: true, message: 'Command sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send command' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to process command' });
    }
  });

  app.post('/api/system/control', async (req, res) => {
    try {
      const { control, value } = req.body;
      
      if (!control) {
        return res.status(400).json({ error: 'control parameter is required' });
      }

      const success = await mqttService.publishSystemControl(control, value);
      
      if (success) {
        res.json({ success: true, message: 'System control updated' });
      } else {
        res.status(500).json({ error: 'Failed to update system control' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to process system control' });
    }
  });

  app.get('/api/status', (req, res) => {
    res.json({
      modbus: {
        devices: modbusService.getDevices().length,
        polling: true
      },
      mqtt: {
        connected: mqttService.isConnectedToBroker()
      },
      timestamp: new Date().toISOString()
    });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize WebSocket service
  const wsService = new WebSocketService(httpServer, modbusService, mqttService);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Shutting down services...');
    modbusService.disconnect();
    mqttService.disconnect();
    wsService.close();
  });

  return httpServer;
}
