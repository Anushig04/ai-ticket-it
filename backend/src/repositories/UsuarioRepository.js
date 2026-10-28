export class UsuarioRepository {
    constructor() {
        this.usuarios = [];
        this.nextId = 1;
    }

    guardar(usuario) {
        if (!usuario.id) {
            usuario.id = String(this.nextId++);
        }
        const index = this.usuarios.findIndex((u) => u.id === usuario.id);
        if (index !== -1) {
            this.usuarios[index] = usuario;
        } else {
            this.usuarios.push(usuario);
        }
        return usuario;
    }

    buscarPorId(id) {
        return this.usuarios.find((u) => u.id === String(id)) || null;
    }

    listar() {
        return [...this.usuarios];
    }

    eliminar(id) {
        const index = this.usuarios.findIndex((u) => u.id === String(id));
        if (index === -1) {
            return false;
        }
        this.usuarios.splice(index, 1);
        return true;
    }

    limpiar() {
        this.usuarios = [];
        this.nextId = 1;
    }
}
