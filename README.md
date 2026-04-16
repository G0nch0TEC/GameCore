# GameCore
Sistema web de gestión para GameCore, enfocado en el control de inventario, clientes y registro de ventas.

## Descripcion del negocio
Nombre: Sistema de gestion - GameCore <br>
Tamaño: Pequeña empresa, operacion individual o familiar <br>
Contexto: tienda dedicada  la venta de videojuegos, consolas y accesorios para distintas plataformas como PC, Playstation, Xbox y Nintendo. <br>
Justificacion: desarrollo de un sistema web de gestión que facilite el control de inventario, clientes y ventas, permitiendo mejorar la organización y eficiencia de sus procesos internos. <br> 

## Identificar el problema y solución
Problema: la gestión de productos y ventas se realiza de manera manual o herramientas básicas que no están diseñadas para la administración de un negocio. Esto puede generar varios inconvenientes en la organización y control de la información. <br>
Solucion tecnologica: Desarrollar un sistema web de gestión que centralice la información del negocio, permita controlar el inventario en tiempo real, registrar ventas y administrar clientes con su historial de compras, mejorando la organización, reduciendo errores y optimizando la administración general de la tienda.

 
## Requerimientos Funcionales
| Codigo | Descripcion |
|---|---|
| RF01 | El sistema permitirá la gestión de usuarios, incluyendo registro, autenticación y asignación de roles (cliente o administrador) |
| RF02 | El sistema permitirá la gestión de productos, incluyendo registro, actualización, eliminación y visualización, así como su asociación a categorías |
| RF03 | El sistema permitirá la gestión del carrito de compras, incluyendo la adición, modificación y eliminación de productos, así como la visualización de los mismos |
| RF04 | El sistema permitirá registrar compras asociadas a un usuario, almacenando información como fecha, estado y monto total |
| RF05 | El sistema permitirá registrar y consultar el detalle de cada compra, incluyendo los productos adquiridos, cantidad y precio unitario |
| RF06 | El sistema permitirá consultar el historial de compras de los usuarios, así como visualizar el detalle de cada compra |
 
## Requerimientos No Funcionales
 
| Codigo | Tipo | Descripcion |
|---|---|---|
| RNF01 | Usabilidad | El sistema deberá contar con una interfaz intuitiva que permita a los usuarios realizar operaciones básicas (registro, compra, navegación) |
| RNF02 | Rendimiento | El sistema deberá responder a las consultas en un tiempo máximo de 2 segundos en condiciones normales de uso |
| RNF03 | Seguridad | El sistema deberá restringir el acceso a funcionalidades según el rol del usuario (cliente o administrador), garantizando que cada usuario solo acceda a las funciones permitidas |
| RNF04 | Disponibilidad | El sistema deberá estar disponible al menos el 95% del tiempo, salvo mantenimiento programado |
| RNF05 | Compatibilidad | El sistema deberá funcionar correctamente en navegadores web modernos como Chrome, Firefox y Edge |

## Stack completo
1. Trello             = Gestión del proyecto (Kanban)
2. Draw.io            = Diagrama ER + Diagrama de Clases
3. Figma              = Wireframe + Diseño UI/UX
4. MySQL Workbench    = Diseñar y administrar BD
5. IntelliJ           = Backend (Spring Boot)
6. Visual studio code = Frontend (HTML,CSS,JS)
7. XAMPP              = Servidor Mysql para que funcione la BD

## Tecnologias utilizadas
- Java 21 Eclipse Temurin
- Spring Boot 4
- MySQL 8
- HTML5, CSS3, JavaScript
- IntelliJ IDEA
- Visual studio code
- XAMPP (MySql)
- MySQL Workbench
- Figma (diseño UI/UX)
- Draw.io (diagramas)


## Base de datos
 
El sistema cuenta con 7 tablas principales:
 
| Tabla | Descripcion |
|---|---|
| USUARIOS          | Usuarios del sistema con distintos roles y permisos. |
| CATEGORIA         | Tipos o clasificaciones de productos |
| PRODUCTOS         | Lista de productos con sus datos básicos |
| CARRITOS          | Registro de compras en proceso |
| CARRITOS_DETALLE  | Productos y cantidades dentro de cada carrito. |
| COMPRAS           | Registro de compras realizadas |
| DETALLE_COMPRA    | Detalle de productos en cada compra |

### Diagrama Entidad-Relacion (DER)
![Diagrama Entidad Relacion](resource/Diagrama%20entidad-relacion.drawio.png)

