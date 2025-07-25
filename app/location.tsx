import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity, StatusBar, ActivityIndicator, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Feather, MaterialIcons} from '@expo/vector-icons';
import {router} from 'expo-router';
import * as Location from 'expo-location';
import {useLocation} from '@/context/LocationContext';

export default function SetLocationScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const {setLocation} = useLocation();

    const handleUseCurrentLocation = async () => {
        try {
            setIsLoading(true);

            // Request location permission
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    "Permission Requise",
                    "Veuillez accorder les permissions de localisation pour utiliser cette fonctionnalité",
                    [{text: "OK"}]
                );
                return;
            }

            // Get current location
            let currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

            console.log("Location:", currentLocation);

            // Try to get address from coordinates (reverse geocoding)
            try {
                const geocode = await Location.reverseGeocodeAsync({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude
                });

                let address = "Position Actuelle";
                if (geocode.length > 0) {
                    const location = geocode[0];
                    address = [
                        location.street,
                        location.city,
                        location.region,
                        location.country
                    ].filter(Boolean).join(", ");
                }

                // Save location to context - ENSURE THE PROPERTY NAMES MATCH
                await setLocation({
                    address,
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude
                });

                // Navigate back with location data
                router.push({
                    pathname: '/',
                    params: {
                        latitude: currentLocation.coords.latitude.toString(),
                        longitude: currentLocation.coords.longitude.toString(),
                        address
                    }
                });
            } catch (error) {
                console.error("Error with reverse geocoding:", error);

                // Even if geocoding fails, still save the coordinates
                await setLocation({
                    address: "Position Actuelle",
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude
                });

                router.push({
                    pathname: '/',
                    params: {
                        latitude: currentLocation.coords.latitude.toString(),
                        longitude: currentLocation.coords.longitude.toString(),
                        address: "Position Actuelle"
                    }
                });
            }
        } catch (error) {
            console.error("Error getting location:", error);
            Alert.alert(
                "Erreur de Localisation",
                "Impossible d'accéder à votre position. Veuillez réessayer ou sélectionner à partir de la carte.",
                [{text: "OK"}]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetFromMap = () => {
        // Navigate to map selection screen with source='home' to indicate where to return
        router.push({
            pathname: '/mapLocationScreen',
            params: {
                source: 'home' // This tells the map screen to return to home
            }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar backgroundColor="#111827" barStyle="light-content"/>

            {/* Header */}
            <View className="flex-row items-center px-4 py-3">
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="white"/>
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold ml-4">Définir la Position</Text>
            </View>

            <View className="flex-1 justify-between px-4 pb-8">
                {/* Main Content */}
                <View className="items-center mt-8">
                    {/* Illustration */}
                    <Image
                        source={require('@/assets/location-illustration.png')}
                        className="w-64 h-64"
                        resizeMode="contain"
                    />

                    <Text className="text-white text-2xl font-bold mt-6 text-center">
                        TROUVEZ DES RESTAURANTS ET DES PLATS PRÈS DE CHEZ VOUS
                    </Text>

                    <Text className="text-gray-400 text-center mt-4 px-4">
                        En autorisant l'accès à votre position, vous pouvez rechercher des restaurants
                        et des plats près de chez vous et bénéficier d'une livraison plus précise.
                    </Text>
                </View>

                {/* Button Options */}
                <View className="w-full">
                    <TouchableOpacity
                        className="bg-orange-500 rounded-lg py-4 px-4 flex-row justify-center items-center mb-4"
                        onPress={handleUseCurrentLocation}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" size="small" style={{marginRight: 8}}/>
                        ) : (
                            <MaterialIcons name="my-location" size={24} color="white"/>
                        )}
                        <Text className="text-white font-bold text-lg ml-2">
                            {isLoading ? "Récupération de la position..." : "Utiliser la Position Actuelle"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="border border-orange-500 rounded-lg py-4 px-4 flex-row justify-center items-center"
                        onPress={handleSetFromMap}
                        disabled={isLoading}
                    >
                        <MaterialIcons name="map" size={24} color="#F97316"/>
                        <Text className="text-orange-500 font-bold text-lg ml-2">Sélectionner sur la Carte</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}