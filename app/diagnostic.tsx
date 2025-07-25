import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Platform,
    SafeAreaView,
    ActivityIndicator,
    StyleSheet,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import { StatusBar } from 'expo-status-bar';
import { app, checkFirestoreConnection } from '@/utils/firebase';
import db from "../utils/firebase"
import auth from "../utils/firebase"
import { doc, getDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { router } from 'expo-router';

export default function DiagnosticScreen() {
    const [deviceInfo, setDeviceInfo] = useState({});
    const [networkInfo, setNetworkInfo] = useState({});
    const [storageInfo, setStorageInfo] = useState({});
    const [firebaseInfo, setFirebaseInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const [testingFirestore, setTestingFirestore] = useState(false);
    const [firestoreResult, setFirestoreResult] = useState(null);

    useEffect(() => {
        async function gatherDiagnostics() {
            try {
                // Device info
                const deviceData = {
                    brand: Device.brand,
                    manufacturer: Device.manufacturer,
                    modelName: Device.modelName,
                    osName: Device.osName,
                    osVersion: Device.osVersion,
                    memoryUsage: await getMemoryUsage(),
                };
                setDeviceInfo(deviceData);

                // Network info
                const networkData = {
                    networkState: await Network.getNetworkStateAsync(),
                    ipAddress: await Network.getIpAddressAsync(),
                    isInternetReachable: await Network.isAvailableAsync(),
                };
                setNetworkInfo(networkData);

                // Storage info
                const storageKeys = await AsyncStorage.getAllKeys();
                let storageSizes = {};
                for (const key of storageKeys) {
                    try {
                        const value = await AsyncStorage.getItem(key);
                        storageSizes[key] = value ? value.length : 0;
                    } catch (error) {
                        storageSizes[key] = `Error: ${error.message}`;
                    }
                }
                setStorageInfo({
                    totalKeys: storageKeys.length,
                    keys: storageKeys,
                    sizes: storageSizes
                });

                // Firebase info
                const firebaseData = {
                    isInitialized: !!app,
                    firestoreInitialized: !!db,
                    authInitialized: !!auth,
                    authState: auth.currentUser ? 'Signed In' : 'Signed Out',
                    authUser: auth.currentUser ? {
                        uid: auth.currentUser.uid,
                        email: auth.currentUser.email,
                        emailVerified: auth.currentUser.emailVerified,
                    } : null,
                    firebaseAppName: app ? app.name : null,
                    projectId: app ? app.options.projectId : null
                };
                setFirebaseInfo(firebaseData);

                setLoading(false);
            } catch (error) {
                console.error('Error gathering diagnostics:', error);
                setLoading(false);
            }
        }

        gatherDiagnostics();
    }, []);

    const getMemoryUsage = async () => {
        if (Platform.OS === 'web') {
            return 'Not available on web';
        }

        try {
            return 'Not available in this context';
        } catch (error) {
            return `Error: ${error.message}`;
        }
    };

    const testFirestoreConnection = async () => {
        setTestingFirestore(true);
        try {
            // Try to read a simple document
            const timestamp = Date.now();

            // First try with checkFirestoreConnection function
            const isConnected = await checkFirestoreConnection();

            if (isConnected) {
                // Try to get a small collection
                const q = query(collection(db, 'categories'), limit(1));
                const querySnapshot = await getDocs(q);

                setFirestoreResult({
                    success: true,
                    timestamp,
                    timeTaken: Date.now() - timestamp,
                    docsFound: querySnapshot.docs.length,
                    fromCache: querySnapshot.metadata.fromCache,
                    docData: querySnapshot.docs.length > 0 ?
                        JSON.stringify(querySnapshot.docs[0].data(), null, 2).substring(0, 100) + '...' :
                        'No documents found'
                });
            } else {
                setFirestoreResult({
                    success: false,
                    error: {
                        code: 'connection-failed',
                        message: 'Failed to connect to Firestore'
                    }
                });
            }
        } catch (error) {
            setFirestoreResult({
                success: false,
                error: {
                    code: error.code || 'unknown',
                    message: error.message || 'Unknown error',
                    stack: error.stack
                }
            });
        } finally {
            setTestingFirestore(false);
        }
    };

    const clearAllStorage = async () => {
        try {
            await AsyncStorage.clear();
            Alert.alert('Success', 'AsyncStorage cleared successfully');
            // Refresh storage info
            const storageKeys = await AsyncStorage.getAllKeys();
            setStorageInfo({
                totalKeys: storageKeys.length,
                keys: storageKeys,
                sizes: {}
            });
        } catch (error) {
            Alert.alert('Error', `Error clearing storage: ${error.message}`);
        }
    };

    const renderSection = (title, data) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>
                {Object.entries(data).map(([key, value]) => {
                    // Skip rendering complex objects directly
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        return (
                            <View key={key} style={styles.dataRow}>
                                <Text style={styles.dataKey}>{key}</Text>
                                <TouchableOpacity onPress={() => Alert.alert('Object Data', JSON.stringify(value, null, 2))}>
                                    <Text style={styles.complexValue}>[View Object]</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    // Convert arrays to string
                    if (Array.isArray(value)) {
                        if (value.length > 5) {
                            return (
                                <View key={key} style={styles.dataRow}>
                                    <Text style={styles.dataKey}>{key}</Text>
                                    <TouchableOpacity onPress={() => Alert.alert('Array Data', JSON.stringify(value, null, 2))}>
                                        <Text style={styles.complexValue}>[{value.length} items]</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        } else {
                            value = JSON.stringify(value);
                        }
                    }

                    return (
                        <View key={key} style={styles.dataRow}>
                            <Text style={styles.dataKey}>{key}</Text>
                            <Text style={styles.dataValue}>{`${value}`}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.title}>Diagnostic Info</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text style={styles.loadingText}>Loading diagnostic data...</Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    {renderSection('Device Information', deviceInfo)}
                    {renderSection('Network Status', networkInfo)}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Firebase Status</Text>
                        <View style={styles.sectionContent}>
                            {Object.entries(firebaseInfo).map(([key, value]) => {
                                if (typeof value === 'object' && value !== null) {
                                    return (
                                        <View key={key} style={styles.dataRow}>
                                            <Text style={styles.dataKey}>{key}</Text>
                                            <TouchableOpacity onPress={() => Alert.alert('Firebase Data', JSON.stringify(value, null, 2))}>
                                                <Text style={styles.complexValue}>[View Details]</Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }
                                return (
                                    <View key={key} style={styles.dataRow}>
                                        <Text style={styles.dataKey}>{key}</Text>
                                        <Text style={styles.dataValue}>{`${value}`}</Text>
                                    </View>
                                );
                            })}

                            <TouchableOpacity
                                style={styles.testButton}
                                onPress={testFirestoreConnection}
                                disabled={testingFirestore}
                            >
                                <Text style={styles.testButtonText}>
                                    {testingFirestore ? 'Testing...' : 'Test Firestore Connection'}
                                </Text>
                            </TouchableOpacity>

                            {firestoreResult && (
                                <View style={styles.testResultContainer}>
                                    <Text style={[
                                        styles.testResultTitle,
                                        { color: firestoreResult.success ? '#4ade80' : '#ef4444' }
                                    ]}>
                                        {firestoreResult.success ? 'Connection Successful' : 'Connection Failed'}
                                    </Text>
                                    {firestoreResult.success ? (
                                        <>
                                            <Text style={styles.testResultText}>
                                                Time taken: {firestoreResult.timeTaken}ms
                                            </Text>
                                            <Text style={styles.testResultText}>
                                                From cache: {firestoreResult.fromCache ? 'Yes' : 'No'}
                                            </Text>
                                            <Text style={styles.testResultText}>
                                                Documents found: {firestoreResult.docsFound}
                                            </Text>
                                            {firestoreResult.docData && (
                                                <Text style={styles.testResultText}>
                                                    Sample data: {firestoreResult.docData}
                                                </Text>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.testResultText}>
                                                Error code: {firestoreResult.error.code || 'Unknown'}
                                            </Text>
                                            <Text style={styles.testResultText}>
                                                Message: {firestoreResult.error.message}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>AsyncStorage</Text>
                        <View style={styles.sectionContent}>
                            <Text style={styles.storageText}>
                                Total Keys: {storageInfo.totalKeys || 0}
                            </Text>

                            <TouchableOpacity
                                style={[styles.testButton, { backgroundColor: '#ef4444' }]}
                                onPress={() => {
                                    Alert.alert(
                                        'Clear All Storage',
                                        'This will clear all AsyncStorage data. Are you sure?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Yes, Clear All', onPress: clearAllStorage, style: 'destructive' }
                                        ]
                                    );
                                }}
                            >
                                <Text style={styles.testButtonText}>Clear All Storage</Text>
                            </TouchableOpacity>

                            <Text style={styles.storageSubtitle}>Storage Keys:</Text>
                            {storageInfo.keys && storageInfo.keys.map((key) => (
                                <View key={key} style={styles.storageKeyRow}>
                                    <Text style={styles.storageKey}>{key}</Text>
                                    <Text style={styles.storageSize}>
                                        {storageInfo.sizes && storageInfo.sizes[key]
                                            ? `${typeof storageInfo.sizes[key] === 'number'
                                                ? `${Math.ceil(storageInfo.sizes[key] / 1024)}KB`
                                                : storageInfo.sizes[key]}`
                                            : ''}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1f2937',
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#F97316',
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#e5e7eb',
    },
    section: {
        marginVertical: 8,
        marginHorizontal: 16,
        backgroundColor: '#1f2937',
        borderRadius: 8,
        overflow: 'hidden',
    },
    sectionTitle: {
        padding: 12,
        backgroundColor: '#374151',
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    sectionContent: {
        padding: 12,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    dataKey: {
        flex: 1,
        fontSize: 14,
        color: '#9ca3af',
        marginRight: 8,
    },
    dataValue: {
        flex: 2,
        fontSize: 14,
        color: '#e5e7eb',
        textAlign: 'right',
    },
    complexValue: {
        color: '#3b82f6',
        fontSize: 14,
    },
    testButton: {
        backgroundColor: '#3b82f6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 12,
    },
    testButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    testResultContainer: {
        backgroundColor: '#111827',
        padding: 12,
        borderRadius: 8,
    },
    testResultTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    testResultText: {
        color: '#d1d5db',
        marginBottom: 4,
    },
    storageText: {
        fontSize: 14,
        color: '#e5e7eb',
        marginBottom: 8,
    },
    storageSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e5e7eb',
        marginVertical: 8,
    },
    storageKeyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    storageKey: {
        fontSize: 12,
        color: '#9ca3af',
        flex: 3,
    },
    storageSize: {
        fontSize: 12,
        color: '#e5e7eb',
        textAlign: 'right',
        flex: 1,
    },
});