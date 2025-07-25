import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';

type DineInCardProps = {
    onPress?: () => void;
    title?: string;
    subtitle?: string;
};

const ModernDineInCard: React.FC<DineInCardProps> = ({
                                                         onPress,
                                                         title = "Expérience Sur Place",
                                                         subtitle = "Réservez votre table maintenant"
                                                     }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="mx-4 mb-6 bg-gray-800 rounded-2xl overflow-hidden"
            style={styles.cardShadow}
        >
            <View className="p-4 flex-row justify-between items-center">
                {/* Left icon */}
                <View className="bg-orange-500/20 p-3 rounded-full">
                    <Feather name="coffee" size={24} color="#F97316" />
                </View>

                {/* Center content */}
                <View className="flex-1 mx-3">
                    <Text className="text-white text-lg font-bold">{title}</Text>
                    <Text className="text-gray-400 text-xs">{subtitle}</Text>
                </View>

                {/* Right arrow */}
                <View className="bg-orange-500 rounded-full p-2">
                    <Feather name="chevron-right" size={20} color="white" />
                </View>
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
        elevation: 6,
    }
});

export default ModernDineInCard;