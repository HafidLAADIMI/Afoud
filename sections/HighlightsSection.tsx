import { View, Image, TouchableOpacity, Text, StyleSheet, ImageSourcePropType, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import SectionHeader from '@/components/SectionHeader';
import { Product } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getDailySuggestion } from '@/utils/firebase';

type HighlightsSectionProps = {
    onPress: (product: Product) => void;
    buttonText?: string;
    fallbackHighlight?: Product; // Suggestion de secours au cas où aucune n'est trouvée
};

const HighlightsSection: React.FC<HighlightsSectionProps> = ({
                                                                 onPress,
                                                                 buttonText = "Commander",
                                                                 fallbackHighlight
                                                             }) => {
    const [highlight, setHighlight] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSuggestion();
    }, []);

    const fetchSuggestion = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const suggestion = await getDailySuggestion();

            if (suggestion) {
                setHighlight(suggestion);
            } else if (fallbackHighlight) {
                // Utiliser la suggestion de secours si aucune n'est trouvée
                setHighlight(fallbackHighlight);
            } else {
                setError("Aucune suggestion disponible aujourd'hui");
            }
        } catch (err) {
            console.error("Erreur lors de la récupération de la suggestion:", err);
            setError("Impossible de charger la suggestion du jour");

            // Utiliser la suggestion de secours en cas d'erreur
            if (fallbackHighlight) {
                setHighlight(fallbackHighlight);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // État de chargement
    if (isLoading) {
        return (
            <View className="mx-4 mt-8 mb-6">
                <SectionHeader
                    title="Suggestion du Jour"
                    subtitle="Chargement de la recommandation..."
                    showStars={false}
                />
                <View className="h-56 bg-white rounded-2xl border border-gray-200 justify-center items-center">
                    <View className="bg-yellow-50 p-4 rounded-full mb-3">
                        <ActivityIndicator size="large" color="#a86e02" />
                    </View>
                    <Text className="text-gray-600 font-medium">Chargement...</Text>
                </View>
            </View>
        );
    }

    // État d'erreur sans suggestion de secours
    if (error && !highlight) {
        return (
            <View className="mx-4 mt-8 mb-6">
                <SectionHeader
                    title="Suggestion du Jour"
                    subtitle="Indisponible pour le moment"
                    showStars={false}
                />
                <View className="h-56 bg-white rounded-2xl border border-gray-200 justify-center items-center">
                    <View className="bg-yellow-50 p-4 rounded-full mb-3">
                        <Feather name="alert-circle" size={32} color="#a86e02" />
                    </View>
                    <Text className="text-gray-600 mt-2 text-center px-4">{error}</Text>
                </View>
            </View>
        );
    }

    // Si pas de highlight, ne pas afficher la section
    if (!highlight) {
        return null;
    }

    // Safe access to image property with fallback
    const imageSource = highlight.image
        ? (typeof highlight.image === 'string' ? { uri: highlight.image } : highlight.image as ImageSourcePropType)
        : require('@/assets/placeholder.png');

    return (
        <View className="mx-4 mt-8 mb-6">
            <SectionHeader
                title="Suggestion du Jour"
                subtitle="Recommandation spéciale de notre chef"
                showStars={true}
            />

            <TouchableOpacity
                className="rounded-2xl overflow-hidden bg-white border border-gray-100"
                onPress={() => onPress(highlight)}
                activeOpacity={0.95}
                style={styles.cardShadow}
            >
                <View className="relative">
                    <Image
                        source={imageSource}
                        className="w-full h-56"
                        resizeMode="cover"
                    />

                    {/* Overlay gradient for better text readability */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        className="absolute inset-0"
                    />

                    {/* Content overlay */}
                    <View className="absolute bottom-0 left-0 right-0 p-5">
                        <View className="flex-row items-center mb-2">
                            <View className="bg-yellow-600 rounded-full px-4 py-1.5 mr-3">
                                <Text className="text-white text-xs font-bold">À LA UNE</Text>
                            </View>

                            {highlight.price && (
                                <View className="bg-white/95 rounded-full px-4 py-1.5">
                                    <Text className="text-gray-900 text-xs font-bold">
                                        {highlight.price.toFixed(2)} MAD
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text className="text-white font-bold text-xl mb-2">{highlight.name}</Text>

                        {highlight.description && (
                            <Text className="text-gray-200 mb-4 leading-5" numberOfLines={2}>
                                {highlight.description}
                            </Text>
                        )}

                        <TouchableOpacity
                            className="flex-row items-center self-start bg-yellow-600 px-5 py-3 rounded-full"
                            onPress={() => onPress(highlight)}
                            activeOpacity={0.9}
                            style={{
                                shadowColor: '#a86e02',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 5,
                            }}
                        >
                            <Text className="text-white font-bold mr-2">{buttonText}</Text>
                            <Feather name="arrow-right" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Additional details section */}
                <View className="bg-white p-5 border-t border-gray-100">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <View className="bg-yellow-50 p-1.5 rounded-full mr-2">
                                <Feather name="clock" size={14} color="#a86e02" />
                            </View>
                            <Text className="text-gray-600 text-sm font-medium">
                                {highlight.estimatedTime || '20-30 min'}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <View className="bg-yellow-50 p-1.5 rounded-full mr-2">
                                <Feather name="star" size={14} color="#a86e02" />
                            </View>
                            <Text className="text-gray-600 text-sm font-medium">
                                {highlight.rating?.toFixed(1) || '4.8'}
                                {highlight.reviewCount ? ` (${highlight.reviewCount}+)` : ''}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <View className="bg-yellow-50 p-1.5 rounded-full mr-2">
                                <Feather name="thumbs-up" size={14} color="#a86e02" />
                            </View>
                            <Text className="text-gray-600 text-sm font-medium">
                                {highlight.positivePercentage || 98}%
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Refresh option */}
            <TouchableOpacity
                className="self-center mt-4 flex-row items-center bg-yellow-50 px-4 py-2 rounded-full"
                onPress={fetchSuggestion}
                activeOpacity={0.8}
            >
                <Feather name="refresh-cw" size={14} color="#a86e02" />
                <Text className="text-yellow-700 ml-2 text-sm font-medium">Actualiser la suggestion</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    }
});

export default HighlightsSection;