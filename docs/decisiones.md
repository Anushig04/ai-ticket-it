# Decisiones de Diseño - AI Ticket It

En este documento se registran y justifican las decisiones técnicas y de diseño adoptadas sobre el modelo de dominio tentativo provisto por la cátedra.

---

## Fase 1 — Modelo de Dominio (Back-End)

### 1. Constructores con Desestructuración de Objetos (`constructor({ ... })`)
* **Decisión:** Todas las clases del dominio (`Categoria`, `TipoEntrada`, `Usuario`, `Evento`, `Mensaje`, `CambioEstadoCompra`, `Compra`, `Resenia`) reciben un objeto literal desestructurado en su constructor.
* **Justificación:** Evita errores por el orden posicional de parámetros en clases con muchos atributos (como `Evento` o `Compra`), mejora la legibilidad al instanciar objetos y facilita la hidratación directa desde payloads JSON o repositorios en memoria.

### 2. Incorporación del atributo `id` en las entidades del dominio
* **Decisión:** Se agregó el atributo opcional `id = null` en todas las clases de entidad (`Categoria`, `TipoEntrada`, `Usuario`, `Evento`, `Mensaje`, `CambioEstadoCompra`, `Compra`, `Resenia`).
* **Justificación:** Si bien en el diagrama conceptual de clases no se incluyen claves subrogadas, para poder persistir las entidades en repositorios en memoria y referenciarlas luego desde una API REST (Express) y desde el cliente Mobile (React Native), cada recurso necesita un identificador único.

### 3. Colección `historialEstados` dentro de `Compra` y enriquecimiento de `actualizarEstado`
* **Decisión:** Se agregó el atributo `historialEstados = []` en la clase `Compra`, y el método `actualizarEstado(nuevoEstado, quien, fechaHora)` además de modificar `this.estado`, instancia automáticamente un objeto `CambioEstadoCompra` y lo registra en `this.historialEstados`.
* **Justificación:** En el diagrama tentativo, `CambioEstadoCompra` tiene una referencia navegable hacia `Compra`, pero al trabajar en memoria resulta mucho más cohesivo que la propia `Compra` mantenga su colección de cambios de estado y garantice invariablemente que cada llamada a `actualizarEstado(...)` deje su registro de auditoría sin depender de que un servicio externo recuerde crearlo manualmente.

### 4. Cálculo automático de `total` en `Compra`
* **Decisión:** En el constructor de `Compra`, si no se provee explícitamente el atributo `total`, se calcula automáticamente como `tipoEntrada.precio * cantidad`.
* **Justificación:** Evita inconsistencias entre el precio del tipo de entrada seleccionado, la cantidad adquirida y el monto total de la compra.

### 5. Métodos de cohesión de negocio adicionales en el Dominio
Sin alterar ninguna de las firmas pedidas por el diagrama (`hayCupoPara(cantidad)`, `tuPrecioEstaEntre(min, max)`, `actualizarEstado(nuevoEstado)`), se sumaron métodos auxiliares cohesivos en las propias entidades siguiendo el principio **Information Expert (GRASP)**:
* **`TipoEntrada.descontarCupo(cantidad)` y `restituirCupo(cantidad)`:** Encapsulan la validación con `hayCupoPara(cantidad)` y la mutación del cupo al realizar o cancelar una compra.
* **`Usuario.agregarFavorito(evento)` y `quitarFavorito(evento)`:** Evitan duplicados en la lista `favoritos` del usuario.
* **`Evento.precioMinimo()`:** Permite obtener el menor precio de sus `tiposEntrada` para resolver el ordenamiento por precio (**CU-02**).
* **`Compra.diasFaltantesParaEvento(fechaActual)`:** Calcula cuántos días faltan para el evento cuando la compra está en estado `CONFIRMADA` (**CU-05**).
* **`Compra.puedeCancelarse(fechaActual)`:** Evalúa la regla de negocio del organizador (**CU-08**): que la compra no esté en estado `UTILIZADA` (ni cancelada/reembolsada) y que la fecha del evento aún no haya pasado.
* **`Compra.agregarMensaje({ usuario, mensaje, enviado })`:** Instancia un `Mensaje` y lo agrega a la colección `mensajes` de la compra (**CU-06** y **CU-12**).

### 6. Compatibilidad de `nombre` y `nombreCategoria` en `Categoria`
* **Decisión:** En `Categoria` se soporta tanto `{ nombre, descripcion }` (según el diagrama) como `{ nombreCategoria, descripcion }` (implementación inicial), exponiendo ambas propiedades sincronizadas.
* **Justificación:** Mantener compatibilidad total con el código ya escrito y con el nombre del atributo en el diagrama de clases.
