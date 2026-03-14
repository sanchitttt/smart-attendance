package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.dto.AttendanceScanRequest;
import com.sanchit.smart_attendance.entity.FaceRecognitionQueue;
import com.sanchit.smart_attendance.entity.Session;
import com.sanchit.smart_attendance.entity.User;
import com.sanchit.smart_attendance.enums.FaceQueueStatus;
import com.sanchit.smart_attendance.enums.SessionStatus;
import com.sanchit.smart_attendance.exception.BadRequestException;
import com.sanchit.smart_attendance.repository.AttendanceRepository;
import com.sanchit.smart_attendance.repository.FaceRecognitionQueueRepository;
import com.sanchit.smart_attendance.repository.SessionRepository;
import com.sanchit.smart_attendance.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final FaceRecognitionQueueRepository faceQueueRepository;
    private final UserRepository userRepository;
    private final HmacService hmacService;

    @Transactional
    public Map<String, Object> processScan(
            Long userId,
            AttendanceScanRequest req
    ) {

        // 1️⃣ Verify QR signature
        String data = req.sessionId() + "|" + req.issuedAt() + "|" + req.expiresAt();
        if (!hmacService.sign(data).equals(req.signature())) {
            throw new BadRequestException("Invalid QR");
        }

        // 2️⃣ Time window check
        long now = System.currentTimeMillis();
        if (now > req.expiresAt()) {
            throw new BadRequestException("QR expired");
        }

        // 3️⃣ Load session
        Session session = sessionRepository.findById(req.sessionId())
                .orElseThrow(() -> new BadRequestException("Session not found"));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BadRequestException("Session not active");
        }

        // 4️⃣ Device binding
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        bindDeviceIfNeeded(user, req.deviceId());

        // 5️⃣ Mark attendance (idempotent)
        attendanceRepository.markPresent(
                session.getSessionId(),
                userId,
                req.latitude(),
                req.longitude()
        );

        // 6️⃣ Push face verification to queue
        faceQueueRepository.save(
                FaceRecognitionQueue.builder()
                        .user(user)
                        .session(session)
                        .imagePath(
                                saveSelfie(req.selfieImageBase64())
                        )
                        .status(FaceQueueStatus.PENDING)
                        .build()
        );

        return Map.of(
                "status", "SCAN_ACCEPTED",
                "faceVerification", "PENDING"
        );
    }

    private void bindDeviceIfNeeded(User user, String deviceId) {
        if (deviceId == null) return;

        if (user.getDeviceIdHash() == null) {
            user.setDeviceIdHash(hash(deviceId));
            user.setDeviceBoundAt(Instant.now());
        } else if (!user.getDeviceIdHash().equals(hash(deviceId))) {
            throw new BadRequestException("Device mismatch");
        }
    }

    private String hash(String raw) {
        return DigestUtils.sha256Hex(raw);
    }

    private String saveSelfie(String base64) {
        // save image to disk / s3 and return path
        return "/faces/" + UUID.randomUUID() + ".jpg";
    }
}

