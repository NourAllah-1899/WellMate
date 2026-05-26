import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import AdminHeader from '../../components/admin/AdminHeader';

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

export default function AdminEventsScreen({ navigation }: any) {
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await apiClient.get('/admin/events', {
        params: { page: 1, limit: 100, sort: 'created_at', order: 'DESC' },
      });
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = (eventId: number, title: string) => {
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
              fetchEvents();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete event.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => navigation.navigate('AdminEventDetail', { eventId: item.id })}
      activeOpacity={0.75}
    >
      <View style={styles.eventInfo}>
        <View style={styles.avatar}>
          <Image
            source={activityImages[item.activity_type?.toLowerCase()] || activityImages.other}
            style={styles.activityImg}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.eventSub, { color: theme.muted }]}>
            {item.activity_type} · {new Date(item.date).toLocaleDateString()}
          </Text>
          <Text style={[styles.eventSub, { color: theme.muted }]} numberOfLines={1}>
            👤 {item.organizer || item.username || '—'}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.title)}>
          <Feather name="trash-2" size={18} color="#ef4444" />
        </TouchableOpacity>
        <Feather name="chevron-right" size={18} color={theme.muted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <AdminHeader title={language === 'en' ? 'Events Management' : 'Gestion des Événements'} />
      {loading ? (
        <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={() => { setRefreshing(true); fetchEvents(); }}
          refreshing={refreshing}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              {language === 'en' ? 'No events found.' : 'Aucun événement trouvé.'}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  card: { padding: 15, borderRadius: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventInfo: { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
  avatar: { width: 52, height: 52, borderRadius: 14, overflow: 'hidden', backgroundColor: 'rgba(59,130,246,0.1)' },
  activityImg: { width: 52, height: 52, borderRadius: 14 },
  eventTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  eventSub: { fontSize: 12, marginTop: 1 },
  deleteBtn: { padding: 10, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12 },
  emptyText: { textAlign: 'center', marginTop: 50, fontStyle: 'italic' },
});
