import {View, FlatList, TouchableOpacity, Text} from 'react-native';
import React from 'react';
import SectionHeader from '@/components/SectionHeader';
import CategoryCard from '@/components/CategoryCard';
import { router } from 'expo-router';

type CategorySectionProps = {
    categories: any[];
    onCategoryPress?: (category: any) => void;
    onViewAllPress?: () => void;
    title?: string;
    isLoading?: boolean;
};

const CategorySection: React.FC<CategorySectionProps> = ({
                                                             categories = [], // Default to empty array
                                                             onCategoryPress,
                                                             onViewAllPress,
                                                             title = "Qu'avez-vous envie de manger ?",
                                                             isLoading = false
                                                         }) => {
    // Default category press handler if not provided
    const handleCategoryPress = (category) => {
        console.log(`Navigating to category from section: ${category.id} - ${category.name}`);

        // Use Expo Router to navigate to category detail
        router.push({
            pathname: '/category/[categoryId]',
            params: {
                categoryId: category.id,
                categoryName: category.name
            }
        });
    };

    // Use the provided onCategoryPress or default handler
    const categoryPressHandler = onCategoryPress || handleCategoryPress;

    // Handle loading state with shimmer effect
    if (isLoading) {
        return (
            <View className="mt-6 px-4">
                <SectionHeader
                    title={title}
                    showArrow={true}
                    onPress={onViewAllPress}
                />
                <FlatList
                    horizontal
                    data={[1, 2, 3, 4]} // Placeholder items
                    keyExtractor={(item) => item.toString()}
                    renderItem={() => (
                        <View className="mr-4 items-center">
                            <View className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mb-2" />
                            <View className="w-14 h-4 bg-gray-200 animate-pulse rounded-md" />
                        </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                    className="py-4"
                />
            </View>
        );
    }

    // Handle empty state with a call-to-action
    if (categories.length === 0) {
        return (
            <View className="mt-6 px-4">
                <SectionHeader
                    title={title}
                    showArrow={false}
                />
                <View className="py-6 bg-gray-100 rounded-xl items-center justify-center my-2">
                    <Text className="text-gray-600 text-center mb-3">Aucune catégorie disponible</Text>
                    <TouchableOpacity
                        className="px-4 py-2 rounded-lg"
                        style={{ backgroundColor: '#a86e02' }}
                        onPress={onViewAllPress}
                    >
                        <Text className="text-white font-medium">Parcourir le Menu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="mt-6 px-4">
            <SectionHeader
                title={title}
                showArrow={true}
                onPress={onViewAllPress}
            />

            <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item}) => (
                    <CategoryCard
                        category={item}
                        onPress={() => categoryPressHandler(item)}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 12 }}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                decelerationRate="fast"
                snapToAlignment="center"
            />
        </View>
    );
};

export default CategorySection;