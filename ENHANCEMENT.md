# Sistema de Reseñas de Vehículos - Mejora Adicional CSE 340

## Descripción General

Se ha implementado un **Sistema Completo de Reseñas de Vehículos** que permite a los usuarios autenticados:

- Ver todas las reseñas de un vehículo específico
- Dejar nuevas reseñas con calificación (1-5 estrellas), título y descripción
- Editar sus propias reseñas
- Eliminar sus propias reseñas
- Ver la calificación promedio y cantidad total de reseñas por vehículo

## Archivos Creados/Modificados

### Base de Datos

- **[database/db-sql-code.sql](database/db-sql-code.sql)** - Agregada tabla `review` con:
  - `review_id` (PK, auto-increment)
  - `review_inv_id` (FK a inventory)
  - `review_account_id` (FK a account)
  - `review_rating` (1-5)
  - `review_title` (varchar)
  - `review_body` (text)
  - `review_created` (timestamp con default NOW())
  - `review_verified_purchase` (boolean)

### Modelos de Datos

- **[models/review-model.js](models/review-model.js)** - Nuevo archivo con funciones:
  - `getReviewsByInventoryId()` - Obtiene todas las reseñas de un vehículo
  - `getReviewById()` - Obtiene una reseña específica
  - `getAverageRating()` - Calcula rating promedio
  - `insertReview()` - Inserta nueva reseña (con prepared statements)
  - `updateReview()` - Actualiza una reseña existente
  - `deleteReview()` - Elimina una reseña
  - `hasAccountReviewed()` - Verifica si un usuario ya reseñó un vehículo

### Controlador

- **[controllers/reviewController.js](controllers/reviewController.js)** - Nuevo controlador con funciones:
  - `buildReviewView()` - Muestra todas las reseñas de un vehículo
  - `buildAddReviewForm()` - Muestra formulario para nueva reseña
  - `addReview()` - Procesa envío de nueva reseña
  - `buildEditReviewForm()` - Muestra formulario de edición
  - `updateReview()` - Procesa actualización de reseña
  - `deleteReview()` - Procesa eliminación de reseña

### Validación

- **[utilities/review-validation.js](utilities/review-validation.js)** - Nuevo archivo con:
  - Reglas de validación usando express-validator
  - Validación de rating (1-5)
  - Validación de título (3-100 caracteres)
  - Validación de body (10-5000 caracteres)
  - Manejo de errores de validación

### Rutas

- **[routes/inventoryRoute.js](routes/inventoryRoute.js)** - Agregadas rutas de reviews:
  - `GET /inv/reviews/:invId` - Ver reseñas
  - `GET /inv/add-review/:invId` - Formulario nueva reseña (requiere login)
  - `POST /inv/add-review/:invId` - Enviar nueva reseña
  - `GET /inv/edit-review/:reviewId` - Formulario editar (requiere login y autorización)
  - `POST /inv/edit-review/:reviewId` - Actualizar reseña
  - `POST /inv/delete-review/:reviewId` - Eliminar reseña

### Vistas (Templates EJS)

- **[views/inventory/reviews.ejs](views/inventory/reviews.ejs)** - Página principal de reseñas:
  - Muestra calificación promedio con estrella
  - Lista todas las reseñas ordenadas por fecha reciente
  - Botón para escribir reseña (solo si usuario está logueado)
  - Información del autor de cada reseña

- **[views/inventory/add-review.ejs](views/inventory/add-review.ejs)** - Formulario para nueva reseña:
  - Select dropdown para calificación (1-5 estrellas)
  - Campo de título
  - Área de texto para la reseña completa
  - Validación en cliente y servidor

- **[views/inventory/edit-review.ejs](views/inventory/edit-review.ejs)** - Formulario para editar reseña:
  - Pre-carga datos existentes
  - Mismos campos que formulario de nueva reseña
  - Autorización: solo el creador puede editar

### Utilidades

- **[utilities/index.js](utilities/index.js)** - Agregada función:
  - `buildReviewsTable()` - Genera HTML de tabla de reseñas

## Características de Seguridad y Mejores Prácticas

