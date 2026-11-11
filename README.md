# Sistema Brío

`rules-source/` contiene el HTML canónico de las reglas y sus estilos. GitHub
Actions genera desde esa fuente las páginas y los PDF descargables antes de
publicar en https://sistema.briorol.com/.

- Brío 2.0, en revisión: `/reglas/2.0/` y `/descargas/brio-2.0.pdf`.
- Edición anterior, compatible con Online: `/reglas/1.0/`.
- `rules-source/manifest.json` identifica ambas ediciones. No se cambia una
  mecánica de Online por actualizar un texto de reglas.

La fuente de las aplicaciones se mantiene por separado. Las publicaciones de la
web deben conservar `rules-source/` y ejecutar su generación; no deben borrarla
ni mantener otra copia editorial del reglamento.

Copyright (c) 2026 Javier U. Todos los derechos reservados. Los componentes de
terceros conservan sus respectivas licencias.
