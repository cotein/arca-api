/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export type ArcaEnvironment = 'testing' | 'production';

@Injectable()
export class ArcaConfigService {
  private readonly logger = new Logger(ArcaConfigService.name);
  private currentEnvironment: ArcaEnvironment;

  constructor(private configService: ConfigService) {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    // 3. Asignamos el entorno basado en la variable
    if (nodeEnv === 'production') {
      this.currentEnvironment = 'production';
    } else {
      this.currentEnvironment = 'testing'; // Si es 'development' o no está definido, será 'testing'
    }

    this.logger.log(
      `Entorno inicializado como: ${this.currentEnvironment.toUpperCase()}`,
    );

    this.validateConfiguration();
  }

  /**
   * Cambia el entorno activo (testing/production)
   */
  setEnvironment(env: ArcaEnvironment): void {
    this.logger.log(`Cambiando entorno a: ${env}`);
    this.currentEnvironment = env;
  }

  /**
   * Obtiene el entorno actual
   */
  getEnvironment(): ArcaEnvironment {
    return this.currentEnvironment;
  }

  /**
   * Obtiene la URL del WSAA según el entorno
   */
  getWsaaUrl(envOverride?: ArcaEnvironment): string {
    const env = envOverride || this.currentEnvironment;
    const envKey = env === 'production' ? 'ARCA_WSAA_PROD_URL' : 'ARCA_WSAA_URL';
    
    const url = this.configService.get(envKey, { infer: true });
    if (!url) throw new Error(`La variable '${envKey}' no está definida.`);
    return url;
  }

  /**
   * Obtiene la ruta del WSDL del WSAA permitiendo override
   */
  getWsaaWsdlPath(envOverride?: ArcaEnvironment): string {
    const env = envOverride || this.currentEnvironment;
    const wsdlKey = env === 'production' ? 'ARCA_WSAA_PRODUCTION_PATH' : 'ARCA_WSAA_TESTING_PATH';
    
    const wsdlPath = this.configService.get(wsdlKey, { infer: true });
    return path.resolve(process.cwd(), wsdlPath);
  }

  /**
   * Obtiene la URL del WSFE según el entorno
   */
  getWsfeUrl(): string {
    // 1. Determina la clave de configuración a usar
    const urlKey =
      this.currentEnvironment === 'production'
        ? 'ARCA_WSFE_URL_PRODUCTION'
        : 'ARCA_WSFE_URL_TESTING';

    // 2. Obtén el valor de forma segura, asegurando que es un string
    const url = this.configService.get(urlKey, { infer: true });

    return url;
  }

  /**
   * Obtiene la ruta del WSDL del WSFE
   */
  getWsfeWsdlPath(): string {
    // 1. Determina la clave de configuración que necesitas
    const wsdlKey =
      this.currentEnvironment === 'production'
        ? 'ARCA_WSFE_PRODUCTION_PATH'
        : 'ARCA_WSFE_TESTING_PATH';

    // 2. Obtén el valor de forma segura, garantizando que es un string
    const wsdlPath = this.configService.get(wsdlKey, { infer: true });

    // 3. Ahora wsdlPath es un 'string' y path.resolve() funciona correctamente
    return path.resolve(process.cwd(), wsdlPath);
  }

  /**
   * Obtiene la URL del WSFECRED según el entorno
   */
  getWsfecredUrl(): string {
    // 1. Determina la clave de configuración a usar
    const urlKey =
      this.currentEnvironment === 'production'
        ? 'ARCA_WSFECRED_URL_PRODUCTION'
        : 'ARCA_WSFECRED_URL_TESTING';

    // 2. Obtén el valor de forma segura, asegurando que es un string
    const url = this.configService.get(urlKey, { infer: true });

    return url;
  }

  /**
   * Obtiene la ruta del WSDL del WSFECRED
   */
  getWsfecredWsdlPath(): string {
    // 1. Determina la clave de configuración que necesitas
    const wsdlKey =
      this.currentEnvironment === 'production'
        ? 'ARCA_WSFECRED_PRODUCTION_PATH'
        : 'ARCA_WSFECRED_TESTING_PATH';

    // 2. Obtén el valor de forma segura, garantizando que es un string
    const wsdlPath = this.configService.get(wsdlKey, { infer: true });

    // 3. Ahora wsdlPath es un 'string' y path.resolve() funciona correctamente
    return path.resolve(process.cwd(), wsdlPath);
  }

  /**
   * Obtiene la ruta del certificado permitiendo override
   */
  getCertificatePath(envOverride?: ArcaEnvironment): string {
    const env = envOverride || this.currentEnvironment;
    const certKey = env === 'production' ? 'ARCA_PRODUCTION_PATH' : 'ARCA_TESTING_PATH';
    
    const certPath = this.configService.get(certKey, { infer: true });
    return path.resolve(process.cwd(), certPath);
  }

  /**
   * Obtiene la ruta de la clave privada
   */
  getPrivateKeyPath(): string {
    // 1. Obtén el valor de forma segura, asegurando que es un string
    const keyPath = this.configService.get('ARCA_PRIVATE_KEY_PATH', {
      infer: true,
    });

    // 2. Ahora que 'keyPath' es un string, pásalo a path.resolve()
    return path.resolve(process.cwd(), keyPath);
  }

  /**
   * Obtiene el CUIT del emisor
   */
  getCuitEmisor(): string {
    // El "!" al final fuerza a TypeScript a tratarlo como un string
    return this.configService.get<string>('ARCA_CUIT_EMISOR')!;
  }

  /**
   * Valida que todos los archivos necesarios existan
   */
  private validateConfiguration(): void {
    this.logger.log('Validando configuración de ARCA...');

    const filesToCheck = [
      { path: this.getCertificatePath(), name: 'Certificado' },
      { path: this.getPrivateKeyPath(), name: 'Clave privada' },
      { path: this.getWsaaWsdlPath(), name: 'WSDL WSAA' },
      { path: this.getWsfeWsdlPath(), name: 'WSDL WSFE' },
      { path: this.getWsfecredWsdlPath(), name: 'WSDL WSFECRED' },
    ];

    for (const file of filesToCheck) {
      if (!fs.existsSync(file.path)) {
        this.logger.error(`Archivo no encontrado: ${file.name} - ${file.path}`);
        throw new Error(`Archivo ${file.name} no encontrado: ${file.path}`);
      }
      this.logger.log(`✓ ${file.name} encontrado`);
    }

    this.logger.log('Configuración validada correctamente');
  }

  /**
   * Lee el contenido de un archivo
   */
  readFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      this.logger.error(`Error leyendo archivo ${filePath}:`, error);
      throw error;
    }
  }
}
