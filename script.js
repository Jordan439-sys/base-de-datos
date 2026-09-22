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
  localStorage.setItem('pf_unidad', n);
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
    var n = numeroDeSemana(block);
    if (n) localStorage.setItem('pf_semana', n);
  } else {
    localStorage.removeItem('pf_semana');
  }
}

/* Restaura, al cargar la página, la unidad y la semana que quedaron abiertas */
function restaurarSemanaGuardada() {
  var unidad = localStorage.getItem('pf_unidad');
  var semana = localStorage.getItem('pf_semana');
  if (!semana) return;

  var block = document.querySelector('.semana-block[data-semana="' + semana + '"]');
  if (!block) return;

  if (unidad) switchTab(parseInt(unidad, 10));

  var panel = block.closest('.unit-content-panel');
  if (panel) {
    panel.querySelectorAll('.semana-block.open').forEach(function(b) { b.classList.remove('open'); });
  }
  block.classList.add('open');

  if (document.getElementById('page-unidades')) {
    showPage('unidades');
    setTimeout(function() { block.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
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
  activarModoAdmin();
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

  agregarBadgeAdmin();
  if (esAdmin()) document.body.classList.add('admin-mode');
  actualizarBotonLogin();
  inicializarSemanas();
  restaurarSemanaGuardada();

  aplicarTemaGuardado();
  crearBotonTema();
});


/* ══════════════════════════════════════════
   MODO HACKER · alterna el tema visual del sitio
══════════════════════════════════════════ */
function aplicarTemaGuardado() {
  if (localStorage.getItem('pf_tema') === 'hacker') {
    document.body.classList.add('tema-hacker');
  }
}

function crearBotonTema() {
  if (document.querySelector('.tema-toggle-btn')) return;
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tema-toggle-btn';
  btn.textContent = '🔄 Cambiar modo';
  btn.addEventListener('click', function() {
    var activo = document.body.classList.toggle('tema-hacker');
    localStorage.setItem('pf_tema', activo ? 'hacker' : 'clasico');
  });
  document.body.appendChild(btn);
}


/* ══════════════════════════════════════════
   MODO ADMINISTRADOR · SUBIR ARCHIVOS POR SEMANA
   Los archivos se guardan en IndexedDB, en este
   mismo navegador/dispositivo (no en un servidor).
══════════════════════════════════════════ */

var DB_NAME    = 'portafolioArchivosDB';
var DB_VERSION = 1;
var STORE_NAME = 'archivos';
var dbPromise  = null;

function abrirDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise(function(resolve, reject) {
    if (!window.indexedDB) { reject('IndexedDB no disponible'); return; }
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = function(e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        var store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('semana', 'semana', { unique: false });
      }
    };
    req.onsuccess = function(e) { resolve(e.target.result); };
    req.onerror   = function(e) { reject(e); };
  });
  return dbPromise;
}

function guardarArchivo(semana, nombre, tipo, dataUrl) {
  return abrirDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx  = db.transaction(STORE_NAME, 'readwrite');
      var req = tx.objectStore(STORE_NAME).add({
        semana: semana, nombre: nombre, tipo: tipo, dataUrl: dataUrl, fecha: Date.now()
      });
      req.onsuccess = function() { resolve(req.result); };
      req.onerror   = function(e) { reject(e); };
    });
  });
}

function obtenerArchivosPorSemana(semana) {
  return abrirDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx  = db.transaction(STORE_NAME, 'readonly');
      var req = tx.objectStore(STORE_NAME).index('semana').getAll(semana);
      req.onsuccess = function() { resolve(req.result); };
      req.onerror   = function(e) { reject(e); };
    });
  });
}

function eliminarArchivo(id) {
  return abrirDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = function() { resolve(); };
      tx.onerror    = function(e) { reject(e); };
    });
  });
}

function iconoPorExtension(nombre) {
  var ext = (nombre.split('.').pop() || '').toLowerCase();
  var mapa = {
    pdf: '📄', doc: '📄', docx: '📄',
    xls: '📊', xlsx: '📊', csv: '📊',
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', webp: '🖼️',
    zip: '🗂️', rar: '🗂️',
    js: '🍃', sql: '🗄️', txt: '📋', ppt: '📑', pptx: '📑'
  };
  return mapa[ext] || '📎';
}

