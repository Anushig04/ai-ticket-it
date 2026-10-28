export class CompraRepository {
    constructor() {
        this.compras = [];
        this.nextId = 1;
    }

    guardar(compra) {
        if (!compra.id) {
            compra.id = String(this.nextId++);
        }
        const index = this.compras.findIndex((c) => c.id === compra.id);
        if (index !== -1) {
            this.compras[index] = compra;
        } else {
            this.compras.push(compra);
        }
        return compra;
    }

    buscarPorId(id) {
        return this.compras.find((c) => c.id === String(id)) || null;
    }

    listar() {
        return [...this.compras];
    }

    buscarPorComprador(compradorId) {
        return this.compras.filter((c) => c.comprador?.id === String(compradorId));
    }

    buscarPorEvento(eventoId) {
        return this.compras.filter((c) => c.evento?.id === String(eventoId));
    }

    eliminar(id) {
        const index = this.compras.findIndex((c) => c.id === String(id));
        if (index === -1) {
            return false;
        }
        this.compras.splice(index, 1);
        return true;
    }

    limpiar() {
        this.compras = [];
        this.nextId = 1;
    }
}
