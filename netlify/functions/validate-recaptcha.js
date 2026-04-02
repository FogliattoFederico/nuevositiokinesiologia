/**
 * Función serverless para validar reCAPTCHA v3
 * Se ejecuta antes de que Netlify Forms procese los datos
 */

exports.handler = async (event) => {
  // Solo procesar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const token = data['g-recaptcha-response'];
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // Validar que tenemos el token y la clave
    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Token de reCAPTCHA no proporcionado' })
      };
    }

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY no está configurada');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error en la configuración del servidor' })
      };
    }

    // Verificar con Google
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=${secretKey}&response=${token}`
    });

    const result = await response.json();

    // Validar respuesta de Google
    if (!result.success) {
      console.warn('reCAPTCHA verification failed:', result);
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Verificación de reCAPTCHA falló' })
      };
    }

    // Score: 1.0 = humano seguro, 0.0 = bot seguro
    // Aceptar score > 0.5
    if (result.score < 0.5) {
      console.warn('reCAPTCHA score too low:', result.score);
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Puntuación de reCAPTCHA demasiado baja. Por favor intenta de nuevo.' })
      };
    }

    // ✅ Validación exitosa
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        score: result.score,
        action: result.action
      })
    };

  } catch (error) {
    console.error('Error validando reCAPTCHA:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
