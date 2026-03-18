'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, CheckCircle2 } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { Redirect } from 'expo-router';
import useAuth from '@/hooks/use-auth';

const { width } = Dimensions.get('window');

export default function Index() {
  const { user, loading: authLoading } = useAuth();

  const [showLoading, setShowLoading] = useState(true);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Minimum loading time (beautiful animation always shows for at least 1.6s)
  const MIN_LOADING_TIME = 1600;

  useEffect(() => {
    // Start animations immediately
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    // Force minimum loading time
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, MIN_LOADING_TIME);

    return () => clearTimeout(timer);
  }, []);

  const scanScale = scanAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.25, 1],
  });

  const scanOpacity = scanAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.1, 0.4],
  });

  // If auth has finished AND minimum loading time has passed
  if (!authLoading && !showLoading) {
    if (!user) {
        console.log('I am called!')
      return <Redirect href="/login" />;
    }
    return <Redirect href="/home" />;
  }

  // Show beautiful animated screen while loading
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#5B4BFF', '#7B6EFF', '#9B8EFF']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Animated QR Container */}
          <View style={styles.qrContainer}>
            <Animated.View
              style={[
                styles.scanRing,
                { transform: [{ scale: scanScale }], opacity: scanOpacity },
              ]}
            />

            <Animated.View
              style={[
                styles.qrCard,
                {
                  transform: [
                    {
                      translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -12],
                      }),
                    },
                  ],
                },
              ]}
            >
              <QrCode size={92} color="#5B4BFF" strokeWidth={1.6} />
            </Animated.View>

            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>

          {/* Text */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Verifying your account</Text>
            <Text style={styles.subtitle}>
              Please wait while we check your credentials
            </Text>

            {/* Animated Dots */}
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      opacity: Animated.add(
                        0.3,
                        Animated.multiply(scanAnim, i === 0 ? 0.7 : i === 1 ? 0.4 : 0.1)
                      ),
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Floating check icons */}
        {[...Array(3)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.floatingIcon,
              {
                left: 40 + i * 90,
                top: 180 + i * 40,
                opacity: Animated.multiply(scanAnim, 0.6),
                transform: [
                  {
                    translateY: Animated.multiply(floatAnim, -15 - i * 5),
                  },
                ],
              },
            ]}
          >
            <CheckCircle2 size={22} color="#22c55e" strokeWidth={3} />
          </Animated.View>
        ))}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', marginBottom: 60 },

  qrContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#a5b4fc',
  },
  qrCard: {
    width: 130,
    height: 130,
    backgroundColor: 'white',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  cornerTL: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#6366f1',
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#6366f1',
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#6366f1',
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#6366f1',
    borderBottomRightRadius: 8,
  },

  textContainer: { alignItems: 'center', marginTop: 50 },
  title: { fontSize: 24, fontWeight: '700', color: 'white', marginBottom: 8 },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    maxWidth: 260,
  },
  dotsContainer: { flexDirection: 'row', gap: 6, marginTop: 28 },
  dot: {
    width: 7,
    height: 7,
    backgroundColor: 'white',
    borderRadius: 999,
  },
  floatingIcon: { position: 'absolute' },
});