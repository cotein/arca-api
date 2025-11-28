import { Injectable, Logger } from '@nestjs/common';
import * as soap from 'soap';
import { ArcaConfigService } from './../arca-config.service';
import { ArcaWsaaService } from './../wsaa/arca-wsaa.service';
import {
  IDummyResponse,
  IGetPersonaResponse,
  IGetPersonaListResponse,
} from './../../interfaces/constancia-inscripcion.interface';

/**
 * Servicio para interactuar con el Web Service de Constancia de Inscripción de ARCA
 * (ws_sr_constancia_inscripcion)
 * 
 * Este servicio permite consultar los datos de la constancia de inscripción de contribuyentes
 * registrados en el Padrón de ARCA.
 * 
 * Documentación: Manual ws_sr_constancia_inscripcion v3.7
 */
@Injectable()
export class ArcaConstanciaInscripcionService {
  private readonly logger = new Logger(ArcaConstanciaInscripcionService.name);
  private readonly SERVICE_NAME = 'ws_sr_constancia_inscripcion';
  private readonly FORCE_ENV: 'production' = 'production';

  // URLs según el manual
  private readonly WSDL_TESTING =
    'https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA5?WSDL';
  private readonly WSDL_PRODUCTION =
    'https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA5?WSDL';

  private readonly ENDPOINT_TESTING =
    'https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA5';
  private readonly ENDPOINT_PRODUCTION =
    'https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA5';

  constructor(
    private readonly configService: ArcaConfigService,
    private readonly wsaaService: ArcaWsaaService,
  ) {}

  /**
   * Método dummy - Verifica el estado y disponibilidad del servicio
   * @returns Estado de los servidores (appserver, authserver, dbserver)
   */
  async dummy(): Promise<IDummyResponse> {
    this.logger.log('🔍 Ejecutando método dummy...');

    try {
      const client = await this.createSoapClient();
      const response = await this.invokeMethod(client, 'dummy', {});

      this.logger.log('✅ Dummy ejecutado con éxito');
      this.logger.debug('Respuesta:', response);

      return response.return as IDummyResponse;
    } catch (error) {
      this.logger.error('❌ Error ejecutando dummy:', error);
      throw error;
    }
  }

  /**
   * Método getPersona_v2 - Obtiene los datos de constancia de inscripción de un contribuyente
   * @param idPersona - CUIT del contribuyente a consultar
   * @returns Datos completos de la constancia de inscripción
   */
  async getPersona(idPersona: string): Promise<IGetPersonaResponse> {
    this.logger.log(`📋 Consultando persona: ${idPersona}`);

    try {
      // 1. Obtener ticket de acceso
      const ticket = await this.wsaaService.getTicketAcceso(this.SERVICE_NAME, this.FORCE_ENV);
      this.logger.log('✓ Ticket de acceso obtenido');

      // 2. Preparar parámetros
      const params = {
        token: ticket.token,
        sign: ticket.sign,
        cuitRepresentada: this.configService.getCuitEmisor(),
        idPersona: idPersona,
      };

      // 3. Crear cliente SOAP
      const client = await this.createSoapClient();

      // 4. Invocar método getPersona_v2
      const response = await this.invokeMethod(client, 'getPersona_v2', params);

      this.logger.log('✅ Datos de persona obtenidos exitosamente');
      return response as IGetPersonaResponse;
    } catch (error) {
      this.logger.error(`❌ Error consultando persona ${idPersona}:`, error);
      throw error;
    }
  }

  /**
   * Método getPersonaList_v2 - Obtiene los datos de constancia de inscripción de múltiples contribuyentes
   * @param idPersonas - Array de CUITs (máximo 250)
   * @returns Datos de constancia de inscripción de todos los contribuyentes solicitados
   */
  async getPersonaList(idPersonas: string[]): Promise<IGetPersonaListResponse> {
    // Validar cantidad máxima
    if (idPersonas.length > 250) {
      throw new Error(
        'El método getPersonaList_v2 acepta un máximo de 250 CUITs',
      );
    }

    this.logger.log(
      `📋 Consultando lista de ${idPersonas.length} personas...`,
    );

    try {
      // 1. Obtener ticket de acceso
      const ticket = await this.wsaaService.getTicketAcceso(this.SERVICE_NAME, this.FORCE_ENV);
      this.logger.log('✓ Ticket de acceso obtenido');

      // 2. Preparar parámetros
      const params = {
        token: ticket.token,
        sign: ticket.sign,
        cuitRepresentada: this.configService.getCuitEmisor(),
        idPersona: idPersonas,
      };

      // 3. Crear cliente SOAP
      const client = await this.createSoapClient();

      // 4. Invocar método getPersonaList_v2
      const response = await this.invokeMethod(
        client,
        'getPersonaList_v2',
        params,
      );

      this.logger.log('✅ Lista de personas obtenida exitosamente');
      return response as IGetPersonaListResponse;
    } catch (error) {
      this.logger.error('❌ Error consultando lista de personas:', error);
      throw error;
    }
  }

  /**
   * Crea el cliente SOAP para el servicio de Constancia de Inscripción
   * @private
   */
  private async createSoapClient(): Promise<any> {
    const isProduction = true; // Antes: this.configService.getEnvironment() === 'production';

    const wsdlPath = this.WSDL_PRODUCTION;
    const endpoint = this.ENDPOINT_PRODUCTION;

    this.logger.log(
      `🌐 Creando cliente SOAP - Ambiente: ${isProduction ? 'PRODUCCIÓN' : 'TESTING'}`,
    );
    this.logger.debug(`WSDL: ${wsdlPath}`);
    this.logger.debug(`Endpoint: ${endpoint}`);

    return new Promise((resolve, reject) => {
      soap.createClient(wsdlPath, { endpoint }, (err, client) => {
        if (err) {
          this.logger.error('❌ Error creando cliente SOAP:', err);
          return reject(err);
        }
        this.logger.log('✓ Cliente SOAP creado exitosamente');
        resolve(client);
      });
    });
  }

  /**
   * Invoca un método del web service
   * @private
   */
  private async invokeMethod(
    client: any,
    methodName: string,
    params: any,
  ): Promise<any> {
    this.logger.debug(`Invocando método: ${methodName}`);

    return new Promise((resolve, reject) => {
      client[methodName](params, (err: any, result: any) => {
        if (err) {
          this.logger.error(`❌ Error invocando ${methodName}:`, err);
          return reject(err);
        }
        this.logger.debug(`✓ Método ${methodName} ejecutado exitosamente`);
        resolve(result);
      });
    });
  }

  /**
   * Obtiene la URL del WSDL según el ambiente configurado
   */
  getWsdlUrl(): string {
    return this.configService.getEnvironment() === 'production'

      ? this.WSDL_PRODUCTION
      : this.WSDL_TESTING;
  }

  /**
   * Obtiene la URL del endpoint según el ambiente configurado
   */
  getEndpointUrl(): string {
    return this.configService.getEnvironment() === 'production'

      ? this.ENDPOINT_PRODUCTION
      : this.ENDPOINT_TESTING;
  }
}
