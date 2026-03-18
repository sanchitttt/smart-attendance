import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import useAuth from '@/hooks/use-auth';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoogleSignInButton from '@/components/login/google-sign-in-btn';
import AppBackground from '@/components/ui/AppBackground';
import SurfaceCard from '@/components/ui/SurfaceCard';
import { UI } from '@/constants/ui';

export default function LoginScreen() {
  const auth = useAuth();

  if (auth.user) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <AppBackground>
        <View style={styles.container}>
          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoWrapper}>
              <View style={styles.logoGlow} />
              <View style={styles.logo}>
                <Image
                  source={require('@/assets/images/nit-logo.png')}
                  style={styles.nitLogo}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text style={styles.title}>Smart Attendance</Text>
            <Text style={styles.subtitle}>
              Secure classroom attendance with QR codes
            </Text>
          </View>

          {/* <SurfaceCard style={styles.card}> */}
          {/* <Text style={styles.cardTitle}>Sign in</Text> */}
          {/* <Text style={styles.cardHint}>Use your college Google account to continue</Text> */}
          {/* <View style={{ height: 18 }} /> */}
          <GoogleSignInButton />
          {/* </SurfaceCard> */}

          <Text style={styles.footer}>Only college email accounts supported</Text>
        </View>
      </AppBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: UI.spacing.pageX,
  },
  brand: {
    alignItems: "center",
    marginBottom: 18,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(79,70,229,0.10)",
    top: -16,
    left: -16,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.9)",
  },
  logoText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: UI.colors.slate900,
    letterSpacing: -0.8,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: UI.colors.slate600,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 14,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: UI.colors.slate900,
    letterSpacing: -0.2,
    textAlign: 'center'
  },
  cardHint: {
    marginTop: 6,
    fontSize: 14,
    color: UI.colors.slate600,
    lineHeight: 20,
    textAlign: 'center'
  },

  footer: {
    marginTop: 30,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  nitLogo: {
    width: 120,
    height: 120,
  },
});