# Notes API DB

REST API para gestión de notas, construida con **NestJS**, **TypeORM** y **PostgreSQL**.

## Descripción

API que permite crear, leer, actualizar y eliminar notas (CRUD completo), con persistencia en base de datos PostgreSQL.

## Tecnologías

- [NestJS](https://nestjs.com/) v10
- [TypeORM](https://typeorm.io/) v0.3
- [PostgreSQL](https://www.postgresql.org/)
- [Swagger](https://swagger.io/) (documentación de la API)
- [class-validator](https://github.com/typestack/class-validator) (validación de DTOs)

## Requisitos previos

- Node.js >= 18
- PostgreSQL en ejecución
- npm

## Configuración

1. Copia el archivo de variables de entorno:

```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales de base de datos:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=notes_api_db
PORT=3000
```

3. Crea la base de datos en PostgreSQL:

```sql
CREATE DATABASE notes_api_db;
```

## Instalación

```bash
npm install
```

## Ejecución

```bash
# Desarrollo (con hot-reload)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La API estará disponible en `http://localhost:3000`.

La documentación Swagger estará en `http://localhost:3000/api`.

## Endpoints

| Método | Ruta         | Descripción              |
|--------|--------------|--------------------------|
| GET    | /notes       | Listar todas las notas   |
| GET    | /notes/:id   | Obtener una nota por ID  |
| POST   | /notes       | Crear una nueva nota     |
| PATCH  | /notes/:id   | Actualizar una nota      |
| DELETE | /notes/:id   | Eliminar una nota        |

## Pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas unitarias con cobertura
npm run test:cov

# Pruebas e2e
npm run test:e2e
```

### Configuración para pruebas e2e

Las pruebas e2e requieren una base de datos dedicada y un archivo `.env.test` en la raíz del proyecto. Crea el archivo con el siguiente contenido:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=notes_api_db_test
NODE_ENV=test
PORT=3001
```

Asegúrate de crear también la base de datos de prueba en PostgreSQL:

```sql
CREATE DATABASE notes_api_db_test;
```

## Estructura del proyecto

```
src/
├── config/          # Configuración de variables de entorno
├── common/          # Filtros, interceptores y utilidades compartidas
├── notes/
│   ├── dto/         # Data Transfer Objects (create, update)
│   ├── entities/    # Entidad Note (TypeORM)
│   ├── notes.controller.ts
│   ├── notes.service.ts
│   ├── notes.repository.ts
│   └── notes.module.ts
├── app.module.ts
└── main.ts
```
