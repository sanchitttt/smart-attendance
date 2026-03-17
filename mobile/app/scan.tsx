import PermissionFallback from "@/components/permission-fallback";
import API_CONFIG from "@/constants/api-config";
import useLocation from "@/hooks/use-location";
import { getToken } from "@/utils/secureStore";
import { CameraView,useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React,{ useRef,useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Scan() {
  const [permission,requestPermission] = useCameraPermissions();
  const { location, error, loading, refetch } = useLocation(10000);
  const [step,setStep] = useState(1); // 1: QR, 2: Selfie, 3: Success
  const [scanned,setScanned] = useState(false);
  const [retryCount,setRetryCount] = useState(0);
  const [cameraReady,setCameraReady] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const router = useRouter();

  
  if (!permission) return <View />;

  if (!permission.granted) {
    return <PermissionFallback
      permission={permission}
      requestPermission={requestPermission}
    />;
  }


  const handleScan = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed = JSON.parse(data);
      sessionIdRef.current = parsed.sessionId;

      // Step 1: Try to submit immediately (without location)
      await submitScan(parsed);

      // Move to next step right away — user experience is fast
      setStep(2);
      setCameraReady(false);
      setTimeout(() => setCameraReady(true),400);
    } catch (err) {
      console.error('Initial scan failed:',err);
      // If failed because of missing location → retry later
      if (retryCount < 3 && !location) {
        setTimeout(() => {
          setRetryCount(c => c + 1);
          handleScan({ data }); // retry once location is ready
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
      latitude: location?.latitude ?? 0,    // fallback if location not ready
      longitude: location?.longitude ?? 0,
    };

    console.log(payload);
    const token = await getToken();
    const res = await fetch("https://quantity-sea-organizer-made.trycloudflare.com/api/v1/attendance/scan-qr",{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Scan failed');
    }

    console.log('Scan successful:',await res.json());
  };

  const finishSelfie = async () => {
    console.log('Called!!!');
    if (!cameraRef.current) {
      console.log("Camera not ready yet");
      return;
    }
    console.log('Called2!!!');

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: true
      });

      console.log("Photo captured:",photo);

      const base64Image = photo.base64;

      // send to backend later
      // console.log("Base64:",base64Image);

      // console.log('Body => ',{
      //   sessionId: sessionIdRef.current,
      //   selfieImageBase64: base64Image
      // });
      const res = await fetch(API_CONFIG.FACE_VERIFY,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          selfieImageBase64: base64Image
        })
      });

      console.log(res);

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

  const getCircleStyle = (index: number) => {
    if (step > index || (index == 3 && step == 3)) return styles.completedCircle;
    if (step === index) return styles.activeCircle;
    return styles.inactiveCircle;
  };

  const getTextStyle = (index: number) => {
    console.log(index);
    if (step > index) return styles.completedText;
    if (step === index) return styles.activeText;
    return styles.inactiveText;
  };

  return (
    <SafeAreaView style={{ flex: 1,backgroundColor: "#000" }}>
      {/* HEADER + STEPPER (ONLY FOR STEP 1 & 2) */}
      {step <= 3 && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mark Attendance</Text>

          <View style={styles.stepper}>
            {["Scan QR","Take Selfie","Completed"].map((label,i) => {
              const index = i + 1;

              return (
                <View key={i} style={styles.stepWrapper}>
                  <View style={styles.stepItem}>
                    <View style={[styles.circle,getCircleStyle(index)]}>
                      <Text style={styles.circleText}>
                        {step >= 3 || step > index ? "✓" : index}
                      </Text>
                    </View>

                    <Text style={[styles.stepText,getTextStyle(index)]}>
                      {label}
                    </Text>
                  </View>

                  {index !== 3 && <View style={styles.line} />}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* STEP 1 - SCAN QR */}
      {step === 1 && (
        <View style={{ flex: 1 }}>
          <CameraView
            key='qr-camera'
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleScan}
          />

          <View style={styles.frameContainer}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner,styles.topLeft]} />
              <View style={[styles.corner,styles.topRight]} />
              <View style={[styles.corner,styles.bottomLeft]} />
              <View style={[styles.corner,styles.bottomRight]} />
            </View>
          </View>

          <View style={styles.bottomCard}>
            <Text style={styles.title}>Scan QR Code</Text>
            <Text style={styles.subtitle}>
              Point your camera at the QR code displayed on the classroom screen
            </Text>

            {__DEV__ && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setStep(2);
                  setTimeout(() => setCameraReady(true),200);
                }}
              >
                <Text style={styles.buttonText}>Simulate QR Scan (Demo)</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* STEP 2 - SELFIE */}
      {step === 2 && (
        <View style={{ flex: 1 }}>
          {!cameraReady ? (
            <View style={{ flex: 1,justifyContent: "center",alignItems: "center",backgroundColor: "#000" }}>
              <Text style={{ color: "white" }}>Opening camera...</Text>
            </View>
          ) : (
            <CameraView
              key={`selfie-${cameraReady}`}
              ref={cameraRef}
              style={{ flex: 1 }}
              facing="front"
            />
          )}

          <View style={styles.bottomCard}>
            <Text style={styles.title}>Take Your Selfie</Text>
            <Text style={styles.subtitle}>
              Make sure your face is clearly visible
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={finishSelfie}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 3 - SUCCESS */}
      {step === 3 && (
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <Text style={styles.check}>✓</Text>
          </View>

          <Text style={styles.successTitle}>Attendance Marked!</Text>

          <Text style={styles.successSubtitle}>
            Your attendance has been successfully recorded
          </Text>

          <View style={styles.successCard}>
            <Text>
              Student: <Text style={styles.bold}>Alex Johnson</Text>
            </Text>
            <Text>
              Roll No: <Text style={styles.bold}>CS2021001</Text>
            </Text>
            <Text>Time: {new Date().toLocaleTimeString()}</Text>
          </View>

          <TouchableOpacity style={styles.retakeButton} onPress={retakeSelfie}>
            <Text style={styles.retakeText}>Retake Selfie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retakeButton} onPress={() => {
            router.replace("/home");
          }}>
            <Text style={styles.retakeText}>Go back to home</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1,justifyContent: "center",alignItems: "center" },

  header: {
    backgroundColor: "#5B4BFF",
    paddingVertical: 15,
    alignItems: "center",
  },

  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 35,
  },

  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  stepItem: {
    alignItems: "center",
  },

  circle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  inactiveCircle: { backgroundColor: "#ddd" },
  activeCircle: { backgroundColor: "#ffffff" },
  completedCircle: { backgroundColor: "#b9f8cf" },

  circleText: { fontWeight: "700",color: "#00c951" },

  stepText: { fontSize: 12,marginTop: 4 },

  inactiveText: { color: "#ccc" },
  activeText: { color: "#fff",fontWeight: "600" },
  completedText: { color: "#fff",fontWeight: "bold" },

  line: {
    width: 40,
    height: 2,
    backgroundColor: "#d6d6ff",
    marginHorizontal: 8,
  },

  frameContainer: {
    position: "absolute",
    top: "15%",
    width: "100%",
    alignItems: "center",
  },

  scanFrame: {
    width: 260,
    height: 260,
  },

  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#5B4BFF",
  },

  topLeft: { top: 0,left: 0,borderTopWidth: 4,borderLeftWidth: 4 },
  topRight: { top: 0,right: 0,borderTopWidth: 4,borderRightWidth: 4 },
  bottomLeft: { bottom: 0,left: 0,borderBottomWidth: 4,borderLeftWidth: 4 },
  bottomRight: { bottom: 0,right: 0,borderBottomWidth: 4,borderRightWidth: 4 },

  bottomCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },

  title: { fontSize: 20,fontWeight: "bold" },

  subtitle: {
    marginTop: 8,
    textAlign: "center",
    color: "#666",
  },

  button: {
    marginTop: 20,
    backgroundColor: "#5B4BFF",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
  },

  buttonText: { color: "white",fontWeight: "600" },

  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },

  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  check: {
    fontSize: 45,
    color: "#16a34a",
    fontWeight: "bold",
  },

  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },

  successSubtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
  },

  successCard: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 12,
    width: "100%",
  },

  bold: { fontWeight: "600" },
  retakeButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#5B4BFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

});

