import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';
import MainTabNavigator from './MainTabNavigator';
import MealsScreen from '../screens/MealsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

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
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerLeftContainerStyle: { paddingLeft: 10 },
        headerRightContainerStyle: { paddingRight: 10 },
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
        options={({ navigation }) => ({ 
          title: t('common.meals'), 
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.pop()} 
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 50 }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
            >
              <Feather name="chevron-left" size={32} color={theme.text} />
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          )
        })} 
      />
      <Stack.Screen 
        name="Goals" 
        component={GoalsScreen} 
        options={({ navigation }) => ({ 
          title: t('common.goals'), 
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.pop()} 
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 50 }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
            >
              <Feather name="chevron-left" size={32} color={theme.text} />
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          )
        })} 
      />
      <Stack.Screen 
        name="Chatbot" 
        component={ChatbotScreen} 
        options={({ navigation }) => ({ 
          title: t('common.chatbot'), 
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.pop()} 
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 50 }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
            >
              <Feather name="chevron-left" size={32} color={theme.text} />
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          )
        })} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={({ navigation }) => ({ 
          title: t('editProfile.title'), 
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.pop()} 
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 50 }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
            >
              <Feather name="chevron-left" size={32} color={theme.text} />
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          )
        })} 
      />
    </Stack.Navigator>
  );
}
