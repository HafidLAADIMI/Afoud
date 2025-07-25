import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import SectionHeader from '@/components/SectionHeader';
import { Cuisine } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';

type CuisineSectionProps = {
    cuisines: Cuisine[];
    onCuisinePress: (cuisine: Cuisine) => void;
    onViewAllPress?: () => void;
    title?: string;
};

const CuisineSection: React.FC<CuisineSectionProps> = ({
                                                           cuisines,
                                                           onCuisinePress,
                                                           onViewAllPress,
                                                           title = "Cuisines Populaires"
                                                       }) => {
    const hasLogged = useRef(false);

    // Log exactly once, when we first get non-empty data
    useEffect(() => {
        if (!hasLogged.current && cuisines.length > 0) {
            console.log('Cuisines data:', cuisines);
            cuisines.forEach(c =>
                console.log(`• ${c.name} → ${c.image}`)
            );
            hasLogged.current = true;
        }
    }, [cuisines]);

    if (!cuisines || cuisines.length === 0) return null;

    return (
        <View className="mt-8 px-4">
            <SectionHeader
                title={title}
                showArrow={!!onViewAllPress}
                onPress={onViewAllPress}
            />

            <FlatList
                horizontal
                data={cuisines}
                keyExtractor={item => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToAlignment="start"
                contentContainerStyle={{ paddingVertical: 8 }}

                renderItem={({ item }) => {
                    // no more console.log here!
                    const imageSource = typeof item.image === 'string'
                        ? { uri: item.image }
                        : (item.image as ImageSourcePropType);

                    return (
                        <TouchableOpacity
                            onPress={() => onCuisinePress(item)}
                            activeOpacity={0.8}
                            className="mr-4 relative"
                            style={{ width: 112, height: 160 }}
                        >
                            <View
                                className="w-28 h-40 rounded-xl overflow-hidden"
                                style={{ backgroundColor: '#374151' }}
                            >
                                <Image
                                    source={imageSource}
                                    className="w-full h-full"
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                    onError={e => console.log('Image load error:', e.nativeEvent.error)}
                                />

                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                                    className="absolute inset-0"
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                                />

                                <View
                                    className="absolute bottom-0 left-0 right-0 p-2"
                                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 }}
                                >
                                    <Text
                                        className="text-white font-bold text-center"
                                        style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}
                                    >
                                        {item.name}
                                    </Text>
                                </View>
                            </View>

                            <View
                                className="absolute -right-1 -top-1 bg-orange-500 rounded-full w-4 h-4"
                                style={{
                                    position: 'absolute',
                                    top: -4,
                                    right: -4,
                                    backgroundColor: '#F97316',
                                    width: 16,
                                    height: 16,
                                    borderRadius: 8
                                }}
                            />
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

export default CuisineSection;