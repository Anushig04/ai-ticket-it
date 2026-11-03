import { Router } from 'express';
import { requerirUsuarioActual, requerirRol } from '../middlewares/usuarioActual.js';

export function crearEventosRouter(eventoController) {
    const router = Router();

    router.get('/', eventoController.listarEventos);
    router.get('/:id', eventoController.obtenerDetalle);

    // Endpoints restringidos al rol de Organizador
    router.post('/', requerirUsuarioActual, requerirRol('organizador'), eventoController.crearEvento);
    router.put('/:id', requerirUsuarioActual, requerirRol('organizador'), eventoController.actualizarEvento);
    router.delete('/:id', requerirUsuarioActual, requerirRol('organizador'), eventoController.eliminarEvento);
    router.get('/:id/compras', requerirUsuarioActual, requerirRol('organizador'), eventoController.listarComprasDeEvento);

    // Endpoints restringidos al rol de Comprador
    router.post('/:id/favoritos', requerirUsuarioActual, requerirRol('comprador'), eventoController.agregarFavorito);
    router.delete('/:id/favoritos', requerirUsuarioActual, requerirRol('comprador'), eventoController.quitarFavorito);

    return router;
}
