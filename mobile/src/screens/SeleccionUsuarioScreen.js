import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { obtenerUsuarios } from '../api/eventos';
import { API_BASE_URL } from '../api/client';
import { useUsuario } from '../context/UsuarioContext';
import { colors, obtenerIniciales, colorPorId } from '../theme/colors';

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
                    const iniciales = obtenerIniciales(`${item.nombre} ${item.apellido}`);
                    const avatarColor = colorPorId(item.id);

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.8}
                            onPress={() => seleccionarUsuario(item)}
                        >
                            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                                <Text style={styles.avatarTexto}>{iniciales}</Text>
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.rolDestacado}>
                                    {esOrg ? 'Organizador de eventos' : 'Comprador'}
                                </Text>
                                <Text style={styles.nombre} numberOfLines={1}>
                                    {item.nombre} {item.apellido}
                                </Text>
                                <View style={styles.filaInferior}>
                                    <View
                                        style={[
                                            styles.badge,
                                            esOrg ? styles.badgeOrg : styles.badgeComp
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.badgeTexto,
                                                esOrg ? styles.badgeTextoOrg : styles.badgeTextoComp
                                            ]}
                                        >
                                            {esOrg ? 'Organizador' : 'Comprador'}
                                        </Text>
                                    </View>
                                </View>
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
        marginBottom: 20
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        minHeight: 84
    },
    avatar: {
        width: 72,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarTexto: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600'
    },
    cardBody: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        justifyContent: 'center'
    },
    rolDestacado: {
        fontSize: 12,
        color: colors.accent,
        marginBottom: 2
    },
    nombre: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 6
    },
    filaInferior: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
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