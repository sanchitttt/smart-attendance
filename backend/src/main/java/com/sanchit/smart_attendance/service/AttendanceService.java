package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.dto.AttendanceScanRequest;
import com.sanchit.smart_attendance.dto.FaceVerificationRequest;
import com.sanchit.smart_attendance.dto.LiveStudentsResponse;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    @Autowired
    private EnvironmentService environmentService;

    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final FaceRecognitionQueueRepository faceQueueRepository;
    private final UserRepository userRepository;
    private final HmacService hmacService;

    private static final double CLASS_LAT = 29.944968790278523;
    private static final double CLASS_LON = 76.8159709642969;
    private static final double MAX_DISTANCE_METERS = 40;

    private double calculateDistance(
            double lat1,
            double lon1,
            double lat2,
            double lon2
    ) {
        final int EARTH_RADIUS = 6371000; // meters

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2)
                * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

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
//        if (now > req.expiresAt()) {
//            throw new BadRequestException("QR expired");
//        }

        if (!environmentService.isDevelopment()) {
            double distance = calculateDistance(
                    CLASS_LAT,
                    CLASS_LON,
                    req.latitude(),
                    req.longitude()
            );

            if (distance > MAX_DISTANCE_METERS) {
                throw new BadRequestException("You are not inside the classroom");
            }
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

        // 5️⃣ Mark attendance
        attendanceRepository.markPresent(
                session.getSessionId(),
                userId,
                req.latitude(),
                req.longitude()
        );

        return Map.of(
                "sessionId", String.valueOf(session.getSessionId()),
                "status", "SCAN_ACCEPTED",
                "nextStep", "SELFIE_REQUIRED"
        );
    }

    ;

    @Transactional
    public Map<String, Object> processFaceVerification(
            Long userId,
            FaceVerificationRequest req
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Session session = sessionRepository.findById(req.sessionId())
                .orElseThrow(() -> new BadRequestException("Session not found"));

        faceQueueRepository.save(
                FaceRecognitionQueue.builder()
                        .user(user)
                        .session(session)
                        .imagePath(
                                saveSelfie(
                                        req.selfieImageBase64(),
                                        user.getRollNo(),
                                        session.getSessionId()
                                )
                        )
                        .status(FaceQueueStatus.PENDING)
                        .build()
        );

        return Map.of(
                "status", "FACE_VERIFICATION_QUEUED"
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

    private String saveSelfie(String base64, String rollNumber, Long sessionId) {
        try {

            if (base64.contains(",")) {
                base64 = base64.split(",")[1];
            }

            base64 = base64.replaceAll("\\s", "");

            byte[] imageBytes = Base64.getDecoder().decode(base64);

            String fileName = rollNumber + "_" + "SID-" + sessionId + "_" + UUID.randomUUID() + ".jpg";

            Path uploadPath = Paths.get("uploads/faces");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);

            Files.write(filePath, imageBytes);

            return filePath.toString();

        } catch (Exception e) {
            throw new RuntimeException("Failed to save selfie", e);
        }
    }

    public List<LiveStudentsResponse> getLiveStudents(Long sessionId) {

        return attendanceRepository
                .findBySessionId(sessionId)
                .stream()
                .map(a -> new LiveStudentsResponse(
                        a.getUser().getUserId(),
                        a.getUser().getName(),
                        a.getUser().getRollNo()
                ))
                .toList();
    }
}

