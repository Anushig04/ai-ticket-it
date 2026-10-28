import { Evento } from '../domain/Evento.js';
import { TipoEntrada } from '../domain/TipoEntrada.js';
import { DomainError } from '../errors/DomainError.js';

export class EventoService {
    constructor({ eventoRepo, categoriaRepo, usuarioRepo, reseniaService }) {
        this.eventoRepo = eventoRepo;
        this.categoriaRepo = categoriaRepo;
        this.usuarioRepo = usuarioRepo;
        this.reseniaService = reseniaService;
    }

    crearEvento({
        organizadorId,
        nombre,
        descripcion,
        categoriaId,
        fecha,
        tiposEntrada = [],
        multimedia = []
    }) {
        const organizador = this.usuarioRepo.buscarPorId(organizadorId);
        if (!organizador) {
            throw new DomainError('Organizador no encontrado', 404);
        }

        const categoria = this.categoriaRepo.buscarPorId(categoriaId);
        if (!categoria) {
            throw new DomainError('Categoría no encontrada', 404);
        }

        if (!nombre || !nombre.trim() || !descripcion || !descripcion.trim() || !fecha) {
            throw new DomainError('Nombre, descripción y fecha son obligatorios', 400);
        }

        const fechaObj = new Date(fecha);
        if (Number.isNaN(fechaObj.getTime())) {
            throw new DomainError('La fecha del evento no es válida', 400);
        }

        if (!Array.isArray(tiposEntrada) || tiposEntrada.length === 0) {
            throw new DomainError('El evento debe tener al menos un tipo de entrada', 400);
        }

        const instanciasTipos = tiposEntrada.map((t) => {
            if (!t.nombre || Number(t.precio) < 0 || Number(t.cupo) <= 0) {
                throw new DomainError(
                    'Cada tipo de entrada debe tener nombre, precio >= 0 y cupo > 0',
                    400
                );
            }
            return new TipoEntrada({
                nombre: t.nombre.trim(),
                descripcion: t.descripcion ? t.descripcion.trim() : '',
                precio: Number(t.precio),
                cupo: Number(t.cupo)
            });
        });

        const nuevoEvento = new Evento({
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            categoria,
            fecha: fechaObj,
            tiposEntrada: instanciasTipos,
            multimedia,
            organizador
        });

        return this.eventoRepo.guardar(nuevoEvento);
    }

    listarEventos({ texto, categoriaId, minPrecio, maxPrecio, orden } = {}) {
        let resultado = texto
            ? this.eventoRepo.buscarPorTexto(texto)
            : this.eventoRepo.listar();

        if (categoriaId) {
            resultado = resultado.filter((e) => e.categoria?.id === String(categoriaId));
        }

        if (minPrecio !== undefined || maxPrecio !== undefined) {
            const min = minPrecio !== undefined ? Number(minPrecio) : 0;
            const max = maxPrecio !== undefined ? Number(maxPrecio) : Infinity;
            resultado = resultado.filter((e) => e.tuPrecioEstaEntre(min, max));
        }

        if (orden === 'precio') {
            resultado.sort((a, b) => a.precioMinimo() - b.precioMinimo());
        } else if (orden === 'fecha') {
            resultado.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        } else if (orden === 'puntaje' && this.reseniaService) {
            resultado.sort((a, b) => {
                const promA = this.reseniaService.calcularPromedioOrganizador(a.organizador.id);
                const promB = this.reseniaService.calcularPromedioOrganizador(b.organizador.id);
                // Los organizadores sin reseñas (null) van al final
                if (promA === null && promB === null) return 0;
                if (promA === null) return 1;
                if (promB === null) return -1;
                return promB - promA;
            });
        }

        return resultado;
    }

    obtenerPorId(eventoId) {
        const evento = this.eventoRepo.buscarPorId(eventoId);
        if (!evento) {
            throw new DomainError('Evento no encontrado', 404);
        }
        return evento;
    }

    listarPorOrganizador(organizadorId) {
        return this.eventoRepo.buscarPorOrganizador(organizadorId);
    }

    agregarFavorito(usuarioId, eventoId) {
        const usuario = this.usuarioRepo.buscarPorId(usuarioId);
        if (!usuario) throw new DomainError('Usuario no encontrado', 404);

        const evento = this.obtenerPorId(eventoId);
        usuario.agregarFavorito(evento);
        this.usuarioRepo.guardar(usuario);
        return usuario.favoritos;
    }

    quitarFavorito(usuarioId, eventoId) {
        const usuario = this.usuarioRepo.buscarPorId(usuarioId);
        if (!usuario) throw new DomainError('Usuario no encontrado', 404);

        const evento = this.obtenerPorId(eventoId);
        usuario.quitarFavorito(evento);
        this.usuarioRepo.guardar(usuario);
        return usuario.favoritos;
    }
}