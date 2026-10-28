import { Router } from 'express';
import { crearEventosRouter } from './eventos.routes.js';
import { crearComprasRouter } from './compras.routes.js';
import { crearOrganizadoresRouter } from './organizadores.routes.js';

export function crearRouter({ eventoController, compraController, reseniaController }) {
    const router = Router();

    //mensaje bienvenida
    router.get('/', (_req, res) => {
        res.json({
            status: 'ok',
            nombre: 'AI Ticket It API',
            endpoints: ['/usuarios', '/categorias', '/eventos', '/compras/mias']
        });
    });

    router.get('/usuarios', eventoController.listarUsuarios);
    router.get('/categorias', eventoController.listarCategorias);

    router.use('/eventos', crearEventosRouter(eventoController));
    router.use('/compras', crearComprasRouter(compraController));
    router.use('/organizadores', crearOrganizadoresRouter(reseniaController));

    return router;
}