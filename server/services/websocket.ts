import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { ModbusService, DeviceData } from './modbus';
import { MqttService, MqttCommand } from './mqtt';

export interface WebSocketMessage {
  type: 'deviceData' | 'systemStatus' | 'command' | 'error';
  data: any;
  timestamp: Date;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private modbusService: ModbusService;
  private mqttService: MqttService;
  private clients: Set<WebSocket> = new Set();

  constructor(server: Server, modbusService: ModbusService, mqttService: MqttService) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.modbusService = modbusService;
    this.mqttService = mqttService;

    this.setupWebSocketServer();
    this.setupServiceListeners();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection established');
      this.clients.add(ws);

      // Send initial system status
      this.sendToClient(ws, {
        type: 'systemStatus',
        data: {
          modbusDevices: this.modbusService.getDevices(),
          mqttConnected: this.mqttService.isConnectedToBroker()
        },
        timestamp: new Date()
      });

      ws.on('message', (message: Buffer) => {
        this.handleClientMessage(ws, message);
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  private setupServiceListeners() {
    // Listen for Modbus data updates
    this.modbusService.on('dataUpdate', (data: DeviceData[]) => {
      this.broadcastToClients({
        type: 'deviceData',
        data,
        timestamp: new Date()
      });
    });

    // Listen for MQTT messages
    this.mqttService.on('message', (message) => {
      this.broadcastToClients({
        type: 'systemStatus',
        data: message,
        timestamp: new Date()
      });
    });

    // Listen for device connection status changes
    this.modbusService.on('deviceConnected', (deviceId) => {
      this.broadcastToClients({
        type: 'systemStatus',
        data: { deviceId, status: 'connected' },
        timestamp: new Date()
      });
    });

    this.modbusService.on('deviceDisconnected', (deviceId) => {
      this.broadcastToClients({
        type: 'systemStatus',
        data: { deviceId, status: 'disconnected' },
        timestamp: new Date()
      });
    });
  }

  private handleClientMessage(ws: WebSocket, message: Buffer) {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'command':
          this.handleCommand(ws, data.payload);
          break;
        case 'ping':
          this.sendToClient(ws, {
            type: 'systemStatus',
            data: { pong: true },
            timestamp: new Date()
          });
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }

    } catch (error) {
      console.error('Error handling client message:', error);
      this.sendToClient(ws, {
        type: 'error',
        data: { message: 'Invalid message format' },
        timestamp: new Date()
      });
    }
  }

  private async handleCommand(ws: WebSocket, command: MqttCommand) {
    try {
      const success = await this.mqttService.publishCommand(command);
      
      this.sendToClient(ws, {
        type: 'systemStatus',
        data: { commandSent: success, command },
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error handling command:', error);
      this.sendToClient(ws, {
        type: 'error',
        data: { message: 'Failed to execute command', error: String(error) },
        timestamp: new Date()
      });
    }
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcastToClients(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      } else {
        this.clients.delete(ws);
      }
    });
  }

  getConnectionCount(): number {
    return this.clients.size;
  }

  close() {
    this.wss.close();
    this.clients.clear();
  }
}
