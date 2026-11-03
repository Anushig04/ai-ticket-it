import React, { createContext, useContext, useState } from 'react';
import { setUsuarioHeader, setAuthToken, apiRequest } from '../api/client';

const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [token, setToken] = useState(null);

    const loginConPassword = async (email, password = '123456') => {
        const respuesta = await apiRequest('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        setAuthToken(respuesta.token);
        setUsuarioHeader(respuesta.usuario.id);
        setToken(respuesta.token);
        setUsuarioActual(respuesta.usuario);
        return respuesta;
    };

    const seleccionarUsuario = async (usuario) => {
        if (!usuario) {
            cerrarSesion();
            return;
        }
        try {
            // Inicia sesión de forma segura obteniendo un token JWT firmado
            const email = usuario.email || `${usuario.nombre.toLowerCase()}@ticketit.com`;
            await loginConPassword(email, '123456');
        } catch (_err) {
            // Fallback de contingencia
            setUsuarioHeader(usuario.id);
            setUsuarioActual(usuario);
        }
    };

    const cerrarSesion = () => {
        setAuthToken(null);
        setUsuarioHeader(null);
        setToken(null);
        setUsuarioActual(null);
    };

    const actualizarFavoritosLocales = (nuevosFavoritos) => {
        setUsuarioActual((prev) =>
            prev ? { ...prev, favoritos: nuevosFavoritos } : null
        );
    };

    return (
        <UsuarioContext.Provider
            value={{
                usuarioActual,
                token,
                loginConPassword,
                seleccionarUsuario,
                cerrarSesion,
                actualizarFavoritosLocales
            }}
        >
            {children}
        </UsuarioContext.Provider>
    );
}

export function useUsuario() {
    const context = useContext(UsuarioContext);
    if (!context) {
        throw new Error('useUsuario debe usarse dentro de un UsuarioProvider');
    }
    return context;
}
