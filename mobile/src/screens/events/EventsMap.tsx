import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

interface EventsMapProps {
    events: any[];
    onJoin: (id: number, hasJoined: boolean) => void;
}

const activityIcons: Record<string, string> = {
    running: '🏃',
    walking: '🚶',
    cycling: '🚴',
    yoga: '🧘',
    basketball: '🏀',
    swimming: '🏊',
    fitness: '🏋️',
    football: '⚽',
    other: '🎯'
};

import { useTheme } from '../../context/ThemeContext';

export default function EventsMap({ events, onJoin }: EventsMapProps) {
    const { isDarkMode } = useTheme();
    const isLight = !isDarkMode;

    // Center of Tunisia
    const initialRegion = {
        latitude: 33.8869,
        longitude: 9.5375,
        latitudeDelta: 5.0,
        longitudeDelta: 5.0,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                userInterfaceStyle={isDarkMode ? 'dark' : 'light'}
            >
                {events.map((event) => (
                    <Marker
                        key={event.id}
                        coordinate={{
                            latitude: parseFloat(event.latitude),
                            longitude: parseFloat(event.longitude),
                        }}
                        title={event.title}
                        description={event.activity_type}
                    >
                        <View style={styles.markerContainer}>
                            <Text style={styles.markerEmoji}>
                                {activityIcons[event.activity_type.toLowerCase()] || activityIcons.other}
                            </Text>
                        </View>
                        <Callout tooltip onPress={() => onJoin(event.id, event.hasJoined)}>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{event.title}</Text>
                                <Text style={styles.calloutSub}>{event.activity_type}</Text>
                                <View style={styles.joinBadge}>
                                    <Text style={styles.joinText}>{event.hasJoined ? 'Already Joined ✓' : 'Tap to Join'}</Text>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        padding: 5,
        backgroundColor: '#7c3aed',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
    },
    markerEmoji: {
        fontSize: 16,
    },
    callout: {
        backgroundColor: '#1e293b',
        padding: 12,
        borderRadius: 12,
        width: 150,
        borderWidth: 1,
        borderColor: '#334155',
    },
    calloutTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    calloutSub: {
        color: '#94a3b8',
        fontSize: 12,
    },
    joinBadge: {
        marginTop: 8,
        backgroundColor: '#7c3aed',
        paddingVertical: 4,
        borderRadius: 6,
        alignItems: 'center',
    },
    leaveBadge: {
        backgroundColor: '#ef4444',
    },
    joinText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
