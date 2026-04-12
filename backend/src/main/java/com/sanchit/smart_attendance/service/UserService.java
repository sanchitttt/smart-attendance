package com.sanchit.smart_attendance.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.sanchit.smart_attendance.dto.*;
import com.sanchit.smart_attendance.entity.Batch;
import com.sanchit.smart_attendance.entity.Program;
import com.sanchit.smart_attendance.entity.User;
import com.sanchit.smart_attendance.exception.BadRequestException;
import com.sanchit.smart_attendance.repository.BatchRepository;
import com.sanchit.smart_attendance.repository.ProgramRepository;
import com.sanchit.smart_attendance.repository.UserRepository;
import com.sanchit.smart_attendance.security.JwtService;
import com.sanchit.smart_attendance.security.enums.Role;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final BatchRepository batchRepository;
    private final ProgramRepository programRepository;

    public String getReferencePath(Long userId) {

        return userRepository.findById(userId)
                .map(User::getFaceEmbeddingPath) // 👈 column in DB
                .filter(path -> path != null && !path.isBlank())
                .orElseThrow(() -> new RuntimeException(
                        "Reference image not found for user: " + userId
                ));
    }
    public DashboardResponse getDashboard(Long userId) {
        List<Object[]> rows = userRepository.getStudentDashboardRaw(userId);

        if (rows.isEmpty()) {
            return DashboardResponse.builder()
                    .subjects(List.of())
                    .build();
        }

        // Calculate overall percentage
        long totalSum = rows.stream()
                .mapToLong(row -> ((Number) row[1]).longValue())   // Safe conversion
                .sum();

        long attendedSum = rows.stream()
                .mapToLong(row -> ((Number) row[2]).longValue())   // Safe conversion
                .sum();

        int overallPercentage = (totalSum == 0) ? 0 :
                (int) Math.round((attendedSum * 100.0) / totalSum);

        // Map to DTOs
        List<SubjectAttendanceDto> subjects = rows.stream()
                .map(row -> SubjectAttendanceDto.builder()
                        .subjectName((String) row[0])
                        .totalClasses(((Number) row[1]).intValue())     // Safe cast
                        .attended(((Number) row[2]).intValue())         // Safe cast
                        .percentage(((Number) row[3]).intValue())       // Safe cast
                        .status((String) row[4])
                        .lastMarked((String) row[5])
                        .build())
                .toList();

        return DashboardResponse.builder()
                .subjects(subjects)
                .build();
    }

    public UserLoginResponse login(UserLoginRequest request) {

        FirebaseToken decodedToken;

        try {
            decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.idToken());
        } catch (FirebaseAuthException e) {
            System.out.println(e.getMessage());
            throw new BadRequestException("Invalid Firebase token");
        }

        String email = decodedToken.getEmail();

        if (email == null) {
            throw new BadRequestException("Email not available in Firebase token");
        }

        String name = decodedToken.getName();
        String profilePicture = decodedToken.getPicture();
        if (email == null || !email.endsWith("@nitkkr.ac.in")) {
            throw new BadRequestException("Only @nitkkr.ac.in accounts allowed");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {

            // Extract roll number from email
            String rollNo = email.split("@")[0];

            if (rollNo.length() < 3) {
                throw new BadRequestException("Invalid roll number format");
            }

            int joiningYear = 2000 + Integer.parseInt(rollNo.substring(1, 3));

            Batch batch = batchRepository.findByStartYear(joiningYear)
                    .orElseGet(() -> {

                        Batch newBatch = new Batch();
                        newBatch.setStartYear(String.valueOf(joiningYear));
                        newBatch.setEndYear(String.valueOf(joiningYear + 3)); // MCA = 3 years

                        // 🔥 TEMP: hardcode program
                        Program program = programRepository.findByProgramName("MCA")
                                .orElseGet(() -> {
                                    Program p = new Program();
                                    p.setProgramName("MCA");
                                    return programRepository.save(p);
                                });

                        newBatch.setProgram(program);

                        return batchRepository.save(newBatch);
                    });

            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setRollNo(rollNo);
            newUser.setProfilePictureUrl(profilePicture);
            newUser.setBatch(batch);
            newUser.setIsActive(true);
            newUser.setCreatedAt(LocalDateTime.now());

            return userRepository.save(newUser);
        });

        if (!user.getIsActive()) {
            throw new BadRequestException("User account inactive");
        }

        if (profilePicture != null && !profilePicture.equals(user.getProfilePictureUrl())) {
            user.setProfilePictureUrl(profilePicture);
        }

        String incomingHash = sha256(request.deviceFingerprint());
        Instant now = Instant.now();

        if (user.getDeviceIdHash() == null) {

            // First login
            user.setDeviceIdHash(incomingHash);
            user.setDeviceBoundAt(now);
            user.setDeviceMetadata(request.deviceMetadata());

        } else if (user.getDeviceIdHash().equals(incomingHash)) {

            // Same device
            user.setDeviceBoundAt(now);

        } else {

            Instant boundAt = Instant.from(user.getDeviceBoundAt());
            long daysSince = Duration.between(boundAt, now).toDays();

            if (daysSince < 7) {
                throw new BadRequestException(
                        "Account already active on another device. Try again in "
                                + (7 - daysSince) + " day(s)."
                );
            }

            // Rebind after cooldown
            user.setDeviceIdHash(incomingHash);
            user.setDeviceBoundAt(now);
            user.setDeviceMetadata(request.deviceMetadata());
        }

        userRepository.save(user);

        String token = jwtService.generateToken(
                user.getUserId(),
                Role.USER,
                user.getEmail(),
                user.getDeviceIdHash() // device-bound JWT
        );

        return new UserLoginResponse(
                token,
                "USER",
                user.getName(),
                user.getEmail(),
                user.getRollNo(),
                user.getBatch().getStartYear(),
                "MCA",
                user.getProfilePictureUrl()
        );
    }


    public static String hashDeviceId(String deviceId) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(deviceId.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash device ID");
        }
    }

    public static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Hashing failed");
        }
    }

    @Transactional
    public Map<String, Object> createUser(CreateUserRequest req) {

        if (userRepository.findByEmail(req.email()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }

        Batch batch = batchRepository.findById(req.batchId())
                .orElseThrow(() ->
                        new BadRequestException("Invalid batch"));

        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .batch(batch)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return Map.of(
                "userId", user.getUserId(),
                "email", user.getEmail(),
                "batch", batch.getProgram().getProgramName()
                        + " "
                        + batch.getStartYear()
                        + "-"
                        + batch.getEndYear()
        );
    }
}

