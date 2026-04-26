// ═══════════════════════════════════════
//  NAVEGACIÓN SPA — Portafolio
// ═══════════════════════════════════════

const ALL_PAGES = ['inicio', 'tareas', 'perfil', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
const NAV_PAGES = ['inicio', 'tareas', 'perfil'];

function goTo(id) {
  // Ocultar todas las páginas y glows
  ALL_PAGES.forEach(p => {
    const pg = document.getElementById('page-' + p);
    const gl = document.getElementById('glow-' + p);
    if (pg) {
      pg.classList.remove('visible');
      pg.style.display = 'none';
    }
    if (gl) gl.style.opacity = '0';
  });

  // Limpiar estado activo del nav
  NAV_PAGES.forEach(p => {
    const btn = document.getElementById('nav-' + p);
    if (btn) btn.classList.remove('active');
  });

  // Activar botón del nav correspondiente
  const navTarget = NAV_PAGES.includes(id) ? id : 'tareas';
  const activeBtn = document.getElementById('nav-' + navTarget);
  if (activeBtn) activeBtn.classList.add('active');

  // Mostrar página destino
  const target = document.getElementById('page-' + id);
  const glow   = document.getElementById('glow-' + id);

  if (target) {
    target.style.display = '';
    requestAnimationFrame(() => target.classList.add('visible'));
  }

  if (glow) glow.style.opacity = '1';

  // Scroll al tope
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Iniciar en la página de inicio
goTo('inicio');