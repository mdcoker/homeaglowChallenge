import { Figtree_400Regular } from '@expo-google-fonts/figtree/400Regular';
import { Figtree_600SemiBold } from '@expo-google-fonts/figtree/600SemiBold';
import { Figtree_400Regular_Italic } from '@expo-google-fonts/figtree/400Regular_Italic';
import { Figtree_600SemiBold_Italic } from '@expo-google-fonts/figtree/600SemiBold_Italic';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { SavedRate } from '~/api/rates';
import { SetRateScreen } from '~/features/set-rate/SetRateScreen';

import './global.css';

SplashScreen.preventAutoHideAsync();

// Stand-in for the signed-in applicant. Set `state` to 'CA', 'NY' or 'WA' to see the
// custom new-client rate variant.
const APPLICANT = { id: 'applicant-123', state: 'CA' };

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_400Regular_Italic,
    Figtree_600SemiBold_Italic,
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <SetRateScreen
        applicantId={APPLICANT.id}
        applicantState={APPLICANT.state}
        // Navigation is out of scope for this exercise.
        onBack={() => console.log('Back to step 1')}
        onContinue={(saved: SavedRate) => console.log('Rate saved, go to step 3', saved)}
      />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
