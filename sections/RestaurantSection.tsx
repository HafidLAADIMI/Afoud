import { View, FlatList } from 'react-native';
import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import RestaurantCard from '@/components/RestaurantCard';
import { Restaurant } from '@/types';

type RestaurantSectionProps = {
    restaurants: Restaurant[];
    onRestaurantPress: (restaurant: Restaurant) => void;
    onFavoritePress?: (restaurant: Restaurant) => void;
    onViewAllPress?: () => void;
    title?: string;
};

const RestaurantSection: React.FC<RestaurantSectionProps> = ({
                                                                 restaurants,
                                                                 onRestaurantPress,
                                                                 onFavoritePress,
                                                                 onViewAllPress,
                                                                 title = "Restaurants Populaires"
                                                             }) => {
    // Handle empty state
    if (!restaurants || restaurants.length === 0) {
        return null;
    }

    return (
        <View className="mt-8 px-4 pb-4">
            <SectionHeader
                title={title}
                subtitle="Restaurants les mieux notés près de chez vous"
                showArrow={true}
                onPress={onViewAllPress}
            />

            <FlatList
                horizontal
                data={restaurants}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item}) => (
                    <RestaurantCard
                        restaurant={item}
                        onPress={() => onRestaurantPress(item)}
                        onFavoritePress={() => onFavoritePress && onFavoritePress(item)}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 12 }}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                decelerationRate="fast"
                snapToAlignment="start"
            />
        </View>
    );
};

export default RestaurantSection;