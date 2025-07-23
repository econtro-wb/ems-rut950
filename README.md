# Energy Management Dashboard - Teltonika RUT950

Een lichtgewicht Progressive Web Application (PWA) voor energiebeheer, speciaal ontworpen voor Teltonika RUT950 apparaten. Het dashboard biedt real-time monitoring en controle van energie-apparaten zoals zonnepanelen, warmtepompen en EV-laders via Modbus TCP en MQTT protocollen.

## Features

- **Real-time Monitoring**: Live power monitoring met circulaire gauges voor Solar PV, Warmtepomp en EV-lader
- **WebSocket Verbindingen**: Live data updates van Modbus apparaten
- **Systeemcontroles**: Emergency stop, auto modus en grid export schakelaars
- **Device Status**: Monitoring van Modbus TCP & MQTT connectiviteit
- **Activity Log**: Real-time gebeurtenissen en systeemwaarschuwingen
- **PWA Functionaliteit**: Offline ondersteuning en app installatie
- **Mobiel Geoptimaliseerd**: Professionele dashboard layout voor mobiel en desktop

## Tech Stack

### Backend
- **Node.js + Express**: REST API en WebSocket server
- **jsmodbus**: Modbus TCP client voor industriële apparaten
- **MQTT.js**: MQTT client voor device commands
- **PostgreSQL**: Database voor historische data
- **WebSocket**: Real-time data streaming

### Frontend
- **React 18**: Frontend framework met TypeScript
- **Vite**: Development en build tooling
- **shadcn/ui**: UI componenten gebaseerd op Radix UI
- **Tailwind CSS**: Styling en theming
- **TanStack Query**: Server state management
- **Service Worker**: PWA functionaliteit

## Installatie

1. **Clone de repository**:
```bash
git clone <your-repo-url>
cd energy-dashboard
```

2. **Installeer dependencies**:
```bash
npm install
```

3. **Environment variabelen** (optioneel):
```bash
# .env
SOLAR_INVERTER_IP=192.168.1.100
SOLAR_INVERTER_PORT=502
HEATPUMP_IP=192.168.1.101
HEATPUMP_PORT=502
CHARGER_IP=192.168.1.102
CHARGER_PORT=502
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=
DATABASE_URL=your_postgresql_url
```

4. **Start de applicatie**:
```bash
npm run dev
```

De applicatie draait nu op `http://localhost:5000`

## Gebruik

### Dashboard
- **Power Gauges**: Real-time vermogen weergave voor alle aangesloten apparaten
- **Connection Status**: Monitor de verbindingsstatus van Modbus en MQTT
- **System Controls**: Beheer apparaten via MQTT commands
- **Activity Log**: Bekijk recente systeemgebeurtenissen

### PWA Installatie
- Klik op "Install App" in de browser om het dashboard als app te installeren
- Werkt offline na eerste laden
- Push notificaties voor belangrijke gebeurtenissen

## Device Configuratie

Het systeem ondersteunt deze standaard apparaten:

- **Solar Inverter** (192.168.1.100:502)
- **Heat Pump** (192.168.1.101:502) 
- **EV Charger** (192.168.1.102:502)

IP-adressen en poorten kunnen worden geconfigureerd via environment variabelen.

## API Endpoints

- `GET /api/devices` - Lijst van alle apparaten
- `GET /api/data` - Actuele apparaat data
- `POST /api/command` - Verstuur MQTT command
- `POST /api/system/control` - Systeem controles
- `GET /api/status` - Systeem status

## WebSocket Events

- `deviceData` - Real-time power data
- `systemStatus` - Verbindingsstatus updates
- `command` - Device commands
- `error` - Foutmeldingen

## Development

```bash
# Development server
npm run dev

# Build voor productie
npm run build

# Type checking
npm run type-check
```

## Deployment

Het project is geoptimaliseerd voor deployment op:
- **Replit**: Direct deployment via Replit
- **Docker**: Containerized deployment
- **VPS**: Standard Node.js hosting

## Hardware Requirements

- **Teltonika RUT950** router
- **Modbus TCP** compatibele energie-apparaten
- **MQTT Broker** voor device commands
- **Network Access** naar apparaat IP-adressen

## Licentie

MIT License - Zie LICENSE bestand voor details.

## Support

Voor vragen of ondersteuning, maak een issue aan in deze repository.