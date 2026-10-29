import { apiRequest } from './client';

export const obtenerUsuarios = () => apiRequest('/usuarios');

export const obtenerCategorias = () => apiRequest('/categorias');

export const obtenerEventos = ({ texto = '', categoria = '', orden = '', organizadorId = '' } = {}) => {
    const params = new URLSearchParams();
    if (texto) params.append('texto', texto);
    if (categoria) params.append('categoria', categoria);
    if (orden) params.append('orden', orden);
    if (organizadorId) params.append('organizadorId', organizadorId);

    const query = params.toString();
    return apiRequest(`/eventos${query ? `?${query}` : ''}`);
};

export const obtenerEventoDetalle = (id) => apiRequest(`/eventos/${id}`);

export const crearEvento = (datosEvento) =>
    apiRequest('/eventos', { method: 'POST', body: datosEvento });

export const obtenerComprasDeEvento = (eventoId) =>
    apiRequest(`/eventos/${eventoId}/compras`);

export const agregarFavoritoApi = (eventoId) =>
    apiRequest(`/eventos/${eventoId}/favoritos`, { method: 'POST' });

export const quitarFavoritoApi = (eventoId) =>
    apiRequest(`/eventos/${eventoId}/favoritos`, { method: 'DELETE' });