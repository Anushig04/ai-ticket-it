export class ReseniaController {
    constructor({ reseniaService }) {
        this.reseniaService = reseniaService;
    }

    listarPorOrganizador = (req, res, next) => {
        try {
            const organizadorId = req.params.id;
            const resenias = this.reseniaService.listarPorOrganizador(organizadorId);
            const puntajePromedio = this.reseniaService.calcularPromedioOrganizador(organizadorId);

            res.json({
                organizadorId,
                puntajePromedio,
                cantidadResenias: resenias.length,
                resenias
            });
        } catch (err) {
            next(err);
        }
    };
}