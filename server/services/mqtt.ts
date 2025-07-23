import * as mqtt from 'mqtt';
import { EventEmitter } from 'events';

export interface MqttCommand {
  deviceId: string;
  command: string;
  value?: any;
}

export class MqttService extends EventEmitter {
  private client: mqtt.MqttClient | null = null;
  private brokerUrl: string;
  private isConnected: boolean = false;

  constructor() {
    super();
    this.brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    this.connect();
  }

  private connect() {
    try {
      this.client = mqtt.connect(this.brokerUrl, {
        clientId: `energy-dashboard-${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        connectTimeout: 4000,
        username: process.env.MQTT_USERNAME || '',
        password: process.env.MQTT_PASSWORD || '',
        reconnectPeriod: 1000,
      });

      this.client.on('connect', () => {
        console.log('Connected to MQTT broker');
        this.isConnected = true;
        this.subscribeToTopics();
        this.emit('connected');
      });

      this.client.on('error', (error) => {
        console.error('MQTT connection error:', error);
        this.isConnected = false;
        // Don't emit error to prevent uncaught exceptions - just log it
        console.log('MQTT broker unavailable - running in disconnected mode');
      });

      this.client.on('close', () => {
        console.log('MQTT connection closed');
        this.isConnected = false;
        this.emit('disconnected');
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });

    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error);
      this.emit('error', error);
    }
  }

  private subscribeToTopics() {
    if (!this.client) return;

    const topics = [
      'energy/solar/status',
      'energy/heatpump/status',
      'energy/charger/status',
      'energy/system/controls'
    ];

    topics.forEach(topic => {
      this.client?.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    });
  }

  private handleMessage(topic: string, message: Buffer) {
    try {
      const data = JSON.parse(message.toString());
      console.log(`Received MQTT message on ${topic}:`, data);
      
      this.emit('message', {
        topic,
        data
      });

    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  }

  async publishCommand(command: MqttCommand): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      console.error('MQTT client not connected');
      return false;
    }

    try {
      const topic = `energy/${command.deviceId}/command`;
      const payload = JSON.stringify({
        command: command.command,
        value: command.value,
        timestamp: new Date().toISOString()
      });

      return new Promise((resolve) => {
        this.client!.publish(topic, payload, (err) => {
          if (err) {
            console.error(`Failed to publish command to ${topic}:`, err);
            resolve(false);
          } else {
            console.log(`Published command to ${topic}:`, payload);
            resolve(true);
          }
        });
      });

    } catch (error) {
      console.error('Error publishing MQTT command:', error);
      return false;
    }
  }

  async publishSystemControl(control: string, value: any): Promise<boolean> {
    return this.publishCommand({
      deviceId: 'system',
      command: control,
      value
    });
  }

  isConnectedToBroker(): boolean {
    return this.isConnected;
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.isConnected = false;
    }
  }
}
