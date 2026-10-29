export const colors = {
    // Paleta oscura general
    background: '#1A2224',      // Fondo general de pantalla
    surface: '#232C2E',         // Filas y cards
    surfaceDeep: '#141A1B',     // Inputs, selector, botones de ícono, tab bar
    border: '#2E3A3C',          // Divisores y contornos
    accent: '#6EE7B7',          // Acento menta (títulos destacados, fechas, chips activos)
    accentText: '#111111',      // Texto sobre fondo menta
    greenCheck: '#1FA880',      // Círculo de selección
    text: '#FFFFFF',            // Texto principal
    textSecondary: '#A7B1B3',   // Lugar, descripciones
    textMuted: '#6B7678',       // Placeholders, etiquetas
    ticketBg: '#FFFFFF',        // Card de entrada seleccionada y botón principal
    ticketText: '#111111',      // Texto sobre botón blanco / ticket activo
    danger: '#FF8A80',          // Cancelar y errores

    // Colores para los bloques de iniciales de eventos (NR, HA, FS, JV del mockup)
    avatarPalette: ['#7E42B3', '#A84A38', '#387CA3', '#4E7A42', '#33658A'],

    // Estados de la compra (versión oscura)
    estadosCompra: {
        PENDIENTE: {
            bg: '#3A3320',
            text: '#F2C94C',
            label: 'Pendiente de pago'
        },
        CONFIRMADA: {
            bg: '#123B2E',
            text: '#6EE7B7',
            label: 'Confirmada'
        },
        UTILIZADA: {
            bg: '#2A3234',
            text: '#A7B1B3',
            label: 'Utilizada'
        },
        CANCELADA: {
            bg: '#3F2023',
            text: '#FF8A80',
            label: 'Cancelada'
        },
        REEMBOLSADA: {
            bg: '#16304A',
            text: '#7CC4FF',
            label: 'Reembolsada'
        }
    }
};

// Helper para obtener las 2 iniciales (ej. "Noche de rock" -> "NR")
export function obtenerIniciales(texto = '') {
    const palabras = texto
        .trim()
        .split(/\s+/)
        .filter((p) => p.length > 2 || texto.split(/\s+/).length <= 2);
    if (palabras.length === 0) return 'EV';
    if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
    return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

// Helper para elegir un color consistente de avatar según el id
export function colorPorId(id = '') {
    let hash = 0;
    const str = String(id);
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.avatarPalette.length;
    return colors.avatarPalette[index];
}