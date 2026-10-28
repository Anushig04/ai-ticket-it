import { Usuario } from '../domain/Usuario.js';
import { Categoria } from '../domain/Categoria.js';
import { TipoEntrada } from '../domain/TipoEntrada.js';
import { Evento } from '../domain/Evento.js';
import { Compra } from '../domain/Compra.js';
import { Resenia } from '../domain/Resenia.js';
import { EstadoCompra } from '../domain/EstadoCompra.js';

export function cargarSeed({
    usuarioRepo,
    categoriaRepo,
    eventoRepo,
    compraRepo,
    reseniaRepo
}) {
    usuarioRepo.limpiar();
    categoriaRepo.limpiar();
    eventoRepo.limpiar();
    compraRepo.limpiar();
    reseniaRepo.limpiar();

    // 1. USUARIOS: 3 Organizadores y 4 Compradores
    const org1 = usuarioRepo.guardar(new Usuario({ id: 'org-1', nombre: 'Lucía', apellido: 'Méndez (Prod. Indie)' }));
    const org2 = usuarioRepo.guardar(new Usuario({ id: 'org-2', nombre: 'Martín', apellido: 'Gómez (Estadio Live)' }));
    const org3 = usuarioRepo.guardar(new Usuario({ id: 'org-3', nombre: 'Carolina', apellido: 'Soler (Tech & Arte)' }));

    const comp1 = usuarioRepo.guardar(new Usuario({ id: 'comp-1', nombre: 'Sofía', apellido: 'Pérez' }));
    const comp2 = usuarioRepo.guardar(new Usuario({ id: 'comp-2', nombre: 'Mateo', apellido: 'Rodríguez' }));
    const comp3 = usuarioRepo.guardar(new Usuario({ id: 'comp-3', nombre: 'Valentina', apellido: 'López' }));
    const comp4 = usuarioRepo.guardar(new Usuario({ id: 'comp-4', nombre: 'Lucas', apellido: 'Fernández' }));

    // 2. CATEGORÍAS (5)
    const catRecital = categoriaRepo.guardar(new Categoria({ id: 'cat-1', nombre: 'Recital', descripcion: 'Shows musicales en vivo de bandas y solistas' }));
    const catTeatro = categoriaRepo.guardar(new Categoria({ id: 'cat-2', nombre: 'Teatro', descripcion: 'Obras teatrales, musicales y stand-up' }));
    const catFestival = categoriaRepo.guardar(new Categoria({ id: 'cat-3', nombre: 'Festival', descripcion: 'Eventos de múltiples escenarios y jornadas' }));
    const catConferencia = categoriaRepo.guardar(new Categoria({ id: 'cat-4', nombre: 'Conferencia', descripcion: 'Charlas, congresos y workshops de tecnología y negocios' }));
    const catDeportes = categoriaRepo.guardar(new Categoria({ id: 'cat-5', nombre: 'Deportes', descripcion: 'Torneos, partidos y exhibiciones deportivas' }));

    // Helper para fechas relativas a hoy (así nunca quedan desactualizadas)
    const diasDesdeHoy = (dias) => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + dias);
        return fecha;
    };

    // 3. EVENTOS (8 eventos con 2-3 tipos de entrada cada uno)
    const ev1 = eventoRepo.guardar(new Evento({
        id: 'ev-1',
        nombre: 'Noche de Rock Nacional Acústico',
        descripcion: 'Un recital íntimo repasando los grandes clásicos del rock argentino.',
        categoria: catRecital,
        fecha: diasDesdeHoy(15),
        organizador: org1,
        multimedia: ['https://picsum.photos/seed/rock/800/400'],
        tiposEntrada: [
            new TipoEntrada({ id: 'te-1', nombre: 'General', descripcion: 'Ubicación de pie en campo', precio: 15000, cupo: 50 }),
            new TipoEntrada({ id: 'te-2', nombre: 'Platea Preferencial', descripcion: 'Butaca numerada sector central', precio: 28000, cupo: 20 }),
            new TipoEntrada({ id: 'te-3', nombre: 'VIP Meet & Greet', descripcion: 'Primera fila + acceso a prueba de sonido', precio: 45000, cupo: 2 }) // Cupo bajo para probar falta de cupo
        ]
    }));

    const ev2 = eventoRepo.guardar(new Evento({
        id: 'ev-2',
        nombre: 'Hamlet en el Siglo XXI',
        descripcion: 'Reinterpretación moderna de la clásica tragedia de Shakespeare.',
        categoria: catTeatro,
        fecha: diasDesdeHoy(8),
        organizador: org1,
        multimedia: ['https://picsum.photos/seed/teatro/800/400'],
        tiposEntrada: [
            new TipoEntrada({ id: 'te-4', nombre: 'Pullman', descripcion: 'Planta alta con buena visibilidad', precio: 12000, cupo: 40 }),
            new TipoEntrada({ id: 'te-5', nombre: 'Platea Baja', descripcion: 'Cerca del escenario', precio: 22000, cupo: 15 })
        ]
    }));

    const ev3 = eventoRepo.guardar(new Evento({
        id: 'ev-3',
        nombre: 'Sunset Indie Fest 2026',
        descripcion: 'Festival al aire libre con más de 12 bandas emergentes y foodtrucks.',
        categoria: catFestival,
        fecha: diasDesdeHoy(30),
        organizador: org2,
        multimedia: ['https://picsum.photos/seed/fest/800/400'],
        tiposEntrada: [
            new TipoEntrada({ id: 'te-6', nombre: 'Abono Día 1', descripcion: 'Acceso general jornada sábado', precio: 35000, cupo: 100 }),
            new TipoEntrada({ id: 'te-7', nombre: 'Abono Full 2 Días', descripcion: 'Acceso sábado y domingo', precio: 60000, cupo: 50 }),
            new TipoEntrada({ id: 'te-8', nombre: 'VIP Lounge 2 Días', descripcion: 'Sector exclusivo con terraza y barra libre', precio: 110000, cupo: 10 })
        ]
    }));

    const ev4 = eventoRepo.guardar(new Evento({
        id: 'ev-4',
        nombre: 'AI & Cloud Dev Summit',
        descripcion: 'Conferencia sobre desarrollo de software asistido por Inteligencia Artificial y arquitectura cloud.',
        categoria: catConferencia,
        fecha: diasDesdeHoy(20),
        organizador: org3,
        multimedia: ['https://picsum.photos/seed/conf/800/400'],
        tiposEntrada: [
            new TipoEntrada({ id: 'te-9', nombre: 'Entrada Estudiante', descripcion: 'Acceso a todas las charlas del auditorio', precio: 8000, cupo: 80 }),
            new TipoEntrada({ id: 'te-10', nombre: 'Pase Full + Workshops', descripcion: 'Incluye talleres prácticos y almuerzo', precio: 25000, cupo: 25 })
        ]
    }));

    const ev5 = eventoRepo.guardar(new Evento({
        id: 'ev-5',
        nombre: 'Final Torneo Metropolitano de Básquet',
        descripcion: 'Definición mano a mano por la copa anual de la liga metropolitana.',
        categoria: catDeportes,
        fecha: diasDesdeHoy(5),
        organizador: org2,
        multimedia: ['https://picsum.photos/seed/basket/800/400'],
        tiposEntrada: [
            new TipoEntrada({ id: 'te-11', nombre: 'Popular Cabecera', descripcion: 'Tribuna general sin numerar', precio: 10000, cupo: 120 }),
            new TipoEntrada({ id: 'te-12', nombre: 'Platea Lateral', descripcion: 'Asiento numerado lateral', precio: 20000, cupo: 40 }),
            new TipoEntrada({ id: 'te-13', nombre: 'Palco Courtside', descripcion: 'A metros de la cancha', precio: 50000, cupo: 6 })
        ]
    }));

    const ev6 = eventoRepo.guardar(new Evento({
        id: 'ev-6',
        nombre: 'Stand-Up: Risas de Medianoche',
        descripcion: 'Show de comedia en vivo con tres comediantes invitados.',
        categoria: catTeatro,
        fecha: diasDesdeHoy(12),
        organizador: org3,
        multimedia: ['https://picsum.photos/seed/standup/800/400'],
        tiposEntrada: [
            new TipoEntrada({ id: 'te-14', nombre: 'Mesa General', descripcion: 'Ubicación compartida por orden de llegada', precio: 9500, cupo: 35 }),
            new TipoEntrada({ id: 'te-15', nombre: 'Mesa Preferencial', descripcion: 'Sector delantero exclusivo', precio: 16000, cupo: 10 })
        ]
    }));

    // Eventos pasados (para probar reseñas e imposibilidad de cancelar eventos realizados)
    const ev7 = eventoRepo.guardar(new Evento({
        id: 'ev-7',
        nombre: 'Sinfónica Pop a la Luz de las Velas',
        descripcion: 'Orquesta de cámara interpretando hits internacionales.',
        categoria: catRecital,
        fecha: diasDesdeHoy(-10), // Ya ocurrió hace 10 días
        organizador: org1,
        multimedia: ['https://picsum.photos/seed/velas/800/400'],
        tiposEntrada: [
            new TipoEntrada({ id: 'te-16', nombre: 'Sector B', descripcion: 'Visibilidad media', precio: 18000, cupo: 30 }),
            new TipoEntrada({ id: 'te-17', nombre: 'Sector A', descripcion: 'Frente al cuarteto de cuerdas', precio: 30000, cupo: 15 })
        ]
    }));

    const ev8 = eventoRepo.guardar(new Evento({
        id: 'ev-8',
        nombre: ' exhibición Internacional de Tenis',
        descripcion: 'Partido exhibición entre figuras del circuito profesional.',
        categoria: catDeportes,
        fecha: diasDesdeHoy(-5), // Ya ocurrió hace 5 días
        organizador: org2,
        multimedia: ['https://picsum.photos/seed/tenis/800/400'],
        tiposEntrada: [
            new TipoEntrada({ id: 'te-18', nombre: 'Codo Alto', descripcion: 'Bandeja superior', precio: 22000, cupo: 60 }),
            new TipoEntrada({ id: 'te-19', nombre: 'Platea Baja', descripcion: 'Bandeja inferior', precio: 42000, cupo: 25 })
        ]
    }));

    // Favoritos de prueba para comp1
    comp1.agregarFavorito(ev1);
    comp1.agregarFavorito(ev3);

    // 4. COMPRAS EN DISTINTOS ESTADOS + HISTORIAL + MENSAJES
    // Compra 1: CONFIRMADA en evento futuro (para ver "faltan 15 días", chatear o cancelar con reembolso)
    const compra1 = new Compra({
        id: 'compra-1',
        comprador: comp1,
        evento: ev1,
        tipoEntrada: ev1.tiposEntrada[0],
        cantidad: 2
    });
    ev1.tiposEntrada[0].descontarCupo(2);
    compra1.actualizarEstado(EstadoCompra.CONFIRMADA, comp1, diasDesdeHoy(-2));
    compra1.agregarMensaje({
        id: 'msg-1',
        usuario: comp1,
        mensaje: '¡Hola! ¿A qué hora abren las puertas del teatro?',
        enviado: diasDesdeHoy(-1)
    });
    compra1.agregarMensaje({
        id: 'msg-2',
        usuario: org1,
        mensaje: '¡Hola Sofía! Las puertas abren 20:00 hs, una hora antes del show.',
        enviado: diasDesdeHoy(-1)
    });
    compraRepo.guardar(compra1);

    // Compra 2: PENDIENTE en evento futuro (para pagar o cancelar)
    const compra2 = new Compra({
        id: 'compra-2',
        comprador: comp1,
        evento: ev3,
        tipoEntrada: ev3.tiposEntrada[1],
        cantidad: 1
    });
    ev3.tiposEntrada[1].descontarCupo(1);
    compraRepo.guardar(compra2);

    // Compra 3: UTILIZADA con reseña ya hecha (en evento pasado ev7 de org1)
    const compra3 = new Compra({
        id: 'compra-3',
        comprador: comp2,
        evento: ev7,
        tipoEntrada: ev7.tiposEntrada[1],
        cantidad: 2
    });
    ev7.tiposEntrada[1].descontarCupo(2);
    compra3.actualizarEstado(EstadoCompra.CONFIRMADA, comp2, diasDesdeHoy(-15));
    compra3.actualizarEstado(EstadoCompra.UTILIZADA, org1, diasDesdeHoy(-10));
    compraRepo.guardar(compra3);

    // Compra 4: UTILIZADA SIN reseña todavía (ideal para que comp1 pruebe dejar una reseña en vivo)
    const compra4 = new Compra({
        id: 'compra-4',
        comprador: comp1,
        evento: ev7,
        tipoEntrada: ev7.tiposEntrada[0],
        cantidad: 1
    });
    ev7.tiposEntrada[0].descontarCupo(1);
    compra4.actualizarEstado(EstadoCompra.CONFIRMADA, comp1, diasDesdeHoy(-14));
    compra4.actualizarEstado(EstadoCompra.UTILIZADA, org1, diasDesdeHoy(-10));
    compraRepo.guardar(compra4);

    // Compra 5: UTILIZADA en evento pasado ev8 de org2 (con reseña)
    const compra5 = new Compra({
        id: 'compra-5',
        comprador: comp3,
        evento: ev8,
        tipoEntrada: ev8.tiposEntrada[0],
        cantidad: 3
    });
    ev8.tiposEntrada[0].descontarCupo(3);
    compra5.actualizarEstado(EstadoCompra.CONFIRMADA, comp3, diasDesdeHoy(-8));
    compra5.actualizarEstado(EstadoCompra.UTILIZADA, org2, diasDesdeHoy(-5));
    compraRepo.guardar(compra5);

    // Compra 6: REEMBOLSADA (estaba confirmada y fue cancelada)
    const compra6 = new Compra({
        id: 'compra-6',
        comprador: comp2,
        evento: ev2,
        tipoEntrada: ev2.tiposEntrada[0],
        cantidad: 2
    });
    compra6.actualizarEstado(EstadoCompra.CONFIRMADA, comp2, diasDesdeHoy(-3));
    compra6.actualizarEstado(EstadoCompra.REEMBOLSADA, comp2, diasDesdeHoy(-1));
    compraRepo.guardar(compra6);

    // Compra 7: CANCELADA (estaba pendiente y se canceló)
    const compra7 = new Compra({
        id: 'compra-7',
        comprador: comp4,
        evento: ev4,
        tipoEntrada: ev4.tiposEntrada[0],
        cantidad: 1
    });
    compra7.actualizarEstado(EstadoCompra.CANCELADA, comp4, diasDesdeHoy(-1));
    compraRepo.guardar(compra7);

    // 5. RESEÑAS (para que org1 y org2 tengan distinto promedio y puedas probar orden por puntaje)
    reseniaRepo.guardar(new Resenia({
        id: 'res-1',
        comprador: comp2,
        evento: ev7,
        puntuacion: 5,
        detalle: 'Excelente acústica y organización impecable. Puntualidad perfecta.'
    }));

    reseniaRepo.guardar(new Resenia({
        id: 'res-2',
        comprador: comp3,
        evento: ev8,
        puntuacion: 4,
        detalle: 'Muy buen partido, aunque la fila para ingresar fue un poco lenta.'
    }));

    return {
        usuarios: usuarioRepo.listar(),
        categorias: categoriaRepo.listar(),
        eventos: eventoRepo.listar(),
        compras: compraRepo.listar(),
        resenias: reseniaRepo.listar()
    };
}