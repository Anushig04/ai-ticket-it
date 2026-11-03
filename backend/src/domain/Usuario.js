import bcrypt from 'bcryptjs';

export class Usuario {
    constructor({
        id = null,
        nombre,
        apellido,
        email = null,
        passwordHash = null,
        favoritos = []
    }) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.passwordHash = passwordHash;
        this.favoritos = favoritos;
    }

    validarPassword(passwordPlana) {
        if (!this.passwordHash || !passwordPlana) return false;
        return bcrypt.compareSync(String(passwordPlana), this.passwordHash);
    }

    toJSON() {
        const { passwordHash, ...resto } = this;
        return resto;
    }

    agregarFavorito(evento) {
        const yaExiste = this.favoritos.some((fav) => fav === evento || (fav.id && fav.id === evento.id));
        if (!yaExiste) {
            this.favoritos.push(evento);
        }
    }

    quitarFavorito(evento) {
        this.favoritos = this.favoritos.filter((fav) => fav !== evento && (!fav.id || fav.id !== evento.id));
    }
}
