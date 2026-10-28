import { DomainError } from '../errors/DomainError.js';

export function errorHandler(err, _req, res, _next) {
    if (err instanceof DomainError) {
        return res.status(err.statusCode).json({
            error: err.message
        });
    }

    console.error(err);
    return res.status(500).json({
        error: err.message || 'Error interno del servidor'
    });
}