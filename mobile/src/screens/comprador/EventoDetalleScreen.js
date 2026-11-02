import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet
} from 'react-native';
import {
    obtenerEventoDetalle,
    agregarFavoritoApi,
    quitarFavoritoApi
} from '../../api/eventos';
import { realizarCompra } from '../../api/compras';
import { useUsuario } from '../../context/UsuarioContext';
import { colors } from '../../theme/colors';
import { formatearFechaCorta, formatearPrecio } from '../../utils/formatters';

export default function EventoDetalleScreen({ route, navigation }) {
    const { eventoId } = route.params;
    const { usuarioActual, actualizarFavoritosLocales } = useUsuario();

    const [evento, setEvento] = useState(null);
    const [tipoSeleccionadoId, setTipoSeleccionadoId] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [cargando, setCargando] = useState(true);
    const [comprando, setComprando] = useState(false);

    const esFavorito = (usuarioActual?.favoritos || []).some(
        (fav) => fav.id === eventoId
    );

    const cargarDetalle = async () => {
        try {
            setCargando(true);
            const data = await obtenerEventoDetalle(eventoId);
            setEvento(data);
            const primerDisponible = (data.tiposEntrada || []).find((t) => t.cupo > 0);
            if (primerDisponible) {
                setTipoSeleccionadoId(primerDisponible.id);
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDetalle();
    }, [eventoId]);

    const toggleFavorito = async () => {
        try {
            const nuevosFavs = esFavorito
                ? await quitarFavoritoApi(eventoId)
                : await agregarFavoritoApi(eventoId);
            actualizarFavoritosLocales(nuevosFavs);
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    const handleComprar = async () => {
        if (!tipoSeleccionadoId) return;
        try {
            setComprando(true);
            await realizarCompra({
                eventoId: evento.id,
                tipoEntradaId: tipoSeleccionadoId,
                cantidad
            });
            Alert.alert(
                '¡Compra creada!',
                'Tu entrada fue registrada. Podés ver su estado y chatear con el organizador en "Mis compras".',
                [
                    {
                        text: 'Ir a Mis compras',
                        onPress: () =>
                            navigation.navigate('CompradorHome', {
                                screen: 'MisCompras'
                            })
                    },
                    {
                        text: 'Seguir acá',
                        onPress: cargarDetalle
                    }
                ]
            );
        } catch (err) {
            Alert.alert('No se pudo realizar la compra', err.message);
        } finally {
            setComprando(false);
        }
    };

    if (cargando || !evento) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    const tipoSeleccionado = (evento.tiposEntrada || []).find(
        (t) => t.id === tipoSeleccionadoId
    );
    const totalCalculado = tipoSeleccionado ? tipoSeleccionado.precio * cantidad : 0;

    return (
        <View style={styles.contenedor}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Banner superior del evento */}
                <View style={styles.banner}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.bannerCategoria}>
                            {evento.categoria?.nombre?.toUpperCase()}
                        </Text>
                        <Text style={styles.bannerTitulo}>{evento.nombre}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.botonFav}
                        onPress={toggleFavorito}
                    >
                        <Text style={styles.favIcono}>
                            {esFavorito ? '♥' : '♡'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.metaInfo}>
                    {formatearFechaCorta(evento.fecha)} · {evento.organizador?.nombre}{' '}
                    <Text style={styles.puntajeMenta}>
                        {evento.puntajeOrganizador
                            ? `· ★ ${evento.puntajeOrganizador} organizador`
                            : '· Sin reseñas aún'}
                    </Text>
                </Text>

                <Text style={styles.descripcion}>{evento.descripcion}</Text>

                {/* Elegí tu entrada */}
                <Text style={styles.seccionTitulo}>Elegí tu entrada</Text>

                {(evento.tiposEntrada || []).map((tipo) => {
                    const seleccionado = tipo.id === tipoSeleccionadoId;
                    const sinCupo = tipo.cupo <= 0;

                    return (
                        <TouchableOpacity
                            key={tipo.id}
                            activeOpacity={0.85}
                            disabled={sinCupo}
                            onPress={() => {
                                setTipoSeleccionadoId(tipo.id);
                                setCantidad(1);
                            }}
                            style={[
                                styles.ticketCard,
                                seleccionado && styles.ticketCardActiva,
                                sinCupo && styles.ticketCardSinCupo
                            ]}
                        >
                            {/* Talón izquierdo del ticket */}
                            <View
                                style={[
                                    styles.ticketTalon,
                                    seleccionado && styles.ticketTalonActivo
                                ]}
                            >
                                <View
                                    style={[
                                        styles.circuloCheck,
                                        seleccionado && styles.circuloCheckActivo
                                    ]}
                                >
                                    {seleccionado && (
                                        <Text style={styles.checkTexto}>✓</Text>
                                    )}
                                </View>
                            </View>

                            {/* Cuerpo derecho del ticket */}
                            <View style={styles.ticketCuerpo}>
                                <Text
                                    style={[
                                        styles.ticketEtiqueta,
                                        seleccionado && styles.textoOscuroSuave
                                    ]}
                                >
                                    TIPO
                                </Text>
                                <Text
                                    style={[
                                        styles.ticketNombre,
                                        seleccionado && styles.textoOscuro
                                    ]}
                                >
                                    {tipo.nombre} · {formatearPrecio(tipo.precio)}
                                </Text>
                                <Text
                                    style={[
                                        styles.ticketCupo,
                                        seleccionado && styles.textoOscuroSuave
                                    ]}
                                >
                                    {sinCupo
                                        ? 'Sin cupo'
                                        : seleccionado
                                        ? `Quedan ${tipo.cupo} · cantidad ${cantidad}`
                                        : `Quedan ${tipo.cupo}`}
                                </Text>

                                {seleccionado && !sinCupo && (
                                    <View style={styles.controlesCantidad}>
                                        <TouchableOpacity
                                            style={styles.btnCant}
                                            onPress={() =>
                                                setCantidad((c) => Math.max(1, c - 1))
                                            }
                                        >
                                            <Text style={styles.btnCantTexto}>−</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.cantValor}>{cantidad}</Text>
                                        <TouchableOpacity
                                            style={styles.btnCant}
                                            onPress={() =>
                                                setCantidad((c) => c + 1)
                                            }
                                        >
                                            <Text style={styles.btnCantTexto}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {/* Reseñas de este evento */}
                <Text style={[styles.seccionTitulo, { marginTop: 22 }]}>
                    Reseñas del evento ({evento.reseniasEvento?.length || 0})
                </Text>
                {(evento.reseniasEvento || []).length === 0 ? (
                    <Text style={styles.sinResenias}>
                        Este evento todavía no tiene reseñas publicadas.
                    </Text>
                ) : (
                    evento.reseniasEvento.map((res) => (
                        <View key={res.id} style={styles.reseniaCard}>
                            <View style={styles.reseniaHeader}>
                                <Text style={styles.reseniaAutor}>
                                    {res.comprador?.nombre} {res.comprador?.apellido}
                                </Text>
                                <Text style={styles.reseniaPuntaje}>
                                    ★ {res.puntuacion}/5
                                </Text>
                            </View>
                            <Text style={styles.reseniaDetalle}>{res.detalle}</Text>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Botón fijo inferior de Comprar */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.botonComprar,
                        (!tipoSeleccionado || comprando) && { opacity: 0.5 }
                    ]}
                    disabled={!tipoSeleccionado || comprando}
                    onPress={handleComprar}
                >
                    <Text style={styles.botonComprarTexto}>
                        {comprando
                            ? 'Procesando...'
                            : `Comprar · ${formatearPrecio(totalCalculado)}`}
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
    banner: {
        backgroundColor: '#2B5B84',
        borderRadius: 16,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    bannerCategoria: {
        color: colors.accent,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4
    },
    bannerTitulo: {
        color: colors.text,
        fontSize: 22,
        fontWeight: 'bold'
    },
    botonFav: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: colors.surfaceDeep,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12
    },
    favIcono: {
        color: colors.accent,
        fontSize: 22
    },
    metaInfo: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 8
    },
    puntajeMenta: {
        color: colors.accent,
        fontWeight: '600'
    },
    descripcion: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20
    },
    seccionTitulo: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 12
    },
    ticketCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        minHeight: 90
    },
    ticketCardActiva: {
        backgroundColor: colors.ticketBg
    },
    ticketCardSinCupo: {
        opacity: 0.45
    },
    ticketTalon: {
        width: 58,
        backgroundColor: colors.surfaceDeep,
        justifyContent: 'center',
        alignItems: 'center'
    },
    ticketTalonActivo: {
        backgroundColor: '#387CA3'
    },
    circuloCheck: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center'
    },
    circuloCheckActivo: {
        backgroundColor: colors.greenCheck,
        borderColor: colors.greenCheck
    },
    checkTexto: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 14
    },
    ticketCuerpo: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 14
    },
    ticketEtiqueta: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.textMuted,
        marginBottom: 2
    },
    ticketNombre: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 3
    },
    ticketCupo: {
        fontSize: 13,
        color: colors.textSecondary
    },
    textoOscuro: {
        color: colors.ticketText
    },
    textoOscuroSuave: {
        color: '#555555'
    },
    controlesCantidad: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 12
    },
    btnCant: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnCantTexto: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.ticketText
    },
    cantValor: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.ticketText
    },
    sinResenias: {
        color: colors.textMuted,
        fontSize: 13,
        fontStyle: 'italic'
    },
    reseniaCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10
    },
    reseniaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2
    },
    reseniaAutor: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 14
    },
    reseniaPuntaje: {
        color: colors.accent,
        fontWeight: '700',
        fontSize: 13
    },
    reseniaEvento: {
        color: colors.textMuted,
        fontSize: 12,
        marginBottom: 4
    },
    reseniaDetalle: {
        color: colors.textSecondary,
        fontSize: 13
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
    botonComprar: {
        backgroundColor: colors.ticketBg,
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: 'center'
    },
    botonComprarTexto: {
        color: colors.ticketText,
        fontSize: 16,
        fontWeight: '700'
    }
});