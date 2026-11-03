import { Router } from 'express';
import { loginLimiter } from '../middlewares/rateLimiter.js';
import { requerirUsuarioActual } from '../middlewares/usuarioActual.js';

export function crearAuthRouter(authController) {
    const router = Router();

    // Inicio de sesión con rate limiting
    router.post('/login', loginLimiter, authController.login);

    // Consulta segura de perfil propio (únicamente para usuario autenticado)
    router.get('/me', requerirUsuarioActual, authController.obtenerPerfilActual);

    return router;
}
