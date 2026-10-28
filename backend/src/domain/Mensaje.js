import { Usuario } from './Usuario.js';
import { DomainError } from '../errors/DomainError.js';

export class Mensaje {
    constructor({ id = null, usuario, mensaje, enviado = new Date() }) {
        if (!(usuario instanceof Usuario)) {
            throw new DomainError('El atributo "usuario" debe ser una instancia de Usuario', 400);
        }
        if (!mensaje || typeof mensaje !== 'string' || !mensaje.trim()) {
            throw new DomainError('El mensaje no puede estar vacío', 400);
        }
        this.id = id;
        this.usuario = usuario;
        this.mensaje = mensaje.trim();
        this.enviado = enviado instanceof Date ? enviado : new Date(enviado);
    }
}
