import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, useColorScheme, StatusBar, Image } from 'react-native';
import apiClient from '../api/apiClient';
import EventsFeed from './events/EventsFeed';
import EventsMap from './events/EventsMap';
import CreateEvent from './events/CreateEvent';
import MyEvents from './events/MyEvents';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

export default function EventsScreen() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { t, language, setLanguage } = useLanguage();
    const theme = isDarkMode ? Colors.dark : Colors.light;
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
            Alert.alert(t('common.error', 'Error'), t('events.loadFailed', 'Failed to load events. Please try again later.'));
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
                t('events.leaveTitle', 'Leave Activity'),
                t('events.leaveConfirm', 'Are you sure you want to leave this event?'),
                [
                    { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                    { 
                        text: t('events.leaveYes', 'Yes, Leave'), 
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const res = await apiClient.delete(`/events/${eventId}/join`);
                                if (res.data.success) {
                                    fetchEvents();
                                    Alert.alert(t('common.success', 'Success'), t('events.leaveSuccess', 'Successfully left the event.'));
                                }
                            } catch (err: any) {
                                Alert.alert(t('common.error', 'Error'), t('events.leaveFailed', 'Failed to leave event.'));
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
                Alert.alert(t('common.success', 'Success'), t('events.joinSuccess', 'Successfully joined the event!'));
            }
        } catch (err: any) {
            Alert.alert(t('common.error', 'Error'), err.response?.data?.message || t('events.actionFailed', 'Action failed.'));
        }
    };


    const renderHero = () => (
        <View style={styles.hero}>
            <Text style={[styles.heroTitle, { color: theme.text }]}>{t('events.title')}</Text>
            <Text style={[styles.heroSubtitle, { color: theme.secondaryText }]}>{t('events.subtitle')}</Text>
            
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
    );

    const renderHeader = () => (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerTop}>
                <View style={styles.logoContainer}>
                    <Image
                        source={isDarkMode ? require('../../assets/WellMate_dark.png') : require('../../assets/WellMate_light.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity 
                        onPress={() => setLanguage(language === 'fr' ? 'en' : 'fr')} 
                        style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0', width: 'auto', paddingHorizontal: 10 }]}
                    >
                        <Text style={{ color: isLight ? '#0f172a' : '#fff', fontWeight: 'bold', fontSize: 12 }}>{language === 'fr' ? 'EN' : 'FR'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
                        <Feather name={isDarkMode ? 'moon' : 'sun'} size={20} color={isDarkMode ? '#fbbf24' : '#f59e0b'} />
                    </TouchableOpacity>
                </View>
            </View>

            {renderHero()}

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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />
            {renderHeader()}
            <View style={styles.content}>
                {renderContent()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingBottom: 10,
        borderBottomWidth: 1,
        marginTop: 30,
        paddingHorizontal: 20,
    },
    headerLight: {
        borderBottomColor: '#e2e8f0',
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    logoContainer: {},
    logo: { width: 160, height: 60 },
    themeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    hero: {
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    heroSubtitle: {
        fontSize: 14,
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

