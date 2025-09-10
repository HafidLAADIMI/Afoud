// @/components/ProductDetailModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, Image, TouchableOpacity, Modal, ScrollView,
    Animated, Easing, Dimensions, Alert, StyleSheet
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const Badge = ({ text, bgColor = '#a86e02' }) => (
    <View className="px-2 py-1 rounded-full shadow" style={{ backgroundColor: bgColor }}>
        <Text className="text-white text-xs font-bold">{text}</Text>
    </View>
);

// Interface definitions
interface Base {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
}

interface Ingredient {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
}

interface Topping {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
}

interface Sauce {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
}

interface Variation {
    id: string;
    name: string;
    price: number;
}

interface Addon {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
}

interface Product {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    image?: string | any;
    images?: string[];
    isAvailable: boolean;
    description?: string;
    restaurantId?: string;
    cuisineId?: string;
    rating?: number;
    reviewCount?: number;
    preparationTime?: number;
    
    // Legacy support
    variations?: Variation[];
    addons?: Addon[];
    
    // New customization system
    bases?: Base[];
    ingredients?: Ingredient[];
    toppings?: Topping[];
    sauces?: Sauce[];
    
    // Selection limits
    maxIngredientSelection?: number;
    minIngredientSelection?: number;
    maxToppingSelection?: number;
    minToppingSelection?: number;
    maxSauceSelection?: number;
    minSauceSelection?: number;
    defaultIngredientExcessPrice?: number;
}

export interface ProductDetailModalProps {
    isVisible: boolean;
    onClose: () => void;
    onOrder: (
        itemPriceWithAddons: number,
        quantity: number,
        selectedProductDetails: {
            productId: string;
            productName: string;
            discountPrice?: number;
            basePrice: number;
            imageUri?: string;
            selectedVariations: Array<{ id: string; name: string; price: number }>;
            selectedAddons: Array<{ id: string; name: string; price: number; quantity: number }>;
            
            // ADD THESE MISSING FIELDS:
            selectedBases: Array<{ id: string; name: string; price: number }>;
            selectedIngredients: Array<{ id: string; name: string; price: number; quantity: number }>;
            selectedToppings: Array<{ id: string; name: string; price: number; quantity: number }>;
            selectedSauces: Array<{ id: string; name: string; price: number; quantity: number }>;
            
            ingredientsPricing?: {
                freeCount: number;
                paidCount: number;
                totalCost: number;
                items: Array<{
                    ingredient: Ingredient;
                    quantity: number;
                    freeQty: number;
                    paidQty: number;
                    unitPrice: number;
                    totalPrice: number;
                }>;
            };
            restaurantId?: string;
            cuisineId?: string;
            
            // ADD THESE TOO:
            quantity: number;
            itemPriceWithAddons: number;
        }
    ) => void;
    product: Product;
}

