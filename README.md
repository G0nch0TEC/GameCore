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