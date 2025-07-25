import { View, Text } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';

type RatingProps = {
    rating: number;
    reviews?: number;
    showCount?: boolean;
    size?: number;
    color?: string;
};

const Rating: React.FC<RatingProps> = ({
                                           rating,
                                           reviews,
                                           showCount = false,
                                           size = 16,
                                           color = "#F59E0B"
                                       }) => {
    return (
        <View className="flex-row items-center">
            <Feather name="star" size={size} color={color} />
            <Text className="text-white ml-1 mr-1">{rating}</Text>
            {showCount && reviews && (
                <Text className="text-neutral-400 text-xs">({reviews})</Text>
            )}
        </View>
    );
};

export default Rating;