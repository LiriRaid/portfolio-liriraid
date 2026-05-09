# Áreas reservadas

Carpetas de `src/app/core/` reservadas para crecimiento futuro.

## `src/app/core/api/`

Reservada para clientes HTTP, endpoints, adapters y repositories.

Actualmente las llamadas a APIs externas (GitHub API, EmailJS) se hacen directamente desde las features. Si el portfolio escala hacia un backend propio o múltiples integraciones, los clientes y adapters deben vivir aquí.

**No usar** para utilidades genéricas. Solo clientes de datos.

## `src/app/core/interceptors/`

Reservada para interceptores HTTP: autenticación, trazabilidad, manejo de errores, logging.

Actualmente no hay interceptores porque el portfolio no maneja sesión ni autenticación. Si se agrega un backend, los interceptores van aquí.

## Regla

Estas carpetas no deben llenarse con utilidades que no sean interceptores o clientes de API. Si algo no encaja en ninguna de las dos definiciones, probablemente pertenece a `shared/utils/` o directamente dentro de la feature que lo usa.
