import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';

type GalleryImage = {
    id: string;
    image: string;
    title?: string;
    description?: string;
};

type Props = {
    images: GalleryImage[];
    sectionTitle?: string;
    description?: string;
};

export default function RestaurantGallerySection({
                                                     images,
                                                     sectionTitle = 'Notre Restaurant en Images',
                                                     description = 'Découvrez l’ambiance et les plats de notre restaurant à travers ces images.',
                                                 }: Props) {
    if (images.length === 0) return null;

    return (
        <View className="mt-8">
            <Text className="text-white text-xl font-bold px-4 mb-2">{sectionTitle}</Text>
            <Text className="text-gray-400 px-4 mb-4">{description}</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            >
                {images.map((img) => (
                    <View key={img.id} className="mr-4">
                        <Image
                            source={{ uri: img.image }}
                            className="w-40 h-28 rounded-lg"
                            resizeMode="cover"
                        />
                        {img.title && (
                            <Text className="text-white text-sm mt-1" numberOfLines={1}>
                                {img.title}
                            </Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
