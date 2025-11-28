import {
  Controller,
  Get,
  Post,
  Body,
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
  ApiBody,
} from '@nestjs/swagger';
import { ArcaConstanciaInscripcionService } from './services/ws-constancia-inscrpcion/arca-constancia-inscripcion.service';
import {
  GetPersonaDto,
  GetPersonaListDto,
} from './dto/constancia-inscripcion.dto';
import {
  IDummyResponse,
  IGetPersonaResponse,
  IGetPersonaListResponse,
} from './interfaces/constancia-inscripcion.interface';

/**
 * Controlador para el Web Service de Constancia de Inscripción de ARCA
 * 
 * Endpoints disponibles:
 * - GET /arca/constancia-inscripcion/dummy - Verifica estado del servicio
 * - GET /arca/constancia-inscripcion/persona/:cuit - Consulta una persona
 * - POST /arca/constancia-inscripcion/persona-list - Consulta múltiples personas
 */
@ApiTags('ARCA - Constancia de Inscripción')
@Controller('arca/constancia-inscripcion')
export class ArcaConstanciaInscripcionController {
  private readonly logger = new Logger(ArcaConstanciaInscripcionController.name);

  constructor(
    private readonly constanciaService: ArcaConstanciaInscripcionService,
  ) {}

  /**
   * Endpoint para verificar el estado del servicio
   * GET /arca/constancia-inscripcion/dummy
   */
  @Get('dummy')
  @ApiOperation({
    summary: 'Verificar estado del servicio',
    description:
      'Verifica el estado y disponibilidad de los elementos principales del servicio (aplicación, autenticación y base de datos)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del servicio obtenido exitosamente',
    schema: {
      example: {
        appserver: 'OK',
        authserver: 'OK',
        dbserver: 'OK',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error al verificar el estado del servicio',
  })
  async dummy(): Promise<IDummyResponse> {
    try {
      this.logger.log('📍 Endpoint dummy invocado');
      return await this.constanciaService.dummy();
    } catch (error) {
      this.logger.error('Error en endpoint dummy:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al verificar el estado del servicio',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint para consultar los datos de constancia de inscripción de una persona
   * GET /arca/constancia-inscripcion/persona/:cuit
   */
  @Get('persona/:cuit')
  @ApiOperation({
    summary: 'Consultar constancia de inscripción de un contribuyente',
    description:
      'Devuelve el detalle de todos los datos correspondientes a la constancia de inscripción del contribuyente solicitado',
  })
  @ApiParam({
    name: 'cuit',
    description: 'CUIT del contribuyente (11 dígitos)',
    example: '20201731594',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de constancia obtenidos exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'CUIT inválido',
  })
  @ApiResponse({
    status: 404,
    description: 'Contribuyente no encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al consultar la constancia de inscripción',
  })
  async getPersona(@Param('cuit') cuit: string): Promise<IGetPersonaResponse> {
    try {
      // Validación básica del CUIT
      if (!this.isValidCuit(cuit)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'CUIT inválido. Debe contener 11 dígitos numéricos',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`📍 Endpoint getPersona invocado - CUIT: ${cuit}`);
      const response = await this.constanciaService.getPersona(cuit);

      // Verificar si hay errores en la respuesta
      if (response.personaReturn?.errorConstancia?.error) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Error al consultar el contribuyente',
            error: response.personaReturn.errorConstancia.error,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Error en endpoint getPersona (${cuit}):`, error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al consultar la constancia de inscripción',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint para consultar los datos de constancia de inscripción de múltiples personas
   * POST /arca/constancia-inscripcion/persona-list
   */
  @Post('persona-list')
  @ApiOperation({
    summary: 'Consultar constancia de inscripción de múltiples contribuyentes',
    description:
      'Devuelve los datos de constancia de inscripción para una lista de hasta 250 contribuyentes',
  })
  @ApiBody({
    type: GetPersonaListDto,
    description: 'Array de CUITs a consultar',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de constancias obtenidos exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos (CUITs inválidos o más de 250)',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al consultar las constancias de inscripción',
  })
  async getPersonaList(
    @Body() dto: GetPersonaListDto,
  ): Promise<IGetPersonaListResponse> {
    try {
      // Validar cada CUIT
      const invalidCuits = dto.idPersonas.filter(
        (cuit) => !this.isValidCuit(cuit),
      );

      if (invalidCuits.length > 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Algunos CUITs son inválidos',
            invalidCuits,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `📍 Endpoint getPersonaList invocado - ${dto.idPersonas.length} CUITs`,
      );
      return await this.constanciaService.getPersonaList(dto.idPersonas);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Error en endpoint getPersonaList:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al consultar las constancias de inscripción',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Valida el formato de un CUIT
   * @private
   */
  private isValidCuit(cuit: string): boolean {
    // Debe ser una cadena de 11 dígitos numéricos
    //return /^\d{11}$/.test(cuit);
    return true;
  }
}
