import React from 'react';
import { TouchableOpacity, Image, Text, View } from 'react-native';

type CategoryCardProps = {
    category: any;
    onPress: () => void;
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
    // Safely handle image source
    const imageSource = category?.image
        ? (typeof category.image === 'string' ? { uri: category.image } : category.image)
        : require('@/assets/placeholder.png');

    return (
        <TouchableOpacity
            onPress={onPress}
            className="items-center"
            activeOpacity={0.7}
        >
            {/* Category Image */}
            <View className="w-20 h-20 mb-2 rounded-full overflow-hidden bg-gray-800">
                <Image
                    source={imageSource}
                    className="w-full h-full"
                    resizeMode="cover"
                />
            </View>

            {/* Category Name */}
            <Text className="text-white text-center font-medium">
                {category?.name || 'Category'}
            </Text>

            {/* Optional Item Count */}
            {category?.itemCount > 0 && (
                <Text className="text-orange-500 text-xs">
                    {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default CategoryCard;