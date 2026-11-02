import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { formatearFechaCorta, formatearPrecio } from '../utils/formatters';

const FOTOS_POR_CATEGORIA = {
    Recital: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    Teatro: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&q=80',
    Festival: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80',
    Conferencia: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
    Deportes: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80'
};

export function obtenerImagenEvento(evento) {
    const primeraUrl = evento?.multimedia?.[0];
    if (primeraUrl && !primeraUrl.includes('picsum.photos')) {
        return primeraUrl;
    }
    return (
        FOTOS_POR_CATEGORIA[evento?.categoria?.nombre] ||
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80'
    );
}

export default function EventoCard({ evento, onPress }) {
    const imagenUri = obtenerImagenEvento(evento);
    const precioDesde =
        evento.precioMinimo !== undefined
            ? evento.precioMinimo
            : Math.min(...(evento.tiposEntrada || []).map((t) => t.precio));

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
            <Image
                source={{ uri: imagenUri }}
                style={styles.imagenLateral}
                resizeMode="cover"
            />

            <View style={styles.cuerpo}>
                <Text style={styles.lineaMenta} numberOfLines={1}>
                    {formatearFechaCorta(evento.fecha)} · desde {formatearPrecio(precioDesde)}
                </Text>

                <Text style={styles.titulo} numberOfLines={1}>
                    {evento.nombre}
                </Text>

                <Text style={styles.subtitulo} numberOfLines={1}>
                    {evento.categoria?.nombre || 'Evento'} · {evento.organizador?.nombre}{' '}
                    {evento.puntajeOrganizador ? `· ★ ${evento.puntajeOrganizador}` : ''}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        minHeight: 86
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
    lineaMenta: {
        color: colors.accent,
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 3
    },
    titulo: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 3
    },
    subtitulo: {
        color: colors.textSecondary,
        fontSize: 13
    }
});