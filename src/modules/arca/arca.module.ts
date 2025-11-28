import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArcaWsaaService } from './services/wsaa/arca-wsaa.service';
import { ArcaWsfeService } from './services/wsfe/arca-wsfe.service';
import { ArcaConfigService } from './services/arca-config.service';
import { CmsSignerService } from './utils/cms-signer.service';
import { ArcaController } from './arca.controller';
import { ArcaConstanciaInscripcionController } from './arca-constancia-inscripcion.controller';
import { ArcaConstanciaInscripcionService } from './services/ws-constancia-inscrpcion/arca-constancia-inscripcion.service';
import { ArcaPadronA13Controller } from './arca-padron-a13.controller';
import { ArcaPadronA13Service } from './services/wspadronA13/arca-padron-a13.service';
import { ArcaWsfecredService } from './services/wsfecred/arca-wsfecred.service';
import { ArcaWsfecredController } from './arca-wsfecred.controller';

@Module({
  controllers: [ArcaController, ArcaConstanciaInscripcionController, ArcaPadronA13Controller, ArcaWsfecredController],
  providers: [
    CmsSignerService,
    ArcaWsaaService,
    ArcaWsfeService,
    ArcaConfigService,
    ArcaConstanciaInscripcionService,
    ArcaPadronA13Service,
    ArcaWsfecredService,
  ],
  exports: [ArcaWsaaService, ArcaWsfeService, ArcaConfigService, ArcaConstanciaInscripcionService, ArcaPadronA13Service, ArcaWsfecredService],
})
export class ArcaModule {}