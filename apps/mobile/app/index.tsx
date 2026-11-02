import { Redirect } from 'expo-router';

import { useSettings } from '@/store/settings';

/** Entry: first launch → onboarding, otherwise → home. */
export default function Index() {
  const { ready, settings } = useSettings();
  if (!ready) return null;
  return <Redirect href={settings.onboardingCompleted ? '/home' : '/onboarding'} />;
}
