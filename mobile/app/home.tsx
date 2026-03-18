'use client';

import React,{ useEffect,useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons,Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { deleteToken,deleteUserProfile,getToken } from '@/utils/secureStore';
import useUserProfile from '@/hooks/use-user-profile';
import useLocation from '@/hooks/use-location';

import AppBackground from '@/components/ui/AppBackground';
import { PrimaryButton } from '@/components/ui/Buttons';
import { UI } from '@/constants/ui';

import OverallAttendanceCard from '@/components/home/OverallAttendanceCard';
import SubjectPerformanceChart from '@/components/home/SubjectPerformanceChart';
import SubjectAttendanceCard from '@/components/home/SubjectAttendanceCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubjectHistoryModal from '@/components/home/SubjectHistoryModel';
import API_CONFIG from '@/constants/api-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

type SubjectAttendance = {
  subjectName: string;
  totalClasses: number;
  attended: number;
  percentage: number;
  status: 'excellent' | 'good' | 'average' | 'risk';
  lastMarked: string;
};

type DashboardResponse = {
  subjects: SubjectAttendance[];
};

export default function Home() {
  const router = useRouter();
  const profile = useUserProfile();

  const [subjects,setSubjects] = useState<SubjectAttendance[]>([]);
  const [selectedSubject,setSelectedSubject] = useState<SubjectAttendance | null>(null);
  const [overallPercentage,setOverallPercentage] = useState<number>(0);
  const [totalSubjects,setTotalSubjects] = useState<number>(0);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string | null>(null);

  const username = profile?.name ?? 'Student';
  const rollNumber = profile?.rollNo ?? '—';
  const programLabel = profile
    ? `${profile.program}-${profile.batchStartYear.slice(-2)}`
    : '';

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      await signOut(auth);
      await deleteToken();
      await deleteUserProfile();
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:',error);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('No token found');

      const res = await fetch(API_CONFIG.DASHBOARD,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch dashboard');

      const data: DashboardResponse = await res.json();
      const subs = data.subjects || [];

      const totalClasses = subs.reduce((sum,sub) => sum + sub.totalClasses,0);
      const totalAttended = subs.reduce((sum,sub) => sum + sub.attended,0);
      const calculatedOverall = totalClasses === 0 ? 0 : Math.round((totalAttended / totalClasses) * 100);

      setSubjects(subs);
      setOverallPercentage(calculatedOverall);
      setTotalSubjects(subs.length);

    } catch (err: any) {
      console.error('Dashboard fetch error:',err);
      if (__DEV__) {
        const mock = getMockDashboardData();
        setSubjects(mock.subjects);
        setOverallPercentage(mock.overallPercentage);
        setTotalSubjects(mock.totalSubjects);
      } else {
        setError('Unable to load dashboard. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getMockDashboardData = () => ({
    overallPercentage: 79,
    totalSubjects: 4,
    subjects: [
      { subjectName: 'Data Structures',totalClasses: 25,attended: 23,percentage: 92,status: 'excellent' as const,lastMarked: 'Today' },
      { subjectName: 'Operating Systems',totalClasses: 24,attended: 18,percentage: 75,status: 'average' as const,lastMarked: 'Yesterday' },
      { subjectName: 'Database Management',totalClasses: 26,attended: 20,percentage: 77,status: 'good' as const,lastMarked: '2 days ago' },
      { subjectName: 'Computer Networks',totalClasses: 22,attended: 14,percentage: 64,status: 'risk' as const,lastMarked: '1 week ago' },
    ],
  });

  useEffect(() => {
    fetchDashboard();
  },[]);

  if (loading) {
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
            <OverallAttendanceCard percentage={overallPercentage} />

            <SubjectPerformanceChart subjects={subjects} />

            <PrimaryButton
              title="Mark Attendance Now"
              onPress={() => router.push('/scan')}
              style={styles.actionButton}
              icon={<MaterialIcons name="qr-code-scanner" size={20} color="white" />}
            />

            {/* Subject Cards with Viewport Animation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subject-wise Attendance ({totalSubjects})</Text>

              {subjects.map((subject,index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedSubject(subject)}
                  activeOpacity={0.85}
                >
                  <SubjectAttendanceCard subject={subject} index={index} />
                </TouchableOpacity>
              ))}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>
        </View>
      </AppBackground>
      {/* Modal */}
      <SubjectHistoryModal
        visible={!!selectedSubject}
        subject={selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />
    </SafeAreaView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  safeArea: { flex: 1,backgroundColor: UI.colors.slate50 },
  page: { flex: 1,paddingHorizontal: UI.spacing.pageX,paddingTop: 15 },
  loadingContainer: { flex: 1,justifyContent: 'center',alignItems: 'center' },
  loadingText: { marginTop: 12,fontSize: 16,color: UI.colors.slate600 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26,fontWeight: '700',color: UI.colors.slate900 },
  headerSubtitle: { marginTop: 4,fontSize: 15,color: UI.colors.slate600 },
  headerSubtitleStrong: { fontWeight: '600',color: UI.colors.slate700 },
  headerMeta: { marginTop: 2,fontSize: 13,color: '#9ca3af' },

  logoutBtn: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(148,163,184,0.16)',
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  actionButton: { marginBottom: 32 },

  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: UI.colors.slate900,
    marginBottom: 12,
  },

  errorText: { color: 'red',textAlign: 'center',marginTop: 10 },
});