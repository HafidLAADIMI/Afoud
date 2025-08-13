// app/login.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router, useRootNavigationState } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrivacyDisclosure } from '@/components/PrivacyDisclosure';
import { requestTrackingPermission } from '@/utils/trackingPermission';

// Error message constants for easier maintenance
const ERROR_MESSAGES = {
    EMPTY_FIELDS: 'Veuillez saisir votre email et votre mot de passe',
    INVALID_EMAIL: 'Veuillez entrer une adresse email valide',
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect. Veuillez réessayer.',
    NETWORK_ERROR: 'Problème de connexion réseau. Veuillez vérifier votre connexion internet.',
    SERVER_ERROR: 'Le serveur ne répond pas. Veuillez réessayer plus tard.',
    ACCOUNT_LOCKED: 'Votre compte a été temporairement verrouillé suite à plusieurs tentatives échouées. Veuillez réessayer plus tard ou utilisez "Mot de passe oublié".',
    GENERAL_ERROR: 'Une erreur inattendue est survenue. Veuillez réessayer.'
};

// Storage keys for better organization
const STORAGE_KEYS = {
    USER_SESSION: 'user_session',
    REMEMBER_ME: 'remember_me',
    PRIVACY_ACCEPTED: '@privacy_accepted',
    TRACKING_PERMISSION: '@tracking_permission'
};

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [emailError, setEmailError] = useState('');

    // Privacy states
    const [showPrivacyDisclosure, setShowPrivacyDisclosure] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [isCheckingPrivacy, setIsCheckingPrivacy] = useState(true);

    const {
        user,
        signInWithEmailPassword,
        isLoading: authLoading
    } = useAuth();

    const navigationState = useRootNavigationState();

    // Check privacy acceptance status on mount
    useEffect(() => {
        const checkPrivacyStatus = async () => {
            try {
                const accepted = await AsyncStorage.getItem(STORAGE_KEYS.PRIVACY_ACCEPTED);
                if (accepted === 'true') {
                    setPrivacyAccepted(true);
                } else if (accepted === 'false') {
                    // User previously declined, show disclosure again
                    setShowPrivacyDisclosure(true);
                } else {
                    // First time user, show privacy disclosure
                    setShowPrivacyDisclosure(true);
                }
            } catch (error) {
                console.error('Error checking privacy status:', error);
                setShowPrivacyDisclosure(true);
            } finally {
                setIsCheckingPrivacy(false);
            }
        };

        checkPrivacyStatus();
    }, []);

    // Check authentication only after privacy is handled
    useEffect(() => {
        if (!privacyAccepted || !navigationState?.key) return;

        const checkAuth = async () => {
            try {
                const userSession = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
                const rememberMeValue = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);

                if (user && (rememberMeValue === 'true' || userSession)) {
                    router.replace('/');
                }
            } catch (err) {
                console.error('Error checking auth state:', err);
            }
        };

        checkAuth();
    }, [user, navigationState?.key, privacyAccepted]);

    // Handle privacy acceptance
    const handlePrivacyAccept = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_ACCEPTED, 'true');
            setPrivacyAccepted(true);
            setShowPrivacyDisclosure(false);

            // Request tracking permission after privacy acceptance
            const hasTrackingPermission = await requestTrackingPermission();
            await AsyncStorage.setItem(STORAGE_KEYS.TRACKING_PERMISSION, hasTrackingPermission.toString());

            console.log('Privacy accepted, tracking permission:', hasTrackingPermission);
        } catch (error) {
            console.error('Error saving privacy acceptance:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder vos préférences');
        }
    };

    // Handle privacy decline
    const handlePrivacyDecline = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_ACCEPTED, 'false');
            await AsyncStorage.setItem(STORAGE_KEYS.TRACKING_PERMISSION, 'false');
            setShowPrivacyDisclosure(false);
            setPrivacyAccepted(true); // Allow app to continue without tracking

            console.log('Privacy declined, no tracking permission');
        } catch (error) {
            console.error('Error saving privacy decline:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder vos préférences');
        }
    };

    const storeSession = async (remember) => {
        try {
            if (remember) {
                await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, 'active');
                await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
            } else {
                await AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION);
                await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'false');
            }
        } catch (err) {
            console.error('Error storing session:', err);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateInputs = () => {
        setEmailError('');

        if (!email || !password) {
            Alert.alert('Erreur', ERROR_MESSAGES.EMPTY_FIELDS);
            return false;
        }

        if (!validateEmail(email)) {
            setEmailError('Email invalide');
            Alert.alert('Erreur', ERROR_MESSAGES.INVALID_EMAIL);
            return false;
        }

        return true;
    };

    const getErrorMessage = (error) => {
        if (!error) return ERROR_MESSAGES.GENERAL_ERROR;

        const errorCode = error.code || '';
        const errorMessage = error.message || '';

        if (errorMessage.includes('network') || errorCode === 'auth/network-request-failed') {
            return ERROR_MESSAGES.NETWORK_ERROR;
        }

        if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
            return ERROR_MESSAGES.INVALID_CREDENTIALS;
        }

        if (errorCode === 'auth/too-many-requests') {
            return ERROR_MESSAGES.ACCOUNT_LOCKED;
        }

        if (errorCode === 'auth/user-disabled') {
            return 'Votre compte a été désactivé. Veuillez contacter le support.';
        }

        if (errorCode === 'auth/invalid-email') {
            return ERROR_MESSAGES.INVALID_EMAIL;
        }

        if (errorCode === 'auth/internal-error') {
            return ERROR_MESSAGES.SERVER_ERROR;
        }

        return errorMessage || ERROR_MESSAGES.GENERAL_ERROR;
    };

    const handleLogin = async () => {
        // Double-check privacy acceptance before allowing login
        if (!privacyAccepted) {
            setShowPrivacyDisclosure(true);
            return;
        }

        if (!validateInputs()) return;

        setIsLoading(true);

        try {
            const { success, error: loginError } = await signInWithEmailPassword(email, password);

            if (success) {
                await storeSession(rememberMe);
                router.replace('/');
            } else {
                const errorMessage = getErrorMessage(loginError);
                Alert.alert('Échec de connexion', errorMessage);
            }
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            Alert.alert('Erreur', errorMessage);
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToForgotPassword = () => {
        if (!privacyAccepted) {
            setShowPrivacyDisclosure(true);
            return;
        }
        router.push('/forgetPassword');
    };

    const navigateToSignUp = () => {
        if (!privacyAccepted) {
            setShowPrivacyDisclosure(true);
            return;
        }
        router.push('/sign-up');
    };

    // Show privacy disclosure if not accepted
    if (showPrivacyDisclosure) {
        return (
            <PrivacyDisclosure
                visible={showPrivacyDisclosure}
                onAccept={handlePrivacyAccept}
                onDecline={handlePrivacyDecline}
            />
        );
    }

    // Show loading while checking privacy status
    if (isCheckingPrivacy || authLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#a86e02" />
                <Text className="text-gray-700 mt-4">Chargement...</Text>
            </SafeAreaView>
        );
    }

    // Only show login form after privacy is accepted
    if (!privacyAccepted) {
        return null;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar backgroundColor="#f9fafb" barStyle="dark-content" />
            <LinearGradient colors={['#a86e02', '#8b5a02']} className="w-full h-1/3 absolute" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="items-center py-12">
                        <Image source={require('@/assets/logo.jpg')} className="w-28 h-28 mb-4 rounded-full" />
                        <Text className="text-white text-2xl font-bold">Bon Retour !</Text>
                        <Text className="text-white/90">Connectez-vous pour continuer</Text>
                    </View>

                    <View className="bg-white rounded-t-3xl flex-1 px-6 pt-8 shadow-lg">
                        <View className="mb-4">
                            <Text className="text-gray-800 mb-2 font-medium">Email</Text>
                            <View className={`flex-row items-center border rounded-xl px-4 py-3 bg-gray-50 ${
                                emailError ? 'border-red-500' : 'border-gray-200'
                            }`}>
                                <Feather name="mail" size={20} color={emailError ? "#EF4444" : "#6B7280"} />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-800"
                                    placeholder="votre@email.com"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setEmailError('');
                                    }}
                                    accessibilityLabel="Champ d'adresse email"
                                />
                            </View>
                            {emailError ? <Text className="text-red-500 text-sm mt-1">{emailError}</Text> : null}
                        </View>

                        <View className="mb-2">
                            <Text className="text-gray-800 mb-2 font-medium">Mot de passe</Text>
                            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                                <Feather name="lock" size={20} color="#6B7280" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-800"
                                    placeholder="Votre mot de passe"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!isPasswordVisible}
                                    value={password}
                                    onChangeText={setPassword}
                                    accessibilityLabel="Champ de mot de passe"
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordVisible(v => !v)}
                                    accessibilityLabel={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    <Feather
                                        name={isPasswordVisible ? 'eye-off' : 'eye'}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between mb-6">
                            <TouchableOpacity
                                className="flex-row items-center"
                                onPress={() => setRememberMe(r => !r)}
                                accessibilityLabel={rememberMe ? "Désactiver se souvenir de moi" : "Activer se souvenir de moi"}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: rememberMe }}
                            >
                                <View
                                    className={`w-5 h-5 border rounded mr-3 ${
                                        rememberMe ? 'bg-yellow-600 border-yellow-600' : 'border-gray-300 bg-white'
                                    } flex items-center justify-center`}
                                    style={{ backgroundColor: rememberMe ? '#a86e02' : 'white', borderColor: rememberMe ? '#a86e02' : '#D1D5DB' }}
                                >
                                    {rememberMe && <Feather name="check" size={14} color="white" />}
                                </View>
                                <Text className="text-gray-700">Se souvenir de moi</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={navigateToForgotPassword}
                                accessibilityLabel="Mot de passe oublié"
                            >
                                <Text style={{ color: '#a86e02' }} className="font-medium">Mot de passe oublié ?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            className="py-4 rounded-xl items-center mb-6 shadow-sm"
                            style={{ backgroundColor: '#a86e02' }}
                            onPress={handleLogin}
                            disabled={isLoading}
                            accessibilityLabel="Bouton de connexion"
                            accessibilityRole="button"
                        >
                            {isLoading ?
                                <ActivityIndicator color="white" /> :
                                <Text className="text-white font-bold text-lg">Se Connecter</Text>
                            }
                        </TouchableOpacity>

                        <View className="flex-row items-center mb-6">
                            <View className="flex-1 h-0.5 bg-gray-200" />
                            <Text className="mx-4 text-gray-500">OU</Text>
                            <View className="flex-1 h-0.5 bg-gray-200" />
                        </View>

                        <View className="flex-row justify-center mb-8">
                            <Text className="text-gray-600">Vous n'avez pas de compte ? </Text>
                            <TouchableOpacity
                                onPress={navigateToSignUp}
                                accessibilityLabel="S'inscrire"
                            >
                                <Text className="font-semibold" style={{ color: '#a86e02' }}>S'inscrire</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Privacy Settings Link */}
                        <View className="items-center pb-4">
                            <TouchableOpacity
                                onPress={() => setShowPrivacyDisclosure(true)}
                                className="flex-row items-center"
                            >
                                <Feather name="shield" size={16} color="#6B7280" />
                                <Text className="text-gray-500 text-sm ml-2">
                                    Paramètres de confidentialité
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}