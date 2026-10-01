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

/* ══════════════════════════════════════════
   ROBOT IA · asistente flotante (DBot)
   Haz clic en el robot para abrir el chat.

   👉 Para que responda CUALQUIER pregunta con IA real,
      pega abajo la URL de tu proxy (ver worker.js).
      Si la dejas vacía, usa la base de conocimiento local.
══════════════════════════════════════════ */
var CHATBOT_API_URL = '';

var chatHistorial = [];
var chatOcupado   = false;

function normalizarTexto(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

var UNIDADES_INFO = {
  1: { titulo: 'Introducción a Bases de Datos', semanas: '1–4',   desc: 'Fundamentos, modelo relacional, SQL básico y DDL.' },
  2: { titulo: 'Diseño y Normalización',        semanas: '5–8',   desc: 'Modelado ER, formas normales e integridad referencial.' },
  3: { titulo: 'SQL Avanzado',                  semanas: '9–12',  desc: 'Procedimientos, vistas, triggers y optimización de consultas.' },
  4: { titulo: 'Bases de Datos NoSQL',          semanas: '13–16', desc: 'MongoDB, Redis, comparativas y casos de uso reales.' }
};

var BASE_CONOCIMIENTO = [
  { k: ['hola', 'buenas', 'hey', 'buenos dias', 'buenas tardes', 'buenas noches'],
    r: '¡Hola! 👋 Soy DBot, el asistente de este portafolio. Pregúntame por las unidades, las semanas o conceptos de Base de Datos.' },
  { k: ['quien eres', 'que eres', 'como te llamas', 'tu nombre'],
    r: 'Soy DBot 🤖, el robot de este portafolio de Base de Datos II. Puedo explicarte el contenido del curso y conceptos de SQL y NoSQL.' },
  { k: ['jordan', 'vera', 'autor', 'sobre mi', 'quien hizo'],
    r: 'Este portafolio es de Jordan Vera Madueño, estudiante del V ciclo de Ingeniería de Sistemas y Computación en la Universidad Peruana Los Andes (Huancayo, Perú). Se describe como responsable, proactivo y comprometido con el aprendizaje continuo.',
    b: { t: 'Ver "Sobre mí"', f: function() { irSobreMi(); } } },
  { k: ['upla', 'universidad', 'los andes', 'huancayo'],
    r: 'La Universidad Peruana Los Andes (UPLA) está en Huancayo, Perú. Este portafolio corresponde al curso Base de Datos II, ciclo académico 2026.' },
  { k: ['cuantas unidades', 'cuantas semanas', 'contenido del curso', 'temario', 'de que trata', 'que se ve', 'silabo'],
    r: 'El curso tiene 4 unidades y 16 semanas:\n• Unidad I (sem. 1–4): Introducción a Bases de Datos\n• Unidad II (sem. 5–8): Diseño y Normalización\n• Unidad III (sem. 9–12): SQL Avanzado\n• Unidad IV (sem. 13–16): Bases de Datos NoSQL',
    b: { t: 'Explorar unidades', f: function() { showPage('unidades'); } } },
  { k: ['login', 'ingresar', 'iniciar sesion', 'contrasena', 'admin', 'subir archivo', 'modo admin'],
    r: 'El botón "Ingresar" (arriba a la derecha) abre el acceso al portal. Con el modo administrador se pueden subir archivos a cada semana.' },
  { k: ['modo hacker', 'cambiar modo', 'tema', 'modo oscuro'],
    r: 'El botón "🔄 Cambiar modo" (abajo a la derecha) alterna entre el tema clásico y el modo hacker. Tu elección se guarda en el navegador.' },

  { k: ['sql server', 'sqlserver', 't-sql', 'tsql', 'ssms'],
    r: 'SQL Server es el motor relacional de Microsoft. Usa T-SQL como lenguaje y se administra con SSMS. En el curso se usa para DDL, procedimientos almacenados, vistas y triggers.' },
  { k: ['postgres', 'postgresql', 'pgadmin'],
    r: 'PostgreSQL es un motor relacional open source, muy robusto y compatible con el estándar SQL. Soporta tipos avanzados como JSON y arrays, y extensiones.' },
  { k: ['mongodb', 'mongo', 'documento', 'aggregation', 'pipeline'],
    r: 'MongoDB es una base de datos NoSQL orientada a documentos (JSON/BSON). El Aggregation Pipeline procesa datos por etapas: $match filtra, $group agrupa, $project elige campos, $sort ordena, $limit limita y $lookup equivale a un JOIN.' },
  { k: ['nosql', 'no relacional', 'redis', 'clave valor'],
    r: 'NoSQL agrupa bases no relacionales: documentos (MongoDB), clave-valor (Redis), columnas y grafos. Priorizan flexibilidad de esquema y escalabilidad horizontal. Se eligen cuando los datos cambian mucho o el volumen es enorme.' },
  { k: ['sql o nosql', 'diferencia entre sql', 'sql vs nosql', 'cuando usar'],
    r: 'SQL: esquema fijo, relaciones, transacciones ACID; ideal para datos estructurados (finanzas, inventarios). NoSQL: esquema flexible y escala horizontal; ideal para datos variables o de gran volumen (catálogos, logs, tiempo real). Muchas soluciones usan ambos.' },
  { k: ['normalizacion', 'forma normal', '1fn', '2fn', '3fn', 'bcnf'],
    r: 'Normalizar es organizar tablas para reducir redundancia.\n• 1FN: valores atómicos, sin grupos repetidos.\n• 2FN: 1FN + sin dependencias parciales de la clave.\n• 3FN: 2FN + sin dependencias transitivas.\nMenos duplicación, menos anomalías al insertar, actualizar o borrar.' },
  { k: ['modelo er', 'entidad relacion', 'diagrama er', 'cardinalidad'],
    r: 'El modelo Entidad-Relación representa entidades (tablas), atributos y relaciones con su cardinalidad (1:1, 1:N, N:M). Es el paso previo a crear el esquema físico.' },
  { k: ['clave primaria', 'primary key', 'clave foranea', 'foreign key', 'integridad'],
    r: 'La clave primaria (PK) identifica cada fila de forma única. La clave foránea (FK) apunta a la PK de otra tabla y garantiza la integridad referencial: no puedes referenciar algo que no existe.' },
  { k: ['join', 'inner join', 'left join'],
    r: 'JOIN combina filas de varias tablas:\n• INNER JOIN: solo coincidencias.\n• LEFT JOIN: todo lo de la izquierda + coincidencias.\n• RIGHT JOIN: lo contrario.\n• FULL JOIN: todo de ambas.\nEjemplo: SELECT c.nombre, p.total FROM clientes c INNER JOIN pedidos p ON p.id_cliente = c.id;' },
  { k: ['select', 'consulta', 'where', 'group by', 'order by'],
    r: 'Estructura básica de una consulta:\nSELECT columnas FROM tabla WHERE condición GROUP BY columna HAVING condición ORDER BY columna;\nEl orden lógico de ejecución es FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.' },
  { k: ['ddl', 'create table', 'alter table', 'dml', 'dcl'],
    r: 'DDL define la estructura (CREATE, ALTER, DROP). DML manipula datos (INSERT, UPDATE, DELETE, SELECT). DCL controla permisos (GRANT, REVOKE).' },
  { k: ['trigger', 'disparador'],
    r: 'Un trigger es código que se ejecuta automáticamente ante INSERT, UPDATE o DELETE en una tabla. Sirve para auditoría, validaciones y mantener datos derivados.' },
  { k: ['procedimiento', 'stored procedure', 'almacenado'],
    r: 'Un procedimiento almacenado es un conjunto de instrucciones SQL guardado en el servidor, con parámetros, que se ejecuta con EXEC/CALL. Mejora rendimiento, reutilización y seguridad.' },
  { k: ['vista', 'view'],
    r: 'Una vista es una consulta guardada que se usa como si fuera una tabla. Simplifica consultas complejas y permite ocultar columnas sensibles.' },
  { k: ['indice', 'index', 'optimizacion', 'rendimiento', 'plan de ejecucion'],
    r: 'Un índice acelera las búsquedas evitando recorrer toda la tabla (como el índice de un libro), pero hace más lentas las escrituras. Para optimizar: indexa columnas de WHERE/JOIN, evita SELECT * y revisa el plan de ejecución.' },
  { k: ['transaccion', 'acid', 'commit', 'rollback'],
    r: 'Una transacción agrupa operaciones que se ejecutan todas o ninguna. ACID: Atomicidad, Consistencia, Aislamiento (Isolation) y Durabilidad. Se controla con BEGIN, COMMIT y ROLLBACK.' },
  { k: ['backup', 'respaldo', 'monitoreo', 'seguridad'],
    r: 'Un buen plan incluye respaldos periódicos (completo, diferencial, de log), pruebas de restauración, control de permisos por roles y monitoreo del rendimiento.' },
  { k: ['base de datos', 'sgbd', 'dbms'],
    r: 'Una base de datos es un conjunto organizado de datos relacionados. El SGBD (DBMS) es el software que la administra: SQL Server, PostgreSQL, MongoDB, etc.' },
  { k: ['gracias', 'genial', 'perfecto'],
    r: '¡De nada! 😄 Aquí estaré si tienes más preguntas.' },
  { k: ['adios', 'chao', 'hasta luego', 'nos vemos'],
    r: '¡Hasta luego! 👋' }
];

/* Responde con la base local. Unidades y semanas se leen de la propia página. */
function responderLocal(pregunta) {
  var q = normalizarTexto(pregunta);

  var mS = q.match(/semana\s*(\d{1,2})/);
  if (mS) {
    var n = parseInt(mS[1], 10), hallado = null;
    document.querySelectorAll('.semana-block').forEach(function(b) {
      if (numeroDeSemana(b) === n) hallado = b;
    });
    if (hallado) {
      var t = hallado.querySelector('.semana-titulo');
      var d = hallado.querySelector('.semana-descripcion');
      return {
        r: 'Semana ' + n + (t ? ' — ' + t.textContent.trim() : '') + (d ? '\n' + d.textContent.replace(/\s+/g, ' ').trim() : ''),
        b: { t: 'Abrir semana ' + n, f: function() {
          showUnidad(Math.ceil(n / 4));
          setTimeout(function() {
            if (!hallado.classList.contains('open')) toggleSemana(hallado.querySelector('.semana-header'));
            hallado.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
        } }
      };
    }
    return { r: 'El curso llega hasta la semana 16. Prueba con un número del 1 al 16.' };
  }

  var mU = q.match(/unidad\s*(iv|iii|ii|i|1|2|3|4)\b/);
  if (mU) {
    var mapa = { i: 1, ii: 2, iii: 3, iv: 4 };
    var u = mapa[mU[1]] || parseInt(mU[1], 10);
    var info = UNIDADES_INFO[u];
    return { r: 'Unidad ' + u + ' — ' + info.titulo + ' (semanas ' + info.semanas + ').\n' + info.desc,
             b: { t: 'Ir a la Unidad ' + u, f: function() { showUnidad(u); } } };
  }

  var mejor = null, mejorPuntaje = 0;
  BASE_CONOCIMIENTO.forEach(function(e) {
    var p = 0;
    e.k.forEach(function(c) { if (q.indexOf(c) !== -1) p += c.length; });
    if (p > mejorPuntaje) { mejorPuntaje = p; mejor = e; }
  });
  if (mejor) return { r: mejor.r, b: mejor.b };

  return { r: 'Esa pregunta se sale de lo que sé sin conexión a la IA 🤔. Puedo ayudarte con las unidades y semanas del curso, SQL, normalización, joins, triggers, índices, MongoDB y NoSQL. ¿Probamos con alguno?' };
}

/* Usa la IA real si hay URL configurada; si falla, cae a la base local */
function obtenerRespuesta(pregunta) {
  if (!CHATBOT_API_URL) {
    return Promise.resolve(responderLocal(pregunta));
  }
  return fetch(CHATBOT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: chatHistorial.slice(-10) })
  })
    .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(d) {
      if (!d || !d.reply) throw new Error('Respuesta vacía');
      return { r: d.reply };
    })
    .catch(function() {
      var loc = responderLocal(pregunta);
      loc.r = '(Sin conexión con la IA, respondo desde mi base local)\n' + loc.r;
      return loc;
    });
}

