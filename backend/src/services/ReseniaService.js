import { Resenia } from '../domain/Resenia.js';
import { EstadoCompra } from '../domain/EstadoCompra.js';
import { DomainError } from '../errors/DomainError.js';

export class ReseniaService {
    constructor({ reseniaRepo, compraRepo, eventoRepo }) {
        this.reseniaRepo = reseniaRepo;
        this.compraRepo = compraRepo;
        this.eventoRepo = eventoRepo;
    }

    crearResenia({ compradorId, compraId, puntuacion, detalle }) {
        const compra = this.compraRepo.buscarPorId(compraId);
        if (!compra) {
            throw new DomainError('Compra no encontrada', 404);
        }

        if (compra.comprador.id !== String(compradorId)) {
            throw new DomainError('Solo el comprador titular puede calificar esta compra', 403);
        }

        if (compra.estado !== EstadoCompra.UTILIZADA) {
            throw new DomainError('Solo se puede reseñar una compra en estado UTILIZADA', 409);
        }

        const reseniaExistente = this.reseniaRepo.buscarPorCompradorYEvento(
            compradorId,
            compra.evento.id
        );
        if (reseniaExistente || compra.resenia) {
            throw new DomainError('Ya realizaste una reseña para este evento', 409);
        }

        const puntajeNum = Number(puntuacion);
        if (Number.isNaN(puntajeNum) || puntajeNum < 1 || puntajeNum > 5) {
            throw new DomainError('La puntuación debe ser un número entre 1 y 5', 400);
        }

        if (!detalle || typeof detalle !== 'string' || !detalle.trim()) {
            throw new DomainError('El comentario de la reseña es obligatorio', 400);
        }

        const nuevaResenia = new Resenia({
            comprador: compra.comprador,
            evento: compra.evento,
            puntuacion: puntajeNum,
            detalle: detalle.trim()
        });

        const guardada = this.reseniaRepo.guardar(nuevaResenia);
        compra.resenia = guardada;
        this.compraRepo.guardar(compra);

        return guardada;
    }

    listarPorEvento(eventoId) {
        return this.reseniaRepo.buscarPorEvento(eventoId);
    }

    listarPorOrganizador(organizadorId) {
        return this.reseniaRepo.buscarPorOrganizador(organizadorId);
    }

    calcularPromedioOrganizador(organizadorId) {
        const resenias = this.reseniaRepo.buscarPorOrganizador(organizadorId);
        if (resenias.length === 0) {
            return null;
        }
        const suma = resenias.reduce((acc, r) => acc + r.puntuacion, 0);
        return Number((suma / resenias.length).toFixed(2));
    }
}