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
                                                                 title = "Afood Restaurant",
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
                        <Text className="text-gray-900 text-lg font-bold">{title}</Text>
                        <Text className="text-gray-600 text-sm">{subtitle}</Text>
                    </View>                    
                </View>
            </View>

            {/* Small decorative corner */}
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