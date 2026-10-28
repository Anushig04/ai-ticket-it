import { cargarSeed } from '../src/config/seed.js';
import { UsuarioRepository } from '../src/repositories/UsuarioRepository.js';
import { CategoriaRepository } from '../src/repositories/CategoriaRepository.js';
import { EventoRepository } from '../src/repositories/EventoRepository.js';
import { CompraRepository } from '../src/repositories/CompraRepository.js';
import { ReseniaRepository } from '../src/repositories/ReseniaRepository.js';
import { EstadoCompra } from '../src/domain/EstadoCompra.js';
import { Categoria } from '../src/domain/Categoria.js';
import { Usuario } from '../src/domain/Usuario.js';

describe('Fase 2 — Seed y Repositorios en Memoria', () => {
    let usuarioRepo;
    let categoriaRepo;
    let eventoRepo;
    let compraRepo;
    let reseniaRepo;
    let datos;

    beforeEach(() => {
        usuarioRepo = new UsuarioRepository();
        categoriaRepo = new CategoriaRepository();
        eventoRepo = new EventoRepository();
        compraRepo = new CompraRepository();
        reseniaRepo = new ReseniaRepository();

        datos = cargarSeed({
            usuarioRepo,
            categoriaRepo,
            eventoRepo,
            compraRepo,
            reseniaRepo
        });
    });

    test('debe cargar las cantidades mínimas requeridas por el enunciado', () => {
        expect(datos.usuarios).toHaveLength(7); // 3 organizadores + 4 compradores
        expect(datos.categorias).toHaveLength(5); // Recital, Teatro, Festival, Conferencia, Deportes
        expect(datos.eventos).toHaveLength(8);
        expect(datos.compras).toHaveLength(7);
        expect(datos.resenias).toHaveLength(2);

        // Cada evento tiene entre 2 y 3 tipos de entrada
        datos.eventos.forEach((evento) => {
            expect(evento.tiposEntrada.length).toBeGreaterThanOrEqual(2);
            expect(evento.tiposEntrada.length).toBeLessThanOrEqual(3);
        });
    });

    test('debe incluir compras en todos los estados (PENDIENTE, CONFIRMADA, UTILIZADA, CANCELADA, REEMBOLSADA)', () => {
        const estadosPresentes = new Set(datos.compras.map((c) => c.estado));

        expect(estadosPresentes.has(EstadoCompra.PENDIENTE)).toBe(true);
        expect(estadosPresentes.has(EstadoCompra.CONFIRMADA)).toBe(true);
        expect(estadosPresentes.has(EstadoCompra.UTILIZADA)).toBe(true);
        expect(estadosPresentes.has(EstadoCompra.CANCELADA)).toBe(true);
        expect(estadosPresentes.has(EstadoCompra.REEMBOLSADA)).toBe(true);
    });

    test('debe descontar el cupo correctamente en los tipos de entrada comprados y registrar mensajes/historial', () => {
        const compraConfirmada = compraRepo.buscarPorId('compra-1');
        expect(compraConfirmada).not.toBeNull();
        expect(compraConfirmada.estado).toBe(EstadoCompra.CONFIRMADA);
        expect(compraConfirmada.mensajes).toHaveLength(2);
        expect(compraConfirmada.historialEstados).toHaveLength(1);
        expect(compraConfirmada.diasFaltantesParaEvento()).toBeGreaterThan(0);

        // El tipo de entrada te-1 tenía cupo inicial 50 y compra-1 llevó 2
        const evento1 = eventoRepo.buscarPorId('ev-1');
        expect(evento1.tiposEntrada[0].cupo).toBe(48);
    });

    test('debe permitir búsquedas específicas en EventoRepository (por texto sin tildes/mayúsculas, categoría y organizador)', () => {
        // Búsqueda ignorando mayúsculas y tildes ("acustico" -> "Noche de Rock Nacional Acústico")
        const porTexto = eventoRepo.buscarPorTexto('acustico');
        expect(porTexto).toHaveLength(1);
        expect(porTexto[0].id).toBe('ev-1');

        // Búsqueda por categoría (cat-1 = Recital -> ev-1 y ev-7)
        const porCategoria = eventoRepo.buscarPorCategoria('cat-1');
        expect(porCategoria).toHaveLength(2);

        // Búsqueda por organizador (org-1 -> ev-1, ev-2, ev-7)
        const porOrganizador = eventoRepo.buscarPorOrganizador('org-1');
        expect(porOrganizador).toHaveLength(3);
    });

    test('debe permitir búsquedas específicas en CompraRepository, ReseniaRepository y CategoriaRepository', () => {
        // Compras de Sofía (comp-1): compra-1, compra-2, compra-4
        const comprasSofia = compraRepo.buscarPorComprador('comp-1');
        expect(comprasSofia).toHaveLength(3);

        // Compras del evento ev-7: compra-3 y compra-4
        const comprasEv7 = compraRepo.buscarPorEvento('ev-7');
        expect(comprasEv7).toHaveLength(2);

        // Reseñas del organizador org-1 y por evento ev-7
        const reseniasOrg1 = reseniaRepo.buscarPorOrganizador('org-1');
        expect(reseniasOrg1).toHaveLength(1);
        expect(reseniasOrg1[0].puntuacion).toBe(5);
        expect(reseniaRepo.buscarPorEvento('ev-7')).toHaveLength(1);
        expect(reseniaRepo.buscarPorId('res-1')).not.toBeNull();
        expect(reseniaRepo.buscarPorId('inexistente')).toBeNull();

        // CategoriaRepository buscarPorNombre y buscarPorId
        const catTeatro = categoriaRepo.buscarPorNombre('teatro');
        expect(catTeatro).not.toBeNull();
        expect(catTeatro.id).toBe('cat-2');
        expect(categoriaRepo.buscarPorNombre('inexistente')).toBeNull();
        expect(categoriaRepo.buscarPorId('inexistente')).toBeNull();

        // Verificar que compra-4 (de comp-1 en ev-7) está UTILIZADA pero aún NO tiene reseña
        const reseniaExistente = reseniaRepo.buscarPorCompradorYEvento('comp-1', 'ev-7');
        expect(reseniaExistente).toBeNull();
    });

    test('debe permitir agregar sin id previo, actualizar existentes y eliminar en todos los repositorios', () => {
        // Alta sin id y actualización en CategoriaRepository
        const nuevaCat = categoriaRepo.guardar(
            new Categoria({ nombre: 'Feria', descripcion: 'Ferias y exposiciones' })
        );
        expect(nuevaCat.id).toBeDefined();
        nuevaCat.descripcion = 'Ferias gastronómicas';
        categoriaRepo.guardar(nuevaCat);
        expect(categoriaRepo.buscarPorId(nuevaCat.id).descripcion).toBe('Ferias gastronómicas');
        expect(categoriaRepo.eliminar(nuevaCat.id)).toBe(true);
        expect(categoriaRepo.eliminar('no-existe')).toBe(false);

        // Alta sin id, actualización y eliminación en UsuarioRepository
        const nuevoUser = usuarioRepo.guardar(
            new Usuario({ nombre: 'Juan', apellido: 'Gómez' })
        );
        expect(nuevoUser.id).toBeDefined();
        nuevoUser.apellido = 'Gómez Editado';
        usuarioRepo.guardar(nuevoUser);
        expect(usuarioRepo.buscarPorId(nuevoUser.id).apellido).toBe('Gómez Editado');
        expect(usuarioRepo.eliminar(nuevoUser.id)).toBe(true);
        expect(usuarioRepo.eliminar('no-existe')).toBe(false);

        // Eliminación en EventoRepository, CompraRepository y ReseniaRepository
        expect(eventoRepo.eliminar('ev-8')).toBe(true);
        expect(eventoRepo.eliminar('no-existe')).toBe(false);

        expect(compraRepo.eliminar('compra-7')).toBe(true);
        expect(compraRepo.eliminar('no-existe')).toBe(false);

        expect(reseniaRepo.eliminar('res-2')).toBe(true);
        expect(reseniaRepo.eliminar('no-existe')).toBe(false);
    });
});
