import jwt from 'jsonwebtoken';
import { DomainError } from '../errors/DomainError.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'secret_jwt_ai_ticket_it_2026';

export class AuthService {
    constructor({ usuarioRepo }) {
        this.usuarioRepo = usuarioRepo;
    }

    login({ email, password }) {
        if (!email || !password) {
            throw new DomainError('Email y contraseña son obligatorios', 400);
        }

        const emailNorm = String(email).trim().toLowerCase();
        const usuario = this.usuarioRepo.listar().find(
            (u) => u.email && u.email.toLowerCase() === emailNorm
        );

        if (!usuario || !usuario.validarPassword(password)) {
            throw new DomainError('Credenciales inválidas', 401);
        }

        const rol = String(usuario.id).startsWith('org-') ? 'organizador' : 'comprador';

        const token = jwt.sign(
            {
                sub: usuario.id,
                email: usuario.email,
                rol
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        return {
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol
            }
        };
    }

    obtenerPerfilActual(usuarioId) {
        const usuario = this.usuarioRepo.buscarPorId(usuarioId);
        if (!usuario) {
            throw new DomainError('Usuario no encontrado', 404);
        }
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol: String(usuario.id).startsWith('org-') ? 'organizador' : 'comprador',
            favoritos: usuario.favoritos
        };
    }

    generarTokenParaUsuario(usuario) {
        const rol = String(usuario.id).startsWith('org-') ? 'organizador' : 'comprador';
        return jwt.sign(
            {
                sub: usuario.id,
                email: usuario.email,
                rol
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
    }
}
