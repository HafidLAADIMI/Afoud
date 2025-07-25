// screens/SignUpScreen.tsx
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
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrivacyDisclosure } from '@/components/PrivacyDisclosure';
import { requestTrackingPermission } from '@/utils/trackingPermission';

// Error message constants for easier maintenance
const ERROR_MESSAGES = {
    EMPTY_FIELDS: 'Veuillez remplir tous les champs',
    PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
    PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 6 caractères',
    INVALID_EMAIL: 'Veuillez entrer une adresse email valide',
    EMAIL_IN_USE: 'Cette adresse email est déjà utilisée',
    NAME_TOO_SHORT: 'Le nom doit contenir au moins 2 caractères',
    NETWORK_ERROR: 'Problème de connexion réseau. Veuillez vérifier votre connexion internet.',
    SERVER_ERROR: 'Le serveur ne répond pas. Veuillez réessayer plus tard.',
    GENERAL_ERROR: 'Une erreur inattendue est survenue. Veuillez réessayer.',
    PASSWORD_REQUIREMENTS: 'Le mot de passe doit contenir au moins 6 caractères, incluant une lettre majuscule et un chiffre',
    INVALID_CHARACTERS: 'Certains caractères saisis ne sont pas autorisés'
};

// Storage keys for better organization
const STORAGE_KEYS = {
    PRIVACY_ACCEPTED: '@privacy_accepted',
    TRACKING_PERMISSION: '@tracking_permission'
};

// Password requirements
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{6,}$/; // At least 6 chars, 1 uppercase, 1 digit

