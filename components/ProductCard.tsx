import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Image, Text, View, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getFavoriteItems } from '@/utils/firebase';

const ProductCard = ({ product, onPress, onFavoritePress, isFavorite: propIsFavorite }) => {
    // State for tracking favorite status
    const [isFavorite, setIsFavorite] = useState(propIsFavorite || false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Update state when the prop changes
    useEffect(() => {
        if (propIsFavorite !== undefined) {
            setIsFavorite(propIsFavorite);
        }
    }, [propIsFavorite]);

    // Check if product exists
    if (!product) {
        return (
            <View className="bg-gray-800 rounded-xl p-2 overflow-hidden">
                <Text className="text-white">Produit non disponible</Text>
            </View>
        );
    }

    // Safe image source handling
    const imageSource = product.image
        ? (typeof product.image === 'string' ? { uri: product.image } : product.image)
        : require('@/assets/placeholder.png');

    // Safe price formatting
    const priceText = product.price ? `${product.price.toFixed(2)} MAD` : 'Prix non disponible';

    // Safe original price handling
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const originalPriceText = hasDiscount ? `${product.originalPrice.toFixed(2)} MAD` : '';

    // Handle favorite action with visual feedback
    const handleFavoritePress = async () => {
        try {
            setIsProcessing(true);
            // Call the parent's onFavoritePress function with the product and current status
            await onFavoritePress(product, !isFavorite);
            // Toggle favorite state
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error handling favorite action:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-md"
            activeOpacity={0.8}
        >
            {/* Product image */}
            <View className="h-24 w-full relative">
                <Image
                    source={imageSource}
                    className="h-full w-full"
                    resizeMode="cover"
                />

                {/* Discount badge */}
                {hasDiscount && (
                    <View className="absolute top-2 left-2 bg-orange-500 px-2 py-1 rounded">
                        <Text className="text-white text-xs font-bold">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </Text>
                    </View>
                )}

                {/* Favorite button */}
                <TouchableOpacity
                    onPress={handleFavoritePress}
                    className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator size="small" color="#F97316" />
                    ) : (
                        <Feather
                            name={isFavorite ? "heart" : "heart"}
                            size={16}
                            color={isFavorite ? "#FF4D4F" : "#F97316"}
                            style={isFavorite ? { opacity: 1 } : { opacity: 0.7 }}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {/* Product details */}
            <View className="p-2">
                {/* Product name */}
                <Text
                    className="text-white font-medium"
                    numberOfLines={1}
                >
                    {product.name || 'Sans nom'}
                </Text>

                {/* Price display */}
                <View className="flex-row items-center mt-1">
                    <Text className="text-orange-500 font-bold">
                        {priceText}
                    </Text>

                    {hasDiscount && (
                        <Text className="text-gray-400 line-through text-xs ml-2">
                            {originalPriceText}
                        </Text>
                    )}
                </View>

                {/* Rating display */}
                {product.rating > 0 && (
                    <View className="flex-row items-center mt-1">
                        <Feather name="star" size={12} color="#F97316" />
                        <Text className="text-gray-400 text-xs ml-1">
                            {product.rating.toFixed(1)}
                        </Text>

                        {product.reviewCount > 0 && (
                            <Text className="text-gray-500 text-xs ml-1">
                                ({product.reviewCount})
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ProductCard;