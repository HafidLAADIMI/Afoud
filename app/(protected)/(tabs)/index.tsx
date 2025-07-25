import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    ToastAndroid,
    RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {router, useRouter} from 'expo-router';

// Firebase helpers
import {
    getCategories,
    getCarouselItems,
    getTrendingItems,
    getCuisines,
    getRestaurantGallery,
    checkFirestoreConnection, GalleryImage,
} from '@/utils/firebase';

// Types
import {
    Category,
    CarouselItem as CarouselItemType,
    TrendingItem,

    Cuisine,
    Product,
} from '@/types';

// UI sections & components
import CategorySection from '@/sections/CategorySection';
import TrendingSection from '@/sections/TrendingSection';
import FindNearbyCard from '@/components/FindNearbyCard';
import DineInCard from '@/components/DineInCard';
import HighlightsSection from '@/sections/HighlightsSection';
import CuisineSection from '@/sections/CuisineSection';

import Header from '@/components/Header';
import { CarouselCard } from '@/components';
import ProductDetailModal from '@/components/ProductDetailModal';
import RestaurantGallerySection from '@/sections/RestaurantGallerySection';


import '../../../global.css';
import {useAuth} from "@/context/AuthContext";

const NetworkStatusBar = ({ isOffline }: { isOffline: boolean }) =>
    !isOffline ? null : (
        <View className="bg-red-500 py-2 px-4">
            <Text className="text-white text-center font-semibold">
                Vous êtes hors ligne. Utilisation des données en cache.
            </Text>
        </View>
    );

