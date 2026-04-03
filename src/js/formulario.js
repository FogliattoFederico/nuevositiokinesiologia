// ─── RATE LIMITING ─────────────────────────────────────────
// Limita el número de intentos de envío del formulario
class FormRateLimiter {
  constructor(maxAttempts = 3, windowMs = 60000) { // 3 intentos cada 60 segundos
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = [];
  }

  isAllowed() {
    const now = Date.now();
    // Limpiar intentos antiguos (fuera de la ventana de tiempo)
    this.attempts = this.attempts.filter(time => now - time < this.windowMs);
    
    if (this.attempts.length < this.maxAttempts) {
      this.attempts.push(now);
      return true;
    }
    return false;
  }

  getWaitTime() {
    if (this.attempts.length === 0) return 0;
    const oldestAttempt = this.attempts[0];
    const waitTime = Math.ceil((this.windowMs - (Date.now() - oldestAttempt)) / 1000);
    return Math.max(0, waitTime);
  }
}

const rateLimiter = new FormRateLimiter(3, 60000); // 3 intentos cada 60 segundos

// ─── DESOFUSCAR NÚMERO DE TELÉFONO ─────────────────────────
// Decodifica el número del atributo data-phone (base64) y construye los enlaces
function decodePhoneLinks() {
  const phoneLinks = document.querySelectorAll('[data-phone]');
  
  phoneLinks.forEach(link => {
    try {
      // Decodificar base64
      const encodedPhone = link.getAttribute('data-phone');
      const decodedPhone = atob(encodedPhone);
      const linkType = link.getAttribute('data-link-type');
      
      let href = '';
      
      if (linkType === 'whatsapp') {
        href = `https://wa.me/${decodedPhone}`;
      } else if (linkType === 'whatsapp-banner') {
        const message = link.getAttribute('data-message');
        href = `https://wa.me/${decodedPhone}?text=${message}`;
      } else if (linkType === 'tel') {
        href = `tel:+${decodedPhone}`;
      }
      
      link.setAttribute('href', href);
    } catch (error) {
      // Silenciar error sin exponer detalles
    }
  });
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', decodePhoneLinks);
} else {
  decodePhoneLinks();
}

// ─── FORMULARIO DE CONTACTO ────────────────────────────────
// Netlify Forms maneja el envío automáticamente.
// Este script agrega feedback visual, validación y rate limiting.

const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    // ─── VERIFICAR RATE LIMITING ───────────────────────────
    if (!rateLimiter.isAllowed()) {
      const waitTime = rateLimiter.getWaitTime();
      const errorMsg = waitTime > 0 
        ? `Por favor espera ${waitTime} segundos antes de intentar nuevamente.`
        : 'Demasiados intentos. Por favor intenta más tarde.';
      alert(errorMsg);
      return;
    }

    // Estado de carga
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    try {
      // Obtener token de reCAPTCHA v3
      if (typeof grecaptcha !== 'undefined') {
        const token = await grecaptcha.execute('6LeIBqQsAAAAAKbVCSsrUfAry7T22uDEjTioMfCu', { action: 'submit' });
        document.getElementById('recaptchaResponse').value = token;
      }

      // Enviar el formulario de manera tradicional para que Netlify Forms lo registre
      form.submit();

      // Si se llega aquí, el formulario ya debería estar en proceso de envío por Netlify.
      formSuccess.classList.add('visible');
      submitBtn.textContent = '¡Enviado!';

      // Ocultar mensaje de éxito después de 6 segundos
      setTimeout(() => {
        formSuccess.classList.remove('visible');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 6000);
    } catch (error) {
      // ✅ Manejo de errores seguro (sin exponer detalles técnicos)
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      
      // Mostrar mensaje genérico al usuario
      alert('No pudimos procesar tu consulta. Por favor intenta nuevamente o escribinos por WhatsApp.');
      
      // Logging seguro (sin detalles sensibles)
      // En producción, esto se enviaría a un servicio de logging seguro
      if (typeof error !== 'undefined' && error.message === 'server_error') {
        // Log interno solo para debugging (sin exponerlo al usuario)
      }
    }
  });
}