✅ **SQL Injection Prevention**: Todas las consultas usan prepared statements con parámetros
✅ **Validación de Datos**: Ambos lados (cliente y servidor) validación de entrada
✅ **Autorización**: Solo el creador puede editar/eliminar su propia reseña
✅ **Error Handling**: Try-catch en todas las funciones async
✅ **Autenticación**: Requiere login para escribir/editar reseñas
✅ **Body Escaping**: Todos los inputs escapados con express-validator
✅ **Constraints de Base de Datos**: Check constraint en rating (1-5)
✅ **Middleware**: Utiliza middleware express para manejo de errores

## Cómo Usar la Mejora

### 1. Ver Reseñas de un Vehículo

1. Navega a cualquier página de detalle de vehículo
2. Haz clic en el enlace "Ver Reseñas" (o navega a `/inv/reviews/:invId`)
3. Verás todas las reseñas del vehículo con calificación promedio

### 2. Escribir una Nueva Reseña

1. Desde la página de reseñas, haz clic en "Escribir una Reseña"
2. Debes estar logueado (si no, serás redirigido al login)
3. Selecciona una calificación (1-5 estrellas)
4. Escribe un título y descripción de la reseña
5. Haz clic en "Enviar Reseña"

### 3. Editar tu Reseña

1. El creador de la reseña verá un botón "Editar"
2. Haz clic para abrir el formulario de edición
3. Modifica la calificación, título o descripción
4. Haz clic en "Actualizar Reseña"

### 4. Eliminar tu Reseña

1. El creador verá un botón "Eliminar"
2. Haz clic para eliminar la reseña permanentemente

## Rutas de Acceso en la Aplicación

**Ver Reseñas de un Vehículo:**

```
GET /inv/reviews/1  (donde 1 es el inv_id)
```

**Agregar Reseña:**

```
GET  /inv/add-review/1     (mostrar formulario)
POST /inv/add-review/1     (enviar datos)
```

**Editar Reseña:**

```
GET  /inv/edit-review/5    (donde 5 es el review_id - mostrar formulario)
POST /inv/edit-review/5    (actualizar datos)
```

**Eliminar Reseña:**

```
POST /inv/delete-review/5  (eliminar)
```

## Validaciones Implementadas

| Campo        | Reglas                        | Error                                                |
| ------------ | ----------------------------- | ---------------------------------------------------- |
| Rating       | 1-5, requerido                | "Rating must be between 1 and 5."                    |
| Review Title | 3-100 caracteres, requerido   | "Review title must be between 3 and 100 characters." |
| Review Body  | 10-5000 caracteres, requerido | "Review must be between 10 and 5000 characters."     |

## Estructura de Datos

### Tabla Review

```sql
CREATE TABLE review (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    review_inv_id INT NOT NULL,
    review_account_id INT NOT NULL,
    review_rating INT CHECK (1-5),
    review_title VARCHAR NOT NULL,
    review_body TEXT NOT NULL,
    review_created TIMESTAMP DEFAULT NOW(),
    review_verified_purchase BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_inventory FOREIGN KEY (review_inv_id)
    CONSTRAINT fk_account FOREIGN KEY (review_account_id)
);
```

## Consideraciones Técnicas

- **Límite de una reseña por vehículo por usuario**: Se valida antes de permitir la creación
- **Borrado en cascada**: Si se elimina un vehículo, se eliminan sus reseñas automáticamente
- **Borrado en cascada**: Si se elimina una cuenta, se eliminan sus reseñas automáticamente
- **Timestamps automáticos**: La fecha de creación se registra automáticamente en la BD

## Pasos para Probar en Producción

1. Ejecutar el script SQL de creación de tabla en la base de datos de producción
2. Desplegar el código actualizado a Render
3. Navegar a cualquier vehículo y hacer clic en "Ver Reseñas"
4. Crear una cuenta de prueba, iniciar sesión y escribir una reseña
5. Ver que la reseña aparece en la lista con información del autor

---

**Fecha de Implementación**: Febrero 2026
**Mejora Propuesta**: Sistema de Reseñas de Vehículos Completo
**Estado**: ✅ Implementado y Funcional
