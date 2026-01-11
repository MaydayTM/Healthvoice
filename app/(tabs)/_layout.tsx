import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, Calendar, BarChart3, Settings } from 'lucide-react-native';
import { colors, shadows } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink[800],
        tabBarInactiveTintColor: colors.ink[300],
        tabBarStyle: {
          backgroundColor: colors.paper[100],
          borderTopWidth: 1,
          borderTopColor: colors.ink[100],
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          height: Platform.OS === 'ios' ? 88 : 72,
          ...shadows.glass,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.5,
          marginTop: 4,
          textTransform: 'uppercase',
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tijdlijn',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.activeIcon}>
              <Home
                size={22}
                color={color}
                strokeWidth={focused ? 2 : 1.5}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Kalender',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.activeIcon}>
              <Calendar
                size={22}
                color={color}
                strokeWidth={focused ? 2 : 1.5}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Inzichten',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.activeIcon}>
              <BarChart3
                size={22}
                color={color}
                strokeWidth={focused ? 2 : 1.5}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Instellingen',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.activeIcon}>
              <Settings
                size={22}
                color={color}
                strokeWidth={focused ? 2 : 1.5}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIcon: {
    backgroundColor: colors.ink[50],
    padding: 6,
    borderRadius: 8,
    marginBottom: -4,
  },
});
