import { BottomNavigation, type BottomNavItem } from '@puzzle-studio/ui';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { t } from '@/i18n';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ITEMS: readonly BottomNavItem[] = [
  { key: 'home', label: t('tab.home'), icon: 'home' },
  { key: 'create', label: t('tab.create'), icon: 'create' },
  { key: 'collection', label: t('tab.collection'), icon: 'collection' },
  { key: 'awards', label: t('tab.awards'), icon: 'awards' },
];

function TabBar({ state, navigateToTab }: TabBarProps) {
  const active = state.routes[state.index]?.name ?? 'home';
  return (
    <BottomNavigation
      items={ITEMS}
      activeKey={active}
      onSelect={(name) => {
        const route = state.routes.find((r) => r.name === name);
        if (route) navigateToTab(route.key);
      }}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="collection" />
      <Tabs.Screen name="awards" />
    </Tabs>
  );
}
