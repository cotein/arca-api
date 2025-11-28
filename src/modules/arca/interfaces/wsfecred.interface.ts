export interface IAuthRequest {
  token: string;
  sign: string;
  cuitRepresentada: number;
}

export interface IMontoObligadoResponse {
  montoObligadoRecepcionReturn: {
    montoDesde: number;
    fechaVigenciaDesde: string; // Format YYYY-MM-DD
    fechaVigenciaHasta?: string;
    arrayErrores?: {
      codigoError: number;
      descripcionError: string;
    }[];
    arrayObservaciones?: {
      codigoObservacion: number;
      descripcionObservacion: string;
    }[];
    evento?: {
      codigoEvento: number;
      descripcionEvento: string;
    };
  };
}

export interface ICuitReceptoraResponse {
  consultarCuitReceptoraReturn: {
    esReceptora: string; // "S" o "N"
    fechaVigenciaDesde?: string;
    fechaVigenciaHasta?: string;
    arrayErrores?: {
      codigoError: number;
      descripcionError: string;
    }[];
    arrayObservaciones?: {
      codigoObservacion: number;
      descripcionObservacion: string;
    }[];
    evento?: {
      codigoEvento: number;
      descripcionEvento: string;
    };
  };
}

export interface IWsfecredConfig {
  wsdl: string;
  endpoint: string;
}