import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class CmsSignerService {
  private readonly logger = new Logger(CmsSignerService.name);
  private readonly tempDir = path.join(process.cwd(), 'temp');

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
      this.logger.log(`Directorio temporal creado: ${this.tempDir}`);
    }
  }

  /**
   * Firma un mensaje XML usando OpenSSL CMS con soporte a passphrases
   */
  async signMessage(
    xmlContent: string,
    certPath: string,
    keyPath: string,
    passphrase?: string,
  ): Promise<string> {
    this.logger.log('Iniciando proceso de firma digital CMS...');

    const timestamp = Date.now();
    const inputFile = path.join(this.tempDir, `tra_${timestamp}.xml`);
    const outputFile = path.join(this.tempDir, `tra_${timestamp}.cms`);
    const cleanFile = path.join(this.tempDir, `tra_${timestamp}_clean.cms`);

    try {
      // 1. Validar que los archivos existan
      this.validateFiles(certPath, keyPath);

      // 2. Escribir el XML a un archivo temporal
      fs.writeFileSync(inputFile, xmlContent, 'utf-8');
      this.logger.log(`Archivo TRA creado: ${inputFile}`);

      // 3. Construir comando OpenSSL
      let command = `openssl cms -sign -in "${inputFile}" -out "${outputFile}" -signer "${certPath}" -inkey "${keyPath}" -nodetach -outform PEM`;

      // Agregar passphrase si existe
      if (passphrase) {
        command += ` -passin pass:"${passphrase}"`;
      }

      this.logger.log('Ejecutando comando OpenSSL CMS...');
      await execAsync(command);
      this.logger.log('✓ CMS firmado correctamente');

      // 4. Leer el archivo CMS firmado
      const cmsContent = fs.readFileSync(outputFile, 'utf-8');

      // Guardar el contenido del archivo PEM para inspección antes de eliminarlo
      const debugFile = path.join(this.tempDir, `debug_tra_${timestamp}.pem`);
      fs.writeFileSync(debugFile, cmsContent, 'utf-8');
      this.logger.log(`Contenido PEM guardado para debug: ${debugFile}`);

      // 5. Extraer solo el contenido Base64 (sin encabezados MIME)
      const cleanedCms = this.extractBase64FromPem(cmsContent);
      this.logger.log('✓ Encabezados MIME removidos');

      // 6. Codificar en Base64
      const base64CMS = this.encodeToBase64(cleanedCms);
      this.logger.log('✓ CMS codificado en Base64');

      return base64CMS;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Error en el proceso de firma:', error.message);
        throw new Error(`Error firmando mensaje: ${error.message}`);
      } else {
        this.logger.error('Error en el proceso de firma:', error);
        throw new Error('Error firmando mensaje desconocido');
      }
    } finally {
      this.cleanupTempFiles(inputFile, outputFile, cleanFile);
    }
  }

  /**
   * Valida que los archivos de certificado y clave existan
   */
  private validateFiles(certPath: string, keyPath: string): void {
    if (!fs.existsSync(certPath)) {
      throw new Error(`Certificado no encontrado: ${certPath}`);
    }
    if (!fs.existsSync(keyPath)) {
      throw new Error(`Clave privada no encontrada: ${keyPath}`);
    }
    this.logger.log('✓ Archivos validados');
  }

  /**
   * Extrae el contenido Base64 de un archivo PEM
   * Remueve los encabezados MIME y saltos de línea
   */
  private extractBase64FromPem(pemContent: string): string {
    // Expresión regular para encontrar el contenido entre BEGIN y END
    // Se ajusta para capturar contenido entre BEGIN CMS y END CMS, que es el formato real generado
    const regex = /-----BEGIN CMS-----\r?\n?([\s\S]*?)\r?\n?-----END CMS-----/;
    const match = pemContent.match(regex);

    if (!match || !match[1]) {
      throw new Error('No se pudo extraer el contenido Base64 del CMS');
    }

    // Remover todos los saltos de línea y espacios en blanco
    const base64Content = match[1].replace(/\s+/g, '');

    this.logger.log(`Base64 extraído: ${base64Content.substring(0, 50)}...`);
    return base64Content;
  }

  /**
   * Codifica un string en Base64
   */
  private encodeToBase64(content: string): string {
    // Esta función ya no es necesaria porque el contenido extraído ya está en base64
    // Por lo tanto, se puede retornar el contenido tal cual
    return content;
  }

  /**
   * Decodifica un string en Base64
   */
  private decodeFromBase64(base64String: string): string {
    const buffer = Buffer.from(base64String, 'base64');
    return buffer.toString('utf-8');
  }

  /**
   * Verifica que el Base64 sea válido
   */
  private isValidBase64(str: string): boolean {
    try {
      return Buffer.from(str, 'base64').toString('base64') === str;
    } catch {
      return false;
    }
  }

  /**
   * Limpia archivos temporales
   */
  private cleanupTempFiles(...files: string[]): void {
    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          this.logger.debug(`Archivo temporal eliminado: ${file}`);
        }
      } catch (error) {
        this.logger.warn(
          `No se pudo eliminar archivo temporal ${file}:`,
          error,
        );
      }
    }
  }
}
