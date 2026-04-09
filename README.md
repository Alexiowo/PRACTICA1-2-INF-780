
## DESCRIPCIÓN DEL PROYECTO 

API que permite crear, leer, actualizar y eliminar libros (CRUD completo), con persistencia en base de datos PostgreSQL.  
Incluye validaciones, documentación con Swagger, pruebas unitarias y pruebas de integración (e2e).

## INSTRUCCIONES DE INSTALACIÓN 

# Instalar el CLI globalmente 
npm install -g @nestjs/cli 
  
# Crear el proyecto 
nest new BooksApiDb
  
# Entrar al directorio 
cd BooksApiDb

# instalar las dependencias de ser necesario
npm install uuid class-validator class-transformer 
npm install --save-dev @types/uuid


## COMO EJECUTAR LA APLICACIÓN 
para modo desarrollo debe ser:**"npm run start:dev"**
para modo producción debe ser:**"npm run start"**
 LA APLICACION ESTA DISPONIBLE EN:**"http://localhost:3000"**

## EN THUNDER: 
## POST 
http://localhost:3000/books (POST)
{
  "title": "El Principito",
  "author": "Antoine de Saint-Exupéry"
}
## GET
http://localhost:3000/books (GET)
http://localhost:3000/books/<id> (GET)

## PATCH 
http://localhost:3000/books/<id> (PATCH)
(reemplazar el  <id> por el id que devolvió el POST).

## DELETE 
http://localhost:3000/books/<id> (DELETE)
MUESTRA que la respuesta es vacía (204 No Content).


## COMO EJECUTAR LAS PRUEBAS 
Pruebas unitarias + cobertura:**"npm run test:cov"**
Pruebas de integración (e2e):**"npm run test:e2e"**

## URL	de	documentación Swagger
LA APLICACION ESTA DISPONIBLE EN:**"http://localhost:3000/api/docs"**

## Cobertura de pruebas
La cobertura de pruebas se obtiene con:**"npm run test:cov"**