export default function HomeScreen() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        }
    }, [user, isLoading]);
    /* ───────────────────────────────────
       BASIC STATE
    ─────────────────────────────────── */
    const [search, setSearch] = useState('');
    const [loading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);


    /* ───────────────────────────────────
       DATA FROM FIREBASE
    ─────────────────────────────────── */
    const [categories, setCategories] = useState<Category[]>([]);
    const [carouselItems, setCarouselItems] = useState<CarouselItemType[]>([]);
    const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
    const [cuisines, setCuisines] = useState<Cuisine[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

    /* ───────────────────────────────────
       SHEET STATE (NEW)
    ─────────────────────────────────── */
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);

    /* ───────────────────────────────────
       NETWORK CHECK
    ─────────────────────────────────── */
    const checkNetworkConnection = useCallback(async () => {
        try {
            const isConnected = await checkFirestoreConnection();
            setIsOffline(!isConnected);
            return isConnected;
        } catch (err) {
            console.error('Network-check error:', err);
            setIsOffline(true);
            return false;
        }
    }, []);

    /* ───────────────────────────────────
       FETCH DATA
    ─────────────────────────────────── */

    const fetchData = useCallback(
        async (showLoading = true) => {
            if (showLoading) setIsLoading(true);
            try {
                setError(null);
                const isConnected = await checkNetworkConnection();

                // Only fetch frequently changing data during automatic refresh
                if (showLoading) {
                    // Full data load on manual refresh or initial load
                    const [
                        categoriesData,
                        carouselData,
                        trendingData,
                        cuisinesData,
                        galleryData
                    ] = await Promise.all([
                        getCategories(),
                        getCarouselItems(),
                        getTrendingItems(),
                        getCuisines(),
                        getRestaurantGallery()
                    ]);

                    setCategories(cuisinesData);
                    setCarouselItems(carouselData.map((item) => ({ ...item, buttonText: 'Commander' })));
                    setTrendingItems(trendingData);
                    setCuisines(cuisinesData);
                    setGalleryImages(galleryData);
                } else {
                    // Just fetch data that might change frequently
                    const [trendingData,galleryData] = await Promise.all([
                        getTrendingItems(),
                        getRestaurantGallery()
                    ]);

                    setTrendingItems(trendingData);
                    setGalleryImages(galleryData);

                }
            } catch (err) {
                console.error(err);
                setError('Échec du chargement des données. Veuillez réessayer.');
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [checkNetworkConnection],
    );

    /* ───────────────────────────────────
       INITIAL MOUNT / INTERVAL REFRESH
    ─────────────────────────────────── */
    useEffect(() => {
        fetchData();
        const id = setInterval(async () => {
            if (await checkNetworkConnection()) fetchData(false);
        }, 10_000);
        return () => clearInterval(id);
    }, [fetchData, checkNetworkConnection]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData(false);
    };

    /* ───────────────────────────────────
       TAP A PRODUCT  →  OPEN SHEET
    ─────────────────────────────────── */
    const handleProductPress = (product: Product) => {
        // Vérifier si le produit existe
        if (!product) {
            ToastAndroid.show('Produit non disponible', ToastAndroid.SHORT);
            return;
        }

        // Normaliser la structure du prix pour assurer la compatibilité
        const normalizedProduct = {
            ...product,
            // Prioritiser les propriétés de prix dans l'ordre correct
            price: product.price || product.discountedPrice || (product.originalPrice || 0),
        };

        // Si nous avons un prix avec remise mais pas de prix principal, le définir
        if (!normalizedProduct.price && product.discountedPrice) {
            normalizedProduct.price = product.discountedPrice;
        }

        // Vérifier si le prix est valide avant d'ouvrir le modal
        if (typeof normalizedProduct.price !== 'number' ||
            isNaN(normalizedProduct.price) ||
            normalizedProduct.price <= 0) {

            Alert.alert(
                "Prix non disponible",
                "Ce produit n'a pas de prix valide. Impossible de commander.",
                [{ text: "OK" }]
            );
            return;
        }

        setSelectedProduct(normalizedProduct);
        setDetailVisible(true);
    };

    /* ───────────────────────────────────
       "ORDER NOW" INSIDE SHEET
    ─────────────────────────────────── */
    const handleOrderNow = (
        total: number,
        quantity: number,
        addons: Record<string, boolean>,
    ) => {
        setDetailVisible(false);
        router.push({
            pathname: '/checkout',
            params: {
                totalAmount: total.toString(),
                quantity: quantity.toString(),
                addons: JSON.stringify(addons),
                id: selectedProduct?.id ?? '',
            },
        });
    };



    const highlightItem: Product = {
        id: 'highlight1',
        name: 'Saveurs Audacieuses, Goûts Intenses',
        price: 12.99,
        description:
            'Notre burger signature avec des ingrédients premium. Essayez-le avec l\'offre spéciale du jour !',
        image: require('@/assets/burger.jpeg'),
    };

    /* ───────────────────────────────────
       RENDER
    ─────────────────────────────────── */
    if (loading)
        return (
            <SafeAreaView className="flex-1 bg-gray-900">
                <Header search={search} setSearch={setSearch} />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-white mt-4 font-medium">
                        Chargement du contenu frais...
                    </Text>
                </View>
            </SafeAreaView>
        );

    if (error)
        return (
            <SafeAreaView className="flex-1 bg-gray-900">
                <Header search={search} setSearch={setSearch} />
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-white text-center mb-4 text-lg">{error}</Text>
                    <View className="bg-orange-500 px-8 py-3 rounded-full">
                        <Text className="text-white font-semibold" onPress={() => fetchData()}>
                            Réessayer
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        );

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <Header search={search} setSearch={setSearch} />
            <NetworkStatusBar isOffline={isOffline} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#F97316"
                        colors={['#F97316']}
                    />
                }
            >
                {/* Featured Carousel */}
                {carouselItems.length > 0 && (
                    <View className="my-4">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 10 }}
                            decelerationRate="fast"
                            snapToInterval={380}
                            snapToAlignment="center"
                        >
                            {carouselItems.map((item) => (
                                <CarouselCard
                                    key={item.id}
                                    item={item}
                                    onPress={() => handleProductPress(item as unknown as Product)}
                                    width={360}
                                    height={180}
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Categories */}
                <CategorySection
                    categories={categories}
                    onCategoryPress= {(c) => router.push(`/cuisine/${c.id}`)}
                    onViewAllPress={() => router.push('/cuisines')}
                    title="Qu'avez-vous envie de manger ?"
                    isLoading={loading}
                />

                {/* Trends */}
                {trendingItems.length > 0 && (
                    <TrendingSection
                        items={trendingItems as unknown as Product[]}
                        onItemPress={handleProductPress}
                        onFavoritePress={(item) =>
                            console.log('Ajouté aux favoris:', item.name)
                        }
                        title="Tendances du Jour"
                        subtitle="Voici ce que les gens adorent en ce moment"
                    />
                )}

                {/* Nearby */}
                <View className="mt-8">
                    <FindNearbyCard
                    />
                </View>

                {/* Highlight */}
                <HighlightsSection
                    highlight={highlightItem}
                    onPress={handleProductPress}
                    buttonText="Commander Maintenant"
                />

                {/* Dine-In */}
                <View className="mt-6">
                    <DineInCard/>

                </View>

                {/* Cuisines */}
                {cuisines.length > 0 && (
                    <CuisineSection
                        cuisines={cuisines}
                        onCuisinePress={(c) => router.push(`/cuisine/${c.id}`)}
                        onViewAllPress={() => router.push('/cuisines')}
                    />
                )}

               <RestaurantGallerySection images={galleryImages}/>
                <View className="h-8" />
            </ScrollView>

            {/* ───── PRODUCT SHEET ───── */}
            {selectedProduct && (
                <ProductDetailModal
                    isVisible={detailVisible}
                    onClose={() => setDetailVisible(false)}
                    onOrder={handleOrderNow}
                    product={selectedProduct}
                />
            )}

            <StatusBar backgroundColor="#111827" barStyle="light-content" />
        </SafeAreaView>
    );
}