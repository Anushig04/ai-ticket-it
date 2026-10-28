import { jest } from '@jest/globals';
import { cargarSeed } from '../src/config/seed.js';
import { UsuarioRepository } from '../src/repositories/UsuarioRepository.js';
import { CategoriaRepository } from '../src/repositories/CategoriaRepository.js';
import { EventoRepository } from '../src/repositories/EventoRepository.js';
import { CompraRepository } from '../src/repositories/CompraRepository.js';
import { ReseniaRepository } from '../src/repositories/ReseniaRepository.js';
import { EventoService } from '../src/services/EventoService.js';
import { CompraService } from '../src/services/CompraService.js';
import { MensajeService } from '../src/services/MensajeService.js';
import { ReseniaService } from '../src/services/ReseniaService.js';
import { EstadoCompra } from '../src/domain/EstadoCompra.js';
import { Usuario } from '../src/domain/Usuario.js';
import { Categoria } from '../src/domain/Categoria.js';
import { TipoEntrada } from '../src/domain/TipoEntrada.js';
import { Evento } from '../src/domain/Evento.js';
import { Compra } from '../src/domain/Compra.js';
import { Resenia } from '../src/domain/Resenia.js';
import { Mensaje } from '../src/domain/Mensaje.js';
import { CambioEstadoCompra } from '../src/domain/CambioEstadoCompra.js';

