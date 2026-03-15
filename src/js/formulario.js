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