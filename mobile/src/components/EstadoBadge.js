import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function EstadoBadge({ estado }) {
    const config = colors.estadosCompra[estado] || colors.estadosCompra.PENDIENTE;

    return (
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.texto, { color: config.text }]}>{config.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        alignSelf: 'flex-start'
    },
    texto: {
        fontSize: 12,
        fontWeight: '600'
    }
});