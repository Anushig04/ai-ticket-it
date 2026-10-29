import { apiRequest } from './client';

export const realizarCompra = ({ eventoId, tipoEntradaId, cantidad }) =>
    apiRequest('/compras', {
        method: 'POST',
        body: { eventoId, tipoEntradaId, cantidad }
    });

export const obtenerMisCompras = () => apiRequest('/compras/mias');

export const obtenerCompraDetalle = (compraId) => apiRequest(`/compras/${compraId}`);

export const cambiarEstadoCompra = (compraId, estado) =>
    apiRequest(`/compras/${compraId}/estado`, {
        method: 'PATCH',
        body: { estado }
    });

export const cancelarCompraApi = (compraId) =>
    apiRequest(`/compras/${compraId}/cancelar`, { method: 'POST' });

export const obtenerMensajesCompra = (compraId) =>
    apiRequest(`/compras/${compraId}/mensajes`);

export const enviarMensajeCompra = (compraId, mensaje) =>
    apiRequest(`/compras/${compraId}/mensajes`, {
        method: 'POST',
        body: { mensaje }
    });