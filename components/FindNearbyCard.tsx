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
            activeOpacity={0.9}
            className="mx-4 mb-6 overflow-hidden rounded-2xl"
            style={styles.cardShadow}
        >
            <LinearGradient
                colors={['#f97316', '#ea580c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-2xl px-5 py-4"
            >
                <View className="flex-row justify-between items-center">
                    {/* Left icon */}
                    <View className="bg-white/20 p-3 rounded-full">
                        <Feather name="award" size={22} color="white" />
                    </View>

                    {/* Center content */}
                    <View className="flex-1 mx-3">
                        <Text className="text-white text-lg font-bold">{title}</Text>
                        <Text className="text-white/80 text-xs">{subtitle}</Text>
                    </View>

                    {/* Right arrow */}
                    <View className="rounded-full bg-white p-2">
                        <Feather name="arrow-right" size={20} color="#ea580c" />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    }
});

export default ModernRestaurantCard;