// ─── FORMULARIO DE CONTACTO ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
 
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
 
      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(contactForm)).toString(),
        });
 
        if (response.ok) {
          formSuccess.style.display = 'block';
          contactForm.reset();
        } else {
          alert('Hubo un error al enviar. Intentá de nuevo o escribinos por WhatsApp.');
        }
      } catch {
        alert('Hubo un error al enviar. Revisá tu conexión e intentá de nuevo.');
      }
    });
  }
});
 