export default function SignUpScreen() {
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form validation state
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Privacy states
    const [showPrivacyDisclosure, setShowPrivacyDisclosure] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [isCheckingPrivacy, setIsCheckingPrivacy] = useState(true);

    // Get auth context
    const { signUpWithEmailPassword } = useAuth();

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

    // Handle privacy acceptance
    const handlePrivacyAccept = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_ACCEPTED, 'true');
            setPrivacyAccepted(true);
            setShowPrivacyDisclosure(false);

            // Request tracking permission after privacy acceptance
            const hasTrackingPermission = await requestTrackingPermission();
            await AsyncStorage.setItem(STORAGE_KEYS.TRACKING_PERMISSION, hasTrackingPermission.toString());

            console.log('Privacy accepted for signup, tracking permission:', hasTrackingPermission);
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

            console.log('Privacy declined for signup, no tracking permission');
        } catch (error) {
            console.error('Error saving privacy decline:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder vos préférences');
        }
    };

    // Validate email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate form inputs
    const validateInputs = () => {
        // Reset all error states
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        let isValid = true;

        // Check for empty fields
        if (!name) {
            setNameError('Le nom est requis');
            isValid = false;
        } else if (name.length < 2) {
            setNameError(ERROR_MESSAGES.NAME_TOO_SHORT);
            isValid = false;
        }

        if (!email) {
            setEmailError('L\'email est requis');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError(ERROR_MESSAGES.INVALID_EMAIL);
            isValid = false;
        }

        if (!password) {
            setPasswordError('Le mot de passe est requis');
            isValid = false;
        } else if (password.length < PASSWORD_MIN_LENGTH) {
            setPasswordError(ERROR_MESSAGES.PASSWORD_TOO_SHORT);
            isValid = false;
        } else if (!PASSWORD_REGEX.test(password)) {
            setPasswordError(ERROR_MESSAGES.PASSWORD_REQUIREMENTS);
            isValid = false;
        }

        if (!confirmPassword) {
            setConfirmPasswordError('La confirmation du mot de passe est requise');
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError(ERROR_MESSAGES.PASSWORD_MISMATCH);
            isValid = false;
        }

        return isValid;
    };

    // Map backend errors to user-friendly messages
    const getErrorMessage = (error) => {
        if (!error) return ERROR_MESSAGES.GENERAL_ERROR;

        const errorCode = error.code || '';
        const errorMessage = error.message || '';

        if (errorMessage.includes('network') || errorCode === 'auth/network-request-failed') {
            return ERROR_MESSAGES.NETWORK_ERROR;
        }

        if (errorCode === 'auth/email-already-in-use') {
            return ERROR_MESSAGES.EMAIL_IN_USE;
        }

        if (errorCode === 'auth/invalid-email') {
            return ERROR_MESSAGES.INVALID_EMAIL;
        }

        if (errorCode === 'auth/weak-password') {
            return ERROR_MESSAGES.PASSWORD_REQUIREMENTS;
        }

        if (errorCode === 'auth/operation-not-allowed') {
            return 'L\'inscription par email/mot de passe n\'est pas activée. Veuillez contacter le support.';
        }

        if (errorCode === 'auth/internal-error') {
            return ERROR_MESSAGES.SERVER_ERROR;
        }

        return errorMessage || ERROR_MESSAGES.GENERAL_ERROR;
    };

    // Handle sign up with email/password
    const handleSignUp = async () => {
        // Double-check privacy acceptance before allowing signup
        if (!privacyAccepted) {
            setShowPrivacyDisclosure(true);
            return;
        }

        // Validate all inputs first
        if (!validateInputs()) {
            return;
        }

        // Sign up
        setIsLoading(true);
        try {
            const { success, error } = await signUpWithEmailPassword(email, password, name);

            if (success) {
                // Show success message before redirecting
                Alert.alert(
                    'Compte créé',
                    'Votre compte a été créé avec succès. Vous allez être redirigé vers l\'accueil.',
                    [{ text: 'OK', onPress: () => router.replace('/') }]
                );
            } else {
                const errorMessage = getErrorMessage(error);
                Alert.alert('Échec d\'inscription', errorMessage);

                // Update form validation errors based on the error type
                if (error?.code === 'auth/email-already-in-use') {
                    setEmailError(ERROR_MESSAGES.EMAIL_IN_USE);
                } else if (error?.code === 'auth/invalid-email') {
                    setEmailError(ERROR_MESSAGES.INVALID_EMAIL);
                } else if (error?.code === 'auth/weak-password') {
                    setPasswordError(ERROR_MESSAGES.PASSWORD_REQUIREMENTS);
                }
            }
        } catch (error: any) {
            const errorMessage = getErrorMessage(error);
            Alert.alert('Erreur', errorMessage);
            console.error('Signup error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Navigate to login screen
    const navigateToLogin = () => {
        if (!privacyAccepted) {
            setShowPrivacyDisclosure(true);
            return;
        }
        router.push('/login');
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        if (!password) return { strength: '', color: 'transparent' };

        if (password.length < 6) {
            return { strength: 'Faible', color: '#EF4444' }; // red
        }

        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        const score = [hasUppercase, hasLowercase, hasDigit, hasSpecial].filter(Boolean).length;

        if (score <= 2) return { strength: 'Moyen', color: '#F59E0B' }; // amber
        if (score === 3) return { strength: 'Bon', color: '#10B981' }; // green
        return { strength: 'Excellent', color: '#059669' }; // emerald
    };

    const passwordStrength = getPasswordStrength();

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
    if (isCheckingPrivacy) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#F97316" />
                <Text className="text-white mt-4">Chargement...</Text>
            </SafeAreaView>
        );
    }

    // Only show signup form after privacy is accepted
    if (!privacyAccepted) {
        return null;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar backgroundColor="#111827" barStyle="light-content" />

            {/* Header */}
            <LinearGradient colors={['#F97316', '#EA580C']} className="w-full h-1/4 absolute" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
                    {/* Logo and Welcome text */}
                    <View className="items-center justify-center py-8">
                        <Image
                            source={require('@/assets/logo.jpg')}
                            className="w-20 h-20 mb-2"
                            resizeMode="contain"
                        />
                        <Text className="text-white text-2xl font-bold">Créer un Compte</Text>
                        <Text className="text-white/80 text-base">Inscrivez-vous pour commencer</Text>
                    </View>

                    {/* Sign Up form */}
                    <View className="bg-white rounded-t-3xl flex-1 px-6 pt-8">
                        {/* Name input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2 font-medium">Nom Complet</Text>
                            <View className={`flex-row items-center border rounded-xl px-4 py-2 ${
                                nameError ? 'border-red-500' : 'border-gray-300'
                            }`}>
                                <Feather name="user" size={20} color={nameError ? "#EF4444" : "#9CA3AF"} />
                                <TextInput
                                    className="flex-1 ml-2 text-gray-800"
                                    placeholder="Votre nom complet"
                                    placeholderTextColor="#9CA3AF"
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        setNameError('');
                                    }}
                                    accessibilityLabel="Champ de nom complet"
                                />
                            </View>
                            {nameError ? <Text className="text-red-500 text-sm mt-1">{nameError}</Text> : null}
                        </View>

                        {/* Email input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
                            <View className={`flex-row items-center border rounded-xl px-4 py-2 ${
                                emailError ? 'border-red-500' : 'border-gray-300'
                            }`}>
                                <Feather name="mail" size={20} color={emailError ? "#EF4444" : "#9CA3AF"} />
                                <TextInput
                                    className="flex-1 ml-2 text-gray-800"
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

                        {/* Password input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2 font-medium">Mot de passe</Text>
                            <View className={`flex-row items-center border rounded-xl px-4 py-2 ${
                                passwordError ? 'border-red-500' : 'border-gray-300'
                            }`}>
                                <Feather name="lock" size={20} color={passwordError ? "#EF4444" : "#9CA3AF"} />
                                <TextInput
                                    className="flex-1 ml-2 text-gray-800"
                                    placeholder="Créer un mot de passe"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!isPasswordVisible}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setPasswordError('');
                                    }}
                                    accessibilityLabel="Champ de mot de passe"
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                    accessibilityLabel={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    <Feather
                                        name={isPasswordVisible ? "eye-off" : "eye"}
                                        size={20}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            </View>
                            {passwordError ? (
                                <Text className="text-red-500 text-sm mt-1">{passwordError}</Text>
                            ) : password ? (
                                <View className="flex-row items-center mt-1">
                                    <View className="h-1 flex-1 bg-gray-200 rounded-full">
                                        <View
                                            className="h-1 rounded-full"
                                            style={{ backgroundColor: passwordStrength.color, width: `${password.length > 12 ? 100 : (password.length/12)*100}%` }}
                                        />
                                    </View>
                                    <Text className="text-xs ml-2" style={{ color: passwordStrength.color }}>
                                        {passwordStrength.strength}
                                    </Text>
                                </View>
                            ) : null}
                            {password && !passwordError && (
                                <Text className="text-gray-500 text-xs mt-1">
                                    Le mot de passe doit contenir au moins 6 caractères, une majuscule et un chiffre
                                </Text>
                            )}
                        </View>

                        {/* Confirm Password input */}
                        <View className="mb-6">
                            <Text className="text-gray-700 mb-2 font-medium">Confirmer le Mot de passe</Text>
                            <View className={`flex-row items-center border rounded-xl px-4 py-2 ${
                                confirmPasswordError ? 'border-red-500' : 'border-gray-300'
                            }`}>
                                <Feather name="lock" size={20} color={confirmPasswordError ? "#EF4444" : "#9CA3AF"} />
                                <TextInput
                                    className="flex-1 ml-2 text-gray-800"
                                    placeholder="Confirmer le mot de passe"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!isConfirmPasswordVisible}
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        setConfirmPasswordError('');
                                    }}
                                    accessibilityLabel="Champ de confirmation de mot de passe"
                                />
                                <TouchableOpacity
                                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                    accessibilityLabel={isConfirmPasswordVisible ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
                                >
                                    <Feather
                                        name={isConfirmPasswordVisible ? "eye-off" : "eye"}
                                        size={20}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            </View>
                            {confirmPasswordError ? <Text className="text-red-500 text-sm mt-1">{confirmPasswordError}</Text> : null}
                        </View>

                        {/* Sign Up button */}
                        <TouchableOpacity
                            className="bg-orange-500 py-3 rounded-xl items-center mb-6"
                            onPress={handleSignUp}
                            disabled={isLoading}
                            accessibilityLabel="Bouton de création de compte"
                            accessibilityRole="button"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Créer un Compte</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View className="flex-row items-center mb-6">
                            <View className="flex-1 h-0.5 bg-gray-300" />
                            <Text className="mx-4 text-gray-500">OU</Text>
                            <View className="flex-1 h-0.5 bg-gray-300" />
                        </View>

                        {/* Login link */}
                        <View className="flex-row justify-center mb-4">
                            <Text className="text-gray-600">Vous avez déjà un compte ? </Text>
                            <TouchableOpacity
                                onPress={navigateToLogin}
                                accessibilityLabel="Se connecter à un compte existant"
                            >
                                <Text className="text-orange-500 font-semibold">Se Connecter</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Privacy Settings Link */}
                        <View className="items-center pb-8">
                            <TouchableOpacity
                                onPress={() => setShowPrivacyDisclosure(true)}
                                className="flex-row items-center"
                            >
                                <Feather name="shield" size={16} color="#9CA3AF" />
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