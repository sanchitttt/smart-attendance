package com.sanchit.smart_attendance.dto;

public record FaceVerificationRequest(
        Long sessionId,
        String selfieImageBase64
) {}
