import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const { enableGuestMode } = useAuth();

    const handleBrowseAsGuest = () => {
        enableGuestMode();
        router.replace('/(protected)');
    };

    const handleSignIn = () => {
        router.push('/login');
    };

    const handleSignUp = () => {
        router.push('/register');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar backgroundColor="#111827" barStyle="light-content" />

            {/* Background Image with Overlay */}
            <ImageBackground
                source={require('@/assets/burger.jpeg')} // Replace with your hero image
                className="flex-1"
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['rgba(17, 24, 39, 0.7)', 'rgba(17, 24, 39, 0.9)']}
                    className="flex-1"
                >
                    <View className="flex-1 justify-between px-6 py-8">

                        {/* Top Section - App Branding */}
                        <View className="flex-1 justify-center items-center">
                            <View className="items-center mb-8">
                                <Text className="text-white text-4xl font-bold mb-2">
                                    Bienvenue
                                </Text>
                                <Text className="text-orange-500 text-6xl font-bold mb-4">
                                    Foodie
                                </Text>
                                <Text className="text-gray-300 text-lg text-center leading-6">
                                    Découvrez des saveurs exceptionnelles{'\n'}
                                    livrées directement chez vous
                                </Text>
                            </View>

                            {/* Features Preview */}
                            <View className="w-full">
                                <View className="flex-row justify-around mb-8">
                                    <View className="items-center">
                                        <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-2">
                                            <Text className="text-orange-500 text-2xl">🍔</Text>
                                        </View>
                                        <Text className="text-white text-sm">Menu Premium</Text>
                                    </View>
                                    <View className="items-center">
                                        <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-2">
                                            <Text className="text-orange-500 text-2xl">🚚</Text>
                                        </View>
                                        <Text className="text-white text-sm">Livraison Rapide</Text>
                                    </View>
                                    <View className="items-center">
                                        <View className="w-16 h-16 bg-orange-500/20 rounded-full items-center justify-center mb-2">
                                            <Text className="text-orange-500 text-2xl">⭐</Text>
                                        </View>
                                        <Text className="text-white text-sm">Qualité Garantie</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Bottom Section - Action Buttons */}
                        <View className="space-y-4">

                            {/* Browse as Guest Button */}
                            <TouchableOpacity
                                onPress={handleBrowseAsGuest}
                                className="w-full bg-orange-500 py-4 rounded-2xl shadow-lg"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white text-center text-lg font-semibold">
                                    Parcourir le Menu
                                </Text>
                                <Text className="text-orange-100 text-center text-sm mt-1">
                                    Sans création de compte
                                </Text>
                            </TouchableOpacity>

                            {/* Sign In Button */}
                            <TouchableOpacity
                                onPress={handleSignIn}
                                className="w-full bg-white/10 border border-white/20 py-4 rounded-2xl"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white text-center text-lg font-semibold">
                                    Se Connecter
                                </Text>
                            </TouchableOpacity>

                            {/* Sign Up Button */}
                            <TouchableOpacity
                                onPress={handleSignUp}
                                className="w-full py-4"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white text-center text-lg">
                                    Pas de compte ?{' '}
                                    <Text className="text-orange-500 font-semibold">
                                        Créer un compte
                                    </Text>
                                </Text>
                            </TouchableOpacity>

                            {/* Terms */}
                            <Text className="text-gray-400 text-xs text-center mt-4 leading-4">
                                En continuant, vous acceptez nos{' '}
                                <Text className="text-orange-500">Conditions d'utilisation</Text>
                                {' '}et notre{' '}
                                <Text className="text-orange-500">Politique de confidentialité</Text>
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </SafeAreaView>
    );
}