import { Injectable, Logger } from '@nestjs/common';
import * as soap from 'soap';
import { ArcaConfigService, ArcaEnvironment } from '../arca-config.service';
import { CmsSignerService } from '../../utils/cms-signer.service';
import {
  ITicketAcceso,
  ILoginTicketRequest,
  ILoginTicketResponse,
} from '../../interfaces/ticket-acceso.interface';
import * as xml2js from 'xml2js';

@Injectable()
export class ArcaWsaaService {
  private readonly logger = new Logger(ArcaWsaaService.name);
  private ticketCache = new Map<string, ITicketAcceso>();

  constructor(
    private readonly configService: ArcaConfigService,
    private readonly cmsSigner: CmsSignerService,
  ) {}

  /**
   * Modificado: Acepta env opcional
   */
  async getTicketAcceso(service: string, env?: ArcaEnvironment): Promise<ITicketAcceso> {
    // Si no se pasa env, usa el default del sistema
    const targetEnv = env || this.configService.getEnvironment();
    
    this.logger.log(`📍 Solicitando TA para servicio: ${service} en modo: ${targetEnv}`);

    // Cache key compuesta para no mezclar entornos
    const cacheKey = `${service}_${targetEnv}`;

    const cachedTicket = this.ticketCache.get(cacheKey);
    if (cachedTicket && this.isTicketValid(cachedTicket)) {
      this.logger.log('💾 Usando TA desde cache');
      return cachedTicket;
    }

    // Pasamos targetEnv a requestNewTicket
    const ticket = await this.requestNewTicket(service, targetEnv);
    this.ticketCache.set(cacheKey, ticket);

    return ticket;
  }

  private async requestNewTicket(service: string, env: ArcaEnvironment): Promise<ITicketAcceso> {
    // ... log ...
    try {
      const tra = this.createTRA(service);
      
      // PEDIMOS RUTAS USANDO EL ENV ESPECÍFICO
      const certPath = this.configService.getCertificatePath(env);
      const keyPath = this.configService.getPrivateKeyPath(); // Ojo aquí si usas keys distintas
      
      const signedCMS = await this.signTRA(tra, certPath, keyPath);
      
      // LLAMAMOS AL WSAA CON EL ENV ESPECÍFICO
      const response = await this.callWSAA(signedCMS, env);
      
      return await this.parseTicketResponse(response, service);
    } catch (error) {
       // ... error handling ...
       throw error;
    }
  }

  /**
   * Crea el XML del TRA (Ticket de Requerimiento de Acceso)
   */
  private createTRA(service: string): string {
    const now = new Date();
    // Ajustar la hora de generación para evitar estar en el futuro (restar 2 minutos)
    const generationTime = new Date(now.getTime() - 2 * 60 * 1000);
    // Ajustar la expiración para que sea 12 horas después de la generación
    const expiration = new Date(generationTime.getTime() + 12 * 60 * 60 * 1000);

    const tra: ILoginTicketRequest = {
      uniqueId: Math.floor(Date.now() / 1000),
      generationTime: this.formatDate(generationTime),
      expirationTime: this.formatDate(expiration),
      service,
    };

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${tra.uniqueId}</uniqueId>
    <generationTime>${tra.generationTime}</generationTime>
    <expirationTime>${tra.expirationTime}</expirationTime>
  </header>
  <service>${tra.service}</service>
</loginTicketRequest>`;

    this.logger.debug('TRA XML generado correctamente');
    return xml;
  }

  /**
   * Firma el TRA usando el servicio de firma digital
   */
  private async signTRA(
    tra: string,
    certPath: string,
    keyPath: string,
  ): Promise<string> {
    this.logger.log('🔒 Iniciando firma digital...');
    this.logger.debug(`Certificado: ${certPath}`);
    this.logger.debug(`Clave privada: ${keyPath}`);

    try {
      const signedCMS = await this.cmsSigner.signMessage(tra, certPath, keyPath);
      this.logger.log('✓ Firma digital completada');
      return signedCMS;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Error en firma digital:', error.message);
        throw error;
      } else {
        this.logger.error('Error en firma digital:', JSON.stringify(error));
        throw new Error('Error desconocido en firma digital');
      }
    }
  }

  /**
   * Llama al servicio WSAA
   */
  private async callWSAA(signedCMS: string, env: ArcaEnvironment): Promise<string> {
    const wsdlPath = this.configService.getWsaaWsdlPath(env);
    const wsaaUrl = this.configService.getWsaaUrl(env);

    this.logger.log(`🌐 Conectando a WSAA: ${wsaaUrl}`);
    this.logger.debug(`WSDL: ${wsdlPath}`);

    return new Promise((resolve, reject) => {
      soap.createClient(wsdlPath, { endpoint: wsaaUrl }, (err, client) => {
        if (err) {
          this.logger.error('❌ Error creando cliente SOAP:', err.message);
          return reject(
            new Error(`Error creando cliente SOAP: ${err.message}`),
          );
        }

        this.logger.log('✓ Cliente SOAP creado');

        const params = { in0: signedCMS };
        this.logger.log('Invocando método loginCms...');

        client.loginCms(params, (error, result) => {
          if (error) {
            this.logger.error('❌ Error en loginCms:', error);
            return reject(error);
          }

          this.logger.log('✓ Respuesta recibida');
          resolve(result.loginCmsReturn);
        });
      });
    });
  }

  /**
   * Parsea la respuesta XML del WSAA
   */
  private async parseTicketResponse(
    xmlResponse: string,
    service: string,
  ): Promise<ITicketAcceso> {
    try {
      this.logger.log('Parseando respuesta XML...');

      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(xmlResponse);

      const response: ILoginTicketResponse =
        result.loginTicketResponse;

      if (!response || !response.credentials) {
        throw new Error('Respuesta inválida del WSAA');
      }

      const ticket: ITicketAcceso = {
        token: response.credentials.token,
        sign: response.credentials.sign,
        generationTime: new Date(response.header.generationTime),
        expirationTime: new Date(response.header.expirationTime),
        service,
      };

      this.logger.log('✓ Respuesta parseada correctamente');
      this.logger.log(
        `Validez del ticket: ${this.formatDate(ticket.expirationTime)}`,
      );

      return ticket;
    } catch (error) {
      this.logger.error('Error parseando respuesta del WSAA:', error);
      throw error;
    }
  }

  /**
   * Verifica si un ticket sigue siendo válido
   */
  private isTicketValid(ticket: ITicketAcceso): boolean {
    const now = new Date();
    const expirationWithBuffer = new Date(
      ticket.expirationTime.getTime() - 2 * 60 * 1000,
    ); // 2 min buffer

    const isValid = now < expirationWithBuffer;
    this.logger.debug(
      `Validez ticket: ${isValid} (Expira: ${this.formatDate(ticket.expirationTime)})`,
    );

    return isValid;
  }

  /**
   * Formatea una fecha al formato requerido por ARCA
   */
  private formatDate(date: Date): string {
    // Formato ISO 8601 con zona horaria explícita -03:00
    const pad = (num: number) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    // Construir string con zona horaria -03:00
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-03:00`;
  }

  /**
   * Limpia el cache de tickets
   */
  clearCache(): void {
    this.logger.log('🗑️ Limpiando cache de tickets');
    this.ticketCache.clear();
  }

  /**
   * Obtiene información del cache (para debugging)
   */
  getCacheInfo(): Map<string, ITicketAcceso> {
    return this.ticketCache;
  }
}
