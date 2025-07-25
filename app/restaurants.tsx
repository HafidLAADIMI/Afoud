import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Assuming you have a function to get gallery images
import { getRestaurantGallery } from '@/utils/firebase';

type GalleryImage = {
    id: string;
    image: string;
    title?: string;
    description?: string;
    category?: string;
};

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 2; // 2 columns with padding

export default function RestaurantGalleryScreen() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    useEffect(() => {
        fetchGalleryImages();
    }, []);

    const fetchGalleryImages = async () => {
        try {
            setIsLoading(true);
            const galleryImages = await getRestaurantGallery();
            setImages(galleryImages);
        } catch (error) {
            console.error('Error fetching gallery images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get unique categories from images
    const categories = ['all', ...Array.from(new Set(images.map(img => img.category).filter(Boolean)))];

    // Filter images by selected category
    const filteredImages = selectedCategory === 'all'
        ? images
        : images.filter(img => img.category === selectedCategory);

    const handleImagePress = (image: GalleryImage) => {
        setSelectedImage(image);
    };

    const closeImagePreview = () => {
        setSelectedImage(null);
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 p-4">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Restaurant Gallery</Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-4">Loading gallery...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="p-4 flex-row items-center mb-2">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-white text-xl font-bold">Restaurant Gallery</Text>
                    <Text className="text-gray-400 text-sm">Explore our restaurant ambiance and dishes</Text>
                </View>
            </View>

            {/* Categories */}
            <View className="px-4 mb-4">
                <FlatList
                    horizontal
                    data={categories}
                    keyExtractor={(item, index) => `category-${index}`}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedCategory(item)}
                            className={`px-4 py-2 rounded-full mr-2 ${
                                selectedCategory === item ? 'bg-orange-500' : 'bg-gray-800'
                            }`}
                        >
                            <Text
                                className={`${
                                    selectedCategory === item ? 'text-white' : 'text-gray-400'
                                } capitalize`}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Gallery Grid */}
            <FlatList
                data={filteredImages}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ padding: 12 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.imageContainer, { width: imageSize, height: imageSize }]}
                        onPress={() => handleImagePress(item)}
                        className="m-2 rounded-xl overflow-hidden"
                    >
                        <Image
                            source={{ uri: item.image }}
                            style={styles.image}
                            resizeMode="cover"
                        />

                        {/* Optional title overlay */}
                        {item.title && (
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.7)']}
                                style={styles.gradient}
                            >
                                <Text className="text-white font-medium text-center">{item.title}</Text>
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center p-12">
                        <Text className="text-gray-400 text-center">No gallery images found</Text>
                    </View>
                }
            />

            {/* Image Preview Modal */}
            {selectedImage && (
                <View className="absolute inset-0 bg-black flex justify-center items-center">
                    <TouchableOpacity
                        onPress={closeImagePreview}
                        className="absolute top-12 right-4 bg-black/50 p-2 rounded-full z-10"
                    >
                        <Feather name="x" size={24} color="white" />
                    </TouchableOpacity>

                    <Image
                        source={{ uri: selectedImage.image }}
                        style={styles.previewImage}
                        resizeMode="contain"
                    />

                    {(selectedImage.title || selectedImage.description) && (
                        <View className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                            {selectedImage.title && (
                                <Text className="text-white text-lg font-bold">{selectedImage.title}</Text>
                            )}
                            {selectedImage.description && (
                                <Text className="text-gray-300 mt-1">{selectedImage.description}</Text>
                            )}
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    previewImage: {
        width: '100%',
        height: '80%',
    }
});