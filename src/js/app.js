// ─── NAVBAR SCROLL ─────────────────────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ─── MENÚ MOBILE ───────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});

// Cerrar menú al hacer click en un link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});

// ─── SMOOTH SCROLL PARA LINKS INTERNOS ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ─── FADE + SLIDE AL HACER SCROLL ──────────────────────────
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.service-card, .testimonial-card, .about__grid, .contact__grid, .hero__card').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ─── CONTADOR ANIMADO ──────────────────────────────────────
function animateCounter(el, target, duration = 1500, suffix = '') {
  let start = 0;
  const increment = target / (duration / 16);
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      el.textContent = '+' + target + suffix;
      clearInterval(timer);
    } else {
      el.textContent = '+' + Math.floor(start) + suffix;
    }
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.hero__stat-num');
      nums.forEach(num => {
        const text = num.textContent.trim();
        if (text === '+500') animateCounter(num, 500);
        if (text === '100%') {
          let n = 0;
          const t = setInterval(() => {
            n++;
            num.textContent = n + '%';
            if (n >= 100) clearInterval(t);
          }, 15);
        }
        if (text === '20 años') {
          let n = 0;
          const t = setInterval(() => {
            n++;
            num.textContent = n + ' años';
            if (n >= 20) clearInterval(t);
          }, 75);
        }
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero__stats');
if (statsEl) statsObserver.observe(statsEl);

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