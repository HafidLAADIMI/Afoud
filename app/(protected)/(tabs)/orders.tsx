// screens/OrdersScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StatusBar, FlatList,
    Image, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather }      from '@expo/vector-icons';
import { router }       from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { getOrders, reorderItems, trackOrder } from '@/utils/firebase';

/* ─────────────────────────  status map + fallback  ───────────────────────── */
const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    pending   : { bg: 'bg-yellow-500',  text: '#FBBF24', icon: 'clock'        },
    processing: { bg: 'bg-blue-500',    text: '#3B82F6', icon: 'loader'       },
    delivered : { bg: 'bg-green-500',   text: '#10B981', icon: 'check-circle' },
    cancelled : { bg: 'bg-red-500',     text: '#EF4444', icon: 'x-circle'     },
};
const defaultStatus = { bg: 'bg-gray-600', text: '#9CA3AF', icon: 'alert-circle' };

/* ─────────────────────────────────  component  ───────────────────────────── */
export default function OrdersScreen() {
    const [activeTab, setActiveTab] = useState<'all'|'ongoing'|'completed'>('all');
    const [orders,    setOrders   ] = useState<any[]>([]);
    const [loading,   setLoading  ] = useState(true);

    /* fetch */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setOrders(await getOrders());
                console.log(orders)
            } catch (e) {
                console.error('Error loading orders:', e);
                Alert.alert('Erreur', 'Impossible de charger vos commandes');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* filter */
    const filtered = () => {
        if (activeTab === 'ongoing')
            return orders.filter(o => ['pending','processing'].includes(o.status));
        if (activeTab === 'completed')
            return orders.filter(o => ['delivered','cancelled'].includes(o.status));
        return orders;
    };

    /* render item */
    const renderOrderItem = ({ item }) => {
        const style = statusColors[item.status] ?? defaultStatus;
        if (!statusColors[item.status]) console.warn('Unknown order status:', item.status);

        // Traduction des statuts
        const statusTranslation = {
            'pending': 'En attente',
            'processing': 'En cours',
            'delivered': 'Livrée',
            'cancelled': 'Annulée'
        };

        return (
            <TouchableOpacity
                className="bg-white rounded-xl mb-4 overflow-hidden shadow-lg"
                activeOpacity={0.9}
                onPress={() => router.push(`/order-details/${item.id}`)}
            >
                {/* header */}
                <LinearGradient colors={['#f9fafb', '#f3f4f6']}
                                className="px-4 py-3 border-b border-gray-200 flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <Text className="text-gray-800 font-bold mr-2">Commande #{item.id}</Text>
                        <Text className="text-gray-600 text-xs">{item.date}</Text>
                    </View>

                    <View className={`px-3 py-1 rounded-full ${style.bg} bg-opacity-20 flex-row items-center`}>
                        <Feather name={style.icon} size={14} color={style.text} />
                        <Text style={{ color: style.text, fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>
                            {item.status ? statusTranslation[item.status] || 'Inconnu' : 'Inconnu'}
                        </Text>
                    </View>
                </LinearGradient>

                {/* restaurant */}
                <View className="px-4 pt-3 pb-1 flex-row items-center">
                    <Feather name="home" size={16} color="#a86e02" />
                    <Text className="text-gray-800 font-medium ml-2">{item.restaurant}</Text>
                </View>

                {/* items */}
                <View className="px-4 py-2">
                    {(item.items ?? []).slice(0, 2).map(oi => (
                        <View key={oi.id} className="flex-row items-center mb-3">
                            <Image source={{ uri: oi.image }} className="w-12 h-12 rounded-lg" />
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-800">{oi.name}</Text>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">x{oi.quantity}</Text>
                                    <Text className="text-gray-700">
                                        {Number((oi.price ?? 0) * (oi.quantity ?? 0)).toFixed(2)} MAD
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    {item.items?.length > 2 && (
                        <Text className="text-gray-600 text-xs italic ml-2 mb-2">
                            +{item.items.length - 2} articles supplémentaires
                        </Text>
                    )}

                    {/* total */}
                    {item.total == null && console.warn('Order lacks total:', item.id)}
                    <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-gray-200">
                        <Text className="text-gray-600">Montant total</Text>
                        <Text className="font-bold" style={{ color: '#a86e02' }}>
                            {Number(item.total ?? 0).toFixed(2)} MAD
                        </Text>
                    </View>
                </View>

                {/* actions */}
                <View className="flex-row border-t border-gray-200 mt-2">
                    <TouchableOpacity
                        className="flex-1 py-3 items-center justify-center border-r border-gray-200 flex-row"
                        onPress={() =>
                            trackOrder(item.id).then(() => router.push(`/order-details/${item.id}`))
                        }
                    >
                        <Feather name="map-pin" size={16} color="#a86e02" />
                        <Text className="font-bold ml-2" style={{ color: '#a86e02' }}>Suivre Commande</Text>
                    </TouchableOpacity>
                        {/*
                    <TouchableOpacity
                        className="flex-1 py-3 items-center justify-center flex-row"
                        onPress={() =>
                            reorderItems(item.id).then(() =>
                                Alert.alert('Succès', 'Articles ajoutés à votre panier', [
                                    { text: 'Voir Panier', onPress: () => router.push('/cart') },
                                    { text: 'Continuer Achats', style: 'cancel' },
                                ])
                            )
                        }
                    >
                        <Feather name="repeat" size={16} color="#a86e02" />
                        <Text className="font-bold ml-2" style={{ color: '#a86e02' }}>Commander à nouveau</Text>
                    </TouchableOpacity>
                     */}
                </View>
            </TouchableOpacity>
        );
    };

    /* empty list */
    const Empty = () => (
        <View className="flex-1 justify-center items-center py-20">
            <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-6">
                <Feather name="shopping-bag" size={40} color="#6B7280" />
            </View>
            <Text className="text-gray-800 text-xl font-bold mb-2">Pas encore de commandes</Text>
            <Text className="text-gray-600 text-center px-8 mb-8">
                Votre historique de commandes apparaîtra ici dès que vous aurez passé votre première commande
            </Text>
            <TouchableOpacity
                className="px-6 py-3 rounded-xl shadow-lg"
                style={{ backgroundColor: '#a86e02' }}
                onPress={() => router.push('/')}
            >
                <Text className="text-white font-bold">Commencer à Commander</Text>
            </TouchableOpacity>
        </View>
    );

    /* UI */
    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                <Text className="text-gray-800 text-xl font-bold">Mes Commandes</Text>
                <TouchableOpacity
                    className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center"
                    onPress={() => router.push('/search')}
                >
                    <Feather name="search" size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <View className="flex-row border-b border-gray-200">
                <TabButton
                    label="Toutes"
                    isActive={activeTab === 'all'}
                    onPress={() => setActiveTab('all')}
                />
                <TabButton
                    label="En cours"
                    isActive={activeTab === 'ongoing'}
                    onPress={() => setActiveTab('ongoing')}
                />
                <TabButton
                    label="Terminées"
                    isActive={activeTab === 'completed'}
                    onPress={() => setActiveTab('completed')}
                />
            </View>

            <FlatList
                className="bg-white px-4 pt-4"
                data={filtered()}
                renderItem={renderOrderItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={!loading ? Empty : null}
                ListHeaderComponent={loading ? (
                    <View className="items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#a86e02" />
                        <Text className="text-gray-700 mt-4">Chargement des commandes...</Text>
                    </View>
                ) : null}
            />
        </SafeAreaView>
    );
}

/* tab button */
const TabButton = ({ label, isActive, onPress }) => (
    <TouchableOpacity
        className={`flex-1 py-3 ${isActive ? 'border-b-2' : ''}`}
        style={{ borderBottomColor: isActive ? '#a86e02' : 'transparent' }}
        onPress={onPress}
    >
        <Text className={`text-center font-medium ${isActive ? '' : 'text-gray-600'}`}
              style={{ color: isActive ? '#a86e02' : '#6B7280' }}>
            {label}
        </Text>
    </TouchableOpacity>
);