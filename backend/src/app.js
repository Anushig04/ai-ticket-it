import express from 'express';
import cors from 'cors';

import { UsuarioRepository } from './repositories/UsuarioRepository.js';
import { CategoriaRepository } from './repositories/CategoriaRepository.js';
import { EventoRepository } from './repositories/EventoRepository.js';
import { CompraRepository } from './repositories/CompraRepository.js';
import { ReseniaRepository } from './repositories/ReseniaRepository.js';

import { EventoService } from './services/EventoService.js';
import { CompraService } from './services/CompraService.js';
import { MensajeService } from './services/MensajeService.js';
import { ReseniaService } from './services/ReseniaService.js';
import { AuthService } from './services/AuthService.js';

import { EventoController } from './controllers/EventoController.js';
import { CompraController } from './controllers/CompraController.js';
import { ReseniaController } from './controllers/ReseniaController.js';
import { AuthController } from './controllers/AuthController.js';

import { cargarSeed } from './config/seed.js';
import { extraerUsuarioActual } from './middlewares/usuarioActual.js';
import { auditLogger } from './middlewares/auditLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { crearRouter } from './routes/index.js';

export function crearApp({ inicializarSeed = true } = {}) {
    const app = express();
    app.disable('x-powered-by');

    // Registro centralizado de auditoría HTTP (Accounting - AAA)
    app.use(auditLogger);

    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(extraerUsuarioActual);

    // 1. Repositorios en memoria
    const usuarioRepo = new UsuarioRepository();
    const categoriaRepo = new CategoriaRepository();
    const eventoRepo = new EventoRepository();
    const compraRepo = new CompraRepository();
    const reseniaRepo = new ReseniaRepository();

    if (inicializarSeed) {
        cargarSeed({
            usuarioRepo,
            categoriaRepo,
            eventoRepo,
            compraRepo,
            reseniaRepo
        });
    }

    // 2. Services
    const reseniaService = new ReseniaService({ reseniaRepo, compraRepo, eventoRepo });
    const eventoService = new EventoService({
        eventoRepo,
        categoriaRepo,
        usuarioRepo,
        reseniaService
    });
    const compraService = new CompraService({ compraRepo, eventoRepo, usuarioRepo });
    const mensajeService = new MensajeService({ compraRepo, usuarioRepo });
    const authService = new AuthService({ usuarioRepo });

    // 3. Controllers
    const eventoController = new EventoController({
        eventoService,
        compraService,
        reseniaService,
        categoriaRepo,
        usuarioRepo
    });
    const compraController = new CompraController({
        compraService,
        mensajeService,
        reseniaService
    });
    const reseniaController = new ReseniaController({ reseniaService });
    const authController = new AuthController({ authService });

    // 4. Rutas y manejo de errores
    app.use(
        crearRouter({
            eventoController,
            compraController,
            reseniaController,
            authController
        })
    );
    app.use(errorHandler);

    return app;
}
