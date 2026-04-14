package com.sanchit.smart_attendance.dto;

public record CreateDisputeRequest(
        Long attendanceId,
        String reason
) {
}
