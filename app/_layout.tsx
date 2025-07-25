// app/_layout.tsx

import React, {useEffect, useState} from 'react';
import {Stack} from 'expo-router';
import {useColorScheme, View, ActivityIndicator, Text} from 'react-native';
import {AuthProvider} from '@/context/AuthContext';
import {enableFirestoreNetwork, checkFirestoreConnection, app, db} from '@/utils/firebase';
import ExpoStripeProvider from "@/components/stripe-provider";
import {LocationProvider} from "@/context/LocationContext";
import {OrderProvider} from '@/context/OrderContext';
import "../global.css";
import { LogBox } from 'react-native';
import { getApps, initializeApp } from 'firebase/app';

// Ignore specific Firebase warnings
LogBox.ignoreLogs([
    'AsyncStorage has been extracted from react-native',
    'Setting a timer',
    'Overriding previous layout',
    '[react-native-gesture-handler]',
    'EventEmitter.removeListener',
    'Non-serializable values were found in the navigation state',
    // Add any specific Firebase web SDK warnings you've been seeing
    'Warning: Async Storage has been extracted',
    'Error while accessing storage key'
]);

// Root layout component
export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [isFirestoreReady, setIsFirestoreReady] = useState(false);
    const [firebaseError, setFirebaseError] = useState<string | null>(null);

    // Initialize Firestore connection
    useEffect(() => {
        const initFirestore = async () => {
            try {
                console.log('Initializing Firebase and Firestore...');

                // Check if Firebase is initialized
                if (!app) {
                    console.log('Firebase app is not available, checking apps...');
                    const apps = getApps();
                    if (apps.length === 0) {
                        console.log('No Firebase apps initialized yet');
                    } else {
                        console.log(`Found ${apps.length} Firebase apps already initialized`);
                    }
                }

                // Check if Firestore database is initialized
                if (!db) {
                    console.error('Firestore database is not available');
                }

                // Try to enable network - it will fail gracefully if Firebase isn't initialized
                try {
                    await enableFirestoreNetwork();
                    const isConnected = await checkFirestoreConnection();
                    console.log('Firestore connection status:', isConnected ? 'Connected' : 'Offline');
                } catch (networkError) {
                    console.warn('Network setup error (non-fatal):', networkError);
                }

                // Even if we're offline, we can still proceed since we have local cache
                setIsFirestoreReady(true);
            } catch (error) {
                console.error('Error initializing Firestore:', error);
                setFirebaseError(`Firebase initialization error: ${error.message}`);

                // If Firebase failed to initialize but the error is not fatal
                // (e.g., offline mode), we can still proceed
                const isFatalError = error.message && (
                    error.message.includes('invalid API key') ||
                    error.message.includes('configuration') ||
                    error.message.includes('initialization')
                );

                if (!isFatalError) {
                    console.warn('Proceeding despite Firebase error');
                    setIsFirestoreReady(true);
                }
            }
        };

        initFirestore();
    }, []);

    if (firebaseError && !isFirestoreReady) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900 p-4">
                <Text className="text-white text-lg font-bold mb-2">Error Initializing App</Text>
                <Text className="text-white text-center">{firebaseError}</Text>
            </View>
        );
    }

    if (!isFirestoreReady) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <ActivityIndicator size="large" color="#F97316"/>
                <Text className="text-white mt-4">Loading...</Text>
            </View>
        );
    }

    return (
        <AuthProvider>
            <OrderProvider>
                <ExpoStripeProvider>
                    <LocationProvider>
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                contentStyle: {backgroundColor: '#000'},
                                animation: 'slide_from_right',
                            }}
                        >
                            {/* Auth screens - no auth required */}
                            <Stack.Screen
                                name="login"
                                options={{
                                    gestureEnabled: false,
                                    animation: 'fade',
                                }}
                            />
                            <Stack.Screen
                                name="signup"
                                options={{
                                    animation: 'slide_from_right',
                                }}
                            />
                            <Stack.Screen
                                name="forgot-password"
                                options={{
                                    animation: 'slide_from_right',
                                }}
                            />
                            <Stack.Screen
                                name="change-password"
                                options={{
                                    animation: 'slide_from_right',
                                }}
                            />

                            {/* Main app screens - auth handled in _protected-layout.tsx */}
                            <Stack.Screen
                                name="(protected)"
                                options={{
                                    headerShown: false,
                                }}
                            />

                            {/* Add a diagnostic screen that you can access for debugging */}
                            <Stack.Screen
                                name="diagnostic"
                                options={{
                                    animation: 'slide_from_right',
                                }}
                            />
                        </Stack>
                    </LocationProvider>
                </ExpoStripeProvider>
            </OrderProvider>
        </AuthProvider>
    );
}

// Error boundary for the entire app
export function ErrorBoundary({ error }: { error: Error }) {
    return (
        <View className="flex-1 justify-center items-center bg-gray-900 p-4">
            <Text className="text-white text-xl font-bold mb-4">Something went wrong</Text>
            <Text className="text-white text-center mb-6">{error.message}</Text>
            <Text className="text-white text-sm">Please restart the app or contact support if the issue persists.</Text>
        </View>
    );
}