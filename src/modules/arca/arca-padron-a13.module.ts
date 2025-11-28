import { Module } from '@nestjs/common';
import { ArcaPadronA13Service } from './services/wspadronA13/arca-padron-a13.service';
import { ArcaPadronA13Controller } from './arca-padron-a13.controller';
import { ArcaWsaaService } from './services/wsaa/arca-wsaa.service';
import { ArcaConfigService } from './services/arca-config.service';

/**
 * Módulo para el Web Service de Padrón Alcance 13 (ws_sr_padron_a13)
 * * Encapsula la lógica para consultar datos de identificación y domicilios (Legal/Fiscal)
 * basándose en el Manual ws_sr_padron_a13 v1.3
 */
@Module({
  imports: [], 
  controllers: [ArcaPadronA13Controller],
  providers: [
    ArcaPadronA13Service,
    // Dependencias provistas por ArcaModule o importadas globalmente
    ArcaWsaaService,
    ArcaConfigService,
  ],
  exports: [ArcaPadronA13Service],
})
export class ArcaPadronA13Module {}