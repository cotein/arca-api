# Guía de Instalación - ARCA NestJS Integration

## Requisitos Previos
- Node.js 16+
- npm o yarn
- OpenSSL instalado
- Certificados ARCA (.crt y .key)

## Pasos de Instalación

### 1. Clonar y instalar dependencias
```bash
npm install
```

### 2. Crear estructura de directorios
```bash
mkdir -p certs ws/{testing,production}
```

### 3. Obtener y copiar certificados
- Descargar certificados desde WSASS de ARCA
- Copiar archivos:
  - `TESTING.crt` → `certs/TESTING.crt`
  - `PRODUCTION.crt` → `certs/PRODUCTION.crt`
  - `private_key.key` → `certs/private_key.key`

### 4. Descargar WSDL
```bash
# Testing WSAA
wget https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL -O ws/testing/wsaa.wsdl

# Production WSAA
wget https://wsaa.afip.gov.ar/ws/services/LoginCms?WSDL -O ws/production/wsaa.wsdl

# Testing WSFE
wget https://wswhomo.afip.gov.ar/wsfev1/service.asmx?WSDL -O ws/testing/WSFE.wsdl

# Production WSFE
wget https://servicios1.afip.gov.ar/wsfev1/service.asmx?WSDL -O ws/production/WSFE.wsdl
```

### 5. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con los valores correspondientes
nano .env
```

### 6. Iniciar la aplicación
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Verificación

### 1. Validar configuración
```bash
curl http://localhost:3000/arca/ambiente
```

Respuesta esperada:
```json
{
  "ambiente": "testing",
  "wsaaUrl": "https://wsaahomo.afip.gov.ar/ws/services/LoginCms",
  "wsfeUrl": "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
  "cuit": "20227339730"
}
```

### 2. Ejecutar ejemplos
```bash
npm run example:crear-factura
npm run example:consultar
```

## Troubleshooting

### Error: "Certificado no emitido por AC de confianza"
- Verificar que usas el certificado correcto para el ambiente
- Certificado testing → WSAA testing
- Certificado production → WSAA production

### Error: "El CEE ya posee un TA valido"
- Normal si solicitas múltiples TA en corto tiempo
- El servicio cachea tokens por 10 min (testing) o 2 min (production)

### Error de OpenSSL
- Instalar OpenSSL: `brew install openssl` (macOS) o `apt-get install openssl` (Linux)
- Verificar que esté en el PATH: `openssl version`

### Problemas de hora
- Sincronizar fecha/hora del sistema: `ntpdate time.afip.gov.ar`
- Verificar zona horaria: debe ser GMT-3 (ART)

## Logs

Todos los logs se guardan con detalles:
```bash
# Verificar logs en tiempo real
tail -f logs/app.log

# Búsqueda específica
grep "Error" logs/app.log
grep "WSAA" logs/app.log
```

## Cambio de Ambiente en Tiempo Real
```bash
# Cambiar a production
curl -X POST http://localhost:3000/arca/ambiente \
  -H "Content-Type: application/json" \
  -d '{"ambiente":"production"}'

# Verificar cambio
curl http://localhost:3000/arca/ambiente
```

##### Archivo .env example

# WSAA URLs
ARCA_WSAA_URL=https://wsaahomo.afip.gov.ar/ws/services/LoginCms
ARCA_WSAA_PROD_URL=https://wsaa.afip.gov.ar/ws/services/LoginCms

# WSDL Paths (Testing)
ARCA_WSAA_TESTING_PATH=ws/testing/wsaa.wsdl
ARCA_WSAA_PRODUCTION_PATH=ws/production/wsaa.wsdl

# Certificates
ARCA_TESTING_PATH=certs/TESTING.crt
ARCA_PRODUCTION_PATH=certs/PRODUCTION.crt
ARCA_PRIVATE_KEY_PATH=certs/private_key.key

# CUIT
ARCA_CUIT_EMISOR=20227339730

# WSFE URLs
ARCA_WSFE_URL_TESTING=https://wswhomo.afip.gov.ar/wsfev1/service.asmx
ARCA_WSFE_URL_PRODUCTION=https://servicios1.afip.gov.ar/wsfev1/service.asmx

# WSFE WSDL Paths
ARCA_WSFE_TESTING_PATH=ws/testing/WSFE.wsdl
ARCA_WSFE_PRODUCTION_PATH=ws/production/WSFE.wsdl

# App Config
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

## 16. Estructura Final de Directorios
```
proyecto/
├── src/
│   ├── modules/
│   │   └── arca/
│   │       ├── services/
│   │       │   ├── wsaa/
│   │       │   │   └── arca-wsaa.service.ts
│   │       │   ├── wsfe/
│   │       │   │   └── arca-wsfe.service.ts
│   │       │   └── arca-config.service.ts
│   │       ├── utils/
│   │       │   └── cms-signer.service.ts
│   │       ├── interfaces/
│   │       │   └── ticket-acceso.interface.ts
│   │       ├── dto/
│   │       │   ├── fe-cab-req.dto.ts
│   │       │   ├── fe-det-req.dto.ts
│   │       │   └── fe-cae-solicitar-req.dto.ts
│   │       ├── exceptions/
│   │       │   └── arca.exceptions.ts
│   │       ├── arca.module.ts
│   │       └── arca.controller.ts
│   ├── app.module.ts
│   └── main.ts
├── examples/
│   ├── crear-factura-simple.ts
│   └── consultar-comprobante.ts
├── certs/
│   ├── TESTING.crt
│   ├── PRODUCTION.crt
│   └── private_key.key
├── ws/
│   ├── testing/
│   │   ├── wsaa.wsdl
│   │   └── WSFE.wsdl
│   └── production/
│       ├── wsaa.wsdl
│       └── WSFE.wsdl
├── .env
├── .env.example
├── SETUP.md
├── package.json
├── tsconfig.json
└── README.md