export interface IDummyResponseA13 {
  appserver: string;
  authserver: string;
  dbserver: string;
}

export interface IPersonaA13 {
  apellido?: string;
  nombre?: string;
  razonSocial?: string;
  tipoPersona?: 'FISICA' | 'JURIDICA';
  tipoClave?: 'CUIT' | 'CUIL' | 'CDI';
  estadoClave?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  fechaNacimiento?: string;
  mesCierre?: number;
  fechaInscripcion?: string;
  fechaContratoSocial?: string;
  idActividadPrincipal?: number;
  descripcionActividadPrincipal?: string;
  domicilio?: IDomicilioA13[];
  periodoActividadPrincipal?: number;
}

export interface IDomicilioA13 {
  calle: string;
  numero: string;
  piso?: string;
  oficina?: string;
  sector?: string;
  torre?: string;
  manzana?: string;
  localidad: string;
  codPostal: string;
  idProvincia: number;
  descripcionProvincia: string;
  tipoDomicilio: 'FISCAL' | 'LEGAL/REAL';
  estadoDomicilio?: string;
  direccion?: string; // Campo calculado que suele devolver AFIP concatenado
}

export interface IGetPersonaA13Response {
  personaReturn: {
    metadata: {
      fechaHora: string;
      servidor: string;
    };
    persona?: IPersonaA13;
    errorConstancia?: {
      error: string[]; // Ajustado para capturar errores
    };
  };
}

export interface IGetIdPersonaListByDocumentoResponse {
  idPersonaListReturn: {
    metadata: {
      fechaHora: string;
      servidor: string;
    };
    idPersona?: string[]; // Array de CUITs encontrados
  };
}