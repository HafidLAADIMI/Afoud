import { View, Text } from 'react-native';
import React from 'react';

type BadgeProps = {
    text: string;
    color?: string;
    textColor?: string;
};

const Badge: React.FC<BadgeProps> = ({
                                         text,
                                         color = 'bg-orange-500',
                                         textColor = 'text-white'
                                     }) => {
    return (
        <View className={`px-2 py-1 rounded ${color}`}>
            <Text className={`text-xs font-bold ${textColor}`}>{text}</Text>
        </View>
    );
};

export default Badge;