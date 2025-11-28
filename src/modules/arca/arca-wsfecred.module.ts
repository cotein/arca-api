import { Module } from '@nestjs/common';
import { ArcaWsfecredService } from './services/wsfecred/arca-wsfecred.service';
import { ArcaWsfecredController } from './arca-wsfecred.controller';
import { ArcaWsaaService } from './services/wsaa/arca-wsaa.service';
import { ArcaConfigService } from './services/arca-config.service';

/**
 * Módulo para el Web Service de Factura de Crédito Electrónica (WSFECRED)
 * Implementa métodos de consulta según Manual v2.0.3
 */
@Module({
  imports: [],
  controllers: [ArcaWsfecredController],
  providers: [
    ArcaWsfecredService,
    // Dependencias externas requeridas
    ArcaWsaaService,
    ArcaConfigService,
  ],
  exports: [ArcaWsfecredService],
})
export class ArcaWsfecredModule {}