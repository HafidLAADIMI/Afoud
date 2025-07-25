import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import React from 'react';
import { Restaurant } from '@/types';
import { Feather } from '@expo/vector-icons';

type RestaurantCardProps = {
    restaurant: Restaurant;
    onPress?: () => void;
    onFavoritePress?: () => void;
};

const RestaurantCard: React.FC<RestaurantCardProps> = ({
                                                           restaurant,
                                                           onPress,
                                                           onFavoritePress
                                                       }) => {
    // Safe access to image property with fallback
    const imageSource = restaurant.image
        ? (typeof restaurant.image === 'string' ? { uri: restaurant.image } : restaurant.image as ImageSourcePropType)
        : require('@/assets/placeholder.png');

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className="bg-gray-800 rounded-xl overflow-hidden w-64"
            style={styles.cardShadow}
        >
            {/* Restaurant Image */}
            <View className="relative">
                <Image
                    source={imageSource}
                    className="w-full h-32"
                    resizeMode="cover"
                />

                {/* Favorite button */}
                <TouchableOpacity
                    onPress={onFavoritePress}
                    className="absolute top-2 right-2 bg-black/40 p-2 rounded-full"
                >
                    <Feather name="heart" size={18} color="white" />
                </TouchableOpacity>

                {/* Rating badge */}
                <View className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-lg flex-row items-center">
                    <Feather name="star" size={14} color="#F59E0B" />
                    <Text className="text-gray-900 font-bold text-xs ml-1">
                        {restaurant.rating.toFixed(1)}
                    </Text>
                </View>
            </View>

            {/* Restaurant Details */}
            <View className="p-3">
                <Text className="text-white font-bold text-lg" numberOfLines={1}>
                    {restaurant.name}
                </Text>

                {/* Restaurant info */}
                <View className="flex-row justify-between items-center mt-2">
                    <View className="flex-row items-center">
                        <Feather name="clock" size={14} color="#F97316" />
                        <Text className="text-gray-400 text-xs ml-1">
                            {restaurant.deliveryTime}
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        <Feather name="package" size={14} color="#F97316" />
                        <Text className="text-gray-400 text-xs ml-1">
                            {restaurant.deliveryFee}
                        </Text>
                    </View>
                </View>

                {/* Action button */}
                <TouchableOpacity
                    className="mt-3 bg-gray-700 rounded-lg py-2 flex-row justify-center items-center"
                    onPress={onPress}
                >
                    <Text className="text-white font-medium text-sm mr-2">View Menu</Text>
                    <Feather name="chevron-right" size={16} color="#F97316" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    }
});

export default RestaurantCard;