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
                        <View className="w-1 h-5 rounded-full mr-2" style={{ backgroundColor: '#a86e02' }} />
                    )}
                    
                    {/* Stars decoration */}
                    {showStars && (
                        <View className="flex-row mr-2">
                            <Feather name="star" size={16} color="#a86e02" />
                            <Feather name="star" size={16} color="#a86e02" style={{ marginLeft: -5 }} />
                        </View>
                    )}
                    
                    <Text className="text-gray-800 font-bold text-lg">{title}</Text>
                </View>
                
                {/* View all button with arrow */}
                {showArrow && onPress && (
                    <TouchableOpacity
                        onPress={onPress}
                        className="flex-row items-center"
                    >
                        <Text className="font-medium mr-1" style={{ color: '#a86e02' }}>Voir tout</Text>
                        <Feather name="chevron-right" size={16} color="#a86e02" />
                    </TouchableOpacity>
                )}
            </View>
            
            {/* Optional subtitle */}
            {subtitle && (
                <Text className="text-gray-600 text-sm mt-1 ml-3">
                    {subtitle}
                </Text>
            )}
        </View>
    );
};

export default SectionHeader;