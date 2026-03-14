package com.sanchit.smart_attendance.dto;

import jakarta.validation.constraints.NotNull;

public record AttendanceScanRequest(
        @NotNull Long sessionId,
        @NotNull Long issuedAt,
        @NotNull Long expiresAt,
        @NotNull String signature,
        Double latitude,
        Double longitude,
        String deviceId,
        String selfieImageBase64
) {}

