export class EventoRepository {
    constructor() {
        this.eventos = [];
        this.nextId = 1;
        this.nextTipoEntradaId = 1;
    }

    guardar(evento) {
        if (!evento.id) {
            evento.id = String(this.nextId++);
        }
        // Aseguramos que cada TipoEntrada dentro del evento también tenga id
        if (Array.isArray(evento.tiposEntrada)) {
            evento.tiposEntrada.forEach((tipo) => {
                if (!tipo.id) {
                    tipo.id = String(this.nextTipoEntradaId++);
                }
            });
        }

        const index = this.eventos.findIndex((e) => e.id === evento.id);
        if (index !== -1) {
            this.eventos[index] = evento;
        } else {
            this.eventos.push(evento);
        }
        return evento;
    }

    buscarPorId(id) {
        return this.eventos.find((e) => e.id === String(id)) || null;
    }

    listar() {
        return [...this.eventos];
    }

    buscarPorCategoria(categoriaId) {
        return this.eventos.filter((e) => e.categoria?.id === String(categoriaId));
    }

    buscarPorOrganizador(organizadorId) {
        return this.eventos.filter((e) => e.organizador?.id === String(organizadorId));
    }

    buscarPorTexto(texto) {
        const normalizar = (str = '') =>
            str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const termino = normalizar(texto);

        return this.eventos.filter(
            (e) =>
                normalizar(e.nombre).includes(termino) ||
                normalizar(e.descripcion).includes(termino)
        );
    }

    eliminar(id) {
        const index = this.eventos.findIndex((e) => e.id === String(id));
        if (index === -1) {
            return false;
        }
        this.eventos.splice(index, 1);
        return true;
    }

    limpiar() {
        this.eventos = [];
        this.nextId = 1;
        this.nextTipoEntradaId = 1;
    }
}
