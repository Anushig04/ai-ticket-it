import { DomainError } from '../errors/DomainError.js';

export function errorHandler(err, _req, res, _next) {
    if (err instanceof DomainError) {
        return res.status(err.statusCode).json({
            error: err.message
        });
    }

    console.error('[Error No Controlado]:', err);
    return res.status(500).json({
        error: 'Ocurrió un error interno en el servidor'
    });
}