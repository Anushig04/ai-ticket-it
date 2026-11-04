export function auditLogger(req, res, next) {
    const inicio = Date.now();
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('user-agent') || 'Desconocido';

    res.on('finish', () => {
        const duracionMs = Date.now() - inicio;
        const statusCode = res.statusCode;
        const usuarioId = req.usuarioId || 'ANÓNIMO';
        const rol = req.usuarioRol || 'SIN_ROL';

        const logEntry = {
            timestamp: new Date().toISOString(),
            tipo: determinarTipoEvento(statusCode),
            statusCode,
            metodo: req.method,
            ruta: req.originalUrl,
            usuarioId,
            rol,
            ip,
            duracionMs: `${duracionMs}ms`,
            userAgent
        };

        // Si es un evento de seguridad relevante (401, 403, 429), emitir alerta de auditoría
        if (statusCode === 401 || statusCode === 403 || statusCode === 429) {
            console.warn('🚨 [SEGURIDAD - AUDITORÍA]:', JSON.stringify(logEntry));
        } else if (statusCode >= 500) {
            console.error('🔥 [ERROR CRÍTICO - AUDITORÍA]:', JSON.stringify(logEntry));
        } else if (process.env.NODE_ENV !== 'test') {
            console.log(
                '📋 [AUDITORÍA HTTP]:',
                `${req.method} ${req.originalUrl} - ${statusCode} (${duracionMs}ms) [User: ${usuarioId}]`
            );
        }
    });

    next();
}

export function determinarTipoEvento(status) {
    if (status === 401) return 'AUTENTICACION_FALLIDA_O_TOKEN_INVALIDO';
    if (status === 403) return 'ACCESO_DENEGADO_ROL_O_PROPIETARIO';
    if (status === 429) return 'BLOQUEO_RATE_LIMIT_FUERZA_BRUTA';
    if (status >= 500) return 'ERROR_INTERNO_SERVIDOR';
    return 'ACCESO_EXITOSO';
}
