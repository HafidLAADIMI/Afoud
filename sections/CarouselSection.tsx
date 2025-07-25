// src/components/sections/CarouselSection.tsx
import { View, ScrollView, Dimensions, Text, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import CarouselCard from '../components/CarouselCard';
import { CarouselItem } from '../constants/dummyData';

type CarouselSectionProps = {
    items: CarouselItem[];
    onItemPress: (item: CarouselItem) => void;
    isLoading?: boolean;
};

const { width: screenWidth } = Dimensions.get('window');

const CarouselSection: React.FC<CarouselSectionProps> = ({
                                                             items = [], // Default to empty array
                                                             onItemPress,
                                                             isLoading = false
                                                         }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // If loading, show a loading indicator
    if (isLoading) {
        return (
            <View className="mt-6 px-4 items-center">
                <View
                    style={{ width: screenWidth - 32, height: 180 }}
                    className="bg-neutral-800 rounded-xl justify-center items-center"
                >
                    <ActivityIndicator color="#F97316" />
                    <Text className="text-white mt-2">Chargement...</Text>
                </View>
            </View>
        );
    }

    // If no items, show a message
    if (!items || items.length === 0) {
        return (
            <View className="mt-6 px-4">
                <View
                    style={{ width: screenWidth - 32, height: 180 }}
                    className="bg-neutral-800 rounded-xl justify-center items-center"
                >
                    <Text className="text-white">Aucune offre disponible</Text>
                </View>
            </View>
        );
    }

    // Carousel indicator renderer
    const renderCarouselIndicators = () => (
        <View className="flex-row justify-center my-4">
            {items.map((_, index) => (
                <View
                    key={index}
                    className={`h-1 rounded-full mx-1 ${
                        index === currentIndex
                            ? 'w-6 bg-orange-500'
                            : 'w-1 bg-neutral-700'
                    }`}
                />
            ))}
        </View>
    );

    return (
        <View className="mt-6">
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                className="px-4"
                onMomentumScrollEnd={(e) => {
                    const contentOffset = e.nativeEvent.contentOffset;
                    const viewSize = e.nativeEvent.layoutMeasurement;
                    const pageNum = Math.floor(contentOffset.x / viewSize.width);
                    setCurrentIndex(pageNum);
                }}
            >
                {items.map((item, index) => (
                    <CarouselCard
                        key={index}
                        item={item}
                        onPress={() => onItemPress(item)}
                        width={screenWidth - 32} // Account for padding
                    />
                ))}
            </ScrollView>

            {/* Carousel Indicators */}
            {renderCarouselIndicators()}
        </View>
    );
};

export default CarouselSection;