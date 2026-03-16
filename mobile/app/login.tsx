import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import useAuth from '@/hooks/use-auth';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoogleSignInButton from '@/components/login/google-sign-in-btn';

export default function LoginScreen() {
  const auth = useAuth();

  if (auth.user) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#f8fafc','#f1f5f9','#e0f2fe','#dbeafe','#f8fafc']}
        start={{ x: 0.5,y: 0 }}
        end={{ x: 0.5,y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          {/* Logo with glow */}
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

          {/* Title */}
          <Text style={styles.title}>Smart Attendance</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Secure classroom attendance with QR codes
          </Text>

          {/* Google Sign In Button */}
          <GoogleSignInButton />

          {/* Footer note */}
          <Text style={styles.footer}>
            Only college email accounts supported
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 40,
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    // backgroundColor: 'rgba(99, 102, 241, 0.15)',
    top: -20,
    left: -20,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 24,
    // backgroundColor: '#4f46e5', // indigo-600
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#4f46e5',
    // shadowOffset: { width: 0,height: 10 },
    // shadowOpacity: 0.35,
    // shadowRadius: 15,
    // elevation: 12,
  },
  logoText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1e293b', // slate-900
    marginBottom: 12,
    letterSpacing: -0.8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 18,
    color: '#475569', // slate-600
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
  },

  footer: {
    marginTop: 40,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  nitLogo: {
    width: 120,
    height: 120,
  },
});