import { Usuario } from './Usuario.js';
import { Evento } from './Evento.js';

export class Resenia {
    constructor({ id = null, comprador, evento, detalle, puntuacion }) {
        if (!(comprador instanceof Usuario)) {
            throw new Error('El atributo "comprador" debe ser una instancia de Usuario');
        }
        if (!(evento instanceof Evento)) {
            throw new Error('El atributo "evento" debe ser una instancia de Evento');
        }
        this.id = id;
        this.comprador = comprador;
        this.evento = evento;
        this.detalle = detalle;
        this.puntuacion = Number(puntuacion);
    }
}
