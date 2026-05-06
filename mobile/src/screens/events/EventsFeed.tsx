import React from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator, RefreshControl, Image, TouchableOpacity, useColorScheme } from 'react-native';
import EventCard from './EventCard';

interface EventsFeedProps {
    events: any[];
    loading: boolean;
    onJoin: (id: number, hasJoined: boolean) => void;
    onRefresh: () => void;
    setView: (view: string) => void;
}

import { useTheme } from '../../context/ThemeContext';

export default function EventsFeed({ events, loading, onJoin, onRefresh, setView }: EventsFeedProps) {
    const { isDarkMode } = useTheme();
    const isLight = !isDarkMode;

    if (loading && events.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text style={styles.loadingText}>Discovering events...</Text>
            </View>
        );
    }

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏃‍♂️💨</Text>
            <Text style={[styles.emptyTitle, isLight && styles.emptyTitleLight]}>No activities found</Text>
            <Text style={[styles.emptySubtitle, isLight && styles.emptySubtitleLight]}>
                It's a bit quiet here. Be the pioneer and start a new community event today!
            </Text>
            <TouchableOpacity 
                style={styles.createButton}
                onPress={() => setView('create')}
            >
                <Text style={styles.createButtonText}>🚀 Launch First Event</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <FlatList
            data={events}
            renderItem={({ item }) => <EventCard event={item} onJoin={onJoin} />}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={renderEmpty}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#7c3aed" />
            }
        />
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#94a3b8',
        marginTop: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyTitleLight: {
        color: '#0f172a',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    emptySubtitleLight: {
        color: '#64748b',
    },
    createButton: {
        backgroundColor: '#7c3aed',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        elevation: 5,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    createButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
