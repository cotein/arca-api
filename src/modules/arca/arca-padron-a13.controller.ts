import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ArcaPadronA13Service } from './services/wspadronA13/arca-padron-a13.service';
import {
  IDummyResponseA13,
  IGetPersonaA13Response,
  IGetIdPersonaListByDocumentoResponse,
} from './interfaces/padron-a13.interface';

@ApiTags('ARCA - Padrón Alcance 13')
@Controller('arca/padron-a13')
export class ArcaPadronA13Controller {
  private readonly logger = new Logger(ArcaPadronA13Controller.name);

  constructor(
    private readonly padronService: ArcaPadronA13Service,
  ) {}

  @Get('dummy')
  @ApiOperation({
    summary: 'Verificar estado del servicio A13',
    description: 'Verifica disponibilidad de AppServer, AuthServer y DbServer en ARCA',
  })
  @ApiResponse({ status: 200, description: 'Estado obtenido' })
  async dummy(): Promise<IDummyResponseA13> {
    return await this.padronService.dummy();
  }

  @Get('persona/:cuit')
  @ApiOperation({
    summary: 'Consultar datos de persona (Padrón A13)',
    description: 'Obtiene domicilios (fiscal/legal) y datos de identificación.',
  })
  @ApiParam({ name: 'cuit', description: 'CUIT/CUIL de 11 dígitos' })
  async getPersona(@Param('cuit') cuit: string): Promise<IGetPersonaA13Response> {
    if (!/^\d{11}$/.test(cuit)) {
      throw new HttpException('CUIT inválido. Debe tener 11 dígitos.', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await this.padronService.getPersona(cuit);
      
      // Validación adicional si la respuesta viene vacía o con error lógico
      if (!response.personaReturn?.persona && !response.personaReturn?.metadata) {
         throw new HttpException('No se encontraron datos para el CUIT solicitado.', HttpStatus.NOT_FOUND);
      }

      return response;
    } catch (error) {
      this.logger.error(`Error en controller getPersona (${cuit}):`, error);
      throw new HttpException(
        {
          message: 'Error al consultar Padrón A13',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('buscar-dni/:documento')
  @ApiOperation({
    summary: 'Buscar CUITs por número de documento',
    description: 'Devuelve una lista de CUITs asociados a un número de documento.',
  })
  async getByDocumento(@Param('documento') documento: string): Promise<IGetIdPersonaListByDocumentoResponse> {
    if (!/^\d{6,10}$/.test(documento)) {
      throw new HttpException('Documento inválido. Solo números.', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.padronService.getIdPersonaListByDocumento(documento);
    } catch (error) {
      this.logger.error(`Error en controller getByDocumento (${documento}):`, error);
      throw new HttpException(
        {
          message: 'Error al buscar por documento en Padrón A13',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}