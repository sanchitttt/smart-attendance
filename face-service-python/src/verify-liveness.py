import cv2
import numpy as np

def verify_liveness(frames):
    """
    Analyzes multiple frames for screen-specific artifacts.
    frames: list of images (numpy arrays)
    """
    blur_scores = []
    
    for frame in frames:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # 1. Texture Analysis (Laplacian)
        # Digital screens often look 'grainy' or 'too sharp'/ 'too blurry'
        # compared to the natural texture of skin.
        score = cv2.Laplacian(gray, cv2.CV_64F).var()
        blur_scores.append(score)

        # 2. Frequency Analysis (FFT) - The "Screen Killer"
        # This looks for the hidden grid lines of a digital display.
        dft = np.fft.fft2(gray)
        dft_shift = np.fft.fftshift(dft)
        magnitude_spectrum = 20 * np.log(np.abs(dft_shift))
        
        # In a real screen, you'll see high-frequency 'peaks' in a grid pattern.
        # If the mean of the high-frequency area is too high, it's a screen.
        rows, cols = gray.shape
        crow, ccol = rows//2 , cols//2
        # Check the corners (high frequencies)
        high_freq_mean = (magnitude_spectrum[0:10, 0:10].mean() + 
                         magnitude_spectrum[-10:, -10:].mean()) / 2
        
        if high_freq_mean > 150: # Threshold requires tuning based on your camera
            return False, "Digital Screen Detected"

    # 3. Consistency Check
    # Real faces have slight, natural movements (micro-fluctuations).
    # Static photos or very still videos will have a variance near zero.
    if np.std(blur_scores) < 0.1:
        return False, "Static Image/Video Detected"

    return True, "Liveness Passed"