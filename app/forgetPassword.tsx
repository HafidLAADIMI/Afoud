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
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            const { success, error } = await resetPassword(email);

            if (success) {
                setResetSent(true);
            } else {
                Alert.alert('Error', error?.message || 'Failed to send reset email');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Go back to login screen
    const navigateToLogin = () => {
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar backgroundColor="#111827" barStyle="light-content" />

            {/* Header */}
            <LinearGradient colors={['#F97316', '#EA580C']} className="w-full h-1/4 absolute" />

            {/* Back button */}
            <TouchableOpacity
                className="absolute top-12 left-4 z-10 bg-white/20 rounded-full p-2"
                onPress={navigateToLogin}
            >
                <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>

            {/* Content */}
            <View className="flex-1 justify-center px-6">
                <View className="bg-white rounded-2xl p-6 shadow-lg">
                    <View className="items-center mb-6">
                        <Image
                            source={require('@/assets/forgot-password.png')}
                            className="w-32 h-32 mb-4"
                            resizeMode="contain"
                        />
                        <Text className="text-xl font-bold text-gray-800 text-center">
                            Forgot Password?
                        </Text>
                        <Text className="text-gray-600 text-center mt-2">
                            Enter your email address and we'll send you a link to reset your password
                        </Text>
                    </View>

                    {resetSent ? (
                        <View className="items-center">
                            <View className="bg-green-100 p-4 rounded-xl mb-4 w-full">
                                <Text className="text-green-800 text-center">
                                    Password reset link has been sent to your email address.
                                    Please check your inbox.
                                </Text>
                            </View>
                            <TouchableOpacity
                                className="bg-orange-500 py-3 rounded-xl items-center w-full"
                                onPress={navigateToLogin}
                            >
                                <Text className="text-white font-bold">Back to Login</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {/* Email input */}
                            <View className="mb-6">
                                <Text className="text-gray-700 mb-2 font-medium">Email</Text>
                                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3">
                                    <Feather name="mail" size={20} color="#9CA3AF" />
                                    <TextInput
                                        className="flex-1 ml-2 text-gray-800"
                                        placeholder="your@email.com"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                            </View>

                            {/* Submit button */}
                            <TouchableOpacity
                                className="bg-orange-500 py-3 rounded-xl items-center mb-4"
                                onPress={handleResetPassword}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Send Reset Link</Text>
                                )}
                            </TouchableOpacity>

                            {/* Back to login */}
                            <TouchableOpacity
                                className="py-2 items-center"
                                onPress={navigateToLogin}
                            >
                                <Text className="text-gray-600">
                                    Remember your password? <Text className="text-orange-500 font-semibold">Sign In</Text>
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}