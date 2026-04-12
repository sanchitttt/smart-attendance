import os
import sys
import cv2
import numpy as np
from pathlib import Path
from pygrabber.dshow_graph import FilterGraph

# Add src to path
sys.path.append(str(Path(__file__).parent))

# Correct imports for Silent-Face-Anti-Spoofing
from anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name          # ← This was missing
from deepface import DeepFace

# --------------------- CONFIG ---------------------
ANTI_SPOOF_MODEL_DIR = "resources/anti_spoof_models"
REFERENCE_FACE = "C:/Users/Sanchit/Downloads/Real1.jpeg"

def get_camera_list():
    try:
        graph = FilterGraph()
        devices = graph.get_input_devices()
        return devices
    except:
        return []


def select_camera():
    devices = get_camera_list()
    if not devices:
        print("❌ No cameras found. Is iRuIn running?")
        return None

    print("\n📹 Available Cameras:")
    print("-" * 50)
    for i, name in enumerate(devices):
        print(f"  {i}: {name}")
    print("-" * 50)

    iruin_idx = next((i for i, n in enumerate(devices) if "iruin" in n.lower()), None)
    if iruin_idx is not None:
        choice = input(f"\nPress Enter to use iRuIn (index {iruin_idx}) or type number: ").strip()
        if choice == "":
            return iruin_idx
    else:
        choice = input(f"\nEnter camera number (0-{len(devices)-1}): ").strip()

    try:
        idx = int(choice)
        if 0 <= idx < len(devices):
            print(f"Selected → {devices[idx]}")
            return idx
    except:
        pass
    print("Using default index 0")
    return 0


def liveness_check(image):
    """Correct liveness detection using official logic from minivision-ai"""
    try:
        model_test = AntiSpoofPredict(device_id=0)
        image_cropper = CropImage()

        # Detect face bounding box
        image_bbox = model_test.get_bbox(image)
        if image_bbox is None:
            print("⚠️  No face detected!")
            return False, 0.0

        prediction = np.zeros((1, 3))   # Most models output 3 values internally

        model_count = 0
        for model_name in os.listdir(ANTI_SPOOF_MODEL_DIR):
            if not model_name.endswith('.pth'):
                continue

            model_path = os.path.join(ANTI_SPOOF_MODEL_DIR, model_name)
            h_input, w_input, model_type, scale = parse_model_name(model_name)

            param = {
                "org_img": image,
                "bbox": image_bbox,
                "scale": scale,
                "out_w": w_input,
                "out_h": h_input,
                "crop": True,
            }
            if scale is None:
                param["crop"] = False

            # Crop face patch according to model requirement
            img = image_cropper.crop(**param)

            # Predict with current model
            pred = model_test.predict(img, model_path)
            prediction += pred
            model_count += 1

        if model_count == 0:
            print("No .pth models found in anti_spoof_models folder!")
            return False, 0.0

        # Final score
        label = np.argmax(prediction)
        score = float(prediction[0][label] / model_count)   # average score

        is_real = (label == 1)   # In this repo, 1 = Real face

        print(f"Raw prediction: {prediction.flatten()}")
        return is_real, score

    except Exception as e:
        print(f"Liveness error: {e}")
        import traceback
        traceback.print_exc()
        return False, 0.0


def face_verification(ref_path, capture_path):
    try:
        result = DeepFace.verify(
            img1_path=ref_path,
            img2_path=capture_path,
            model_name="Facenet512",
            detector_backend="retinaface",
            enforce_detection=False,
            silent=True
        )
        return {
            "verified": result["verified"],
            "similarity": round(1 - result["distance"], 4)
        }
    except Exception as e:
        print(f"Verification error: {e}")
        return {"verified": False, "error": str(e)}


def main():
    print("🔒 Face Liveness + Verification System (Fixed)")
    print("=" * 65)

    cam_index = select_camera()
    if cam_index is None:
        return

    cap = cv2.VideoCapture(cam_index)
    if not cap.isOpened():
        print(f"❌ Cannot open camera index {cam_index}")
        return

    print(f"✅ Camera opened! Press 'c' to capture | 'q' to quit\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to read frame.")
            break

        display = frame.copy()
        cv2.putText(display, "Press 'c' to capture", (20, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.imshow("Live Preview - iRuIn Webcam", display)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('c'):
            print("\n📸 Capturing...")

            is_real, score = liveness_check(frame)
            status = "✅ REAL" if is_real else "❌ SPOOF"
            print(f"🧪 Liveness: {status} | Score: {score:.4f}")

            if not is_real:
                print("🚫 Spoof detected!\n")
                cv2.putText(display, "SPOOF DETECTED!", (80, 150),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.8, (0, 0, 255), 3)
                cv2.imshow("Result", display)
                cv2.waitKey(2000)
                continue

            # Face Verification
            if os.path.exists(REFERENCE_FACE):
                temp_path = "temp_capture.jpg"
                cv2.imwrite(temp_path, frame)
                result = face_verification(REFERENCE_FACE, temp_path)

                if result.get("verified"):
                    print(f"✅ ACCESS GRANTED! Similarity: {result['similarity']}")
                    text = f"VERIFIED ({result['similarity']})"
                    color = (0, 255, 0)
                else:
                    print(f"❌ Not verified.")
                    text = "ACCESS DENIED"
                    color = (0, 0, 255)

                cv2.putText(display, text, (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.3, color, 3)
                cv2.imshow("Result", display)
                cv2.waitKey(2500)

                if os.path.exists(temp_path):
                    os.remove(temp_path)
            else:
                print("✅ Liveness passed (Add reference_face.jpg for verification)")

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()