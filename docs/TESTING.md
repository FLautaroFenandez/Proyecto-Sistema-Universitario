# 🧪 Plan de Testing
## Centro Educativo "Educar para Transformar"

**Período de testing**: 29 de mayo – 12 de junio de 2026  
**Entrega**: 19 de junio de 2026  

---

## 1. Tipos de Testing aplicados

| Tipo | Descripción | Herramienta |
|---|---|---|
| Testing manual funcional | Verificar cada requerimiento | Checklist + capturas |
| Testing de regresión | Que nada se rompa al agregar features | Repetir casos anteriores |
| Testing de roles | Verificar que cada rol solo accede a lo suyo | Usuarios de prueba |
| Testing responsive | Verificar en distintos dispositivos | DevTools + dispositivo real |
| Testing de formularios | Casos válidos e inválidos | Manual |

---

## 2. Casos de Prueba

---

### MÓDULO 1 — Navegación y páginas públicas

| ID | Caso de prueba | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| TC-001 | Cargar página principal | 1. Abrir la URL del sitio | La homepage carga en <3s con hero, noticias y opiniones | ☐ |
| TC-002 | Navegar entre secciones | 1. Click en cada link del navbar | Navega a la sección correcta sin errores | ☐ |
| TC-003 | Navbar responsive | 1. Reducir ventana a <768px | Aparece menú hamburguesa, links colapsan | ☐ |
| TC-004 | Abrir menú hamburguesa | 1. Click en ☰ en mobile | El menú se despliega con animación suave | ☐ |
| TC-005 | Footer con links | 1. Click en cada link del footer | Los links navegan correctamente | ☐ |
| TC-006 | Página 404 | 1. Navegar a /ruta-inexistente | Muestra página de error amigable con link al inicio | ☐ |

---

### MÓDULO 2 — Galería de imágenes

| ID | Caso de prueba | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| TC-010 | Ver galería sin login | 1. Ir a /galeria | Muestra imágenes organizadas por categoría | ☐ |
| TC-011 | Filtrar por categoría | 1. Click en "Deportes" | Solo se muestran imágenes de deportes | ☐ |
| TC-012 | Lazy loading de imágenes | 1. Hacer scroll en galería | Las imágenes cargan a medida que aparecen en pantalla | ☐ |
| TC-013 | Galería vacía | 1. Filtrar por categoría sin fotos | Muestra mensaje "No hay imágenes en esta categoría" | ☐ |

---

### MÓDULO 3 — Sistema de Opiniones

| ID | Caso de prueba | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| TC-020 | Dejar opinión sin login | 1. Ir a la sección de opiniones<br>2. Completar nombre y texto<br>3. Enviar | Muestra confirmación "Tu opinión fue enviada y está pendiente de revisión" | ☐ |
| TC-021 | Texto > 300 caracteres | 1. Intentar escribir más de 300 chars | El campo no acepta más caracteres O muestra error | ☐ |
| TC-022 | Campos vacíos en opinión | 1. Enviar formulario sin completar | Muestra error de validación en los campos vacíos | ☐ |
| TC-023 | Opinión NO aparece hasta moderar | 1. Dejar opinión<br>2. Ver sección pública | La opinión NO es visible en la sección pública | ☐ |
| TC-024 | Admin aprueba opinión | 1. Login como admin<br>2. Ir a moderación<br>3. Aprobar opinión | La opinión aparece en la sección pública | ☐ |
| TC-025 | Admin rechaza opinión | 1. Login como admin<br>2. Rechazar opinión | La opinión NO aparece públicamente y queda como "rechazada" | ☐ |

---

### MÓDULO 4 — Formulario de Inscripción

| ID | Caso de prueba | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| TC-030 | Inscripción válida completa | 1. Completar todos los campos correctamente<br>2. Enviar | Muestra confirmación y registra en BD | ☐ |
| TC-031 | Campos obligatorios vacíos | 1. Enviar sin completar nada | Muestra error en todos los campos obligatorios | ☐ |
| TC-032 | Email inválido | 1. Ingresar "no-es-un-email"<br>2. Enviar | Muestra error "Ingresá un email válido" | ☐ |
| TC-033 | DNI con letras | 1. Ingresar "ABC123" en DNI<br>2. Enviar | Muestra error "El DNI solo puede contener números" | ☐ |
| TC-034 | Admin ve inscripción | 1. Completar inscripción<br>2. Login como admin<br>3. Ir a gestión de inscripciones | La nueva inscripción aparece con estado "pendiente" | ☐ |
| TC-035 | Admin cambia estado | 1. Cambiar estado a "Aceptada" | El estado se actualiza en la BD y en la vista | ☐ |

---

### MÓDULO 5 — Autenticación

