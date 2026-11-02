import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    ScrollView,
    TouchableOpacity,
    Modal,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet
} from 'react-native';
import { obtenerCategorias, crearEvento, actualizarEventoApi } from '../../api/eventos';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { formatearPrecio } from '../../utils/formatters';

const NOMBRES_MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
const ANIOS_DISPONIBLES = Array.from({ length: 16 }, (_, i) => 2020 + i); // 2020 a 2035
export default function CrearEventoScreen({ navigation, route }) {
    const eventoEditar = route?.params?.eventoEditar || null;
    const modoEdicion = Boolean(eventoEditar);

    const [categorias, setCategorias] = useState([]);
    const [nombre, setNombre] = useState(eventoEditar?.nombre || '');
    const [descripcion, setDescripcion] = useState(eventoEditar?.descripcion || '');
    const [fecha, setFecha] = useState(
        eventoEditar?.fecha
            ? new Date(eventoEditar.fecha).toISOString().slice(0, 10)
            : '2026-11-20' );
    const [categoriaId, setCategoriaId] = useState( eventoEditar?.categoria?.id || 'cat-1' );
    const [imagenUri, setImagenUri] = useState( eventoEditar?.multimedia?.[0] || null );
    const scrollRef = useRef(null);

    const enfocarInputAbajo = (nombreCampo) => {
        setCampoEnfocado(nombreCampo);
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 150);
    };

    // Controla qué input tiene el foco para pintarle el borde gris más claro
    const [campoEnfocado, setCampoEnfocado] = useState(null);

    // Controla el modal de Calendario
    const [calendarioVisible, setCalendarioVisible] = useState(false);
    const [mesCalendario, setMesCalendario] = useState(new Date(2026, 10, 1));
    const [desplegableCal, setDesplegableCal] = useState(null); 
    const [tiposEntrada, setTiposEntrada] = useState(
        eventoEditar?.tiposEntrada?.length
            ? eventoEditar.tiposEntrada.map((t) => ({ ...t }))
            : [
                  { nombre: 'General', precio: 12000, cupo: 200 },
                  { nombre: 'Platea', precio: 20000, cupo: 50 }
              ]
    );

    const [mostrarFormTipo, setMostrarFormTipo] = useState(false);
    const [indiceTipoEditando, setIndiceTipoEditando] = useState(null); // null = creando nuevo, número = editando existente
    const [nuevoTipoNombre, setNuevoTipoNombre] = useState('');
    const [nuevoTipoPrecio, setNuevoTipoPrecio] = useState('');
    const [nuevoTipoCupo, setNuevoTipoCupo] = useState('');
    const [publicando, setPublicando] = useState(false);

    useEffect(() => {
        obtenerCategorias()
            .then((cats) => {
                setCategorias(cats);
                if (cats.length > 0) setCategoriaId(cats[0].id);
            })
            .catch(console.error);
    }, []);

    const elegirFotoGaleria = async () => {
        const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permiso.granted) {
            Alert.alert(
                'Permiso requerido',
                'Necesitamos acceso a tus fotos para elegir la imagen del evento.'
            );
            return;
        }

        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true
        });

        if (!resultado.canceled && resultado.assets?.[0]) {
            const asset = resultado.assets[0];
            const dataUri = asset.base64
                ? `data:image/jpeg;base64,${asset.base64}`
                : asset.uri;
            setImagenUri(dataUri);
        }
    };

    const generarDiasDelMes = (fechaMes) => {
        const anio = fechaMes.getFullYear();
        const mes = fechaMes.getMonth();
        const primerDiaSemana = new Date(anio, mes, 1).getDay();
        const totalDias = new Date(anio, mes + 1, 0).getDate();

        const celdas = [];
        for (let i = 0; i < primerDiaSemana; i++) {
            celdas.push(null);
        }
        for (let d = 1; d <= totalDias; d++) {
            celdas.push(d);
        }
        return celdas;
    };

    const cambiarMes = (delta) => {
        setMesCalendario(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
        );
    };

    const seleccionarDiaCalendario = (dia) => {
        if (!dia) return;
        const anio = mesCalendario.getFullYear();
        const mes = String(mesCalendario.getMonth() + 1).padStart(2, '0');
        const diaStr = String(dia).padStart(2, '0');
        setFecha(`${anio}-${mes}-${diaStr}`);
        setCalendarioVisible(false);
    };

    const empezarEditarTipo = (index) => {
    const tipo = tiposEntrada[index];
        setIndiceTipoEditando(index);
        setNuevoTipoNombre(tipo.nombre);
        setNuevoTipoPrecio(String(tipo.precio));
        setNuevoTipoCupo(String(tipo.cupo));
        setMostrarFormTipo(true);
        enfocarInputAbajo('tipoNombre');
    };

    const guardarTipo = () => {
        if (!nuevoTipoNombre.trim() || !nuevoTipoPrecio || !nuevoTipoCupo) {
            Alert.alert(
                'Atención',
                'Completá nombre, precio y cupo del tipo de entrada.'
            );
            return;
        }

        const datosTipo = {
            ...(indiceTipoEditando !== null ? tiposEntrada[indiceTipoEditando] : {}),
            nombre: nuevoTipoNombre.trim(),
            precio: Number(nuevoTipoPrecio),
            cupo: Number(nuevoTipoCupo)
        };

        if (indiceTipoEditando !== null) {
            setTiposEntrada((prev) =>
                prev.map((item, i) => (i === indiceTipoEditando ? datosTipo : item))
            );
        } else {
            setTiposEntrada((prev) => [...prev, datosTipo]);
        }

        setIndiceTipoEditando(null);
        setNuevoTipoNombre('');
        setNuevoTipoPrecio('');
        setNuevoTipoCupo('');
        setMostrarFormTipo(false);
    };

    const quitarTipo = (index) => {
        setTiposEntrada((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePublicar = async () => {
     try {
         setPublicando(true);
         const payload = {
             nombre,
             descripcion: descripcion || 'Espectáculo en vivo',
             categoriaId,
             fecha,
             multimedia: imagenUri ? [imagenUri] : [],
             tiposEntrada
         };

         if (modoEdicion) {
             await actualizarEventoApi(eventoEditar.id, payload);
             Alert.alert('¡Cambios guardados!', 'El evento fue actualizado.', [
                 { text: 'OK', onPress: () => navigation.goBack() }
             ]);
         } else {
             await crearEvento(payload);
             Alert.alert(
                 '¡Evento publicado!',
                 'Ya está disponible en el catálogo.',
                 [
                     {
                         text: 'Ver mis eventos',
                         onPress: () => {
                             setNombre('');
                             setDescripcion('');
                             setImagenUri(null);
                             navigation.navigate('MisEventos');
                         }
                     }
                 ]
             );
         }
     } catch (err) {
         Alert.alert('Error al guardar', err.message);
     } finally {
         setPublicando(false);
     }
    };

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
                {/* Campo: Nombre del evento */}
                <Text style={styles.labelCampo}>Nombre del evento</Text>
                <TextInput
                    style={[
                        styles.input,
                        campoEnfocado === 'nombre' && styles.inputEnfocado
                    ]}
                    placeholder="Ej. Noche de Rock Acústico"
                    placeholderTextColor={colors.textMuted}
                    value={nombre}
                    onChangeText={setNombre}
                    onFocus={() => setCampoEnfocado('nombre')}
                    onBlur={() => setCampoEnfocado(null)}
                />

                {/* Campo: Descripción */}
                <Text style={styles.labelCampo}>Descripción</Text>
                <TextInput
                    style={[
                        styles.input,
                        { minHeight: 72, textAlignVertical: 'top' },
                        campoEnfocado === 'descripcion' && styles.inputEnfocado
                    ]}
                    placeholder="Describí de qué trata el espectáculo..."
                    placeholderTextColor={colors.textMuted}
                    value={descripcion}
                    onChangeText={setDescripcion}
                    multiline
                    onFocus={() => setCampoEnfocado('descripcion')}
                    onBlur={() => setCampoEnfocado(null)}
                />

                {/* Campo: Fecha (abre calendario, sin teclado) */}
                <Text style={styles.labelCampo}>Fecha de realización</Text>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                        styles.input,
                        styles.selectorFecha,
                        calendarioVisible && styles.inputEnfocado
                    ]}
                    onPress={() => setCalendarioVisible(true)}
                >
                    <Text style={styles.fechaTexto}>{fecha}</Text>
                    <Text style={styles.iconoCalendario}>📅</Text>
                </TouchableOpacity>

                {/* Campo: Foto del evento */}
                <Text style={styles.labelCampo}>Foto del evento</Text>
                <TouchableOpacity
                    style={styles.selectorFoto}
                    activeOpacity={0.8}
                    onPress={elegirFotoGaleria}
                >
                    {imagenUri ? (
                        <View style={styles.previewContainer}>
                            <Image
                                source={{ uri: imagenUri }}
                                style={styles.previewImagen}
                            />
                            <Text style={styles.cambiarFotoTexto}>
                                Cambiar imagen
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.selectorFotoTexto}>
                            📷 Elegir foto de la galería
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Campo: Categoría */}
                <Text style={styles.labelCampo}>Categoría</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 18 }}
                >
                    {categorias.map((cat) => {
                        const activa = cat.id === categoriaId;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.chip, activa && styles.chipActivo]}
                                onPress={() => setCategoriaId(cat.id)}
                            >
                                <Text
                                    style={[
                                        styles.chipTexto,
                                        activa && styles.chipTextoActivo
                                    ]}
                                >
                                    {cat.nombre}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Tipos de entrada */}
                <Text style={styles.seccionTitulo}>Tipos de entrada</Text>

                    {tiposEntrada.map((t, index) => (
                        <View key={index} style={styles.tipoCard}>
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={() => empezarEditarTipo(index)}
                            >
                                <Text style={styles.tipoNombre}>{t.nombre}</Text>
                                <Text style={styles.tipoDetalle}>
                                    {formatearPrecio(t.precio)} · cupo {t.cupo}
                                </Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <TouchableOpacity onPress={() => empezarEditarTipo(index)}>
                                    <Text style={{ color: colors.accent, fontSize: 15, fontWeight: '600' }}>
                                        Editar
                                    </Text>
                                </TouchableOpacity>

                                {tiposEntrada.length > 1 && (
                                    <TouchableOpacity onPress={() => quitarTipo(index)}>
                                        <Text style={styles.quitarTexto}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}

                {mostrarFormTipo ? (
                    <View style={styles.formNuevoTipo}>
                        <Text style={styles.labelCampo}>
                            Nombre del tipo de entrada
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                campoEnfocado === 'tipoNombre' &&
                                    styles.inputEnfocado
                            ]}
                            placeholder="Ej. VIP, Platea, General"
                            placeholderTextColor={colors.textMuted}
                            value={nuevoTipoNombre}
                            onChangeText={setNuevoTipoNombre}
                            onFocus={() => enfocarInputAbajo('tipoNombre')}
                            onBlur={() => setCampoEnfocado(null)}
                        />

                        <View style={styles.filaMitad}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.labelCampo}>Precio ($)</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        campoEnfocado === 'tipoPrecio' &&
                                            styles.inputEnfocado
                                    ]}
                                    placeholder="15000"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    value={nuevoTipoPrecio}
                                    onChangeText={setNuevoTipoPrecio}
                                    onFocus={() => enfocarInputAbajo('tipoPrecio')}
                                    onBlur={() => setCampoEnfocado(null)}
                                />
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={styles.labelCampo}>Cupo</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        campoEnfocado === 'tipoCupo' &&
                                            styles.inputEnfocado
                                    ]}
                                    placeholder="100"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                    value={nuevoTipoCupo}
                                    onChangeText={setNuevoTipoCupo}
                                    onFocus={() => enfocarInputAbajo('tipoCupo')}
                                    onBlur={() => setCampoEnfocado(null)}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.botonConfirmarTipo}
                            onPress={guardarTipo}
                        >
                            <Text style={styles.botonConfirmarTipoTexto}>
                                Guardar tipo de entrada
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.botonAgregarTipo}
                        onPress={() => setMostrarFormTipo(true)}
                    >
                        <Text style={styles.botonAgregarTipoTexto}>
                            ＋ Agregar tipo de entrada
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Modal de Calendario con desplegables de Mes y Año */}
            <Modal
                visible={calendarioVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setDesplegableCal(null);
                    setCalendarioVisible(false);
                }}
            >
                <View style={styles.modalFondo}>
                    <View style={styles.modalCalendario}>
                        {/* Selectores desplegables de Mes y Año */}
                        <View style={styles.calHeaderDesplegables}>
                            <TouchableOpacity
                                style={[
                                    styles.calSelectorBtn,
                                    desplegableCal === 'mes' && styles.inputEnfocado
                                ]}
                                onPress={() =>
                                    setDesplegableCal((prev) =>
                                        prev === 'mes' ? null : 'mes'
                                    )
                                }
                            >
                                <Text style={styles.calSelectorTexto}>
                                    {NOMBRES_MESES[mesCalendario.getMonth()]}{' '}
                                    {desplegableCal === 'mes' ? '▴' : '▾'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.calSelectorBtn,
                                    desplegableCal === 'anio' && styles.inputEnfocado
                                ]}
                                onPress={() =>
                                    setDesplegableCal((prev) =>
                                        prev === 'anio' ? null : 'anio'
                                    )
                                }
                            >
                                <Text style={styles.calSelectorTexto}>
                                    {mesCalendario.getFullYear()}{' '}
                                    {desplegableCal === 'anio' ? '▴' : '▾'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Lista desplegable de Meses */}
                        {desplegableCal === 'mes' && (
                            <ScrollView style={styles.calListaDesplegable}>
                                {NOMBRES_MESES.map((nombreMes, idx) => {
                                    const activo = mesCalendario.getMonth() === idx;
                                    return (
                                        <TouchableOpacity
                                            key={nombreMes}
                                            style={[
                                                styles.calOpcionItem,
                                                activo && styles.calOpcionItemActiva
                                            ]}
                                            onPress={() => {
                                                setMesCalendario(
                                                    new Date(
                                                        mesCalendario.getFullYear(),
                                                        idx,
                                                        1
                                                    )
                                                );
                                                setDesplegableCal(null);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.calOpcionTexto,
                                                    activo &&
                                                        styles.calOpcionTextoActivo
                                                ]}
                                            >
                                                {nombreMes}
                                            </Text>
                                            {activo && (
                                                <Text style={styles.calOpcionTextoActivo}>
                                                    ✓
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        )}

                        {/* Lista desplegable de Años */}
                        {desplegableCal === 'anio' && (
                            <ScrollView style={styles.calListaDesplegable}>
                                {ANIOS_DISPONIBLES.map((anioItem) => {
                                    const activo =
                                        mesCalendario.getFullYear() === anioItem;
                                    return (
                                        <TouchableOpacity
                                            key={anioItem}
                                            style={[
                                                styles.calOpcionItem,
                                                activo && styles.calOpcionItemActiva
                                            ]}
                                            onPress={() => {
                                                setMesCalendario(
                                                    new Date(
                                                        anioItem,
                                                        mesCalendario.getMonth(),
                                                        1
                                                    )
                                                );
                                                setDesplegableCal(null);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.calOpcionTexto,
                                                    activo &&
                                                        styles.calOpcionTextoActivo
                                                ]}
                                            >
                                                {anioItem}
                                            </Text>
                                            {activo && (
                                                <Text style={styles.calOpcionTextoActivo}>
                                                    ✓
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        )}

                        {/* Grilla de días (se muestra cuando no está abierta una lista) */}
                        {!desplegableCal && (
                            <>
                                <View style={styles.calSemanaFila}>
                                    {DIAS_SEMANA.map((d) => (
                                        <Text key={d} style={styles.calDiaSemana}>
                                            {d}
                                        </Text>
                                    ))}
                                </View>

                                <View style={styles.calGrilla}>
                                    {generarDiasDelMes(mesCalendario).map(
                                        (dia, idx) => {
                                            const fechaCelda = dia
                                                ? `${mesCalendario.getFullYear()}-${String(
                                                      mesCalendario.getMonth() + 1
                                                  ).padStart(2, '0')}-${String(
                                                      dia
                                                  ).padStart(2, '0')}`
                                                : null;
                                            const seleccionado =
                                                fechaCelda === fecha;

                                            return (
                                                <TouchableOpacity
                                                    key={idx}
                                                    disabled={!dia}
                                                    style={[
                                                        styles.calCelda,
                                                        seleccionado &&
                                                            styles.calCeldaSeleccionada
                                                    ]}
                                                    onPress={() =>
                                                        seleccionarDiaCalendario(dia)
                                                    }
                                                >
                                                    <Text
                                                        style={[
                                                            styles.calDiaTexto,
                                                            seleccionado &&
                                                                styles.calDiaTextoSeleccionado
                                                        ]}
                                                    >
                                                        {dia || ''}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        }
                                    )}
                                </View>
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.calCerrarBtn}
                            onPress={() => {
                                setDesplegableCal(null);
                                setCalendarioVisible(false);
                            }}
                        >
                            <Text style={styles.calCerrarTexto}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.botonPublicar}
                    disabled={publicando}
                    onPress={handlePublicar}
                >
                    <Text style={styles.botonPublicarTexto}>
                        {publicando
                            ? 'Guardando...'
                            : modoEdicion
                            ? 'Guardar cambios'
                            : 'Publicar evento'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: colors.background
    },
    scroll: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 110
    },
    labelCampo: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6
    },
    input: {
        backgroundColor: colors.surfaceDeep,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: colors.text,
        fontSize: 14,
        marginBottom: 14
    },
    inputEnfocado: {
        borderColor: '#9BA8AB', // Gris más claro cuando estás parado en el campo
        borderWidth: 1.5
    },
    selectorFecha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    fechaTexto: {
        color: colors.text,
        fontSize: 14
    },
    iconoCalendario: {
        fontSize: 16
    },
    selectorFoto: {
        backgroundColor: colors.surfaceDeep,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
    },
    selectorFotoTexto: {
        color: colors.accent,
        fontSize: 14,
        fontWeight: '600'
    },
    previewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    previewImagen: {
        width: 56,
        height: 56,
        borderRadius: 10
    },
    cambiarFotoTexto: {
        color: colors.accent,
        fontSize: 14,
        fontWeight: '600'
    },
    filaMitad: {
        flexDirection: 'row',
        gap: 10
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 8
    },
    chipActivo: {
        backgroundColor: colors.accent,
        borderColor: colors.accent
    },
    chipTexto: {
        color: colors.textSecondary,
        fontSize: 13
    },
    chipTextoActivo: {
        color: colors.accentText,
        fontWeight: '700'
    },
    seccionTitulo: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12
    },
    tipoCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    tipoNombre: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 3
    },
    tipoDetalle: {
        color: colors.textSecondary,
        fontSize: 13
    },
    quitarTexto: {
        color: colors.danger,
        fontSize: 16,
        padding: 4
    },
    botonAgregarTipo: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 4
    },
    botonAgregarTipoTexto: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '500'
    },
    formNuevoTipo: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 14,
        marginTop: 6
    },
    botonConfirmarTipo: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 11,
        alignItems: 'center'
    },
    botonConfirmarTipoTexto: {
        color: colors.accentText,
        fontWeight: '700'
    },
    modalFondo: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    modalCalendario: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.border
    },
        calHeaderDesplegables: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 20
    },
    calSelectorBtn: {
        flex: 1,
        backgroundColor: colors.surfaceDeep,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingVertical: 13,
        paddingHorizontal: 16,
        alignItems: 'center'
    },
    calSelectorTexto: {
        color: colors.textMuted,
        fontSize: 17,
        fontWeight: '700'
    },
    calListaDesplegable: {
        maxHeight: 250,
        backgroundColor: colors.surfaceDeep,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 14
    },
    calOpcionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    calOpcionItemActiva: {
        backgroundColor: colors.surface
    },
    calOpcionTexto: {
        color: colors.textMuted,
        fontSize: 17,
        fontWeight: '600'
    },
    calOpcionTextoActivo: {
        color: colors.accent,
        fontSize: 17,
        fontWeight: '700'
    },
    calSemanaFila: {
        flexDirection: 'row',
        marginBottom: 8
    },
    calDiaSemana: {
        width: '14.28%',
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '600'
    },
    calGrilla: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    calCelda: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20
    },
    calCeldaSeleccionada: {
        backgroundColor: colors.accent
    },
    calDiaTexto: {
        color: colors.text,
        fontSize: 14
    },
    calDiaTextoSeleccionado: {
        color: colors.accentText,
        fontWeight: 'bold'
    },
    calCerrarBtn: {
        marginTop: 14,
        paddingVertical: 10,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border
    },
    calCerrarTexto: {
        color: colors.textSecondary,
        fontWeight: '600'
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
    botonPublicar: {
        backgroundColor: colors.ticketBg,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center'
    },
    botonPublicarTexto: {
        color: colors.ticketText,
        fontSize: 16,
        fontWeight: '700'
    }
});