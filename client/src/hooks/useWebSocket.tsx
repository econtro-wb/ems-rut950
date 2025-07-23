import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: 'deviceData' | 'systemStatus' | 'command' | 'error';
  data: any;
  timestamp: string;
}

export interface DeviceData {
  deviceId: string;
  power: number;
  voltage?: number;
  current?: number;
  temperature?: number;
  timestamp: string;
  isOnline: boolean;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>({});
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Send ping to verify connection
        sendMessage({ type: 'ping' });
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          switch (message.type) {
            case 'deviceData':
              setDeviceData(message.data);
              break;
            case 'systemStatus':
              setSystemStatus((prev: any) => ({ ...prev, ...message.data }));
              break;
            case 'error':
              console.error('WebSocket error:', message.data);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setTimeout(connect, 3000);
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  const sendCommand = useCallback((deviceId: string, command: string, value?: any) => {
    sendMessage({
      type: 'command',
      payload: { deviceId, command, value }
    });
  }, [sendMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastMessage,
    deviceData,
    systemStatus,
    sendCommand,
    sendMessage
  };
}
