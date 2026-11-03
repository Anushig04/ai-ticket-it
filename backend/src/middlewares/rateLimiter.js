import rateLimit from 'express-rate-limit';

// Limitador de tasa para mitigar ataques de fuerza bruta en el inicio de sesión
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
    limit: process.env.NODE_ENV === 'test' ? 50 : 5, // Máximo 5 intentos por IP en desarrollo/producción
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        error: 'Demasiados intentos de inicio de sesión. Por motivos de seguridad, intente nuevamente en 15 minutos.'
    }
});
