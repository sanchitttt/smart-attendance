'use client';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { deleteToken, deleteUserProfile, getToken } from '@/utils/secureStore';
import useUserProfile from '@/hooks/use-user-profile';
import useLocation from '@/hooks/use-location';

import AppBackground from '@/components/ui/AppBackground';
import SurfaceCard from '@/components/ui/SurfaceCard';
import { PrimaryButton } from '@/components/ui/Buttons';
import { UI } from '@/constants/ui';

type SubjectAttendance = {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  attended: number;
  total: number;
  percentage: number;
  status: 'excellent' | 'good' | 'average' | 'risk';
  lastMarked: string;
};

type DashboardData = {
  overallPercentage: number;
  totalSubjects: number;
  subjects: SubjectAttendance[];
  recentActivity?: {
    subjectName: string;
    time: string;
    status: string;
  };
};

export default function Home() {
  const router = useRouter();
  const profile = useUserProfile();
  const { location } = useLocation(15000);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const username = profile?.name ?? 'Student';
  const rollNumber = profile?.rollNo ?? '—';
  const programLabel = profile
    ? `${profile.program}-${profile.batchStartYear.slice(-2)}`
    : '';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await deleteToken();
      await deleteUserProfile();
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Fetch Dashboard Data (Non-blocking)
  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken(); // Make sure you have getToken imported

      const res = await fetch('https://hist-bars-miniature-assurance.trycloudflare.com/api/v1/users/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch dashboard');

      const data: DashboardData = await res.json();
      setDashboard(data);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      
      // Fallback to mock data in development
      if (__DEV__) {
        console.log('Using mock data in DEV mode');
        setDashboard(getMockDashboardData());
      } else {
        setError('Unable to load dashboard. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock Data for Development
  const getMockDashboardData = (): DashboardData => ({
    overallPercentage: 79,
    totalSubjects: 6,
    recentActivity: {
      subjectName: 'Data Structures Lab',
      time: 'Today • 10:00 AM',
      status: 'Present',
    },
    subjects: [
      {
        subjectId: '1',
        subjectName: 'Data Structures',
        subjectCode: 'CS201',
        attended: 23,
        total: 25,
        percentage: 92,
        status: 'excellent',
        lastMarked: 'Today',
      },
      {
        subjectId: '2',
        subjectName: 'Operating Systems',
        subjectCode: 'CS203',
        attended: 18,
        total: 24,
        percentage: 75,
        status: 'average',
        lastMarked: 'Yesterday',
      },
      {
        subjectId: '3',
        subjectName: 'Database Management',
        subjectCode: 'CS205',
        attended: 20,
        total: 26,
        percentage: 77,
        status: 'good',
        lastMarked: '2 days ago',
      },
      {
        subjectId: '4',
        subjectName: 'Computer Networks',
        subjectCode: 'CS207',
        attended: 14,
        total: 22,
        percentage: 64,
        status: 'risk',
        lastMarked: '1 week ago',
      },
    ],
  });

  // Fetch on mount
  useEffect(() => {
    fetchDashboard();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return UI.colors.green600;
      case 'good': return UI.colors.blue600;
      case 'average': return '#f59e0b';
      case 'risk': return '#ef4444';
      default: return UI.colors.slate500;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'average': return 'Average';
      case 'risk': return 'At Risk';
      default: return '';
    }
  };

  if (loading && !dashboard) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppBackground>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={UI.colors.blue600} />
            <Text style={styles.loadingText}>Loading your attendance...</Text>
          </View>
        </AppBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <AppBackground>
        <View style={styles.page}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>My Attendance</Text>
              <Text style={styles.headerSubtitle}>
                Welcome back, <Text style={styles.headerSubtitleStrong}>{username}</Text>
              </Text>
              <Text style={styles.headerMeta}>
                {programLabel} • Roll No: {rollNumber}
              </Text>
            </View>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={22} color={UI.colors.slate700} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Overall Stats */}
            <View style={styles.statsRow}>
              <SurfaceCard style={styles.overallCard}>
                <Text style={styles.overallPercentage}>
                  {dashboard?.overallPercentage ?? 0}%
                </Text>
                <Text style={styles.overallLabel}>Overall Attendance</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${dashboard?.overallPercentage ?? 0}%` },
                    ]}
                  />
                </View>
              </SurfaceCard>
            </View>

            {/* Mark Attendance Button */}
            <PrimaryButton
              title="Mark Attendance Now"
              onPress={() => router.push('/scan')}
              style={styles.actionButton}
              icon={<MaterialIcons name="qr-code-scanner" size={20} color="white" />}
            />

            {/* Subject-wise Attendance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subject-wise Attendance</Text>

              {dashboard?.subjects.map((subject) => {
                const statusColor = getStatusColor(subject.status);
                return (
                  <SurfaceCard key={subject.subjectId} style={styles.subjectCard}>
                    <View style={styles.subjectHeader}>
                      <View>
                        <Text style={styles.subjectName}>{subject.subjectName}</Text>
                        <Text style={styles.subjectCode}>{subject.subjectCode}</Text>
                      </View>

                      <View style={styles.percentageContainer}>
                        <Text style={[styles.percentage, { color: statusColor }]}>
                          {subject.percentage}%
                        </Text>
                        <Text style={styles.attendedText}>
                          {subject.attended}/{subject.total}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.subjectFooter}>
                      <Text
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${statusColor}15`, color: statusColor },
                        ]}
                      >
                        {getStatusLabel(subject.status)}
                      </Text>
                      <Text style={styles.lastMarked}>Last: {subject.lastMarked}</Text>
                    </View>
                  </SurfaceCard>
                );
              })}
            </View>

            {/* Recent Activity */}
            {dashboard?.recentActivity && (
              <View style={styles.recentSection}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <SurfaceCard style={styles.recentCard}>
                  <View style={styles.recentIcon}>
                    <MaterialIcons name="check-circle" size={24} color={UI.colors.green600} />
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle}>{dashboard.recentActivity.subjectName}</Text>
                    <Text style={styles.recentTime}>{dashboard.recentActivity.time}</Text>
                  </View>
                  <Text style={styles.recentStatus}>{dashboard.recentActivity.status}</Text>
                </SurfaceCard>
              </View>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>
        </View>
      </AppBackground>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.colors.slate50 },
  page: { flex: 1, paddingHorizontal: UI.spacing.pageX, paddingTop: (StatusBar.currentHeight ?? 0) + 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: UI.colors.slate600 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', color: UI.colors.slate900 },
  headerSubtitle: { marginTop: 4, fontSize: 15, color: UI.colors.slate600 },
  headerSubtitleStrong: { fontWeight: '600', color: UI.colors.slate700 },
  headerMeta: { marginTop: 2, fontSize: 13, color: '#9ca3af' },

  logoutBtn: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(148,163,184,0.16)',
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  statsRow: { marginBottom: 24 },
  overallCard: { padding: 20, alignItems: 'center' },
  overallPercentage: { fontSize: 48, fontWeight: '700', color: UI.colors.slate900 },
  overallLabel: { fontSize: 14, color: UI.colors.slate500, marginVertical: 8 },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: UI.colors.blue600,
    borderRadius: 999,
  },

  actionButton: { marginBottom: 32 },

  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: UI.colors.slate900,
    marginBottom: 12,
  },

  subjectCard: { marginBottom: 12, padding: 16 },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectName: { fontSize: 16, fontWeight: '600', color: UI.colors.slate900 },
  subjectCode: { fontSize: 13, color: UI.colors.slate500, marginTop: 2 },
  percentageContainer: { alignItems: 'flex-end' },
  percentage: { fontSize: 28, fontWeight: '700' },
  attendedText: { fontSize: 13, color: UI.colors.slate500 },

  subjectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
  },
  lastMarked: { fontSize: 13, color: UI.colors.slate500 },

  recentSection: { marginBottom: 30 },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  recentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recentInfo: { flex: 1 },
  recentTitle: { fontSize: 16, fontWeight: '600', color: UI.colors.slate900 },
  recentTime: { fontSize: 13, color: UI.colors.slate500, marginTop: 2 },
  recentStatus: { fontSize: 14, fontWeight: '700', color: UI.colors.green600 },

  errorText: { color: 'red', textAlign: 'center', marginTop: 10 },
});