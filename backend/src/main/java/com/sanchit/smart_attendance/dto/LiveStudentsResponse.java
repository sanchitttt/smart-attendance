package com.sanchit.smart_attendance.dto;

import java.time.Instant;

public record LiveStudentsResponse(
        Long userId,
        String name,
        String rollNumber
//        Instant markedAt,
//        String method,
//        Double faceScore,
//        Boolean locationVerified
) {}