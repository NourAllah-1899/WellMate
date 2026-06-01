import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function AccueilScreen({ navigation }: Props) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const features = [
    {
      icon: 'layers',
      color: Colors.brand.primary,
      bgColor: isDarkMode ? 'rgba(124, 58, 237, 0.15)' : '#ede9fe',
      title: t('landing.feature1Title', 'Générateur de repas IA'),
      desc: t('landing.feature1Desc', 'Obtenez des plans alimentaires sur-mesure générés par l\'IA Gemini. Adaptés à vos objectifs de poids et ingrédients disponibles.'),
    },
    {
      icon: 'target',
      color: Colors.brand.action,
      bgColor: isDarkMode ? 'rgba(45, 127, 249, 0.15)' : '#e0f2fe',
      title: t('landing.feature2Title', 'Objectifs de poids'),
      desc: t('landing.feature2Desc', 'Définissez vos objectifs de perte, gain ou maintien. Suivez vos pesées régulières avec des courbes de progression claires.'),
    },
    {
      icon: 'calendar',
      color: '#10b981',
      bgColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
      title: t('landing.feature3Title', 'Événements & Communauté'),
      desc: t('landing.feature3Desc', 'Participez à des séances de running, de yoga ou de cyclisme collectives en Tunisie. Rencontrez des passionnés de fitness.'),
    },
    {
      icon: 'droplet',
      color: '#0ea5e9',
      bgColor: isDarkMode ? 'rgba(14, 165, 233, 0.15)' : '#f0f9ff',
      title: t('landing.feature4Title', 'Hydratation connectée'),
      desc: t('landing.feature4Desc', 'Suivez votre consommation d\'eau quotidienne et restez hydraté grâce à notre interface interactive et nos rappels.'),
    },
    {
      icon: 'activity',
      color: '#ef4444',
      bgColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
      title: t('landing.feature5Title', 'Suivi anti-tabac'),
      desc: t('landing.feature5Desc', 'Prenez soin de votre corps en mesurant votre réduction de cigarettes et en visualisant l\'argent économisé au fil du temps.'),
    },
    {
      icon: 'award',
      color: '#f59e0b',
      bgColor: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
      title: t('landing.feature6Title', 'Récompenses & Badges'),
      desc: t('landing.feature6Desc', 'Maintenez une régularité parfaite (streaks) et débloquez des badges exclusifs en complétant vos tâches quotidiennes.'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Action Toggles */}
      <View style={styles.topRightActions}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity 
            onPress={() => setLanguage(language === 'fr' ? 'en' : 'fr')} 
            style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0', paddingHorizontal: 12 }]}
          >
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 12 }}>{language === 'fr' ? 'EN' : 'FR'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
            <Feather name={isDarkMode ? 'moon' : 'sun'} size={20} color={isDarkMode ? '#fbbf24' : '#f59e0b'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={isDarkMode ? require('../../assets/Logo_dark.png') : require('../../assets/Logo_light.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={[styles.badge, { backgroundColor: isDarkMode ? 'rgba(124, 58, 237, 0.2)' : '#ede9fe' }]}>
            <Text style={[styles.badgeText, { color: Colors.brand.primary }]}>
              🇹🇳 {t('landing.tag', 'La communauté santé de Tunisie')}
            </Text>
          </View>

          <Text style={[styles.heroTitle, { color: theme.text }]}>
            {t('landing.title', 'Reprenez le contrôle de votre bien-être')}
          </Text>

          <Text style={[styles.heroSubtitle, { color: theme.secondaryText }]}>
            {t('landing.subtitle', "Rejoignez la première plateforme tunisienne intelligente dédiée à la santé, la nutrition et le fitness communautaire. Meal plans par l'IA et événements collectifs.")}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: Colors.brand.primary }]}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.primaryBtnText}>{t('landing.getStarted', 'Commencer gratuitement')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryBtn, { borderColor: theme.border }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.secondaryBtnText, { color: theme.text }]}>{t('landing.signIn', 'Se connecter')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature Grid */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('landing.featuresTitle', 'Tout ce dont vous avez besoin')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>
              {t('landing.featuresSubtitle', 'Découvrez les fonctionnalités de pointe développées pour transformer votre style de vie.')}
            </Text>
          </View>

          <View style={styles.featuresList}>
            {features.map((item, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                  <Feather name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureCardTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.featureCardDesc, { color: theme.secondaryText }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Call to Action Banner */}
        <View style={[styles.ctaBanner, { backgroundColor: Colors.brand.primary }]}>
          <Text style={styles.ctaTitle}>{t('landing.ctaTitle', 'Prêt à transformer votre santé ?')}</Text>
          <Text style={styles.ctaDesc}>
            {t('landing.ctaDesc', 'Inscrivez-vous dès maintenant pour générer votre premier plan de repas IA et rejoindre les événements collectifs.')}
          </Text>
          <TouchableOpacity 
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.ctaBtnText}>{t('landing.ctaButton', 'Rejoindre la communauté')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRightActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
    zIndex: 10,
  },
  themeBtn: {
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  heroContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 120,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 15,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 40,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresList: {
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureCardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  ctaBanner: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaDesc: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  ctaBtnText: {
    color: Colors.brand.primary,
    fontWeight: '900',
    fontSize: 15,
  },
});
