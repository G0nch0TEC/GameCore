create database gamecore_db;
use gamecore_db;

-- TABLA USUARIOS
CREATE TABLE usuario(
	id_usuario int primary key auto_increment,
    nombre varchar(100) not null,
    correo varchar(150) not null unique,
    contrasena varchar(255) not null,
    rol enum('ADMIN', 'CLIENTE') default 'CLIENTE',
    fecha_registro timestamp default current_timestamp
);

-- TABLA CATEGORIA
create table categoria(
	id_categoria int primary key auto_increment,
    nombre varchar(100) not null unique,
    descripcion text,
    fecha_creacion timestamp default current_timestamp
);

-- TABLA PRODUCTOS
create table producto(
	id_producto int primary key auto_increment,
    id_categoria int not null,
    id_usuario int,
    nombre_producto varchar(150) not null,
    descripcion text,
    precio decimal(10,2) not null check (precio > 0),
    stock int not null check(stock >= 0),
    img_url text,
    estado ENUM('ACTIVO', 'INACTIVO', 'AGOTADO') DEFAULT 'ACTIVO',
    fecha_creacion timestamp default current_timestamp,
    fecha_actualizacion timestamp default current_timestamp on update current_timestamp,
    foreign key (id_categoria) references categoria(id_categoria) on delete restrict on update cascade,
    foreign key (id_usuario) references usuario(id_usuario) on delete set null on update cascade
);

-- TABLA CARRITOS
create table carrito(
	id_carrito int primary key auto_increment,
    id_usuario int not null unique,
    foreign key (id_usuario) references usuario(id_usuario) on delete cascade on update cascade
);

-- TABLA CARRITO DETALLE

create table carrito_detalle(
	id_detalle int primary key auto_increment,
    id_carrito int not null,
    id_producto int not null,
    cantidad int not null check (cantidad > 0),
    fecha_agregado timestamp default current_timestamp,
    unique (id_carrito, id_producto),
    foreign key (id_carrito) references carrito(id_carrito) on delete cascade on update cascade,
    foreign key (id_producto) references producto(id_producto) on delete cascade on update cascade
);

-- TABLA COMPRAS
create table compra (
    id_compra INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT not null,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('PENDIENTE', 'PAGADO', 'CANCELADO') NOT NULL,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    foreign key (id_usuario) references usuario(id_usuario) on delete restrict on update cascade
);

-- TABLA: DETALLE_COMPRA
create table detalle_compra (
    id_detalle int primary key auto_increment,
    id_compra int not null,
    id_producto int not null,
    cantidad int not null check (cantidad > 0),
    precio_unitario decimal(10,2) not null check (precio_unitario > 0),
    unique (id_compra, id_producto),
    foreign key (id_compra) references compra(id_compra) on delete cascade on update cascade,
    foreign key (id_producto) references producto(id_producto) on delete restrict on update cascade
);

/*
INSERCION Y CONSULTA
1. INSERT (datos de prueba):
*/

-- USUARIOS
insert into usuarios (nombre, correo, contrasena, rol)
values
('Juan Perez', 'juan@gmail.com','123456', 'cliente'),
('Maria Lopez', 'maria@gmail.com', '123456', 'admin');

-- CATEGORIAS
insert into categoria (nombre, descripcion)
values
('Acción', 'Juegos de acción'),
('Aventura', 'Juegos de aventura');

-- PRODUCTOS
insert into productos (id_categoria, id_usuario, nombre_producto, descripcion, precio, stock)
values
(1, 2, 'Call of Duty', 'Juego de disparos', 150.00, 10),
(2, 2, 'Zelda', 'Juego de aventura', 200.00, 5);

-- CARRITO
insert into carritos (id_usuario)
values (1);

-- CARRITO DETALLE
insert into carrito_detalle (id_carrito, id_producto, cantidad)
values (1, 1, 2);

-- COMPRAS
insert into compras (id_usuario, estado, total)
values (1, 'pagado', 300.00);

-- DETALLE COMPRA
insert into detalle_compra (id_compra, id_producto, cantidad, precio_unitario)
values (1, 1, 2, 150.00);

/*
SELECT CON JOIN
*/

-- Consulta 1: Productos con su categoria y creador
SELECT p.nombre_producto, p.precio, c.nombre AS categoria, u.nombre AS creador FROM productos p
JOIN categoria c ON p.id_categoria = c.id_categoria
JOIN usuarios u ON p.id_usuario = u.id_usuario;

-- Consulta 2: Carrito con productos
SELECT u.nombre AS usuario, p.nombre_producto, cd.cantidad, p.precio, (cd.cantidad * p.precio) AS subtotal FROM carrito_detalle cd
JOIN carritos c ON cd.id_carrito = c.id_carrito
JOIN usuarios u ON c.id_usuario = u.id_usuario
JOIN productos p ON cd.id_producto = p.id_producto;

-- Consulta 3: Compras Completas
SELECT u.nombre AS cliente, co.id_compra, p.nombre_producto, dc.cantidad, dc.precio_unitario, (dc.cantidad * dc.precio_unitario) AS total_producto
FROM detalle_compra dc
JOIN compras co ON dc.id_compra = co.id_compra
JOIN usuarios u ON co.id_usuario = u.id_usuario
JOIN productos p ON dc.id_producto = p.id_producto;

drop database gamecore_db;