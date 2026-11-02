import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ScrollView,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerCategorias, obtenerEventos } from '../../api/eventos';
import EventoCard from '../../components/EventoCard';
import { colors } from '../../theme/colors';

const ORDENES = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'precio', label: 'Precio' },
    { key: 'puntaje', label: 'Puntaje' }
];

export default function CatalogoScreen({ navigation }) {
    const [categorias, setCategorias] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [texto, setTexto] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState('');
    const [ordenActual, setOrdenActual] = useState('fecha');
    const [menuOrdenAbierto, setMenuOrdenAbierto] = useState(false);
    const [cargando, setCargando] = useState(true);

    const ordenSeleccionado = ORDENES.find((o) => o.key === ordenActual) || ORDENES[0];

    const cargarDatos = useCallback(async () => {
        try {
            setCargando(true);
            const listaEventos = await obtenerEventos({
                texto,
                categoria: categoriaActiva,
                orden: ordenActual
            });
            setEventos(listaEventos);
        } catch (err) {
            console.error(err);
        } finally {
            setCargando(false);
        }
    }, [texto, categoriaActiva, ordenActual]);

    useEffect(() => {
        obtenerCategorias().then(setCategorias).catch(console.error);
    }, []);

    useFocusEffect(
        useCallback(() => {
            cargarDatos();
        }, [cargarDatos])
    );


    return (
        <View style={styles.contenedor}>
            {/* Buscador */}
            <TextInput
                style={styles.inputBusqueda}
                placeholder="Buscar evento por nombre o descripción..."
                placeholderTextColor={colors.textMuted}
                value={texto}
                onChangeText={setTexto}
            />

            {/* Chips de categorías */}
            <View style={{ height: 42, marginBottom: 10 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsContainer}
                >
                    <TouchableOpacity
                        style={[
                            styles.chip,
                            categoriaActiva === '' && styles.chipActivo
                        ]}
                        onPress={() => setCategoriaActiva('')}
                    >
                        <Text
                            style={[
                                styles.chipTexto,
                                categoriaActiva === '' && styles.chipTextoActivo
                            ]}
                        >
                            Todos
                        </Text>
                    </TouchableOpacity>

                    {categorias.map((cat) => {
                        const activo = categoriaActiva === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.chip, activo && styles.chipActivo]}
                                onPress={() =>
                                    setCategoriaActiva(activo ? '' : cat.id)
                                }
                            >
                                <Text
                                    style={[
                                        styles.chipTexto,
                                        activo && styles.chipTextoActivo
                                    ]}
                                >
                                    {cat.nombre}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

                        {/* Fila Ordenar por con desplegable */}
            <View style={styles.contenedorOrden}>
                <View style={styles.filaOrden}>
                    <Text style={styles.ordenLabel}>Ordenar por</Text>
                    <TouchableOpacity
                        style={styles.selectorOrden}
                        onPress={() => setMenuOrdenAbierto((prev) => !prev)}
                    >
                        <Text style={styles.ordenValor}>
                            {ordenSeleccionado.label} {menuOrdenAbierto ? '▴' : '▾'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {menuOrdenAbierto && (
                    <View style={styles.menuDesplegable}>
                        {ORDENES.map((opcion) => {
                            const activo = opcion.key === ordenActual;
                            return (
                                <TouchableOpacity
                                    key={opcion.key}
                                    style={[
                                        styles.opcionDesplegable,
                                        activo && styles.opcionDesplegableActiva
                                    ]}
                                    onPress={() => {
                                        setOrdenActual(opcion.key);
                                        setMenuOrdenAbierto(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.opcionTexto,
                                            activo && styles.opcionTextoActivo
                                        ]}
                                    >
                                        {opcion.label}
                                    </Text>
                                    {activo && (
                                        <Text style={styles.opcionCheck}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>

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
                            No se encontraron eventos con esos filtros.
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
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 18,
        paddingTop: 8
    },
    inputBusqueda: {
        backgroundColor: colors.surfaceDeep,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 14,
        marginBottom: 12
    },
    chipsContainer: {
        alignItems: 'center',
        gap: 8
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: 'transparent',
        marginRight: 8
    },
    chipActivo: {
        backgroundColor: colors.accent,
        borderColor: colors.accent
    },
    chipTexto: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '500'
    },
    chipTextoActivo: {
        color: colors.accentText,
        fontWeight: '700'
    },
    filaOrden: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    ordenLabel: {
        color: colors.textSecondary,
        fontSize: 14
    },
    selectorOrden: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceDeep,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border
    },
    ordenValor: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600'
    },
    vacio: {
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 40
    },
        contenedorOrden: {
        zIndex: 20,
        marginBottom: 14
    },
    menuDesplegable: {
        position: 'absolute',
        top: 38,
        right: 0,
        minWidth: 160,
        backgroundColor: colors.surfaceDeep,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 }
    },
    opcionDesplegable: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    opcionDesplegableActiva: {
        backgroundColor: colors.surface
    },
    opcionTexto: {
        color: colors.textSecondary,
        fontSize: 14
    },
    opcionTextoActivo: {
        color: colors.accent,
        fontWeight: '600'
    },
    opcionCheck: {
        color: colors.accent,
        fontWeight: 'bold',
        fontSize: 14
    },
});