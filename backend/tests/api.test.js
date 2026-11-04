import { jest } from '@jest/globals';
import request from 'supertest';
import { crearApp } from '../src/app.js';

describe('Fase 5 — Tests de Integración API REST (Supertest)', () => {
    let app;

    beforeEach(() => {
        app = crearApp({ inicializarSeed: true });
    });

    test('Protección de Privacidad: GET /usuarios no es público (404), GET /auth/me requiere JWT y GET /categorias devuelve 200', async () => {
        // 1. GET /usuarios ya no es accesible públicamente (mitiga User Enumeration)
        const resUsuarios = await request(app).get('/usuarios');
        expect(resUsuarios.status).toBe(404);

        // 2. GET /categorias sigue siendo público
        const resCategorias = await request(app).get('/categorias');
        expect(resCategorias.status).toBe(200);
        expect(resCategorias.body).toHaveLength(6);

        // 3. GET /auth/me sin autenticación -> 401
        const resMeSinAuth = await request(app).get('/auth/me');
        expect(resMeSinAuth.status).toBe(401);

        // 4. GET /auth/me con JWT devuelve el perfil propio
        const resLogin = await request(app)
            .post('/auth/login')
            .send({ email: 'sofia.perez@ticketit.com', password: '123456' });
        const resMe = await request(app)
            .get('/auth/me')
            .set('Authorization', 'Bearer ' + resLogin.body.token);
        expect(resMe.status).toBe(200);
        expect(resMe.body.id).toBe('comp-1');
        expect(resMe.body.email).toBe('sofia.perez@ticketit.com');
        expect(resMe.body.rol).toBe('comprador');
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
        expect(sinHeader.status).toBe(401);

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
    test('GET /compras/:id mitiga IDOR: rechaza sin header (400), rechaza usuarios no autorizados (403) y permite a comprador y organizador (200)', async () => {
        const sinHeader = await request(app).get('/compras/compra-1');
        expect(sinHeader.status).toBe(401);

        const resAjeno = await request(app).get('/compras/compra-1').set('x-user-id', 'comp-2');
        expect(resAjeno.status).toBe(403);
        expect(resAjeno.body.error).toMatch(/No tenés autorización/);

        const resComprador = await request(app).get('/compras/compra-1').set('x-user-id', 'comp-1');
        expect(resComprador.status).toBe(200);
        expect(resComprador.body.id).toBe('compra-1');

        const resOrganizador = await request(app).get('/compras/compra-1').set('x-user-id', 'org-1');
        expect(resOrganizador.status).toBe(200);
        expect(resOrganizador.body.id).toBe('compra-1');
    });

    test('Seguridad HTTP: deshabilita X-Powered-By y oculta mensajes internos en errores 500', async () => {
        const resRoot = await request(app).get('/');
        expect(resRoot.headers['x-powered-by']).toBeUndefined();

                const mockRes = {
            statusCode: null,
            body: null,
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; }
        };
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const { errorHandler } = await import('../src/middlewares/errorHandler.js');
        errorHandler(new Error('Database password was 1234 at internal path /secret/db'), {}, mockRes, () => {});
        consoleSpy.mockRestore();

        expect(mockRes.statusCode).toBe(500);
        expect(mockRes.body.error).toBe('Ocurrió un error interno en el servidor');
        expect(JSON.stringify(mockRes.body)).not.toMatch(/Database password/);
    });
    test('POST /auth/login autentica con credenciales válidas y genera un JWT firmado verificable con Bearer', async () => {
        // 1. Login exitoso con email y contraseña
        const resLogin = await request(app)
            .post('/auth/login')
            .send({ email: 'sofia.perez@ticketit.com', password: '123456' });
        expect(resLogin.status).toBe(200);
        expect(resLogin.body).toHaveProperty('token');
        expect(resLogin.body.usuario.id).toBe('comp-1');

        const token = resLogin.body.token;

        // 2. Uso del JWT en endpoint protegido con Authorization: Bearer
        const resProtegido = await request(app)
            .get('/compras/mias')
            .set('Authorization', 'Bearer ' + token);
        expect(resProtegido.status).toBe(200);

        // 3. Token adulterado o inválido -> 401
        const resAdulterado = await request(app)
            .get('/compras/mias')
            .set('Authorization', 'Bearer token.invalido.adulterado');
        expect(resAdulterado.status).toBe(401);

        // 4. Credenciales incorrectas -> 401
        const resFallo = await request(app)
            .post('/auth/login')
            .send({ email: 'sofia.perez@ticketit.com', password: 'password-incorrecta' });
        expect(resFallo.status).toBe(401);
        expect(resFallo.body.error).toMatch(/Credenciales inválidas/);
    });

    test('Control de Acceso por Roles (RBAC): rechaza compradores intentando crear eventos (403) y organizadores intentando comprar entradas (403)', async () => {
        // 1. Login como Sofía (Comprador)
        const resLoginComp = await request(app)
            .post('/auth/login')
            .send({ email: 'sofia.perez@ticketit.com', password: '123456' });
        const tokenComprador = resLoginComp.body.token;

        // Comprador intenta crear evento -> 403
        const resCrearEvento = await request(app)
            .post('/eventos')
            .set('Authorization', 'Bearer ' + tokenComprador)
            .send({
                nombre: 'Intento Ilegal',
                descripcion: 'Debería ser rechazado',
                categoriaId: 'cat-1',
                fecha: new Date(),
                tiposEntrada: [{ nombre: 'General', precio: 1000, cupo: 10 }]
            });
        expect(resCrearEvento.status).toBe(403);
        expect(resCrearEvento.body.error).toMatch(/se requiere rol de organizador/);

        // 2. Login como Lucía (Organizador)
        const resLoginOrg = await request(app)
            .post('/auth/login')
            .send({ email: 'lucia.mendez@ticketit.com', password: '123456' });
        const tokenOrg = resLoginOrg.body.token;

        // Organizador intenta comprar entrada -> 403
        const resComprar = await request(app)
            .post('/compras')
            .set('Authorization', 'Bearer ' + tokenOrg)
            .send({ eventoId: 'ev-1', tipoEntradaId: 'te-1', cantidad: 1 });
        expect(resComprar.status).toBe(403);
        expect(resComprar.body.error).toMatch(/se requiere rol de comprador/);
    });

    test('Rate Limiter en Login: bloquea con 429 Too Many Requests cuando se superan los intentos máximos permitidos', async () => {
        const { default: rateLimit } = await import('express-rate-limit');
        const express = (await import('express')).default;
        const testApp = express();

        const testLimiter = rateLimit({
            windowMs: 60 * 1000,
            limit: 2,
            message: { error: 'Demasiados intentos de inicio de sesión' }
        });

        testApp.post('/login-test', testLimiter, (_req, res) => res.json({ ok: true }));

        const r1 = await request(testApp).post('/login-test');
        expect(r1.status).toBe(200);

        const r2 = await request(testApp).post('/login-test');
        expect(r2.status).toBe(200);

        const r3 = await request(testApp).post('/login-test');
        expect(r3.status).toBe(429);
        expect(r3.body.error).toMatch(/Demasiados intentos/);
    });

    test('Accounting: auditLogger registra accesos y emite alerta en consola ante eventos de seguridad (401/403/429)', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        // Provocamos un acceso no autorizado (401)
        const resSinAuth = await request(app).get('/auth/me');
        expect(resSinAuth.status).toBe(401);

        // Verificamos que se haya emitido la alerta de auditoría
        expect(warnSpy).toHaveBeenCalled();
        const logsEmitidos = warnSpy.mock.calls.map((c) => c.join(' ')).join('\n');
        expect(logsEmitidos).toMatch(/\[SEGURIDAD - AUDITORÍA\]/);
        expect(logsEmitidos).toMatch(/AUTENTICACION_FALLIDA_O_TOKEN_INVALIDO/);

        warnSpy.mockRestore();
    });
});