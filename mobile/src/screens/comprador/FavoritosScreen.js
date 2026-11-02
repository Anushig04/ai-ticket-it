import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useUsuario } from '../../context/UsuarioContext';
import EventoCard from '../../components/EventoCard';
import { colors } from '../../theme/colors';

export default function FavoritosScreen({ navigation }) {
    const { usuarioActual } = useUsuario();
    const favoritos = usuarioActual?.favoritos || [];

    return (
        <View style={styles.contenedor}>
            <FlatList
                data={favoritos}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 24 }}
                ListEmptyComponent={
                    <Text style={styles.vacio}>
                        Todavía no guardaste eventos en favoritos.
                    </Text>
                }
                renderItem={({ item }) => (
                    <EventoCard
                        evento={item}
                        onPress={() =>
                            navigation.navigate('EventoDetalle', {
                                eventoId: item.id
                            })
                        }
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 18,
        paddingTop: 12
    },
    vacio: {
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 48,
        fontSize: 15
    }
});