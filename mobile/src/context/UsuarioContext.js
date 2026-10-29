import React, { createContext, useContext, useState } from 'react';
import { setUsuarioHeader } from '../api/client';

const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
    const [usuarioActual, setUsuarioActual] = useState(null);

    const seleccionarUsuario = (usuario) => {
        setUsuarioHeader(usuario ? usuario.id : null);
        setUsuarioActual(usuario);
    };

    const cerrarSesion = () => {
        setUsuarioHeader(null);
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