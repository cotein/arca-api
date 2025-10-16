# ARCA Web Services Integration - NestJS

Integración robusta y escalable de los Web Services SOAP de ARCA (Facturación Electrónica) en una aplicación NestJS.

## Características

✅ **Autenticación Automática**: Gestión transparente de tickets de acceso
✅ **Cache Inteligente**: Reutilización de tokens para optimizar performance
✅ **Soporte Multi-Ambiente**: Testing y Producción configurables en tiempo real
✅ **Firma Digital**: Integración con OpenSSL para CMS signing
✅ **Logging Detallado**: Trazabilidad completa de operaciones
✅ **Manejo de Errores**: Excepciones específicas y recuperables
✅ **Type-Safe**: Tipos TypeScript para DTOs y responses

## API Endpoints

### Gestión de Ambiente
```bash
# Cambiar ambiente
POST /arca/ambiente
Body: { "ambiente": "testing" | "production" }

# Obtener información actual
GET /arca/ambiente
```

### Comprobantes
```bash
# Solicitar CAE (Código de Autorización Electrónico)
POST /arca/cae/solicitar
Body: FeCAESolicitarReqDto

# Obtener último comprobante autorizado
GET /arca/comprobante/ultimo?ptoVta=1&tipo=1

# Consultar comprobante específico
GET /arca/comprobante/consultar?ptoVta=1&tipo=1&nro=1

# Obtener tipos de comprobantes
GET /arca/tipos-comprobantes

# Obtener puntos de venta
GET /arca/puntos-venta
```

## Uso Básico

### 1. Configuración Inicial
```typescript
// El módulo se carga automáticamente desde .env
// Validar que los certificados existan y sean correctos
```

### 2. Solicitar CAE
```typescript
const solicitud: FeCAESolicitarReqDto = {
  FeCabReq: {
    CantReg: 1,
    PtoVta: 1,
    CbteTipo: 1, // Factura A
  },
  FeDetReq: [
    {
      Concepto: 1,
      DocTipo: 80,
      DocNro: 20111111112,
      CbteDesde: 1,
      CbteHasta: 1,
      CbteFch: '20240101',
      ImpTotal: 121.00,
      ImpTotConc: 0,
      ImpNeto: 100,
      ImpOpEx: 0,
      ImpTrib: 0,
      ImpIVA: 21,
      MonId: 'PES',
      MonCotiz: 1,
      Iva: [{ Id: 5, BaseImp: 100, Importe: 21 }],
    },
  ],
};

const response = await this.wsfeService.solicitarCAE(solicitud);
```

## Estructura de Respuestas

### Respuesta CAE Exitosa
```json
{
  "FeCabResp": {
    "Cuit": 20227339730,
    "PtoVta": 1,
    "CbteTipo": 1,
    "FchProceso": "20240101120000",
    "CantReg": 1,
    "Resultado": "A"
  },
  "FeDetResp": {
    "FECAEDetResponse": {
      "Resultado": "A",
      "CAE": "61234578901234",
      "CAEFchVto": "20240131"
    }
  }
}
```

## Seguridad

- Los certificados se cargan desde rutas seguras
- Las claves privadas nunca se exponen en logs
- Los tokens se cachean en memoria con validación de expiración
- OpenSSL se usa para operaciones criptográficas
- HTTPS obligatorio para comunicación con ARCA

## Performance

- Cache de tokens con buffer de seguridad (2 minutos antes de expiración)
- Conexiones SOAP reutilizadas
- Logging asincrónico
- Validación early en la configuración

## Troubleshooting

Ver [SETUP.md](./SETUP.md) para solución de problemas comunes.

## Licencia

MIT# arca-api
