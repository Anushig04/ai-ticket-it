import { apiRequest } from './client';

export const crearReseniaApi = (compraId, { puntuacion, detalle }) =>
    apiRequest(`/compras/${compraId}/resenia`, {
        method: 'POST',
        body: { puntuacion, detalle }
    });

export const obtenerReseniasOrganizador = (organizadorId) =>
    apiRequest(`/organizadores/${organizadorId}/resenias`);