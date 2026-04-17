import { Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { HapticTab } from '@/common/molecules/haptic-tab';
import { TAB_ROUTES } from '@/sharedModules/navigation/tab-routes';
import { IconSymbol } from '@/sharedModules/ui/atoms/icon-symbol';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.tabIconSelected,
        tabBarInactiveTintColor: themeColors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      {TAB_ROUTES.map((route) => (
        <Tabs.Screen
          key={route.name}
          name={route.name}
          options={{
            title: route.title,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name={route.icon} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
