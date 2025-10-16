export class ArcaException extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ArcaException';
  }
}

export class WsaaException extends ArcaException {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'WsaaException';
  }
}

export class WsfeException extends ArcaException {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'WsfeException';
  }
}

export class ConfigurationException extends ArcaException {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigurationException';
  }
}

export class TicketExpiredException extends WsaaException {
  constructor() {
    super('El ticket de acceso ha expirado', 'TICKET_EXPIRED');
    this.name = 'TicketExpiredException';
  }
}

export class CertificateException extends ArcaException {
  constructor(message: string) {
    super(message, 'CERTIFICATE_ERROR');
    this.name = 'CertificateException';
  }
}