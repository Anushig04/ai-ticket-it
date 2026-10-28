export class CategoriaRepository {
    constructor() {
        this.categorias = [];
        this.nextId = 1;
    }

    guardar(categoria) {
        if (!categoria.id) {
            categoria.id = String(this.nextId++);
        }
        const index = this.categorias.findIndex((c) => c.id === categoria.id);
        if (index !== -1) {
            this.categorias[index] = categoria;
        } else {
            this.categorias.push(categoria);
        }
        return categoria;
    }

    buscarPorId(id) {
        return this.categorias.find((c) => c.id === String(id)) || null;
    }

    buscarPorNombre(nombre) {
        return (
            this.categorias.find(
                (c) => c.nombre.toLowerCase() === nombre.toLowerCase()
            ) || null
        );
    }

    listar() {
        return [...this.categorias];
    }

    eliminar(id) {
        const index = this.categorias.findIndex((c) => c.id === String(id));
        if (index === -1) {
            return false;
        }
        this.categorias.splice(index, 1);
        return true;
    }

    limpiar() {
        this.categorias = [];
        this.nextId = 1;
    }
}
