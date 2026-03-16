package com.sanchit.smart_attendance.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.Map;

public record UserLoginRequest(
        String idToken,
        String deviceFingerprint,
        Map<String, Object> deviceMetadata
) {}
