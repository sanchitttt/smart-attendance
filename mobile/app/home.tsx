'use client';

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useRouter } from 'expo-router';
import { MaterialIcons,Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getLocation } from '@/utils/location';

export default function Home() {
  const router = useRouter();

  const username = 'Sanchit';
  const rollNumber = '2210345';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:',error);
    }
  };


  useEffect(() => {
    const temp = async () => {
      const res = await getLocation();
      console.log(res);
    }

    temp();

  },[]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Gradient Header */}
      <LinearGradient
        colors={['#1976D2','#1565C0']}
        start={{ x: 0,y: 0 }}
        end={{ x: 1,y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.roll}>Roll No: {rollNumber}</Text>
          </View>

          {/* Logout Icon */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats (placeholder - ready for real data) */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon,{ backgroundColor: '#E8F5E9' }]}>
              <MaterialIcons name="people" size={28} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>142</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon,{ backgroundColor: '#E3F2FD' }]}>
              <MaterialIcons name="check-circle" size={28} color="#2196F3" />
            </View>
            <Text style={styles.statNumber}>94%</Text>
            <Text style={styles.statLabel}>Attendance Rate</Text>
          </View>
        </View>

        {/* Mark Attendance - Prominent Action Button */}
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.88}
          onPress={() => router.push('/scan')}
        >
          <MaterialIcons name="qr-code-scanner" size={32} color="white" />
          <Text style={styles.actionText}>Mark Attendance</Text>
        </TouchableOpacity>

        {/* Recent Activity / Placeholder */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          <View style={styles.recentCard}>
            <View style={styles.recentIcon}>
              <MaterialIcons name="class" size={24} color="#1976D2" />
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentTitle}>Data Structures Lab</Text>
              <Text style={styles.recentTime}>Today • 10:00 AM</Text>
            </View>
            <Text style={styles.recentStatus}>Present</Text>
          </View>

          {/* Add more recent items here */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  welcome: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  roll: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0,height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
  },
  actionButton: {
    backgroundColor: '#1976D2',
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0,height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 12,
  },
  actionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  recentSection: {
    marginBottom: 24,
  },
  recentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0,height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recentIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  recentTime: {
    fontSize: 14,
    color: '#616161',
  },
  recentStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
});