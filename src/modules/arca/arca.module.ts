import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArcaWsaaService } from './services/wsaa/arca-wsaa.service';
import { ArcaWsfeService } from './services/wsfe/arca-wsfe.service';
import { ArcaConfigService } from './services/arca-config.service';
import { CmsSignerService } from './utils/cms-signer.service';
import { ArcaController } from './arca.controller';

@Module({
  controllers: [ArcaController],
  providers: [
    CmsSignerService,
    ArcaWsaaService,
    ArcaWsfeService,
    ArcaConfigService,
  ],
  exports: [ArcaWsaaService, ArcaWsfeService],
})
export class ArcaModule {}