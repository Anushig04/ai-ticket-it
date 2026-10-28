import { Compra } from '../domain/Compra.js';
import { EstadoCompra } from '../domain/EstadoCompra.js';
import { DomainError } from '../errors/DomainError.js';

export class CompraService {
    constructor({ compraRepo, eventoRepo, usuarioRepo }) {
        this.compraRepo = compraRepo;
        this.eventoRepo = eventoRepo;
        this.usuarioRepo = usuarioRepo;
    }

    comprar({ compradorId, eventoId, tipoEntradaId, cantidad }) {
        const comprador = this.usuarioRepo.buscarPorId(compradorId);
        if (!comprador) {
            throw new DomainError('Comprador no encontrado', 404);
        }

        const evento = this.eventoRepo.buscarPorId(eventoId);
        if (!evento) {
            throw new DomainError('Evento no encontrado', 404);
        }

        const cantNum = Number(cantidad);
        if (!Number.isInteger(cantNum) || cantNum <= 0) {
            throw new DomainError('La cantidad debe ser un entero mayor a 0', 400);
        }

        const tipoEntrada = evento.tiposEntrada.find((t) => t.id === String(tipoEntradaId));
        if (!tipoEntrada) {
            throw new DomainError('Tipo de entrada no encontrado en este evento', 404);
        }

        if (!tipoEntrada.hayCupoPara(cantNum)) {
            throw new DomainError(
                `No hay cupo suficiente para "${tipoEntrada.nombre}". Disponibles: ${tipoEntrada.cupo}`,
                409
            );
        }

        tipoEntrada.descontarCupo(cantNum);

        const nuevaCompra = new Compra({
            comprador,
            evento,
            tipoEntrada,
            cantidad: cantNum,
            estado: EstadoCompra.PENDIENTE
        });

        return this.compraRepo.guardar(nuevaCompra);
    }

    cancelar({ compraId, usuarioId, fechaActual = new Date() }) {
        const compra = this.obtenerPorId(compraId);
        const usuario = this.usuarioRepo.buscarPorId(usuarioId);
        if (!usuario) {
            throw new DomainError('Usuario no encontrado', 404);
        }

        if (compra.comprador.id !== String(usuarioId)) {
            throw new DomainError('Solo el comprador puede cancelar su compra', 403);
        }

        if (compra.estado === EstadoCompra.UTILIZADA) {
            throw new DomainError('No se puede cancelar una compra ya utilizada', 409);
        }

        if (
            compra.estado === EstadoCompra.CANCELADA ||
            compra.estado === EstadoCompra.REEMBOLSADA
        ) {
            throw new DomainError('La compra ya se encuentra cancelada', 409);
        }

        if (compra.evento.fecha.getTime() <= fechaActual.getTime()) {
            throw new DomainError('No se puede cancelar una compra si el evento ya se realizó', 409);
        }

        const nuevoEstado =
            compra.estado === EstadoCompra.CONFIRMADA
                ? EstadoCompra.REEMBOLSADA
                : EstadoCompra.CANCELADA;

        compra.tipoEntrada.restituirCupo(compra.cantidad);
        compra.actualizarEstado(nuevoEstado, usuario, fechaActual);

        return this.compraRepo.guardar(compra);
    }

    cambiarEstado({ compraId, nuevoEstado, usuarioId, fechaActual = new Date() }) {
        const compra = this.obtenerPorId(compraId);
        const usuario = this.usuarioRepo.buscarPorId(usuarioId);
        if (!usuario) {
            throw new DomainError('Usuario no encontrado', 404);
        }

        if (!compra.puedeTransicionarA(nuevoEstado)) {
            throw new DomainError(
                `Transición de estado inválida: no se puede pasar de ${compra.estado} a ${nuevoEstado}`,
                409
            );
        }

        // Si está PENDIENTE o CONFIRMADA y se pide pasar a CANCELADA o REEMBOLSADA, aplica lógica de cancelación
        if (
            (compra.estado === EstadoCompra.PENDIENTE ||
                compra.estado === EstadoCompra.CONFIRMADA) &&
            (nuevoEstado === EstadoCompra.CANCELADA ||
                nuevoEstado === EstadoCompra.REEMBOLSADA)
        ) {
            return this.cancelar({ compraId, usuarioId, fechaActual });
        }

        // Para marcar UTILIZADA o reembolsar una CANCELADA, debe ser el organizador del evento
        if (
            nuevoEstado === EstadoCompra.UTILIZADA ||
            (compra.estado === EstadoCompra.CANCELADA &&
                nuevoEstado === EstadoCompra.REEMBOLSADA)
        ) {
            if (compra.evento.organizador.id !== String(usuarioId)) {
                throw new DomainError(
                    'Solo el organizador del evento puede realizar este cambio de estado',
                    403
                );
            }
        }

        // Para confirmar pago (PENDIENTE -> CONFIRMADA), puede hacerlo el comprador o el organizador
        if (nuevoEstado === EstadoCompra.CONFIRMADA) {
            const esComprador = compra.comprador.id === String(usuarioId);
            const esOrganizador = compra.evento.organizador.id === String(usuarioId);
            if (!esComprador && !esOrganizador) {
                throw new DomainError('No tenés permiso para confirmar esta compra', 403);
            }
        }

        compra.actualizarEstado(nuevoEstado, usuario, fechaActual);
        return this.compraRepo.guardar(compra);
    }

    obtenerPorId(compraId) {
        const compra = this.compraRepo.buscarPorId(compraId);
        if (!compra) {
            throw new DomainError('Compra no encontrada', 404);
        }
        return compra;
    }

    listarPorComprador(compradorId) {
        return this.compraRepo.buscarPorComprador(compradorId);
    }

    listarPorEvento({ eventoId, organizadorId }) {
        const evento = this.eventoRepo.buscarPorId(eventoId);
        if (!evento) {
            throw new DomainError('Evento no encontrado', 404);
        }

        if (organizadorId && evento.organizador.id !== String(organizadorId)) {
            throw new DomainError(
                'Solo el organizador de este evento puede ver sus compras asociadas',
                403
            );
        }

        const compras = this.compraRepo.buscarPorEvento(eventoId);
        const cuposRestantes = evento.tiposEntrada.map((tipo) => ({
            id: tipo.id,
            nombre: tipo.nombre,
            precio: tipo.precio,
            cupoDisponible: tipo.cupo
        }));

        return {
            evento,
            compras,
            cuposRestantes
        };
    }
}
