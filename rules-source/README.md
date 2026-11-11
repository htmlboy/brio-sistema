# Reglas canónicas de Brío

Edita el HTML de `editions/<edición>/rules.html`. Es la única fuente editorial;
el PDF es generado y no se edita por separado. Los estilos comunes viven en
`assets/rules.css`, con una sección específica de impresión.

`manifest.json` distingue la edición que usa Online (1.0) de Brío 2.0 en revisión.
Cambiar el texto no actualiza automáticamente las mecánicas de las aplicaciones.

Para generar la web y los PDF: `npm ci`, `npx playwright install chromium` y
`npm run build`. El resultado completo queda en `../_site/`; no se versiona.
GitHub Actions ejecuta esta misma generación antes de publicar Pages.

Los HTML públicos son `/reglas/1.0/` y `/reglas/2.0/`; añade `?embed=1` para el
visor de una aplicación. Los PDF se generan en `/descargas/brio-<edición>.pdf`.
La ruta anterior `/reglas/` y el PDF anterior conservan la edición compatible.

Copyright (c) 2026 Javier U. Todos los derechos reservados. Las fuentes y demás
componentes de terceros conservan sus respectivas licencias.