| ID | Caso de prueba | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| TC-040 | Registro de padre | 1. Ir a /registro<br>2. Completar con rol "Padre"<br>3. Enviar | Cuenta creada, redirige a dashboard | ☐ |
| TC-041 | Registro de estudiante | 1. Repetir para rol "Estudiante" | Cuenta creada con rol estudiante | ☐ |
| TC-042 | Email ya registrado | 1. Intentar registrar con email existente | Muestra error "Este email ya tiene una cuenta" | ☐ |
| TC-043 | Contraseña < 8 caracteres | 1. Ingresar contraseña corta | Muestra error de validación antes de enviar | ☐ |
| TC-044 | Login correcto | 1. Ir a /login<br>2. Email y contraseña correctos | Redirige al dashboard del usuario | ☐ |
| TC-045 | Login con datos incorrectos | 1. Email o contraseña incorrectos | Muestra error "Email o contraseña incorrectos" | ☐ |
| TC-046 | Cerrar sesión | 1. Click en "Cerrar sesión" | Redirige a /login, sesión eliminada | ☐ |
| TC-047 | Acceso sin login a ruta privada | 1. Ir a /dashboard sin sesión | Redirige a /login | ☐ |

---

### MÓDULO 6 — Control de Acceso por Roles

| ID | Caso de prueba | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| TC-050 | Padre accede a /admin | 1. Login como padre<br>2. Ir a /admin | Redirige a /dashboard o muestra "Sin permiso" | ☐ |
| TC-051 | Estudiante ve noticias internas | 1. Login como estudiante<br>2. Ir a /noticias | Ve noticias públicas E internas estudiantiles | ☐ |
| TC-052 | Sin login no ve noticias internas | 1. Sin sesión<br>2. Ir a /noticias | Solo ve noticias marcadas como públicas | ☐ |
| TC-053 | Admin accede a panel | 1. Login como admin<br>2. Ir a /admin | Ve el panel completo con todas las opciones | ☐ |
| TC-054 | Autoridad no gestiona usuarios | 1. Login como autoridad<br>2. Ir a /admin/usuarios | No ve la opción o recibe "Sin permiso" | ☐ |

---

### MÓDULO 7 — Noticias

| ID | Caso de prueba | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| TC-060 | Listar noticias públicas | 1. Ir a /noticias sin login | Ve solo noticias marcadas como públicas | ☐ |
| TC-061 | Ver detalle de noticia | 1. Click en una noticia | Ve el detalle completo con imagen y contenido | ☐ |
| TC-062 | Admin crea noticia | 1. Ir a panel<br>2. Crear noticia con título, contenido, imagen<br>3. Publicar | La noticia aparece en el listado público | ☐ |
| TC-063 | Admin crea noticia interna | 1. Crear noticia con "pública" = NO | Solo visible para usuarios logueados | ☐ |
| TC-064 | Admin edita noticia | 1. Editar título de una noticia<br>2. Guardar | El cambio se refleja en el listado | ☐ |
| TC-065 | Admin elimina noticia | 1. Eliminar una noticia | Desaparece del listado | ☐ |

---

### MÓDULO 8 — Rendimiento y UX

| ID | Caso de prueba | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| TC-070 | Tiempo de carga homepage | 1. Abrir DevTools → Network<br>2. Recargar página | Carga en menos de 3 segundos | ☐ |
| TC-071 | Vista en mobile (375px) | 1. Reducir a 375px | No hay overflow horizontal, todo se ve correctamente | ☐ |
| TC-072 | Vista en tablet (768px) | 1. Reducir a 768px | Layout de 2 columnas donde corresponde | ☐ |
| TC-073 | Animaciones suaves | 1. Hacer scroll en homepage | Las secciones aparecen con fade-in suave | ☐ |
| TC-074 | Formulario con loading | 1. Enviar cualquier formulario | Muestra spinner/loading mientras procesa | ☐ |
| TC-075 | Error de red | 1. Desconectar internet<br>2. Intentar cargar datos | Muestra mensaje de error amigable, no se rompe la app | ☐ |

---

## 3. Usuarios de prueba a crear antes del testing

| Email | Contraseña | Rol | Propósito |
|---|---|---|---|
| admin@test.com | Test1234! | admin | Probar panel completo |
| autoridad@test.com | Test1234! | autoridad | Probar permisos de autoridad |
| docente@test.com | Test1234! | docente | Probar acceso de docente |
| padre@test.com | Test1234! | padre | Probar portal de padres |
| alumno@test.com | Test1234! | estudiante | Probar portal estudiantil |

---

## 4. Reporte de Bugs

Para cada bug encontrado documentar:

| Campo | Descripción |
|---|---|
| ID | BUG-XXX |
| Descripción | Qué pasó |
| Pasos para reproducir | Cómo llegar al bug |
| Resultado obtenido | Qué pasó realmente |
| Resultado esperado | Qué debería pasar |
| Severidad | Crítico / Alto / Medio / Bajo |
| Estado | Abierto / En corrección / Cerrado |
| Responsable | Quién lo corrige |
