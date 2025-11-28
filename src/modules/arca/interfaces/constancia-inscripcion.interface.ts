/**
 * Interfaces para el Web Service de Constancia de Inscripción (ws_sr_constancia_inscripcion)
 * Basado en el manual v3.7 de ARCA
 */

// ============================================
// Respuesta del método dummy
// ============================================
export interface IDummyResponse {
  appserver: string;
  authserver: string;
  dbserver: string;
}

// ============================================
// Datos Generales
// ============================================
export interface IDomicilioFiscal {
  codPostal?: string;
  descripcionProvincia?: string;
  direccion?: string;
  idProvincia?: number;
  localidad?: string;
  tipoDomicilio?: string;
}

export interface IDatosGenerales {
  apellido?: string;
  domicilioFiscal?: IDomicilioFiscal;
  esSucesion?: string; // "SI" o "NO"
  estadoClave?: string; // "ACTIVO", etc.
  idPersona: string; // CUIT
  mesCierre?: string;
  nombre?: string;
  tipoClave?: string; // "CUIT"
  tipoPersona?: string; // "FISICA" o "JURIDICA"
  personaFallecida?: string; // "S" o "N"
}

// ============================================
// Datos Régimen General
// ============================================
export interface IActividad {
  idActividad?: number;
  nomenclador?: number;
  orden?: number;
  periodo?: number;
}

export interface IImpuesto {
  descripcionImpuesto?: string;
  estadoImpuesto?: string; // "AC" = Activo
  idImpuesto?: number;
  motivo?: string;
  periodo?: number;
}

export interface IDatosRegimenGeneral {
  actividad?: IActividad[];
  impuesto?: IImpuesto[];
  regimen?: IRegimen[];
  caracterizacion?: ICaracterizacion[];
}

export interface IRegimen {
  idRegimen?: number;
  descripcionRegimen?: string;
  tipoRegimen?: number;
  periodo?: number;
}

export interface ICaracterizacion {
  idCaracterizacion?: number;
  descripcionCaracterizacion?: string;
  periodo?: number;
}

// ============================================
// Datos Monotributo
// ============================================
export interface IActividadMonotributista {
  descripcionActividad?: string;
  idActividad?: number;
  nomenclador?: number;
  orden?: number;
  periodo?: number;
}

export interface ICategoriaMonotributo {
  descripcionCategoria?: string;
  idCategoria?: number;
  idImpuesto?: number;
  periodo?: number;
}

export interface IComponenteSociedad {
  apellido?: string;
  cuit?: string;
  nombre?: string;
  tipoComponente?: number;
}

export interface IDatosMonotributo {
  actividadMonotributista?: IActividadMonotributista[];
  categoriaMonotributo?: ICategoriaMonotributo[];
  componenteSociedad?: IComponenteSociedad[];
  impuesto?: IImpuesto;
}

// ============================================
// Errores
// ============================================
export interface IErrorConstancia {
  error?: string;
}

// ============================================
// Respuesta completa de getPersona_v2
// ============================================
export interface IMetadata {
  fechaHora?: string;
  servidor?: string;
}

export interface IPersonaReturn {
  metadata?: IMetadata;
  datosGenerales?: IDatosGenerales;
  datosRegimenGeneral?: IDatosRegimenGeneral;
  datosMonotributo?: IDatosMonotributo;
  errorConstancia?: IErrorConstancia;
  errorRegimenGeneral?: IErrorConstancia;
  errorMonotributo?: IErrorConstancia;
}

export interface IGetPersonaResponse {
  personaReturn: IPersonaReturn;
}

// ============================================
// Respuesta de getPersonaList_v2
// ============================================
export interface IGetPersonaListResponse {
  persona?: IPersonaReturn[];
}

// ============================================
// Parámetros de entrada
// ============================================
export interface IGetPersonaRequest {
  token: string;
  sign: string;
  cuitRepresentada: string;
  idPersona: string;
}

export interface IGetPersonaListRequest {
  token: string;
  sign: string;
  cuitRepresentada: string;
  idPersona: string[]; // Array de hasta 250 CUITs
}
