package com.sanchit.smart_attendance.dto;

import lombok.Getter;
import lombok.Setter;

public record FaceVerificationRequest(
        Long sessionId,
        String selfieImageBase64
) {}
