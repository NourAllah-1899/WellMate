import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const activityTypes = ['Running', 'Walking', 'Cycling', 'Yoga', 'Basketball', 'Football', 'Swimming', 'Fitness', 'Other'];

type MyEventsProps = {
    onBack: () => void;
};

export default function MyEvents({ onBack }: MyEventsProps) {
    const [data, setData] = useState<{ created: any[]; joined: any[] }>({ created: [], joined: [] });
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
    const [editPosition, setEditPosition] = useState<{ latitude: number; longitude: number } | null>(null);
    const { isDarkMode } = useTheme();
    const { t } = useLanguage();
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
        setEditPosition({
            latitude: ev.latitude || 33.8869,
            longitude: ev.longitude || 9.5375,
        });
    };

    const saveEdit = async () => {
        if (!editingId || !editPosition) return;
        setSaving(true);
        try {
            const res = await apiClient.put(`/events/${editingId}`, {
                title: editForm.title,
                activity_type: editForm.activity_type,
                date: editForm.date,
                time: editForm.time,
                description: editForm.description,
                max_participants: editForm.max_participants ? parseInt(editForm.max_participants) : null,
                latitude: editPosition.latitude,
                longitude: editPosition.longitude,
            });

            if (res.data.success) {
                await fetchMyEvents();
                setEditingId(null);
                Alert.alert(t('common.success'), t('events.updateSuccess'));
            }
        } catch (err: any) {
            Alert.alert(t('common.error'), err.response?.data?.message || t('common.error'));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        Alert.alert(
            t('events.delete'),
            t('events.confirmDelete'),
            [
                { text: t('common.cancel'), onPress: () => {} },
                {
                    text: t('common.delete'),
                    onPress: async () => {
                        setDeleting(eventId);
                        try {
                            const res = await apiClient.delete(`/events/${eventId}`);
                            if (res.data.success) {
                                await fetchMyEvents();
                                Alert.alert(t('common.success'), t('events.deleteSuccess'));
                            }
                        } catch (err: any) {
                            Alert.alert(t('common.error'), err.response?.data?.message || t('common.error'));
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
                                        <Text style={styles.editBtnText}>{t('common.edit')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.deleteBtn}
                                        onPress={() => handleDeleteEvent(ev.id)}
                                        disabled={deleting === ev.id}
                                    >
                                        <Text style={styles.deleteBtnText}>{deleting === ev.id ? '...' : t('common.delete')}</Text>
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


                {loading ? (
                    <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.sections}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('events.organizedByMe')}</Text>
                            {renderEventList(data.created, t('events.noCreated'))}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('events.joinedByMe')}</Text>
                            {renderEventList(data.joined, t('events.noJoined'))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                visible={editingId !== null}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setEditingId(null)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView style={[styles.container, isLight && styles.containerLight]} contentContainerStyle={styles.editContent}>
                        <View style={styles.editHeader}>
                            <Text style={[styles.editTitle, isLight && styles.editTitleLight]}>{t('events.editActivity')}</Text>
                            <TouchableOpacity onPress={() => setEditingId(null)}>
                                <Text style={styles.editCancelText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.editForm}>
                            <Text style={[styles.label, isLight && styles.labelLight]}>{t('events.eventTitle')}</Text>
                            <TextInput 
                                style={[styles.input, isLight && styles.inputLight]}
                                placeholder={t('events.eventTitlePlaceholder', 'Morning Run at the Park')}
                                placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                                value={editForm.title}
                                onChangeText={text => setEditForm({...editForm, title: text})}
                            />

                            <Text style={[styles.label, isLight && styles.labelLight]}>{t('events.activityType')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                {activityTypes.map(type => (
                                    <TouchableOpacity 
                                        key={type}
                                        style={[
                                            styles.categoryPill, 
                                            isLight && styles.categoryPillLight,
                                            editForm.activity_type === type && styles.categoryPillActive
                                        ]}
                                        onPress={() => setEditForm({...editForm, activity_type: type})}
                                    >
                                        <Text style={[
                                            styles.categoryText, 
                                            isLight && styles.categoryTextLight,
                                            editForm.activity_type === type && styles.categoryTextActive
                                        ]}>
                                            {t(`activities.${String(type).toLowerCase()}`, type)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={[styles.label, isLight && styles.labelLight]}>{t('events.date')}</Text>
                                    <TextInput 
                                        style={[styles.input, isLight && styles.inputLight]}
                                        placeholder="2026-05-15"
                                        placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                                        value={editForm.date}
                                        onChangeText={text => setEditForm({...editForm, date: text})}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={[styles.label, isLight && styles.labelLight]}>{t('events.time')}</Text>
                                    <TextInput 
                                        style={[styles.input, isLight && styles.inputLight]}
                                        placeholder="08:00"
                                        placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                                        value={editForm.time}
                                        onChangeText={text => setEditForm({...editForm, time: text})}
                                    />
                                </View>
                            </View>

                            <Text style={[styles.label, isLight && styles.labelLight]}>{t('events.description')}</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea, isLight && styles.inputLight]}
                                placeholder={t('events.descriptionPlaceholder')}
                                placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                                multiline
                                numberOfLines={3}
                                value={editForm.description}
                                onChangeText={text => setEditForm({...editForm, description: text})}
                            />

                            <Text style={[styles.label, isLight && styles.labelLight]}>{t('events.maxParticipants')}</Text>
                            <TextInput 
                                style={[styles.input, isLight && styles.inputLight]}
                                placeholder={t('events.maxParticipantsPlaceholder')}
                                placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                                keyboardType="number-pad"
                                value={editForm.max_participants}
                                onChangeText={text => setEditForm({...editForm, max_participants: text})}
                            />

                            <Text style={[styles.label, isLight && styles.labelLight]}>{t('events.selectLocation')}</Text>
                            <View style={styles.mapContainer}>
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: editPosition?.latitude || 33.8869,
                                        longitude: editPosition?.longitude || 9.5375,
                                        latitudeDelta: 5.0,
                                        longitudeDelta: 5.0,
                                    }}
                                    region={editPosition ? {
                                        latitude: editPosition.latitude,
                                        longitude: editPosition.longitude,
                                        latitudeDelta: 5.0,
                                        longitudeDelta: 5.0,
                                    } : undefined}
                                    onPress={(e: MapPressEvent) => setEditPosition(e.nativeEvent.coordinate)}
                                    userInterfaceStyle={isLight ? 'light' : 'dark'}
                                >
                                    {editPosition && <Marker coordinate={editPosition} pinColor="#7c3aed" />}
                                </MapView>
                            </View>

                            <View style={styles.editButtonRow}>
                                <TouchableOpacity 
                                    style={styles.editCancelBtn}
                                    onPress={() => setEditingId(null)}
                                >
                                    <Text style={styles.editCancelBtnText}>{t('common.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.editSaveBtn, saving && styles.disabledButton]}
                                    onPress={saveEdit}
                                    disabled={saving}
                                >
                                    <Text style={styles.editSaveBtnText}>
                                        {saving ? t('events.saving') : t('events.updateEvent')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    containerLight: { backgroundColor: 'transparent' },
    content: { padding: 20 },
    editContent: { padding: 20, paddingBottom: 40 },
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
    actions: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginLeft: 12,
    },
    buttons: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    editBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#22c55e',
        backgroundColor: '#fff',
        minWidth: 50,
    },
    editBtnText: {
        color: '#22c55e',
        fontWeight: '600',
        fontSize: 11,
        textAlign: 'center',
    },
    deleteBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#ef4444',
        backgroundColor: '#fff',
        minWidth: 50,
    },
    deleteBtnText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 11,
        textAlign: 'center',
    },
    badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    badgeSuccess: { backgroundColor: '#22c55e' },
    badgeWarn: { backgroundColor: '#f59e0b' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    // Edit Modal Styles
    editHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    editTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    editTitleLight: {
        color: '#0f172a',
    },
    editCancelText: {
        color: '#94a3b8',
        fontSize: 28,
        fontWeight: 'bold',
    },
    editForm: {
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#94a3b8',
        marginBottom: 8,
    },
    labelLight: {
        color: '#64748b',
    },
    input: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 12,
        color: '#f8fafc',
        borderWidth: 1,
        borderColor: '#334155',
    },
    inputLight: {
        backgroundColor: '#fff',
        color: '#0f172a',
        borderColor: '#e2e8f0',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    categoryScroll: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1e293b',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    categoryPillLight: {
        backgroundColor: '#f1f5f9',
        borderColor: '#e2e8f0',
    },
    categoryPillActive: {
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        borderColor: '#7c3aed',
    },
    categoryText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 'bold',
    },
    categoryTextLight: {
        color: '#64748b',
    },
    categoryTextActive: {
        color: '#7c3aed',
    },
    row: {
        flexDirection: 'row',
    },
    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
        marginVertical: 8,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    editButtonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        marginBottom: 40,
    },
    editCancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#475569',
        alignItems: 'center',
        backgroundColor: '#334155',
    },
    editCancelBtnText: {
        color: '#cbd5e1',
        fontWeight: '600',
        fontSize: 14,
    },
    editSaveBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#7c3aed',
        alignItems: 'center',
    },
    editSaveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    disabledButton: {
        opacity: 0.5,
    },
});
