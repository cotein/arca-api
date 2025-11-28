import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as soap from 'soap';
import { ArcaConfigService } from './../arca-config.service';
import { ArcaWsaaService } from './../wsaa/arca-wsaa.service';
import {
  IMontoObligadoResponse,
  ICuitReceptoraResponse,
  IAuthRequest,
} from './../../interfaces/wsfecred.interface';

@Injectable()
export class ArcaWsfecredService {
  private readonly logger = new Logger(ArcaWsfecredService.name);
  private readonly SERVICE_NAME = 'wsfecred';

  // URLs según Manual WSFECRED v2.0.3
  private readonly WSDL_TESTING = 'https://fwshomo.afip.gov.ar/wsfecred/FECredService?wsdl';
  private readonly ENDPOINT_TESTING = 'https://fwshomo.afip.gov.ar/wsfecred/FECredService';
  
  private readonly WSDL_PRODUCTION = 'https://serviciosjava.afip.gob.ar/wsfecred/FECredService?wsdl';
  private readonly ENDPOINT_PRODUCTION = 'https://serviciosjava.afip.gob.ar/wsfecred/FECredService';

  constructor(
    private readonly configService: ArcaConfigService,
    private readonly wsaaService: ArcaWsaaService,
  ) {}

  /**
   * 2.4.22 Consultar Monto Obligado Recepción
   * Devuelve el importe a partir del cual es obligatorio emitir una FCE.
   * @param cuitConsultada (Opcional según manual, pero recomendable enviar el CUIT emisor)
   * @param fecha (Opcional) Fecha para la consulta (YYYY-MM-DD)
   */
  async consultarMontoObligadoRecepcion(cuitConsultada: string, fecha?: string): Promise<IMontoObligadoResponse> {
    this.logger.log(`💰 Consultando Monto Obligado Recepción para CUIT: ${cuitConsultada}`);

    try {
      const auth = await this.getAuth();
      
      const params = {
        authRequest: auth,
        cuitConsultada: parseFloat(cuitConsultada), // WSFECRED espera Long
        fechaEmision: fecha || new Date().toISOString().split('T')[0], // Default HOY
      };

      const client = await this.createSoapClient();
      const response = await this.invokeMethod(client, 'consultarMontoObligadoRecepcion', params);

      this.logger.log('✅ Monto Obligado consultado con éxito');
      return response as IMontoObligadoResponse;
    } catch (error) {
      this.handleError('consultarMontoObligadoRecepcion', error);
    }
  }

  /**
   * 2.4.23 Consultar CUIT Receptora
   * Determina si una CUIT debe recibir FCE (es "Grande" o "PyME Adherida").
   * @param cuitReceptora CUIT del comprador/receptor
   * @param fecha Fecha de la operación (YYYY-MM-DD)
   */
  async consultarCuitReceptora(cuitReceptora: string, fecha: string): Promise<ICuitReceptoraResponse> {
    this.logger.log(`🏢 Consultando si CUIT es Receptora FCE: ${cuitReceptora} al ${fecha}`);

    try {
      const auth = await this.getAuth();

      const params = {
        authRequest: auth,
        cuitReceptora: parseFloat(cuitReceptora),
        fechaEmision: fecha,
      };

      const client = await this.createSoapClient();
      const response = await this.invokeMethod(client, 'consultarCuitReceptora', params);

      this.logger.log(`✅ Consulta Cuit Receptora finalizada. Es Receptora: ${response?.consultarCuitReceptoraReturn?.esReceptora}`);
      return response as ICuitReceptoraResponse;
    } catch (error) {
      this.handleError('consultarCuitReceptora', error);
    }
  }

  // --- Private Helpers ---

  private async getAuth(): Promise<IAuthRequest> {
    const environment = this.configService.getEnvironment();
    // WSFECRED usa el mismo service name en testing y producción
    const ticket = await this.wsaaService.getTicketAcceso(this.SERVICE_NAME, environment);

    return {
      token: ticket.token,
      sign: ticket.sign,
      cuitRepresentada: parseFloat(this.configService.getCuitEmisor()),
    };
  }

  private async createSoapClient(): Promise<any> {
    const isProd = this.configService.getEnvironment() === 'production';
    const wsdl = isProd ? this.WSDL_PRODUCTION : this.WSDL_TESTING;
    const endpoint = isProd ? this.ENDPOINT_PRODUCTION : this.ENDPOINT_TESTING;

    this.logger.debug(`🌐 Creando cliente SOAP WSFECRED (${isProd ? 'PROD' : 'TEST'})`);

    return new Promise((resolve, reject) => {
      soap.createClient(wsdl, { endpoint }, (err, client) => {
        if (err) {
          this.logger.error('❌ Error creando cliente SOAP WSFECRED:', err);
          return reject(err);
        }
        resolve(client);
      });
    });
  }

  private async invokeMethod(client: any, method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      client[method](params, (err: any, result: any) => {
        if (err) {
          return reject(err);
        }
        // Verificar errores de negocio dentro de la respuesta de AFIP
        const returnKey = `${method}Return`;
        if (result[returnKey]?.arrayErrores) {
            const errores = result[returnKey].arrayErrores;
            this.logger.warn(`⚠️ Errores de negocio en ${method}:`, errores);
            // Opcional: Lanzar excepción si hay errores de negocio críticos
        }
        resolve(result);
      });
    });
  }

  private handleError(method: string, error: any): never {
    const msg = error?.root?.Envelope?.Body?.Fault?.faultstring || error.message;
    this.logger.error(`❌ Error en ${method}: ${msg}`, error.stack);
    throw new InternalServerErrorException(`Error en WSFECRED ${method}: ${msg}`);
  }
}