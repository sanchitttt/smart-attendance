from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import cv2
import numpy as np
import os
import uuid
import logging

# Import your existing functions
from main import liveness_check, face_verification   # adjust filename if needed
# ----------------- Logging Configuration -----------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),  # Logs to console
        # logging.FileHandler("api.log") # Uncomment to log to a file
    ]
)
logger = logging.getLogger(__name__)

# Import your existing functions
# from main import liveness_check, face_verification

app = FastAPI()

class VerifyRequest(BaseModel):
    reference_image_path: str
    captured_image_base64: str

@app.post("/verify-face")
def verify_face(req: VerifyRequest):
    request_id = str(uuid.uuid4())[:8] # Short ID to track this specific request
    logger.info(f"[{request_id}] Received verification request for: {req.reference_image_path}")

    try:
        # ---------------- Decode base64 image ----------------
        try:
            print(req.reference_image_path, req.captured_image_base64[50:250])
            img_data = base64.b64decode(req.captured_image_base64)
            np_arr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        except Exception as e:
            logger.error(f"[{request_id}] Failed to decode base64: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid image encoding")

        if frame is None:
            logger.warning(f"[{request_id}] Decoding resulted in None image")
            raise HTTPException(status_code=400, detail="Invalid image data")

        # ---------------- Liveness Check ----------------
        logger.info(f"[{request_id}] Starting liveness check...")
        is_real, score = liveness_check(frame)
        logger.info(f"[{request_id}] Liveness result: is_real={is_real}, score={score}")

        if not is_real:
            logger.warning(f"[{request_id}] Liveness failed (Spoof detected)")
            return {
                "success": False,
                "stage": "liveness",
                "message": "Spoof detected",
                "liveness_score": score
            }

        # ---------------- Save temp image ----------------
        temp_path = f"temp_{uuid.uuid4()}.jpg"
        cv2.imwrite(temp_path, frame)
        logger.debug(f"[{request_id}] Temporary image saved to {temp_path}")

        # ---------------- Face Verification ----------------
        logger.info(f"[{request_id}] Starting face verification...")
        if not os.path.exists(req.reference_image_path):
            logger.error(f"[{request_id}] Reference image not found: {req.reference_image_path}")
            raise FileNotFoundError("Reference image path does not exist")

        result = face_verification(req.reference_image_path, temp_path)
        verified = result.get("verified", False)
        logger.info(f"[{request_id}] Verification result: verified={verified}, similarity={result.get('similarity')}")

        # Cleanup
        # if os.path.exists(temp_path):
        #     os.remove(temp_path)
        #     logger.debug(f"[{request_id}] Cleaned up {temp_path}")

        return {
            "success": verified,
            "stage": "verification",
            "liveness_score": score,
            "similarity": result.get("similarity"),
            "verified": verified
        }

    except Exception as e:
        logger.exception(f"[{request_id}] Unexpected error occurred")
        return {
            "success": False,
            "error": str(e)
        }