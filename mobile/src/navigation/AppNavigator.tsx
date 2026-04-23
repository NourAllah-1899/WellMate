import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';
import MainTabNavigator from './MainTabNavigator';
import MealsScreen from '../screens/MealsScreen';
import GoalsScreen from '../screens/GoalsScreen';

import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isDarkMode } = useTheme();
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
        options={{ title: 'Create Account' }} 
      />
      <Stack.Screen 
        name="Home" 
        component={MainTabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
         name="Meals" 
         component={MealsScreen} 
         options={{ title: 'Suivi Repas', headerBackTitle: 'Retour' }} 
      />
      <Stack.Screen 
         name="Goals" 
         component={GoalsScreen} 
         options={{ title: 'Mes Objectifs', headerBackTitle: 'Retour' }} 
      />
    </Stack.Navigator>
  );
}
