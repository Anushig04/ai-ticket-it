import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerEventos } from '../../api/eventos';
import { useUsuario } from '../../context/UsuarioContext';
import EventoCard from '../../components/EventoCard';
import { colors } from '../../theme/colors';

export default function MisEventosScreen({ navigation }) {
    const { usuarioActual } = useUsuario();
    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarMisEventos = useCallback(async () => {
        try {
            setCargando(true);
            const data = await obtenerEventos({
                organizadorId: usuarioActual?.id
            });
            setEventos(data);
        } catch (err) {
            console.error(err);
        } finally {
            setCargando(false);
        }
    }, [usuarioActual?.id]);

    useFocusEffect(
        useCallback(() => {
            cargarMisEventos();
        }, [cargarMisEventos])
    );

    return (
        <View style={styles.contenedor}>
            <Text style={styles.subtitulo}>
                Tocá un evento para ver sus ventas, cupos libres y validar ingresos:
            </Text>

            {cargando ? (
                <ActivityIndicator
                    size="large"
                    color={colors.accent}
                    style={{ marginTop: 40 }}
                />
            ) : (
                <FlatList
                    data={eventos}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    ListEmptyComponent={
                        <Text style={styles.vacio}>
                            Todavía no publicaste ningún evento.
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <EventoCard
                            evento={item}
                            onPress={() =>
                                navigation.navigate('ComprasDeEvento', {
                                    eventoId: item.id
                                })
                            }
                        />
                    )}
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
    subtitulo: {
        color: colors.textSecondary,
        fontSize: 13,
        marginBottom: 14
    },
    vacio: {
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 40
    }
});