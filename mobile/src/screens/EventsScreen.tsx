import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, useColorScheme, StatusBar } from 'react-native';
import apiClient from '../api/apiClient';
import EventsFeed from './events/EventsFeed';
import EventsMap from './events/EventsMap';
import CreateEvent from './events/CreateEvent';
import MyEvents from './events/MyEvents';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function EventsScreen() {
    const { isDarkMode } = useTheme();
    const { t } = useLanguage();
    const isLight = !isDarkMode;
    const [view, setView] = useState('feed'); // 'feed', 'map', 'create', 'my'
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/events');
            if (res.data.success) {
                setEvents(res.data.events);
            }
        } catch (err) {
            console.error('Failed to fetch events:', err);
            Alert.alert('Error', 'Failed to load events. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'feed' || view === 'map') {
            fetchEvents();
        }
    }, [view, fetchEvents]);

    const handleJoin = async (eventId: number, hasJoined: boolean) => {
        if (hasJoined) {
            Alert.alert(
                'Leave Activity',
                'Are you sure you want to leave this event?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Yes, Leave', 
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const res = await apiClient.delete(`/events/${eventId}/join`);
                                if (res.data.success) {
                                    fetchEvents();
                                    Alert.alert('Success', 'Successfully left the event.');
                                }
                            } catch (err: any) {
                                Alert.alert('Error', 'Failed to leave event.');
                            }
                        }
                    }
                ]
            );
            return;
        }

        try {
            const res = await apiClient.post(`/events/${eventId}/join`, {});
            if (res.data.success) {
                fetchEvents();
                Alert.alert('Success', 'Successfully joined the event!');
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Action failed.');
        }
    };

    const renderHeader = () => (
        <View style={[styles.header, isLight && styles.headerLight]}>
            <View style={styles.hero}>
                <Text style={[styles.heroTitle, isLight && styles.heroTitleLight]}>{t('events.title').replace(', Stay Healthy.', '')}</Text>
                <Text style={styles.heroSubtitle}>{t('events.subtitle')}</Text>
                
                <View style={styles.stats}>
                    <View style={[styles.statBox, isLight && styles.statBoxLight]}>
                        <Text style={[styles.statVal, isLight && styles.statValLight]}>{events.length}</Text>
                        <Text style={styles.statLab}>{t('events.activeEvents')}</Text>
                    </View>
                    <View style={[styles.statBox, isLight && styles.statBoxLight]}>
                        <Text style={[styles.statVal, isLight && styles.statValLight]}>
                            {events.reduce((acc: number, e: any) => acc + (e.participant_count || 0), 0)}
                        </Text>
                        <Text style={styles.statLab}>{t('events.participants')}</Text>
                    </View>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navScroll}>
                <TouchableOpacity 
                    style={[styles.navBtn, isLight && styles.navBtnLight, view === 'feed' && styles.navBtnActive]} 
                    onPress={() => setView('feed')}
                >
                    <Text style={[styles.navBtnText, isLight && styles.navBtnTextLight, view === 'feed' && styles.navBtnTextActive]}>{t('events.feed')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.navBtn, isLight && styles.navBtnLight, view === 'map' && styles.navBtnActive]} 
                    onPress={() => setView('map')}
                >
                    <Text style={[styles.navBtnText, isLight && styles.navBtnTextLight, view === 'map' && styles.navBtnTextActive]}>{t('events.mapView')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.navBtn, styles.navBtnSuccess]} 
                    onPress={() => setView('create')}
                >
                    <Text style={styles.navBtnTextWhite}>{t('events.createEvent')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.navBtn, isLight && styles.navBtnLight, view === 'my' && styles.navBtnActive]} 
                    onPress={() => setView('my')}
                >
                    <Text style={[styles.navBtnText, isLight && styles.navBtnTextLight, view === 'my' && styles.navBtnTextActive]}>{t('events.myEvents')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );

    const renderContent = () => {
        switch (view) {
            case 'create':
                return <CreateEvent onCreated={() => setView('feed')} onCancel={() => setView('feed')} />;
            case 'my':
                return <MyEvents onBack={() => setView('feed')} />;
            case 'map':
                return <EventsMap events={events} onJoin={handleJoin} />;
            case 'feed':
            default:
                return (
                    <EventsFeed 
                        events={events} 
                        loading={loading} 
                        onJoin={handleJoin} 
                        onRefresh={fetchEvents}
                        setView={setView}
                    />
                );
        }
    };

    return (
        <SafeAreaView style={[styles.container, isLight && styles.containerLight]}>
            <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
            {(view === 'feed' || view === 'map') && renderHeader()}
            <View style={styles.content}>
                {renderContent()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    containerLight: { backgroundColor: '#f8fafc' },
    header: {
        padding: 20,
        backgroundColor: '#1e293b',
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    headerLight: {
        backgroundColor: '#fff',
        borderBottomColor: '#e2e8f0',
    },
    hero: {
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    heroTitleLight: {
        color: '#0f172a',
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    stats: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 15,
    },
    statBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statBoxLight: {
        backgroundColor: '#f1f5f9',
        borderColor: '#e2e8f0',
    },
    statVal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statValLight: {
        color: '#0f172a',
    },
    statLab: {
        fontSize: 10,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    navScroll: {
        flexDirection: 'row',
    },
    navBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#0f172a',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    navBtnLight: {
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
    },
    navBtnActive: {
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderColor: '#7c3aed',
    },
    navBtnSuccess: {
        backgroundColor: '#10b981',
        borderColor: '#059669',
    },
    navBtnText: {
        color: '#94a3b8',
        fontWeight: 'bold',
        fontSize: 13,
    },
    navBtnTextLight: {
        color: '#64748b',
    },
    navBtnTextActive: {
        color: '#7c3aed',
    },
    navBtnTextWhite: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    content: { flex: 1 },
});

