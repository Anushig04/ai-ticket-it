import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerMisCompras } from '../../api/compras';
import EstadoBadge from '../../components/EstadoBadge';
import { obtenerImagenEvento } from '../../components/EventoCard';
import { colors } from '../../theme/colors';
import { formatearFechaCorta } from '../../utils/formatters';

export default function MisComprasScreen({ navigation }) {
    const [compras, setCompras] = useState([]);
    const [filtro, setFiltro] = useState('proximas'); // 'proximas' | 'anteriores'
    const [cargando, setCargando] = useState(true);

    const cargarCompras = useCallback(async () => {
        try {
            setCargando(true);
            const data = await obtenerMisCompras();
            setCompras(data);
        } catch (err) {
            console.error(err);
        } finally {
            setCargando(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            cargarCompras();
        }, [cargarCompras])
    );

    const ahora = Date.now();
    const comprasFiltradas = compras.filter((c) => {
        const fechaEvento = new Date(c.evento?.fecha).getTime();
        const esActivaFutura =
            (c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA') &&
            fechaEvento >= ahora;
        return filtro === 'proximas' ? esActivaFutura : !esActivaFutura;
    });

    return (
        <View style={styles.contenedor}>
            {/* Selector Próximas / Anteriores */}
            <View style={styles.segmentoContainer}>
                <TouchableOpacity
                    style={[
                        styles.segmentoBtn,
                        filtro === 'proximas' && styles.segmentoBtnActivo
                    ]}
                    onPress={() => setFiltro('proximas')}
                >
                    <Text
                        style={[
                            styles.segmentoTexto,
                            filtro === 'proximas' && styles.segmentoTextoActivo
                        ]}
                    >
                        Próximas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.segmentoBtn,
                        filtro === 'anteriores' && styles.segmentoBtnActivo
                    ]}
                    onPress={() => setFiltro('anteriores')}
                >
                    <Text
                        style={[
                            styles.segmentoTexto,
                            filtro === 'anteriores' && styles.segmentoTextoActivo
                        ]}
                    >
                        Anteriores
                    </Text>
                </TouchableOpacity>
            </View>

            {cargando ? (
                <ActivityIndicator
                    size="large"
                    color={colors.accent}
                    style={{ marginTop: 40 }}
                />
            ) : (
                <FlatList
                    data={comprasFiltradas}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    ListEmptyComponent={
                        <Text style={styles.vacio}>
                            No tenés compras en esta sección.
                        </Text>
                    }
                    renderItem={({ item }) => {
                        const cantTexto = `${item.cantidad} ${
                            item.cantidad === 1 ? 'entrada' : 'entradas'
                        }`;
                        const esConfirmada = item.estado === 'CONFIRMADA';
                        const puedeReseniar =
                            item.estado === 'UTILIZADA' && !item.resenia;

                        return (
                            <TouchableOpacity
                                style={styles.card}
                                activeOpacity={0.8}
                                onPress={() =>
                                    navigation.navigate('CompraDetalle', {
                                        compraId: item.id
                                    })
                                }
                            >
                                <Image
                                    source={{ uri: obtenerImagenEvento(item.evento) }}
                                    style={styles.imagenLateral}
                                    resizeMode="cover"
                                />

                                <View style={styles.cuerpo}>
                                    <Text
                                        style={[
                                            styles.lineaSuperior,
                                            esConfirmada && styles.lineaMenta
                                        ]}
                                    >
                                        {cantTexto} ·{' '}
                                        {esConfirmada && item.diasFaltantes !== null
                                            ? `faltan ${item.diasFaltantes} días`
                                            : formatearFechaCorta(item.evento?.fecha)}
                                    </Text>

                                    <Text style={styles.titulo} numberOfLines={1}>
                                        {item.evento?.nombre}
                                    </Text>

                                    <View style={styles.filaBadge}>
                                        <EstadoBadge estado={item.estado} />
                                        {puedeReseniar && (
                                            <Text style={styles.linkReseniar}>
                                                Reseñar
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 18,
        paddingTop: 10
    },
    segmentoContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surfaceDeep,
        borderRadius: 14,
        padding: 3,
        marginBottom: 16
    },
    segmentoBtn: {
        flex: 1,
        paddingVertical: 9,
        borderRadius: 11,
        alignItems: 'center'
    },
    segmentoBtnActivo: {
        backgroundColor: colors.ticketBg
    },
    segmentoTexto: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600'
    },
    segmentoTextoActivo: {
        color: colors.ticketText
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        minHeight: 92
    },
    imagenLateral: {
        width: 82,
        height: '100%',
        backgroundColor: colors.surfaceDeep
    },
    cuerpo: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        justifyContent: 'center'
    },
    lineaSuperior: {
        color: colors.textSecondary,
        fontSize: 13,
        marginBottom: 2
    },
    lineaMenta: {
        color: colors.accent,
        fontWeight: '600'
    },
    titulo: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6
    },
    filaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    linkReseniar: {
        color: colors.accent,
        fontSize: 13,
        fontWeight: '600'
    },
    vacio: {
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 40
    }
});