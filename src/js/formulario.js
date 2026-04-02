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
      console.error('Error al decodificar número de teléfono:', error);
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
// Este script agrega feedback visual y validación básica.

const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    // Estado de carga
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    try {
      // Obtener token de reCAPTCHA v3
      if (typeof grecaptcha !== 'undefined') {
        const token = await grecaptcha.execute('6LeIBqQsAAAAAKbVCSsrUfAry7T22uDEjTioMfCu', { action: 'submit' });
        document.getElementById('recaptchaResponse').value = token;
      }

      const formData = new FormData(form);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });

      if (response.ok) {
        // Éxito
        form.reset();
        formSuccess.classList.add('visible');
        submitBtn.textContent = '¡Enviado!';

        // Ocultar mensaje de éxito después de 6 segundos
        setTimeout(() => {
          formSuccess.classList.remove('visible');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 6000);
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      // Fallback: redirigir al formulario nativo de Netlify
      console.error('Error al enviar:', error);
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      alert('Hubo un problema al enviar. Por favor intentá nuevamente o escribinos por WhatsApp.');
    }
  });
}