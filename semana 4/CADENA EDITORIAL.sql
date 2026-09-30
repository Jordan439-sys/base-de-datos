/* =====================================================
   Enunciado 01: Cadena editorial  (SQL Server / T-SQL)
   ===================================================== */

IF DB_ID('CadenaEditorial') IS NOT NULL
BEGIN
    ALTER DATABASE CadenaEditorial SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE CadenaEditorial;
END
GO

CREATE DATABASE CadenaEditorial;
GO

USE CadenaEditorial;
GO

/* ---------- SUCURSAL ---------- */
CREATE TABLE Sucursal (
    id_sucursal      INT IDENTITY(1,1) NOT NULL,
    codigo_sucursal  VARCHAR(10)  NOT NULL,
    domicilio        VARCHAR(150) NOT NULL,
    telefono         VARCHAR(15)  NOT NULL,
    CONSTRAINT PK_Sucursal PRIMARY KEY (id_sucursal),
    CONSTRAINT UQ_Sucursal_Codigo UNIQUE (codigo_sucursal)
);
GO

/* ---------- EMPLEADO (trabaja en UNA sola sucursal) ---------- */
CREATE TABLE Empleado (
    id_empleado  INT IDENTITY(1,1) NOT NULL,
    nif          VARCHAR(12)  NOT NULL,
    nombre       VARCHAR(50)  NOT NULL,
    apellidos    VARCHAR(100) NOT NULL,
    telefono     VARCHAR(15)  NULL,
    id_sucursal  INT          NOT NULL,
    CONSTRAINT PK_Empleado PRIMARY KEY (id_empleado),
    CONSTRAINT UQ_Empleado_NIF UNIQUE (nif),
    CONSTRAINT FK_Empleado_Sucursal FOREIGN KEY (id_sucursal)
        REFERENCES Sucursal (id_sucursal)
);
GO

/* ---------- REVISTA ---------- */
CREATE TABLE Revista (
    id_revista       INT IDENTITY(1,1) NOT NULL,
    numero_registro  VARCHAR(20)  NOT NULL,
    titulo           VARCHAR(150) NOT NULL,
    periodicidad     VARCHAR(30)  NOT NULL,   -- semanal, mensual, etc.
    tipo             VARCHAR(50)  NOT NULL,
    CONSTRAINT PK_Revista PRIMARY KEY (id_revista),
    CONSTRAINT UQ_Revista_Registro UNIQUE (numero_registro)
);
GO

/* ---------- PUBLICA (Sucursal N:M Revista) ---------- */
CREATE TABLE Publica (
    id_sucursal INT NOT NULL,
    id_revista  INT NOT NULL,
    CONSTRAINT PK_Publica PRIMARY KEY (id_sucursal, id_revista),
    CONSTRAINT FK_Publica_Sucursal FOREIGN KEY (id_sucursal)
        REFERENCES Sucursal (id_sucursal),
    CONSTRAINT FK_Publica_Revista FOREIGN KEY (id_revista)
        REFERENCES Revista (id_revista)
);
GO

/* ---------- PERIODISTA (no trabaja en sucursales) ---------- */
CREATE TABLE Periodista (
    id_periodista INT IDENTITY(1,1) NOT NULL,
    nif           VARCHAR(12)  NOT NULL,
    nombre        VARCHAR(50)  NOT NULL,
    apellidos     VARCHAR(100) NOT NULL,
    telefono      VARCHAR(15)  NULL,
    especialidad  VARCHAR(80)  NOT NULL,
    CONSTRAINT PK_Periodista PRIMARY KEY (id_periodista),
    CONSTRAINT UQ_Periodista_NIF UNIQUE (nif)
);
GO

/* ---------- (Periodista N:M Revista) ---------- */
CREATE TABLE Articulos (
    id_periodista INT NOT NULL,
    id_revista    INT NOT NULL,
    CONSTRAINT PK_Escribe PRIMARY KEY (id_periodista, id_revista),
    CONSTRAINT FK_Escribe_Periodista FOREIGN KEY (id_periodista)
        REFERENCES Periodista (id_periodista),
    CONSTRAINT FK_Escribe_Revista FOREIGN KEY (id_revista)
        REFERENCES Revista (id_revista)
);
GO

/* ---------- SECCION (entidad débil de Revista) ---------- */
CREATE TABLE Seccion (
    id_revista  INT NOT NULL,
    titulo      VARCHAR(100) NOT NULL,
    extension   INT NOT NULL,               -- p. ej. número de páginas
    CONSTRAINT PK_Seccion PRIMARY KEY (id_revista, titulo),
    CONSTRAINT CK_Seccion_Extension CHECK (extension > 0),
    CONSTRAINT FK_Seccion_Revista FOREIGN KEY (id_revista)
        REFERENCES Revista (id_revista) ON DELETE CASCADE
);
GO

/* ---------- EJEMPLAR (entidad débil de Revista) ---------- */
CREATE TABLE Ejemplar (
    id_revista            INT  NOT NULL,
    fecha                 DATE NOT NULL,
    num_paginas           INT  NOT NULL,
    num_ejemplares_vendidos INT NOT NULL DEFAULT 0,
    CONSTRAINT PK_Ejemplar PRIMARY KEY (id_revista, fecha),
    CONSTRAINT CK_Ejemplar_Paginas CHECK (num_paginas > 0),
    CONSTRAINT CK_Ejemplar_Vendidos CHECK (num_ejemplares_vendidos >= 0),
    CONSTRAINT FK_Ejemplar_Revista FOREIGN KEY (id_revista)
        REFERENCES Revista (id_revista) ON DELETE CASCADE
);
GO

/* =====================================================
   DATOS DE EJEMPLO
   ===================================================== */
INSERT INTO Sucursal (codigo_sucursal, domicilio, telefono) VALUES
('SUC-001', 'Av. Principal 123, Madrid',  '910000001'),
('SUC-002', 'Calle Mayor 45, Barcelona',  '930000002');

INSERT INTO Empleado (nif, nombre, apellidos, telefono, id_sucursal) VALUES
('11111111A', 'Ana',   'García López',   '600111111', 1),
('22222222B', 'Luis',  'Pérez Ruiz',     '600222222', 1),
('33333333C', 'María', 'Sánchez Díaz',   '600333333', 2);

INSERT INTO Revista (numero_registro, titulo, periodicidad, tipo) VALUES
('REG-1001', 'Mundo Ciencia',  'Mensual', 'Divulgación'),
('REG-1002', 'Tech Semanal',   'Semanal', 'Tecnología');

INSERT INTO Publica (id_sucursal, id_revista) VALUES
(1, 1), (1, 2), (2, 2);

INSERT INTO Periodista (nif, nombre, apellidos, telefono, especialidad) VALUES
('44444444D', 'Carlos', 'Romero Gil',   '600444444', 'Ciencia'),
('55555555E', 'Laura',  'Navarro Soto', '600555555', 'Tecnología');

INSERT INTO Articulos(id_periodista, id_revista) VALUES
(1, 1), (2, 2), (2, 1);

INSERT INTO Seccion (id_revista, titulo, extension) VALUES
(1, 'Astronomía', 6),
(1, 'Biología',   4),
(2, 'Gadgets',    5);

INSERT INTO Ejemplar (id_revista, fecha, num_paginas, num_ejemplares_vendidos) VALUES
(1, '2026-08-01', 64, 12000),
(1, '2026-09-01', 68, 13500),
(2, '2026-09-25', 40, 8000);
GO