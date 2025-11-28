import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ArcaWsfecredService } from './services/wsfecred/arca-wsfecred.service';
import {
  IMontoObligadoResponse,
  ICuitReceptoraResponse,
} from './interfaces/wsfecred.interface';

@ApiTags('ARCA - Factura de Crédito Electrónica (WSFECRED)')
@Controller('arca/wsfecred')
export class ArcaWsfecredController {
  private readonly logger = new Logger(ArcaWsfecredController.name);

  constructor(private readonly wsfecredService: ArcaWsfecredService) {}

  @Get('monto-obligado/:cuit')
  @ApiOperation({
    summary: '2.4.22 Consultar Monto Obligado Recepción',
    description: 'Devuelve el monto mínimo a partir del cual se debe emitir FCE.',
  })
  @ApiParam({ name: 'cuit', description: 'CUIT Consultada (Emisor)', example: '20123456789' })
  @ApiQuery({ name: 'fecha', required: false, description: 'Fecha YYYY-MM-DD. Por defecto: hoy.' })
  @ApiResponse({ status: 200, description: 'Monto obtenido exitosamente.' })
  async consultarMontoObligado(
    @Param('cuit') cuit: string,
    @Query('fecha') fecha?: string,
  ): Promise<IMontoObligadoResponse> {
    this.validateCuit(cuit);
    try {
      return await this.wsfecredService.consultarMontoObligadoRecepcion(cuit, fecha);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error al consultar monto obligado WSFECRED',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('cuit-receptora/:cuit')
  @ApiOperation({
    summary: '2.4.23 Consultar CUIT Receptora',
    description: 'Verifica si una CUIT (cliente) está obligada a recibir FCE (es Empresa Grande o PyME Adherida).',
  })
  @ApiParam({ name: 'cuit', description: 'CUIT del Receptor (Cliente)', example: '30112233445' })
  @ApiQuery({ name: 'fecha', required: true, description: 'Fecha de la operación YYYY-MM-DD', example: '2023-11-27' })
  @ApiResponse({ status: 200, description: 'Consulta realizada exitosamente.' })
  async consultarCuitReceptora(
    @Param('cuit') cuit: string,
    @Query('fecha') fecha: string,
  ): Promise<ICuitReceptoraResponse> {
    this.validateCuit(cuit);
    
    // Validación simple de fecha
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        throw new HttpException('Formato de fecha inválido. Use YYYY-MM-DD', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.wsfecredService.consultarCuitReceptora(cuit, fecha);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error al consultar CUIT receptora WSFECRED',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateCuit(cuit: string): void {
    if (!/^\d{11}$/.test(cuit)) {
      throw new HttpException('CUIT inválido. Debe contener 11 dígitos.', HttpStatus.BAD_REQUEST);
    }
  }
}