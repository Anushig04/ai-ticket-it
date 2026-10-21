import { EstadoCompra } from './EstadoCompra.js';
import { CambioEstadoCompra } from './CambioEstadoCompra.js';
import { Mensaje } from './Mensaje.js';
import { Usuario } from './Usuario.js';
import { Evento } from './Evento.js';
import { TipoEntrada } from './TipoEntrada.js';

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
            throw new Error('El atributo "comprador" debe ser una instancia de Usuario');
        }
        if (!(evento instanceof Evento)) {
            throw new Error('El atributo "evento" debe ser una instancia de Evento');
        }
        if (!(tipoEntrada instanceof TipoEntrada)) {
            throw new Error('El atributo "tipoEntrada" debe ser una instancia de TipoEntrada');
        }

        this.id = id;
        this.comprador = comprador;
        this.evento = evento;
        this.tipoEntrada = tipoEntrada;
        this.cantidad = Number(cantidad);
        this.total = total !== undefined ? Number(total) : tipoEntrada.precio * Number(cantidad);
        this.estado = estado;
        this.mensajes = mensajes;
        this.historialEstados = historialEstados;
    }

    actualizarEstado(nuevoEstado, quien = this.comprador, fechaHora = new Date()) {
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
