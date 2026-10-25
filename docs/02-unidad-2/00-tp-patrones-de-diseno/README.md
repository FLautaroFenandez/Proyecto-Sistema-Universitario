# Trabajo Práctico — Patrones de Diseño

**Patrón Command (de comportamiento)**

Metodología de Sistemas II · UTN FRRe · TUP 2026
Grupo 4 — Integrantes: Cerqueiro, Gonzalo — Fernández, Lautaro

| Dato | Valor |
|---|---|
| Fecha | 25/08/2026 |
| Patrón asignado | Command |
| Tipo | De comportamiento |

---

## 1. Problema que resuelve

A menudo hace falta enviar solicitudes a objetos sin conocer los detalles de la operación ni
quién la recibe. Por ejemplo, un botón de una interfaz tiene que ejecutar una acción, pero si
la lógica se programa directamente dentro del botón, el código queda rígido (muy acoplado).
Eso dificulta reutilizar el botón para otras acciones o implementar funciones como
deshacer/rehacer, registrar un historial o encolar tareas.

## 2. Solución

Command encapsula una solicitud como un objeto independiente. En lugar de que el emisor (el
botón) llame directamente al receptor (la lógica de negocio), llama a un objeto *comando*, que
contiene todo lo necesario para ejecutar la acción: la referencia al receptor y el método que
debe ejecutarse. Así se puede parametrizar a los clientes con distintas solicitudes, encolar
peticiones y separar por completo a quien invoca la acción de quien la ejecuta.

## 3. Participantes

| Participante | Responsabilidad |
|---|---|
| **Command** | Interfaz o clase abstracta que declara el método de ejecución, generalmente `execute()`. |
| **ConcreteCommand** | Implementa `Command` y conecta una acción con su receptor. |
| **Client** | Crea el comando concreto y establece cuál será su receptor. |
| **Invoker** | Inicia la petición: guarda una referencia al comando y llama a su `execute()`. |
| **Receiver** | Sabe cómo hacer el trabajo; contiene la lógica de negocio. |

## 4. Colaboración

1. El cliente crea un comando concreto y le asigna su receptor.
2. El cliente le pasa el comando al invocador.
3. En algún momento, el invocador ejecuta la acción llamando a `execute()`.
4. El comando concreto invoca las operaciones del receptor para completar la tarea.

## 5. Consecuencias

**Beneficios**

- **Desacoplamiento:** separa el objeto que invoca la operación del que sabe ejecutarla.
- **Principio abierto/cerrado:** se agregan comandos nuevos sin modificar los invocadores ni
  los receptores.
- **Historial y deshacer:** permite implementar *undo/redo* guardando el estado en el comando
  o llevando un historial de los comandos ejecutados.
- **Composición:** se pueden armar comandos compuestos (macros) a partir de comandos simples.

**Posibles impactos**

- **Complejidad estructural:** suma muchas clases pequeñas, una por cada comando concreto.

## 6. Ejemplo

Una casa inteligente con un control remoto universal:

- El **control remoto** es el invocador. Tiene botones programables, pero no sabe qué hace cada
  uno: solo sabe que al presionarlo debe ejecutar un comando.
- Las **luces** y el **aire acondicionado** son los receptores.
- `EncenderLuzCommand` y `ApagarLuzCommand` son comandos concretos que implementan `Command`.
- El cliente asigna `EncenderLuzCommand` al botón "A". Al presionarlo, el control llama a
  `execute()` y el comando le pide al foco inteligente que se encienda.

## 7. Bibliografía

- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of
  Reusable Object-Oriented Software*. Addison-Wesley Professional.
- Refactoring.Guru. (s.f.). *Command*. Recuperado el 25 de agosto de 2026, de
  https://refactoring.guru/es/design-patterns/command

---

> **Relación con el proyecto.** Command fue el patrón asignado para este trabajo práctico.
> Para el Sistema de Gestión el equipo eligió uno de cada tipo: Singleton (creacional), Facade
> (estructural) y State (de comportamiento). La justificación está en el
> [plan de trabajo](../../00-equipo/plan-de-trabajo.md#3-patrones-de-diseño-aplicados) y su
> verificación, en el [cierre del Sprint 3](../07-cierre-sprint-3/README.md#14-uso-de-los-patrones-de-diseño).
