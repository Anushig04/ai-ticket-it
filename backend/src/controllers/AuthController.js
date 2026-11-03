export class AuthController {
    constructor({ authService }) {
        this.authService = authService;
    }

    login = (req, res, next) => {
        try {
            const { email, password } = req.body;
            const resultado = this.authService.login({ email, password });
            res.json(resultado);
        } catch (err) {
            next(err);
        }
    };

    obtenerPerfilActual = (req, res, next) => {
        try {
            const perfil = this.authService.obtenerPerfilActual(req.usuarioId);
            res.json(perfil);
        } catch (err) {
            next(err);
        }
    };
}
