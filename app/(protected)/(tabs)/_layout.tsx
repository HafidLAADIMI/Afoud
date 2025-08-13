import {Tabs} from "expo-router";
import {Feather, FontAwesome} from '@expo/vector-icons';
import {View} from 'react-native';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff', // White background for light mode
                    borderTopColor: '#e5e7eb', // Light gray border
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 10,
                    paddingHorizontal: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 5,
                },
                tabBarActiveTintColor: '#a86e02', // Your brand color for active tabs
                tabBarInactiveTintColor: '#6B7280', // Gray for inactive tabs (unchanged for good contrast)
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
            {/**
             * <Tabs.Screen
             * name="cart"
             * options={{
             * tabBarIcon: ({color}) => (
             * <View
             * className="w-14 h-14 rounded-full bg-white border-2 -mt-5 justify-center items-center shadow-lg"
             * style={{ borderColor: '#a86e02' }}
             * >
             * <FontAwesome name="shopping-cart" size={26} color="#a86e02"/>
             * </View>
             * ),
             * tabBarLabel: () => null,
             * }}
             * />
             * */}
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