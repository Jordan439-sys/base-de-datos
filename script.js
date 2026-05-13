/* ══════════════════════════════════════════
   PORTAFOLIO ACADÉMICO - BASE DE DATOS II
   Universidad Peruana Los Andes · 2026
   script.js
══════════════════════════════════════════ */

/**
 * Muestra una página y oculta las demás.
 * @param {string} name - 'home' | 'unidades' | 'login'
 */
function showPage(name) {
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo(0, 0);

  // Ocultar navbar en la página de login
  document.getElementById('mainNav').style.display = name === 'login' ? 'none' : 'flex';
}

/**
 * Navega a la página de unidades y activa la pestaña indicada.
 * @param {number} n - Número de unidad (1–4)
 */
function showUnidad(n) {
  showPage('unidades');
  switchTab(n);
}

/**
 * Activa la pestaña n y muestra el panel correspondiente.
 * @param {number} n - Número de unidad (1–4)
 */
function switchTab(n) {
  document.querySelectorAll('.units-tab:not(.units-tab-back)').forEach(function(tab, i) {
    tab.classList.toggle('active', i + 1 === n);
  });
  document.querySelectorAll('.unit-content-panel').forEach(function(panel, i) {
    panel.classList.toggle('active', i + 1 === n);
  });
}

/**
 * Navega al inicio y luego hace scroll suave a la sección "Sobre mí".
 */
function irSobreMi() {
  showPage('home');
  setTimeout(function() {
    var el = document.getElementById('sobre-mi');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}
