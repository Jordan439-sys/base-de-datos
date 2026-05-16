/* ══════════════════════════════════════════
   PORTAFOLIO ACADÉMICO - BASE DE DATOS II
   Universidad Peruana Los Andes · 2026
   script.js
══════════════════════════════════════════ */

/* ── Credenciales válidas ── */
var USUARIOS = [
  { usuario: 'jordan.vera',              clave: 'upla2026' },
  { usuario: 'jordan.vera@upla.edu.pe',  clave: 'upla2026' },
  { usuario: 'admin',                    clave: 'admin123'  }
];

/* ─────────────────────────────────────────
   NAVEGACIÓN
───────────────────────────────────────── */
function showPage(name) {
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo(0, 0);
  document.getElementById('mainNav').style.display = name === 'login' ? 'none' : 'flex';
}

function showUnidad(n) {
  showPage('unidades');
  switchTab(n);
}

function switchTab(n) {
  document.querySelectorAll('.units-tab:not(.units-tab-back)').forEach(function(tab, i) {
    tab.classList.toggle('active', i + 1 === n);
  });
  document.querySelectorAll('.unit-content-panel').forEach(function(panel, i) {
    panel.classList.toggle('active', i + 1 === n);
  });
}

function irSobreMi() {
  showPage('home');
  setTimeout(function() {
    var el = document.getElementById('sobre-mi');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

/* ─────────────────────────────────────────
   ACORDEÓN DE SEMANAS
───────────────────────────────────────── */
function toggleSemana(el) {
  var block = el.closest('.semana-block');
  var estaAbierto = block.classList.contains('open');

  // Cierra todos los de la misma unidad
  var panel = block.closest('.unit-content-panel');
  panel.querySelectorAll('.semana-block.open').forEach(function(b) {
    b.classList.remove('open');
  });

  // Abre el clickeado si estaba cerrado
  if (!estaAbierto) {
    block.classList.add('open');
  }
}

/* ─────────────────────────────────────────
   LOGIN
───────────────────────────────────────── */
function handleLogin() {
  var usuarioInput = document.getElementById('loginUsuario');
  var claveInput   = document.getElementById('loginClave');
  var errorUsuario = document.getElementById('errorUsuario');
  var errorClave   = document.getElementById('errorClave');

  var usuario = usuarioInput.value.trim();
  var clave   = claveInput.value;

  // Limpia errores previos
  usuarioInput.classList.remove('error');
  claveInput.classList.remove('error');
  errorUsuario.classList.remove('show');
  errorClave.classList.remove('show');

  // Validación: campos vacíos
  if (!usuario) {
    usuarioInput.classList.add('error');
    errorUsuario.textContent = 'Ingresa tu usuario o correo.';
    errorUsuario.classList.add('show');
    usuarioInput.focus();
    return;
  }
  if (!clave) {
    claveInput.classList.add('error');
    errorClave.textContent = 'Ingresa tu contraseña.';
    errorClave.classList.add('show');
    claveInput.focus();
    return;
  }

  // Validación: credenciales
  var encontrado = USUARIOS.find(function(u) {
    return u.usuario === usuario && u.clave === clave;
  });

  if (!encontrado) {
    // Detectar si el usuario existe (para dar un mensaje más específico)
    var usuarioExiste = USUARIOS.find(function(u) { return u.usuario === usuario; });
    if (usuarioExiste) {
      claveInput.classList.add('error');
      errorClave.textContent = 'Contraseña incorrecta.';
      errorClave.classList.add('show');
      claveInput.focus();
    } else {
      usuarioInput.classList.add('error');
      errorUsuario.textContent = 'Usuario o correo no registrado.';
      errorUsuario.classList.add('show');
      usuarioInput.focus();
    }
    return;
  }

  // ✅ Acceso correcto
  showPage('home');
}

/* Permite enviar con Enter */
document.addEventListener('DOMContentLoaded', function() {
  var inputs = document.querySelectorAll('#loginUsuario, #loginClave');
  inputs.forEach(function(input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleLogin();
    });
  });
});