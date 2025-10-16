/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import * as soap from 'soap';
import { ArcaConfigService } from '../arca-config.service';
import { ArcaWsaaService } from '../wsaa/arca-wsaa.service';
import { FeCAESolicitarReqDto } from '../../dto/fe-cae-solicitar-req.dto';

@Injectable()
export class ArcaWsfeService {
  private readonly logger = new Logger(ArcaWsfeService.name);
  private readonly SERVICE_NAME = 'wsfe';

  constructor(
    private readonly configService: ArcaConfigService,
    private readonly wsaaService: ArcaWsaaService,
  ) {}
  /**
   * Solicita un CAE (Código de Autorización Electrónico)
   */
  async solicitarCAE(request: FeCAESolicitarReqDto): Promise<any> {
    this.logger.log('Iniciando solicitud de CAE...');

    try {
      // 1. Obtener ticket de acceso
      const ticket = await this.wsaaService.getTicketAcceso(this.SERVICE_NAME);
      this.logger.log('Ticket de acceso obtenido');

      // 2. Preparar parámetros de autenticación
      const auth = {
        Token: ticket.token,
        Sign: ticket.sign,
        Cuit: this.configService.getCuitEmisor(),
      };

      // 3. Crear cliente SOAP
      const client = await this.createSoapClient();

      // 4. Llamar al método FECAESolicitar
      const response = await this.invokeMethod(client, 'FECAESolicitar', {
        Auth: auth,
        FeCAEReq: request,
      });

      this.logger.log('CAE obtenido exitosamente');
      return response;
    } catch (error) {
      this.logger.error('Error solicitando CAE:', error);
      throw error;
    }
  }

  /**
   * Obtiene el último comprobante autorizado
   */
  async getUltimoComprobanteAutorizado(
    ptoVta: number,
    cbteTipo: number,
  ): Promise<any> {
    this.logger.log(
      `Consultando último comprobante - PtoVta: ${ptoVta}, Tipo: ${cbteTipo}`,
    );

    try {
      const ticket = await this.wsaaService.getTicketAcceso(this.SERVICE_NAME);
      const auth = {
        Token: ticket.token,
        Sign: ticket.sign,
        Cuit: this.configService.getCuitEmisor(),
      };

      const client = await this.createSoapClient();
      const response = await this.invokeMethod(
        client,
        'FECompUltimoAutorizado',
        {
          Auth: auth,
          PtoVta: ptoVta,
          CbteTipo: cbteTipo,
        },
      );

      return response;
    } catch (error) {
      this.logger.error('Error consultando último comprobante:', error);
      throw error;
    }
  }

  /**
   * Consulta un comprobante específico
   */
  async consultarComprobante(
    ptoVta: number,
    cbteTipo: number,
    cbteNro: number,
  ): Promise<any> {
    this.logger.log(
      `Consultando comprobante - PtoVta: ${ptoVta}, Tipo: ${cbteTipo}, Nro: ${cbteNro}`,
    );

    try {
      const ticket = await this.wsaaService.getTicketAcceso(this.SERVICE_NAME);
      const auth = {
        Token: ticket.token,
        Sign: ticket.sign,
        Cuit: this.configService.getCuitEmisor(),
      };

      const client = await this.createSoapClient();
      const response = await this.invokeMethod(client, 'FECompConsultar', {
        Auth: auth,
        FeCompConsReq: {
          CbteTipo: cbteTipo,
          CbteNro: cbteNro,
          PtoVta: ptoVta,
        },
      });

      return response;
    } catch (error) {
      this.logger.error('Error consultando comprobante:', error);
      throw error;
    }
  }

  /**
   * Obtiene tipos de comprobantes disponibles
   */
  async getTiposComprobantes(): Promise<any> {
    this.logger.log('Consultando tipos de comprobantes...');

    try {
      const ticket = await this.wsaaService.getTicketAcceso(this.SERVICE_NAME);
      const auth = {
        Token: ticket.token,
        Sign: ticket.sign,
        Cuit: this.configService.getCuitEmisor(),
      };

      const client = await this.createSoapClient();
      const response = await this.invokeMethod(client, 'FEParamGetTiposCbte', {
        Auth: auth,
      });

      return response;
    } catch (error) {
      this.logger.error('Error consultando tipos de comprobantes:', error);
      throw error;
    }
  }

  /**
   * Obtiene puntos de venta habilitados
   */
  async getPuntosVenta(): Promise<any> {
    this.logger.log('Consultando puntos de venta...');

    try {
      const ticket = await this.wsaaService.getTicketAcceso(this.SERVICE_NAME);
      const auth = {
        Token: ticket.token,
        Sign: ticket.sign,
        Cuit: this.configService.getCuitEmisor(),
      };

      const client = await this.createSoapClient();
      const response = await this.invokeMethod(client, 'FEParamGetPtosVenta', {
        Auth: auth,
      });

      return response;
    } catch (error) {
      this.logger.error('Error consultando puntos de venta:', error);
      throw error;
    }
  }

  /**
   * Crea el cliente SOAP para WSFE
   */
  private async createSoapClient(): Promise<any> {
    const wsdlPath = this.configService.getWsfeWsdlPath();
    const wsfeUrl = this.configService.getWsfeUrl();

    this.logger.log(`Creando cliente SOAP - WSDL: ${wsdlPath}`);

    return new Promise((resolve, reject) => {
      soap.createClient(wsdlPath, { endpoint: wsfeUrl }, (err, client) => {
        if (err) {
          this.logger.error('Error creando cliente SOAP:', err);
          return reject(err);
        }
        resolve(client);
      });
    });
  }

  async testDummy(): Promise<{
    AppServer: string;
    DbServer: string;
    AuthServer: string;
  }> {
    console.log('🚀 Ejecutando FEDummy...');

    // 1. Obtiene la URL del WSDL según el entorno (testing/producción)
    const wsdlUrl = this.configService.getWsfeWsdlPath(); // Asume que este método devuelve la ruta al archivo WSDL

    // Opcional: si tienes la URL directa del WSDL en el .env, úsala
    // const wsdlUrl = this.configService.getWsfeUrl() + '?wsdl';

    try {
      // 2. Crea el cliente SOAP a partir del WSDL
      const client = await soap.createClientAsync(wsdlUrl);

      // 3. Llama al método Dummy del Web Service
      // El método se llama `FEDummyAsync` por convención de la librería node-soap
      const [result] = await client.FEDummyAsync({});

      // 4. Procesa y devuelve la respuesta
      const dummyResult = result.FEDummyResult;
      console.log('✅ FEDummy ejecutado con éxito:', dummyResult);

      return dummyResult;
    } catch (error) {
      console.error('❌ Error al ejecutar FEDummy:', error.message);
      // Extrae la información relevante del error SOAP si está disponible
      const fault = error.root?.Envelope?.Body?.Fault;
      if (fault) {
        console.error('Detalle del error SOAP:', fault);
        throw new Error(`Error de AFIP: ${fault.faultstring}`);
      }
      throw error; // Lanza el error original si no es un error SOAP
    }
  }

  /**
   * Invoca un método del web service
   */
  private async invokeMethod(
    client: any,
    methodName: string,
    params: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      client[methodName](params, (err, result) => {
        if (err) {
          this.logger.error(`Error invocando ${methodName}:`, err);
          return reject(err);
        }
        resolve(result);
      });
    });
  }
}
