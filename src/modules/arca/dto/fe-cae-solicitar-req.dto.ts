import { FeCabReqDto } from './fe-cab-req.dto';
import { FeDetReqDto } from './fe-det-req.dto';

export class FeCAESolicitarReqDto {
  FeCabReq: FeCabReqDto;
  FeDetReq: FeDetReqDto[];
}