### Modelo Relacional (MR)
![Modelo Relacional](resource/Modelo%20relacional.drawio.png)

### Cardinalidades

USUARIOS — CARRITOS (1:1)
Un usuario solo puede tener un carrito, y cada carrito pertenece exclusivamente a un usuario.

USUARIOS — PRODUCTOS (1:N)
Un usuario puede registrar o gestionar varios productos, pero cada producto pertenece a un único usuario.

USUARIOS — COMPRAS (1:N)
Un usuario puede realizar múltiples compras, pero cada compra está asociada a un solo usuario.

CATEGORIA — PRODUCTOS (1:N)
Una categoría puede agrupar varios productos, pero cada producto pertenece a una sola categoría.

CARRITOS — CARRITO_DETALLE (1:N)
Un carrito puede contener varios registros de detalle (productos agregados), pero cada detalle pertenece a un único carrito.

PRODUCTOS — DETALLE_COMPRA (1:N)
Un producto puede aparecer en múltiples detalles de compra, pero cada detalle de compra hace referencia a un solo producto.

PRODUCTOS — CARRITO_DETALLE (1:N)
Un producto puede estar en varios carritos (a través de sus detalles), pero cada registro de carrito_detalle corresponde a un solo producto.

COMPRAS — DETALLE_COMPRA (1:N)
Una compra puede incluir varios productos (detalles), pero cada detalle de compra pertenece a una sola compra.

### Base de datos (sql)

```sql
-- TABLA USUARIOS
CREATE TABLE usuario(
	id_usuario int primary key auto_increment,
    nombre varchar(100) not null,
    correo varchar(150) not null unique,
    contrasena varchar(255) not null,
    rol enum('ADMIN', 'CLIENTE') default 'CLIENTE',
    fecha_registro timestamp default current_timestamp
);

-- tabla categoria
create table categoria(
	id_categoria int primary key auto_increment,
    nombre varchar(100) not null unique,
    descripcion text,
    fecha_creacion timestamp default current_timestamp
);

-- tabla productos
create table producto(
	id_producto int primary key auto_increment,
    id_categoria int not null,
    id_usuario int,
    nombre_producto varchar(150) not null,
    descripcion mediumtext,
    precio decimal(10,2) not null check (precio > 0),
    stock int not null check(stock >= 0),
    img_url text,
    estado ENUM('ACTIVO', 'INACTIVO', 'AGOTADO') DEFAULT 'ACTIVO',
    fecha_creacion timestamp default current_timestamp,
    fecha_actualizacion timestamp default current_timestamp on update current_timestamp,
    foreign key (id_categoria) references categoria(id_categoria) on delete restrict on update cascade,
    foreign key (id_usuario) references usuario(id_usuario) on delete set null on update cascade
);

-- tabla carritos
create table carrito(
	id_carrito int primary key auto_increment,
    id_usuario int not null unique,
    foreign key (id_usuario) references usuario(id_usuario) on delete cascade on update cascade
);

-- tabla carrito_detalle

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

-- tabla compras
create table compra(
    id_compra INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT null,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('PENDIENTE', 'PAGADO', 'CANCELADO') NOT NULL,
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    foreign key (id_usuario) references usuario(id_usuario) on delete set null on update cascade
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


```

---

## Como correr el proyecto

### Requisitos previos
- Tener instalado IntelliJ IDEA
- Tener instalado XAMPP (para MySQL)
- Tener instalado Visual Studio Code
- Tener instalado MySQL Workbench
- Tener instalado JDK 21 o superior (Java 21 Eclipse Temurin)
 
### Backend
1. Abrir la carpeta `backend/` en IntelliJ IDEA
2. Configurar `application.properties` con los datos de MySQL
3. Iniciar XAMPP y activar MySQL
4. Ejecutar `GameCoreApplication.java`
5. El backend corre en: `http://localhost:8080`

### Frontend
1. Abrir la carpeta `GameCore/` en VsCode
2. Abrir `index.html` con Live Server
3. El frontend se comunica con el backend via fetch()
 
> El frontend y el backend corren por separado.
> El backend debe estar iniciado antes de abrir el frontend.

### Configuracion de base de datos
```
spring.application.name=GameCore

#Conexion MYSQL
spring.datasource.url=jdbc:mysql://localhost:3306/gamecore_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:1234}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

#JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

#Clave
jwt.secret=${JWT_SECRET:clave-secreta-gamecore-2026-segura-jwt-XkZ9mP2qL7vN4wR8}
jwt.expiration=${JWT_EXPIRATION:36000000}

```
