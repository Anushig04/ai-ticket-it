import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useUsuario } from '../context/UsuarioContext';
import SeleccionUsuarioScreen from '../screens/SeleccionUsuarioScreen';
import { colors } from '../theme/colors';

import CatalogoScreen from '../screens/comprador/CatalogoScreen';
import FavoritosScreen from '../screens/comprador/FavoritosScreen';
import EventoDetalleScreen from '../screens/comprador/EventoDetalleScreen';
import MisComprasScreen from '../screens/comprador/MisComprasScreen';
import CompraDetalleScreen from '../screens/comprador/CompraDetalleScreen';

import MisEventosScreen from '../screens/organizador/MisEventosScreen';
import CrearEventoScreen from '../screens/organizador/CrearEventoScreen';
import ComprasDeEventoScreen from '../screens/organizador/ComprasDeEventoScreen';
import { Ionicons } from '@expo/vector-icons';

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
    tabBarShowLabel: false, // Muestra solo los íconos limpios
    tabBarStyle: {
        backgroundColor: colors.surfaceDeep,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8
    },
    tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: colors.textMuted
};

function CompradorTabs() {
    return (
        <Tab.Navigator screenOptions={opcionesComunesTabs}>
            <Tab.Screen
                name="Catalogo"
                component={CatalogoScreen}
                options={{
                    title: 'Eventos',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'ticket' : 'ticket-outline'}
                            size={24}
                            color={color}
                        />
                    )
                }}
            />
            <Tab.Screen
                name="MisCompras"
                component={MisComprasScreen}
                options={{
                    title: 'Mis compras',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'cart' : 'cart-outline'}
                            size={24}
                            color={color}
                        />
                    )
                }}
            />
            <Tab.Screen
                name="Favoritos"
                component={FavoritosScreen}
                options={{
                    title: 'Favoritos',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'heart' : 'heart-outline'}
                            size={24}
                            color={color}
                        />
                    )
                }}
            />
        </Tab.Navigator>
    );
}

function OrganizadorTabs() {
    return (
        <Tab.Navigator screenOptions={opcionesComunesTabs}>
            <Tab.Screen
                name="MisEventos"
                component={MisEventosScreen}
                options={{
                    title: 'Mis eventos',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'ticket' : 'ticket-outline'}
                            size={24}
                            color={color}
                        />
                    )
                }}
            />
            <Tab.Screen
                name="CrearEvento"
                component={CrearEventoScreen}
                options={{
                    title: 'Crear evento',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="add" size={30} color={color} />
                    )
                }}
            />
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
                <Stack.Screen
                    name="EventoDetalle"
                    component={EventoDetalleScreen}
                    options={{ title: 'Detalle y compra' }}
                />
                <Stack.Screen
                    name="CompraDetalle"
                    component={CompraDetalleScreen}
                    options={{ title: 'Seguimiento y chat' }}
                />
                <Stack.Screen
                    name="ComprasDeEvento"
                    component={ComprasDeEventoScreen}
                    options={{ title: 'Compras del evento' }}
                />
                <Stack.Screen
                    name="EditarEvento"
                    component={CrearEventoScreen}
                    options={{ title: 'Editar evento' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
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