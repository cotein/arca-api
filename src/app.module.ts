import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArcaModule } from './modules/arca/arca.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        // ... tus otras variables
        ARCA_WSAA_PROD_URL: Joi.string().required(),
        ARCA_WSAA_URL: Joi.string().required(),
        ARCA_WSAA_PRODUCTION_PATH: Joi.string().required(),
        ARCA_WSAA_TESTING_PATH: Joi.string().required(),
        ARCA_WSFE_URL_PRODUCTION: Joi.string().required(),
        ARCA_WSFE_URL_TESTING: Joi.string().required(),
        ARCA_WSFE_PRODUCTION_PATH: Joi.string().required(),
        ARCA_WSFE_TESTING_PATH: Joi.string().required(),
        ARCA_WSFECRED_URL_PRODUCTION: Joi.string().required(),
        ARCA_WSFECRED_URL_TESTING: Joi.string().required(),
        ARCA_WSFECRED_PRODUCTION_PATH: Joi.string().required(),
        ARCA_WSFECRED_TESTING_PATH: Joi.string().required(),
        ARCA_PRODUCTION_PATH: Joi.string().required(),
        ARCA_TESTING_PATH: Joi.string().required(),
        ARCA_PRIVATE_KEY_PATH: Joi.string().required(),

        // 👇 ¡AÑADE LA VARIABLE QUE FALTA AQUÍ! 👇
        ARCA_CUIT_EMISOR: Joi.string().required(), 
      }),
    }),
    ArcaModule,
  ],
})
export class AppModule {}