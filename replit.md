# Energy Management Dashboard - Teltonika RUT950

## Overview

This is a lightweight Progressive Web Application (PWA) designed as an energy management dashboard for Teltonika RUT950 devices. The application provides real-time monitoring and control of energy devices including solar inverters, heat pumps, and EV chargers through Modbus TCP and MQTT protocols. Built with a React frontend and Express backend, it features offline capabilities and is optimized for mobile use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **PWA Features**: Service Worker for offline capabilities, Web App Manifest for app-like experience

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live data streaming
- **Industrial Protocols**: Modbus TCP client for device communication, MQTT client for command publishing

## Key Components

### Database Schema (shared/schema.ts)
- **devices**: Device registry with connection details and status
- **energyData**: Time-series energy measurements (power, voltage, current, temperature)
- **systemControls**: Global system settings and modes
- **activityLog**: System events and alerts with severity levels

### Server Services
- **ModbusService**: Handles TCP connections to industrial devices, polls register data at configurable intervals
- **MqttService**: Manages MQTT broker connection for publishing device commands
- **WebSocketService**: Provides real-time data streaming to connected clients

### Frontend Components
- **PowerGauge**: Circular progress indicators showing real-time power consumption with device status
- **DeviceStatus**: Connection monitoring dashboard showing Modbus TCP and MQTT connectivity
- **SystemControls**: Device operation controls with safety interlocks (emergency stop, auto mode)
- **ActivityLog**: Real-time event feed with device activity and system alerts

## Data Flow

1. **Device Data Collection**: ModbusService polls devices every 2 seconds, reading power/voltage/current registers
2. **Data Storage**: Measurements are stored in PostgreSQL with timestamps for historical analysis
3. **Real-time Updates**: WebSocket broadcasts live data to all connected clients
4. **Command Processing**: User commands flow through MQTT to device controllers
5. **Offline Support**: Service Worker caches critical resources, dashboard works without network

## External Dependencies

### Core Runtime
- **Database**: Neon PostgreSQL (serverless) accessed via @neondatabase/serverless driver
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Industrial Protocols**: jsmodbus library for Modbus TCP client functionality
- **Message Broker**: Standard MQTT.js client for device command publishing

### UI Framework
- **Component Library**: Complete Radix UI primitive set (dialogs, tooltips, forms, navigation)
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React icon library
- **Fonts**: Google Fonts (Roboto) and Font Awesome for enhanced UI

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Development**: tsx for TypeScript execution, hot module replacement
- **Code Quality**: ESBuild for production bundling

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Database**: Drizzle migrations applied via `drizzle-kit push` command

### Production Requirements
- **Node.js Environment**: ES modules with DATABASE_URL environment variable
- **Network Access**: Outbound connections to Modbus devices (port 502) and MQTT broker
- **Static Files**: Express serves built React application from public directory
- **Process Management**: Application designed for containerized deployment

### Environment Configuration
- **SOLAR_INVERTER_IP/PORT**: Modbus TCP connection parameters for solar devices
- **MQTT_BROKER_URL**: Message broker endpoint for device commands
- **MQTT_USERNAME/PASSWORD**: Authentication credentials for MQTT broker
- **DATABASE_URL**: PostgreSQL connection string for data persistence

The application is architected for reliability in industrial environments with connection retry logic, offline capabilities, and graceful degradation when devices are unavailable.