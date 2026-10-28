import { Router } from 'express';
import { requerirUsuarioActual } from '../middlewares/usuarioActual.js';

export function crearEventosRouter(eventoController) {
    const router = Router();

    router.get('/', eventoController.listarEventos);
    router.get('/:id', eventoController.obtenerDetalle);
    router.post('/', requerirUsuarioActual, eventoController.crearEvento);
    router.get('/:id/compras', requerirUsuarioActual, eventoController.listarComprasDeEvento);
    router.post('/:id/favoritos', requerirUsuarioActual, eventoController.agregarFavorito);
    router.delete('/:id/favoritos', requerirUsuarioActual, eventoController.quitarFavorito);

    return router;
}