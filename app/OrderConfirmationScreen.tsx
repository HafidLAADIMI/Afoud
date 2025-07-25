import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getOrderById } from '../utils/firebase';

const OrderConfirmationScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const orderId = params?.orderId;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrderDetails = async () => {
            if (!orderId) {
                setLoading(false);
                return;
            }

            try {
                const orderDetails = await getOrderById(orderId);
                setOrder(orderDetails);
            } catch (error) {
                console.error('Error loading order details:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrderDetails();
    }, [orderId]);

    const handleTrackOrder = () => {
        router.push({
            pathname: '/order-tracking',
            params: { orderId }
        });
    };

    const handleBackToHome = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
                <ActivityIndicator size="large" color="#F97316" />
                <Text className="text-white mt-4">Chargement des détails de la commande...</Text>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900">
                <View className="flex-1 items-center justify-center p-4">
                    <Feather name="alert-circle" size={64} color="#F97316" />
                    <Text className="text-white text-xl font-bold mt-6 text-center">
                        Commande Introuvable
                    </Text>
                    <Text className="text-gray-400 text-center mt-2">
                        Nous n'avons pas pu trouver les détails de la commande. Veuillez réessayer.
                    </Text>
                    <TouchableOpacity
                        className="bg-orange-500 py-3 px-6 rounded-lg mt-8"
                        onPress={handleBackToHome}
                    >
                        <Text className="text-white font-bold">Retour à l'Accueil</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="p-4 border-b border-gray-800">
                <TouchableOpacity onPress={handleBackToHome}>
                    <Feather name="x" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 items-center justify-center p-6">
                <View className="w-24 h-24 rounded-full bg-green-500 items-center justify-center mb-8">
                    <Feather name="check" size={48} color="white" />
                </View>

                <Text className="text-white text-2xl font-bold text-center">
                    Commande Confirmée !
                </Text>

                <Text className="text-gray-400 text-center mt-3 mb-6">
                    Votre commande a été passée avec succès. Nous vous informerons dès qu'elle sera en route.
                </Text>

                <View className="bg-gray-800 w-full rounded-xl p-4 mb-6">
                    <View className="border-b border-gray-700 pb-3 mb-3">
                        <Text className="text-gray-400">Numéro de Commande</Text>
                        <Text className="text-white font-medium">{orderId}</Text>
                    </View>

                    <View className="border-b border-gray-700 pb-3 mb-3">
                        <Text className="text-gray-400">Adresse de Livraison</Text>
                        <Text className="text-white font-medium">
                            {order.address?.address || 'Adresse non disponible'}
                        </Text>
                    </View>

                    <View className="border-b border-gray-700 pb-3 mb-3">
                        <Text className="text-gray-400">Méthode de Paiement</Text>
                        <Text className="text-white font-medium">
                            {order.paymentMethod === 'card' ? 'Carte Bancaire' : 'Paiement à la Livraison'}
                        </Text>
                    </View>

                    <View>
                        <Text className="text-gray-400">Montant Total</Text>
                        <Text className="text-orange-500 font-bold">
                            {order.totalAmount?.toFixed(2) || '0.00'} MAD
                        </Text>
                    </View>
                </View>

                <View className="w-full">
                    <TouchableOpacity
                        className="bg-orange-500 py-4 rounded-xl w-full items-center mb-3"
                        onPress={handleTrackOrder}
                    >
                        <Text className="text-white font-bold">Suivre ma Commande</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="border border-gray-700 py-4 rounded-xl w-full items-center"
                        onPress={handleBackToHome}
                    >
                        <Text className="text-white">Continuer mes Achats</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default OrderConfirmationScreen;