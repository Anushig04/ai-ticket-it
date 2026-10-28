import { EstadoCompra } from './EstadoCompra.js';
import { CambioEstadoCompra } from './CambioEstadoCompra.js';
import { Mensaje } from './Mensaje.js';
import { Usuario } from './Usuario.js';
import { Evento } from './Evento.js';
import { TipoEntrada } from './TipoEntrada.js';
import { DomainError } from '../errors/DomainError.js';

export const TRANSICIONES_VALIDAS = Object.freeze({
    [EstadoCompra.PENDIENTE]: [EstadoCompra.CONFIRMADA, EstadoCompra.CANCELADA],
    [EstadoCompra.CONFIRMADA]: [
        EstadoCompra.UTILIZADA,
        EstadoCompra.CANCELADA,
        EstadoCompra.REEMBOLSADA
    ],
    [EstadoCompra.CANCELADA]: [EstadoCompra.REEMBOLSADA],
    [EstadoCompra.UTILIZADA]: [],
    [EstadoCompra.REEMBOLSADA]: []
});

export class Compra {
    constructor({
        id = null,
        comprador,
        evento,
        tipoEntrada,
        cantidad,
        total,
        estado = EstadoCompra.PENDIENTE,
        mensajes = [],
        historialEstados = []
    }) {
        if (!(comprador instanceof Usuario)) {
            throw new DomainError('El atributo "comprador" debe ser una instancia de Usuario', 400);
        }
        if (!(evento instanceof Evento)) {
            throw new DomainError('El atributo "evento" debe ser una instancia de Evento', 400);
        }
        if (!(tipoEntrada instanceof TipoEntrada)) {
            throw new DomainError('El atributo "tipoEntrada" debe ser una instancia de TipoEntrada', 400);
        }

        const cantNum = Number(cantidad);
        if (!Number.isInteger(cantNum) || cantNum <= 0) {
            throw new DomainError('La cantidad debe ser un entero mayor a 0', 400);
        }

        this.id = id;
        this.comprador = comprador;
        this.evento = evento;
        this.tipoEntrada = tipoEntrada;
        this.cantidad = cantNum;
        this.total = total !== undefined ? Number(total) : tipoEntrada.precio * cantNum;
        this.estado = estado;
        this.mensajes = mensajes;
        this.historialEstados = historialEstados;
    }

    puedeTransicionarA(nuevoEstado) {
        const permitidos = TRANSICIONES_VALIDAS[this.estado] || [];
        return permitidos.includes(nuevoEstado);
    }

    actualizarEstado(nuevoEstado, quien = this.comprador, fechaHora = new Date()) {
        if (!this.puedeTransicionarA(nuevoEstado)) {
            throw new DomainError(
                `Transición de estado inválida: no se puede pasar de ${this.estado} a ${nuevoEstado}`,
                409
            );
        }
        this.estado = nuevoEstado;
        const cambio = new CambioEstadoCompra({
            compra: this,
            estado: nuevoEstado,
            quien,
            fechaHora
        });
        this.historialEstados.push(cambio);
        return cambio;
    }

    agregarMensaje({ id = null, usuario, mensaje, enviado = new Date() }) {
        const nuevoMensaje = new Mensaje({ id, usuario, mensaje, enviado });
        this.mensajes.push(nuevoMensaje);
        return nuevoMensaje;
    }

    diasFaltantesParaEvento(fechaActual = new Date()) {
        if (this.estado !== EstadoCompra.CONFIRMADA || !this.evento?.fecha) {
            return null;
        }
        const diffMs = this.evento.fecha.getTime() - fechaActual.getTime();
        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    puedeCancelarse(fechaActual = new Date()) {
        if (
            this.estado === EstadoCompra.UTILIZADA ||
            this.estado === EstadoCompra.CANCELADA ||
            this.estado === EstadoCompra.REEMBOLSADA
        ) {
            return false;
        }
        return this.evento.fecha.getTime() > fechaActual.getTime();
    }
}
