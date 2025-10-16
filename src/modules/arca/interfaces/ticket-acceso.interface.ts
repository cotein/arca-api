export interface ITicketAcceso {
  token: string;
  sign: string;
  expirationTime: Date;
  generationTime: Date;
  service: string;
}

export interface ILoginTicketRequest {
  uniqueId: number;
  generationTime: string;
  expirationTime: string;
  service: string;
}

export interface ILoginTicketResponse {
  header: {
    source: string;
    destination: string;
    uniqueId: number;
    generationTime: string;
    expirationTime: string;
  };
  credentials: {
    token: string;
    sign: string;
  };
}