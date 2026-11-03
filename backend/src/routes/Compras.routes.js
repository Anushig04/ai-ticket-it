import { Router } from 'express';
import { requerirUsuarioActual, requerirRol } from '../middlewares/usuarioActual.js';

export function crearComprasRouter(compraController) {
    const router = Router();

    // Endpoints restringidos al rol de Comprador
    router.post('/', requerirUsuarioActual, requerirRol('comprador'), compraController.comprar);
    router.get('/mias', requerirUsuarioActual, requerirRol('comprador'), compraController.listarMias);
    router.post('/:id/cancelar', requerirUsuarioActual, requerirRol('comprador'), compraController.cancelar);
    router.post('/:id/resenia', requerirUsuarioActual, requerirRol('comprador'), compraController.crearResenia);

    // Endpoints compartidos por ambos roles (validados por titularidad/organizador en el servicio)
    router.get('/:id', requerirUsuarioActual, compraController.obtenerDetalle);
    router.patch('/:id/estado', requerirUsuarioActual, compraController.cambiarEstado);
    router.get('/:id/mensajes', requerirUsuarioActual, compraController.listarMensajes);
    router.post('/:id/mensajes', requerirUsuarioActual, compraController.agregarMensaje);

    return router;
}
