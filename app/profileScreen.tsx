// screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    StatusBar,
    Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

const ProfileScreen = () => {
    const { user, userProfile, refreshUserProfile, logout } = useAuth();
    const [loading, setLoading] = useState(false);

    // Refresh profile data on screen focus
    useEffect(() => {
        refreshUserProfile();
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            setLoading(true);
            const success = await logout();
            if (success) {
                router.replace('/login');
            } else {
                Alert.alert('Erreur', 'Échec de déconnexion. Veuillez réessayer.');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur inattendue s\'est produite.');
        } finally {
            setLoading(false);
        }
    };

    // Handle sharing referral code
    const handleShare = async () => {
        try {
            await Share.share({
                message: `Rejoignez-moi sur FoodieDelivery ! Utilisez mon code de parrainage ${user?.uid.substring(0, 8).toUpperCase()} pour obtenir 10% de réduction sur votre première commande !`,
                title: 'Partager Code de Parrainage',
            });
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de partager le code de parrainage');
        }
    };

    // Navigate to edit profile
    const navigateToEditProfile = () => {
        router.push('/edit-profile');
    };

    // If no user, redirect to login
    if (!user) {
        router.replace('/login');
        return null;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar backgroundColor="#111827" barStyle="light-content" />

            {/* Header */}
            <LinearGradient colors={['#F97316', '#EA580C']} className="w-full absolute h-64" />

            {/* Back button */}
            <View className="px-4 pt-2 flex-row justify-between items-center">
                <TouchableOpacity
                    className="bg-white/20 p-2 rounded-full"
                    onPress={() => router.back()}
                >
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Mon Profil</Text>
                <TouchableOpacity
                    className="bg-white/20 p-2 rounded-full"
                    onPress={handleLogout}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Feather name="log-out" size={22} color="white" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Profile card */}
                <View className="mx-4 mt-8 bg-white rounded-2xl overflow-hidden shadow-xl">
                    {/* Profile header */}
                    <View className="items-center pt-6 pb-4 bg-gray-50">
                        <View className="mb-4">
                            <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md shadow-gray-400">
                                {user?.photoURL ? (
                                    <Image
                                        source={{ uri: user.photoURL }}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <View className="w-full h-full bg-orange-500 items-center justify-center">
                                        <Text className="text-white text-3xl font-bold">
                                            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity
                                className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full"
                            >
                                <Feather name="edit" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-xl font-bold text-gray-800">
                            {user?.displayName || 'Utilisateur'}
                        </Text>
                        <Text className="text-gray-500">{user?.email}</Text>

                        {userProfile?.phoneNumber && (
                            <Text className="text-gray-500">{userProfile.phoneNumber}</Text>
                        )}

                        <View className="flex-row mt-4">
                            <View className="px-4 py-2 bg-gray-100 rounded-full mx-1">
                                <Text className="text-gray-700">
                                    <FontAwesome name="star" size={14} color="#F97316" /> Membre depuis 2023
                                </Text>
                            </View>
                            <View className="px-4 py-2 bg-gray-100 rounded-full mx-1">
                                <Text className="text-gray-700">
                                    <FontAwesome name="trophy" size={14} color="#F97316" /> {userProfile?.loyaltyPoints || 0} points
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Profile sections */}
                    <View className="p-4">
                        {/* Referral section */}
                        <View className="bg-orange-50 p-4 rounded-xl mb-4 border border-orange-100">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-gray-800 font-bold text-lg">Mon Code de Parrainage</Text>
                                <TouchableOpacity
                                    className="bg-orange-500 px-3 py-1 rounded-lg"
                                    onPress={handleShare}
                                >
                                    <Text className="text-white font-bold">Partager</Text>
                                </TouchableOpacity>
                            </View>
                            <Text className="text-gray-600 mb-2">
                                Partagez votre code avec des amis et gagnez des récompenses !
                            </Text>
                            <View className="bg-white p-3 rounded-lg flex-row justify-center border border-orange-200">
                                <Text className="text-orange-600 font-bold text-lg letter-spacing-1">
                                    {user?.uid.substring(0, 8).toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        {/* Profile menu */}
                        <View className="bg-gray-50 rounded-xl overflow-hidden">
                            <TouchableOpacity
                                className="flex-row items-center px-4 py-3 border-b border-gray-200"
                                onPress={() => router.push('/orders')}
                            >
                                <Feather name="shopping-bag" size={20} color="#F97316" />
                                <Text className="text-gray-800 ml-3 flex-1">Mes Commandes</Text>
                                <Feather name="chevron-right" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                            {/* 
                            <TouchableOpacity
                                className="flex-row items-center px-4 py-3 border-b border-gray-200"
                            >
                                <Feather name="map-pin" size={20} color="#F97316" />
                                <Text className="text-gray-800 ml-3 flex-1">Adresses Enregistrées</Text>
                                <Feather name="chevron-right" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                                */}
                                {/* 
                            <TouchableOpacity
                                className="flex-row items-center px-4 py-3 border-b border-gray-200"
                            >
                                <Feather name="credit-card" size={20} color="#F97316" />
                                <Text className="text-gray-800 ml-3 flex-1">Méthodes de Paiement</Text>
                                <Feather name="chevron-right" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                                    
                            */}
                            <TouchableOpacity
                                className="flex-row items-center px-4 py-3 border-b border-gray-200"
                                onPress={() => router.push('/favorites')}
                            >
                                <Feather name="heart" size={20} color="#F97316" />
                                <Text className="text-gray-800 ml-3 flex-1">Favoris</Text>
                                <Feather name="chevron-right" size={20} color="#9CA3AF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center px-4 py-3"
                                onPress={() => router.push('/helpAndSupportScreen')}
                            >
                                <Feather name="help-circle" size={20} color="#F97316" />
                                <Text className="text-gray-800 ml-3 flex-1">Aide & Support</Text>
                                <Feather name="chevron-right" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* Logout button */}
                        <TouchableOpacity
                            className="mt-6 bg-gray-200 py-3 rounded-xl items-center"
                            onPress={handleLogout}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#F97316" />
                            ) : (
                                <Text className="text-gray-800 font-semibold">Se Déconnecter</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Account deletion */}
                <TouchableOpacity
                    className="mt-6 mb-10 mx-auto"
                    onPress={() => Alert.alert(
                        'Supprimer le Compte',
                        'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action ne peut pas être annulée.',
                        [
                            { text: 'Annuler', style: 'cancel' },
                            {
                                text: 'Supprimer',
                                style: 'destructive',
                                onPress: () => Alert.alert('Fonctionnalité non implémentée', 'La suppression de compte n\'est pas encore disponible.')
                            }
                        ]
                    )}
                >
                    <Text className="text-red-500">Supprimer le Compte</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;