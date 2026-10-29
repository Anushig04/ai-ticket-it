import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UsuarioProvider } from './src/context/UsuarioContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    return (
        <SafeAreaProvider>
            <UsuarioProvider>
                <StatusBar style="light" />
                <AppNavigator />
            </UsuarioProvider>
        </SafeAreaProvider>
    );
}