/* ── Interfaz ── */
var ROBOT_SVG =
  '<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">' +
    '<line x1="32" y1="5" x2="32" y2="14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
    '<circle class="rb-antena" cx="32" cy="6" r="4" fill="var(--gold)"/>' +
    '<rect x="8" y="26" width="6" height="14" rx="3" fill="currentColor"/>' +
    '<rect x="50" y="26" width="6" height="14" rx="3" fill="currentColor"/>' +
    '<rect x="13" y="14" width="38" height="36" rx="12" fill="var(--card)" stroke="currentColor" stroke-width="3"/>' +
    '<g class="rb-ojos"><circle cx="24" cy="30" r="4.5" fill="currentColor"/><circle cx="40" cy="30" r="4.5" fill="currentColor"/></g>' +
    '<path d="M24 41 Q32 47 40 41" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>' +
  '</svg>';

function agregarMensaje(texto, quien, boton) {
  var cont = document.querySelector('.rb-mensajes');
  var m = document.createElement('div');
  m.className = 'rb-msg rb-' + quien;
  m.textContent = texto;
  if (boton) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'rb-accion';
    b.textContent = boton.t;
    b.addEventListener('click', function() { boton.f(); });
    m.appendChild(b);
  }
  cont.appendChild(m);
  cont.scrollTop = cont.scrollHeight;
  return m;
}

