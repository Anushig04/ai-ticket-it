import { Usuario } from './Usuario.js';

export class Mensaje {
    constructor({ id = null, usuario, mensaje, enviado = new Date() }) {
        if (!(usuario instanceof Usuario)) {
            throw new Error('El atributo "usuario" debe ser una instancia de Usuario');
        }
        this.id = id;
        this.usuario = usuario;
        this.mensaje = mensaje;
        this.enviado = enviado instanceof Date ? enviado : new Date(enviado);
    }
}
