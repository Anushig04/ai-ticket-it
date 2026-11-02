import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet
} from 'react-native';
import {
    obtenerCompraDetalle,
    cambiarEstadoCompra,
    cancelarCompraApi,
    enviarMensajeCompra
} from '../../api/compras';
import { crearReseniaApi } from '../../api/resenias';
import { useUsuario } from '../../context/UsuarioContext';
import EstadoBadge from '../../components/EstadoBadge';
import { colors } from '../../theme/colors';
import { formatearHora, formatearPrecio } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function CompraDetalleScreen({ route }) {
    const { compraId } = route.params;
    const { usuarioActual } = useUsuario();

    const [compra, setCompra] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [textoMensaje, setTextoMensaje] = useState('');
    const [enviandoMsg, setEnviandoMsg] = useState(false);

    // Estado del formulario de reseña (cuando compra.estado === 'UTILIZADA')
    const [puntuacion, setPuntuacion] = useState(0);
    const [detalleResenia, setDetalleResenia] = useState('');
    const [enviandoResenia, setEnviandoResenia] = useState(false);
    const scrollRef = useRef(null);

    const scrollearAlFinal = () => {
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 150);
    };

    const cargarCompra = async () => {
        try {
            setCargando(true);
            const data = await obtenerCompraDetalle(compraId);
            setCompra(data);
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCompra();
    }, [compraId]);

    const handleConfirmarPago = async () => {
        try {
            const actualizada = await cambiarEstadoCompra(compra.id, 'CONFIRMADA');
            setCompra(actualizada);
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    const handleCancelar = () => {
        Alert.alert(
            'Cancelar compra',
            compra.estado === 'CONFIRMADA'
                ? '¿Querés cancelar tu compra y solicitar el reembolso?'
                : '¿Querés cancelar esta reserva pendiente?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí, cancelar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const actualizada = await cancelarCompraApi(compra.id);
                            setCompra(actualizada);
                        } catch (err) {
                            Alert.alert('No se pudo cancelar', err.message);
                        }
                    }
                }
            ]
        );
    };

    const handleEnviarMensaje = async () => {
        if (!textoMensaje.trim() || enviandoMsg) return;
        try {
            setEnviandoMsg(true);
            await enviarMensajeCompra(compra.id, textoMensaje.trim());
            setTextoMensaje('');
            await cargarCompra();
        } catch (err) {
            Alert.alert('Error al enviar mensaje', err.message);
        } finally {
            setEnviandoMsg(false);
        }
    };

    const handleEnviarResenia = async () => {
        if (puntuacion < 1) {
            Alert.alert('Atención', 'Tocá las estrellas para elegir un puntaje de 1 a 5.');
            return;
        }
        if (!detalleResenia.trim()) {
            Alert.alert('Atención', 'Escribí un comentario sobre el evento.');
            return;
        }
        try {
            setEnviandoResenia(true);
            await crearReseniaApi(compra.id, {
                puntuacion,
                detalle: detalleResenia.trim()
            });
            Alert.alert('¡Gracias!', 'Tu calificación fue publicada.');
            await cargarCompra();
        } catch (err) {
            Alert.alert('No se pudo calificar', err.message);
        } finally {
            setEnviandoResenia(false);
        }
    };

    if (cargando || !compra) {
        return (
            <View style={styles.centrado}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    const esComprador = compra.comprador?.id === usuarioActual?.id;;
    const ultimoCambio =
        compra.historialEstados?.[compra.historialEstados.length - 1];
    const cadenaHistorial = [
        'Pendiente',
        ...(compra.historialEstados || []).map(
            (h) => colors.estadosCompra[h.estado]?.label || h.estado
        )
    ].join(' → ');

    return (
        <KeyboardAvoidingView
            style={styles.contenedor}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >

                {/* Ticket Card Blanca */}
                <View style={styles.ticketBlanco}>
                    <View style={styles.iconoTicket}>
                        <Text style={styles.iconoTicketTexto}>🎟️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.ticketLabel}>EVENTO</Text>
                        <Text style={styles.ticketTitulo}>
                            {compra.evento?.nombre}
                        </Text>
                        <Text style={styles.ticketSub}>
                            {compra.tipoEntrada?.nombre} × {compra.cantidad} ·{' '}
                            {formatearPrecio(compra.total)}
                            {compra.diasFaltantes !== null
                                ? ` · faltan ${compra.diasFaltantes} días`
                                : ''}
                        </Text>
                    </View>
                </View>

                {/* Botón simular pago si está PENDIENTE y es comprador */}
                {esComprador && compra.estado === 'PENDIENTE' && (
                    <TouchableOpacity
                        style={styles.botonPagar}
                        onPress={handleConfirmarPago}
                    >
                        <Text style={styles.botonPagarTexto}>
                            Confirmar pago · {formatearPrecio(compra.total)}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Línea de Historial de estados */}
                <Text style={styles.textoHistorial}>
                    {cadenaHistorial}
                    {ultimoCambio
                        ? ` · ${formatearHora(ultimoCambio.fechaHora)}`
                        : ''}
                </Text>

                {/* Sección Reseña (solo si está UTILIZADA y es comprador) */}
                {esComprador && compra.estado === 'UTILIZADA' && (
                    <View style={styles.cajaResenia}>
                        <Text style={styles.seccionTitulo}>
                            {compra.resenia
                                ? 'Tu calificación del evento'
                                : 'Calificar experiencia'}
                        </Text>

                        {compra.resenia ? (
                            <View>
                                <Text style={styles.estrellasTexto}>
                                    {'★'.repeat(compra.resenia.puntuacion)}{' '}
                                    ({compra.resenia.puntuacion}/5)
                                </Text>
                                <Text style={styles.reseniaGuardada}>
                                    {compra.resenia.detalle}
                                </Text>
                            </View>
                        ) : (
                            <View>
                               <View style={styles.filaEstrellas}>
                                    {[1, 2, 3, 4, 5].map((num) => {
                                        const rellena = num <= puntuacion;
                                        return (
                                            <TouchableOpacity
                                                key={num}
                                                activeOpacity={0.7}
                                                onPress={() => setPuntuacion(num)}
                                                style={styles.estrellaTouch}
                                            >
                                                <Ionicons
                                                    name={rellena ? 'star' : 'star-outline'}
                                                    size={34}
                                                    color={
                                                        rellena
                                                            ? colors.accent
                                                            : colors.textMuted
                                                    }
                                                />
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                <TextInput
                                    style={styles.inputResenia}
                                    placeholder="Contanos qué te pareció el evento..."
                                    placeholderTextColor={colors.textMuted}
                                    value={detalleResenia}
                                    onChangeText={setDetalleResenia}
                                    multiline
                                    onFocus={scrollearAlFinal}
                                />

                                <TouchableOpacity
                                    style={styles.botonPublicarResenia}
                                    disabled={enviandoResenia}
                                    onPress={handleEnviarResenia}
                                >
                                    <Text style={styles.botonPagarTexto}>
                                        {enviandoResenia
                                            ? 'Enviando...'
                                            : 'Enviar reseña'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Mensajes del Chat */}
                <View style={styles.chatContainer}>
                    {(compra.mensajes || []).length === 0 ? (
                        <Text style={styles.chatVacio}>
                            No hay mensajes aún. Escribí abajo para consultar al{' '}
                            {esComprador ? 'organizador' : 'comprador'}.
                        </Text>
                    ) : (
                        compra.mensajes.map((msg) => {
                            const esMio = msg.usuario?.id === usuarioActual?.id;
                            return (
                                <View
                                    key={msg.id}
                                    style={[
                                        styles.burbuja,
                                        esMio
                                            ? styles.burbujaPropia
                                            : styles.burbujaAjena
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.burbujaTexto,
                                            esMio && styles.burbujaTextoPropio
                                        ]}
                                    >
                                        {msg.mensaje}
                                    </Text>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Input de nuevo mensaje */}
                <View style={styles.filaInputChat}>
                    <TextInput
                        style={styles.inputChat}
                        placeholder="Escribir mensaje"
                        placeholderTextColor={colors.textMuted}
                        value={textoMensaje}
                        onChangeText={setTextoMensaje}
                        onFocus={scrollearAlFinal}
                    />
                    <TouchableOpacity
                        style={styles.botonEnviarChat}
                        onPress={handleEnviarMensaje}
                    >
                        <Text style={styles.botonEnviarTexto}>➤</Text>
                    </TouchableOpacity>
                </View>

                {/* Botón Cancelar Compra */}
                {esComprador && compra.puedeCancelarse && (
                    <TouchableOpacity
                        style={styles.botonCancelar}
                        onPress={handleCancelar}
                    >
                        <Text style={styles.botonCancelarTexto}>
                            Cancelar compra
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
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
        paddingBottom: 40
    },
    filaEstado: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14
    },
    idCompra: {
        color: colors.textSecondary,
        fontSize: 13
    },
    ticketBlanco: {
        backgroundColor: colors.ticketBg,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    iconoTicket: {
        width: 44,
        height: 52,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14
    },
    iconoTicketTexto: {
        fontSize: 20
    },
    ticketLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 2
    },
    ticketTitulo: {
        fontSize: 17,
        fontWeight: 'bold',
        color: colors.ticketText,
        marginBottom: 2
    },
    ticketSub: {
        fontSize: 13,
        color: '#4B5563'
    },
    botonPagar: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 12
    },
    botonPagarTexto: {
        color: colors.accentText,
        fontWeight: '700',
        fontSize: 14
    },
    filaEstrellas: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14
    },
    estrellaTouch: {
        paddingVertical: 4,
        paddingHorizontal: 2
    },
    textoHistorial: {
        color: colors.textSecondary,
        fontSize: 13,
        marginBottom: 16
    },
    cajaResenia: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 18
    },
    seccionTitulo: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10
    },
    filaEstrellas: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12
    },
    btnEstrella: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceDeep
    },
    btnEstrellaActiva: {
        backgroundColor: colors.estadosCompra.CONFIRMADA.bg,
        borderColor: colors.accent
    },
    btnEstrellaTexto: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '600'
    },
    btnEstrellaTextoActivo: {
        color: colors.accent
    },
    inputResenia: {
        backgroundColor: colors.surfaceDeep,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
        color: colors.text,
        minHeight: 70,
        textAlignVertical: 'top',
        marginBottom: 10
    },
    botonPublicarResenia: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 11,
        alignItems: 'center'
    },
    estrellasTexto: {
        color: colors.accent,
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4
    },
    reseniaGuardada: {
        color: colors.textSecondary,
        fontSize: 14
    },
    chatContainer: {
        marginBottom: 16,
        gap: 10
    },
    chatVacio: {
        color: colors.textMuted,
        fontSize: 13,
        fontStyle: 'italic',
        marginVertical: 12
    },
    burbuja: {
        maxWidth: '82%',
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 16
    },
    burbujaAjena: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surface
    },
    burbujaPropia: {
        alignSelf: 'flex-end',
        backgroundColor: colors.estadosCompra.CONFIRMADA.bg
    },
    burbujaTexto: {
        color: colors.text,
        fontSize: 14
    },
    burbujaTextoPropio: {
        color: colors.accent
    },
    filaInputChat: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceDeep,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: 14
    },
    inputChat: {
        flex: 1,
        color: colors.text,
        fontSize: 14,
        paddingVertical: 8
    },
    botonEnviarChat: {
        paddingHorizontal: 10,
        paddingVertical: 6
    },
    botonEnviarTexto: {
        color: colors.accent,
        fontSize: 18
    },
    botonCancelar: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceDeep,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center'
    },
    botonCancelarTexto: {
        color: colors.danger,
        fontSize: 15,
        fontWeight: '600'
    }
});