const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatearPrecio(monto) {
    const num = Number(monto) || 0;
    return '$' + num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatearFechaCorta(fechaIso) {
    if (!fechaIso) return '';
    const d = new Date(fechaIso);
    if (Number.isNaN(d.getTime())) return '';
    return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

export function formatearHora(fechaIso) {
    if (!fechaIso) return '';
    const d = new Date(fechaIso);
    if (Number.isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}