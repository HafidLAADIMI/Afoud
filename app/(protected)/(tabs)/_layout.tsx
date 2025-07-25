import {Tabs} from "expo-router";
import {Feather, FontAwesome} from '@expo/vector-icons';
import {View} from 'react-native';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#111827', // Dark background matching home screen
                    borderTopColor: '#1F2937', // Slightly lighter border
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 10,
                    paddingHorizontal: 10,
                },
                tabBarActiveTintColor: '#F97316', // Orange accent color from home screen
                tabBarInactiveTintColor: '#6B7280', // Gray for inactive tabs
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Accueil',
                    tabBarIcon: ({color}) => (
                        <View className="items-center justify-center">
                            <Feather name="home" size={24} color={color}/>
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Favoris',
                    tabBarIcon: ({color}) => (
                        <View className="items-center justify-center">
                            <Feather name="heart" size={24} color={color}/>
                        </View>
                    ),
                }}
            />
            {/*

            <Tabs.Screen
                name="cart"
                options={{
                    tabBarIcon: ({color}) => (
                        <View
                            className="w-14 h-14 rounded-full bg-gray-900 border-2 border-orange-500 -mt-5 justify-center items-center shadow-lg"
                        >
                            <FontAwesome name="shopping-cart" size={26} color="white"/>
                        </View>
                    ),
                    tabBarLabel: () => null,
                }}
            />
                */}
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Commandes',
                    tabBarIcon: ({color}) => (
                        <View className="items-center justify-center">
                            <Feather name="shopping-bag" size={24} color={color}/>
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="sidebar"
                options={{
                    title: 'Menu',
                    tabBarIcon: ({color}) => (
                        <View className="items-center justify-center">
                            <Feather name="menu" size={24} color={color}/>
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}