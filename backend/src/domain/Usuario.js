export class Usuario {
    constructor({ id = null, nombre, apellido, favoritos = [] }) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.favoritos = favoritos;
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
