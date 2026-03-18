package com.sanchit.smart_attendance.dto;

public record UserLoginResponse(
        String token,
        String role,
        String name,
        String email,
        String rollNo,
        String batchStartYear,
        String program,
        String profilePictureUrl
) {}