const hasValidPrice = (product: Product) => product && typeof product.price === 'number' && !isNaN(product.price);

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    isVisible, onClose, onOrder, product,
}) => {
    // State management
    const [qty, setQty] = useState(1);
    const [selectedVariationOptions, setSelectedVariationOptions] = useState<{ [key: string]: Variation }>({});
    const [selectedBases, setSelectedBases] = useState<{ [key: string]: Base }>({});
    const [addonQuantities, setAddonQuantities] = useState<{ [key: string]: number }>({});
    const [ingredientQuantities, setIngredientQuantities] = useState<{ [key: string]: number }>({});
    const [toppingQuantities, setToppingQuantities] = useState<{ [key: string]: number }>({});
    const [sauceQuantities, setSauceQuantities] = useState<{ [key: string]: number }>({});
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const sheetY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
    const router = useRouter();
    // Effects
    useEffect(() => {
        if (isVisible && product) {
            resetSelections();
        }
        Animated.timing(sheetY, {
            toValue: isVisible ? 0 : Dimensions.get('window').height,
            duration: 280,
            easing: isVisible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [isVisible, product]);

    // Reset all selections
    const resetSelections = () => {
        setQty(1);
        setSelectedVariationOptions({});
        setSelectedBases({});
        setAddonQuantities({});
        setIngredientQuantities({});
        setToppingQuantities({});
        setSauceQuantities({});
        setValidationErrors([]);
    };

    // Helper functions
    const safePrice = (p: number | undefined, fallback = 0) => (typeof p === 'number' && !isNaN(p) ? p : fallback);
    const baseProductPrice = safePrice(product?.discountPrice) || safePrice(product?.price);

    // Calculate ingredient pricing with free/paid logic
    const calculateIngredientPricing = () => {
        if (!product.ingredients) return { freeCount: 0, paidCount: 0, totalCost: 0, items: [] };

        const freeLimit = product.maxIngredientSelection || 5;
        let totalSelected = 0;
        let totalCost = 0;
        const items: any[] = [];

        // Count total selected ingredients
        Object.values(ingredientQuantities).forEach(qty => {
            totalSelected += qty;
        });

        let remainingFree = freeLimit;

        Object.entries(ingredientQuantities).forEach(([ingredientId, quantity]) => {
            if (quantity <= 0) return;

            const ingredient = product.ingredients!.find(ing => ing.id === ingredientId);
            if (!ingredient) return;

            const freeQty = Math.min(quantity, remainingFree);
            const paidQty = quantity - freeQty;
            const unitPrice = ingredient.price || product.defaultIngredientExcessPrice || 6;
            const totalPrice = paidQty * unitPrice;

            remainingFree -= freeQty;
            totalCost += totalPrice;

            items.push({
                ingredient,
                quantity,
                freeQty,
                paidQty,
                unitPrice,
                totalPrice
            });
        });

        return {
            freeCount: Math.min(totalSelected, freeLimit),
            paidCount: Math.max(0, totalSelected - freeLimit),
            totalCost,
            items
        };
    };

    // Calculate total price
    const calculateItemPriceWithAddons = () => {
        if (!product) return 0;
        let currentItemPrice = baseProductPrice;

        // Legacy variations
        Object.values(selectedVariationOptions).forEach(variation => {
            currentItemPrice += safePrice(variation.price);
        });

        // Bases
        Object.values(selectedBases).forEach(base => {
            currentItemPrice += safePrice(base.price);
        });

        // Addons (unlimited)
        Object.entries(addonQuantities).forEach(([addonId, quantity]) => {
            const addon = product.addons?.find(a => a.id === addonId);
            if (addon && quantity > 0) {
                currentItemPrice += addon.price * quantity;
            }
        });

        // Ingredients (complex pricing)
        const ingredientPricing = calculateIngredientPricing();
        currentItemPrice += ingredientPricing.totalCost;

        // Toppings
        Object.entries(toppingQuantities).forEach(([toppingId, quantity]) => {
            const topping = product.toppings?.find(t => t.id === toppingId);
            if (topping && quantity > 0) {
                currentItemPrice += topping.price * quantity;
            }
        });

        // Sauces
        Object.entries(sauceQuantities).forEach(([sauceId, quantity]) => {
            const sauce = product.sauces?.find(s => s.id === sauceId);
            if (sauce && quantity > 0) {
                currentItemPrice += sauce.price * quantity;
            }
        });

        return currentItemPrice;
    };

    // Validation
    const validateSelections = () => {
        const errors: string[] = [];

        const totalIngredients = Object.values(ingredientQuantities).reduce((sum, qty) => sum + qty, 0);
        const minIngredients = product.minIngredientSelection || 0;
        if (totalIngredients < minIngredients) {
            errors.push(`Sélectionnez au moins ${minIngredients} ingrédient(s)`);
        }

        const totalToppings = Object.values(toppingQuantities).reduce((sum, qty) => sum + qty, 0);
        const minToppings = product.minToppingSelection || 0;
        const maxToppings = product.maxToppingSelection || 5;
        if (totalToppings < minToppings) {
            errors.push(`Sélectionnez au moins ${minToppings} topping(s)`);
        }
        if (totalToppings > maxToppings) {
            errors.push(`Maximum ${maxToppings} topping(s) autorisé(s)`);
        }

        const totalSauces = Object.values(sauceQuantities).reduce((sum, qty) => sum + qty, 0);
        const minSauces = product.minSauceSelection || 0;
        const maxSauces = product.maxSauceSelection || 12;
        if (totalSauces < minSauces) {
            errors.push(`Sélectionnez au moins ${minSauces} sauce(s)`);
        }
        if (totalSauces > maxSauces) {
            errors.push(`Maximum ${maxSauces} sauce(s) autorisé(s)`);
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    // Quantity update handlers
    const updateAddonQuantity = (addonId: string, change: number) => {
        setAddonQuantities(prev => {
            const currentQty = prev[addonId] || 0;
            const newQty = Math.max(0, currentQty + change);
            return { ...prev, [addonId]: newQty };
        });
    };

    const updateIngredientQuantity = (ingredientId: string, change: number) => {
        setIngredientQuantities(prev => {
            const currentQty = prev[ingredientId] || 0;
            const newQty = Math.max(0, currentQty + change);
            return { ...prev, [ingredientId]: newQty };
        });
    };

    const updateToppingQuantity = (toppingId: string, change: number) => {
    setToppingQuantities(prev => {
        const currentQty = prev[toppingId] || 0;
        const newQty = Math.max(0, currentQty + change);
        
        // Calculate total toppings with the new quantity for this topping
        const totalToppingsWithNewQty = Object.entries(prev).reduce((sum, [id, qty]) => {
            return sum + (id === toppingId ? newQty : qty);
        }, 0);
        
        const maxToppings = product.maxToppingSelection || 5;
        
        // If adding and would exceed limit, don't allow it
        if (change > 0 && totalToppingsWithNewQty > maxToppings) {
            return prev;
        }
        
        return { ...prev, [toppingId]: newQty };
    });
};

   const updateSauceQuantity = (sauceId: string, change: number) => {
    setSauceQuantities(prev => {
        const currentQty = prev[sauceId] || 0;
        const newQty = Math.max(0, currentQty + change);
        
        // Calculate total sauces with the new quantity for this sauce
        const totalSaucesWithNewQty = Object.entries(prev).reduce((sum, [id, qty]) => {
            return sum + (id === sauceId ? newQty : qty);
        }, 0);
        
        const maxSauces = product.maxSauceSelection || 12;
        
        // If adding and would exceed limit, don't allow it
        if (change > 0 && totalSaucesWithNewQty > maxSauces) {
            return prev;
        }
        
        return { ...prev, [sauceId]: newQty };
    });
};

    // Selection handlers
    const handleToggleVariation = (variation: Variation) => {
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

    const handleSelectBase = (base: Base) => {
        setSelectedBases({ [base.id]: base });
    };

    // Order handler
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

    if (!validateSelections()) {
        Alert.alert("Sélection invalide", validationErrors.join('\n'));
        return;
    }

    const itemPriceForOne = calculateItemPriceWithAddons();
    const ingredientPricing = calculateIngredientPricing();
    
    // Build the complete order data with all customizations
    const orderData = {
        productId: product.id,
        productName: product.name,
        basePrice: baseProductPrice,
        imageUri: typeof product.image === 'string' ? product.image : (product.images && product.images[0]),
        quantity: qty,
        itemPriceWithAddons: itemPriceForOne,
        
        // All the customization arrays
        selectedVariations: Object.values(selectedVariationOptions).map(v => ({ 
            id: v.id, 
            name: v.name, 
            price: safePrice(v.price) 
        })),
        selectedAddons: Object.entries(addonQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([id, quantity]) => {
                const addon = product.addons!.find(a => a.id === id)!;
                return { id, name: addon.name, price: addon.price, quantity };
            }),
        selectedBases: Object.values(selectedBases).map(b => ({ 
            id: b.id, 
            name: b.name, 
            price: safePrice(b.price) 
        })),
        selectedIngredients: Object.entries(ingredientQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([id, quantity]) => {
                const ingredient = product.ingredients!.find(ing => ing.id === id)!;
                return { id, name: ingredient.name, price: ingredient.price, quantity };
            }),
        selectedToppings: Object.entries(toppingQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([id, quantity]) => {
                const topping = product.toppings!.find(t => t.id === id)!;
                return { id, name: topping.name, price: topping.price, quantity };
            }),
        selectedSauces: Object.entries(sauceQuantities)
            .filter(([_, qty]) => qty > 0)
            .map(([id, quantity]) => {
                const sauce = product.sauces!.find(s => s.id === id)!;
                return { id, name: sauce.name, price: sauce.price, quantity };
            }),
        
        ingredientsPricing: ingredientPricing,
        restaurantId: product.restaurantId,
        cuisineId: product.cuisineId,
    };

    console.log('=== DEBUG: Complete orderData before navigation ===');
    console.log('selectedBases:', orderData.selectedBases);
    console.log('selectedIngredients:', orderData.selectedIngredients);
    console.log('selectedToppings:', orderData.selectedToppings);
    console.log('selectedSauces:', orderData.selectedSauces);

    // Close the modal first
    onClose();
    
    // Navigate directly from here with all the data
    router.push({
        pathname: '/checkout',
        params: {
            persistedProductData: JSON.stringify(orderData),
        },
    });
};
    
       
            // Calculations for display
    const currentOrderTotal = calculateItemPriceWithAddons() * qty;
    const discountPercentage = product?.price && product?.discountPrice && product.price > product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const productImageSource = product?.image
        ? (typeof product.image === 'string' ? { uri: product.image } : product.image)
        : (product?.images && product.images.length > 0 ? { uri: product.images[0] } : require('@/assets/placeholder.png'));

    if (!product) return null;

    // Calculate totals for display
    const totalIngredients = Object.values(ingredientQuantities).reduce((sum, qty) => sum + qty, 0);
    const totalToppings = Object.values(toppingQuantities).reduce((sum, qty) => sum + qty, 0);
    const totalSauces = Object.values(sauceQuantities).reduce((sum, qty) => sum + qty, 0);
    const ingredientPricing = calculateIngredientPricing();

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

                            {/* Bases */}
                            {product.bases && product.bases.length > 0 && (
                                <View>
                                    <Text className="text-gray-800 text-lg font-semibold mb-2">Bases</Text>
                                    {product.bases.filter(base => base.isAvailable).map((base) => (
                                        <TouchableOpacity
                                            key={base.id}
                                            onPress={() => handleSelectBase(base)}
                                            className={`flex-row justify-between items-center p-3 mb-2 rounded-lg border-2
                                                ${selectedBases[base.id] ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-200'}`}
                                        >
                                            <View className="flex-row items-center">
                                                <View className={`w-4 h-4 rounded-full border-2 mr-3 ${selectedBases[base.id] ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                                    {selectedBases[base.id] && <View className="w-2 h-2 bg-white rounded-full m-0.5" />}
                                                </View>
                                                <Text className={`text-base ${selectedBases[base.id] ? 'text-blue-800' : 'text-gray-600'}`}>{base.name}</Text>
                                            </View>
                                            <Text className={`text-base font-medium ${selectedBases[base.id] ? 'text-blue-800' : 'text-gray-600'}`}>
                                                {base.price > 0 ? `+${base.price.toFixed(2)} MAD` : 'Gratuit'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Extras (Addons) - UNLIMITED */}
                            {product.addons && product.addons.length > 0 && (
                                <View>
                                    <Text className="text-gray-800 text-lg font-semibold mb-2">Extras</Text>
                                    {product.addons.filter(addon => addon.isAvailable).map((addon) => {
                                        const currentQty = addonQuantities[addon.id] || 0;
                                        return (
                                            <View key={addon.id} className="flex-row justify-between items-center p-3 mb-2 rounded-lg border border-gray-200 bg-gray-50">
                                                <Text className="text-base text-gray-800">{addon.name}</Text>
                                                <View className="flex-row items-center">
                                                    <Text className="text-orange-600 font-medium mr-3">+{addon.price.toFixed(2)} MAD</Text>
                                                    <View className="flex-row items-center bg-white rounded-full border border-gray-300">
                                                        <TouchableOpacity
                                                            onPress={() => updateAddonQuantity(addon.id, -1)}
                                                            disabled={currentQty === 0}
                                                            className="w-8 h-8 justify-center items-center"
                                                        >
                                                            <Feather name="minus" size={16} color={currentQty > 0 ? "#374151" : "#9CA3AF"} />
                                                        </TouchableOpacity>
                                                        <Text className="text-gray-800 font-bold w-8 text-center">{currentQty}</Text>
                                                        <TouchableOpacity
                                                            onPress={() => updateAddonQuantity(addon.id, 1)}
                                                            className="w-8 h-8 justify-center items-center"
                                                        >
                                                            <Feather name="plus" size={16} color="#374151" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Ingredients with complex pricing */}
                            {product.ingredients && product.ingredients.length > 0 && (
                                <View>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-gray-800 text-lg font-semibold">Ingrédients</Text>
                                        <View className="flex-col items-end">
                                            <Text className="text-sm text-green-600">Gratuit: {ingredientPricing.freeCount}/{product.maxIngredientSelection || 5}</Text>
                                            {ingredientPricing.paidCount > 0 && (
                                                <Text className="text-sm text-orange-600">Payant: {ingredientPricing.paidCount}</Text>
                                            )}
                                            <Text className="text-xs text-gray-500">Min: {product.minIngredientSelection || 1}</Text>
                                        </View>
                                    </View>
                                    {product.ingredients.filter(ingredient => ingredient.isAvailable).map((ingredient) => {
                                        const currentQty = ingredientQuantities[ingredient.id] || 0;
                                        const freeLimit = product.maxIngredientSelection || 5;
                                        const totalSelected = Object.values(ingredientQuantities).reduce((sum, qty) => sum + qty, 0);
                                        const thisIngredientFree = Math.min(currentQty, Math.max(0, freeLimit - (totalSelected - currentQty)));
                                        const thisIngredientPaid = currentQty - thisIngredientFree;
                                        
                                        return (
                                            <View key={ingredient.id} className="flex-row justify-between items-center p-3 mb-2 rounded-lg border border-gray-200 bg-gray-50">
                                                <View className="flex-1">
                                                    <Text className="text-base text-gray-800">{ingredient.name}</Text>
                                                    {currentQty > 0 && (
                                                        <View className="flex-row mt-1">
                                                            {thisIngredientFree > 0 && (
                                                                <Text className="text-xs text-green-600 mr-2">
                                                                    Gratuit x{thisIngredientFree}
                                                                </Text>
                                                            )}
                                                            {thisIngredientPaid > 0 && (
                                                                <Text className="text-xs text-orange-600">
                                                                    +{ingredient.price.toFixed(2)} MAD x{thisIngredientPaid}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    )}
                                                </View>
                                                <View className="flex-row items-center bg-white rounded-full border border-gray-300">
                                                    <TouchableOpacity
                                                        onPress={() => updateIngredientQuantity(ingredient.id, -1)}
                                                        disabled={currentQty === 0}
                                                        className="w-8 h-8 justify-center items-center"
                                                    >
                                                        <Feather name="minus" size={16} color={currentQty > 0 ? "#374151" : "#9CA3AF"} />
                                                    </TouchableOpacity>
                                                    <Text className="text-gray-800 font-bold w-8 text-center">{currentQty}</Text>
                                                    <TouchableOpacity
                                                        onPress={() => updateIngredientQuantity(ingredient.id, 1)}
                                                        className="w-8 h-8 justify-center items-center"
                                                    >
                                                        <Feather name="plus" size={16} color="#374151" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Toppings */}
                            {product.toppings && product.toppings.length > 0 && (
                                <View>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-gray-800 text-lg font-semibold">Toppings</Text>
                                        <Text className="text-sm text-gray-500">
                                            {totalToppings}/{product.maxToppingSelection || 5} • Min: {product.minToppingSelection || 1}
                                        </Text>
                                    </View>
                                    {product.toppings.filter(topping => topping.isAvailable).map((topping) => {
                                        const currentQty = toppingQuantities[topping.id] || 0;
                                        return (
                                            <View key={topping.id} className="flex-row justify-between items-center p-3 mb-2 rounded-lg border border-gray-200 bg-gray-50">
                                                <Text className="text-base text-gray-800">{topping.name}</Text>
                                                <View className="flex-row items-center">
                                                    <Text className="text-orange-600 font-medium mr-3">+{topping.price.toFixed(2)} MAD</Text>
                                                    <View className="flex-row items-center bg-white rounded-full border border-gray-300">
                                                        <TouchableOpacity
                                                            onPress={() => updateToppingQuantity(topping.id, -1)}
                                                            disabled={currentQty === 0}
                                                            className="w-8 h-8 justify-center items-center"
                                                        >
                                                            <Feather name="minus" size={16} color={currentQty > 0 ? "#374151" : "#9CA3AF"} />
                                                        </TouchableOpacity>
                                                        <Text className="text-gray-800 font-bold w-8 text-center">{currentQty}</Text>
                                                        <TouchableOpacity
                                                            onPress={() => updateToppingQuantity(topping.id, 1)}
                                                            disabled={totalToppings >= (product.maxToppingSelection || 5) && currentQty === 0}
                                                            className="w-8 h-8 justify-center items-center"
                                                        >
                                                            <Feather name="plus" size={16} color="#374151" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Sauces */}
                            {product.sauces && product.sauces.length > 0 && (
                                <View>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-gray-800 text-lg font-semibold">Sauces</Text>
                                        <Text className="text-sm text-gray-500">
                                            {totalSauces}/{product.maxSauceSelection || 12}
                                        </Text>
                                    </View>
                                    {product.sauces.filter(sauce => sauce.isAvailable).map((sauce) => {
                                        const currentQty = sauceQuantities[sauce.id] || 0;
                                        return (
                                            <View key={sauce.id} className="flex-row justify-between items-center p-3 mb-2 rounded-lg border border-gray-200 bg-gray-50">
                                                <Text className="text-base text-gray-800">{sauce.name}</Text>
                                                <View className="flex-row items-center">
                                                    <Text className="text-orange-600 font-medium mr-3">+{sauce.price.toFixed(2)} MAD</Text>
                                                    <View className="flex-row items-center bg-white rounded-full border border-gray-300">
                                                        <TouchableOpacity
                                                            onPress={() => updateSauceQuantity(sauce.id, -1)}
                                                            disabled={currentQty === 0}
                                                            className="w-8 h-8 justify-center items-center"
                                                        >
                                                            <Feather name="minus" size={16} color={currentQty > 0 ? "#374151" : "#9CA3AF"} />
                                                        </TouchableOpacity>
                                                        <Text className="text-gray-800 font-bold w-8 text-center">{currentQty}</Text>
                                                        <TouchableOpacity
                                                            onPress={() => updateSauceQuantity(sauce.id, 1)}
                                                            disabled={totalSauces >= (product.maxSauceSelection || 12) && currentQty === 0}
                                                            className="w-8 h-8 justify-center items-center"
                                                        >
                                                            <Feather name="plus" size={16} color="#374151" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Legacy Variations */}
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

                            {/* Validation Errors */}
                            {validationErrors.length > 0 && (
                                <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    {validationErrors.map((error, index) => (
                                        <Text key={index} className="text-red-600 text-sm">• {error}</Text>
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
                                + Ajouter au panier
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});

export default ProductDetailModal;