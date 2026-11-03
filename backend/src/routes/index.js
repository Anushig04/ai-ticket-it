import { Router } from 'express';
import { crearEventosRouter } from './Eventos.routes.js';
import { crearComprasRouter } from './Compras.routes.js';
import { crearOrganizadoresRouter } from './Organizadores.routes.js';
import { crearAuthRouter } from './Auth.routes.js';

export function crearRouter({ eventoController, compraController, reseniaController, authController }) {
    const router = Router();

    // Mensaje de bienvenida y metadatos
    router.get('/', (_req, res) => {
        res.json({
            status: 'ok',
            nombre: 'AI Ticket It API',
            endpoints: ['/auth/login', '/auth/me', '/categorias', '/eventos', '/compras/mias']
        });
    });

    if (authController) {
        router.use('/auth', crearAuthRouter(authController));
    }

    router.get('/categorias', eventoController.listarCategorias);

    router.use('/eventos', crearEventosRouter(eventoController));
    router.use('/compras', crearComprasRouter(compraController));
    router.use('/organizadores', crearOrganizadoresRouter(reseniaController));

    return router;
}
