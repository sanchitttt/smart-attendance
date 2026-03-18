import React from 'react';
import { View,Text,StyleSheet,Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import SurfaceCard from '@/components/ui/SurfaceCard';
import { UI } from '@/constants/ui';

const screenWidth = Dimensions.get('window').width - 48;

type Subject = {
    subjectName: string;
    percentage: number;
    status: 'excellent' | 'good' | 'average' | 'risk';
};

type Props = {
    subjects: Subject[];
};

function getInitials(str: string) {
    return str
        .trim()
        .split(/\s+/)
        .map(word => word[0].toUpperCase())
        .join('');
}

export default function SubjectPerformanceChart({ subjects }: Props) {
    if (subjects.length === 0) return null;

    const barData = subjects.map((subject) => ({
        label: getInitials(subject.subjectName),
        value: subject.percentage,
        frontColor:
            subject.status === 'excellent' ? '#16a34a' :
                subject.status === 'good' ? '#3b82f6' :
                    subject.status === 'average' ? '#eab308' : '#ef4444',
    }));

    if (!barData || !barData.length) return null;
    return (
        <SurfaceCard style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Subject Performance (%)</Text>

            <BarChart
                data={barData}
                width={screenWidth}
                height={170}
                barWidth={28}
                roundedTop
                isAnimated
                maxValue={100}
                animationDuration={1400}
                yAxisLabelTexts={subjects.map(() => '')}
            />
        </SurfaceCard>
    );
}

const styles = StyleSheet.create({
    chartCard: {
        padding: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: UI.colors.slate900,
        marginBottom: 12,
    },
});