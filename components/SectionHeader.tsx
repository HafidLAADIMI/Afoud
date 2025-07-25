import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';

type SectionHeaderProps = {
    title: string;
    subtitle?: string;
    showArrow?: boolean;
    showStars?: boolean;
    onPress?: () => void;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
                                                         title,
                                                         subtitle,
                                                         showArrow = false,
                                                         showStars = false,
                                                         onPress
                                                     }) => {
    return (
        <View className="mb-4">
            {/* Title row with optional arrow */}
            <View className="flex-row justify-between items-center">
                {/* Left side with title */}
                <View className="flex-row items-center">
                    {/* Decorative vertical line */}
                    {!showStars && (
                        <View className="w-1 h-5 bg-orange-500 rounded-full mr-2" />
                    )}

                    {/* Stars decoration */}
                    {showStars && (
                        <View className="flex-row mr-2">
                            <Feather name="star" size={16} color="#F97316" />
                            <Feather name="star" size={16} color="#F97316" style={{ marginLeft: -5 }} />
                        </View>
                    )}

                    <Text className="text-white font-bold text-lg">{title}</Text>
                </View>

                {/* View all button with arrow */}
                {showArrow && onPress && (
                    <TouchableOpacity
                        onPress={onPress}
                        className="flex-row items-center"
                    >
                        <Text className="text-orange-400 font-medium mr-1">Voir tout</Text>
                        <Feather name="chevron-right" size={16} color="#FB923C" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Optional subtitle */}
            {subtitle && (
                <Text className="text-gray-400 text-sm mt-1 ml-3">
                    {subtitle}
                </Text>
            )}
        </View>
    );
};

export default SectionHeader;