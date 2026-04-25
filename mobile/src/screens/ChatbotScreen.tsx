import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

export default function ChatbotScreen() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/chatbot/message', {
        message: messageToSend
      });
      const botMessage = { role: 'bot', content: response.data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'bot',
        content: t('chatbot.error') || 'Désolé, une erreur est survenue.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <View style={styles.botAvatar}>
             <Text style={{ fontSize: 24 }}>🤖</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>{t('chatbot.title') || 'WellMate AI'}</Text>
            <Text style={[styles.headerSubtitle, { color: theme.secondaryText }]}>{t('chatbot.subtitle') || 'Assistant Santé'}</Text>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <View style={[styles.welcomeIcon, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
                <Text style={{ fontSize: 40 }}>💬</Text>
              </View>
              <Text style={[styles.welcomeTitle, { color: theme.text }]}>{t('chatbot.welcome')}</Text>
              <Text style={[styles.welcomeDesc, { color: theme.secondaryText }]}>
                {t('chatbot.description')}
              </Text>
            </View>
          )}

          {messages.map((msg, index) => (
            <View key={index} style={[styles.messageRow, msg.role === 'user' ? styles.userRow : styles.botRow]}>
              <View style={[
                styles.bubble, 
                msg.role === 'user' 
                  ? [styles.userBubble, { backgroundColor: Colors.brand.primary }] 
                  : [styles.botBubble, { backgroundColor: theme.card, borderColor: theme.border }]
              ]}>
                <Text style={[styles.messageText, { color: msg.role === 'user' ? '#fff' : theme.text }]}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={[styles.messageRow, styles.botRow]}>
              <View style={[styles.botBubble, { backgroundColor: theme.card, borderColor: theme.border, paddingVertical: 10 }]}>
                <View style={styles.loadingDots}>
                  <ActivityIndicator size="small" color={Colors.brand.primary} />
                  <Text style={[styles.thinkingText, { color: theme.muted }]}>{t('chatbot.thinking')}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder={t('chatbot.placeholder')}
            placeholderTextColor={theme.muted}
            value={input}
            onChangeText={setInput}
            multiline={false}
          />
          <TouchableOpacity 
            onPress={sendMessage} 
            disabled={loading || !input.trim()}
            style={[styles.sendButton, { backgroundColor: Colors.brand.primary, opacity: (loading || !input.trim()) ? 0.6 : 1 }]}
          >
            <Feather name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  botAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12 },
  scrollContent: { padding: 15, paddingBottom: 20 },
  welcomeContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 30 },
  welcomeIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  welcomeTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  welcomeDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  messageRow: { marginBottom: 15, flexDirection: 'row' },
  userRow: { justifyContent: 'flex-end' },
  botRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 20 },
  userBubble: { borderBottomRightRadius: 4 },
  botBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  messageText: { fontSize: 15, lineHeight: 22 },
  loadingDots: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thinkingText: { fontSize: 12 },
  inputContainer: { padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 15 },
  input: { flex: 1, borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
