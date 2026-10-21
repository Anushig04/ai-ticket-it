import { Usuario } from './Usuario.js';

export class CambioEstadoCompra {
    constructor({ id = null, compra, estado, usuario, fechaHora = new Date() }) {
        if (!(usuario instanceof Usuario)) {
            throw new Error('El atributo "quien" debe ser una instancia de Usuario');
        }
        this.id = id;
        this.compra = compra;
        this.estado = estado;
        this.quien = usuario;
        this.fechaHora = fechaHora instanceof Date ? fechaHora : new Date(fechaHora);
    }
}
