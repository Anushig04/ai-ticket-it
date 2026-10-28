import { Router } from 'express';

export function crearOrganizadoresRouter(reseniaController) {
    const router = Router();

    router.get('/:id/resenias', reseniaController.listarPorOrganizador);

    return router;
}