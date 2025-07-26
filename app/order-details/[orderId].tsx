import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Import Firebase functions
import { getOrderDetails } from '@/utils/firebase';

const OrderConfirmationScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ orderId?: string }>();
    const orderId = params.orderId;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                setLoading(false);
                return;
            }

            try {
                const orderData = await getOrderDetails(orderId);
                setOrder(orderData);
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const handleGoToOrders = () => {
        router.push('/orders');
    };

    const handleTrackOrder = () => {
        if (orderId) {
            router.push(`/orders`);
        }
    };

    const handleContinueShopping = () => {
        router.push("/")
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-4">Chargement des détails de la commande...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <ScrollView className="flex-1">
                {/* Success Animation/Image */}
                <View className="items-center justify-center pt-10 pb-6">
                    <View className="w-24 h-24 bg-green-500 rounded-full items-center justify-center mb-4">
                        <Feather name="check" size={50} color="white" />
                    </View>
                    <Text className="text-white text-2xl font-bold">Commande passée avec succès !</Text>
                    {orderId && (
                        <Text className="text-gray-400 mt-2">Commande #{orderId}</Text>
                    )}
                </View>

                {/* Order Details Card */}
                {order && (
                    <View className="mx-4 mb-6 bg-gray-800 rounded-xl overflow-hidden">
                        <LinearGradient
                            colors={['#1F2937', '#111827']}
                            className="px-4 py-3 border-b border-gray-700"
                        >
                            <Text className="text-white font-bold text-lg">Résumé de la commande</Text>
                        </LinearGradient>

                        <View className="p-4">
                            {/* Restaurant */}
                            <View className="flex-row items-center mb-4">
                                <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center">
                                    <Feather name="home" size={18} color="#F97316" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-white font-medium">{order.restaurant}</Text>
                                    <Text className="text-gray-400 text-xs mt-1">Livraison estimée : 30-45 min</Text>
                                </View>
                            </View>

                            {/* Delivery Address - Only show for home delivery */}
                            {order.deliveryOption === 'homeDelivery' && (
                                <View className="flex-row items-start mb-4">
                                    <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center mt-1">
                                        <Feather name="map-pin" size={18} color="#F97316" />
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <Text className="text-white font-medium">Adresse de livraison</Text>
                                        <Text className="text-gray-400 text-sm mt-1">{order.address?.address}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Payment Method */}
                            <View className="flex-row items-center mb-4">
                                <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center">
                                    <Feather
                                        name={order.paymentMethod === 'card' ? 'credit-card' : 'dollar-sign'}
                                        size={18}
                                        color="#F97316"
                                    />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-white font-medium">Méthode de paiement</Text>
                                    <Text className="text-gray-400 text-sm mt-1">
                                        {order.paymentMethod === 'card' ? 'Carte de crédit/débit' : 'Paiement à la livraison'}
                                    </Text>
                                </View>
                            </View>

                            {/* Total Amount */}
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center">
                                    <Feather name="dollar-sign" size={18} color="#F97316" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-white font-medium">Montant total</Text>
                                    <Text className="text-orange-500 font-bold text-lg mt-1">
                                        {order.totalAmount?.toFixed(2)} DH
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Info Card */}
                <View className="mx-4 mb-6 bg-gray-800 p-4 rounded-xl">
                    <View className="flex-row items-start">
                        <Feather name="info" size={20} color="#60A5FA" className="mt-1" />
                        <View className="ml-3 flex-1">
                            <Text className="text-white font-medium">Confirmation de commande</Text>
                            <Text className="text-gray-400 mt-2">
                                Nous avons envoyé un email de confirmation avec les détails de votre commande. Vous pouvez suivre le statut de votre commande dans la section "Mes commandes".
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="px-4 pb-8">
                    <TouchableOpacity
                        className="bg-orange-500 py-4 rounded-xl items-center mb-3 shadow-lg shadow-orange-900/30"
                        onPress={handleTrackOrder}
                    >
                        <Text className="text-white font-bold text-lg">Suivre la commande</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-800 py-4 rounded-xl items-center mb-3"
                        onPress={handleGoToOrders}
                    >
                        <Text className="text-white font-bold text-lg">Voir toutes les commandes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-transparent py-4 rounded-xl items-center border border-orange-500"
                        onPress={handleContinueShopping}
                    >
                        <Text className="text-orange-500 font-bold text-lg">Continuer les achats</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default OrderConfirmationScreen;