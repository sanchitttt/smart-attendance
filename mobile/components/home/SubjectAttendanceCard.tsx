import React,{ useEffect,useRef } from 'react';
import { View,Text,StyleSheet,Animated,Dimensions } from 'react-native';
import SurfaceCard from '@/components/ui/SurfaceCard';
import { UI } from '@/constants/ui';

const { width } = Dimensions.get('window');

type Props = {
    subject: {
        subjectName: string;
        totalClasses: number;
        attended: number;
        percentage: number;
        status: 'excellent' | 'good' | 'average' | 'risk';
        lastMarked: string;
    };
    index: number;
};

export default function SubjectAttendanceCard({ subject,index }: Props) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,{
                toValue: 1,
                duration: 600,
                delay: index * 80, // Staggered animation
                useNativeDriver: true,
            }),
            Animated.timing(translateY,{
                toValue: 0,
                duration: 600,
                delay: index * 80,
                useNativeDriver: true,
            }),
        ]).start();
    },[index]);

    const getStatusLabel = (status: string) => {
        switch (status) {
        case 'excellent': return 'Excellent';
        case 'good': return 'Good';
        case 'average': return 'Average';
        case 'risk': return 'At Risk';
        default: return '';
        }
    };

    const statusColor =
        subject.status === 'excellent' ? UI.colors.green600 :
            subject.status === 'good' ? UI.colors.blue600 :
                subject.status === 'average' ? '#f59e0b' : '#ef4444';

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY }],
            }}
        >
            <SurfaceCard style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.subjectName}>{subject.subjectName}</Text>
                    <View style={styles.percentageContainer}>
                        <Text style={[styles.percentage,{ color: statusColor }]}>
                            {subject.percentage}%
                        </Text>
                        <Text style={styles.attendedText}>
                            {subject.attended}/{subject.totalClasses}
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text
                        style={[
                            styles.statusBadge,
                            { backgroundColor: `${statusColor}15`,color: statusColor },
                        ]}
                    >
                        {getStatusLabel(subject.status)}
                    </Text>
                    <Text style={styles.lastMarked}>Last: {subject.lastMarked}</Text>
                </View>
            </SurfaceCard>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    subjectName: {
        fontSize: 16,
        fontWeight: '600',
        color: UI.colors.slate900,
        flex: 1,
    },
    percentageContainer: {
        alignItems: 'flex-end',
    },
    percentage: {
        fontSize: 28,
        fontWeight: '700',
    },
    attendedText: {
        fontSize: 13,
        color: UI.colors.slate500,
    },
    footer: {
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
    lastMarked: {
        fontSize: 13,
        color: UI.colors.slate500,
    },
});