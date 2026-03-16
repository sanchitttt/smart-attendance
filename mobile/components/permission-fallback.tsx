import React from 'react';
import { View,Text,StyleSheet,TouchableOpacity,ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PermissionFallbackProps {
    permission: { granted: boolean; canAskAgain?: boolean };
    requestPermission: () => void;
    isRequesting?: boolean; // optional: show loading while requesting
}

export default function PermissionFallback({
    permission,
    requestPermission,
    isRequesting = false,
}: PermissionFallbackProps) {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#fff5f5','#ffebee','#ffffff']}
                style={styles.card}
            >
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <MaterialIcons name="no-camera" size={64} color="#ef5350" />
                </View>

                {/* Title */}
                <Text style={styles.title}>Camera Access Required</Text>

                {/* Message */}
                <Text style={styles.message}>
                    {permission.canAskAgain === false
                        ? "We need camera permission to scan QR codes for attendance. You've previously denied it — please enable it in your phone settings."
                        : "Smart Attendance needs access to your camera to scan QR codes and mark attendance."}
                </Text>

                {/* Button */}
                <TouchableOpacity
                    style={[styles.button,isRequesting && styles.buttonDisabled]}
                    onPress={requestPermission}
                    disabled={isRequesting}
                    activeOpacity={0.85}
                >
                    {isRequesting ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="camera-alt" size={20} color="white" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>
                                {permission.canAskAgain === false ? 'Open Settings' : 'Grant Camera Permission'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Extra help text */}
                {permission.canAskAgain === false && (
                    <Text style={styles.helpText}>
                        Go to Settings → Apps → Smart Attendance → Permissions → Camera → Allow
                    </Text>
                )}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0,height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#c62828',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#424242',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d32f2f',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#d32f2f',
        shadowOffset: { width: 0,height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonDisabled: {
        backgroundColor: '#ef5350',
        opacity: 0.7,
    },
    buttonIcon: {
        marginRight: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    helpText: {
        fontSize: 13,
        color: '#757575',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 20,
    },
});