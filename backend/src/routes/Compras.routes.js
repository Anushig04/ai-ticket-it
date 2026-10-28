import { Router } from 'express';
import { requerirUsuarioActual } from '../middlewares/usuarioActual.js';

export function crearComprasRouter(compraController) {
    const router = Router();

    router.post('/', requerirUsuarioActual, compraController.comprar);
    router.get('/mias', requerirUsuarioActual, compraController.listarMias);
    router.get('/:id', compraController.obtenerDetalle);
    router.patch('/:id/estado', requerirUsuarioActual, compraController.cambiarEstado);
    router.post('/:id/cancelar', requerirUsuarioActual, compraController.cancelar);

    // Sub-recursos de una compra (chat y reseña)
    router.get('/:id/mensajes', requerirUsuarioActual, compraController.listarMensajes);
    router.post('/:id/mensajes', requerirUsuarioActual, compraController.agregarMensaje);
    router.post('/:id/resenia', requerirUsuarioActual, compraController.crearResenia);

    return router;
}