function enviarPregunta(texto) {
  texto = (texto || '').trim();
  if (!texto || chatOcupado) return;
  chatOcupado = true;

  var chips = document.querySelector('.rb-chips');
  if (chips) chips.style.display = 'none';

  agregarMensaje(texto, 'user');
  chatHistorial.push({ role: 'user', content: texto });

  var escribiendo = agregarMensaje('', 'bot');
  escribiendo.classList.add('rb-escribiendo');
  escribiendo.innerHTML = '<span></span><span></span><span></span>';

  var inicio = Date.now();
  obtenerRespuesta(texto).then(function(res) {
    var espera = Math.max(0, 450 - (Date.now() - inicio));
    setTimeout(function() {
      escribiendo.remove();
      agregarMensaje(res.r, 'bot', res.b);
      chatHistorial.push({ role: 'assistant', content: res.r });
      chatOcupado = false;
      document.querySelector('.rb-input').focus();
    }, espera);
  });
}

function alternarChat(abrir) {
  var panel = document.querySelector('.rb-panel');
  var fab   = document.querySelector('.rb-fab');
  var tip   = document.querySelector('.rb-tip');
  if (!panel) return;
  var visible = (typeof abrir === 'boolean') ? abrir : !panel.classList.contains('abierto');
  panel.classList.toggle('abierto', visible);
  fab.classList.toggle('activo', visible);
  fab.setAttribute('aria-expanded', visible ? 'true' : 'false');
  if (tip) tip.classList.remove('visible');
  if (visible) setTimeout(function() { document.querySelector('.rb-input').focus(); }, 200);
}

