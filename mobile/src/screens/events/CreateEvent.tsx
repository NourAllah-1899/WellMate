import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, useColorScheme, Appearance } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import apiClient from '../../api/apiClient';

const activityTypes = ['Running', 'Walking', 'Cycling', 'Yoga', 'Basketball', 'Football', 'Swimming', 'Fitness', 'Other'];

interface CreateEventProps {
    onCreated: () => void;
    onCancel: () => void;
}

import { useTheme } from '../../context/ThemeContext';

export default function CreateEvent({ onCreated, onCancel }: CreateEventProps) {
    const { isDarkMode } = useTheme();
    const isLight = !isDarkMode;
    const [formData, setFormData] = useState({
        title: '',
        activity_type: 'Running',
        date: '',
        time: '',
        description: '',
        max_participants: null,
    });
    const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleMapPress = (e: MapPressEvent) => {
        setPosition(e.nativeEvent.coordinate);
    };

    const handleSubmit = async () => {
        // Mock position if not set (since map is disabled)
        const finalPosition = position || { latitude: 33.8869, longitude: 9.5375 };

        if (!formData.title || !formData.date || !formData.time) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/events', {
                ...formData,
                max_participants: formData.max_participants ? parseInt(formData.max_participants as any) : null,
                latitude: position.latitude,
                longitude: position.longitude
            });
            Alert.alert('Success', 'Event created successfully!');
            onCreated();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to create event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView style={[styles.container, isLight && styles.containerLight]} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, isLight && styles.titleLight]}>New Activity</Text>
                    <TouchableOpacity onPress={onCancel}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <Text style={[styles.label, isLight && styles.labelLight]}>Event Title</Text>
                    <TextInput 
                        style={[styles.input, isLight && styles.inputLight]}
                        placeholder="Morning Run at the Park"
                        placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                        value={formData.title}
                        onChangeText={text => setFormData({...formData, title: text})}
                    />

                    <Text style={[styles.label, isLight && styles.labelLight]}>Activity Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {activityTypes.map(type => (
                            <TouchableOpacity 
                                key={type}
                                style={[
                                    styles.categoryPill, 
                                    isLight && styles.categoryPillLight,
                                    formData.activity_type === type && styles.categoryPillActive
                                ]}
                                onPress={() => setFormData({...formData, activity_type: type})}
                            >
                                <Text style={[
                                    styles.categoryText, 
                                    isLight && styles.categoryTextLight,
                                    formData.activity_type === type && styles.categoryTextActive
                                ]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={[styles.label, isLight && styles.labelLight]}>Date (YYYY-MM-DD)</Text>
                            <TextInput 
                                style={[styles.input, isLight && styles.inputLight]}
                                placeholder="2026-05-15"
                                placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                                value={formData.date}
                                onChangeText={text => setFormData({...formData, date: text})}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={[styles.label, isLight && styles.labelLight]}>Time (HH:MM)</Text>
                            <TextInput 
                                style={[styles.input, isLight && styles.inputLight]}
                                placeholder="08:00"
                                placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                                value={formData.time}
                                onChangeText={text => setFormData({...formData, time: text})}
                            />
                        </View>
                    </View>

                    <Text style={[styles.label, isLight && styles.labelLight]}>Description</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea, isLight && styles.inputLight]}
                        placeholder="Tell others more about this event..."
                        placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                        multiline
                        numberOfLines={3}
                        value={formData.description}
                        onChangeText={text => setFormData({...formData, description: text})}
                    />

                    <Text style={[styles.label, isLight && styles.labelLight]}>Maximum Participants (Optional)</Text>
                    <TextInput 
                        style={[styles.input, isLight && styles.inputLight]}
                        placeholder="e.g., 11 for 11v11 football"
                        placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                        keyboardType="number-pad"
                        value={formData.max_participants ? String(formData.max_participants) : ''}
                        onChangeText={text => setFormData({...formData, max_participants: text ? parseInt(text) : null})}
                    />

                    <Text style={[styles.label, isLight && styles.labelLight]}>📍 Select Location (Tap on Map)</Text>
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: 33.8869,
                                longitude: 9.5375,
                                latitudeDelta: 5.0,
                                longitudeDelta: 5.0,
                            }}
                            onPress={handleMapPress}
                            userInterfaceStyle={isLight ? 'light' : 'dark'}
                        >
                            {position && <Marker coordinate={position} pinColor="#7c3aed" />}
                        </MapView>
                    </View>

                    <TouchableOpacity 
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Creating...' : 'Publish Event'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    containerLight: {
        backgroundColor: '#f8fafc',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f8fafc',
    },
    titleLight: {
        color: '#0f172a',
    },
    cancelText: {
        color: '#94a3b8',
        fontSize: 16,
    },
    form: {
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
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    mapOverlayText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    submitButton: {
        backgroundColor: '#7c3aed',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
