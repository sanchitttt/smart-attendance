import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import SurfaceCard from '@/components/ui/SurfaceCard';
import { UI } from '@/constants/ui';

type Props = {
  percentage: number;
};

export default function OverallAttendanceCard({ percentage }: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1400,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value }) => {
      setDisplayPercent(Math.floor(value));
    });

    return () => animatedValue.removeListener(listener);
  }, [percentage]);

  return (
    <SurfaceCard style={styles.card}>
      <Text style={styles.percentage}>{displayPercent}%</Text>
      <Text style={styles.label}>Overall Attendance</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  percentage: {
    fontSize: 32,
    fontWeight: '700',
    color: UI.colors.slate900,
  },
  label: {
    fontSize: 14,
    color: UI.colors.slate500,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    width: '100%',
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: UI.colors.blue600,
    borderRadius: 999,
  },
});