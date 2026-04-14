import React,{ useState,useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UI } from '@/constants/ui';
import { getToken } from '@/utils/secureStore';
import API_CONFIG from '@/constants/api-config';

const { width,height } = Dimensions.get('window');

type HistoryItem = {
  attendanceId?: number;
  date: string;
  status: 'Present' | 'Absent' | 'Failed' | 'Processing';
  faceScanSuccess?: boolean | null;
  attendanceDisputeStatus?: string | null;
};

type Props = {
  visible: boolean;
  subject: any | null;
  onClose: () => void;
};

export default function SubjectHistoryModal({ visible,subject,onClose }: Props) {
  const [history,setHistory] = useState<HistoryItem[]>([]);
  const [filter,setFilter] = useState<'All' | 'Present' | 'Absent' | 'Failed'>('All');
  const [loading,setLoading] = useState(false);
  const [disputeLoadingId,setDisputeLoadingId] = useState<number | null>(null);

  const fetchHistory = async () => {
    if (!subject) return;

    setLoading(true);
    try {
      const token = await getToken();

      const res = await fetch(
        `${API_CONFIG.SUBJECT_HISTORY}?subjectName=${encodeURIComponent(subject.subjectName)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res);
      if (res.ok) {
        const data = await res.json();
        setHistory(data?.data ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch subject history:',err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && subject) {
      fetchHistory();
    }
  },[visible,subject]);

  const filteredHistory = history.filter(item =>
    filter === 'All' || item.status === filter
  );

  const submitDispute = async (attendanceId?: number) => {
    if (!attendanceId) return;
    setDisputeLoadingId(attendanceId);
    try {
      const token = await getToken();
      const res = await fetch(API_CONFIG.CREATE_DISPUTE,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attendanceId,
          reason: 'Face scan mismatch marked as failed',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data?.error) {
          console.log(data.message);
          Alert.alert('Dispute Send Error',data.message);
        }
        throw new Error('Unable to submit dispute');
      }
      Alert.alert('Dispute sent','Your dispute has been submitted to the teacher for review.');
    } catch (error) {
      console.log(error);
      // Alert.alert('Request failed','Could not send dispute request. Please try again.');
    } finally {
      setDisputeLoadingId(null);
    }
  };

  if (!subject || !visible) return null;
  console.log(filteredHistory);
  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.backdrop} />

        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{subject.subjectName}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
              {(['All','Present','Absent','Failed'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterBtn,filter === f && styles.filterBtnActive]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[styles.filterText,filter === f && styles.filterTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Loading */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={UI.colors.blue600} />
              </View>
            ) : (
              <FlatList
                data={filteredHistory}
                keyExtractor={(_,i) => i.toString()}
                renderItem={({ item }) => (
                  <View style={styles.historyRow}>
                    <Text style={styles.dateText}>{item.date}</Text>
                    <TouchableOpacity
                      disabled={
                        item.status !== 'Failed' ||
                        (item.status === 'Failed' && item.attendanceDisputeStatus !== null)
                      }
                      onPress={() => {
                        if (item.status !== 'Failed' || (item.status === 'Failed' && item.attendanceDisputeStatus !== null)) return;
                        Alert.alert(
                          'Raise dispute?',
                          'This will notify your teacher to review your failed face scan.',
                          [
                            { text: 'Cancel',style: 'cancel' },
                            { text: 'Send',onPress: () => submitDispute(item.attendanceId) },
                          ]
                        );
                      }}
                    >
                      <View>
                        {/* 1. Primary Status Logic: Present or Absent */}
                        {(item.status === 'Present' || item.status === 'Absent') && (
                          <Text style={[
                            styles.statusText,
                            item.status === 'Present' ? styles.present : styles.absent
                          ]}>
                            {item.status}
                          </Text>
                        )}

                        {/* 2. Failed Status + Dispute Logic */}
                        {(item.status === 'Failed' || item.status === 'Processing') && (
                          <View>
                            <Text style={[styles.statusText,item.status == 'Failed' ? styles.failed : styles.processing]}>{item.status}</Text>

                            {item.status === 'Processing' && (
                              <Text style={[styles.statusText,{ fontSize: 11 },styles.processingSubtext]}>
                                Face Scan Pending
                              </Text>
                            )}

                            {item.attendanceDisputeStatus === 'PENDING' && (
                              <Text style={[styles.statusText,{ fontSize: 11,color: 'orange' }]}>
                                Dispute Pending
                              </Text>
                            )}

                            {item.attendanceDisputeStatus === 'REJECTED' && (
                              <Text style={[styles.statusText,{ fontSize: 11 }]}>
                                Face Dispute Rejected
                              </Text>
                            )}

                            {item.attendanceDisputeStatus === 'ACCEPTED' && (
                              <Text style={[styles.statusText,{ fontSize: 11,color: 'green' }]}>
                                Dispute Accepted
                              </Text>
                            )}
                          </View>
                        )}
                      </View>

                    </TouchableOpacity>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  modalContainer: {
    width: width * 0.92,
    maxHeight: height * 0.75,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0,height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterBtnActive: {
    backgroundColor: '#5b4bff',
  },
  filterText: {
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: 'white',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 30,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  dateText: {
    fontSize: 15.5,
    color: '#475569',

  },
  statusText: {
    fontSize: 15.5,
    fontWeight: '600',
    textAlign: 'center'
  },
  present: { color: '#16a34a' },
  absent: { color: '#ef4444' },
  failed: {
    color: '#f97316',
    // textDecorationLine: 'underline'
  },
  processing: {
    color: '#0ea5e9'
    // textDecorationLine: 'underline'
  },
  processingSubtext: {
    color: '#9ca3af', // Tailwind Gray-400
  },
});