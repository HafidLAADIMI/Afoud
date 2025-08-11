// @/screens/OrderConfirmationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons'; // Added FontAwesome5
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Import Firebase functions
import { getOrderById } from '@/utils/firebase'; // Assuming getOrderById is the correct function name

const OrderConfirmationScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams(); // No need for explicit type if just orderId
    const orderId = params.orderId as string; // Cast to string

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
                // Assuming getOrderById is the correct function from your firebase utils
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

    const handleGoToOrders = () => router.replace('/(protected)/(tabs)/orders'); // Adjusted path
    const handleTrackOrder = () => { if (orderId) router.push(`/(protected)/(tabs)/orders`); }; // Ensure this route exists
    const handleContinueShopping = () => router.replace('/'); // Adjusted path

    if (loading) {
    return (
        <SafeAreaView className="flex-1 bg-gray-950">
            <LinearGradient 
                colors={['#0f172a', '#1e293b']} 
                className="flex-1 justify-center items-center"
            >
                <View className="bg-gray-800/30 backdrop-blur-xl rounded-3xl p-8 mx-6 border border-gray-700/50">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-6 text-lg font-medium text-center">
                        Chargement de la confirmation...
                    </Text>
                    <View className="w-32 h-1 bg-gray-700 rounded-full mt-4 overflow-hidden">
                        <View className="w-3/4 h-full bg-orange-500 rounded-full" />
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

if (error) {
    return (
        <SafeAreaView className="flex-1 bg-gray-950">
            <LinearGradient colors={['#0f172a', '#1e293b']} className="flex-1">
                {/* Enhanced Error Header */}
                <View className="flex-row items-center px-4 py-6 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
                    <TouchableOpacity 
                        onPress={() => router.replace('/(protected)/(tabs)/home')} 
                        className="w-10 h-10 rounded-full bg-gray-800/60 items-center justify-center mr-4"
                    >
                        <Feather name="home" size={22} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Erreur de Commande</Text>
                </View>

                {/* Enhanced Error Content */}
                <View className="flex-1 justify-center items-center px-6">
                    <View className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 items-center border border-red-500/20">
                        <View className="w-24 h-24 rounded-full bg-red-500/10 items-center justify-center mb-6">
                            <Feather name="alert-circle" size={48} color="#EF4444" />
                        </View>
                        <Text className="text-white text-2xl font-bold mb-3 text-center">
                            Oops! Problème de Commande
                        </Text>
                        <Text className="text-gray-400 text-center mb-8 text-base leading-6">
                            {error}
                        </Text>
                        <TouchableOpacity 
                            onPress={handleContinueShopping} 
                            className="bg-red-500 w-full py-4 rounded-xl shadow-lg active:bg-red-600"
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                Retour à l'Accueil
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

if (!order) {
    return (
        <SafeAreaView className="flex-1 bg-gray-950 justify-center items-center">
            <Text className="text-gray-400 text-base text-center">
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
    <SafeAreaView className="flex-1 bg-gray-950">
        <LinearGradient colors={['#0f172a', '#1e293b']} className="absolute inset-0" />
        
        <ScrollView 
            className="flex-1" 
            contentContainerClassName="pb-8"
            showsVerticalScrollIndicator={false}
        >
            <View className="px-4 pt-8 space-y-6">
                {/* Success Icon */}
                <View className="items-center mb-2">
                    <View className="relative">
                        <View className="w-28 h-28 rounded-full bg-green-500/20 items-center justify-center mb-6">
                            <View className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 items-center justify-center shadow-2xl">
                                <Feather name="check" size={40} color="white" />
                            </View>
                        </View>
                        {/* Animated rings */}
                        <View className="absolute inset-0 w-28 h-28 rounded-full border-2 border-green-400/30 animate-ping" />
                    </View>
                </View>

                {/* Success Message */}
                <View className="items-center mb-6">
                    <Text className="text-white text-3xl font-bold text-center mb-2">
                        Commande Confirmée!
                    </Text>
                    {/* {orderId && (
                        // <View className="bg-gray-800/40 backdrop-blur-xl rounded-xl px-4 py-2 border border-gray-700/30">
                        //     <Text className="text-orange-400 text-lg font-semibold">
                        //         #{orderId.substring(0, 8)}...
                        //     </Text>
                        // </View>
                    )} */}
                </View>

                {/* Order Details Card */}
                <View className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/30 overflow-hidden">
                    <View className="p-5 border-b border-gray-700/30">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                                <Feather name="shopping-bag" size={16} color="#3B82F6" />
                            </View>
                            <Text className="text-white text-xl font-bold">Récapitulatif de la Commande</Text>
                        </View>
                    </View>

                    <View className="p-5 space-y-6">
                        {/* Items Summary */}
                        {order.items && order.items.length > 0 && (
                            <View>
                                <Text className="text-gray-300 text-sm font-semibold uppercase tracking-wide mb-3">
                                    Articles Commandés ({order.items.length})
                                </Text>
                                <View className="space-y-3">
                                    {/* {order.items.slice(0, 2).map((item, index) => (
                                        <View key={item.productId || index} className="flex-row justify-between items-center py-2 bg-gray-700/20 rounded-lg px-3">
                                            <Text className="text-gray-200 text-base flex-1 mr-2" numberOfLines={1}>
                                                {item.name} (x{item.quantity})
                                            </Text>
                                            <Text className="text-white text-base font-semibold">
                                                {(item.itemSubtotal || (item.priceAtPurchase * item.quantity))?.toFixed(2)} MAD
                                            </Text>
                                        </View>
                                    ))} */}
                                    {order.items.length > 2 && (
                                        <Text className="text-gray-400 text-sm italic text-right mt-2">
                                            ...et {order.items.length - 2} autre(s)
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Delivery Address */}
                        {order.deliveryOption === 'homeDelivery' && order.shippingAddress && (
                            <View className="bg-gray-700/20 rounded-xl p-4">
                                <View className="flex-row items-start">
                                    <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center mr-3 mt-1">
                                        <Feather name="map-pin" size={18} color="#10B981" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-300 text-sm font-medium mb-1">Livré à</Text>
                                        <Text className="text-white text-base font-medium leading-5">
                                            {order.shippingAddress.address || 'Adresse non spécifiée'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Contact Info */}
                        {order.phoneNumber && (
                            <View className="bg-gray-700/20 rounded-xl p-4">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                                        <Feather name="phone" size={18} color="#3B82F6" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-300 text-sm font-medium mb-1">Contact</Text>
                                        <Text className="text-white text-base font-medium">
                                            {order.phoneNumber}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Payment Method & Total */}
                        <View className="space-y-4">
                            <View className="bg-gray-700/20 rounded-xl p-4">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                                        <Feather 
                                            name={paymentMethodText === 'Carte Bancaire' ? 'credit-card' : 'dollar-sign'} 
                                            size={18} 
                                            color="#8B5CF6" 
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-300 text-sm font-medium mb-1">Méthode de Paiement</Text>
                                        <Text className="text-white text-base font-medium">
                                            {paymentMethodText}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center mr-3">
                                        <FontAwesome5 name="money-bill-wave" size={16} color="#F97316" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-300 text-sm font-medium mb-1">Montant Total</Text>
                                        <Text className="text-orange-400 text-2xl font-bold">
                                            {displayTotal.toFixed(2)} MAD
                                        </Text>
                                        <Text className={`text-sm font-medium mt-1 ${
                                            isPaymentCompleted ? 'text-green-400' : 'text-yellow-400'
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
                <View className="space-y-3 pt-2 gap-4">
                    <TouchableOpacity 
                        className="bg-gray-700/60 backdrop-blur-xl py-4 rounded-2xl flex-row items-center justify-center border border-gray-600/30 active:bg-gray-600/60" 
                        onPress={handleGoToOrders}
                    >
                        <Feather name="list" size={18} color="white" />
                        <Text className="text-white text-lg font-bold ml-3">
                            Mes Commandes
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        className="border-2 border-orange-500 py-4 rounded-2xl flex-row items-center justify-center active:bg-orange-500/10" 
                        onPress={handleContinueShopping}
                    >
                        <Feather name="shopping-bag" size={18} color="#F97316" />
                        <Text className="text-orange-400 text-lg font-bold ml-3">
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