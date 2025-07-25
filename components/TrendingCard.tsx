import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';


const TrendingCard = ({ item }: { item }) => {
    return (
        <TouchableOpacity className="w-48 mr-4 bg-neutral-800 rounded-xl overflow-hidden pb-4">
            <Image
                source={{ uri: item.image }}
                className="w-full h-40 rounded-t-lg"
                resizeMode="cover"
            />
            <View className="absolute top-2 left-2 bg-orange-500 px-2 py-1 rounded">
                <Text className="text-xs text-white font-bold">{item.discount}% RÉDUCTION</Text>
            </View>
            <View className="p-2">
                <Text className="text-neutral-400 text-xs">Nom du Restaurant</Text>
                <Text className="text-white font-bold">Article Alimentaire</Text>
                <Text className="text-neutral-400 line-through text-xs">200 MAD</Text>
                <Text className="text-white font-bold">180 MAD</Text>
            </View>
        </TouchableOpacity>
    );
};

export default TrendingCard;