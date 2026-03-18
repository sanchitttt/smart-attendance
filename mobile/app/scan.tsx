import LoadingOverlay from "@/components/loading-overlay";
import PermissionFallback from "@/components/permission-fallback";
import AppBackground from "@/components/ui/AppBackground";
import { PrimaryButton,SecondaryButton } from "@/components/ui/Buttons";
import SurfaceCard from "@/components/ui/SurfaceCard";
import API_CONFIG from "@/constants/api-config";
import { UI } from "@/constants/ui";
import useLocation from "@/hooks/use-location";
import useUserProfile from "@/hooks/use-user-profile";
import { getToken } from "@/utils/secureStore";
import { Ionicons,MaterialIcons } from "@expo/vector-icons";
import { CameraView,useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React,{ useRef,useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STEPS = ["Scan QR","Take Selfie","Done"];

export default function Scan() {
  const [permission,requestPermission] = useCameraPermissions();
  const { location } = useLocation(10000);
  const profile = useUserProfile();
  const [step,setStep] = useState(1);
  const [scanned,setScanned] = useState(false);
  const [retryCount,setRetryCount] = useState(0);
  const [cameraReady,setCameraReady] = useState(false);
  const [loading,setLoading] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const router = useRouter();

  // Get student info from profile
  const studentName = profile?.name || "Student";
  const rollNo = profile?.rollNo || "—";

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <PermissionFallback
        permission={permission}
        requestPermission={requestPermission}
      />
    );
  }

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const parsed = JSON.parse(data);
      sessionIdRef.current = parsed.sessionId;
      await submitScan(parsed);
      setStep(2);
      setCameraReady(false);
      setTimeout(() => setCameraReady(true),400);
    } catch (err) {
      console.error("Initial scan failed:",err);
      if (retryCount < 3 && !location) {
        setTimeout(() => {
          setRetryCount((c) => c + 1);
          handleScan({ data });
        },2000 * (retryCount + 1));
      }
    }
  };

  const submitScan = async (parsed: any) => {
    const payload = {
      sessionId: parsed.sessionId,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt,
      signature: parsed.signature,
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
    };
    setLoading(true);
    const token = await getToken();
    const res = await fetch(
      "https://hearings-asian-stations-seriously.trycloudflare.com/api/v1/attendance/scan-qr",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Scan failed");
    }
    setLoading(false);
  };

  const finishSelfie = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75,
        base64: true,
        skipProcessing: true,
      });
      setLoading(true);
      const res = await fetch(API_CONFIG.FACE_VERIFY,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          selfieImageBase64: photo.base64,
        }),
      });
      setLoading(false);
      setStep(3);
    } catch (err) {
      console.error("Camera error:",err);
    }
  };

  const retakeSelfie = () => {
    setCameraReady(false);
    setTimeout(() => {
      setStep(2);
      setCameraReady(true);
    },200);
  };

  // ─── Stepper ──────────────────────────────────────────────────────────────
  const Stepper = () => (
    <View style={styles.stepperRow}>
      {STEPS.map((label,i) => {
        const index = i + 1;
        const isCompleted = step > index || (index === 3 && step === 3);
        const isActive = step === index;
        console.log(label,isCompleted,isActive);

        return (
          <React.Fragment key={index}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted ? styles.stepCircleCompleted : isActive && styles.stepCircleActive
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color={UI.colors.green600} />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isActive && styles.stepNumberActive,
                    ]}
                  >
                    {index}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isCompleted && styles.stepLabelCompleted,
                ]}
              >
                {label}
              </Text>
            </View>

            {index !== 3 && (
              <View
                style={[
                  styles.stepLine,
                  (isCompleted || step > index) && styles.stepLineActive,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // ─── Step 3: Success ──────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <AppBackground>
          <View style={styles.page}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Mark Attendance</Text>
            </View>

            {/* Stepper */}
            <SurfaceCard style={styles.stepperCard}>
              <Stepper />
            </SurfaceCard>

            {/* Success body */}
            <View style={styles.successBody}>
              <View style={styles.successIconWrap}>
                <MaterialIcons name="check-circle" size={64} color={UI.colors.green600} />
              </View>

              <Text style={styles.successTitle}>Attendance Marked!</Text>
              <Text style={styles.successSubtitle}>
                Your attendance has been successfully recorded.
              </Text>

              <SurfaceCard style={styles.successCard}>
                <View style={styles.successRow}>
                  <Text style={styles.successKey}>Student Name</Text>
                  <Text style={styles.successVal}>{studentName}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successKey}>Roll Number</Text>
                  <Text style={styles.successVal}>{rollNo}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successKey}>Date & Time</Text>
                  <Text style={styles.successVal}>
                    {new Date().toLocaleDateString('en-IN',{
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{" "}
                    • {new Date().toLocaleTimeString('en-IN',{ hour: '2-digit',minute: '2-digit' })}
                  </Text>
                </View>
              </SurfaceCard>

              <PrimaryButton
                title="Go to Home"
                onPress={() => router.replace("/home")}
                style={styles.actionBtn}
                icon={<Ionicons name="home-outline" size={18} color="white" />}
              />
              <SecondaryButton
                title="Retake Selfie"
                onPress={retakeSelfie}
                style={styles.actionBtn}
              />
            </View>
          </View>
        </AppBackground>
      </SafeAreaView>
    );
  }

  // ─── Step 1 & 2: Camera views ─────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1,backgroundColor: UI.colors.slate900 }}>
      {/* Header */}
      <View style={styles.darkHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.darkHeaderTitle}>Mark Attendance</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Stepper */}
      <View style={styles.darkStepperWrap}>
        <Stepper />
      </View>

      {/* STEP 1 — Scan QR */}
      {step === 1 && (
        <View style={{ flex: 1 }}>
          <CameraView
            key="qr-camera"
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleScan}
          />

          {/* Scan frame overlay */}
          <View style={styles.frameOverlay} pointerEvents="none">
            <View style={styles.scanFrame}>
              <View style={[styles.corner,styles.topLeft]} />
              <View style={[styles.corner,styles.topRight]} />
              <View style={[styles.corner,styles.bottomLeft]} />
              <View style={[styles.corner,styles.bottomRight]} />
            </View>
            <Text style={styles.scanHint}>Align QR code within the frame</Text>
          </View>

          {/* Bottom card */}
          <View style={styles.bottomCard}>
            <Text style={styles.cardTitle}>Scan QR Code</Text>
            <Text style={styles.cardSubtitle}>
              Point your camera at the QR code displayed on the classroom screen
            </Text>

            {/* {__DEV__ && (
              <PrimaryButton
                title="Simulate QR Scan (Demo)"
                onPress={() => {
                  setStep(2);
                  setTimeout(() => setCameraReady(true),200);
                }}
                style={{ marginTop: 20 }}
                icon={<MaterialIcons name="qr-code-scanner" size={18} color="white" />}
              />
            )} */}
          </View>
        </View>
      )}

      {/* STEP 2 — Selfie */}
      {step === 2 && (
        <View style={{ flex: 1 }}>
          {!cameraReady ? (
            <View style={styles.cameraLoading}>
              <ActivityIndicator size="large" color={UI.colors.indigo600} />
              <Text style={styles.cameraLoadingText}>Opening camera…</Text>
            </View>
          ) : (
            <CameraView
              key={`selfie-${cameraReady}`}
              ref={cameraRef}
              style={{ flex: 1 }}
              facing="front"
            />
          )}

          {/* Oval face guide */}
          <View style={styles.faceGuide} pointerEvents="none">
            <View style={styles.faceOval} />
            <Text style={styles.faceHint}>Centre your face in the oval</Text>
          </View>

          {/* Bottom card */}
          <View style={styles.bottomCard}>
            <Text style={styles.cardTitle}>Take Your Selfie</Text>
            <Text style={styles.cardSubtitle}>
              Make sure your face is clearly visible and well-lit
            </Text>
            <PrimaryButton
              title="Capture & Continue"
              onPress={finishSelfie}
              style={{ marginTop: 20 }}
              icon={<Ionicons name="camera-outline" size={18} color="white" />}
            />
          </View>
        </View>
      )}

      {loading && <LoadingOverlay visible={loading} />}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1,backgroundColor: UI.colors.slate50 },
  page: {
    flex: 1,
    paddingHorizontal: UI.spacing.pageX,
    paddingTop: (StatusBar.currentHeight ?? 0) + 16,
  },

  // ── Light header (success screen) ──
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: UI.colors.slate900,
  },

  // ── Dark header (camera screens) ──
  darkHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: UI.colors.slate900,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  darkHeaderTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Stepper ──
  stepperCard: { marginBottom: 24,padding: 16 },

  darkStepperWrap: {
    backgroundColor: UI.colors.slate900,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: { alignItems: "center" },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(148,163,184,0.3)",
  },
  stepCircleActive: {
    backgroundColor: UI.colors.indigo600,
    borderColor: UI.colors.indigo600,
  },
  stepCircleCompleted: {
    backgroundColor: "#ecfdf5",
    borderColor: UI.colors.green600,
  },
  stepNumber: { fontSize: 13,fontWeight: "700",color: UI.colors.slate500 },
  stepNumberActive: { color: "white" },
  stepLabel: { fontSize: 11,color: UI.colors.slate500,marginTop: 5 },
  stepLabelActive: { color: "white",fontWeight: "600" },
  stepLabelCompleted: { color: UI.colors.green600,fontWeight: "600" },
  stepLine: {
    width: 48,
    height: 2,
    backgroundColor: "rgba(148,163,184,0.25)",
    marginHorizontal: 6,
    marginBottom: 18, // offset for label below circle
  },
  stepLineActive: { backgroundColor: UI.colors.green600 },

  // ── Camera overlays ──
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    marginTop: "-12.5%",
    alignItems: "center",
  },
  scanFrame: { width: 240,height: 240 },
  corner: {
    position: "absolute",
    width: 36,
    height: 36,
    borderColor: UI.colors.indigo600,
  },
  topLeft: { top: 0,left: 0,borderTopWidth: 4,borderLeftWidth: 4,borderTopLeftRadius: 4 },
  topRight: { top: 0,right: 0,borderTopWidth: 4,borderRightWidth: 4,borderTopRightRadius: 4 },
  bottomLeft: { bottom: 0,left: 0,borderBottomWidth: 4,borderLeftWidth: 4,borderBottomLeftRadius: 4 },
  bottomRight: { bottom: 0,right: 0,borderBottomWidth: 4,borderRightWidth: 4,borderBottomRightRadius: 4 },
  scanHint: {
    marginTop: 24,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "500",
  },

  faceGuide: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    bottom: 200, // keep above bottom card
  },
  faceOval: {
    width: 200,
    height: 260,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: UI.colors.indigo600,
    borderStyle: "dashed",
  },
  faceHint: {
    marginTop: 16,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "500",
  },

  cameraLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: UI.colors.slate900,
    gap: 12,
  },
  cameraLoadingText: { color: UI.colors.slate400,fontSize: 15 },

  // ── Bottom card (camera screens) ──
  bottomCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    paddingHorizontal: UI.spacing.pageX,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0,height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: UI.colors.slate900,
    textAlign: "center",
  },
  cardSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: UI.colors.slate500,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Success screen ──
  successBody: { flex: 1,justifyContent: "center" },
  successIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: UI.colors.slate900,
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: UI.colors.slate500,
    textAlign: "center",
    marginBottom: 24,
  },
  successCard: { padding: 20,marginBottom: 28 },
  successRow: { flexDirection: "row",justifyContent: "space-between" },
  successKey: { fontSize: 14,color: UI.colors.slate500 },
  successVal: { fontSize: 14,fontWeight: "600",color: UI.colors.slate900 },
  actionBtn: { marginBottom: 12 },
});