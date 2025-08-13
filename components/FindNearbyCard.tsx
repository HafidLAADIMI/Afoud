import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type RestaurantCardProps = {
    onPress?: () => void;
    title?: string;
    subtitle?: string;
};

const ModernRestaurantCard: React.FC<RestaurantCardProps> = ({
                                                                 onPress,
                                                                 title = "Afoud Restaurant",
                                                                 subtitle = "Savourez l'excellence"
                                                             }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.95}
            className="mx-4 mb-4 overflow-hidden rounded-xl"
            style={styles.cardShadow}
        >
            {/* Main Card Container */}
            <View className="bg-white border border-gray-100 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                    {/* Left Content */}
                    <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                            <View className="bg-yellow-50 p-1.5 rounded-full mr-2">
                                <Feather name="crown" size={14} color="#a86e02" />
                            </View>
                            <View className="bg-yellow-100 px-2 py-0.5 rounded-full">
                                <Text className="text-yellow-700 text-xs font-bold">PARTENAIRE</Text>
                            </View>
                        </View>
                        
                        <Text className="text-gray-900 text-lg font-bold">{title}</Text>
                        <Text className="text-gray-600 text-sm">{subtitle}</Text>
                    </View>

                    {/* Right Action Button */}
                    <LinearGradient
                        colors={['#a86e02', '#8b5a02']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="rounded-lg px-4 py-3"
                        style={styles.buttonShadow}
                    >
                        <View className="flex-row items-center">
                            <Feather name="utensils" size={16} color="white" />
                            <Text className="text-white font-bold ml-2 mr-1">Menu</Text>
                            <Feather name="arrow-right" size={14} color="white" />
                        </View>
                    </LinearGradient>
                </View>
            </View>

            {/* Small decorative corner */}
            <View className="absolute top-0 right-0 w-12 h-12">
                <LinearGradient
                    colors={['rgba(168, 110, 2, 0.1)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full h-full rounded-bl-full"
                />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#a86e02',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonShadow: {
        shadowColor: '#a86e02',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    }
});

export default ModernRestaurantCard;