function escaparHTML(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ── Estado de administrador ── */
function esAdmin() {
  return localStorage.getItem('pf_admin') === '1';
}

function activarModoAdmin() {
  localStorage.setItem('pf_admin', '1');
  document.body.classList.add('admin-mode');
  actualizarBotonLogin();
  inicializarSemanas();
}

function cerrarSesionAdmin() {
  localStorage.removeItem('pf_admin');
  document.body.classList.remove('admin-mode');
  actualizarBotonLogin();
  showPage('home');
}

function actualizarBotonLogin() {
  var btn = document.querySelector('.btn-login');
  if (!btn) return;
  if (esAdmin()) {
    btn.textContent = 'Cerrar sesión';
    btn.onclick = cerrarSesionAdmin;
  } else {
    btn.textContent = 'Ingresar';
    btn.onclick = function() { showPage('login'); };
  }
}

function agregarBadgeAdmin() {
  if (document.querySelector('.admin-badge')) return;
  var brand = document.querySelector('.nav-brand-sub');
  if (!brand) return;
  var span = document.createElement('span');
  span.className = 'admin-badge';
  span.textContent = 'Modo Admin';
  brand.parentNode.appendChild(span);
}

/* Extrae el número de semana leyendo el badge "Semana N" */
function numeroDeSemana(block) {
  var badge = block.querySelector('.semana-badge');
  if (!badge) return null;
  var m = badge.textContent.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

/* Prepara cada bloque de semana: agrega el panel de subida (oculto para
   visitantes) y renderiza los archivos ya guardados en este navegador */
function inicializarSemanas() {
  document.querySelectorAll('.semana-block').forEach(function(block) {
    var n = numeroDeSemana(block);
    if (!n) return;
    block.setAttribute('data-semana', n);

    var body = block.querySelector('.semana-body');
    if (!body) return;

    var listaDinamica = body.querySelector('.recursos-dinamicos');
    if (!listaDinamica) {
      listaDinamica = document.createElement('div');
      listaDinamica.className = 'recursos-list recursos-dinamicos';
      body.appendChild(listaDinamica);
    }

    var panelSubida = body.querySelector('.admin-upload');
    if (!panelSubida) {
      panelSubida = document.createElement('div');
      panelSubida.className = 'admin-upload';
      panelSubida.innerHTML =
        '<label class="admin-upload-label">' +
          '<span>📤 Agregar archivo — Semana ' + n + '</span>' +
          '<input type="file" class="admin-file-input" multiple hidden />' +
        '</label>' +
        '<p class="admin-upload-hint">Solo tú ves este panel (modo administrador). El archivo se guarda en ' +
        'este dispositivo/navegador. Para que aparezca para todos los visitantes de la página, usa ' +
        '"Copiar código" y pégalo en tu <code>index.html</code>, subiendo también el archivo real a la carpeta ' +
        '"semana ' + n + '".</p>';
      body.appendChild(panelSubida);

      var input = panelSubida.querySelector('.admin-file-input');
      input.addEventListener('change', function() {
        var archivos = Array.prototype.slice.call(input.files);
        archivos.forEach(function(file) {
          var reader = new FileReader();
          reader.onload = function() {
            guardarArchivo(n, file.name, file.type, reader.result).then(function() {
              renderArchivosDeSemana(block, n);
            });
          };
          reader.readAsDataURL(file);
        });
        input.value = '';
      });
    }

    renderArchivosDeSemana(block, n);
  });
}

function renderArchivosDeSemana(block, n) {
  var body = block.querySelector('.semana-body');
  if (!body) return;
  var contenedor = body.querySelector('.recursos-dinamicos');
  if (!contenedor) return;

  obtenerArchivosPorSemana(n).then(function(archivos) {
    contenedor.innerHTML = '';
    archivos.forEach(function(a) {
      var item = document.createElement('div');
      item.className = 'recurso-item recurso-item-dinamico';

      var izquierda = document.createElement('div');
      izquierda.className = 'recurso-left';
      izquierda.innerHTML =
        '<div class="recurso-icon">' + iconoPorExtension(a.nombre) + '</div>' +
        '<div>' +
          '<div class="recurso-name">' + escaparHTML(a.nombre) + '</div>' +
          '<div class="recurso-tipo">Subido · solo en este dispositivo</div>' +
        '</div>';

      var acciones = document.createElement('div');
      acciones.className = 'recurso-actions';

      var btnVer = document.createElement('button');
      btnVer.type = 'button';
      btnVer.className = 'btn-download';
      btnVer.textContent = '👁 Ver';
      btnVer.addEventListener('click', function(e) {
        e.stopPropagation();
        abrirVisor(a.nombre, a.dataUrl, a.tipo);
      });

      var btnCode = document.createElement('button');
      btnCode.type = 'button';
      btnCode.className = 'btn-code admin-only';
      btnCode.title = 'Copiar código HTML';
      btnCode.textContent = '{ }';
      btnCode.setAttribute('data-id', a.id);
      btnCode.setAttribute('data-semana', n);
      btnCode.setAttribute('data-nombre', a.nombre);

      var btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn-delete admin-only';
      btnDel.title = 'Eliminar';
      btnDel.textContent = '✕';
      btnDel.setAttribute('data-id', a.id);

      acciones.appendChild(btnVer);
      acciones.appendChild(btnCode);
      acciones.appendChild(btnDel);

      item.appendChild(izquierda);
      item.appendChild(acciones);
      contenedor.appendChild(item);
    });
  });
}

/* ── Visor en pantalla (no descarga, solo muestra el archivo) ── */
function crearVisorModal() {
  if (document.querySelector('.visor-overlay')) return;
  var overlay = document.createElement('div');
  overlay.className = 'visor-overlay';
  overlay.innerHTML =
    '<div class="visor-caja">' +
      '<div class="visor-header">' +
        '<span class="visor-titulo"></span>' +
        '<button type="button" class="visor-cerrar" aria-label="Cerrar">✕</button>' +
      '</div>' +
      '<div class="visor-contenido"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) cerrarVisor();
  });
  overlay.querySelector('.visor-cerrar').addEventListener('click', cerrarVisor);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') cerrarVisor();
  });
}

