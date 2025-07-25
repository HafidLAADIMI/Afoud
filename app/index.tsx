import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import "../global.css"

function AppIndex() {
    const { user, isLoading } = useAuth();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        // Add diagnostic logging
        console.log('Index de l\'app chargé');
        console.log('État d\'authentification:', {
            isLoading,
            isLoggedIn: !!user
        });
        console.log('URL API:', process.env.EXPO_PUBLIC_API_URL);

        // Mark auth as checked once loading is complete
        if (!isLoading) {
            setAuthChecked(true);
        }

        // Save any default location data if not already saved
        const saveDefaultLocation = async () => {
            try {
                const existingLocation = await AsyncStorage.getItem('user_selected_location');
                if (!existingLocation) {
                    // Set default location if none exists
                    const defaultLocation = {
                        address: 'Beni-Mellal, Maroc',
                        latitude: '32.3373',
                        longitude: '-6.3498'
                    };
                    await AsyncStorage.setItem(
                        'user_selected_location',
                        JSON.stringify(defaultLocation)
                    );
                    console.log('Emplacement par défaut enregistré');
                }
            } catch (error) {
                console.error('Erreur lors de l\'enregistrement de l\'emplacement par défaut:', error);
            }
        };

        saveDefaultLocation();
    }, [isLoading, user]);

    // Show a loading indicator until auth is fully checked
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F97316" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    // Only redirect after auth is fully checked
    if (authChecked) {
        if (user) {
            console.log('Utilisateur authentifié, redirection vers la zone protégée');
            return <Redirect href="/(protected)/(tabs)" />;
        } else {
            console.log('Utilisateur non authentifié, redirection vers la connexion');
            return <Redirect href="/login" />;
        }
    }

    // Fallback loading state
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.loadingText}>Préparation de l'application...</Text>
        </View>
    );
}

// Wrap the entire component with ErrorBoundary
export default function Index() {
    return (
        <ErrorBoundary>
            <AppIndex />
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111827' // Dark background matching your app theme
    },
    loadingText: {
        marginTop: 10,
        color: '#FFFFFF',
        fontSize: 16
    }
});