import { Platform } from 'react-native';
import Constants from 'expo-constants';

function obtenerBaseUrl() {
    // 1. Si corre en navegador web en la misma PC
    if (Platform.OS === 'web') {
        return 'http://localhost:3000';
    }
    // 2. En Expo Go en el celular, toma la IP de tu PC automáticamente desde el packager de Expo
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:3000`;
    }
    // 3. Fallback manual con la IP local de tu PC en Wi-Fi
    return 'http://192.168.1.4:3000';
}

export const API_BASE_URL = obtenerBaseUrl();

let usuarioActualId = null;

export function setUsuarioHeader(id) {
    usuarioActualId = id ? String(id) : null;
}

export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
    const configHeaders = {
        'Content-Type': 'application/json',
        ...headers
    };

    if (usuarioActualId) {
        configHeaders['x-user-id'] = usuarioActualId;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: configHeaders,
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const mensaje = data?.error || `Error HTTP ${response.status}`;
        throw new Error(mensaje);
    }

    return data;
}