function cerrarVisor() {
  var overlay = document.querySelector('.visor-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  // No se toca el acordeón de semanas: la semana abierta se queda tal cual estaba
  var contenido = overlay.querySelector('.visor-contenido');
  setTimeout(function() { if (contenido) contenido.innerHTML = ''; }, 200);
}

function abrirVisor(nombre, dataUrl, tipo) {
  crearVisorModal();
  var overlay    = document.querySelector('.visor-overlay');
  var titulo     = overlay.querySelector('.visor-titulo');
  var contenido  = overlay.querySelector('.visor-contenido');
  titulo.textContent = nombre;
  contenido.innerHTML = '';

  var esImagen = (tipo && tipo.indexOf('image/') === 0) || /\.(png|jpe?g|gif|webp|svg)$/i.test(nombre);
  var esPDF    = (tipo === 'application/pdf') || /\.pdf$/i.test(nombre);

  if (esImagen) {
    var img = document.createElement('img');
    img.src = dataUrl; img.alt = nombre; img.className = 'visor-imagen';
    contenido.appendChild(img);
  } else if (esPDF) {
    var iframe = document.createElement('iframe');
    iframe.src = dataUrl; iframe.className = 'visor-iframe';
    contenido.appendChild(iframe);
  } else {
    var aviso = document.createElement('div');
    aviso.className = 'visor-aviso';
    aviso.innerHTML =
      'Este tipo de archivo no tiene vista previa dentro de la página.<br>' +
      '<a href="' + dataUrl + '" target="_blank" rel="noopener" class="btn-download">Abrir en otra pestaña</a>';
    contenido.appendChild(aviso);
  }

  overlay.classList.add('visible');
}

/* Delegación de eventos: eliminar archivo o copiar el código HTML equivalente */
document.addEventListener('click', function(e) {
  var delBtn = e.target.closest('.btn-delete');
  if (delBtn) {
    var block = delBtn.closest('.semana-block');
    var n     = numeroDeSemana(block);
    var id    = parseInt(delBtn.getAttribute('data-id'), 10);
    if (confirm('¿Eliminar este archivo? Esta acción no se puede deshacer.')) {
      eliminarArchivo(id).then(function() { renderArchivosDeSemana(block, n); });
    }
    return;
  }

  var codeBtn = e.target.closest('.btn-code');
  if (codeBtn) {
    var semana = codeBtn.getAttribute('data-semana');
    var nombre = codeBtn.getAttribute('data-nombre');
    var titulo = nombre.replace(/\.[^/.]+$/, '');
    var snippet =
'<div class="recurso-item">\n' +
'  <div class="recurso-left">\n' +
'    <div class="recurso-icon">' + iconoPorExtension(nombre) + '</div>\n' +
'    <div>\n' +
'      <div class="recurso-name">' + titulo + '</div>\n' +
'    </div>\n' +
'  </div>\n' +
'  <a href="semana ' + semana + '\\' + nombre + '" class="btn-download">⬇ VER TRABAJO</a>\n' +
'</div>';

    var avisar = function() {
      alert('Código copiado.\n\nPégalo dentro de la lista "Semana ' + semana + '" en tu index.html, y sube el archivo real "' + nombre + '" a la carpeta "semana ' + semana + '" del proyecto para que quede visible para todos.');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(snippet).then(avisar).catch(function() { prompt('Copia este código manualmente:', snippet); });
    } else {
      prompt('Copia este código manualmente:', snippet);
    }
  }
});
