import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import apiClient from '../../api/apiClient';

interface MyEventsProps {
    onBack: () => void;
}

import { useTheme } from '../../context/ThemeContext';

const activityTypes = ['Running', 'Walking', 'Cycling', 'Yoga', 'Basketball', 'Football', 'Swimming', 'Fitness', 'Other'];

export default function MyEvents({ onBack }: MyEventsProps) {
    const [data, setData] = useState({ created: [], joined: [] });
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        activity_type: 'Running',
        date: '',
        time: '',
        description: '',
        max_participants: '',
    });
    const { isDarkMode } = useTheme();
    const isLight = !isDarkMode;

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

    const startEdit = (ev: any) => {
        setEditingId(ev.id);
        setEditForm({
            title: ev.title || '',
            activity_type: ev.activity_type || 'Running',
            date: ev.date ? String(ev.date).slice(0, 10) : '',
            time: ev.time ? String(ev.time).slice(0, 5) : '',
            description: ev.description || '',
            max_participants: ev.max_participants ? String(ev.max_participants) : '',
        });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        setSaving(true);
        try {
            const res = await apiClient.put(`/events/${editingId}`, {
                title: editForm.title,
                activity_type: editForm.activity_type,
                date: editForm.date,
                time: editForm.time,
                description: editForm.description,
                max_participants: editForm.max_participants ? parseInt(editForm.max_participants) : null,
            });

            if (res.data.success) {
                await fetchMyEvents();
                setEditingId(null);
                Alert.alert('Success', 'Event updated successfully!');
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update event.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event? This action cannot be undone.',
            [
                { text: 'Cancel', onPress: () => {} },
                {
                    text: 'Delete',
                    onPress: async () => {
                        setDeleting(eventId);
                        try {
                            const res = await apiClient.delete(`/events/${eventId}`);
                            if (res.data.success) {
                                await fetchMyEvents();
                                Alert.alert('Success', 'Event deleted successfully!');
                            }
                        } catch (err: any) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to delete event.');
                        } finally {
                            setDeleting(null);
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const isCreator = (eventId: number) => {
        return data.created.some(ev => ev.id === eventId);
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
                                {ev.max_participants && <Text> • {ev.participant_count}/{ev.max_participants}</Text>}
                            </Text>
                        </View>
                        <View style={styles.actions}>
                            <View style={[
                                styles.badge,
                                ev.status === 'Upcoming' ? styles.badgeSuccess : styles.badgeWarn
                            ]}>
                                <Text style={styles.badgeText}>{ev.status}</Text>
                            </View>
                            {isCreator(ev.id) && (
                                <View style={styles.buttons}>
                                    <TouchableOpacity 
                                        style={styles.editBtn}
                                        onPress={() => startEdit(ev)}
                                    >
                                        <Text style={styles.editBtnText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.deleteBtn}
                                        onPress={() => handleDeleteEvent(ev.id)}
                                        disabled={deleting === ev.id}
                                    >
                                        <Text style={styles.deleteBtnText}>{deleting === ev.id ? '...' : 'Delete'}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <>
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

            {/* Edit Modal */}
            <Modal
                visible={editingId !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setEditingId(null)}
            >
                <View style={styles.modalOverlay}>
                    <ScrollView style={[styles.editForm, isLight && styles.editFormLight]}>
                        <Text style={[styles.editTitle, isLight && styles.editTitleLight]}>Edit Event</Text>
                        
                        <Text style={[styles.label, isLight && styles.labelLight]}>Title</Text>
                        <TextInput 
                            style={[styles.input, isLight && styles.inputLight]}
                            value={editForm.title}
                            onChangeText={text => setEditForm({...editForm, title: text})}
                            placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                        />

                        <Text style={[styles.label, isLight && styles.labelLight]}>Activity Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                            {activityTypes.map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typePill,
                                        isLight && styles.typePillLight,
                                        editForm.activity_type === type && styles.typePillActive
                                    ]}
                                    onPress={() => setEditForm({...editForm, activity_type: type})}
                                >
                                    <Text style={[
                                        styles.typePillText,
                                        editForm.activity_type === type && styles.typePillTextActive
                                    ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.row}>
                            <View style={{flex: 1, marginRight: 8}}>
                                <Text style={[styles.label, isLight && styles.labelLight]}>Date</Text>
                                <TextInput 
                                    style={[styles.input, isLight && styles.inputLight]}
                                    placeholder="YYYY-MM-DD"
                                    value={editForm.date}
                                    onChangeText={text => setEditForm({...editForm, date: text})}
                                    placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                                />
                            </View>
                            <View style={{flex: 1, marginLeft: 8}}>
                                <Text style={[styles.label, isLight && styles.labelLight]}>Time</Text>
                                <TextInput 
                                    style={[styles.input, isLight && styles.inputLight]}
                                    placeholder="HH:MM"
                                    value={editForm.time}
                                    onChangeText={text => setEditForm({...editForm, time: text})}
                                    placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                                />
                            </View>
                        </View>

                        <Text style={[styles.label, isLight && styles.labelLight]}>Description</Text>
                        <TextInput 
                            style={[styles.input, styles.textarea, isLight && styles.inputLight]}
                            value={editForm.description}
                            onChangeText={text => setEditForm({...editForm, description: text})}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                        />

                        <Text style={[styles.label, isLight && styles.labelLight]}>Max Participants</Text>
                        <TextInput 
                            style={[styles.input, isLight && styles.inputLight]}
                            placeholder="Leave empty for unlimited"
                            keyboardType="number-pad"
                            value={editForm.max_participants}
                            onChangeText={text => setEditForm({...editForm, max_participants: text})}
                            placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity 
                                style={styles.cancelBtn}
                                onPress={() => setEditingId(null)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                                onPress={saveEdit}
                                disabled={saving}
                            >
                                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </>
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
