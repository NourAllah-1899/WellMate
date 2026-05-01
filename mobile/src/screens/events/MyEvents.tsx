import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import apiClient from '../../api/apiClient';

interface MyEventsProps {
    onBack: () => void;
}

export default function MyEvents({ onBack }: MyEventsProps) {
    const [data, setData] = useState({ created: [], joined: [] });
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();
    const isLight = colorScheme === 'light';

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const res = await apiClient.get('/events/my-events');
            if (res.data.success) {
                setData(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderEventList = (events: any[], emptyMsg: string) => {
        if (events.length === 0) return <Text style={[styles.emptyText, isLight && styles.emptyTextLight]}>{emptyMsg}</Text>;
        return (
            <View style={styles.list}>
                {events.map((ev: any) => (
                    <View key={ev.id} style={[styles.eventItem, isLight && styles.eventItemLight]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.eventTitle, isLight && styles.eventTitleLight]}>{ev.title}</Text>
                            <Text style={styles.eventSub}>
                                {new Date(ev.date).toLocaleDateString()} • {ev.activity_type}
                            </Text>
                        </View>
                        <View style={[
                            styles.badge,
                            ev.status === 'Upcoming' ? styles.badgeSuccess : styles.badgeWarn
                        ]}>
                            <Text style={styles.badgeText}>{ev.status}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ScrollView style={[styles.container, isLight && styles.containerLight]} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={[styles.backBtnText, isLight && styles.backBtnTextLight]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.title, isLight && styles.titleLight]}>My Activities</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 40 }} />
            ) : (
                <View style={styles.sections}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Organized by Me</Text>
                        {renderEventList(data.created, "You haven't created any events yet.")}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Joined by Me</Text>
                        {renderEventList(data.joined, "You haven't joined any events yet.")}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    containerLight: { backgroundColor: '#f8fafc' },
    content: { padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    backBtn: { marginRight: 15, padding: 5 },
    backBtnText: { color: '#f8fafc', fontSize: 24, fontWeight: 'bold' },
    backBtnTextLight: { color: '#0f172a' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc' },
    titleLight: { color: '#0f172a' },
    sections: { gap: 32 },
    section: {},
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#38bdf8',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
        paddingBottom: 8,
    },
    list: { gap: 12 },
    eventItem: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    eventItemLight: {
        backgroundColor: '#fff',
        borderColor: '#e2e8f0',
    },
    eventTitle: { color: '#f8fafc', fontWeight: 'bold', fontSize: 14 },
    eventTitleLight: { color: '#0f172a' },
    eventSub: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
    emptyText: { color: '#64748b', fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
    emptyTextLight: { color: '#94a3b8' },
    badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    badgeSuccess: { backgroundColor: '#22c55e' },
    badgeWarn: { backgroundColor: '#f59e0b' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
