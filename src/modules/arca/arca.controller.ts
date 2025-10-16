/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { ArcaWsfeService } from './services/wsfe/arca-wsfe.service';
import {
  ArcaConfigService,
  ArcaEnvironment,
} from './services/arca-config.service';
import { FeCAESolicitarReqDto } from './dto/fe-cae-solicitar-req.dto';
import { FeCabReqDto } from './dto/fe-cab-req.dto';
import { FeDetReqDto, AlicIvaDto } from './dto/fe-det-req.dto';

@Controller('arca')
export class ArcaController {
  private readonly logger = new Logger(ArcaController.name);

  constructor(
    private readonly wsfeService: ArcaWsfeService,
    private readonly configService: ArcaConfigService,
  ) {}

  /**
   * Cambia el ambiente (testing/production)
   */
  @Post('ambiente')
  cambiarAmbiente(@Body('ambiente') ambiente: ArcaEnvironment) {
    this.logger.log(`Cambiando ambiente a: ${ambiente}`);
    this.configService.setEnvironment(ambiente);
    return { message: `Ambiente cambiado a ${ambiente}` };
  }

  /**
   * Obtiene información del ambiente actual
   */
  @Get('ambiente')
  getAmbiente() {
    return {
      ambiente: this.configService.getEnvironment(),
      wsaaUrl: this.configService.getWsaaUrl(),
      wsfeUrl: this.configService.getWsfeUrl(),
      cuit: this.configService.getCuitEmisor(),
    };
  }

  /**
   * Solicita un CAE
   */
  @Post('cae/solicitar')
  async solicitarCAE(@Body() request: FeCAESolicitarReqDto) {
    this.logger.log('Recibida solicitud de CAE');
    return await this.wsfeService.solicitarCAE(request);
  }

  /**
   * Consulta último comprobante autorizado
   */
  @Get('comprobante/ultimo')
  async getUltimoComprobante(
    @Query('ptoVta') ptoVta: number,
    @Query('tipo') tipo: number,
  ) {
    return await this.wsfeService.getUltimoComprobanteAutorizado(ptoVta, tipo);
  }

  /**
   * Consulta un comprobante específico
   */
  @Get('comprobante/consultar')
  async consultarComprobante(
    @Query('ptoVta') ptoVta: number,
    @Query('tipo') tipo: number,
    @Query('nro') nro: number,
  ) {
    return await this.wsfeService.consultarComprobante(ptoVta, tipo, nro);
  }

  /**
   * Obtiene tipos de comprobantes
   */
  @Get('tipos-comprobantes')
  async getTiposComprobantes() {
    return await this.wsfeService.getTiposComprobantes();
  }

  /**
   * Obtiene puntos de venta habilitados
   */
  @Get('puntos-venta')
  async getPuntosVenta() {
    return await this.wsfeService.getPuntosVenta();
  }

  @Get('dummy') // 👈 Crea el endpoint GET /arca/dummy
  async checkAfipStatus() {
    return this.wsfeService.testDummy();
  }
}
