import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useUsuario } from '../context/UsuarioContext';
import SeleccionUsuarioScreen from '../screens/SeleccionUsuarioScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const temaOscuroApp = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
        primary: colors.accent
    }
};

function PantallaPlaceholder({ nombre }) {
    const { usuarioActual } = useUsuario();
    return (
        <View style={styles.placeholder}>
            <Text style={styles.placeholderTitulo}>{nombre}</Text>
            <Text style={styles.placeholderSub}>
                Usuario activo: {usuarioActual?.nombre} ({usuarioActual?.rol})
            </Text>
        </View>
    );
}

function BotonCambiarUsuario() {
    const { usuarioActual, cerrarSesion } = useUsuario();
    return (
        <TouchableOpacity onPress={cerrarSesion} style={styles.botonIcono}>
            <Text style={styles.botonIconoTexto}>{usuarioActual?.nombre} ⇄</Text>
        </TouchableOpacity>
    );
}

const opcionesComunesTabs = {
    headerStyle: {
        backgroundColor: colors.background
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
        fontSize: 22,
        fontWeight: '600'
    },
    headerShadowVisible: false,
    headerRight: () => <BotonCambiarUsuario />,
    tabBarStyle: {
        backgroundColor: colors.surfaceDeep,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 6
    },
    tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: colors.textMuted
};

function CompradorTabs() {
    return (
        <Tab.Navigator screenOptions={opcionesComunesTabs}>
            <Tab.Screen name="Catalogo" options={{ title: 'Eventos' }}>
                {() => <PantallaPlaceholder nombre="Eventos (Catálogo)" />}
            </Tab.Screen>
            <Tab.Screen name="MisCompras" options={{ title: 'Mis compras' }}>
                {() => <PantallaPlaceholder nombre="Mis compras" />}
            </Tab.Screen>
            <Tab.Screen name="Favoritos" options={{ title: 'Favoritos' }}>
                {() => <PantallaPlaceholder nombre="Favoritos" />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

function OrganizadorTabs() {
    return (
        <Tab.Navigator screenOptions={opcionesComunesTabs}>
            <Tab.Screen name="MisEventos" options={{ title: 'Mis eventos' }}>
                {() => <PantallaPlaceholder nombre="Mis eventos (Organizador)" />}
            </Tab.Screen>
            <Tab.Screen name="CrearEvento" options={{ title: 'Crear evento' }}>
                {() => <PantallaPlaceholder nombre="Crear evento" />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { usuarioActual } = useUsuario();

    if (!usuarioActual) {
        return <SeleccionUsuarioScreen />;
    }

    const esOrganizador = usuarioActual.rol === 'organizador';

    return (
        <NavigationContainer theme={temaOscuroApp}>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: colors.background }
                }}
            >
                {esOrganizador ? (
                    <Stack.Screen
                        name="OrganizadorHome"
                        component={OrganizadorTabs}
                        options={{ headerShown: false }}
                    />
                ) : (
                    <Stack.Screen
                        name="CompradorHome"
                        component={CompradorTabs}
                        options={{ headerShown: false }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.background
    },
    placeholderTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8
    },
    placeholderSub: {
        fontSize: 14,
        color: colors.textSecondary
    },
    botonIcono: {
        marginRight: 16,
        backgroundColor: colors.surfaceDeep,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10
    },
    botonIconoTexto: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary
    }
});