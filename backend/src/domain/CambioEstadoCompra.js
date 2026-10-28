import { Usuario } from './Usuario.js';

export class CambioEstadoCompra {
    constructor({ id = null, compra, estado, quien, fechaHora = new Date() }) {
        if (!(quien instanceof Usuario)) {
            throw new Error('El atributo "quien" debe ser una instancia de Usuario');
        }
        this.id = id;
        this.compra = compra;
        this.estado = estado;
        this.quien = quien;
        this.fechaHora = fechaHora instanceof Date ? fechaHora : new Date(fechaHora);
    }
    
    toJSON() {
        return {
            id: this.id,
            compraId: this.compra?.id || null,
            estado: this.estado,
            quien: this.quien,
            fechaHora: this.fechaHora
        };
    }
}
