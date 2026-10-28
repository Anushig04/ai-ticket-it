export class CompraController {
    constructor({ compraService, mensajeService, reseniaService }) {
        this.compraService = compraService;
        this.mensajeService = mensajeService;
        this.reseniaService = reseniaService;
    }

    _formatearCompra(compra) {
        return {
            ...compra,
            diasFaltantes: compra.diasFaltantesParaEvento(),
            puedeCancelarse: compra.puedeCancelarse()
        };
    }

    comprar = (req, res, next) => {
        try {
            const compradorId = req.usuarioId || req.body.compradorId;
            const { eventoId, tipoEntradaId, cantidad } = req.body;
            const compra = this.compraService.comprar({
                compradorId,
                eventoId,
                tipoEntradaId,
                cantidad
            });
            res.status(201).json(this._formatearCompra(compra));
        } catch (err) {
            next(err);
        }
    };

    listarMias = (req, res, next) => {
        try {
            const compras = this.compraService.listarPorComprador(req.usuarioId);
            res.json(compras.map((c) => this._formatearCompra(c)));
        } catch (err) {
            next(err);
        }
    };

    obtenerDetalle = (req, res, next) => {
        try {
            const compra = this.compraService.obtenerPorId(req.params.id);
            res.json(this._formatearCompra(compra));
        } catch (err) {
            next(err);
        }
    };

    cambiarEstado = (req, res, next) => {
        try {
            const { estado } = req.body;
            const compra = this.compraService.cambiarEstado({
                compraId: req.params.id,
                nuevoEstado: estado,
                usuarioId: req.usuarioId
            });
            res.json(this._formatearCompra(compra));
        } catch (err) {
            next(err);
        }
    };

    cancelar = (req, res, next) => {
        try {
            const compra = this.compraService.cancelar({
                compraId: req.params.id,
                usuarioId: req.usuarioId
            });
            res.json(this._formatearCompra(compra));
        } catch (err) {
            next(err);
        }
    };

    listarMensajes = (req, res, next) => {
        try {
            const mensajes = this.mensajeService.listarMensajes({
                compraId: req.params.id,
                usuarioId: req.usuarioId
            });
            res.json(mensajes);
        } catch (err) {
            next(err);
        }
    };

    agregarMensaje = (req, res, next) => {
        try {
            const { mensaje } = req.body;
            const nuevoMensaje = this.mensajeService.agregarMensaje({
                compraId: req.params.id,
                usuarioId: req.usuarioId,
                mensaje
            });
            res.status(201).json(nuevoMensaje);
        } catch (err) {
            next(err);
        }
    };

    crearResenia = (req, res, next) => {
        try {
            const { puntuacion, detalle } = req.body;
            const resenia = this.reseniaService.crearResenia({
                compradorId: req.usuarioId,
                compraId: req.params.id,
                puntuacion,
                detalle
            });
            res.status(201).json(resenia);
        } catch (err) {
            next(err);
        }
    };
}