function crearRobotChat() {
  if (document.querySelector('.rb-fab')) return;

  var tip = document.createElement('div');
  tip.className = 'rb-tip';
  tip.textContent = '¡Hola! Pregúntame lo que quieras 👋';

  var fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'rb-fab';
  fab.setAttribute('aria-label', 'Abrir asistente de IA');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = ROBOT_SVG;
  fab.addEventListener('click', function() { alternarChat(); });

  var panel = document.createElement('div');
  panel.className = 'rb-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat con DBot');
  panel.innerHTML =
    '<div class="rb-header">' +
      '<div class="rb-avatar">' + ROBOT_SVG + '</div>' +
      '<div class="rb-titulo"><strong>DBot</strong><span>Asistente · Base de Datos II</span></div>' +
      '<button type="button" class="rb-cerrar" aria-label="Cerrar">✕</button>' +
    '</div>' +
    '<div class="rb-mensajes"></div>' +
    '<div class="rb-chips">' +
      '<button type="button">¿Qué se ve en el curso?</button>' +
      '<button type="button">¿SQL o NoSQL?</button>' +
      '<button type="button">Explícame la normalización</button>' +
    '</div>' +
    '<div class="rb-form">' +
      '<input type="text" class="rb-input" placeholder="Escribe tu pregunta…" autocomplete="off" maxlength="500" />' +
      '<button type="button" class="rb-enviar" aria-label="Enviar">➤</button>' +
    '</div>';

  document.body.appendChild(tip);
  document.body.appendChild(panel);
  document.body.appendChild(fab);

  agregarMensaje('¡Hola! Soy DBot 🤖. Pregúntame lo que quieras sobre este portafolio y Base de Datos.', 'bot');

  panel.querySelector('.rb-cerrar').addEventListener('click', function() { alternarChat(false); });
  panel.querySelector('.rb-enviar').addEventListener('click', function() {
    var inp = panel.querySelector('.rb-input');
    var t = inp.value; inp.value = '';
    enviarPregunta(t);
  });
  panel.querySelector('.rb-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      var t = e.target.value; e.target.value = '';
      enviarPregunta(t);
    }
  });
  panel.querySelectorAll('.rb-chips button').forEach(function(c) {
    c.addEventListener('click', function() { enviarPregunta(c.textContent); });
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && panel.classList.contains('abierto')) alternarChat(false);
  });

  // Globito de bienvenida, una sola vez por sesión
  try {
    if (!sessionStorage.getItem('pf_robot_tip')) {
      sessionStorage.setItem('pf_robot_tip', '1');
      setTimeout(function() { tip.classList.add('visible'); }, 1500);
      setTimeout(function() { tip.classList.remove('visible'); }, 8000);
    }
  } catch (err) {}
}

document.addEventListener('DOMContentLoaded', crearRobotChat);
 
