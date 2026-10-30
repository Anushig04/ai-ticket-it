export class EventoController {
    constructor({ eventoService, compraService, reseniaService, categoriaRepo, usuarioRepo }) {
        this.eventoService = eventoService;
        this.compraService = compraService;
        this.reseniaService = reseniaService;
        this.categoriaRepo = categoriaRepo;
        this.usuarioRepo = usuarioRepo;
    }

    listarUsuarios = (_req, res, next) => {
        try {
            const usuarios = this.usuarioRepo.listar().map((u) => ({
                ...u,
                rol: String(u.id).startsWith('org-') ? 'organizador' : 'comprador'
            }));
            res.json(usuarios);
        } catch (err) {
            next(err);
        }
    };

    listarCategorias = (_req, res, next) => {
        try {
            res.json(this.categoriaRepo.listar());
        } catch (err) {
            next(err);
        }
    };

    listarEventos = (req, res, next) => {
        try {
            const { texto, categoria, minPrecio, maxPrecio, orden, organizadorId } = req.query;

            let eventos = organizadorId
                ? this.eventoService.listarPorOrganizador(organizadorId)
                : this.eventoService.listarEventos({
                      texto,
                      categoriaId: categoria,
                      minPrecio,
                      maxPrecio,
                      orden
                  });

            // Enriquecemos cada evento con precioMinimo y puntajeOrganizador para el catálogo
            const respuesta = eventos.map((e) => ({
                ...e,
                precioMinimo: e.precioMinimo(),
                puntajeOrganizador: this.reseniaService.calcularPromedioOrganizador(e.organizador.id)
            }));

            res.json(respuesta);
        } catch (err) {
            next(err);
        }
    };

    obtenerDetalle = (req, res, next) => {
        try {
            const evento = this.eventoService.obtenerPorId(req.params.id);
            const puntajeOrganizador = this.reseniaService.calcularPromedioOrganizador(
                evento.organizador.id
            );
            const reseniasOrganizador = this.reseniaService.listarPorOrganizador(
                evento.organizador.id
            );

            res.json({
                ...evento,
                precioMinimo: evento.precioMinimo(),
                puntajeOrganizador,
                reseniasOrganizador
            });
        } catch (err) {
            next(err);
        }
    };

    crearEvento = (req, res, next) => {
        try {
            const organizadorId = req.usuarioId || req.body.organizadorId;
            const nuevoEvento = this.eventoService.crearEvento({
                ...req.body,
                organizadorId
            });
            res.status(201).json(nuevoEvento);
        } catch (err) {
            next(err);
        }
    };

    listarComprasDeEvento = (req, res, next) => {
        try {
            const resultado = this.compraService.listarPorEvento({
                eventoId: req.params.id,
                organizadorId: req.usuarioId
            });
            res.json(resultado);
        } catch (err) {
            next(err);
        }
    };

    agregarFavorito = (req, res, next) => {
        try {
            const favoritos = this.eventoService.agregarFavorito(req.usuarioId, req.params.id);
            res.json(favoritos);
        } catch (err) {
            next(err);
        }
    };

    quitarFavorito = (req, res, next) => {
        try {
            const favoritos = this.eventoService.quitarFavorito(req.usuarioId, req.params.id);
            res.json(favoritos);
        } catch (err) {
            next(err);
        }
    };

    eliminarEvento = (req, res, next) => {
        try {
            const resultado = this.eventoService.eliminarEvento({
                eventoId: req.params.id,
                organizadorId: req.usuarioId
            });
            res.json(resultado);
        } catch (err) {
            next(err);
        }
    };
}