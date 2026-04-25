import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';
import MainTabNavigator from './MainTabNavigator';
import MealsScreen from '../screens/MealsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';

import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: 'bold' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: t('common.register') }} 
      />
      <Stack.Screen 
        name="Home" 
        component={MainTabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Meals" 
        component={MealsScreen} 
        options={{ title: t('common.meals'), headerBackTitle: t('common.cancel') }} 
      />
      <Stack.Screen 
        name="Goals" 
        component={GoalsScreen} 
        options={{ title: t('common.goals'), headerBackTitle: t('common.cancel') }} 
      />
      <Stack.Screen 
        name="Chatbot" 
        component={ChatbotScreen} 
        options={{ title: t('common.chatbot'), headerBackTitle: t('common.cancel') }} 
      />
    </Stack.Navigator>
  );
}
