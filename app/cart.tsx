import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Switch, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Import cart data from firebase
import { getCartItems, getRecommendedItems, updateCartItemQuantity, removeCartItem } from '@/utils/firebase';

export default function CartScreen() {
    const [extraPackaging, setExtraPackaging] = useState(false);
    const [addCutlery, setAddCutlery] = useState(false);
    const [unavailableExpanded, setUnavailableExpanded] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch cart and recommended items
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [cartData, recommendedData] = await Promise.all([
                    getCartItems(),
                    getRecommendedItems()
                ]);
                setCartItems(cartData);
                setRecommendedItems(recommendedData);
            } catch (error) {
                console.error('Error loading cart data:', error);
                Alert.alert('Erreur', 'Impossible de charger les articles de votre panier. Veuillez réessayer.');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Add packaging cost if selected
    const totalCost = subtotal + (extraPackaging ? 2 : 0);

    // Amount needed for free delivery
    const freeDeliveryThreshold = 30;
    const amountForFreeDelivery = Math.max(0, freeDeliveryThreshold - totalCost);

    const handleRemoveItem = async (itemId) => {
        try {
            await removeCartItem(itemId);
            setCartItems(cartItems.filter(item => item.id !== itemId));
            Alert.alert('Succès', 'Article retiré du panier');
        } catch (error) {
            console.error('Error removing item:', error);
            Alert.alert('Erreur', 'Impossible de retirer l\'article du panier');
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            await updateCartItemQuantity(itemId, newQuantity);
            // @ts-ignore
            setCartItems(cartItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            ));
        } catch (error) {
            console.error('Error updating quantity:', error);
            Alert.alert('Erreur', 'Impossible de mettre à jour la quantité');
        }
    };

    const handleAddRecommended = (item) => {
        // Check if item already exists in cart
        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            handleUpdateQuantity(existingItem.id, existingItem.quantity + 1);
        } else {
            const newItem = { ...item, quantity: 1 };
            setCartItems([...cartItems, newItem]);
        }
        Alert.alert('Succès', `${item.name} ajouté à votre panier`);
    };

    const handleConfirmDelivery = () => {
        if (cartItems.length === 0) {
            Alert.alert('Panier Vide', 'Veuillez ajouter des articles à votre panier avant de continuer.');
            return;
        }
        router.push({
            pathname: '/checkout',
            params: { totalAmount: totalCost.toFixed(2) }
        });
    };

    // Modern empty cart view
    if (cartItems.length === 0 && !isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900">
                <StatusBar backgroundColor="#111827" barStyle="light-content" />

                {/* Header */}
                <View className="flex-row items-center px-4 py-3 border-b border-gray-800">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-4">Mon Panier</Text>
                </View>

                <View className="flex-1 justify-center items-center p-6">
                    <View className="w-24 h-24 rounded-full bg-gray-800 items-center justify-center mb-6">
                        <Feather name="shopping-cart" size={48} color="#F97316" />
                    </View>
                    <Text className="text-white text-xl font-bold mb-2">Votre panier est vide</Text>
                    <Text className="text-gray-400 text-center mb-8">
                        Parcourez notre délicieux menu et ajoutez des articles à votre panier
                    </Text>
                    <TouchableOpacity
                        className="bg-orange-500 px-8 py-4 rounded-xl"
                        onPress={() => router.push('/')}
                    >
                        <Text className="text-white font-bold text-lg">Commencer à Commander</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <StatusBar backgroundColor="#111827" barStyle="light-content" />

            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-4">Mon Panier</Text>
            </View>

            <ScrollView className="flex-1 bg-gray-900">
                {/* Cart Items */}
                {cartItems.map(item => (
                    <View key={item.id} className="bg-gray-800 m-4 rounded-xl overflow-hidden shadow-lg shadow-black/50">
                        <View className="flex-row p-3">
                            {/* Item Image */}
                            <Image
                                source={{ uri: item.image }}
                                className="w-24 h-24 rounded-lg"
                                resizeMode="cover"
                            />

                            {/* Item Details */}
                            <View className="flex-1 ml-3 justify-between">
                                <View>
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <Text className="text-white text-lg font-bold">{item.name}</Text>
                                            {item.isAvailable ? (
                                                <View className="ml-2 w-4 h-4 rounded-full border border-green-500 items-center justify-center">
                                                    <View className="w-2 h-2 rounded-full bg-green-500" />
                                                </View>
                                            ) : (
                                                <View className="ml-2 w-4 h-4 rounded-full border border-red-500 items-center justify-center">
                                                    <View className="w-2 h-2 rounded-full bg-red-500" />
                                                </View>
                                            )}
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveItem(item.id)}
                                            className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center"
                                        >
                                            <Feather name="trash-2" size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-orange-500 font-bold text-lg">{item.price.toFixed(2)} MAD</Text>
                                        {item.originalPrice > item.price && (
                                            <Text className="text-gray-400 line-through ml-2">{item.originalPrice.toFixed(2)} MAD</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Quantity Control */}
                                <View className="flex-row items-center justify-end mt-4">
                                    <TouchableOpacity
                                        className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center"
                                        onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    >
                                        <Feather name="minus" size={16} color="white" />
                                    </TouchableOpacity>

                                    <View className="bg-gray-700 px-4 mx-2 py-1 rounded-lg">
                                        <Text className="text-white font-bold text-lg">{item.quantity}</Text>
                                    </View>

                                    <TouchableOpacity
                                        className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center"
                                        onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Feather name="plus" size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Item Total */}
                        <View className="bg-gray-700 px-4 py-2 flex-row justify-between">
                            <Text className="text-gray-300">Total article</Text>
                            <Text className="text-white font-bold">{(item.price * item.quantity).toFixed(2)} MAD</Text>
                        </View>
                    </View>
                ))}

                {/* Add More Items */}
                <TouchableOpacity
                    className="flex-row items-center justify-center py-4 mx-4 my-2 rounded-xl bg-gray-800"
                    onPress={() => router.push('/')}
                >
                    <Feather name="plus-circle" size={20} color="#F97316" />
                    <Text className="text-orange-500 font-bold ml-2">Ajouter d'autres articles</Text>
                </TouchableOpacity>

                {/* Recommended Items */}
                <View className="px-4 py-5">
                    <Text className="text-white text-xl font-bold mb-4">Vous Pourriez Aussi Aimer</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                        decelerationRate="fast"
                        snapToInterval={280} // Adjust to card width + margin
                    >
                        {recommendedItems.map(item => (
                            <View key={item.id} className="bg-gray-800 rounded-xl w-64 mr-4 overflow-hidden shadow-lg shadow-black/50">
                                <Image
                                    source={{ uri: item.image }}
                                    className="w-full h-40"
                                    resizeMode="cover"
                                />

                                {/* Gradient overlay */}
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                                    className="absolute top-0 left-0 right-0 h-40"
                                />

                                {/* Badge */}
                                {item.isAvailable ? (
                                    <View className="absolute top-2 left-2 bg-green-500 bg-opacity-90 px-2 py-1 rounded">
                                        <Text className="text-white text-xs font-bold">VÉG</Text>
                                    </View>
                                ) : (
                                    <View className="absolute top-2 left-2 bg-red-500 bg-opacity-90 px-2 py-1 rounded">
                                        <Text className="text-white text-xs font-bold">NON-VÉG</Text>
                                    </View>
                                )}

                                <View className="p-3">
                                    <View className="flex-row justify-between">
                                        <View>
                                            <Text className="text-white font-bold">{item.name}</Text>
                                            <Text className="text-gray-400 text-sm">{item.restaurant}</Text>
                                            <Text className="text-orange-500 font-bold mt-1">{item.price.toFixed(2)} MAD</Text>
                                        </View>

                                        <TouchableOpacity
                                            className="bg-orange-500 w-9 h-9 rounded-full items-center justify-center"
                                            onPress={() => handleAddRecommended(item)}
                                        >
                                            <Feather name="plus" size={18} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Additional Options */}
                <View className="px-4 pb-4">
                    {/* Extra Packaging */}
                    <View className="bg-gray-800 p-4 rounded-xl mb-4 flex-row justify-between items-center shadow-md shadow-black/30">
                        <View className="flex-row items-center">
                            <TouchableOpacity
                                className={`w-6 h-6 rounded ${extraPackaging ? 'bg-orange-500' : 'border border-gray-500'} items-center justify-center`}
                                onPress={() => setExtraPackaging(!extraPackaging)}
                            >
                                {extraPackaging && <Feather name="check" size={14} color="white" />}
                            </TouchableOpacity>
                            <Text className="text-white ml-3">Besoin d'emballage supplémentaire</Text>
                        </View>
                        <Text className="text-white">2,00 MAD</Text>
                    </View>

                    {/* Cutlery Option */}
                    <View className="bg-gray-800 p-4 rounded-xl mb-4 shadow-md shadow-black/30">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <Feather name="coffee" size={20} color="#F97316" />
                                <Text className="text-orange-500 ml-2 font-bold">Ajouter des couverts</Text>
                            </View>
                            <Switch
                                value={addCutlery}
                                onValueChange={setAddCutlery}
                                trackColor={{ false: '#4B5563', true: '#F97316' }}
                                thumbColor={'#fff'}
                            />
                        </View>
                        <Text className="text-gray-400 mt-2 text-sm">
                            Pas besoin de couverts ? Le restaurant fournira des ustensiles avec votre commande.
                        </Text>
                    </View>

                    {/* Unavailable Item Handling */}
                    <TouchableOpacity
                        className="bg-gray-800 p-4 rounded-xl mb-4 shadow-md shadow-black/30"
                        onPress={() => setUnavailableExpanded(!unavailableExpanded)}
                    >
                        <View className="flex-row justify-between items-center">
                            <Text className="text-white">Si un produit n'est pas disponible</Text>
                            <Feather
                                name={unavailableExpanded ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="white"
                            />
                        </View>

                        {unavailableExpanded && (
                            <View className="mt-3 ml-2">
                                <View className="flex-row items-center mb-3">
                                    <View className="w-5 h-5 rounded-full border border-orange-500 mr-3 items-center justify-center">
                                        <View className="w-3 h-3 rounded-full bg-orange-500" />
                                    </View>
                                    <Text className="text-white">Annuler l'article</Text>
                                </View>

                                <View className="flex-row items-center">
                                    <View className="w-5 h-5 rounded-full border border-gray-500 mr-3" />
                                    <Text className="text-white">Annuler toute la commande</Text>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View className="bg-gray-900 px-4 pt-3 pb-6 border-t border-gray-800">
                {/* Free Delivery Progress */}
                {amountForFreeDelivery > 0 && (
                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <Feather name="truck" size={16} color="#F97316" />
                            <Text className="text-orange-500 ml-2 font-bold">
                                {amountForFreeDelivery.toFixed(2)} MAD de plus pour la livraison gratuite
                            </Text>
                        </View>
                        <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-orange-500 rounded-full"
                                style={{ width: `${(totalCost / freeDeliveryThreshold) * 100}%` }}
                            />
                        </View>
                    </View>
                )}

                {/* Subtotal */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white text-lg font-semibold">Sous-total</Text>
                    <Text className="text-orange-500 text-xl font-bold">{totalCost.toFixed(2)} MAD</Text>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                    className="bg-orange-500 py-4 rounded-xl items-center shadow-lg shadow-orange-900/50"
                    onPress={handleConfirmDelivery}
                >
                    <Text className="text-white font-bold text-lg">Procéder au Paiement</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}