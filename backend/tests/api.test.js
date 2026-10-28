import request from 'supertest';
import { crearApp } from '../src/app.js';

describe('Fase 5 — Tests de Integración API REST (Supertest)', () => {
    let app;

    beforeEach(() => {
        app = crearApp({ inicializarSeed: true });
    });

    test('GET /usuarios y GET /categorias devuelven los datos iniciales (200)', async () => {
        const resUsuarios = await request(app).get('/usuarios');
        expect(resUsuarios.status).toBe(200);
        expect(resUsuarios.body).toHaveLength(7);
        expect(resUsuarios.body[0]).toHaveProperty('rol');

        const resCategorias = await request(app).get('/categorias');
        expect(resCategorias.status).toBe(200);
        expect(resCategorias.body).toHaveLength(5);
    });

    test('GET /eventos permite buscar por texto, filtrar por categoría y ordenar por precio, fecha y puntaje', async () => {
        // Búsqueda por texto sin tildes
        const resTexto = await request(app).get('/eventos?texto=acustico');
        expect(resTexto.status).toBe(200);
        expect(resTexto.body).toHaveLength(1);
        expect(resTexto.body[0].id).toBe('ev-1');

        // Orden por precio ascendente
        const resPrecio = await request(app).get('/eventos?orden=precio');
        expect(resPrecio.status).toBe(200);
        expect(resPrecio.body[0].precioMinimo).toBeLessThanOrEqual(
            resPrecio.body[1].precioMinimo
        );

        // Orden por puntaje descendente (org-1 primero con promedio 5)
        const resPuntaje = await request(app).get('/eventos?orden=puntaje');
        expect(resPuntaje.status).toBe(200);
        expect(resPuntaje.body[0].organizador.id).toBe('org-1');
    });

    test('POST /compras valida cupo disponible (409 si supera cupo) y calcula total = precio * cantidad (201)', async () => {
        // Intento sin header x-user-id -> 400
        const sinHeader = await request(app)
            .post('/compras')
            .send({ eventoId: 'ev-1', tipoEntradaId: 'te-2', cantidad: 1 });
        expect(sinHeader.status).toBe(400);

        // Intento superando el cupo disponible (te-3 tiene cupo 2) -> 409
        const sinCupo = await request(app)
            .post('/compras')
            .set('x-user-id', 'comp-1')
            .send({ eventoId: 'ev-1', tipoEntradaId: 'te-3', cantidad: 5 });
        expect(sinCupo.status).toBe(409);

        // Compra válida -> 201 y total = 28000 * 2 = 56000
        const compraOk = await request(app)
            .post('/compras')
            .set('x-user-id', 'comp-1')
            .send({ eventoId: 'ev-1', tipoEntradaId: 'te-2', cantidad: 2 });
        expect(compraOk.status).toBe(201);
        expect(compraOk.body.total).toBe(56000);
        expect(compraOk.body.estado).toBe('PENDIENTE');
    });

    test('GET /compras/mias incluye diasFaltantes solo para compras CONFIRMADA', async () => {
        const res = await request(app)
            .get('/compras/mias')
            .set('x-user-id', 'comp-1');

        expect(res.status).toBe(200);
        const confirmada = res.body.find((c) => c.id === 'compra-1');
        const pendiente = res.body.find((c) => c.id === 'compra-2');

        expect(confirmada.diasFaltantes).toBeGreaterThan(0);
        expect(pendiente.diasFaltantes).toBeNull();
    });

    test('POST /compras/:id/cancelar rechaza compras UTILIZADA (409) y reembolsa compras CONFIRMADA (200)', async () => {
        // compra-4 está UTILIZADA -> no se puede cancelar (409)
        const resUtilizada = await request(app)
            .post('/compras/compra-4/cancelar')
            .set('x-user-id', 'comp-1');
        expect(resUtilizada.status).toBe(409);

        // Otro usuario que no es dueño intenta cancelar compra-1 -> 403
        const resAjena = await request(app)
            .post('/compras/compra-1/cancelar')
            .set('x-user-id', 'comp-2');
        expect(resAjena.status).toBe(403);

        // comp-1 cancela compra-1 (CONFIRMADA) -> pasa a REEMBOLSADA (200)
        const resOk = await request(app)
            .post('/compras/compra-1/cancelar')
            .set('x-user-id', 'comp-1');
        expect(resOk.status).toBe(200);
        expect(resOk.body.estado).toBe('REEMBOLSADA');
    });

    test('POST /compras/:id/resenia solo permite reseñar compra UTILIZADA y una sola vez', async () => {
        // Intentar reseñar compra-1 (CONFIRMADA) -> 409
        const resNoUtilizada = await request(app)
            .post('/compras/compra-1/resenia')
            .set('x-user-id', 'comp-1')
            .send({ puntuacion: 5, detalle: 'Excelente' });
        expect(resNoUtilizada.status).toBe(409);

        // Reseñar compra-4 (UTILIZADA sin reseña) -> 201
        const resOk = await request(app)
            .post('/compras/compra-4/resenia')
            .set('x-user-id', 'comp-1')
            .send({ puntuacion: 5, detalle: 'Increíble concierto a la luz de las velas' });
        expect(resOk.status).toBe(201);

        // Intentar reseñar por segunda vez -> 409
        const resRepetida = await request(app)
            .post('/compras/compra-4/resenia')
            .set('x-user-id', 'comp-1')
            .send({ puntuacion: 4, detalle: 'Otra reseña' });
        expect(resRepetida.status).toBe(409);
    });

    test('POST /compras/:id/mensajes permite chatear a comprador y organizador, y bloquea a terceros (403)', async () => {
        const resIntruso = await request(app)
            .post('/compras/compra-1/mensajes')
            .set('x-user-id', 'comp-3')
            .send({ mensaje: 'Hola' });
        expect(resIntruso.status).toBe(403);

        const resComprador = await request(app)
            .post('/compras/compra-1/mensajes')
            .set('x-user-id', 'comp-1')
            .send({ mensaje: '¿Hay estacionamiento cerca?' });
        expect(resComprador.status).toBe(201);
        expect(resComprador.body.mensaje).toBe('¿Hay estacionamiento cerca?');
    });
});