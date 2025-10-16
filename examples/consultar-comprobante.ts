import axios from 'axios';

/**
 * Ejemplo: Consultar un comprobante existente
 */
async function consultarComprobante() {
  const baseURL = 'http://localhost:3000';

  try {
    console.log('📍 Cambiando a ambiente testing...');
    await axios.post(`${baseURL}/arca/ambiente`, {
      ambiente: 'testing',
    });

    console.log('📍 Consultando comprobante...');
    const response = await axios.get(`${baseURL}/arca/comprobante/consultar`, {
      params: {
        ptoVta: 1,
        tipo: 1,
        nro: 1,
      },
    });

    console.log('\n✅ Información del comprobante:');
    console.log(JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error:', error.response?.data || error.message);
    } else {
      console.error('❌ Error inesperado:', error);
    }
    throw error;
  }
}

consultarComprobante().then(() => {
  console.log('\n✅ Consulta completada');
  process.exit(0);
});