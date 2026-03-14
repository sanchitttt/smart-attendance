package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.dto.CreateUserRequest;
import com.sanchit.smart_attendance.dto.UserLoginRequest;
import com.sanchit.smart_attendance.dto.UserLoginResponse;
import com.sanchit.smart_attendance.entity.Batch;
import com.sanchit.smart_attendance.entity.User;
import com.sanchit.smart_attendance.exception.BadRequestException;
import com.sanchit.smart_attendance.repository.BatchRepository;
import com.sanchit.smart_attendance.repository.UserRepository;
import com.sanchit.smart_attendance.security.JwtService;
import com.sanchit.smart_attendance.security.enums.Role;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.jackson.autoconfigure.JacksonProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final BatchRepository batchRepository;

    public UserLoginResponse login(UserLoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!user.getIsActive()) {
            throw new BadRequestException("User account inactive");
        }

        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        )) {
            throw new BadRequestException("Invalid credentials");
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
                user.getDeviceIdHash() // 👈 bind token to device
        );

        return new UserLoginResponse(token, "USER");
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
                .passwordHash(
                        passwordEncoder.encode(req.password())
                )
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

