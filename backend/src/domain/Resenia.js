import { Usuario } from './Usuario.js';
import { Evento } from './Evento.js';
import { DomainError } from '../errors/DomainError.js';

export class Resenia {
    constructor({ id = null, comprador, evento, detalle, puntuacion }) {
        if (!(comprador instanceof Usuario)) {
            throw new DomainError('El atributo "comprador" debe ser una instancia de Usuario', 400);
        }
        if (!(evento instanceof Evento)) {
            throw new DomainError('El atributo "evento" debe ser una instancia de Evento', 400);
        }
        const puntNum = Number(puntuacion);
        if (Number.isNaN(puntNum) || puntNum < 1 || puntNum > 5) {
            throw new DomainError('La puntuación debe ser un número entre 1 y 5', 400);
        }
        if (!detalle || typeof detalle !== 'string' || !detalle.trim()) {
            throw new DomainError('El comentario de la reseña es obligatorio', 400);
        }
        this.id = id;
        this.comprador = comprador;
        this.evento = evento;
        this.detalle = detalle.trim();
        this.puntuacion = puntNum;
    }
}
