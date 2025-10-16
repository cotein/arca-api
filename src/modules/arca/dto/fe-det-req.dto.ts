export class FeDetReqDto {
  Concepto: number; // 1: Productos, 2: Servicios, 3: Productos y Servicios
  DocTipo: number; // Tipo de documento
  DocNro: number; // Número de documento
  CbteDesde: number; // Número de comprobante desde
  CbteHasta: number; // Número de comprobante hasta
  CbteFch: string; // Fecha del comprobante (YYYYMMDD)
  ImpTotal: number; // Importe total
  ImpTotConc: number; // Importe neto no gravado
  ImpNeto: number; // Importe neto gravado
  ImpOpEx: number; // Importe exento
  ImpIVA: number; // Importe de IVA
  ImpTrib: number; // Importe de tributos
  MonId: string; // Código de moneda (PES, DOL, etc)
  MonCotiz: number; // Cotización de moneda
  CondicionIVAReceptorId?: number; // Condición IVA del receptor (opcional hasta RG 5616)

  // Campos opcionales según concepto
  FchServDesde?: string; // Fecha servicio desde (obligatorio para concepto 2 o 3)
  FchServHasta?: string; // Fecha servicio hasta (obligatorio para concepto 2 o 3)
  FchVtoPago?: string; // Fecha vencimiento pago (obligatorio para concepto 2 o 3)

  // Arrays opcionales
  CbtesAsoc?: CbteAsocDto[];
  Tributos?: TributoDto[];
  Iva?: AlicIvaDto[];
  Opcionales?: OpcionalDto[];
}

export class CbteAsocDto {
  Tipo: number;
  PtoVta: number;
  Nro: number;
  Cuit?: string;
  CbteFch?: string;
}

export class TributoDto {
  Id: number;
  Desc: string;
  BaseImp: number;
  Alic: number;
  Importe: number;
}

export class AlicIvaDto {
  Id: number; // 3: 0%, 4: 10.5%, 5: 21%, 6: 27%
  BaseImp: number;
  Importe: number;
}

export class OpcionalDto {
  Id: string;
  Valor: string;
}