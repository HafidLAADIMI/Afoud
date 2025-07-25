import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';

// Import the new Product interface and utilities
import { Product, hasValidPrice, getDisplayPrice } from '@/utils/ProductNormalizer';

type TrendingSectionProps = {
    items: Product[];
    onItemPress: (item: Product) => void;
    onFavoritePress?: (item: Product) => void;
    title?: string;
    subtitle?: string;
};

const TrendingSection: React.FC<TrendingSectionProps> = ({
                                                             items,
                                                             onItemPress,
                                                             onFavoritePress,
                                                             title = "Plats Les Mieux Notés",
                                                             subtitle = "Voici ce que vous pourriez aimer goûter"
                                                         }) => {
    // Handle empty state
    if (!items || items.length === 0) {
        return null;
    }

    // Handle item press with validation
    const handleItemPress = (item: Product) => {
        // Check if product is available
        if (!item.isAvailable) {
            Alert.alert("Produit non disponible", "Ce produit n'est pas disponible actuellement.");
            return;
        }

        // Check if product has a valid price
        if (!hasValidPrice(item)) {
            Alert.alert(
                "Prix non disponible",
                "Ce produit n'a pas de prix valide. Impossible de commander.",
                [{ text: "OK" }]
            );
            return;
        }

        // Call the original onItemPress if all validations pass
        onItemPress(item);
    };

    const renderTrendingItem = ({ item }: { item: Product }) => {
        // Calculate discount percentage
        const hasDiscount = item.discountPrice && item.price > item.discountPrice;
        const discountPercentage = hasDiscount
            ? Math.round(((item.price - item.discountPrice) / item.price) * 100)
            : 0;

        // Get the display price
        const displayPrice = getDisplayPrice(item);

        // Check if the product is valid for display
        const hasValidDisplayPrice = hasValidPrice(item);
        const isProductAvailable = item.isAvailable;

        return (
            <TouchableOpacity
                onPress={() => handleItemPress(item)}
                activeOpacity={0.8}
                className="mr-4 rounded-xl overflow-hidden bg-gray-800"
                style={styles.card}
            >
                <View>
                    {/* Product Image */}
                    <Image
                        source={
                            typeof item.image === 'string'
                                ? { uri: item.image }
                                : require('@/assets/placeholder.png')
                        }
                        className="w-full h-40"
                        style={styles.image}
                        resizeMode="cover"
                    />

                    {/* Favorite Heart Button */}
                    <TouchableOpacity
                        onPress={() => onFavoritePress && onFavoritePress(item)}
                        className="absolute top-2 right-2"
                        style={styles.heartButton}
                    >
                        <Feather name="heart" size={20} color="white" />
                    </TouchableOpacity>

                    {/* Discount Tag */}
                    {discountPercentage > 0 && (
                        <View className="absolute top-2 left-2 bg-orange-500 px-3 py-1 rounded-md">
                            <Text className="text-white font-bold">{discountPercentage}% RÉDUCTION</Text>
                        </View>
                    )}

                    {/* Availability Tag */}
                    {!isProductAvailable && (
                        <View className="absolute bottom-0 left-0 right-0 bg-red-500 py-1">
                            <Text className="text-white font-bold text-center">NON DISPONIBLE</Text>
                        </View>
                    )}
                </View>

                <View className="p-3">
                    {/* Restaurant Name if available */}
                    {item.restaurantId && (
                        <Text className="text-gray-400 text-sm mb-1">Restaurant ID: {item.restaurantId}</Text>
                    )}

                    {/* Food Name */}
                    <Text className="text-white text-lg font-bold mb-1" numberOfLines={1}>
                        {item.name}
                    </Text>

                    {/* Rating */}
                    <View className="flex-row items-center mb-2">
                        <Feather name="star" size={16} color="#F59E0B" />
                        <Text className="text-white ml-1">
                            {item.rating || "4.0"} {item.reviewCount ? `(${item.reviewCount})` : "(1)"}
                        </Text>
                    </View>

                    {/* Price */}
                    <View className="flex-row items-center">
                        {hasDiscount ? (
                            <>
                                <Text className="text-gray-400 line-through mr-2">
                                    {item.price.toFixed(2)} MAD
                                </Text>
                                {hasValidDisplayPrice ? (
                                    <Text className="text-white text-xl font-bold">
                                        {item.discountPrice.toFixed(2)} MAD
                                    </Text>
                                ) : (
                                    <Text className="text-red-500 text-xl font-bold">
                                        Prix non disponible
                                    </Text>
                                )}
                            </>
                        ) : (
                            hasValidDisplayPrice ? (
                                <Text className="text-white text-xl font-bold">
                                    {displayPrice.toFixed(2)} MAD
                                </Text>
                            ) : (
                                <Text className="text-red-500 text-xl font-bold">
                                    Prix non disponible
                                </Text>
                            )
                        )}
                    </View>

                    {/* Add Button */}
                    <TouchableOpacity
                        className="absolute bottom-3 right-3 bg-gray-900 rounded-full p-2"
                        onPress={() => handleItemPress(item)}
                        disabled={!hasValidDisplayPrice || !isProductAvailable}
                    >
                        <Feather
                            name={hasValidDisplayPrice && isProductAvailable ? "plus" : "x"}
                            size={20}
                            color={hasValidDisplayPrice && isProductAvailable ? "#F97316" : "#EF4444"}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="mt-8">
            {/* Section Title */}
            <View className="px-4 flex-row justify-between items-center mb-4">
                <View>
                    <Text className="text-white text-xl font-bold">{title}</Text>
                    {subtitle && (
                        <Text className="text-gray-400 mt-1">{subtitle}</Text>
                    )}
                </View>
                <View className="bg-gray-800/60 p-2 rounded-full">
                    <Feather name="arrow-right" size={20} color="#F97316" />
                </View>
            </View>

            {/* Horizontal Food Items */}
            <FlatList
                horizontal
                data={items}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTrendingItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 16, paddingRight: 6, paddingBottom: 8 }}
                snapToAlignment="start"
                decelerationRate="fast"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: 240,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: 160,
    },
    heartButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 8,
        borderRadius: 20,
    }
});

export default TrendingSection;