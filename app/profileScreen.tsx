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
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar backgroundColor="#F9FAFB" barStyle="dark-content" />

            {/* Header with gradient */}
            <LinearGradient 
                colors={['#a86e02', '#8b5a02']} 
                className="w-full absolute h-48" 
            />

            {/* Back button and title */}
            <View className="px-5 pt-3 flex-row justify-between items-center">
                <TouchableOpacity
                    className="bg-white/20 p-3 rounded-xl"
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                >
                    <Feather name="arrow-left" size={22} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Mon Profil</Text>
                <TouchableOpacity
                    className="bg-white/20 p-3 rounded-xl"
                    onPress={handleLogout}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Feather name="log-out" size={20} color="white" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile card */}
                <View className="mx-4 mt-12 bg-white rounded-2xl overflow-hidden" style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.1,
                    shadowRadius: 16,
                    elevation: 10,
                }}>
                    {/* Profile header */}
                    <View className="items-center pt-8 pb-6 bg-gradient-to-b from-gray-50 to-white">
                        <View className="mb-4 relative">
                            <View className="w-28 h-28 rounded-full overflow-hidden border-4 border-white" style={{
                                shadowColor: '#a86e02',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                                elevation: 6,
                            }}>
                                {user?.photoURL ? (
                                    <Image
                                        source={{ uri: user.photoURL }}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={['#a86e02', '#8b5a02']}
                                        className="w-full h-full items-center justify-center"
                                    >
                                        <Text className="text-white text-4xl font-bold">
                                            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                                        </Text>
                                    </LinearGradient>
                                )}
                            </View>
                            {/* <TouchableOpacity
                                className="absolute bottom-1 right-1 bg-white p-2 rounded-full border-2 border-yellow-100"
                                onPress={navigateToEditProfile}
                                activeOpacity={0.8}
                                style={{
                                    shadowColor: '#a86e02',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                            >
                                <Feather name="edit-3" size={16} color="#a86e02" />
                            </TouchableOpacity> */}
                        </View>
                        
                    
                        <Text className="text-gray-600 mb-1">{user?.email}</Text>

                        {userProfile?.phoneNumber && (
                            <Text className="text-gray-500 text-sm">{userProfile.phoneNumber}</Text>
                        )}

                    
                       
                    </View>

                    {/* Profile sections */}
                    <View className="p-5">         

                        {/* Profile menu */}
                        <View className="bg-white rounded-xl overflow-hidden border border-gray-100">
                            <TouchableOpacity
                                className="flex-row items-center px-4 py-4 border-b border-gray-100"
                                onPress={() => router.push('/orders')}
                                activeOpacity={0.7}
                            >
                                <View className="bg-blue-50 p-2 rounded-full mr-4">
                                    <Feather name="shopping-bag" size={18} color="#2563EB" />
                                </View>
                                <Text className="text-gray-900 ml-1 flex-1 font-medium">Mes Commandes</Text>
                                <Feather name="chevron-right" size={20} color="#9CA3AF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center px-4 py-4 border-b border-gray-100"
                                onPress={() => router.push('/favorites')}
                                activeOpacity={0.7}
                            >
                                <View className="bg-red-50 p-2 rounded-full mr-4">
                                    <Feather name="heart" size={18} color="#DC2626" />
                                </View>
                                <Text className="text-gray-900 ml-1 flex-1 font-medium">Favoris</Text>
                                <Feather name="chevron-right" size={20} color="#9CA3AF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center px-4 py-4"
                                onPress={() => router.push('/helpAndSupportScreen')}
                                activeOpacity={0.7}
                            >
                                <View className="bg-green-50 p-2 rounded-full mr-4">
                                    <Feather name="help-circle" size={18} color="#059669" />
                                </View>
                                <Text className="text-gray-900 ml-1 flex-1 font-medium">Aide & Support</Text>
                                <Feather name="chevron-right" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* Logout button */}
                        <TouchableOpacity
                            className="mt-6 bg-gray-100 py-4 rounded-xl items-center border border-gray-200"
                            onPress={handleLogout}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#a86e02" />
                            ) : (
                                <View className="flex-row items-center">
                                    <Feather name="log-out" size={18} color="#6B7280" />
                                    <Text className="text-gray-700 font-semibold ml-2">Se Déconnecter</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Account deletion */}
                <TouchableOpacity
                    className="mt-6 mb-10 mx-auto bg-red-50 px-4 py-2 rounded-lg border border-red-100"
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
                    activeOpacity={0.8}
                >
                    <Text className="text-red-600 text-sm font-medium">Supprimer le Compte</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;