describe('Fase 1, 3 y 5 — Dominio Autovalidado, Services y Mocking', () => {
    let usuarioRepo;
    let categoriaRepo;
    let eventoRepo;
    let compraRepo;
    let reseniaRepo;

    let reseniaService;
    let eventoService;
    let compraService;
    let mensajeService;

    beforeEach(() => {
        usuarioRepo = new UsuarioRepository();
        categoriaRepo = new CategoriaRepository();
        eventoRepo = new EventoRepository();
        compraRepo = new CompraRepository();
        reseniaRepo = new ReseniaRepository();

        cargarSeed({
            usuarioRepo,
            categoriaRepo,
            eventoRepo,
            compraRepo,
            reseniaRepo
        });

        reseniaService = new ReseniaService({ reseniaRepo, compraRepo, eventoRepo });
        eventoService = new EventoService({
            eventoRepo,
            categoriaRepo,
            usuarioRepo,
            reseniaService
        });
        compraService = new CompraService({ compraRepo, eventoRepo, usuarioRepo });
        mensajeService = new MensajeService({ compraRepo, usuarioRepo });
    });

    describe('Capa de Dominio — Autovalidación e Invariantes', () => {
        test('Compra valida sus invariantes de construcción y transiciones válidas en actualizarEstado', () => {
            // Arrange
            const compra = compraRepo.buscarPorId('compra-4'); // estado UTILIZADA
            const comprador = usuarioRepo.buscarPorId('comp-1');
            const evento = eventoRepo.buscarPorId('ev-1');
            const tipo = evento.tiposEntrada[0];

            // Act & Assert: No puede pasar de UTILIZADA a PENDIENTE ni CONFIRMADA
            expect(compra.puedeTransicionarA(EstadoCompra.PENDIENTE)).toBeFalsy();
            expect(() => compra.actualizarEstado(EstadoCompra.PENDIENTE)).toThrow(
                /Transición de estado inválida/
            );

            // Invariantes de constructor de Compra
            expect(
                () => new Compra({ comprador: {}, evento, tipoEntrada: tipo, cantidad: 1 })
            ).toThrow(/instancia de Usuario/);
            expect(
                () => new Compra({ comprador, evento: {}, tipoEntrada: tipo, cantidad: 1 })
            ).toThrow(/instancia de Evento/);
            expect(
                () => new Compra({ comprador, evento, tipoEntrada: {}, cantidad: 1 })
            ).toThrow(/instancia de TipoEntrada/);
            expect(
                () => new Compra({ comprador, evento, tipoEntrada: tipo, cantidad: 0 })
            ).toThrow(/entero mayor a 0/);

            // puedeCancelarse en dominio
            const compraConfirmada = compraRepo.buscarPorId('compra-1');
            expect(compraConfirmada.puedeCancelarse()).toBeTruthy();
            expect(compra.puedeCancelarse()).toBeFalsy();
        });

        test('TipoEntrada, Resenia, Mensaje, Evento y CambioEstadoCompra validan sus invariantes', () => {
            const usuario = usuarioRepo.buscarPorId('comp-1');
            const evento = eventoRepo.buscarPorId('ev-1');

            // TipoEntrada invariantes
            expect(() => new TipoEntrada({ nombre: '', precio: 100, cupo: 10 })).toThrow(
                /nombre del tipo de entrada es obligatorio/
            );
            expect(() => new TipoEntrada({ nombre: 'VIP', precio: -1, cupo: 10 })).toThrow(
                /precio del tipo de entrada debe ser mayor o igual a 0/
            );
            expect(() => new TipoEntrada({ nombre: 'VIP', precio: 100, cupo: -5 })).toThrow(
                /cupo del tipo de entrada no puede ser negativo/
            );
            const tipo = new TipoEntrada({ nombre: 'Campo', precio: 1000, cupo: 2 });
            expect(() => tipo.descontarCupo(5)).toThrow(/No hay cupo suficiente/);

            // Resenia invariantes
            expect(
                () => new Resenia({ comprador: {}, evento, puntuacion: 5, detalle: 'Ok' })
            ).toThrow(/instancia de Usuario/);
            expect(
                () => new Resenia({ comprador: usuario, evento: {}, puntuacion: 5, detalle: 'Ok' })
            ).toThrow(/instancia de Evento/);
            expect(
                () => new Resenia({ comprador: usuario, evento, puntuacion: 6, detalle: 'Ok' })
            ).toThrow(/entre 1 y 5/);
            expect(
                () => new Resenia({ comprador: usuario, evento, puntuacion: 4, detalle: '   ' })
            ).toThrow(/comentario de la reseña es obligatorio/);

            // Mensaje y CambioEstadoCompra invariantes
            expect(() => new Mensaje({ usuario: {}, mensaje: 'Hola' })).toThrow(
                /instancia de Usuario/
            );
            expect(() => new Mensaje({ usuario, mensaje: '   ' })).toThrow(
                /mensaje no puede estar vacío/
            );
            expect(
                () => new CambioEstadoCompra({ compra: {}, estado: 'PENDIENTE', quien: {} })
            ).toThrow(/instancia de Usuario/);

            // Evento invariantes
            expect(
                () =>
                    new Evento({
                        nombre: 'Ev',
                        descripcion: 'Desc',
                        categoria: categoriaRepo.buscarPorId('cat-1'),
                        fecha: new Date(),
                        organizador: {}
                    })
            ).toThrow(/instancia de Usuario/);
            expect(
                () =>
                    new Evento({
                        nombre: 'Ev',
                        descripcion: 'Desc',
                        categoria: {},
                        fecha: new Date(),
                        organizador: usuario
                    })
            ).toThrow(/instancia de Categoria/);

            const evSinTipos = new Evento({
                nombre: 'Gratis',
                descripcion: 'Desc',
                categoria: categoriaRepo.buscarPorId('cat-1'),
                fecha: new Date(),
                organizador: usuario,
                tiposEntrada: []
            });
            expect(evSinTipos.precioMinimo()).toBe(0);
        });
    });

    describe('Tests Unitarios Aislados con Mocking (jest.fn)', () => {
        test('CompraService.comprar aisla repositorios con Mocks y verifica llamadas con toHaveBeenCalledWith', () => {
            // ARRANGE: Creamos objetos y funciones simuladas (Mocks)
            const orgMock = new Usuario({ id: 'org-99', nombre: 'Ana', apellido: 'Org' });
            const compMock = new Usuario({ id: 'comp-99', nombre: 'Pedro', apellido: 'Comp' });
            const catMock = new Categoria({ id: 'cat-99', nombre: 'Música', descripcion: 'Shows' });
            const tipoMock = new TipoEntrada({
                id: 'te-99',
                nombre: 'Campo General',
                precio: 10000,
                cupo: 10
            });
            const eventoMock = new Evento({
                id: 'ev-99',
                nombre: 'Show Mockeado',
                descripcion: 'Prueba aislada con mocks',
                categoria: catMock,
                fecha: new Date(Date.now() + 86400000),
                tiposEntrada: [tipoMock],
                organizador: orgMock
            });

            const mockUsuarioRepo = {
                buscarPorId: jest.fn().mockReturnValue(compMock)
            };
            const mockEventoRepo = {
                buscarPorId: jest.fn().mockReturnValue(eventoMock)
            };
            const mockCompraRepo = {
                guardar: jest.fn().mockImplementation((compra) => {
                    compra.id = 'compra-mock-1';
                    return compra;
                })
            };

            const servicioAislado = new CompraService({
                compraRepo: mockCompraRepo,
                eventoRepo: mockEventoRepo,
                usuarioRepo: mockUsuarioRepo
            });

            // ACT: Ejecutamos el método a probar
            const resultado = servicioAislado.comprar({
                compradorId: 'comp-99',
                eventoId: 'ev-99',
                tipoEntradaId: 'te-99',
                cantidad: 2
            });

            // ASSERT: Verificamos resultados y matchers de Mocking (toHaveBeenCalled, toHaveBeenCalledWith, toHaveBeenLastCalledWith)
            expect(mockUsuarioRepo.buscarPorId).toHaveBeenCalled();
            expect(mockUsuarioRepo.buscarPorId).toHaveBeenCalledWith('comp-99');
            expect(mockEventoRepo.buscarPorId).toHaveBeenLastCalledWith('ev-99');
            expect(mockCompraRepo.guardar).toHaveBeenCalledTimes(1);
            expect(resultado.id).toBe('compra-mock-1');
            expect(resultado.total).toBe(20000);
            expect(tipoMock.cupo).toBe(8);
        });

        test('ReseniaService.calcularPromedioOrganizador usa mock de ReseniaRepository y verifica decimales con toBeCloseTo', () => {
            // ARRANGE
            const mockReseniaRepo = {
                buscarPorOrganizador: jest.fn().mockReturnValue([
                    { puntuacion: 5 },
                    { puntuacion: 4 },
                    { puntuacion: 4 }
                ])
            };
            const servicioMock = new ReseniaService({
                reseniaRepo: mockReseniaRepo,
                compraRepo: {},
                eventoRepo: {}
            });

            // ACT
            const promedio = servicioMock.calcularPromedioOrganizador('org-1');

            // ASSERT
            expect(mockReseniaRepo.buscarPorOrganizador).toHaveBeenCalled();
            expect(mockReseniaRepo.buscarPorOrganizador).toHaveBeenLastCalledWith('org-1');
            expect(promedio).toBeCloseTo(4.33, 2);
        });
    });

    describe('CompraService — Flujos Principales y Alternativos', () => {
        test('debe calcular total = precio * cantidad y descontar el cupo al comprar', () => {
            const compra = compraService.comprar({
                compradorId: 'comp-1',
                eventoId: 'ev-1',
                tipoEntradaId: 'te-2',
                cantidad: 3
            });

            expect(compra.total).toBe(28000 * 3);
            expect(compra.estado).toBe(EstadoCompra.PENDIENTE);

            const evento = eventoRepo.buscarPorId('ev-1');
            const tipo = evento.tiposEntrada.find((t) => t.id === 'te-2');
            expect(tipo.cupo).toBe(17);
        });

        test('no se puede comprar más que el cupo disponible (error 409) ni con datos inexistentes (404/400)', () => {
            // Cupo insuficiente (409)
            expect(() =>
                compraService.comprar({
                    compradorId: 'comp-1',
                    eventoId: 'ev-1',
                    tipoEntradaId: 'te-3',
                    cantidad: 3
                })
            ).toThrow(/No hay cupo suficiente/);

            // Comprador inexistente (404)
            expect(() =>
                compraService.comprar({
                    compradorId: 'inexistente',
                    eventoId: 'ev-1',
                    tipoEntradaId: 'te-1',
                    cantidad: 1
                })
            ).toThrow(/Comprador no encontrado/);

            // Evento inexistente (404)
            expect(() =>
                compraService.comprar({
                    compradorId: 'comp-1',
                    eventoId: 'inexistente',
                    tipoEntradaId: 'te-1',
                    cantidad: 1
                })
            ).toThrow(/Evento no encontrado/);

            // Cantidad inválida (400)
            expect(() =>
                compraService.comprar({
                    compradorId: 'comp-1',
                    eventoId: 'ev-1',
                    tipoEntradaId: 'te-1',
                    cantidad: -2
                })
            ).toThrow(/entero mayor a 0/);

            // Tipo de entrada inexistente (404)
            expect(() =>
                compraService.comprar({
                    compradorId: 'comp-1',
                    eventoId: 'ev-1',
                    tipoEntradaId: 'te-inexistente',
                    cantidad: 1
                })
            ).toThrow(/Tipo de entrada no encontrado/);
        });

        test('al cancelar una compra CONFIRMADA pasa a REEMBOLSADA y restituye el cupo', () => {
            const cancelada = compraService.cancelar({
                compraId: 'compra-1',
                usuarioId: 'comp-1'
            });

            expect(cancelada.estado).toBe(EstadoCompra.REEMBOLSADA);
            const evento = eventoRepo.buscarPorId('ev-1');
            expect(evento.tiposEntrada[0].cupo).toBe(50);
        });

        test('al cancelar una compra PENDIENTE pasa a CANCELADA y luego el organizador puede reembolsarla', () => {
            const cancelada = compraService.cancelar({
                compraId: 'compra-2',
                usuarioId: 'comp-1'
            });

            expect(cancelada.estado).toBe(EstadoCompra.CANCELADA);
            const evento = eventoRepo.buscarPorId('ev-3');
            expect(evento.tiposEntrada[1].cupo).toBe(50);

            // El organizador de ev-3 (org-2) la pasa de CANCELADA a REEMBOLSADA
            const reembolsada = compraService.cambiarEstado({
                compraId: 'compra-2',
                nuevoEstado: EstadoCompra.REEMBOLSADA,
                usuarioId: 'org-2'
            });
            expect(reembolsada.estado).toBe(EstadoCompra.REEMBOLSADA);
        });

        test('valida permisos y estados inválidos al cancelar o cambiar estado (403, 404, 409)', () => {
            // No se puede cancelar una compra UTILIZADA (409)
            expect(() =>
                compraService.cancelar({
                    compraId: 'compra-4',
                    usuarioId: 'comp-1'
                })
            ).toThrow(/No se puede cancelar una compra ya utilizada/);

            // No se puede cancelar una compra ya cancelada (409)
            expect(() =>
                compraService.cancelar({
                    compraId: 'compra-7',
                    usuarioId: 'comp-4'
                })
            ).toThrow(/ya se encuentra cancelada/);

            // Otro comprador no puede cancelar compra ajena (403)
            expect(() =>
                compraService.cancelar({
                    compraId: 'compra-1',
                    usuarioId: 'comp-2'
                })
            ).toThrow(/Solo el comprador puede cancelar/);

            // Usuario inexistente al cancelar (404)
            expect(() =>
                compraService.cancelar({
                    compraId: 'compra-1',
                    usuarioId: 'no-existe'
                })
            ).toThrow(/Usuario no encontrado/);

            // Compra inexistente (404)
            expect(() => compraService.obtenerPorId('no-existe')).toThrow(/Compra no encontrada/);

            // No se puede cancelar si el evento ya se realizó (409)
            const fechaFutura = new Date();
            fechaFutura.setDate(fechaFutura.getDate() + 60);
            expect(() =>
                compraService.cancelar({
                    compraId: 'compra-1',
                    usuarioId: 'comp-1',
                    fechaActual: fechaFutura
                })
            ).toThrow(/el evento ya se realizó/);
        });

        test('cambiarEstado valida permisos para CONFIRMADA, UTILIZADA y CANCELADA', () => {
            // Un tercero (comp-2) no puede confirmar compra-2 (de comp-1 en ev-3 de org-2) -> 403
            expect(() =>
                compraService.cambiarEstado({
                    compraId: 'compra-2',
                    nuevoEstado: EstadoCompra.CONFIRMADA,
                    usuarioId: 'comp-2'
                })
            ).toThrow(/No tenés permiso para confirmar/);

            // El comprador (comp-1) sí puede confirmar compra-2
            const confirmada = compraService.cambiarEstado({
                compraId: 'compra-2',
                nuevoEstado: EstadoCompra.CONFIRMADA,
                usuarioId: 'comp-1'
            });
            expect(confirmada.estado).toBe(EstadoCompra.CONFIRMADA);

            // Solo el organizador puede marcar UTILIZADA
            expect(() =>
                compraService.cambiarEstado({
                    compraId: 'compra-1',
                    nuevoEstado: EstadoCompra.UTILIZADA,
                    usuarioId: 'comp-1'
                })
            ).toThrow(/Solo el organizador/);

            const utilizada = compraService.cambiarEstado({
                compraId: 'compra-1',
                nuevoEstado: EstadoCompra.UTILIZADA,
                usuarioId: 'org-1'
            });
            expect(utilizada.estado).toBe(EstadoCompra.UTILIZADA);

            // Transición inválida desde UTILIZADA (409)
            expect(() =>
                compraService.cambiarEstado({
                    compraId: 'compra-1',
                    nuevoEstado: EstadoCompra.PENDIENTE,
                    usuarioId: 'org-1'
                })
            ).toThrow(/Transición de estado inválida/);

            // cambiarEstado hacia CANCELADA delega en cancelar()
            const nueva = compraService.comprar({
                compradorId: 'comp-1',
                eventoId: 'ev-1',
                tipoEntradaId: 'te-1',
                cantidad: 1
            });
            const canceladaViaCambio = compraService.cambiarEstado({
                compraId: nueva.id,
                nuevoEstado: EstadoCompra.CANCELADA,
                usuarioId: 'comp-1'
            });
            expect(canceladaViaCambio.estado).toBe(EstadoCompra.CANCELADA);
        });

        test('listarPorComprador y listarPorEvento devuelven compras y cupos disponibles', () => {
            const misCompras = compraService.listarPorComprador('comp-1');
            expect(misCompras).toHaveLength(3);

            const panelOrg = compraService.listarPorEvento({
                eventoId: 'ev-1',
                organizadorId: 'org-1'
            });
            expect(panelOrg.compras).toHaveLength(1);
            expect(panelOrg.cuposRestantes).toHaveLength(3);

            // Organizador ajeno recibe 403
            expect(() =>
                compraService.listarPorEvento({
                    eventoId: 'ev-1',
                    organizadorId: 'org-2'
                })
            ).toThrow(/Solo el organizador de este evento/);

            // Evento inexistente recibe 404
            expect(() =>
                compraService.listarPorEvento({
                    eventoId: 'inexistente',
                    organizadorId: 'org-1'
                })
            ).toThrow(/Evento no encontrado/);
        });
    });

    describe('ReseniaService', () => {
        test('solo se puede reseñar una compra UTILIZADA y una sola vez, validando comprador y datos', () => {
            // Compra inexistente (404)
            expect(() =>
                reseniaService.crearResenia({
                    compradorId: 'comp-1',
                    compraId: 'no-existe',
                    puntuacion: 5,
                    detalle: 'Excelente'
                })
            ).toThrow(/Compra no encontrada/);

            // Comprador que no es dueño de la compra (403)
            expect(() =>
                reseniaService.crearResenia({
                    compradorId: 'comp-2',
                    compraId: 'compra-4',
                    puntuacion: 5,
                    detalle: 'Intento calificar compra ajena'
                })
            ).toThrow(/Solo el comprador titular/);

            // Intentar reseñar compra-1 (CONFIRMADA, no UTILIZADA) -> falla 409
            expect(() =>
                reseniaService.crearResenia({
                    compradorId: 'comp-1',
                    compraId: 'compra-1',
                    puntuacion: 5,
                    detalle: 'Quiero calificar antes de ir'
                })
            ).toThrow(/Solo se puede reseñar una compra en estado UTILIZADA/);

            // Puntuación fuera de rango (400) y detalle vacío (400)
            expect(() =>
                reseniaService.crearResenia({
                    compradorId: 'comp-1',
                    compraId: 'compra-4',
                    puntuacion: 10,
                    detalle: 'Puntaje inválido'
                })
            ).toThrow(/entre 1 y 5/);

            expect(() =>
                reseniaService.crearResenia({
                    compradorId: 'comp-1',
                    compraId: 'compra-4',
                    puntuacion: 5,
                    detalle: '   '
                })
            ).toThrow(/comentario de la reseña es obligatorio/);

            // Reseñar compra-4 (UTILIZADA y sin reseña previa) -> éxito
            const resenia = reseniaService.crearResenia({
                compradorId: 'comp-1',
                compraId: 'compra-4',
                puntuacion: 4,
                detalle: 'Muy lindo espectáculo de cuerdas'
            });
            expect(resenia.id).toBeDefined();
            expect(resenia.puntuacion).toBe(4);

            // Intentar reseñar compra-4 por segunda vez -> falla 409
            expect(() =>
                reseniaService.crearResenia({
                    compradorId: 'comp-1',
                    compraId: 'compra-4',
                    puntuacion: 5,
                    detalle: 'Segunda reseña repetida'
                })
            ).toThrow(/Ya realizaste una reseña/);

            expect(reseniaService.calcularPromedioOrganizador('org-1')).toBe(4.5);
            expect(reseniaService.listarPorEvento('ev-7')).toHaveLength(2);
            expect(reseniaService.listarPorOrganizador('org-1')).toHaveLength(2);
        });
    });

    describe('EventoService', () => {
        test('debe filtrar por texto, categoría, rango de precios y ordenar por precio, fecha y puntaje', () => {
            // Filtro por categoría y rango de precios (CU-01 y CU-14)
            const filtrados = eventoService.listarEventos({
                texto: 'rock',
                categoriaId: 'cat-1',
                minPrecio: 10000,
                maxPrecio: 20000
            });
            expect(filtrados).toHaveLength(1);
            expect(filtrados[0].id).toBe('ev-1');

            const porPrecio = eventoService.listarEventos({ orden: 'precio' });
            for (let i = 1; i < porPrecio.length; i++) {
                expect(porPrecio[i].precioMinimo()).toBeGreaterThanOrEqual(
                    porPrecio[i - 1].precioMinimo()
                );
            }

            const porFecha = eventoService.listarEventos({ orden: 'fecha' });
            for (let i = 1; i < porFecha.length; i++) {
                expect(porFecha[i].fecha.getTime()).toBeGreaterThanOrEqual(
                    porFecha[i - 1].fecha.getTime()
                );
            }

            const porPuntaje = eventoService.listarEventos({ orden: 'puntaje' });
            expect(porPuntaje[0].organizador.id).toBe('org-1');
            expect(porPuntaje[porPuntaje.length - 1].organizador.id).toBe('org-3');
        });

        test('debe crear un evento nuevo y validar errores de creación (400/404)', () => {
            const nuevo = eventoService.crearEvento({
                organizadorId: 'org-3',
                nombre: 'Workshop de Testing con Jest',
                descripcion: 'Taller práctico de pruebas unitarias e integración',
                categoriaId: 'cat-4',
                fecha: new Date(Date.now() + 86400000 * 10),
                tiposEntrada: [
                    { nombre: 'General', precio: 5000, cupo: 30 },
                    { nombre: 'Con Certificado', descripcion: 'Incluye diploma', precio: 9000, cupo: 15 }
                ]
            });

            expect(nuevo.id).toBeDefined();
            expect(nuevo.tiposEntrada).toHaveLength(2);
            expect(nuevo.precioMinimo()).toBe(5000);
            expect(eventoService.listarPorOrganizador('org-3')).toContain(nuevo);

            // Validaciones de error en crearEvento
            expect(() =>
                eventoService.crearEvento({
                    organizadorId: 'no-existe',
                    nombre: 'Ev',
                    descripcion: 'Desc',
                    categoriaId: 'cat-1',
                    fecha: new Date(),
                    tiposEntrada: [{ nombre: 'Gen', precio: 100, cupo: 10 }]
                })
            ).toThrow(/Organizador no encontrado/);

            expect(() =>
                eventoService.crearEvento({
                    organizadorId: 'org-1',
                    nombre: 'Ev',
                    descripcion: 'Desc',
                    categoriaId: 'no-existe',
                    fecha: new Date(),
                    tiposEntrada: [{ nombre: 'Gen', precio: 100, cupo: 10 }]
                })
            ).toThrow(/Categoría no encontrada/);

            expect(() =>
                eventoService.crearEvento({
                    organizadorId: 'org-1',
                    nombre: '',
                    descripcion: 'Desc',
                    categoriaId: 'cat-1',
                    fecha: new Date(),
                    tiposEntrada: [{ nombre: 'Gen', precio: 100, cupo: 10 }]
                })
            ).toThrow(/obligatorios/);

            expect(() =>
                eventoService.crearEvento({
                    organizadorId: 'org-1',
                    nombre: 'Ev',
                    descripcion: 'Desc',
                    categoriaId: 'cat-1',
                    fecha: 'fecha-invalida',
                    tiposEntrada: [{ nombre: 'Gen', precio: 100, cupo: 10 }]
                })
            ).toThrow(/fecha del evento no es válida/);

            expect(() =>
                eventoService.crearEvento({
                    organizadorId: 'org-1',
                    nombre: 'Ev',
                    descripcion: 'Desc',
                    categoriaId: 'cat-1',
                    fecha: new Date(),
                    tiposEntrada: []
                })
            ).toThrow(/al menos un tipo de entrada/);

            expect(() =>
                eventoService.crearEvento({
                    organizadorId: 'org-1',
                    nombre: 'Ev',
                    descripcion: 'Desc',
                    categoriaId: 'cat-1',
                    fecha: new Date(),
                    tiposEntrada: [{ nombre: 'Gen', precio: -10, cupo: 0 }]
                })
            ).toThrow(/nombre, precio >= 0 y cupo > 0/);
        });

        test('debe gestionar favoritos de un usuario (agregarFavorito y quitarFavorito)', () => {
            // comp-2 agrega ev-2 a favoritos
            const favs = eventoService.agregarFavorito('comp-2', 'ev-2');
            expect(favs).toHaveLength(1);
            // Si lo vuelve a agregar, no se duplica
            eventoService.agregarFavorito('comp-2', 'ev-2');
            expect(usuarioRepo.buscarPorId('comp-2').favoritos).toHaveLength(1);

            // Quitar de favoritos
            const favsDespues = eventoService.quitarFavorito('comp-2', 'ev-2');
            expect(favsDespues).toHaveLength(0);

            expect(() => eventoService.agregarFavorito('no-existe', 'ev-1')).toThrow(
                /Usuario no encontrado/
            );
            expect(() => eventoService.quitarFavorito('no-existe', 'ev-1')).toThrow(
                /Usuario no encontrado/
            );
            expect(() => eventoService.obtenerPorId('no-existe')).toThrow(/Evento no encontrado/);
        });
    });

    describe('MensajeService', () => {
        test('permite enviar y listar mensajes al comprador y al organizador, pero rechaza a terceros o datos inválidos', () => {
            const msgComprador = mensajeService.agregarMensaje({
                compraId: 'compra-1',
                usuarioId: 'comp-1',
                mensaje: '¿Se puede ingresar con mochila?'
            });
            expect(msgComprador.mensaje).toMatch(/mochila/);

            const msgOrganizador = mensajeService.agregarMensaje({
                compraId: 'compra-1',
                usuarioId: 'org-1',
                mensaje: 'Sí, hay guardarropas en la entrada.'
            });
            expect(msgOrganizador.usuario.id).toBe('org-1');

            const historial = mensajeService.listarMensajes({
                compraId: 'compra-1',
                usuarioId: 'comp-1'
            });
            expect(historial).toHaveLength(4); // 2 del seed + 2 nuevos

            // Un usuario ajeno (comp-2) no puede chatear ni leer mensajes en compra-1 (403)
            expect(() =>
                mensajeService.agregarMensaje({
                    compraId: 'compra-1',
                    usuarioId: 'comp-2',
                    mensaje: 'Soy un intruso'
                })
            ).toThrow(/Solo el comprador o el organizador/);

            expect(() =>
                mensajeService.listarMensajes({
                    compraId: 'compra-1',
                    usuarioId: 'comp-2'
                })
            ).toThrow(/Solo el comprador o el organizador/);

            // Errores 404 y 400
            expect(() =>
                mensajeService.agregarMensaje({
                    compraId: 'no-existe',
                    usuarioId: 'comp-1',
                    mensaje: 'Hola'
                })
            ).toThrow(/Compra no encontrada/);

            expect(() =>
                mensajeService.agregarMensaje({
                    compraId: 'compra-1',
                    usuarioId: 'no-existe',
                    mensaje: 'Hola'
                })
            ).toThrow(/Usuario no encontrado/);

            expect(() =>
                mensajeService.agregarMensaje({
                    compraId: 'compra-1',
                    usuarioId: 'comp-1',
                    mensaje: '   '
                })
            ).toThrow(/no puede estar vacío/);

            expect(() =>
                mensajeService.listarMensajes({
                    compraId: 'no-existe',
                    usuarioId: 'comp-1'
                })
            ).toThrow(/Compra no encontrada/);
        });
    });
});
