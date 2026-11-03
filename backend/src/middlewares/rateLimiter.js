import rateLimit from 'express-rate-limit';

// Limitador de tasa para mitigar ataques de fuerza bruta:
// Solo penaliza intentos fallidos. Los accesos exitosos NO descuentan intentos ni bloquean al usuario.
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
    limit: process.env.NODE_ENV === 'test' ? 50 : 5, // Máximo 5 intentos erróneos por IP antes del bloqueo
    standardHeaders: 'draft-7',
    legacyHeaders: false,

    // Omite del cómputo los intentos exitosos (status < 400)
    skipSuccessfulRequests: true,
    requestWasSuccessful: (_req, res) => res.statusCode < 400,

    message: {
        error: 'Demasiados intentos de inicio de sesión fallidos. Por motivos de seguridad, intente nuevamente en 15 minutos.'
    }
});
