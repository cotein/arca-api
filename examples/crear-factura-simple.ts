import axios from 'axios';

/**
 * Ejemplo: Crear una factura simple tipo A
 */
async function crearFacturaSimple() {
  const baseURL = 'http://localhost:3000';

  try {
    // 1. Cambiar a ambiente testing
    console.log('📍 Cambiando a ambiente testing...');
    await axios.post(`${baseURL}/arca/ambiente`, {
      ambiente: 'testing',
    });

    // 2. Obtener información del ambiente
    console.log('📍 Obteniendo información del ambiente...');
    const ambienteInfo = await axios.get(`${baseURL}/arca/ambiente`);
    console.log('Ambiente actual:', ambienteInfo.data);

    // 3. Obtener último comprobante
    console.log('📍 Consultando último comprobante...');
    const ultimoComprobante = await axios.get(
      `${baseURL}/arca/comprobante/ultimo`,
      {
        params: {
          ptoVta: 1,
          tipo: 1, // Factura A
        },
      },
    );
    console.log('Último comprobante:', ultimoComprobante.data);

    // 4. Crear solicitud de CAE
    console.log('📍 Preparando solicitud de CAE...');

    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0].replace(/-/g, '');

    const solicitud = {
      FeCabReq: {
        CantReg: 1,
        PtoVta: 1,
        CbteTipo: 1, // Factura A
      },
      FeDetReq: [
        {
          Concepto: 1, // Productos
          DocTipo: 80, // CUIT
          DocNro: 20111111112, // Número de cliente
          CbteDesde: 1,
          CbteHasta: 1,
          CbteFch: fechaStr,
          ImpTotal: 184.05,
          ImpTotConc: 0,
          ImpNeto: 150,
          ImpOpEx: 0,
          ImpTrib: 7.8,
          ImpIVA: 26.25,
          MonId: 'PES',
          MonCotiz: 1,
          CondicionIVAReceptorId: 1,
          Iva: [
            {
              Id: 5, // 21%
              BaseImp: 100,
              Importe: 21,
            },
            {
              Id: 4, // 10.5%
              BaseImp: 50,
              Importe: 5.25,
            },
          ],
          Tributos: [
            {
              Id: 99,
              Desc: 'Impuesto Municipal',
              BaseImp: 150,
              Alic: 5.2,
              Importe: 7.8,
            },
          ],
        },
      ],
    };

    // 5. Solicitar CAE
    console.log('📍 Solicitando CAE...');
    const responseCAE = await axios.post(`${baseURL}/arca/cae/solicitar`, solicitud);

    console.log('\n✅ CAE Obtenido exitosamente:');
    console.log('Respuesta:', JSON.stringify(responseCAE.data, null, 2));

    return responseCAE.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error:', error.response?.data || error.message);
    } else {
      console.error('❌ Error inesperado:', error);
    }
    throw error;
  }
}

// Ejecutar ejemplo
crearFacturaSimple().then(() => {
  console.log('\n✅ Ejemplo completado');
  process.exit(0);
});