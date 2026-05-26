import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../constants/Colors';

const activityImages: Record<string, any> = {
  running: require('../../../assets/events/Running.png'),
  walking: require('../../../assets/events/Walking.png'),
  cycling: require('../../../assets/events/Cycling.png'),
  yoga: require('../../../assets/events/Yoga.png'),
  basketball: require('../../../assets/events/Basketball.png'),
  swimming: require('../../../assets/events/Swimming.png'),
  fitness: require('../../../assets/events/Fitness.png'),
  football: require('../../../assets/events/Football.png'),
  other: require('../../../assets/events/Running.png'),
};

export default function AdminEventDetailScreen({ route, navigation }: any) {
  const { eventId } = route.params;
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/admin/events/${eventId}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleDelete = () => {
    const title = data?.event?.title || '';
    Alert.alert(
      language === 'en' ? 'Delete Event' : "Supprimer l'événement",
      language === 'en'
        ? `Are you sure you want to delete "${title}"?`
        : `Êtes-vous sûr de vouloir supprimer "${title}" ?`,
      [
        { text: language === 'en' ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: language === 'en' ? 'Delete' : 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/admin/events/${eventId}`);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete event.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!data?.event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 80 }}>
          {language === 'en' ? 'Event not found.' : 'Événement introuvable.'}
        </Text>
      </SafeAreaView>
    );
  }

  const { event, participants = [] } = data;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  const detailRows = [
    { icon: 'calendar', label: language === 'en' ? 'Date' : 'Date', value: formatDate(event.date) },
    { icon: 'clock', label: language === 'en' ? 'Time' : 'Heure', value: event.time || '—' },
    { icon: 'map-pin', label: language === 'en' ? 'Location' : 'Lieu', value: event.location || '—' },
    { icon: 'activity', label: language === 'en' ? 'Activity Type' : 'Type d\'activité', value: event.activity_type || '—' },
    { icon: 'users', label: language === 'en' ? 'Capacity' : 'Capacité', value: event.max_participants ? `${participants.length} / ${event.max_participants}` : `${participants.length} ${language === 'en' ? 'joined' : 'inscrits'}` },
    { icon: 'user', label: language === 'en' ? 'Organizer' : 'Organisateur', value: event.creator_username || '—' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={styles.imageBanner}>
            <Image
              source={activityImages[event.activity_type?.toLowerCase()] || activityImages.other}
              style={styles.bannerImg}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
          {event.description ? (
            <Text style={[styles.description, { color: theme.muted }]}>{event.description}</Text>
          ) : null}
        </View>

        {/* Detail rows */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {language === 'en' ? '📋 Details' : '📋 Détails'}
          </Text>
          {detailRows.map((row, i) => (
            <View key={i} style={[styles.detailRow, { borderBottomColor: theme.border, borderBottomWidth: i < detailRows.length - 1 ? 1 : 0 }]}>
              <View style={styles.detailLeft}>
                <Feather name={row.icon as any} size={14} color="#8b5cf6" style={{ marginRight: 8 }} />
                <Text style={[styles.detailLabel, { color: theme.muted }]}>{row.label}</Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Participants */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            👥 {language === 'en' ? `Participants (${participants.length})` : `Participants (${participants.length})`}
          </Text>
          {participants.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              {language === 'en' ? 'No participants yet.' : 'Aucun participant pour le moment.'}
            </Text>
          ) : (
            participants.map((p: any, i: number) => (
              <View key={p.id} style={[styles.participantRow, { borderBottomColor: theme.border, borderBottomWidth: i < participants.length - 1 ? 1 : 0 }]}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>{p.username?.charAt(0)?.toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={[styles.participantName, { color: theme.text }]}>{p.username}</Text>
                  <Text style={[styles.participantEmail, { color: theme.muted }]}>{p.email}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.deleteBtnText}>
            {language === 'en' ? 'Delete Event' : "Supprimer l'événement"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  eventHeader: { alignItems: 'center', marginBottom: 24 },
  imageBanner: {
    width: '100%', height: 160, borderRadius: 20,
    overflow: 'hidden', marginBottom: 16,
  },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 20,
  },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  description: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  detailLeft: { flexDirection: 'row', alignItems: 'center' },
  detailLabel: { fontSize: 13, fontWeight: '500' },
  detailValue: { fontSize: 13, fontWeight: '700', maxWidth: '55%', textAlign: 'right' },
  emptyText: { fontStyle: 'italic', fontSize: 13 },
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  participantAvatar: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(139,92,246,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  participantAvatarText: { fontSize: 14, fontWeight: '800', color: '#8b5cf6' },
  participantName: { fontSize: 14, fontWeight: '700' },
  participantEmail: { fontSize: 11, marginTop: 1 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ef4444', padding: 16, borderRadius: 14,
  },
  deleteBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
