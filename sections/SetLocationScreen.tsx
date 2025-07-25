import React from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SetLocationScreen() {
    const handleUseCurrentLocation = () => {
        // Request location permissions and navigate to home with current location
        router.push('/');
    };

    const handleSetFromMap = () => {
        // Navigate to map selection screen
        router.push('/map-location');
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral-900">
            <StatusBar backgroundColor="#1F2937" barStyle="light-content" />

            {/* Header */}
            <View className="flex-row items-center px-4 py-3">
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="white" />
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
                    >
                        <MaterialIcons name="my-location" size={24} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Utiliser la Position Actuelle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="border border-orange-500 rounded-lg py-4 px-4 flex-row justify-center items-center"
                        onPress={handleSetFromMap}
                    >
                        <MaterialIcons name="map" size={24} color="#F97316" />
                        <Text className="text-orange-500 font-bold text-lg ml-2">Sélectionner sur la Carte</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}