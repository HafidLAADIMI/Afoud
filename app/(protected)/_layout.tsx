
import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import "../../global.css"
export default function ProtectedLayout() {
    const { user, isLoading } = useAuth();

    // Affiche l'état de chargement pendant la vérification de l'authentification
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <ActivityIndicator size="large" color="#F97316" />
            </View>
        );
    }

    // Redirection vers la page de connexion si non authentifié
    if (!user) {
        return <Redirect href="/login" />;
    }

    // L'utilisateur est authentifié, affiche les routes protégées
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="product/[id]"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen
                name="checkout"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="payment-method"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="profile"
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="edit-profile"
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="map-location"
                options={{
                    animation: 'slide_from_right',
                }}
            />
        </Stack>
    );
}