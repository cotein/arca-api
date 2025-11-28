import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as soap from 'soap';
import { ArcaConfigService } from '../../services/arca-config.service';
import { ArcaWsaaService } from '../../services/wsaa/arca-wsaa.service';
import {
  IDummyResponseA13,
  IGetPersonaA13Response,
  IGetIdPersonaListByDocumentoResponse,
} from '../../interfaces/padron-a13.interface'; // Ajusta la ruta según tu estructura

/**
 * Servicio para interactuar con el Web Service de Padrón Alcance 13
 * (ws_sr_padron_a13)
 * * Permite obtener datos de identificación y domicilios (fiscal y legal).
 * Documentación: Manual ws_sr_padron_a13 v1.3
 */
@Injectable()
export class ArcaPadronA13Service {
  private readonly logger = new Logger(ArcaPadronA13Service.name);
  
  // ID del servicio para el Ticket de Acceso (Pág 6, punto 2.4)
  private readonly SERVICE_NAME = 'ws_sr_padron_a13';
  
  // Forzamos producción como solicitado
  private readonly FORCE_ENV: 'production' = 'production';

  // URLs según Manual (Pág 5, punto 2.3)
  private readonly WSDL_PRODUCTION =
    'https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA13?WSDL';
  
  private readonly ENDPOINT_PRODUCTION =
    'https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA13';

  // URLs Testing (Dejadas como referencia aunque no se usen por el FORCE_ENV)
  private readonly WSDL_TESTING =
    'https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA13?WSDL';
  
  private readonly ENDPOINT_TESTING =
    'https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA13';

  constructor(
    private readonly configService: ArcaConfigService,
    private readonly wsaaService: ArcaWsaaService,
  ) {}

  /**
   * Método dummy - Verificación del servicio (Pág 6, punto 3.1)
   */
  async dummy(): Promise<IDummyResponseA13> {
    this.logger.log('🔍 Ejecutando método dummy A13...');

    try {
      const client = await this.createSoapClient();
      const response = await this.invokeMethod(client, 'dummy', {});

      this.logger.log('✅ Dummy A13 ejecutado con éxito');
      return response.return as IDummyResponseA13;
    } catch (error) {
      this.logger.error('❌ Error ejecutando dummy A13:', error);
      throw new InternalServerErrorException('Error conectando con ARCA Padron A13');
    }
  }

  /**
   * Método getPersona - Obtiene datos del contribuyente (Pág 8, punto 3.2)
   * @param idPersona CUIT del contribuyente (11 dígitos)
   */
  async getPersona(idPersona: string): Promise<IGetPersonaA13Response> {
    this.logger.log(`📋 Consultando persona A13: ${idPersona}`);

    try {
      // 1. Obtener ticket de acceso (WSAA)
      const ticket = await this.wsaaService.getTicketAcceso(this.SERVICE_NAME, this.FORCE_ENV);

      // 2. Preparar parámetros según esquema (Pág 8)
      // Nota: cuitRepresentada debe ser el CUIT del emisor del certificado
      const params = {
        token: ticket.token,
        sign: ticket.sign,
        cuitRepresentada: this.configService.getCuitEmisor(),
        idPersona: idPersona,
      };

      // 3. Crear cliente e invocar
      const client = await this.createSoapClient();
      const response = await this.invokeMethod(client, 'getPersona', params);

      this.logger.log('✅ Datos de persona A13 obtenidos exitosamente');
      return response as IGetPersonaA13Response;
    } catch (error) {
      this.logger.error(`❌ Error consultando persona A13 ${idPersona}:`, error);
      throw error;
    }
  }

  /**
   * Método getIdPersonaListByDocumento - Búsqueda por documento (Pág 12, punto 3.3)
   * @param documento Número de documento a buscar
   */
  async getIdPersonaListByDocumento(documento: string): Promise<IGetIdPersonaListByDocumentoResponse> {
    this.logger.log(`📋 Buscando CUITs por documento: ${documento}`);

    try {
      // 1. Obtener ticket de acceso
      const ticket = await this.wsaaService.getTicketAcceso(this.SERVICE_NAME, this.FORCE_ENV);

      // 2. Preparar parámetros
      const params = {
        token: ticket.token,
        sign: ticket.sign,
        cuitRepresentada: this.configService.getCuitEmisor(),
        documento: documento,
      };

      // 3. Crear cliente e invocar
      const client = await this.createSoapClient();
      const response = await this.invokeMethod(client, 'getIdPersonaListByDocumento', params);

      this.logger.log('✅ Búsqueda por documento finalizada');
      return response as IGetIdPersonaListByDocumentoResponse;
    } catch (error) {
      this.logger.error(`❌ Error buscando por documento ${documento}:`, error);
      throw error;
    }
  }

  // --- Private Helpers ---

  private async createSoapClient(): Promise<any> {
    // Forzamos producción siempre para este servicio
    const isProduction = true; 

    const wsdlPath = this.WSDL_PRODUCTION;
    const endpoint = this.ENDPOINT_PRODUCTION;

    this.logger.debug(`🌐 Creando cliente SOAP A13 - Endpoint: ${endpoint}`);

    return new Promise((resolve, reject) => {
      soap.createClient(wsdlPath, { endpoint }, (err, client) => {
        if (err) {
          this.logger.error('❌ Error creando cliente SOAP A13:', err);
          return reject(err);
        }
        resolve(client);
      });
    });
  }

  private async invokeMethod(
    client: any,
    methodName: string,
    params: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      client[methodName](params, (err: any, result: any) => {
        if (err) {
          // Intento de mejorar el mensaje de error si viene de SOAP
          const errorMsg = err?.root?.Envelope?.Body?.Fault?.faultstring || err.message;
          this.logger.error(`❌ Error SOAP en ${methodName}: ${errorMsg}`);
          return reject(new Error(errorMsg));
        }
        resolve(result);
      });
    });
  }
}