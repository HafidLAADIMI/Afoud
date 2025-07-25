import { View, Text, ImageBackground, TouchableOpacity, Dimensions, ImageSourcePropType } from 'react-native';
import React from 'react';
import { CarouselItem } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';

type CarouselCardProps = {
    item?: CarouselItem; // Make item optional
    onPress?: () => void;
    width?: number;
    height?: number;
};

const { width: screenWidth } = Dimensions.get('window');

const CarouselCard: React.FC<CarouselCardProps> = ({
                                                       item,
                                                       onPress,
                                                       width = screenWidth - 32, // Default to screen width minus padding
                                                       height = 180
                                                   }) => {
    // If no item is provided, render a placeholder with skeleton loading effect
    if (!item) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                className="mx-2"
            >
                <View
                    style={{ width, height }}
                    className="rounded-xl bg-gray-800 overflow-hidden"
                >
                    <View className="absolute inset-0 bg-gray-700 animate-pulse" />
                    <View className="p-4 h-full justify-end">
                        <View className="bg-gray-700 h-6 w-3/4 rounded-md mb-2 animate-pulse" />
                        <View className="bg-gray-700 h-4 w-1/2 rounded-md animate-pulse" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // Safe access to image property with fallback
    const imageSource = item.image
        ? (typeof item.image === 'string' ? { uri: item.image } : item.image as ImageSourcePropType)
        : require('@/assets/placeholder.png'); // Make sure you have this placeholder image

    // Determine background color class from item or use default
    const bgColorClass = item.bgColor || 'bg-orange-600';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="mx-2"
        >
            <View
                style={{ width, height }}
                className="rounded-xl overflow-hidden shadow-lg"
            >
                <ImageBackground
                    source={imageSource}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                        style={{ width: '100%', height: '100%' }}
                        className="p-5 flex justify-between"
                    >
                        <View className="flex-row justify-end">
                            <View className={`${bgColorClass} px-3 py-1 rounded-full`}>
                                <Text className="text-white font-medium text-xs">En Vedette</Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-white font-bold text-xl mb-1 shadow-text">
                                {item.title || "Offre Spéciale"}
                            </Text>

                            {item.subtitle && (
                                <Text className="text-gray-200 text-sm mb-3 shadow-text">
                                    {item.subtitle}
                                </Text>
                            )}

                            {item.buttonText && (
                                <TouchableOpacity
                                    className="self-start bg-white px-4 py-2 rounded-full mt-2"
                                    onPress={onPress}
                                >
                                    <Text className="text-gray-900 font-bold text-sm">{item.buttonText}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </LinearGradient>
                </ImageBackground>
            </View>
        </TouchableOpacity>
    );
};

export default CarouselCard;