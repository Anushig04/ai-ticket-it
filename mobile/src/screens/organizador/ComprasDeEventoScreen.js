import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerComprasDeEvento, eliminarEventoApi } from '../../api/eventos';
import { cambiarEstadoCompra } from '../../api/compras';
import EstadoBadge from '../../components/EstadoBadge';
import { colors } from '../../theme/colors';

export default function ComprasDeEventoScreen({ route, navigation }) {
    const { eventoId } = route.params;
    const [datos, setDatos] = useState(null);
    const [compraSeleccionadaId, setCompraSeleccionadaId] = useState(null);
    const [cargando, setCargando] = useState(true);

    const cargar = useCallback(async () => {
        try {
            setCargando(true);
            const res = await obtenerComprasDeEvento(eventoId);
            setDatos(res);
            const primeraConfirmada = (res.compras || []).find(
                (c) => c.estado === 'CONFIRMADA'
            );
            setCompraSeleccionadaId(
                primeraConfirmada ? primeraConfirmada.id : null
            );
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setCargando(false);
        }
    }, [eventoId]);

    useFocusEffect(
        useCallback(() => {
            cargar();
        }, [cargar])
    );

    const handleMarcarUtilizada = async () => {
        if (!compraSeleccionadaId) return;
        try {
            await cambiarEstadoCompra(compraSeleccionadaId, 'UTILIZADA');
            Alert.alert('Ingreso validado', 'La entrada fue marcada como UTILIZADA.');
            cargar();
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    const handleEliminarEvento = () => {
        Alert.alert(
            'Eliminar evento',
            `¿Estás seguro de que querés eliminar "${ datos?.evento?.nombre }"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await eliminarEventoApi(eventoId);
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Error', err.message);
                        }
                    }
                }
            ]
        );
    };

    if (cargando || !datos) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    const { evento, compras, cuposRestantes } = datos;

    return (
        <View style={styles.contenedor}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.tituloEvento}>{evento.nombre}</Text>

                {/* Barras de cupo disponible por tipo */}
                <View style={{ marginBottom: 18 }}>
                    {cuposRestantes.map((tipo) => {
                        const vendidosActivos = compras
                            .filter(
                                (c) =>
                                    c.tipoEntrada?.id === tipo.id &&
                                    c.estado !== 'CANCELADA' &&
                                    c.estado !== 'REEMBOLSADA'
                            )
                            .reduce((acc, c) => acc + c.cantidad, 0);
                        const cupoTotal = tipo.cupoDisponible + vendidosActivos;
                        const porcentaje =
                            cupoTotal > 0
                                ? Math.round((tipo.cupoDisponible / cupoTotal) * 100)
                                : 0;

                        return (
                            <View key={tipo.id} style={styles.bloqueCupo}>
                                <View style={styles.filaCupoTexto}>
                                    <Text style={styles.nombreTipo}>
                                        {tipo.nombre}
                                    </Text>
                                    <Text style={styles.libresTexto}>
                                        {tipo.cupoDisponible} libres de {cupoTotal}
                                    </Text>
                                </View>
                                <View style={styles.barraFondo}>
                                    <View
                                        style={[
                                            styles.barraRelleno,
                                            { width: `${porcentaje}%` }
                                        ]}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Lista de compras asociadas */}
                {compras.length === 0 ? (
                    <Text style={styles.vacio}>
                        Aún no se registraron compras para este evento.
                    </Text>
                ) : (
                    compras.map((c) => {
                        const seleccionada = c.id === compraSeleccionadaId;
                        const cantMensajes = c.mensajes?.length || 0;

                        return (
                            <TouchableOpacity
                                key={c.id}
                                activeOpacity={0.8}
                                onPress={() => setCompraSeleccionadaId(c.id)}
                                style={[
                                    styles.compraCard,
                                    seleccionada && styles.compraCardSeleccionada
                                ]}
                            >
                                <View style={styles.filaSuperior}>
                                    <Text style={styles.compradorNombre}>
                                        {c.comprador?.nombre} {c.comprador?.apellido}
                                    </Text>
                                    <EstadoBadge estado={c.estado} />
                                </View>

                                <View style={styles.filaInferior}>
                                    <Text style={styles.detalleEntrada}>
                                        {c.tipoEntrada?.nombre} × {c.cantidad}
                                        {cantMensajes > 0 ? (
                                            <Text style={styles.textoMenta}>
                                                {' '}
                                                · {cantMensajes} msj
                                            </Text>
                                        ) : (
                                            ''
                                        )}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() =>
                                            navigation.navigate('CompraDetalle', {
                                                compraId: c.id
                                            })
                                        }
                                    >
                                        <Text style={styles.linkChat}>
                                            Abrir chat →
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
                <TouchableOpacity
                    style={styles.botonEditarEvento}
                    onPress={() =>
                        navigation.navigate('EditarEvento', {
                            eventoEditar: evento
                        })
                    }
                >
                    <Text style={styles.botonEditarEventoTexto}>
                        Editar evento
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.botonEliminarEvento}
                    onPress={handleEliminarEvento}
                >
                    <Text style={styles.botonEliminarEventoTexto}>
                        Eliminar evento
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.botonUtilizar,
                        !compraSeleccionadaId && { opacity: 0.45 }
                    ]}
                    disabled={!compraSeleccionadaId}
                    onPress={handleMarcarUtilizada}
                >
                    <Text style={styles.botonUtilizarTexto}>
                        Marcar como utilizada
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: colors.background
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background
    },
    scroll: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 110
    },
    tituloEvento: {
        color: colors.text,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16
    },
    bloqueCupo: {
        marginBottom: 12
    },
    filaCupoTexto: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    nombreTipo: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '500'
    },
    libresTexto: {
        color: colors.textSecondary,
        fontSize: 13
    },
    barraFondo: {
        height: 6,
        backgroundColor: colors.surface,
        borderRadius: 4,
        overflow: 'hidden'
    },
    barraRelleno: {
        height: '100%',
        backgroundColor: colors.accent,
        borderRadius: 4
    },
    compraCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    compraCardSeleccionada: {
        borderColor: colors.accent
    },
    filaSuperior: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
    },
    compradorNombre: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600'
    },
    filaInferior: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    detalleEntrada: {
        color: colors.textSecondary,
        fontSize: 13
    },
    textoMenta: {
        color: colors.accent,
        fontWeight: '600'
    },
    linkChat: {
        color: colors.accent,
        fontSize: 13,
        fontWeight: '600'
    },
    vacio: {
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 32
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: colors.border
    },
    botonUtilizar: {
        backgroundColor: colors.ticketBg,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center'
    },
    botonUtilizarTexto: {
        color: colors.ticketText,
        fontSize: 16,
        fontWeight: '700'
    },
     botonEliminarEvento: {
     marginTop: 18,
     borderWidth: 1,
     borderColor: colors.border,
     backgroundColor: colors.surfaceDeep,
     borderRadius: 14,
     paddingVertical: 14,
     alignItems: 'center'
 },
 botonEliminarEventoTexto: {
     color: colors.danger,
     fontSize: 15,
     fontWeight: '600'
 },
     botonEditarEvento: {
        marginTop: 18,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceDeep,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center'
    },
    botonEditarEventoTexto: {
        color: colors.text,
        fontSize: 15,
        fontWeight: '600'
    },
});