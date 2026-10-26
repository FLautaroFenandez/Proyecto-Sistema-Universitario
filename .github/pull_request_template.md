## Qué cambia

<!-- Una o dos oraciones. Un PR por historia o por documento: si es más grande, conviene dividirlo. -->

## Historia o requerimiento

Closes #

<!-- Con "Closes #N" el issue se cierra al integrar y el tablero mueve la tarjeta a Terminado. -->

## Cómo se probó

- [ ] `npm run lint` sin avisos (el hook de pre-commit ya lo corre)
- [ ] `npm test` en verde
- [ ] Casos de prueba de la historia ejecutados: <!-- por ejemplo, CP-40 a CP-45 -->
- [ ] `npm run test:e2e` si el cambio toca pantallas

## Definition of Done

- [ ] Se cumplen los criterios de aceptación
- [ ] Permisos por rol verificados en la base (RLS) y en la pantalla
- [ ] Script `.sql` versionado si cambia el esquema
- [ ] Documentación actualizada en `docs/`

## Para quien revisa

<!-- Archivos clave, decisiones que conviene mirar y cómo verlo funcionando:
     la vista previa de Netlify aparece entre los checks del PR. -->
