import { IsString, IsNotEmpty, IsArray, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para consultar una persona individual
 */
export class GetPersonaDto {
  @ApiProperty({
    description: 'CUIT del contribuyente a consultar',
    example: '20201731594',
    minLength: 11,
    maxLength: 11,
  })
  @IsString()
  @IsNotEmpty()
  idPersona: string;
}

/**
 * DTO para consultar múltiples personas
 */
export class GetPersonaListDto {
  @ApiProperty({
    description: 'Array de CUITs de los contribuyentes a consultar (máximo 250)',
    example: ['20201731594', '27298672478'],
    type: [String],
    maxItems: 250,
  })
  @IsArray()
  @ArrayMaxSize(250, {
    message: 'El método getPersonaList_v2 acepta un máximo de 250 CUITs',
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  idPersonas: string[];
}
