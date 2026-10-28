import { DomainError } from '../errors/DomainError.js';

export class MensajeService {
    constructor({ compraRepo, usuarioRepo }) {
        this.compraRepo = compraRepo;
        this.usuarioRepo = usuarioRepo;
    }

    _validarParticipante(compra, usuarioId) {
        const esComprador = compra.comprador.id === String(usuarioId);
        const esOrganizador = compra.evento.organizador.id === String(usuarioId);

        if (!esComprador && !esOrganizador) {
            throw new DomainError(
                'Solo el comprador o el organizador de esta compra pueden acceder al chat',
                403
            );
        }
    }

    agregarMensaje({ compraId, usuarioId, mensaje, fechaActual = new Date() }) {
        const compra = this.compraRepo.buscarPorId(compraId);
        if (!compra) {
            throw new DomainError('Compra no encontrada', 404);
        }

        const usuario = this.usuarioRepo.buscarPorId(usuarioId);
        if (!usuario) {
            throw new DomainError('Usuario no encontrado', 404);
        }

        this._validarParticipante(compra, usuarioId);

        if (!mensaje || typeof mensaje !== 'string' || !mensaje.trim()) {
            throw new DomainError('El mensaje no puede estar vacío', 400);
        }

        const nuevoMensaje = compra.agregarMensaje({
            id: `msg-${compra.id}-${compra.mensajes.length + 1}`,
            usuario,
            mensaje: mensaje.trim(),
            enviado: fechaActual
        });

        this.compraRepo.guardar(compra);
        return nuevoMensaje;
    }

    listarMensajes({ compraId, usuarioId }) {
        const compra = this.compraRepo.buscarPorId(compraId);
        if (!compra) {
            throw new DomainError('Compra no encontrada', 404);
        }

        if (usuarioId) {
            this._validarParticipante(compra, usuarioId);
        }

        return [...compra.mensajes].sort(
            (a, b) => a.enviado.getTime() - b.enviado.getTime()
        );
    }
}