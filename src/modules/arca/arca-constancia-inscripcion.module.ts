import { Module } from '@nestjs/common';
import { ArcaConstanciaInscripcionService } from './services/ws-constancia-inscrpcion/arca-constancia-inscripcion.service';
import { ArcaConstanciaInscripcionController } from './arca-constancia-inscripcion.controller';
import { ArcaWsaaService } from './services/wsaa/arca-wsaa.service'; // Asegúrate que la ruta sea correcta
import { ArcaConfigService } from './services/arca-config.service'; // Asegúrate que la ruta sea correcta

/**
 * Módulo para el Web Service de Constancia de Inscripción de ARCA
 * 
 * Este módulo encapsula toda la lógica para interactuar con el servicio
 * ws_sr_constancia_inscripcion, proveyendo un servicio y un controlador
 * para facilitar su uso en la aplicación.
 */
@Module({
  imports: [], // Si ArcaWsaaService y ArcaConfigService son de otro módulo, impórtalo aquí
  controllers: [ArcaConstanciaInscripcionController],
  providers: [
    ArcaConstanciaInscripcionService,
    // Las siguientes dependencias deben ser provistas por el módulo principal (ArcaModule)
    ArcaWsaaService,
    ArcaConfigService,
  ],
  exports: [ArcaConstanciaInscripcionService], // Exporta el servicio para que otros módulos puedan usarlo
})
export class ArcaConstanciaInscripcionModule {}
