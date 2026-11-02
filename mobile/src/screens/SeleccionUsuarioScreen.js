import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { obtenerUsuarios } from '../api/eventos';
import { API_BASE_URL } from '../api/client';
import { useUsuario } from '../context/UsuarioContext';
import { colors } from '../theme/colors';

const AVATARES_USUARIOS = {
    'org-1': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    'org-2': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    'org-3': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
    'comp-1': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    'comp-2': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    'comp-3': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    'comp-4': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80'
};

export default function SeleccionUsuarioScreen() {
    const { seleccionarUsuario } = useUsuario();
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargarUsuarios = async () => {
        try {
            setCargando(true);
            setError(null);
            const data = await obtenerUsuarios();
            setUsuarios(data);
        } catch (_err) {
            setError(
                `No se pudo conectar con ${API_BASE_URL}.\nVerificá que el back-end esté corriendo con "npm run dev".`
            );
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    if (cargando) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.subtitulo}>Conectando a {API_BASE_URL}...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centrado}>
                <Text style={styles.errorTexto}>{error}</Text>
                <TouchableOpacity style={styles.botonPrincipal} onPress={cargarUsuarios}>
                    <Text style={styles.botonPrincipalTexto}>Reintentar conexión</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.contenedor}>
            <Text style={styles.etiquetaSuperior}>ENTRADAS A UN CLICK</Text>
            <Text style={styles.titulo}>AI Ticket It</Text>
            <Text style={styles.subtitulo}>
                Elegí con qué usuario querés ingresar:
            </Text>

            <FlatList
                data={usuarios}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 28 }}
                renderItem={({ item }) => {
                    const esOrg = item.rol === 'organizador';
                    const fotoUri =
                        AVATARES_USUARIOS[item.id] ||
                        `https://i.pravatar.cc/150?u=${item.id}`;

                    return (
                        <TouchableOpacity
                            style={styles.filaChat}
                            activeOpacity={0.75}
                            onPress={() => seleccionarUsuario(item)}
                        >
                            {/* Foto circular con puntito verde tipo WhatsApp */}
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: fotoUri }}
                                    style={styles.avatarCircular}
                                />
                            </View>

                            {/* Nombre y subtítulo en el medio */}
                            <View style={styles.infoCentro}>
                                <Text style={styles.nombre} numberOfLines={1}>
                                    {item.nombre} {item.apellido}
                                </Text>
                                <Text style={styles.subtexto} numberOfLines={1}>
                                    {esOrg
                                        ? 'Publicar eventos y gestionar ventas'
                                        : 'Explorar catálogo y comprar entradas'}
                                </Text>
                            </View>

                            {/* Badge a la derecha */}
                            <View
                                style={[
                                    styles.badge,
                                    esOrg ? styles.badgeOrg : styles.badgeComp
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.badgeTexto,
                                        esOrg
                                            ? styles.badgeTextoOrg
                                            : styles.badgeTextoComp
                                    ]}
                                >
                                    {esOrg ? 'Organizador' : 'Comprador'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 18,
        paddingTop: 56
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.background
    },
    etiquetaSuperior: {
        fontSize: 11,
        letterSpacing: 1.5,
        fontWeight: '600',
        color: colors.accent,
        marginBottom: 4
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4
    },
    subtitulo: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 16
    },
    filaChat: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 14
    },
    avatarCircular: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surfaceDeep,
        borderWidth: 1.5,
        borderColor: colors.border
    },
    puntoEstado: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 13,
        height: 13,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: colors.surface
    },
    infoCentro: {
        flex: 1,
        marginRight: 10
    },
    nombre: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 3
    },
    subtexto: {
        fontSize: 13,
        color: colors.textSecondary
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    badgeComp: {
        backgroundColor: colors.estadosCompra.CONFIRMADA.bg
    },
    badgeOrg: {
        backgroundColor: colors.estadosCompra.REEMBOLSADA.bg
    },
    badgeTexto: {
        fontSize: 11,
        fontWeight: '600'
    },
    badgeTextoComp: {
        color: colors.estadosCompra.CONFIRMADA.text
    },
    badgeTextoOrg: {
        color: colors.estadosCompra.REEMBOLSADA.text
    },
    errorTexto: {
        color: colors.danger,
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 14,
        lineHeight: 20
    },
    botonPrincipal: {
        backgroundColor: colors.ticketBg,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14
    },
    botonPrincipalTexto: {
        color: colors.ticketText,
        fontWeight: '600',
        fontSize: 15
    }
});