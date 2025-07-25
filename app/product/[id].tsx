// screens/ProductDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ProductDetailModal from '../../components/ProductDetailModal';
import { categories, trendingItems, popularRestaurants, cuisines } from '@/constants/dummyData';

// Define a type for your product data
type Product = {
    id: string;
    name: string;
    restaurant?: string;
    price: number;
    originalPrice?: number;
    description: string;
    discount?: string;
    image: any;
    rating?: number;
    isVeg?: boolean;
    addons?: Array<{
        id: string;
        name: string;
        price: number;
    }>;
};

// Helper function to find product data
const findProductById = (id: string | string[] | undefined): Product | null => {
    if (!id || Array.isArray(id)) return null;

    const allItems = [...categories, ...trendingItems, ...popularRestaurants, ...cuisines];
    const item = allItems.find(item => item.id.toString() === id);

    if (!item) return null;

    // Adapter l'élément trouvé à la structure exacte attendue par ProductDetailModal
    return {
        id: item.id.toString(),
        name: item.name,
        restaurant: (item as any).restaurant || 'Restaurant Inconnu',
        price: (item as any).price || 0,
        originalPrice: (item as any).originalPrice || (item as any).price || 0,
        description: (item as any).description || 'Aucune description disponible.',
        discount: (item as any).discount || '',
        image: (item as any).image || require('@/assets/avatar.png'),
        rating: (item as any).rating || 0,
        isVeg: (item as any).isAvailable || false,
        addons: (item as any).addons || [],
    };
};

const ProductDetailScreen = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { id } = params;

    const [modalVisible, setModalVisible] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        console.log("ProductDetailScreen: Recherche du produit avec l'ID:", id);
        const foundProduct = findProductById(id);
        if (foundProduct) {
            console.log("ProductDetailScreen: Produit trouvé:", foundProduct.name);
            setProduct(foundProduct);
        } else {
            console.error("ProductDetailScreen: Produit non trouvé avec l'ID:", id);
        }
        setIsLoading(false);
    }, [id]);

    const handleClose = () => {
        setModalVisible(false);
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    };

    const handleOrder = (
        total: number,
        quantity: number,
        addons: Record<string, boolean>
    ) => {
        if (!product) {
            Alert.alert(
                "Erreur",
                "Produit non disponible",
                [{ text: "OK" }]
            );
            return;
        }

        // Vérifier si le prix est valide
        if (total <= 0 || isNaN(total)) {
            Alert.alert(
                "Prix non disponible",
                "Ce produit n'a pas de prix valide. Impossible de commander.",
                [{ text: "OK" }]
            );
            return;
        }

        setModalVisible(false);

        // Naviguer vers la page de paiement
        router.push({
            pathname: '/checkout',
            params: {
                totalAmount: total.toString(),
                quantity: quantity.toString(),
                addons: JSON.stringify(addons),
                id: product.id,
            },
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#FFA500" />
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView className="flex-1 bg-black justify-center items-center">
                <Text className="text-white text-lg mb-4">Produit non trouvé.</Text>
                <TouchableOpacity onPress={handleClose} className="bg-orange-500 py-2 px-4 rounded">
                    <Text className="text-white font-bold">Retour</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Only render the modal if we have product data
    return (
        <SafeAreaView className="flex-1 bg-black">
            <View className="flex-1 bg-neutral-900">
                <ProductDetailModal
                    isVisible={modalVisible}
                    onClose={handleClose}
                    onOrder={handleOrder}
                    product={product}
                />
            </View>
        </SafeAreaView>
    );
};

export default ProductDetailScreen;