import jwt from 'jsonwebtoken';
import { DomainError } from '../errors/DomainError.js';
import { JWT_SECRET } from '../services/AuthService.js';

export function extraerUsuarioActual(req, _res, next) {
    const authHeader = req.header('authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.usuarioId = decoded.sub;
            req.usuarioRol = decoded.rol;
            return next();
        } catch (_err) {
            req.usuarioId = null;
            req.usuarioRol = null;
            return next();
        }
    }

    // Compatibilidad: si se envía x-user-id
    const userId = req.header('x-user-id');
    req.usuarioId = userId ? String(userId).trim() : null;
    req.usuarioRol = req.usuarioId && String(req.usuarioId).startsWith('org-') ? 'organizador' : 'comprador';
    next();
}

export function requerirUsuarioActual(req, _res, next) {
    if (!req.usuarioId) {
        return next(new DomainError('Acceso no autorizado: debe enviar un token JWT válido', 401));
    }
    next();
}

export function requerirRol(rolRequerido) {
    return (req, _res, next) => {
        if (!req.usuarioId) {
            return next(new DomainError('Acceso no autorizado: debe iniciar sesión', 401));
        }
        if (req.usuarioRol !== rolRequerido) {
            return next(
                new DomainError(`Acceso denegado: se requiere rol de ${rolRequerido}`, 403)
            );
        }
        next();
    };
}
