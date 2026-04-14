package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.dto.AttendanceScanRequest;
import com.sanchit.smart_attendance.dto.CreateDisputeRequest;
import com.sanchit.smart_attendance.dto.LiveStudentsResponse;
import com.sanchit.smart_attendance.dto.ReviewDisputeRequest;
import com.sanchit.smart_attendance.dto.SubjectHistoryDto;
import com.sanchit.smart_attendance.entity.AttendanceDispute;
import com.sanchit.smart_attendance.entity.AttendanceRecord;
import com.sanchit.smart_attendance.entity.FaceRecognitionQueue;
import com.sanchit.smart_attendance.entity.Session;
import com.sanchit.smart_attendance.entity.User;
import com.sanchit.smart_attendance.enums.DisputeStatus;
import com.sanchit.smart_attendance.enums.FaceQueueStatus;
import com.sanchit.smart_attendance.enums.SessionStatus;
import com.sanchit.smart_attendance.exception.BadRequestException;
import com.sanchit.smart_attendance.repository.AttendanceDisputeRepository;
import com.sanchit.smart_attendance.repository.AttendanceRepository;
import com.sanchit.smart_attendance.repository.FaceRecognitionQueueRepository;
import com.sanchit.smart_attendance.repository.SessionRepository;
import com.sanchit.smart_attendance.repository.UserRepository;
import com.sanchit.smart_attendance.repository.projection.AttendanceDisputeRow;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    @Value("${app.dev.admin-id}")
    private Long devAdminId;

    @Autowired
    private EnvironmentService environmentService;

    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceDisputeRepository attendanceDisputeRepository;
    private final FaceRecognitionQueueRepository faceQueueRepository;
    private final UserRepository userRepository;
    private final HmacService hmacService;
    private final FaceQueueService faceQueueService;
    private final WorkerService workerService;

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
        if (environmentService.isProduction() && now > req.expiresAt()) {
            throw new BadRequestException("QR expired");
        }

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
            Long sessionId,
            MultipartFile selfieImage
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Session not found"));

        if (selfieImage == null || selfieImage.isEmpty()) {
            throw new BadRequestException("selfieImage is required");
        }

        final byte[] selfieBytes;
        final String selfieFileName = selfieImage.getOriginalFilename();
        try {
            selfieBytes = selfieImage.getBytes();
        } catch (Exception e) {
            throw new BadRequestException("Failed to read selfie image");
        }

        Long jobId = faceQueueService.createJob(userId, session.getSessionId());

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                workerService.prepareAndProcessAsync(
                        jobId,
                        selfieBytes,
                        selfieFileName,
                        user.getRollNo(),
                        session.getSessionId()
                );
            }
        });

        return Map.of(
                "status", "FACE_VERIFICATION_QUEUED",
                "job_id", jobId
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

    public List<SubjectHistoryDto> getSubjectHistory(Long studentId, String subjectName) {
        return attendanceRepository.getSubjectHistoryByName(subjectName, studentId);
    }

    @Transactional
    public Map<String, Object> createDispute(Long userId, CreateDisputeRequest request) {
        if (request == null || request.attendanceId() == null) {
            throw new BadRequestException("attendanceId is required");
        }

        AttendanceRecord attendance = attendanceRepository.findById(request.attendanceId())
                .orElseThrow(() -> new BadRequestException("Attendance record not found"));

        if (!attendance.getUser().getUserId().equals(userId)
                || Boolean.TRUE.equals(attendance.getFaceScanSuccessful())) {
            throw new BadRequestException("Only failed attendance records can be disputed");
        }

        String submittedImagePath = faceQueueRepository
                .findTopByUserIdAndSessionIdOrderByCreatedAtDesc(
                        attendance.getUser().getUserId(),
                        attendance.getSession().getSessionId()
                )
                .map(FaceRecognitionQueue::getImagePath)
                .orElseThrow(() -> new BadRequestException("Submitted selfie not found"));

        System.out.println("Reached!!!");
        attendanceDisputeRepository.findByAttendanceRecord_AttendanceId(attendance.getAttendanceId())
                .ifPresent(d -> {
                    throw new BadRequestException("A dispute request was already sent");
                });

        AttendanceDispute dispute = attendanceDisputeRepository
                .findByAttendanceRecord_AttendanceId(attendance.getAttendanceId())
                .orElseGet(() -> AttendanceDispute.builder()
                        .attendanceRecord(attendance)
                        .build());

        dispute.setSubmittedImagePath(submittedImagePath);
        dispute.setMasterImagePath(attendance.getUser().getFaceEmbeddingPath());
        dispute.setReason(
                request.reason() == null || request.reason().isBlank()
                        ? "Face scan mismatch marked as failed"
                        : request.reason()
        );
        dispute.setStatus(DisputeStatus.PENDING);
        dispute.setTeacherComment(null);
        dispute.setReviewedAt(null);
        dispute.setReviewedBy(null);
        System.out.println("Reached2!!!");
        attendanceDisputeRepository.save(dispute);

        return Map.of(
                "message", "Dispute request submitted",
                "attendanceId", request.attendanceId()
        );
    }

    public List<Map<String, Object>> getDisputesForTimetable(Long adminId, Long timetableEntryId) {
        List<AttendanceDisputeRow> disputes = attendanceDisputeRepository
                .findAllForAdminAndTimetable(adminId, timetableEntryId);
        return mapDisputeRows(disputes);
    }

    public List<Map<String, Object>> getDisputesForAdmin(Long adminId) {
        System.out.println("AdminID " + adminId);
        List<AttendanceDisputeRow> disputes = attendanceDisputeRepository.findAllForAdmin(environmentService.isDevelopment() ? devAdminId : adminId);
        return mapDisputeRows(disputes);
    }

    private List<Map<String, Object>> mapDisputeRows(List<AttendanceDisputeRow> disputes) {
        return disputes.stream().map(dispute -> {
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("disputeId", dispute.getDisputeId());
            item.put("attendanceId", dispute.getAttendanceId());
            item.put("timetableEntryId", dispute.getTimetableEntryId());
            item.put("studentName", dispute.getStudentName());
            item.put("rollNo", dispute.getRollNo());
            item.put("subjectName", dispute.getSubjectName());
            item.put("status", dispute.getStatus());
            item.put("reason", dispute.getReason());
            item.put("teacherComment", dispute.getTeacherComment());
            item.put("createdAt", dispute.getCreatedAt());
            item.put("reviewedAt", dispute.getReviewedAt());
            Long disputeId = dispute.getDisputeId();
            item.put("submittedImageUrl", "/api/v1/attendance/disputes/" + disputeId + "/image?type=submitted");
            item.put("masterImageUrl", "/api/v1/attendance/disputes/" + disputeId + "/image?type=master");
            return item;
        }).toList();
    }

    @Transactional
    public Map<String, Object> reviewDispute(Long adminId, Long disputeId, ReviewDisputeRequest request) {
        if (request == null || request.decision() == null) {
            throw new BadRequestException("decision is required");
        }

        AttendanceDispute dispute = attendanceDisputeRepository
                .findByDisputeIdAndAttendanceRecord_Session_TimetableEntry_Admin_AdminId(disputeId, environmentService.isDevelopment() ? devAdminId : adminId)
                .orElseThrow(() -> new BadRequestException("Dispute not found"));

        String decision = request.decision().trim().toUpperCase();
        if (!Objects.equals(decision, "APPROVE") && !Objects.equals(decision, "DENY")) {
            throw new BadRequestException("decision must be APPROVE or DENY");
        }

        if (Objects.equals(decision, "APPROVE")) {
            dispute.getAttendanceRecord().setFaceScanSuccessful(true);
            attendanceRepository.save(dispute.getAttendanceRecord());
        }

        dispute.setStatus(Objects.equals(decision, "APPROVE") ? DisputeStatus.APPROVED : DisputeStatus.REJECTED);
        dispute.setTeacherComment(request.comment());
        dispute.setReviewedBy(adminId);
        dispute.setReviewedAt(java.time.LocalDateTime.now());
        attendanceDisputeRepository.save(dispute);

        return Map.of(
                "disputeId", disputeId,
                "status", Objects.equals(decision, "APPROVE") ? "APPROVED" : "DENIED"
        );
    }

    public DisputeImagePayload getDisputeImage(Long adminId, Long disputeId, String type) {
        AttendanceDispute dispute = attendanceDisputeRepository
                .findByDisputeIdAndAttendanceRecord_Session_TimetableEntry_Admin_AdminId(disputeId, environmentService.isDevelopment() ? devAdminId : adminId)
                .orElseThrow(() -> new BadRequestException("Dispute not found"));

        String imagePath = Objects.equals(type, "master")
                ? dispute.getMasterImagePath()
                : dispute.getSubmittedImagePath();

        if (imagePath == null || imagePath.isBlank()) {
            throw new BadRequestException("Image not found");
        }

        try {
            Path filePath = Paths.get(imagePath).normalize();
            if (!filePath.isAbsolute()) {
                filePath = Paths.get(System.getProperty("user.dir")).resolve(filePath);
            }
            filePath = filePath.normalize();
            byte[] bytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            if (contentType == null || contentType.isBlank()) {
                contentType = "application/octet-stream";
            }
            return new DisputeImagePayload(bytes, contentType, filePath.getFileName().toString());
        } catch (Exception e) {
            throw new BadRequestException("Failed to load image");
        }
    }

    public record DisputeImagePayload(byte[] bytes, String contentType, String fileName) {}
}

