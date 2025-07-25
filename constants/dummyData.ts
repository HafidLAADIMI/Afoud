export type Product = {
    id: string | number;
    name: string;
    price?: number;
    description?: string;
    image?: string;
    discount?: number;
    originalPrice?: number;
    rating?: number;
    restaurant?: string;
    category?: string;
    logo?: string;
    [key: string]: any; // Allow for other properties
};

export type Category = {
    id: string | number;
    name: string;
    image: string;
};

export type Restaurant = {
    id: string | number;
    name: string;
    image: string;
    logo: string;
    cuisine: string | string[];
    rating: number;
    deliveryTime: string;
    distance: string;
    priceRange?: string;
};

export type Cuisine = {
    id: string | number;
    name: string;
    image: string;
};

export type CarouselItem = {
    id: string | number;
    image: string;
    title: string;
    subtitle?: string;
    buttonText?: string;
}

// Example cart items
export const cartItems = [
    {
        id: '1',
        name: 'Meat Pizza',
        price: 370,
        originalPrice: 400,
        quantity: 1,
        isVeg: false,
        image: 'https://via.placeholder.com/150',
    }
];

// Example recommended items
export const recommendedItems = [
    {
        id: '2',
        name: 'grilled lemon',
        restaurant: 'Hungry Puppets',
        price: 320,
        isVeg: true,
        image: 'https://via.placeholder.com/150',
    },
    {
        id: '3',
        name: 'Sandwich',
        restaurant: 'Vintage Kitchen',
        price: 250,
        isVeg: false,
        image: 'https://via.placeholder.com/150',
    }
];



// constants/dummyData.ts - Extended
export const categories = [
    { id: '1', name: 'American', image: 'https://img.icons8.com/color/96/000000/hamburger.png' },
    { id: '2', name: 'Bengali', image: 'https://img.icons8.com/color/96/000000/curry.png' },
    { id: '3', name: 'Caribbean', image: 'https://img.icons8.com/color/96/000000/taco.png' },
    { id: '4', name: 'Chinese', image: 'https://img.icons8.com/color/96/000000/noodles.png' },
    { id: '5', name: 'Fast Food', image: 'https://img.icons8.com/color/96/000000/french-fries.png' },
];

export const carouselItems = [
    {
        id: '1',
        title: 'Savor Every Bite, Experience Pure Delight',
        image: 'https://img.icons8.com/color/96/000000/pasta.png',
        bgColor: 'bg-pink-600',
    },
    {
        id: '2',
        title: 'Try Our Spicy Chicken Combo!',
        image: 'https://img.icons8.com/color/96/000000/chicken.png',
        bgColor: 'bg-blue-500',
    },
];

export const trendingItems = [
    {
        id: '1',
        image: 'https://img.icons8.com/color/160/000000/pizza.png',
        discount: 10,
        restaurant: 'Cheesy Restaurant',
        name: 'Pizza carnival',
        originalPrice: 600,
        discountedPrice: 540,
    },
    {
        id: '2',
        image: 'https://img.icons8.com/color/160/000000/cheesecake.png',
        discount: 30,
        restaurant: 'Mini Kebab',
        name: 'Cheese cake',
        originalPrice: 200,
        discountedPrice: 140,
    },
];


export const cuisines = [
    { id: '1', name: 'Bengali', image: 'https://img.icons8.com/color/96/000000/curry.png' },
    { id: '2', name: 'Chinese', image: 'https://img.icons8.com/color/96/000000/noodles.png' },
    { id: '3', name: 'Japanese', image: 'https://img.icons8.com/color/96/000000/sushi.png' },
    { id: '4', name: 'Italian', image: 'https://img.icons8.com/color/96/000000/pizza.png' },
    { id: '5', name: 'Indian', image: 'https://img.icons8.com/color/96/000000/tandoori-chicken.png' },
    { id: '6', name: 'Fast Food', image: 'https://img.icons8.com/color/96/000000/hamburger.png' },
    { id: '7', name: 'Spanish', image: 'https://img.icons8.com/color/96/000000/paella.png' },
    { id: '8', name: 'Sea Food', image: 'https://img.icons8.com/color/96/000000/fish-food.png' },
];


export const popularRestaurants = [
    {
        id: '1',
        name: 'Hungry Puppets',
        image: 'https://img.icons8.com/color/240/000000/nachos.png',
        logo: 'https://img.icons8.com/color/48/000000/soup-plate.png',
        cuisine: 'Bengali, Indian, Pizza, Pasta, Snacks',
        rating: 4.7,
        deliveryTime: '30-40-min',
        distance: '8671.23 km',
        isFavorite: false,
    },
    {
        id: '2',
        name: 'Coffee Kings',
        image: 'https://img.icons8.com/color/240/000000/cafe.png',
        logo: 'https://img.icons8.com/color/48/000000/coffee.png',
        cuisine: 'Cafe, Desserts, Breakfast',
        rating: 4.5,
        deliveryTime: '20-30-min',
        distance: '2.3 km',
        isFavorite: true,
    },
];

export const markers = [
    // San Francisco
    {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
        name: 'San Francisco City Center'
    },
    {
        latitude: 37.8077,
        longitude: -122.475,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
        name: 'Golden Gate Bridge'
    }
];

export const mockOrders = [
    {
        id: 'ord1',
        date: '04 Apr, 2025',
        status: 'delivered',
        items: [
            {
                id: 'item1',
                name: 'Meat Pizza',
                quantity: 2,
                price: 370,
                image: 'https://via.placeholder.com/150'
            },
            {
                id: 'item2',
                name: 'Cheese Burger',
                quantity: 1,
                price: 80,
                image: 'https://via.placeholder.com/150'
            }
        ],
        total: 820,
        restaurant: 'Hungry Puppets'
    },
    {
        id: 'ord2',
        date: '28 Mar, 2025',
        status: 'cancelled',
        items: [
            {
                id: 'item3',
                name: 'Veg Momos',
                quantity: 1,
                price: 320,
                image: 'https://via.placeholder.com/150'
            }
        ],
        total: 320,
        restaurant: 'Vintage Kitchen'
    }
];