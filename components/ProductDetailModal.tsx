// @/components/ProductDetailModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, Image, TouchableOpacity, Modal, ScrollView,
    Animated, Easing, Dimensions, Alert, StyleSheet
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// Assuming Badge is a custom component, ensure it's correctly imported or defined
// import Badge from './Badge'; 
const Badge = ({ text, bgColor = '#a86e02' }) => ( // Simple Badge placeholder
    <View className="px-2 py-1 rounded-full shadow" style={{ backgroundColor: bgColor }}>
        <Text className="text-white text-xs font-bold">{text}</Text>
    </View>
);


// Assuming Product, Variation, Addon, hasValidPrice are defined in ProductNormalizer
// For this example, I'll use simplified types if not fully provided.
interface Product {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    image?: string | any; // Allow for {uri: string} or require()
    images?: string[];
    isAvailable: boolean;
    description?: string;
    restaurantId?: string;
    cuisineId?: string;
    rating?: number;
    reviewCount?: number;
    preparationTime?: number;
    variations?: Variation[];
    addons?: Addon[];
}
interface Variation { id: string; name: string; price: number; }
interface Addon { id: string; name: string; price: number; }
const hasValidPrice = (product: Product) => product && typeof product.price === 'number' && !isNaN(product.price);


export interface ProductDetailModalProps {
    isVisible: boolean;
    onClose: () => void;
    onOrder: (
        // This is the total for ONE instance of the product with its options
        // The final line item total (this * quantity) will be calculated by consumer or cart logic
        itemPriceWithAddons: number,
        quantity: number,
        // Detailed breakdown of the product and its selections
        selectedProductDetails: {
            productId: string;
            productName: string;
            discountPrice?: number;
            basePrice: number; // Price of one unit of the main product
            imageUri?: string;
            selectedVariations: Array<{ id: string; name: string; price: number }>;
            selectedAddons: Array<{ id: string; name: string; price: number }>;
            // Optional IDs for context
            restaurantId?: string;
            cuisineId?: string;
        }
    ) => void;
    product: Product;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
                                                                   isVisible, onClose, onOrder, product,
                                                               }) => {
    const [qty, setQty] = useState(1);
    // Store selected options as objects for easy lookup and price calculation
    const [selectedVariationOptions, setSelectedVariationOptions] = useState<{ [key: string]: Variation }>({});
    const [selectedAddonOptions, setSelectedAddonOptions] = useState<{ [key: string]: Addon }>({});

    const sheetY = useRef(new Animated.Value(Dimensions.get('window').height)).current;

    useEffect(() => {
        // Reset state when product changes or modal becomes visible
        if (isVisible && product) {
            setQty(1);
            setSelectedVariationOptions({});
            setSelectedAddonOptions({});
        }
        Animated.timing(sheetY, {
            toValue: isVisible ? 0 : Dimensions.get('window').height,
            duration: 280,
            easing: isVisible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [isVisible, product]);

    const safePrice = (p: number | undefined, fallback = 0) => (typeof p === 'number' && !isNaN(p) ? p : fallback);
    const baseProductPrice = safePrice(product?.discountPrice) || safePrice(product?.price);
     console.log("discount price",product.discountPrice)

    // Calculates the price of ONE unit of the product including selected variations and addons
    const calculateItemPriceWithAddons = () => {
        if (!product) return 0;
        let currentItemPrice = baseProductPrice;

        Object.values(selectedVariationOptions).forEach(variation => {
            currentItemPrice += safePrice(variation.price);
        });
        Object.values(selectedAddonOptions).forEach(addon => {
            currentItemPrice += safePrice(addon.price);
        });
        return currentItemPrice;
    };

    // Total for the modal (itemPriceWithAddons * quantity)
    const currentOrderTotal = calculateItemPriceWithAddons() * qty;

    const handleToggleVariation = (variation: Variation) => {
        // Assuming only one variation can be selected from a group, or they are independent toggles.
        // For this example, let's assume independent toggles like addons.
        // If it's a radio-button style selection, logic would differ.
        setSelectedVariationOptions(prev => {
            const newSelected = { ...prev };
            if (newSelected[variation.id]) {
                delete newSelected[variation.id];
            } else {
                newSelected[variation.id] = variation;
            }
            return newSelected;
        });
    };

    const handleToggleAddon = (addon: Addon) => {
        setSelectedAddonOptions(prev => {
            const newSelected = { ...prev };
            if (newSelected[addon.id]) {
                delete newSelected[addon.id];
            } else {
                newSelected[addon.id] = addon;
            }
            return newSelected;
        });
    };

    const handleOrderPressInternal = () => {
        if (!product) return;
        if (!product.isAvailable) {
            Alert.alert("Produit non disponible", "Ce produit n'est pas disponible actuellement.");
            return;
        }
        if (!hasValidPrice(product)) {
            Alert.alert("Prix non disponible", "Ce produit n'a pas de prix valide.");
            return;
        }

        const itemPriceForOne = calculateItemPriceWithAddons();

        const detailsForCart = {
            productId: product.id,
            productName: product.name,
            basePrice: baseProductPrice, // Price of one unit of main product
            imageUri: typeof product.image === 'string' ? product.image : (product.images && product.images[0]),
            selectedVariations: Object.values(selectedVariationOptions).map(v => ({ id: v.id, name: v.name, price: safePrice(v.price) })),
            selectedAddons: Object.values(selectedAddonOptions).map(a => ({ id: a.id, name: a.name, price: safePrice(a.price) })),
            restaurantId: product.restaurantId,
            cuisineId: product.cuisineId,
        };

        console.log("ProductDetailModal onOrder call:", { itemPriceForOne, qty, detailsForCart });
        onOrder(itemPriceForOne, qty, detailsForCart);
        // onClose(); // Optionally close modal after order
    };

    const discountPercentage = product?.price && product?.discountPrice && product.price > product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const productImageSource = product?.image
        ? (typeof product.image === 'string' ? { uri: product.image } : product.image)
        : (product?.images && product.images.length > 0 ? { uri: product.images[0] } : require('@/assets/placeholder.png'));


    if (!product) return null; // Or a loading/error state if product can be null initially

    return (
        <Modal visible={isVisible} transparent onRequestClose={onClose} animationType="none">
            <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.overlay} />
            <Animated.View style={[styles.sheetContainer, { transform: [{ translateY: sheetY }] }]}>
                <View className="bg-white rounded-t-3xl shadow-2xl max-h-[90vh]">
                    <View className="items-center py-3 border-b border-gray-200">
                        <View className="w-12 h-1.5 bg-gray-400 rounded-full" />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
                        <View className="relative">
                            <Image source={productImageSource} className="w-full h-60" resizeMode="cover" />
                            {discountPercentage > 0 && (
                                <View className="absolute top-4 left-4">
                                    <Badge text={`${discountPercentage}% RÉDUC`} />
                                </View>
                            )}
                            {!product.isAvailable && (
                                <View className="absolute top-4 right-4">
                                    <Badge text="ÉPUISÉ" bgColor="#EF4444" />
                                </View>
                            )}
                            <LinearGradient
                                colors={['transparent', 'rgba(255,255,255,0.95)']}
                                className="absolute bottom-0 left-0 right-0 h-20 justify-end p-4"
                            >
                                <Text className="text-gray-800 text-2xl font-bold shadow-lg" numberOfLines={2}>{product.name}</Text>
                            </LinearGradient>
                        </View>

                        <View className="p-5 space-y-5">
                            {/* Price & Availability */}
                            <View className="flex-row justify-between items-center">
                                 <View>
                                    {discountPercentage > 0 && product.price && (
                                        <Text className="text-gray-500 line-through text-lg">
                                            {product.price.toFixed(2)} MAD
                                        </Text>
                                    )}
                                    <Text className="text-3xl font-bold" style={{ color: '#a86e02' }}>
                                        {baseProductPrice.toFixed(2)} MAD
                                    </Text>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${product.isAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <Text className={`font-semibold ${product.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.isAvailable ? 'Disponible' : 'Épuisé'}
                                    </Text>
                                </View>
                            </View>

                            {/* Description */}
                            {product.description && (
                                <View>
                                    <Text className="text-gray-800 text-base font-semibold mb-1">Description</Text>
                                    <Text className="text-gray-600 leading-relaxed">{product.description}</Text>
                                </View>
                            )}

                            {/* Variations */}
                            {product.variations && product.variations.length > 0 && (
                                <View>
                                    <Text className="text-gray-800 text-lg font-semibold mb-2">Variations</Text>
                                    {product.variations.map((variation) => (
                                        <TouchableOpacity
                                            key={variation.id}
                                            onPress={() => handleToggleVariation(variation)}
                                            className={`flex-row justify-between items-center p-3 mb-2 rounded-lg border-2
                                                ${selectedVariationOptions[variation.id] ? 'bg-orange-50' : 'bg-gray-50'}`}
                                            style={{
                                                borderColor: selectedVariationOptions[variation.id] ? '#a86e02' : '#e5e7eb'
                                            }}
                                        >
                                            <Text className={`text-base ${selectedVariationOptions[variation.id] ? 'text-gray-800' : 'text-gray-600'}`}>{variation.name}</Text>
                                            <Text className={`text-base font-medium ${selectedVariationOptions[variation.id] ? 'text-gray-800' : 'text-gray-600'}`} style={selectedVariationOptions[variation.id] ? { color: '#a86e02' } : {}}>
                                                + {safePrice(variation.price).toFixed(2)} MAD
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Addons */}
                            {product.addons && product.addons.length > 0 && (
                                <View>
                                    <Text className="text-gray-800 text-lg font-semibold mb-2">Suppléments</Text>
                                    {product.addons.map((addon) => (
                                        <TouchableOpacity
                                            key={addon.id}
                                            onPress={() => handleToggleAddon(addon)}
                                            className={`flex-row justify-between items-center p-3 mb-2 rounded-lg border-2
                                                ${selectedAddonOptions[addon.id] ? 'bg-orange-50' : 'bg-gray-50'}`}
                                            style={{
                                                borderColor: selectedAddonOptions[addon.id] ? '#a86e02' : '#e5e7eb'
                                            }}
                                        >
                                            <Text className={`text-base ${selectedAddonOptions[addon.id] ? 'text-gray-800' : 'text-gray-600'}`}>{addon.name}</Text>
                                            <Text className={`text-base font-medium ${selectedAddonOptions[addon.id] ? 'text-gray-800' : 'text-gray-600'}`} style={selectedAddonOptions[addon.id] ? { color: '#a86e02' } : {}}>
                                                + {safePrice(addon.price).toFixed(2)} MAD
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Bottom Action Bar */}
                    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-gray-600 text-lg">Quantité:</Text>
                            <View className="flex-row items-center bg-gray-100 rounded-full">
                                <TouchableOpacity
                                    className="w-10 h-10 justify-center items-center active:bg-gray-200 rounded-l-full"
                                    onPress={() => qty > 1 && setQty(qty - 1)}
                                >
                                    <Feather name="minus" size={20} color={qty > 1 ? "#374151" : "#9CA3AF"} />
                                </TouchableOpacity>
                                <Text className="text-gray-800 text-lg font-bold w-12 text-center">{qty}</Text>
                                <TouchableOpacity
                                    className="w-10 h-10 justify-center items-center active:bg-gray-200 rounded-r-full"
                                    onPress={() => setQty(qty + 1)}
                                >
                                    <Feather name="plus" size={20} color="#374151" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-gray-600 text-lg">Total:</Text>
                            <Text className="font-bold text-2xl" style={{ color: '#a86e02' }}>
                                {currentOrderTotal.toFixed(2)} MAD
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleOrderPressInternal}
                            disabled={!product.isAvailable || !hasValidPrice(product)}
                            className={`py-4 rounded-xl items-center justify-center shadow-lg 
                                ${(!product.isAvailable || !hasValidPrice(product)) ? 'bg-gray-300' : 'active:bg-orange-600'}`}
                            style={(!product.isAvailable || !hasValidPrice(product)) ? {} : { backgroundColor: '#a86e02' }}
                        >
                            <Text className="text-white font-bold text-lg">
                                Ajouter au Panier
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Lighter overlay
    },
    sheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // maxH-[90vh] is handled by the inner View's className
    },
});

export default ProductDetailModal;