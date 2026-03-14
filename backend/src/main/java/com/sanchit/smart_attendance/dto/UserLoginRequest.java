package com.sanchit.smart_attendance.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.Map;

public record UserLoginRequest(
        String email,
        String password,
        String deviceFingerprint,
        Map<String, Object> deviceMetadata
) {}
