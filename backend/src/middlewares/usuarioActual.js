import { DomainError } from '../errors/DomainError.js';

export function extraerUsuarioActual(req, _res, next) {
    const userId = req.header('x-user-id');
    req.usuarioId = userId ? String(userId).trim() : null;
    next();
}

export function requerirUsuarioActual(req, _res, next) {
    if (!req.usuarioId) {
        return next(new DomainError('Debe enviar el header x-user-id', 400));
    }
    next();
}