// @/screens/OrderConfirmationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Import Firebase functions
import { getOrderById } from '@/utils/firebase';

const OrderConfirmationScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                setError("ID de commande manquant.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const orderData = await getOrderById(orderId);
                if (orderData) {
                    setOrder(orderData);
                    console.log("OrderConfirmationScreen: Fetched order details:", orderData);
                } else {
                    setError(`Commande non trouvée (ID: ${orderId}).`);
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError(`Erreur de chargement: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    const handleGoToOrders = () => router.replace('/(protected)/(tabs)/orders');
    const handleTrackOrder = () => { if (orderId) router.push(`/(protected)/(tabs)/orders`); };
    const handleContinueShopping = () => router.replace('/');

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center">
                    <View className="bg-white rounded-2xl p-8 mx-6 border border-gray-200" style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 8,
                    }}>
                        <ActivityIndicator size="large" color="#a86e02" />
                        <Text className="text-gray-700 mt-6 text-lg font-medium text-center">
                            Chargement de la confirmation...
                        </Text>
                        <View className="w-32 h-1 bg-gray-200 rounded-full mt-4 overflow-hidden mx-auto">
                            <View className="w-3/4 h-full rounded-full" style={{ backgroundColor: '#a86e02' }} />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                {/* Error Header */}
                <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-200">
                    <TouchableOpacity 
                        onPress={() => router.replace('/(protected)/(tabs)/home')} 
                        className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-4"
                    >
                        <Feather name="home" size={20} color="#6B7280" />
                    </TouchableOpacity>
                    <Text className="text-gray-900 text-xl font-bold">Erreur de Commande</Text>
                </View>

                {/* Error Content */}
                <View className="flex-1 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-8 items-center border border-red-200" style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 8,
                    }}>
                        <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-6">
                            <Feather name="alert-circle" size={40} color="#DC2626" />
                        </View>
                        <Text className="text-gray-900 text-2xl font-bold mb-3 text-center">
                            Oops! Problème de Commande
                        </Text>
                        <Text className="text-gray-600 text-center mb-8 text-base leading-6">
                            {error}
                        </Text>
                        <TouchableOpacity 
                            onPress={handleContinueShopping} 
                            className="w-full py-4 rounded-xl"
                            style={{ backgroundColor: '#DC2626' }}
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                Retour à l'Accueil
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
                <Text className="text-gray-600 text-base text-center">
                    Détails de la commande non disponibles.
                </Text>
            </SafeAreaView>
        );
    }

    // Determine correct total field from order object
    const displayTotal = order.grandTotal != null ? order.grandTotal : (order.total != null ? order.total : 0);

    const paymentMethodText = order.paymentMethod === 'card' || order.paymentMethod === 'online_payment'
        ? 'Carte Bancaire'
        : (order.paymentMethod === 'cash_on_delivery' || order.paymentMethod === 'cash'
            ? 'Paiement à la Livraison'
            : 'Non spécifié');

    // Determine payment status
    const isPaymentCompleted =
        order.paymentDetails?.status === 'paid' ||
        order.paymentDetails?.status === 'paid_online' ||
        (order.paymentMethod === 'card' &&
            (order.status === 'confirmed' || order.paymentDetails?.status));

    const paymentStatusText = isPaymentCompleted
        ? 'Payé'
        : order.paymentMethod === 'cash_on_delivery' || order.paymentMethod === 'cash'
            ? 'À payer à la livraison'
            : 'En attente de paiement';

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView 
                className="flex-1" 
                contentContainerClassName="pb-8"
                showsVerticalScrollIndicator={false}
            >
                <View className="px-5 pt-8 space-y-6">
                    {/* Success Icon */}
                    <View className="items-center mb-4">
                        <View className="relative">
                            <View className="w-28 h-28 rounded-full bg-green-50 items-center justify-center mb-6" style={{
                                shadowColor: '#059669',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.2,
                                shadowRadius: 16,
                                elevation: 10,
                            }}>
                                <LinearGradient
                                    colors={['#059669', '#047857']}
                                    className="w-20 h-20 rounded-full items-center justify-center"
                                >
                                    <Feather name="check" size={40} color="white" />
                                </LinearGradient>
                            </View>
                            {/* Animated ring */}
                            <View className="absolute inset-0 w-28 h-28 rounded-full border-2 border-green-300 opacity-30" />
                        </View>
                    </View>

                    {/* Success Message */}
                    <View className="items-center mb-6">
                        <Text className="text-gray-900 text-3xl font-bold text-center mb-3">
                            Commande Confirmée!
                        </Text>
                        <Text className="text-gray-600 text-center text-base leading-6">
                            Votre commande a été reçue et est en cours de préparation
                        </Text>
                    </View>

                    {/* Order Details Card */}
                    <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        elevation: 6,
                    }}>
                        <View className="p-5 border-b border-gray-100 bg-gray-50">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                                    <Feather name="shopping-bag" size={18} color="#3B82F6" />
                                </View>
                                <Text className="text-gray-900 text-xl font-bold">Récapitulatif de la Commande</Text>
                            </View>
                        </View>

                        <View className="p-5 space-y-6">
                            {/* Items Summary */}
                            {order.items && order.items.length > 0 && (
                                <View>
                                    <Text className="text-gray-700 text-sm font-semibold uppercase tracking-wide mb-3">
                                        Articles Commandés ({order.items.length})
                                    </Text>
                                    <View className="space-y-3">
                                        {order.items.length > 3 && (
                                            <Text className="text-gray-500 text-sm text-center mt-2">
                                                ...et {order.items.length - 3} autre(s) article(s)
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Delivery Address */}
                            {order.deliveryOption === 'homeDelivery' && order.shippingAddress && (
                                <View className="bg-green-50 rounded-xl p-4 border border-green-100">
                                    <View className="flex-row items-start">
                                        <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center mr-3 mt-1">
                                            <Feather name="map-pin" size={18} color="#059669" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-green-700 text-sm font-semibold mb-1">Livré à</Text>
                                            <Text className="text-gray-900 text-base font-medium leading-5">
                                                {order.shippingAddress.region && (
                                                    <Text className="font-bold">{order.shippingAddress.region}{'\n'}</Text>
                                                )}
                                                {order.shippingAddress.address || 'Adresse non spécifiée'}
                                            </Text>
                                            {order.shippingAddress.instructions && (
                                                <Text className="text-gray-600 text-sm mt-2 italic">
                                                    📝 {order.shippingAddress.instructions}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Contact Info */}
                            {order.phoneNumber && (
                                <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center mr-3">
                                            <Feather name="phone" size={18} color="#2563EB" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-blue-700 text-sm font-semibold mb-1">Contact</Text>
                                            <Text className="text-gray-900 text-base font-medium">
                                                {order.phoneNumber}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Payment Method & Total */}
                            <View className="space-y-4">
                                <View className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center mr-3">
                                            <Feather 
                                                name={paymentMethodText === 'Carte Bancaire' ? 'credit-card' : 'dollar-sign'} 
                                                size={18} 
                                                color="#7C3AED" 
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-purple-700 text-sm font-semibold mb-1">Méthode de Paiement</Text>
                                            <Text className="text-gray-900 text-base font-medium">
                                                {paymentMethodText}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 rounded-xl bg-yellow-100 items-center justify-center mr-4">
                                            <FontAwesome5 name="money-bill-wave" size={18} color="#a86e02" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-yellow-700 text-sm font-semibold mb-1">Montant Total</Text>
                                            <Text className="text-2xl font-bold" style={{ color: '#a86e02' }}>
                                                {displayTotal.toFixed(2)} MAD
                                            </Text>
                                            <Text className={`text-sm font-medium mt-1 ${
                                                isPaymentCompleted ? 'text-green-600' : 'text-yellow-600'
                                            }`}>
                                                {paymentStatusText}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="space-y-4 pt-4">
                        <TouchableOpacity 
                            className="bg-white border-2 border-gray-200 py-4 rounded-2xl flex-row items-center justify-center" 
                            onPress={handleGoToOrders}
                            activeOpacity={0.8}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 3,
                            }}
                        >
                            <Feather name="list" size={20} color="#6B7280" />
                            <Text className="text-gray-700 text-lg font-bold ml-3">
                                Mes Commandes
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            className="py-4 rounded-2xl flex-row items-center justify-center my-4" 
                            onPress={handleContinueShopping}
                            activeOpacity={0.9}
                            style={{
                                backgroundColor: '#a86e02',
                                shadowColor: '#a86e02',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 6,
                            }}
                        >
                            <Feather name="shopping-bag" size={20} color="white" />
                            <Text className="text-white text-lg font-bold ml-3">
                                Continuer les Achats
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default OrderConfirmationScreen;