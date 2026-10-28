export class ReseniaRepository {
    constructor() {
        this.resenias = [];
        this.nextId = 1;
    }

    guardar(resenia) {
        if (!resenia.id) {
            resenia.id = String(this.nextId++);
        }
        const index = this.resenias.findIndex((r) => r.id === resenia.id);
        if (index !== -1) {
            this.resenias[index] = resenia;
        } else {
            this.resenias.push(resenia);
        }
        return resenia;
    }

    buscarPorId(id) {
        return this.resenias.find((r) => r.id === String(id)) || null;
    }

    listar() {
        return [...this.resenias];
    }

    buscarPorEvento(eventoId) {
        return this.resenias.filter((r) => r.evento?.id === String(eventoId));
    }

    buscarPorOrganizador(organizadorId) {
        return this.resenias.filter(
            (r) => r.evento?.organizador?.id === String(organizadorId)
        );
    }

    buscarPorCompradorYEvento(compradorId, eventoId) {
        return (
            this.resenias.find(
                (r) =>
                    r.comprador?.id === String(compradorId) &&
                    r.evento?.id === String(eventoId)
            ) || null
        );
    }

    eliminar(id) {
        const index = this.resenias.findIndex((r) => r.id === String(id));
        if (index === -1) {
            return false;
        }
        this.resenias.splice(index, 1);
        return true;
    }

    limpiar() {
        this.resenias = [];
        this.nextId = 1;
    }
}
