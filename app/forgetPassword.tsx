// screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const { resetPassword } = useAuth();

    // Send password reset email
    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Erreur', 'Veuillez saisir votre adresse email');
            return;
        }

        setIsLoading(true);
        try {
            const { success, error } = await resetPassword(email);

            if (success) {
                setResetSent(true);
            } else {
                Alert.alert('Erreur', error?.message || 'Échec de l\'envoi de l\'email de réinitialisation');
            }
        } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    // Go back to login screen
    const navigateToLogin = () => {
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar backgroundColor="#f9fafb" barStyle="dark-content" />

            {/* Header */}
            <LinearGradient colors={['#a86e02', '#8b5a02']} className="w-full h-1/4 absolute" />

            {/* Back button */}
            <TouchableOpacity
                className="absolute top-12 left-4 z-10 bg-white/90 rounded-full p-3 shadow-sm"
                onPress={navigateToLogin}
                accessibilityLabel="Retour à la connexion"
            >
                <Feather name="arrow-left" size={24} color="#a86e02" />
            </TouchableOpacity>

            {/* Content */}
            <View className="flex-1 justify-center px-6">
                <View className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <View className="items-center mb-6">
                        <View className="w-20 h-20 bg-yellow-50 rounded-full items-center justify-center mb-4" style={{ backgroundColor: '#fef7ed' }}>
                            <Feather name="lock" size={32} color="#a86e02" />
                        </View>
                        <Text className="text-xl font-bold text-gray-800 text-center">
                            Mot de passe oublié ?
                        </Text>
                        <Text className="text-gray-600 text-center mt-2 leading-5">
                            Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
                        </Text>
                    </View>

                    {resetSent ? (
                        <View className="items-center">
                            <View className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6 w-full">
                                <View className="flex-row items-center mb-2">
                                    <Feather name="check-circle" size={20} color="#10B981" />
                                    <Text className="text-green-800 font-medium ml-2">Email envoyé !</Text>
                                </View>
                                <Text className="text-green-700 text-sm">
                                    Le lien de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.
                                </Text>
                            </View>
                            <TouchableOpacity
                                className="py-4 rounded-xl items-center w-full shadow-sm"
                                style={{ backgroundColor: '#a86e02' }}
                                onPress={navigateToLogin}
                                accessibilityLabel="Retour à la connexion"
                            >
                                <Text className="text-white font-bold text-lg">Retour à la connexion</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {/* Email input */}
                            <View className="mb-6">
                                <Text className="text-gray-800 mb-2 font-medium">Email</Text>
                                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                                    <Feather name="mail" size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-gray-800"
                                        placeholder="votre@email.com"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                        accessibilityLabel="Champ d'adresse email"
                                    />
                                </View>
                            </View>

                            {/* Submit button */}
                            <TouchableOpacity
                                className="py-4 rounded-xl items-center mb-4 shadow-sm"
                                style={{ backgroundColor: '#a86e02' }}
                                onPress={handleResetPassword}
                                disabled={isLoading}
                                accessibilityLabel="Envoyer le lien de réinitialisation"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-lg">Envoyer le lien</Text>
                                )}
                            </TouchableOpacity>

                            {/* Back to login */}
                            <TouchableOpacity
                                className="py-3 items-center"
                                onPress={navigateToLogin}
                                accessibilityLabel="Retour à la connexion"
                            >
                                <Text className="text-gray-600">
                                    Vous vous souvenez de votre mot de passe ? <Text className="font-semibold" style={{ color: '#a86e02' }}>Se connecter</Text>
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}