import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet
} from 'react-native';
import { useUsuario } from '../context/UsuarioContext';
import { colors } from '../theme/colors';

const CUENTAS_DEMO = [
    {
        id: 'comp-1',
        nombre: 'Sofía',
        apellido: 'Pérez',
        email: 'sofia.perez@ticketit.com',
        rol: 'comprador',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
        subtexto: 'Explorar catálogo, reservar y favoritos'
    },
    {
        id: 'comp-2',
        nombre: 'Mateo',
        apellido: 'Rodríguez',
        email: 'mateo.rodriguez@ticketit.com',
        rol: 'comprador',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
        subtexto: 'Comprador con compras previas y chat'
    },
    {
        id: 'org-1',
        nombre: 'Lucía',
        apellido: 'Méndez (Prod. Indie)',
        email: 'lucia.mendez@ticketit.com',
        rol: 'organizador',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        subtexto: 'Publicar eventos, monitorear y gestionar ventas'
    },
    {
        id: 'org-2',
        nombre: 'Martín',
        apellido: 'Gómez (Estadio Live)',
        email: 'martin.gomez@ticketit.com',
        rol: 'organizador',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        subtexto: 'Gestión de festivales y acreditaciones'
    }
];

export default function SeleccionUsuarioScreen() {
    const { loginConPassword } = useUsuario();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const ejecutarLogin = async (emailLogin, passLogin) => {
        try {
            setCargando(true);
            setError(null);
            await loginConPassword(emailLogin, passLogin);
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setCargando(false);
        }
    };

    const handleFormSubmit = () => {
        if (!email.trim() || !password) {
            setError('Ingresá email y contraseña para continuar');
            return;
        }
        ejecutarLogin(email.trim(), password);
    };

    const handleSelectDemo = (cuenta) => {
        setEmail(cuenta.email);
        setPassword('123456');
        ejecutarLogin(cuenta.email, '123456');
    };

    return (
        <KeyboardAvoidingView
            style={styles.contenedor}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <FlatList
                data={CUENTAS_DEMO}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 36 }}
                ListHeaderComponent={
                    <View style={styles.headerForm}>
                        <Text style={styles.etiquetaSuperior}>ENTRADAS A UN CLICK</Text>
                        <Text style={styles.titulo}>AI Ticket It</Text>
                        <Text style={styles.subtitulo}>
                            Iniciá sesión de forma segura con tu cuenta:
                        </Text>

                        {/* Formulario de Login Estándar */}
                        <View style={styles.cajaFormulario}>
                            <Text style={styles.labelInput}>CORREO ELECTRÓNICO</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ejemplo: sofia.perez@ticketit.com"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <Text style={styles.labelInput}>CONTRASEÑA</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={colors.textSecondary}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />

                            {error && <Text style={styles.errorTexto}>{error}</Text>}

                            <TouchableOpacity
                                style={styles.botonIngresar}
                                onPress={handleFormSubmit}
                                disabled={cargando}
                            >
                                {cargando ? (
                                    <ActivityIndicator color={colors.ticketText} />
                                ) : (
                                    <Text style={styles.botonIngresarTexto}>
                                        Iniciar sesión con JWT
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Separador de accesos rápidos para la Demo del Video */}
                        <View style={styles.divisorContainer}>
                            <View style={styles.lineaDivisoria} />
                            <Text style={styles.divisorTexto}>
                                O INGRESÁ CON UNA CUENTA DEMO (1 CLICK)
                            </Text>
                            <View style={styles.lineaDivisoria} />
                        </View>
                    </View>
                }
                renderItem={({ item }) => {
                    const esOrg = item.rol === 'organizador';

                    return (
                        <TouchableOpacity
                            style={styles.filaChat}
                            activeOpacity={0.75}
                            onPress={() => handleSelectDemo(item)}
                        >
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: item.avatar }}
                                    style={styles.avatarCircular}
                                />
                            </View>

                            <View style={styles.infoCentro}>
                                <Text style={styles.nombre} numberOfLines={1}>
                                    {item.nombre} {item.apellido}
                                </Text>
                                <Text style={styles.emailTexto} numberOfLines={1}>
                                    {item.email}
                                </Text>
                                <Text style={styles.subtexto} numberOfLines={1}>
                                    {item.subtexto}
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.badge,
                                    esOrg ? styles.badgeOrg : styles.badgeComp
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.badgeTexto,
                                        esOrg
                                            ? styles.badgeTextoOrg
                                            : styles.badgeTextoComp
                                    ]}
                                >
                                    {esOrg ? 'Organizador' : 'Comprador'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 18,
        paddingTop: 50
    },
    headerForm: {
        marginBottom: 10
    },
    etiquetaSuperior: {
        fontSize: 11,
        letterSpacing: 1.5,
        fontWeight: '600',
        color: colors.accent,
        marginBottom: 4
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4
    },
    subtitulo: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 16
    },
    cajaFormulario: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16
    },
    labelInput: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textSecondary,
        letterSpacing: 0.5,
        marginBottom: 6
    },
    input: {
        backgroundColor: colors.surfaceDeep,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12
    },
    errorTexto: {
        color: colors.danger,
        fontSize: 13,
        marginBottom: 10
    },
    botonIngresar: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 4
    },
    botonIngresarTexto: {
        color: colors.accentText,
        fontWeight: '700',
        fontSize: 15
    },
    divisorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 14,
        gap: 8
    },
    lineaDivisoria: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border
    },
    divisorTexto: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.textSecondary,
        letterSpacing: 0.5
    },
    filaChat: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatarContainer: {
        marginRight: 14
    },
    avatarCircular: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.surfaceDeep,
        borderWidth: 1.5,
        borderColor: colors.border
    },
    infoCentro: {
        flex: 1,
        marginRight: 10
    },
    nombre: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2
    },
    emailTexto: {
        fontSize: 12,
        color: colors.accent,
        marginBottom: 2
    },
    subtexto: {
        fontSize: 12,
        color: colors.textSecondary
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    badgeComp: {
        backgroundColor: colors.estadosCompra.CONFIRMADA.bg
    },
    badgeOrg: {
        backgroundColor: colors.estadosCompra.REEMBOLSADA.bg
    },
    badgeTexto: {
        fontSize: 11,
        fontWeight: '600'
    },
    badgeTextoComp: {
        color: colors.estadosCompra.CONFIRMADA.text
    },
    badgeTextoOrg: {
        color: colors.estadosCompra.REEMBOLSADA.text
    }
});
