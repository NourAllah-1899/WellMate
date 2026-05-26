import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminUsersScreen({ navigation }: any) {
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/admin/users', {
        params: { page: 1, limit: 100, sort: 'created_at', order: 'DESC' }
      });
      setUsers((res.data.users || []).filter((u: any) => u?.email !== 'admin@wellmate.com'));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (userId: number, username: string) => {
    Alert.alert(
      language === 'en' ? 'Delete User' : 'Supprimer l\'utilisateur',
      language === 'en' 
        ? `Are you sure you want to delete "${username}"?` 
        : `Êtes-vous sûr de vouloir supprimer "${username}" ?`,
      [
        { text: language === 'en' ? 'Cancel' : 'Annuler', style: 'cancel' },
        { 
          text: language === 'en' ? 'Delete' : 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/admin/users/${userId}`);
              fetchUsers();
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to delete user.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => navigation.navigate('AdminUserDetail', { userId: item.id })}
      activeOpacity={0.75}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.username?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.username, { color: theme.text }]}>{item.username}</Text>
          <Text style={[styles.email, { color: theme.muted }]}>{item.email}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id, item.username)}
        >
          <Feather name="trash-2" size={18} color="#ef4444" />
        </TouchableOpacity>
        <Feather name="chevron-right" size={18} color={theme.muted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <AdminHeader title={language === 'en' ? 'Users Management' : 'Gestion des Utilisateurs'} />
      {loading ? (
        <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={() => {
            setRefreshing(true);
            fetchUsers();
          }}
          refreshing={refreshing}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              {language === 'en' ? 'No users found.' : 'Aucun utilisateur trouvé.'}
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
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
  avatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(139,92,246,0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#8b5cf6' },
  username: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  email: { fontSize: 12, marginBottom: 8 },
  deleteBtn: { padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12 },
  emptyText: { textAlign: 'center', marginTop: 50, fontStyle: 'italic' }
});
