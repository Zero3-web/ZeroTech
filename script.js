// Forzar scroll al top al recargar si hay hash
window.addEventListener('load', () => {
  if (window.location.hash) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    history.replaceState(null, '', window.location.pathname);
  }
});

// Loader personalizado "Zero"
window.addEventListener('DOMContentLoaded', () => {
  // Espera a que todo cargue (puedes ajustar el timeout si quieres que dure más)
  window.setTimeout(() => {
    document.body.classList.add('loaded');
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  }, 1200); // 1.2s para mostrar animación
});

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;
const lightThemeCss = document.getElementById('light-theme-css');

// Función para activar/desactivar el CSS del light mode
function setLightTheme(enabled) {
  if (enabled) {
    body.classList.add('light-theme');
    lightThemeCss.disabled = false;
    themeIcon.textContent = '☀️';
  } else {
    body.classList.remove('light-theme');
    lightThemeCss.disabled = true;
    themeIcon.textContent = '🌙';
  }
}

// Load theme from localStorage
setLightTheme(localStorage.getItem('theme') === 'light');

themeToggle.addEventListener('click', () => {
  const isLight = !body.classList.contains('light-theme');
  setLightTheme(isLight);
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

const typewriter = document.getElementById('typewriter');
if (typewriter) {
  const text = "Zero .";
  let i = 0;
  function type() {
    if (i <= text.length) {
      typewriter.textContent = text.slice(0, i);
      i++;
      setTimeout(type, 120);
    }
  }
  type();
}

// Scroll-to-top button logic
const scrollBtn = document.getElementById('scroll-to-top');
window.addEventListener('scroll', () => {
  if (window.scrollY > 200) {
    scrollBtn.classList.add('visible');
  } else {
    scrollBtn.classList.remove('visible');
  }
});
scrollBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Hamburguesa menú responsive
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.classList.toggle('nav-open');
  });
  // Cierra el menú al hacer click en un enlace
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
  });
}

// Partículas galaxia
(function galaxyParticles() {
  const canvas = document.getElementById('particles-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = window.innerWidth, h = window.innerHeight;
  let particles = [];
  const PARTICLE_COUNT = Math.floor((w * h) / 2500);
  const colors = ['#64ffda', '#ccd6f6', '#fff', '#8892b0', '#112240'];
  let mouse = { x: null, y: null, active: false };
  const MOUSE_RADIUS = 90; // distancia de influencia

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = randomBetween(0, Math.PI * 2);
      const radius = randomBetween(0, Math.min(w, h) * 0.98);
      const cx = w / 2 + Math.cos(angle) * radius * randomBetween(0.7, 1.1);
      const cy = h / 2 + Math.sin(angle) * radius * randomBetween(0.7, 1.1);
      particles.push({
        x: cx,
        y: cy,
        baseX: cx,
        baseY: cy,
        size: randomBetween(0.5, 1.2),
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: angle,
        speed: randomBetween(0.0005, 0.0015) * (Math.random() > 0.5 ? 1 : -1),
        orbit: radius,
        alpha: randomBetween(0.4, 1)
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (let p of particles) {
      p.angle += p.speed;
      let currentOrbit = p.orbit;
      // Si el mouse está cerca de la partícula, dispersa más
      if (mouse.active) {
        const px = w / 2 + Math.cos(p.angle) * p.orbit;
        const py = h / 2 + Math.sin(p.angle) * p.orbit;
        const dist = Math.hypot(mouse.x - px, mouse.y - py);
        if (dist < MOUSE_RADIUS) {
          // Aumenta el radio de la órbita proporcionalmente a la cercanía
          const factor = 1.25 + (1 - dist / MOUSE_RADIUS) * 0.7; // hasta 1.95x
          currentOrbit = p.orbit * factor;
        }
      }
      p.x = w / 2 + Math.cos(p.angle) * currentOrbit;
      p.y = h / 2 + Math.sin(p.angle) * currentOrbit;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  // Mouse interactivity: dispersa partículas cerca del mouse
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
  });
})();
