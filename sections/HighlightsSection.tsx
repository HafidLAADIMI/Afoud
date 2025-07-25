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
                <View className="h-56 bg-gray-800 rounded-xl justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-2">Chargement...</Text>
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
                <View className="h-56 bg-gray-800 rounded-xl justify-center items-center">
                    <Feather name="alert-circle" size={32} color="#F97316" />
                    <Text className="text-white mt-2">{error}</Text>
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
                className="rounded-xl overflow-hidden"
                onPress={() => onPress(highlight)}
                activeOpacity={0.9}
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
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        className="absolute inset-0"
                    />

                    {/* Content overlay */}
                    <View className="absolute bottom-0 left-0 right-0 p-4">
                        <View className="flex-row items-center mb-1">
                            <View className="bg-orange-500 rounded-full px-3 py-1 mr-2">
                                <Text className="text-white text-xs font-bold">À LA UNE</Text>
                            </View>

                            {highlight.price && (
                                <View className="bg-white rounded-full px-3 py-1">
                                    <Text className="text-gray-900 text-xs font-bold">
                                        {highlight.price.toFixed(2)} MAD
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text className="text-white font-bold text-xl mb-1">{highlight.name}</Text>

                        {highlight.description && (
                            <Text className="text-gray-300 mb-3" numberOfLines={2}>
                                {highlight.description}
                            </Text>
                        )}

                        <TouchableOpacity
                            className="flex-row items-center self-start bg-orange-500 px-4 py-2 rounded-full mt-2"
                            onPress={() => onPress(highlight)}
                        >
                            <Text className="text-white font-bold mr-2">{buttonText}</Text>
                            <Feather name="arrow-right" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Additional details section */}
                <View className="bg-gray-800 p-4">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Feather name="clock" size={14} color="#F97316" />
                            <Text className="text-gray-300 text-xs ml-1">
                                {highlight.estimatedTime || '20-30 min'}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Feather name="star" size={14} color="#F97316" />
                            <Text className="text-gray-300 text-xs ml-1">
                                {highlight.rating?.toFixed(1) || '4.8'}
                                {highlight.reviewCount ? ` (${highlight.reviewCount}+ avis)` : ''}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <Feather name="thumbs-up" size={14} color="#F97316" />
                            <Text className="text-gray-300 text-xs ml-1">
                                {highlight.positivePercentage || 98}% positif
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Refresh option */}
            <TouchableOpacity
                className="self-center mt-2 flex-row items-center"
                onPress={fetchSuggestion}
            >
                <Feather name="refresh-cw" size={14} color="#F97316" />
                <Text className="text-orange-500 ml-1 text-sm">Actualiser</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    }
});

export default HighlightsSection;