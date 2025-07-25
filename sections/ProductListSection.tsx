import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ProductDetailModal from '../components/ProductDetailModal';
import { getProductById } from '@/utils/firebase';

const ProductDetailScreen = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { id, productData } = params;

    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(true);

    useEffect(() => {
        const fetchProductDetails = async () => {
            // Si les données du produit sont transmises directement, les utiliser
            if (productData) {
                try {
                    // Analyser les données de produit sous forme de chaîne JSON
                    const parsedProductData = JSON.parse(productData as string);
                    setProduct(parsedProductData);
                    setIsLoading(false);
                    return;
                } catch (parseError) {
                    console.error('Erreur d\'analyse des données du produit:', parseError);
                }
            }

            // Si aucune donnée de produit n'est fournie, récupérer depuis Firestore
            if (!id) {
                setError('Aucun identifiant de produit fourni');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const fetchedProduct = await getProductById(id as string);
                    console.log("logging fetchedProduct :",fetchedProduct)
                if (fetchedProduct) {
                    setProduct(fetchedProduct);
                } else {
                    setError('Produit non trouvé');
                }
            } catch (err) {
                console.error('Erreur lors de la récupération du produit:', err);
                setError('Échec du chargement des détails du produit');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetails();
    }, [id, productData]);

    const handleClose = () => {
        setModalVisible(false);
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    };

    const handleOrder = () => {
        if (!product) return;
        setModalVisible(false);
        router.push({
            pathname: '/checkout',
            params: {
                totalAmount: product.price.toString(),
                productId: product.id
            }
        });
    };
    console.log("product from product  list ", product.isAvailable);
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#F97316" />
                <Text className="text-white mt-4">Chargement des détails du produit...</Text>
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center px-4">
                <Text className="text-white text-lg mb-4 text-center">
                    {error || 'Produit non trouvé'}
                </Text>
                <TouchableOpacity
                    onPress={handleClose}
                    className="bg-orange-500 py-2 px-4 rounded-full"
                >
                    <Text className="text-white font-bold">Retour</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="flex-1 bg-gray-900">
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